/**
 * aha-garden-calendar-card  — Garden diary: fertilizations + rain history
 *
 * Config:
 *   title:          string   (default 'Ogród · Dziennik')
 *   fertilizations: [{date:'YYYY-MM-DD', name:'...', description:'...'}]
 *   rain_entity:    sensor entity with daily accumulating rain (e.g. sensor.stacja_pogodowa_daily_rain_piezo)
 *   rain_threshold: number   (mm, default 3)
 *   months_count:   number   (months to show, default 3)
 *
 * Registers as: aha-garden-calendar-card  (legacy: garden-calendar-card)
 */
(function () {
  'use strict';

  const MONTHS_PL = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec',
    'Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
  const DAYS_PL = ['Pn','Wt','Śr','Cz','Pt','So','Nd'];

  function pad(n) { return String(n).padStart(2, '0'); }
  function toDateStr(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  // Monday-first weekday index (0=Mon … 6=Sun)
  function dowMon(d) { return (d.getDay() + 6) % 7; }

  // ── Tooltip (light-DOM, fixed position — works across shadow DOM) ────────────
  let _tipEl = null;
  function _hideTip() {
    if (_tipEl) { _tipEl.remove(); _tipEl = null; }
  }
  function _showTip(anchorEl, html) {
    _hideTip();
    const rect = anchorEl.getBoundingClientRect();
    _tipEl = document.createElement('div');
    _tipEl.innerHTML = html;
    // ensure it doesn't go off left/right edge
    const w = 160;
    let left = rect.left + rect.width / 2;
    left = Math.max(w / 2 + 8, Math.min(window.innerWidth - w / 2 - 8, left));
    _tipEl.style.cssText = [
      'position:fixed',
      'z-index:9999',
      'pointer-events:none',
      `left:${Math.round(left)}px`,
      `top:${Math.round(rect.top - 8)}px`,
      'transform:translate(-50%,-100%)',
      'background:rgba(8,14,30,0.97)',
      'border:1px solid rgba(255,255,255,0.15)',
      'border-radius:11px',
      'padding:9px 12px',
      'font-size:11px',
      'line-height:1.55',
      'font-family:-apple-system,system-ui,sans-serif',
      'color:rgba(255,255,255,0.82)',
      'white-space:nowrap',
      'box-shadow:0 6px 20px rgba(0,0,0,0.55)',
    ].join(';');
    document.body.appendChild(_tipEl);
  }

  // ── Card ────────────────────────────────────────────────────────────────────

  class GardenCalendarCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._hass       = null;
      this._config     = {};
      this._offset     = 0;  // month window offset from default
      this._rainMap    = new Map(); // YYYY-MM-DD → mm (max daily)
      this._rainLoaded = false;
    }

    static getStubConfig() {
      return {
        title:          'Ogród · Dziennik',
        fertilizations: [
          { date: '2026-05-20', name: 'Nawóz wiosenny', description: 'Florovit Trawnik, 30g/m²' },
          { date: '2026-07-01', name: 'Nawóz letni',    description: 'N-P-K 12-6-18, 25g/m²' },
        ],
        rain_entity:    'sensor.stacja_pogodowa_daily_rain_piezo',
        rain_threshold: 3,
        months_count:   3,
      };
    }

    setConfig(config) {
      this._config = {
        title: 'Ogród · Dziennik',
        fertilizations: [],
        rain_entity: null,
        rain_threshold: 3,
        months_count: 2,
        log_slots: 50,
        show_watering: true,
        ...config,
      };
      this._rainLoaded = false; // re-fetch if config changes
    }

    set hass(hass) {
      const first = !this._hass;
      this._hass = hass;
      if (first || !this._rainLoaded) this._loadRain();
      this._render();
    }

    // ── Watering map from log_push input_text entities ────────────────────────

    _buildWateringMap() {
      const map = new Map(); // YYYY-MM-DD → liters (sum)
      if (!this._config.show_watering || !this._hass) return map;
      const slots = this._config.log_slots || 50;
      for (let i = 1; i <= slots; i++) {
        const raw = this._hass.states[`input_text.log_h${i}`]?.state ?? '';
        if (!raw || raw === 'unknown' || raw === 'unavailable' || !raw.startsWith('{')) continue;
        try {
          const e = JSON.parse(raw);
          if (e.typ !== 'nawodnienie_ogrod2' || !e.ts || typeof e.delta !== 'number') continue;
          const day = e.ts.slice(0, 10);
          map.set(day, (map.get(day) || 0) + e.delta);
        } catch (_) {}
      }
      return map;
    }

    disconnectedCallback() { _hideTip(); }

    // ── Rain history via HA REST ───────────────────────────────────────────────

    async _loadRain() {
      if (!this._config.rain_entity) { this._rainLoaded = true; return; }
      if (this._rainLoaded) return;
      this._rainLoaded = true;

      const monthsBack = (this._config.months_count || 2) + 1;
      const start = new Date();
      start.setMonth(start.getMonth() - monthsBack);
      start.setDate(1);
      // ISO without encodeURIComponent — colons in URL path are valid and HA requires them unencoded
      const startIso = start.getFullYear() + '-'
        + pad(start.getMonth() + 1) + '-'
        + pad(start.getDate()) + 'T00:00:00';

      try {
        const resp = await this._hass.callApi('GET',
          `history/period/${startIso}` +
          `?filter_entity_id=${this._config.rain_entity}` +
          `&minimal_response=true&significant_changes_only=false&no_attributes=true`
        );
        if (Array.isArray(resp) && Array.isArray(resp[0])) {
          this._processRain(resp[0]);
          this._render();
        }
      } catch (e) {
        console.warn('[garden-calendar] rain load failed:', e);
      }
    }

    _processRain(states) {
      // Sensor accumulates rain during the day, resets at midnight.
      // Strategy: max value per calendar day = daily total.
      // Exception: when value drops (midnight reset), the pre-drop value is the day's total
      // and the new day starts from 0 — so max-per-day handles this correctly.
      const byDay = new Map();
      for (const s of states) {
        const v = parseFloat(s.state);
        if (isNaN(v) || v < 0) continue;
        const dt = new Date(s.last_changed || s.last_updated);
        if (isNaN(dt.getTime())) continue;
        const key = toDateStr(dt);
        if (!byDay.has(key) || v > byDay.get(key)) byDay.set(key, v);
      }
      this._rainMap = byDay;
    }

    // Patch today's rain from live hass state (history can lag behind)
    _patchTodayRain() {
      if (!this._config.rain_entity || !this._hass) return;
      const state = this._hass.states[this._config.rain_entity];
      if (!state) return;
      const v = parseFloat(state.state);
      if (isNaN(v) || v < 0) return;
      const today = toDateStr(new Date());
      if (!this._rainMap.has(today) || v > this._rainMap.get(today)) {
        this._rainMap.set(today, v);
      }
    }

    // ── Fertilization state from localStorage ────────────────────────────────

    _doneMap() {
      // Map<actualDoneDate, [fertilization objects]>
      const m = new Map();
      try {
        for (const f of (this._config.fertilizations || [])) {
          const v = localStorage.getItem('aha-fertil-done:' + f.date);
          if (v && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
            if (!m.has(v)) m.set(v, []);
            m.get(v).push(f);
          }
        }
      } catch (_) {}
      return m;
    }

    _plannedMap() {
      // Map<scheduledDate, [fertilization objects]>
      const m = new Map();
      for (const f of (this._config.fertilizations || [])) {
        if (!m.has(f.date)) m.set(f.date, []);
        m.get(f.date).push(f);
      }
      return m;
    }

    // ── Month grid HTML ───────────────────────────────────────────────────────

    _monthHtml(year, month, doneMap, plannedMap, wateringMap) {
      const today    = toDateStr(new Date());
      const nDays    = new Date(year, month + 1, 0).getDate();
      const startDow = dowMon(new Date(year, month, 1));
      const thresh   = this._config.rain_threshold || 3;

      // Day headers
      let html = '<div class="mg">';
      for (const d of DAYS_PL) html += `<div class="dh">${d}</div>`;

      // Empty cells before day 1
      for (let i = 0; i < startDow; i++) html += '<div class="dc"></div>';

      for (let d = 1; d <= nDays; d++) {
        const ds = `${year}-${pad(month + 1)}-${pad(d)}`;
        const isToday   = ds === today;
        const doneFerts = doneMap.get(ds) || [];

        // Planned: only if NOT already done (done stored under scheduledDate)
        const planned   = (plannedMap.get(ds) || []).filter(f => {
          // check if this scheduled item was marked done (regardless of actual date)
          try { return localStorage.getItem('aha-fertil-done:' + f.date) === null; } catch (_) { return true; }
        });

        const rainMm    = this._rainMap.get(ds) || 0;
        const hasRain   = rainMm >= thresh;
        const waterM3   = wateringMap.get(ds) || 0;
        const hasWater  = waterM3 > 0;
        const hasEvent  = doneFerts.length > 0 || planned.length > 0 || hasRain || hasWater;

        // Build dots
        let dots = '';
        for (let i = 0; i < Math.min(doneFerts.length, 2); i++)
          dots += '<div class="dot dn"></div>';
        for (let i = 0; i < Math.min(planned.length, 2); i++)
          dots += '<div class="dot pl"></div>';
        if (hasRain) {
          const op = Math.min(0.95, 0.35 + (rainMm / 25) * 0.60).toFixed(2);
          dots += `<div class="dot rn" style="opacity:${op}"></div>`;
        }

        // Tooltip data (encoded in data attr, built on demand)
        const tipParts = [];
        if (doneFerts.length) tipParts.push('D:' + doneFerts.map(f => f.name + (f.description ? ' — ' + f.description : '')).join(';;'));
        if (planned.length)   tipParts.push('P:' + planned.map(f => f.name + (f.description ? ' — ' + f.description : '')).join(';;'));
        if (hasRain)          tipParts.push('R:' + rainMm.toFixed(1));
        if (hasWater)         tipParts.push('W:' + Math.round(waterM3 * 1000));

        const isPast = ds < today;
        const cls = ['dc', isToday ? 'today' : '', isPast ? 'ps' : '', hasEvent ? 'ev' : '', hasWater ? 'wt' : ''].filter(Boolean).join(' ');
        const tip = tipParts.length ? ` data-t="${tipParts.join('|').replace(/"/g, '&quot;')}"` : '';

        html += `<div class="${cls}"${tip}>`
          + `<span class="dn-num">${d}</span>`
          + `<div class="dots">${dots}</div>`
          + '</div>';
      }

      html += '</div>'; // .mg

      return `<div class="month">
        <div class="mhdr">${MONTHS_PL[month]} ${year}</div>
        ${html}
      </div>`;
    }

    // ── Tooltip HTML ─────────────────────────────────────────────────────────

    _tipHtml(encoded) {
      let html = '';
      for (const part of encoded.split('|')) {
        if (part.startsWith('D:')) {
          for (const name of part.slice(2).split(';;'))
            html += `<div class="tr"><span class="td dn"></span>${name}</div>`;
        } else if (part.startsWith('P:')) {
          for (const name of part.slice(2).split(';;'))
            html += `<div class="tr"><span class="td pl"></span>${name}</div>`;
        } else if (part.startsWith('R:')) {
          html += `<div class="tr"><span class="td rn"></span>Deszcz: ${part.slice(2)} mm</div>`;
        } else if (part.startsWith('W:')) {
          html += `<div class="tr"><span class="td wt"></span>Podlano: ${part.slice(2)} L</div>`;
        }
      }
      return html;
    }

    // ── Main render ───────────────────────────────────────────────────────────

    _render() {
      if (!this._hass) return;

      const now    = new Date();
      const count  = this._config.months_count || 2;
      const thresh = this._config.rain_threshold || 3;
      // Default window: current month is the last shown (so past is visible)
      const firstMonth = count - 1; // months before current

      this._patchTodayRain();
      const doneMap    = this._doneMap();
      const plannedMap = this._plannedMap();
      const wateringMap = this._buildWateringMap();

      let monthsHtml = '';
      for (let i = 0; i < count; i++) {
        const dt = new Date(now.getFullYear(), now.getMonth() - firstMonth + i + this._offset, 1);
        monthsHtml += this._monthHtml(dt.getFullYear(), dt.getMonth(), doneMap, plannedMap, wateringMap);
      }

      // Legend
      const hasDone    = doneMap.size > 0 || (this._config.fertilizations || []).some(f => {
        try { return localStorage.getItem('aha-fertil-done:' + f.date) !== null; } catch (_) { return false; }
      });
      const hasPlanned = (this._config.fertilizations || []).length > 0;
      const hasRain     = !!this._config.rain_entity;
      const hasWatLegend = this._config.show_watering;

      let legend = '';
      if (hasDone)      legend += `<div class="li"><div class="dot dn"></div><span>Nawożenie wykonane</span></div>`;
      if (hasPlanned)   legend += `<div class="li"><div class="dot pl"></div><span>Nawożenie planowane</span></div>`;
      if (hasRain)      legend += `<div class="li"><div class="dot rn" style="opacity:.80"></div><span>Deszcz (≥${thresh} mm)</span></div>`;
      if (hasWatLegend) legend += `<div class="li"><div class="li-wt"></div><span>Podlewanie</span></div>`;

      this.shadowRoot.innerHTML = `
        <style>${this._css()}</style>
        <div class="card">
          <div class="hdr">
            <div class="title">${this._config.title}</div>
            <div class="navs">
              <button class="nb" id="prev">&#8249;</button>
              <button class="nb" id="next">&#8250;</button>
            </div>
          </div>
          <div class="months">${monthsHtml}</div>
          ${legend ? `<div class="legend">${legend}</div>` : ''}
        </div>`;

      this.shadowRoot.getElementById('prev').addEventListener('click', () => { this._offset--; this._render(); });
      this.shadowRoot.getElementById('next').addEventListener('click', () => { this._offset++; this._render(); });

      this._bindTooltips();
    }

    _bindTooltips() {
      this.shadowRoot.querySelectorAll('.dc.ev[data-t]').forEach(cell => {
        const encoded = cell.dataset.t;
        const html    = this._tipHtml(encoded);

        cell.addEventListener('mouseenter', () => _showTip(cell, html));
        cell.addEventListener('mouseleave', _hideTip);
        cell.addEventListener('click', () => {
          if (_tipEl) _hideTip();
          else _showTip(cell, html);
        });
      });

      // Hide tip when scrolling or clicking elsewhere
      this.shadowRoot.host.addEventListener('mouseleave', _hideTip, { once: false });
    }

    // ── CSS ───────────────────────────────────────────────────────────────────

    _css() {
      return `
      :host { display: block; font-family: -apple-system, system-ui, sans-serif; }
      .card {
        background: linear-gradient(160deg, #0e1a2e 0%, #091220 100%);
        border-radius: 22px;
        border: 1px solid rgba(255,255,255,0.07);
        overflow: hidden;
      }
      /* Header */
      .hdr {
        display: flex; align-items: center; justify-content: space-between;
        padding: 13px 16px 10px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .title {
        font-size: 11px; font-weight: 600;
        color: rgba(255,255,255,0.35);
        text-transform: uppercase; letter-spacing: .08em;
      }
      .navs { display: flex; gap: 5px; }
      .nb {
        background: rgba(255,255,255,0.07); border: none;
        border-radius: 8px; width: 28px; height: 28px;
        cursor: pointer; color: rgba(255,255,255,0.50);
        font-size: 18px; line-height: 1; padding: 0;
        display: flex; align-items: center; justify-content: center;
        transition: background .12s;
      }
      .nb:active { background: rgba(255,255,255,0.15); }
      /* Months container — side by side */
      .months {
        padding: 8px 10px 4px;
        display: flex; gap: 8px; align-items: flex-start;
      }
      .month { flex: 1; min-width: 0; }
      .mhdr {
        font-size: 11px; font-weight: 600;
        color: rgba(255,255,255,0.50);
        margin-bottom: 5px; padding-left: 1px;
        letter-spacing: .01em;
      }
      /* Grid */
      .mg {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0;
      }
      .dh {
        font-size: 7.5px; font-weight: 600;
        color: rgba(255,255,255,0.20);
        text-align: center; padding-bottom: 4px;
        letter-spacing: .02em;
      }
      /* Day cell */
      .dc {
        display: flex; flex-direction: column; align-items: center;
        padding: 3px 0 2px;
        border-radius: 6px;
        min-height: 28px;
        cursor: default;
        transition: background .10s;
      }
      .dc.today {
        background: rgba(255,255,255,0.05);
        box-shadow: inset 0 0 0 1.5px rgba(255,255,255,0.40);
      }
      .dc.today .dn-num { color: #fff; font-weight: 700; }
      .dc.ps { opacity: 0.28; }
      .dc.ps.ev { opacity: 0.38; }
      .dc.ev { cursor: pointer; }
      .dc.ev:hover, .dc.ev:active { background: rgba(255,255,255,0.08); }
      .dc.wt {
        outline: 1.5px solid rgba(48,176,255,0.55);
        outline-offset: -1px;
      }
      .dn-num {
        font-size: 10px; font-weight: 500;
        color: rgba(255,255,255,0.55);
        line-height: 1;
        user-select: none;
      }
      /* Vertical divider between months */
      .month + .month {
        border-left: 1px solid rgba(255,255,255,0.06);
        padding-left: 8px;
      }
      /* Dots row */
      .dots {
        display: flex; gap: 2px; margin-top: 2px;
        flex-wrap: wrap; justify-content: center;
      }
      .dot {
        width: 4px; height: 4px; border-radius: 50%;
        flex-shrink: 0;
      }
      .dot.dn { background: #50C85A; }
      .dot.pl {
        background: transparent;
        border: 1.5px solid rgba(80,200,90,0.65);
        width: 3px; height: 3px;
      }
      .dot.rn { background: #4da8ff; }
      /* Legend watering indicator — small framed square */
      .li-wt {
        width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0;
        outline: 1.5px solid rgba(48,176,255,0.55);
        outline-offset: -1px;
      }
      /* Legend */
      .legend {
        display: flex; flex-wrap: wrap; gap: 8px;
        padding: 6px 12px 12px;
        border-top: 1px solid rgba(255,255,255,0.05);
      }
      .li { display: flex; align-items: center; gap: 4px; }
      .li span { font-size: 9.5px; color: rgba(255,255,255,0.25); }
      /* Tooltip (light DOM, styled inline) */
      .tr { display: flex; align-items: center; gap: 6px; }
      .td { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
      .td.dn { background: #50C85A; }
      .td.pl { background: transparent; border: 1.5px solid rgba(80,200,90,0.80); width: 5px; height: 5px; }
      .td.rn { background: #4da8ff; }
      .td.wt { background: transparent; outline: 1.5px solid rgba(48,176,255,0.70); outline-offset: -1px; border-radius: 2px; }
      `;
    }

    getCardSize() { return 5; }
  }

  // ── Register ───────────────────────────────────────────────────────────────

  if (!customElements.get('aha-garden-calendar-card')) {
    customElements.define('aha-garden-calendar-card', GardenCalendarCard);
  }
  if (!customElements.get('garden-calendar-card')) {
    customElements.define('garden-calendar-card', class extends GardenCalendarCard {});
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.find(c => c.type === 'aha-garden-calendar-card')) {
    window.customCards.push({
      type: 'aha-garden-calendar-card',
      name: 'AHA Garden Calendar Card',
      description: 'Garden diary: fertilization tracking + rain history, 3 months',
    });
  }
})();
