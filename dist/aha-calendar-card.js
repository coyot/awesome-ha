/**
 * aha-calendar-card — 2-week Google Calendar view
 *
 * Config:
 *   type: custom:aha-calendar-card
 *   title: "Kalendarz"           # optional
 *   days: 14                     # optional, default 14
 *   calendars:
 *     - entity: calendar.rodzinne
 *       name: Rodzinne
 *       color: "#9C27B0"
 *     - entity: calendar.google_en_pl
 *       name: Święta
 *       color: "#FF453A"
 */

(function () {
  'use strict';

  const _DAY_LETTERS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

  function _esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function _pad(n) { return String(n).padStart(2, '0'); }

  const _CAL_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

  class AhaCalendarCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._hass      = null;
      this._config    = {};
      this._events    = {};   // entity -> raw events array
      this._loading   = {};   // entity -> bool
      this._lastFetch = {};   // entity -> timestamp
      this._tick      = null;
    }

    static getStubConfig() {
      return {
        title: 'Kalendarz',
        days: 14,
        calendars: [
          { entity: 'calendar.rodzinne', name: 'Rodzinne', color: '#9C27B0' },
        ],
      };
    }

    setConfig(config) {
      this._config = {
        title: 'Kalendarz',
        days: 14,
        calendars: [],
        ...config,
      };
    }

    set hass(hass) {
      const first = !this._hass;
      this._hass = hass;
      this._render();
      if (first) {
        this._fetchAll();
        this._tick = setInterval(() => this._fetchAll(), 5 * 60 * 1000);
      }
    }

    disconnectedCallback() {
      if (this._tick) { clearInterval(this._tick); this._tick = null; }
    }

    getCardSize() { return 7; }

    // ── Date helpers ──────────────────────────────────────────────────────────

    _today() {
      const t = new Date(); t.setHours(0, 0, 0, 0); return t;
    }

    _dateKey(d) {
      return `${d.getFullYear()}-${_pad(d.getMonth() + 1)}-${_pad(d.getDate())}`;
    }

    _parseDateOnly(str) {
      // "YYYY-MM-DD" → local midnight Date (avoid UTC offset issues)
      const [y, m, d] = str.split('-').map(Number);
      return new Date(y, m - 1, d);
    }

    _weekMonday(date) {
      const d = new Date(date); d.setHours(0, 0, 0, 0);
      const dow = d.getDay();
      d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
      return d;
    }

    // ── Data fetch ────────────────────────────────────────────────────────────

    async _fetchAll() {
      const cals = this._config.calendars || [];
      if (!cals.length || !this._hass) return;

      const now     = Date.now();
      const REFRESH = 5 * 60 * 1000;

      for (const cal of cals) {
        if (!cal.entity) continue;
        if (this._loading[cal.entity]) continue;
        if (this._events[cal.entity] !== undefined &&
            (now - (this._lastFetch[cal.entity] || 0)) < REFRESH) continue;

        this._loading[cal.entity] = true;
        try {
          const start = this._today();
          const end   = new Date(start);
          end.setDate(end.getDate() + (this._config.days || 14) + 1);
          const url = `calendars/${cal.entity}?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`;
          const events = await this._hass.callApi('GET', url);
          this._events[cal.entity]    = Array.isArray(events) ? events : [];
          this._lastFetch[cal.entity] = Date.now();
        } catch (e) {
          console.error('[aha-calendar-card] fetch error:', cal.entity, e);
          this._events[cal.entity] = this._events[cal.entity] || [];
        } finally {
          this._loading[cal.entity] = false;
        }
      }
      this._render();
    }

    // ── Build event map: dateKey → [{summary, time, allDay, color, location, sortKey}] ──

    _buildEventMap() {
      const map = {};
      const days = this._config.days || 14;

      const addToDay = (key, entry) => {
        if (!map[key]) map[key] = [];
        map[key].push(entry);
      };

      for (const cal of (this._config.calendars || [])) {
        const events = this._events[cal.entity] || [];
        for (const ev of events) {
          const startRaw = ev.start?.dateTime || ev.start?.date;
          if (!startRaw) continue;

          const allDay  = !ev.start?.dateTime;
          const color   = cal.color || '#9C27B0';
          const summary = ev.summary || '(bez tytułu)';
          const location = (ev.location || '').replace(/,?\s*Poland\s*$/i, '').trim();

          if (allDay) {
            const startDate = this._parseDateOnly(startRaw);
            // end.date in Google is exclusive (day after last day)
            const endRaw   = ev.end?.date;
            const endDate  = endRaw ? this._parseDateOnly(endRaw) : new Date(startDate.getTime() + 86400000);

            // Fill each day of the span with this event
            for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
              addToDay(this._dateKey(new Date(d)), {
                summary, location, color, allDay: true,
                time: 'cały dzień', sortKey: -1,
                isStartDay: this._dateKey(new Date(d)) === this._dateKey(startDate),
              });
            }
          } else {
            const startDt = new Date(startRaw);
            // Skip events that have already started/passed
            if (startDt < new Date()) continue;
            const key     = this._dateKey(startDt);
            const soonMs  = startDt.getTime() - Date.now();
            addToDay(key, {
              summary, location, color, allDay: false,
              time: `${_pad(startDt.getHours())}:${_pad(startDt.getMinutes())}`,
              sortKey: startDt.getHours() * 60 + startDt.getMinutes(),
              isStartDay: true,
              soon: soonMs <= 2 * 3600 * 1000,
            });
          }
        }
      }

      // Sort each day: all-day first, then by time
      for (const key of Object.keys(map)) {
        map[key].sort((a, b) => a.sortKey - b.sortKey);
      }
      return map;
    }

    // ── Calendar cell ─────────────────────────────────────────────────────────

    _renderCalCell(date, events, isToday, isPast) {
      const dow       = date.getDay();
      const letter    = _DAY_LETTERS[dow === 0 ? 6 : dow - 1];
      const isWeekend = dow === 0 || dow === 6;
      const hasEvents = events.length > 0 && !isPast;

      // Up to 3 unique calendar colors as dots
      const uniqueColors = [...new Map(events.map(e => [e.color, e.color])).values()].slice(0, 3);
      const dots = uniqueColors.map(c =>
        `<span class="cal-dot" style="background:${c}"></span>`
      ).join('') + (events.length > 3 ? '<span class="cal-dot-more">+</span>' : '');

      const cls = [
        'cal-cell',
        isToday   && 'cal-today',
        isPast    && 'cal-past',
        isWeekend && 'cal-weekend',
        hasEvents && 'cal-has-events',
      ].filter(Boolean).join(' ');

      return `<div class="${cls}" data-date="${this._dateKey(date)}">
        <span class="cal-letter">${letter}</span>
        <span class="cal-num">${date.getDate()}</span>
        <div class="cal-dots">${hasEvents ? dots : ''}</div>
      </div>`;
    }

    // ── Main render ───────────────────────────────────────────────────────────

    _render() {
      if (!this._hass) return;

      const today    = this._today();
      const todayKey = this._dateKey(today);
      const days     = this._config.days || 14;
      const eventMap = this._buildEventMap();
      const isLoading = Object.values(this._loading).some(Boolean);
      const hasFetchedOnce = Object.keys(this._events).length > 0;

      // ── Calendar grid (2 rows × 7 days) ────────────────────────────────────
      const weekStart = this._weekMonday(today);
      const calDays   = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      });

      const rowHTML = (slice) =>
        `<div class="cal-row">${slice.map(d => {
          const key = this._dateKey(d);
          return this._renderCalCell(d, eventMap[key] || [], key === todayKey, d < today);
        }).join('')}</div>`;

      const calHTML = rowHTML(calDays.slice(0, 7)) + rowHTML(calDays.slice(7, 14))
        + '<div class="divider"></div>';

      // ── Event list (next N days, grouped by day) ────────────────────────────
      const tomorrow    = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowKey = this._dateKey(tomorrow);

      const dayGroups = [];
      for (let i = 0; i < days; i++) {
        const d   = new Date(today); d.setDate(d.getDate() + i);
        const key = this._dateKey(d);
        if (eventMap[key]?.length) dayGroups.push({ date: d, key, events: eventMap[key] });
      }

      let listHTML;
      if (!hasFetchedOnce && isLoading) {
        listHTML = `<div class="empty">Ładowanie…</div>`;
      } else if (dayGroups.length === 0) {
        listHTML = `<div class="empty">Brak wydarzeń w najbliższych ${days} dniach</div>`;
      } else {
        listHTML = dayGroups.map((group, gi) => {
          const isToday    = group.key === todayKey;
          const isTomorrow = group.key === tomorrowKey;
          const dow        = group.date.getDay();

          const weekdayStr = group.date.toLocaleDateString('pl-PL', { weekday: 'long' });
          const capitalDay = weekdayStr.charAt(0).toUpperCase() + weekdayStr.slice(1);
          const restStr    = group.date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });

          const badgeHTML = isToday
            ? `<span class="day-badge today-badge">Dziś</span>`
            : isTomorrow
            ? `<span class="day-badge tomorrow-badge">Jutro</span>`
            : '';

          const eventsHTML = group.events.map(ev => {
            const locHTML  = ev.location
              ? `<span class="ev-loc">${_esc(ev.location)}</span>`
              : '';
            const soonDot  = ev.soon
              ? `<span class="soon-dot"></span>`
              : '';
            return `<div class="ev-row${ev.soon ? ' ev-soon' : ''}" data-date="${group.key}" style="--ec:${ev.color}">
              <span class="ev-time">${_esc(ev.time)}${soonDot}</span>
              <div class="ev-bar"></div>
              <div class="ev-body">
                <span class="ev-name">${_esc(ev.summary)}</span>
                ${locHTML}
              </div>
            </div>`;
          }).join('');

          const sepClass = gi < dayGroups.length - 1 ? ' sep' : '';
          return `<div class="day-group${sepClass}" data-date="${group.key}">
            <div class="day-header">
              <span class="day-date"><strong>${capitalDay}</strong>, ${restStr}</span>
              ${badgeHTML}
            </div>
            <div class="day-events">${eventsHTML}</div>
          </div>`;
        }).join('');
      }

      // ── Loading indicator in header ─────────────────────────────────────────
      const loadingDot = isLoading
        ? `<span class="hdr-loading" title="Aktualizacja…"></span>`
        : '';

      this.shadowRoot.innerHTML = `
        <style>${this._css()}</style>
        <div class="card">
          <div class="header">
            <div class="header-ic">${_CAL_ICON}</div>
            <span class="header-title">${_esc(this._config.title || 'Kalendarz')}</span>
            ${loadingDot}
          </div>
          ${calHTML}
          <div class="list-section">${listHTML}</div>
        </div>`;

      this._attachEvents();
    }

    // ── Calendar ↔ list hover bridge ──────────────────────────────────────────

    _attachEvents() {
      const shadow = this.shadowRoot;
      shadow.querySelectorAll('.cal-cell.cal-has-events').forEach(cell => {
        const key = cell.dataset.date;
        cell.addEventListener('mouseenter', () => {
          cell.classList.add('cal-hover');
          shadow.querySelector(`.day-group[data-date="${key}"]`)?.classList.add('highlighted');
        });
        cell.addEventListener('mouseleave', () => {
          cell.classList.remove('cal-hover');
          shadow.querySelector(`.day-group[data-date="${key}"]`)?.classList.remove('highlighted');
        });
      });
    }

    // ── CSS ───────────────────────────────────────────────────────────────────

    _css() {
      const T1 = '#F5F5F7';
      const T2 = 'rgba(255,255,255,0.55)';
      const T4 = 'rgba(255,255,255,0.28)';

      return `
      :host { display: block; }

      .card {
        background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
        border-radius: 20px;
        padding: 16px 14px 12px;
        color: ${T1};
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
        flex: 1;
      }
      .hdr-loading {
        width: 6px; height: 6px; border-radius: 50%;
        background: rgba(255,255,255,0.20);
        animation: hdr-blink 1.4s ease-in-out infinite;
        flex-shrink: 0;
      }
      @keyframes hdr-blink {
        0%,100% { opacity: 1; } 50% { opacity: 0.2; }
      }

      /* ── Calendar grid ── */
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
      .cal-has-events { cursor: pointer; }
      .cal-has-events:hover, .cal-hover {
        background: rgba(255,255,255,0.10);
        transform: scale(1.07);
        z-index: 1; position: relative;
      }
      .cal-today {
        background: rgba(255,255,255,0.11);
        border: 1px solid rgba(255,255,255,0.14);
      }
      .cal-today:hover, .cal-today.cal-hover { background: rgba(255,255,255,0.18); }
      .cal-past    { opacity: 0.28; }
      .cal-weekend:not(.cal-today) { opacity: 0.38; }
      .cal-weekend.cal-past        { opacity: 0.18; }

      .cal-letter {
        font-size: 9px; font-weight: 500; color: ${T4};
        text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 3px;
      }
      .cal-today .cal-letter { color: ${T2}; }
      .cal-num {
        font-size: 13px; font-weight: 400; line-height: 1; color: ${T2};
      }
      .cal-today .cal-num { font-weight: 700; color: ${T1}; }
      .cal-dots {
        display: flex; gap: 2px; align-items: center;
        margin-top: 5px; min-height: 5px;
      }
      .cal-dot {
        width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
      }
      .cal-dot-more { font-size: 7px; color: ${T4}; line-height: 1; }

      /* ── Divider ── */
      .divider {
        height: 1px;
        background: rgba(255,255,255,0.07);
        margin: 14px -14px 0;
      }

      /* ── Day group ── */
      .list-section { margin-top: 2px; }

      .day-group {
        padding: 10px 0 8px;
        border-radius: 10px;
        transition: background 0.2s;
      }
      .day-group.sep {
        border-bottom: 1px solid rgba(255,255,255,0.06);
        border-radius: 10px 10px 0 0;
      }
      .day-group.highlighted {
        background: rgba(255,255,255,0.04) !important;
      }

      .day-header {
        display: flex; align-items: center; gap: 8px;
        margin-bottom: 7px;
      }
      .day-date {
        font-size: 12px; color: ${T2};
        text-transform: capitalize; flex: 1;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .day-date strong { font-weight: 700; color: ${T1}; }

      .day-badge {
        font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 6px;
        border: 1px solid;
        flex-shrink: 0;
      }
      .today-badge {
        color: #64D2FF;
        background: rgba(100,210,255,0.14);
        border-color: rgba(100,210,255,0.30);
      }
      .tomorrow-badge {
        color: ${T2};
        background: rgba(255,255,255,0.07);
        border-color: rgba(255,255,255,0.14);
      }

      /* ── Event rows ── */
      .day-events { display: flex; flex-direction: column; gap: 5px; }

      .ev-row {
        display: flex; align-items: center; gap: 0;
        border-radius: 8px;
        padding: 5px 4px;
        transition: background 0.15s;
      }
      .ev-row:hover { background: rgba(255,255,255,0.04); }

      .ev-time {
        font-size: 10.5px; font-weight: 500;
        color: ${T4};
        width: 52px; flex-shrink: 0;
        text-align: right;
        padding-right: 10px;
        letter-spacing: -0.2px;
      }
      .ev-bar {
        width: 3px; height: 28px;
        border-radius: 2px;
        background: var(--ec, #9C27B0);
        flex-shrink: 0;
        margin-right: 10px;
        align-self: stretch;
        opacity: 0.85;
      }
      .ev-body {
        flex: 1; min-width: 0;
        display: flex; flex-direction: column; gap: 2px;
      }
      .ev-name {
        font-size: 12.5px; font-weight: 500;
        color: rgba(255,255,255,0.82);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ev-loc {
        font-size: 10.5px; color: ${T4};
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      /* ── Soon (≤2h) highlight ── */
      .ev-row.ev-soon {
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
        margin: 0 -4px;
        padding: 5px 4px;
      }
      .ev-row.ev-soon .ev-bar {
        box-shadow: 0 0 8px var(--ec), 0 0 3px var(--ec);
        opacity: 1;
      }
      .ev-row.ev-soon .ev-name {
        font-weight: 700;
        color: rgba(255,255,255,0.95);
      }
      .ev-row.ev-soon .ev-time {
        color: rgba(255,255,255,0.62);
        font-weight: 600;
      }
      .soon-dot {
        display: inline-block;
        width: 5px; height: 5px; border-radius: 50%;
        background: var(--ec);
        margin-left: 4px;
        vertical-align: middle;
        animation: soon-pulse 2s ease-in-out infinite;
      }
      @keyframes soon-pulse {
        0%,100% { opacity: 1; transform: scale(1); }
        50%      { opacity: 0.25; transform: scale(0.55); }
      }

      /* ── Empty / loading ── */
      .empty {
        font-size: 13px; color: ${T4};
        text-align: center; padding: 16px 0;
      }
      `;
    }
  }

  if (!customElements.get('aha-calendar-card')) {
    customElements.define('aha-calendar-card', AhaCalendarCard);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.find(c => c.type === 'aha-calendar-card')) {
    window.customCards.push({
      type: 'aha-calendar-card',
      name: 'AHA Calendar Card',
      description: '2-week Google Calendar view with event list',
    });
  }
})();
