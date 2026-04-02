/**
 * waste-schedule-apple-card.js — Apple-style waste pickup schedule
 *
 * Config:
 *   type: custom:waste-schedule-apple-card
 *   title: "Wywóz śmieci"       # optional
 *   upcoming_limit: 5            # optional, default 5
 *   show_calendar: true          # optional, default false
 *   waste_types:
 *     - entity: sensor.harmonogram_bio
 *       name: Bio
 *       icon: leaf
 *       color: "#8B6F47"
 *       future_dates_sensor: sensor.bio_future  # optional
 *   future_dates_sensor: sensor.waste_future    # optional global
 *
 * Entity state formats supported:
 *   - ISO date: "2026-04-08" or "2026-04-08T00:00:00"
 *   - Integer (days until): "3" → today + 3 days
 *   - Attribute: next_date / date / next_pickup / next_collection
 */

const _C = {
  textPrimary:   '#F5F5F7',
  textSecondary: '#AEAEB2',
  textTertiary:  '#636366',
  urgent:        '#FF453A',
  soon:          '#FF9F0A',
  later:         '#FFD60A',
};

const _ICONS = {
  'trash-2':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  'leaf':     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
  'file-text':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
  'package':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  'recycle':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6l-3.09-5.35A2 2 0 0013.22 0H10.8a2 2 0 00-1.69.95L6 6"/><path d="M14 21.83A2 2 0 0015.83 20l3.59-6.23a2 2 0 00-.74-2.73"/><path d="M4.63 13.79A2 2 0 002 15.49v7.31"/><path d="M13.09 4.46L18 13.79"/><path d="M10.91 4.46L6 13.79"/></svg>`,
  'droplet':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>`,
  'glass':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8l-1 7H9z"/><path d="M9 9c0 3 3 5 3 9"/><path d="M15 9c0 3-3 5-3 9"/><line x1="7" y1="22" x2="17" y2="22"/></svg>`,
  'armchair': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9V6a2 2 0 00-2-2H7a2 2 0 00-2 2v3"/><path d="M3 11v5a2 2 0 002 2h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2z"/><path d="M5 18v2"/><path d="M19 18v2"/></svg>`,
};

// Mon-indexed (index 0 = Monday, 6 = Sunday)
const _DAY_LETTERS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

class WasteScheduleAppleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig({
    title = 'Wywóz śmieci',
    waste_types = [],
    upcoming_limit = 5,
    show_calendar = false,
    future_dates_sensor,
  } = {}) {
    this._config = { title, waste_types, upcoming_limit, show_calendar, future_dates_sensor };
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() { return this._config?.show_calendar ? 6 : 5; }

  /* ── Date helpers ── */

  _dateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  _strToDate(str) {
    const p = str.split('T')[0].split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  _today() {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }

  _weekMonday(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay();
    d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
    return d;
  }

  _daysFrom(date) {
    const ref = this._today();
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    return Math.round((d - ref) / 86400000);
  }

  _relLabel(n) {
    if (n === 0) return 'Dziś';
    if (n === 1) return 'Jutro';
    return `za ${n} dni`;
  }

  // Returns { color, level } based on calendar-week proximity, not raw day count.
  // level: 'urgent' | 'soon' | 'later' | 'distant'
  _urgencyMeta(n, date) {
    const today = this._today();
    const nextMonday = this._weekMonday(today);
    nextMonday.setDate(nextMonday.getDate() + 7);          // start of next week
    const weekAfterNext = new Date(nextMonday);
    weekAfterNext.setDate(weekAfterNext.getDate() + 7);   // start of week after next

    const d = new Date(date); d.setHours(0, 0, 0, 0);

    if (n <= 1)                      return { color: _C.urgent, level: 'urgent' };  // today / tomorrow
    if (n <= 3 && d < nextMonday)    return { color: _C.soon,   level: 'soon'   };  // ≤3 days, same week
    if (d < weekAfterNext)           return { color: _C.later,  level: 'later'  };  // next calendar week
    return                                  { color: '#636366', level: 'distant' }; // beyond — no emphasis
  }

  /* ── Data ── */

  _parseWaste(wc) {
    const entity = this._hass.states[wc.entity];
    if (!entity) return [];

    const today = this._today();
    const dates = [];

    const raw =
      entity.attributes?.next_date ??
      entity.attributes?.date ??
      entity.attributes?.next_pickup ??
      entity.attributes?.next_collection ??
      entity.state;

    if (raw !== undefined && raw !== null && String(raw) !== 'unknown' && String(raw) !== 'unavailable') {
      const s = String(raw).trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        const d = this._strToDate(s);
        if (!isNaN(d)) dates.push(d);
      } else if (/^\d+$/.test(s)) {
        const d = new Date(today);
        d.setDate(d.getDate() + parseInt(s, 10));
        dates.push(d);
      }
    }

    const fSensor = wc.future_dates_sensor || this._config.future_dates_sensor;
    if (fSensor) {
      const fe = this._hass.states[fSensor];
      if (fe) {
        const rawF = fe.attributes?.dates ?? fe.attributes?.date_list ?? fe.state ?? '';
        const list = Array.isArray(rawF) ? rawF : String(rawF).split(',').map(s => s.trim());
        list.filter(s => /\d{4}-\d{2}-\d{2}/.test(s)).forEach(s => dates.push(this._strToDate(s)));
      }
    }

    const seen = new Set();
    return dates
      .filter(d => { const k = this._dateKey(d); if (seen.has(k)) return false; seen.add(k); return true; })
      .map(date => ({ name: wc.name, icon: wc.icon || 'trash-2', color: wc.color || _C.textTertiary, date }));
  }

  _buildCollectionMap() {
    const today = this._today();
    const start = this._weekMonday(today);
    const end = new Date(start);
    end.setDate(end.getDate() + 30);

    const map = {};
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      map[this._dateKey(new Date(d))] = [];
    }

    (this._config.waste_types || []).forEach(wt => {
      this._parseWaste(wt).forEach(item => {
        const k = this._dateKey(item.date);
        if (map[k]) map[k].push(item);
      });
    });

    return map;
  }

  /* ── Render helpers ── */

  _renderCalCell(date, items, { isToday, isPast }) {
    const dow = date.getDay(); // 0=Sun
    const isWeekend = dow === 0 || dow === 6;
    const letter = _DAY_LETTERS[dow === 0 ? 6 : dow - 1];
    const hasItems = items.length > 0;

    const dots = items.slice(0, 3).map(it =>
      `<span class="cal-dot" style="background:${it.color}"></span>`
    ).join('') + (items.length > 3 ? '<span class="cal-dot-more">+</span>' : '');

    const cls = [
      'cal-cell',
      isToday && 'cal-today',
      isPast  && 'cal-past',
      isWeekend && 'cal-weekend',
      hasItems && !isPast && 'cal-has-items',
    ].filter(Boolean).join(' ');

    const key = this._dateKey(date);

    return `
      <div class="${cls}" data-date="${key}" data-has-items="${hasItems && !isPast}">
        <span class="cal-letter">${letter}</span>
        <span class="cal-num">${date.getDate()}</span>
        <div class="cal-dots">${hasItems && !isPast ? dots : ''}</div>
      </div>`;
  }

  _renderChip(item) {
    const icon = _ICONS[item.icon] || _ICONS['trash-2'];
    return `
      <div class="chip" style="background:${item.color}1a;border-color:${item.color}44;">
        <span class="chip-ic" style="color:${item.color};">${icon}</span>
        <span class="chip-name" style="color:${item.color};">${item.name}</span>
      </div>`;
  }

  /* ── Main render ── */

  _render() {
    if (!this._config?.waste_types?.length || !this._hass) return;

    const today = this._today();
    const todayKey = this._dateKey(today);
    const colMap = this._buildCollectionMap();
    const showCal = this._config.show_calendar;

    /* Calendar */
    let calHTML = '';
    if (showCal) {
      const weekStart = this._weekMonday(today);
      const calDays = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        const key = this._dateKey(d);
        return { date: d, items: colMap[key] || [], isToday: key === todayKey, isPast: d < today };
      });

      const rowHTML = (days) =>
        `<div class="cal-row">${days.map(day => this._renderCalCell(day.date, day.items, day)).join('')}</div>`;

      calHTML = `${rowHTML(calDays.slice(0, 7))}${rowHTML(calDays.slice(7, 14))}<div class="divider"></div>`;
    }

    /* Grouped upcoming list */
    const grouped = Object.entries(colMap)
      .filter(([, arr]) => arr.length > 0)
      .map(([k, arr]) => ({ key: k, date: this._strToDate(k), items: arr }))
      .sort((a, b) => a.date - b.date)
      .filter(g => this._daysFrom(g.date) >= 0)
      .slice(0, this._config.upcoming_limit);

    const listHTML = grouped.length === 0
      ? `<div class="empty">Brak zaplanowanych wywozów</div>`
      : grouped.map((g, i) => {
          const n = this._daysFrom(g.date);
          const { color: uc, level } = this._urgencyMeta(n, g.date);
          const label = this._relLabel(n);
          const isDistant = level === 'distant';

          const dateStr = g.date.toLocaleDateString('pl-PL', {
            weekday: 'long', day: 'numeric', month: 'short',
          });

          // Left bar — glow only for urgent/soon, invisible-ish for distant
          const barGlow = level === 'urgent'
            ? `box-shadow:0 0 10px ${uc}99,0 0 4px ${uc}cc;`
            : level === 'soon'
            ? `box-shadow:0 0 6px ${uc}66;`
            : '';
          const barOpacity = isDistant ? 'opacity:0.3;' : '';

          // Item bg tint — only today/tomorrow
          const itemBg = level === 'urgent' ? `background:${uc}0d;` : '';

          // Badge — omit for distant (no label clutter needed)
          const badgeHTML = isDistant ? '' : (() => {
            const bg     = `${uc}${level === 'urgent' ? '2a' : '18'}`;
            const border = `${uc}${level === 'urgent' ? '55' : '33'}`;
            return `<span class="list-badge" style="color:${uc};background:${bg};border-color:${border};">${label}</span>`;
          })();

          const sep = i < grouped.length - 1 ? ' sep' : '';

          return `
            <div class="list-item${sep}" data-date="${g.key}" style="${itemBg}">
              <div class="urgency-bar" style="background:${uc};${barGlow}${barOpacity}"></div>
              <div class="list-body">
                <div class="list-top">
                  <span class="list-date${isDistant ? ' list-date-muted' : ''}">${dateStr}</span>
                  ${badgeHTML}
                </div>
                <div class="list-chips">${g.items.map(it => this._renderChip(it)).join('')}</div>
              </div>
            </div>`;
        }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        .card {
          background: linear-gradient(145deg, rgba(28,28,30,0.97), rgba(18,18,20,0.99));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 16px 14px 12px;
          color: ${_C.textPrimary};
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow: 0 10px 32px rgba(0,0,0,0.5);
          position: relative;
          overflow: hidden;
        }
        .card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          pointer-events: none;
        }

        /* ── Header ── */
        .header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 14px;
        }
        .header-ic {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(142,142,147,0.14);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          color: #8E8E93; flex-shrink: 0;
        }
        .header-ic svg { width: 14px; height: 14px; }
        .header-title {
          font-size: 15px; font-weight: 600; letter-spacing: -0.3px;
          color: rgba(255,255,255,0.93);
        }

        /* ── Calendar ── */
        .cal-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }
        .cal-row + .cal-row { margin-top: 6px; }

        .cal-cell {
          display: flex; flex-direction: column; align-items: center;
          padding: 5px 2px;
          border-radius: 10px;
          transition: background 0.15s, transform 0.15s;
          cursor: default;
        }
        .cal-has-items {
          cursor: pointer;
        }
        .cal-has-items:hover, .cal-hover {
          background: rgba(255,255,255,0.1);
          transform: scale(1.07);
          z-index: 1;
          position: relative;
        }
        .cal-today {
          background: rgba(255,255,255,0.11);
          border: 1px solid rgba(255,255,255,0.14);
        }
        .cal-today:hover, .cal-today.cal-hover {
          background: rgba(255,255,255,0.18);
        }
        /* Past days — subtle fade */
        .cal-past {
          opacity: 0.28;
        }
        /* Weekends — muted but not invisible */
        .cal-weekend:not(.cal-today) {
          opacity: 0.38;
        }
        .cal-weekend.cal-past {
          opacity: 0.18;
        }

        .cal-letter {
          font-size: 9px; font-weight: 500; color: ${_C.textTertiary};
          text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 3px;
        }
        .cal-today .cal-letter { color: ${_C.textSecondary}; }
        .cal-num {
          font-size: 13px; font-weight: 400; line-height: 1; color: ${_C.textSecondary};
        }
        .cal-today .cal-num { font-weight: 700; color: ${_C.textPrimary}; }
        .cal-dots {
          display: flex; gap: 2px; align-items: center;
          margin-top: 5px; min-height: 5px;
        }
        .cal-dot {
          width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
        }
        .cal-dot-more { font-size: 7px; color: ${_C.textTertiary}; line-height: 1; }

        /* ── Divider ── */
        .divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 14px -14px 0;
        }

        /* ── List ── */
        .list-item {
          display: flex;
          align-items: stretch;
          gap: 0;
          padding: 11px 0;
          border-radius: 10px;
          position: relative;
          transition: background 0.2s;
        }
        /* Soft hover on list rows (direct hover, not from calendar) */
        .list-item:hover {
          background: rgba(255,255,255,0.03) !important;
        }
        /* Highlight triggered from calendar hover */
        .list-item.highlighted {
          background: rgba(255,255,255,0.05) !important;
        }
        .list-item.highlighted .urgency-bar {
          filter: brightness(1.3);
        }
        .list-item.sep {
          border-bottom: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px 10px 0 0;
        }

        .urgency-bar {
          width: 3px;
          border-radius: 2px;
          flex-shrink: 0;
          margin-right: 12px;
          align-self: stretch;
          transition: filter 0.2s, box-shadow 0.2s;
        }

        .list-body { flex: 1; min-width: 0; }
        .list-top {
          display: flex; align-items: center;
          justify-content: space-between; gap: 8px;
          margin-bottom: 7px;
        }
        .list-date {
          font-size: 12px; font-weight: 500; color: ${_C.textSecondary};
          text-transform: capitalize; flex: 1; min-width: 0;
        }
        .list-date-muted {
          color: ${_C.textTertiary};
          font-weight: 400;
        }

        /* Badge pill */
        .list-badge {
          font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid;
          flex-shrink: 0;
          white-space: nowrap;
        }

        /* Chips */
        .list-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 9px 4px 6px;
          border-radius: 20px; border: 1px solid transparent;
        }
        .chip-ic {
          width: 13px; height: 13px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .chip-ic svg { width: 11px; height: 11px; }
        .chip-name { font-size: 12px; font-weight: 500; white-space: nowrap; }

        .empty {
          font-size: 13px; color: ${_C.textTertiary};
          text-align: center; padding: 16px 0;
        }
      </style>

      <div class="card">
        <div class="header">
          <div class="header-ic">${_ICONS['trash-2']}</div>
          <span class="header-title">${this._config.title}</span>
        </div>

        ${calHTML}

        <div class="list-section">${listHTML}</div>
      </div>
    `;

    this._attachEvents();
  }

  /* ── Calendar ↔ list hover bridge ── */

  _attachEvents() {
    const shadow = this.shadowRoot;

    shadow.querySelectorAll('.cal-cell[data-has-items="true"]').forEach(cell => {
      const key = cell.dataset.date;

      cell.addEventListener('mouseenter', () => {
        cell.classList.add('cal-hover');
        shadow.querySelector(`.list-item[data-date="${key}"]`)?.classList.add('highlighted');
      });

      cell.addEventListener('mouseleave', () => {
        cell.classList.remove('cal-hover');
        shadow.querySelector(`.list-item[data-date="${key}"]`)?.classList.remove('highlighted');
      });
    });
  }
}

customElements.define('waste-schedule-apple-card', WasteScheduleAppleCard);
