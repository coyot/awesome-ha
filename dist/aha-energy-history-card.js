/**
 * aha-energy-history-card.js — AHA Energy History Card
 *
 * Stacked bar chart dziennego zużycia energii (kWh).
 * Dane pobierane z HA statistics API (recorder/statistics_during_period).
 * Nie wymaga utility_meter — działa na surowych sensorach _total / _summation_delivered.
 *
 * Config:
 *   title:   (optional) tytuł karty
 *   days:    (optional) liczba dni wstecz, default 7
 *   entities: (required) lista sensorów kWh:
 *     entity:  sensor.* (state_class: total lub total_increasing)
 *     name:    etykieta
 *     color:   hex kolor
 *
 * Przykład:
 *   type: custom:aha-energy-history-card
 *   title: Historia zużycia
 *   days: 7
 *   entities:
 *     - entity: sensor.biuro_summation_delivered
 *       name: Biuro
 *       color: "#85B7EB"
 *     - entity: sensor.living_room_salon_power
 *       name: Salon
 *       color: "#97C459"
 */

const EHIST_DAYS_PL  = ['Nd','Pn','Wt','Śr','Cz','Pt','Sb'];
const EHIST_COLORS   = ['#85B7EB','#97C459','#EF9F27','#A86AC2','#FF6B6B','#4EC9B0','#FF9F0A','#64D2FF'];

const EHIST_CSS = `
  :host { display: block; width: 100%; }

  .card {
    background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.06);
    padding: 14px 14px 12px;
    box-sizing: border-box;
    font-family: -apple-system, system-ui, sans-serif;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .hdr {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .hdr-title {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.45);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding-top: 3px;
  }
  .hdr-right { text-align: right; }
  .hdr-total {
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    letter-spacing: -0.5px;
  }
  .hdr-lbl {
    font-size: 10px;
    color: rgba(255,255,255,0.32);
    margin-top: 2px;
  }

  svg { display: block; width: 100%; height: auto; }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 5px 14px;
    margin-top: 10px;
    padding: 0 2px;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .legend-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .legend-name {
    font-size: 11px;
    color: rgba(255,255,255,0.5);
  }

  .loading {
    padding: 28px 0;
    text-align: center;
    font-size: 12px;
    color: rgba(255,255,255,0.25);
    letter-spacing: 0.03em;
  }
`;

class AhaEnergyHistoryCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built    = false;
    this._stats    = null;
    this._lastFetch = 0;
    this._fetching  = false;
  }

  setConfig(cfg) {
    if (!cfg.entities?.length) throw new Error('aha-energy-history-card: wymagane "entities"');
    this._cfg = cfg;
  }

  set hass(h) {
    this._hass = h;
    if (!this._built) { this._build(); this._built = true; }
    // refetch co 30 minut
    const now = Date.now();
    if (!this._fetching && now - this._lastFetch > 30 * 60 * 1000) {
      this._fetchStats();
    }
  }

  getCardSize() { return 4; }

  /* ── DOM shell ── */
  _build() {
    const style = document.createElement('style');
    style.textContent = EHIST_CSS;
    this.shadowRoot.appendChild(style);

    this._card = document.createElement('div');
    this._card.className = 'card';
    this._card.innerHTML = `
      <div class="hdr">
        <div class="hdr-title"></div>
        <div class="hdr-right">
          <div class="hdr-total">—</div>
          <div class="hdr-lbl">suma okresu</div>
        </div>
      </div>
      <div class="loading">ładowanie historii…</div>
    `;
    this.shadowRoot.appendChild(this._card);
    this._titleEl = this._card.querySelector('.hdr-title');
    this._totalEl = this._card.querySelector('.hdr-total');
    this._bodyEl  = this._card.querySelector('.loading');
  }

  /* ── Statistics API ── */
  async _fetchStats() {
    this._fetching  = true;
    this._lastFetch = Date.now();

    const days   = this._cfg.days || 7;
    const end    = new Date();
    const start  = new Date(end);
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const ids = this._cfg.entities.map(e => typeof e === 'string' ? e : e.entity);

    try {
      const result = await this._hass.callWS({
        type:          'recorder/statistics_during_period',
        start_time:    start.toISOString(),
        end_time:      end.toISOString(),
        statistic_ids: ids,
        period:        'day',
        units:         { energy: 'kWh' },
        types:         ['change'],
      });
      this._stats = result;
    } catch (err) {
      console.error('aha-energy-history-card: stats API error', err);
      this._stats = {};
    }

    this._fetching = false;
    this._render();
  }

  /* ── Main render ── */
  _render() {
    if (!this._stats) return;
    const cfg      = this._cfg;
    const days     = cfg.days || 7;
    const title    = cfg.title || 'Historia zużycia';

    /* build entity metadata */
    const entities = cfg.entities.map((e, i) => {
      const c = typeof e === 'string' ? { entity: e } : e;
      const st = this._hass.states[c.entity];
      return {
        entity: c.entity,
        name:   c.name || st?.attributes?.friendly_name || c.entity,
        color:  c.color || EHIST_COLORS[i % EHIST_COLORS.length],
      };
    });

    /* build day array (last N days, oldest first) */
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayArr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dayArr.push({
        date:    d,
        label:   EHIST_DAYS_PL[d.getDay()],
        isToday: i === 0,
        values:  [],
      });
    }

    /* fill kWh values from stats */
    entities.forEach(ent => {
      const rows = this._stats[ent.entity] || [];
      dayArr.forEach(day => {
        const dateStr = day.date.toISOString().slice(0, 10); // YYYY-MM-DD
        const row = rows.find(r => r.start && r.start.slice(0, 10) === dateStr);
        const kWh = (row?.change != null && row.change > 0) ? row.change : 0;
        day.values.push({ entity: ent.entity, name: ent.name, color: ent.color, kWh });
      });
    });

    /* total over period */
    const periodTotal = dayArr.reduce((s, d) => s + d.values.reduce((ss, v) => ss + v.kWh, 0), 0);
    const todayTotal  = (dayArr.find(d => d.isToday)?.values || []).reduce((s, v) => s + v.kWh, 0);

    /* update header */
    this._titleEl.textContent = title;
    this._totalEl.textContent = this._fmtKwh(periodTotal);

    /* render SVG + legend */
    this._bodyEl.outerHTML; // replaced below
    const svg    = this._buildSVG(dayArr, entities);
    const legend = this._buildLegend(entities, todayTotal);

    this._card.innerHTML = `
      <div class="hdr">
        <div class="hdr-title">${title}</div>
        <div class="hdr-right">
          <div class="hdr-total">${this._fmtKwh(periodTotal)}</div>
          <div class="hdr-lbl">suma ${days} dni</div>
        </div>
      </div>
      ${svg}
      ${legend}
    `;
  }

  /* ── SVG bar chart ── */
  _buildSVG(dayArr, entities) {
    const N    = dayArr.length;
    const VW   = 400;
    const CH   = 130;     /* chart height */
    const CY   = 22;      /* chart top y (room for value labels) */
    const LX   = 32;      /* left margin for Y axis */
    const CW   = VW - LX - 6;
    const VH   = CY + CH + 28; /* total SVG height */

    const colW  = CW / N;
    const barW  = Math.max(10, Math.floor(colW * 0.58));
    const barOX = Math.floor((colW - barW) / 2);

    /* max total per day */
    const maxTotal = Math.max(
      0.1,
      ...dayArr.map(d => d.values.reduce((s, v) => s + v.kWh, 0))
    );

    /* nice Y axis */
    const yTicks = this._niceYTicks(maxTotal, 4);

    let yAxis = '', todayBg = '', stackBars = '', valueLabels = '', xLabels = '';

    /* Y axis grid + labels */
    yTicks.forEach(v => {
      const y = CY + CH - (v / maxTotal) * CH;
      yAxis += `
        <line x1="${LX}" y1="${y}" x2="${LX + CW}" y2="${y}"
              stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>
        <text x="${LX - 4}" y="${y}" text-anchor="end" dominant-baseline="middle"
              font-size="8.5" fill="rgba(255,255,255,0.22)"
              font-family="-apple-system,system-ui,sans-serif">${this._fmtKwh(v, true)}</text>
      `;
    });

    /* bars */
    dayArr.forEach((day, i) => {
      const bx = LX + i * colW + barOX;
      const total = day.values.reduce((s, v) => s + v.kWh, 0);

      /* today column background */
      if (day.isToday) {
        todayBg += `
          <rect x="${bx - 5}" y="${CY - 4}" width="${barW + 10}" height="${CH + 8}" rx="8"
                fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" stroke-width="0.5"/>
        `;
      }

      /* stacked segments, bottom-up */
      let stackY = CY + CH;
      day.values.forEach(v => {
        if (v.kWh <= 0) return;
        const bh = Math.max(2, (v.kWh / maxTotal) * CH);
        stackY -= bh;
        const rx = bh > 6 ? 3 : 1;
        stackBars += `
          <rect x="${bx}" y="${stackY}" width="${barW}" height="${bh}" rx="${rx}"
                fill="${v.color}" opacity="${day.isToday ? '1' : '0.65'}"/>
        `;
      });

      /* value label above bar */
      if (total > 0.01) {
        const labelY = CY + CH - (total / maxTotal) * CH - 5;
        valueLabels += `
          <text x="${bx + barW / 2}" y="${labelY}"
                text-anchor="middle" font-size="8.5"
                fill="${day.isToday ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.38)'}"
                font-family="-apple-system,system-ui,sans-serif"
                font-weight="${day.isToday ? '600' : '400'}">${this._fmtKwh(total, true)}</text>
        `;
      }

      /* X day label */
      const lclr = day.isToday ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.3)';
      const lw   = day.isToday ? '700' : '400';
      xLabels += `
        <text x="${bx + barW / 2}" y="${CY + CH + 14}"
              text-anchor="middle" font-size="10" fill="${lclr}" font-weight="${lw}"
              font-family="-apple-system,system-ui,sans-serif">${day.label}</text>
      `;
      if (day.isToday) {
        xLabels += `<circle cx="${bx + barW / 2}" cy="${CY + CH + 23}" r="1.8" fill="rgba(255,255,255,0.45)"/>`;
      }
    });

    /* baseline */
    const baseline = `<line x1="${LX}" y1="${CY + CH}" x2="${LX + CW}" y2="${CY + CH}"
                            stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>`;

    return `
      <svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg">
        ${yAxis}
        ${todayBg}
        ${baseline}
        ${stackBars}
        ${valueLabels}
        ${xLabels}
      </svg>
    `;
  }

  /* ── Legend ── */
  _buildLegend(entities, todayTotal) {
    const dots = entities.map(e =>
      `<div class="legend-item">
        <div class="legend-dot" style="background:${e.color}"></div>
        <div class="legend-name">${e.name}</div>
      </div>`
    ).join('');

    const todayStr = todayTotal > 0
      ? `<div class="legend-item" style="margin-left:auto">
           <div class="legend-name" style="color:rgba(255,255,255,0.55)">
             dziś: <strong style="color:#fff">${this._fmtKwh(todayTotal)}</strong>
           </div>
         </div>`
      : '';

    return `<div class="legend">${dots}${todayStr}</div>`;
  }

  /* ── Helpers ── */
  _fmtKwh(v, compact = false) {
    if (v < 0.01)  return compact ? '0' : '0 kWh';
    if (v < 1)     return compact ? (v * 1000).toFixed(0) + 'Wh' : (v * 1000).toFixed(0) + ' Wh';
    if (compact)   return v.toFixed(1);
    return v.toFixed(2) + ' kWh';
  }

  _niceYTicks(max, count) {
    const raw  = max / count;
    const mag  = Math.pow(10, Math.floor(Math.log10(raw)));
    const nice = [0.1,0.2,0.25,0.5,1,2,2.5,5,10,20,25,50,100].map(f => f * mag);
    const step = nice.find(s => s >= raw) || mag;
    const ticks = [];
    for (let v = step; v <= max * 1.05; v += step) ticks.push(parseFloat(v.toFixed(4)));
    return ticks;
  }

  static getStubConfig() {
    return {
      title: 'Historia zużycia',
      days: 7,
      entities: [
        { entity: 'sensor.biuro_summation_delivered',       name: 'Biuro',   color: '#85B7EB' },
        { entity: 'sensor.living_room_salon_summation_delivered', name: 'Salon', color: '#97C459' },
      ],
    };
  }
}

customElements.define('aha-energy-history-card', AhaEnergyHistoryCard);
if (!customElements.get('energy-history-card'))
  customElements.define('energy-history-card', class extends AhaEnergyHistoryCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-energy-history-card',
  name:        'Energy History Card',
  description: 'Dzienny stacked bar chart zużycia kWh z HA statistics API — Apple Home style.',
  preview:     true,
});
