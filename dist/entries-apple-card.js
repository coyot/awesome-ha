/**
 * entries-apple-card.js — ostatnie wjazdy, Apple Home style
 *
 * input_text.wjazd_x  →  format: "tk|2026-03-19 08:25:26"
 *
 * INSTALACJA:
 *   1. Skopiuj do /config/www/entries-apple-card.js
 *   2. Lovelace → Manage Resources → /local/entries-apple-card.js (JavaScript Module)
 *
 * UŻYCIE:
 *   type: custom:entries-apple-card
 *   title: Wjazdy
 *   entities:
 *     - input_text.wjazd_1
 *     - input_text.wjazd_2
 *     - input_text.wjazd_3
 *   persons:
 *     tk: person.tk
 *     mk: person.mk
 *
 * REDESIGN 2026:
 *   - Glass morphism background
 *   - Gradient timeline z opacity fadeout
 *   - Dynamic color accents (recent vs old)
 *   - Glow effects & smooth animations
 *   - SF Pro typography hierarchy
 */

const _ICON_CAR = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 17h14v-4H5v4z"/>
  <path d="M5 13L7 8h10l2 5"/>
  <circle cx="7.5" cy="17" r="1.5" fill="currentColor"/>
  <circle cx="16.5" cy="17" r="1.5" fill="currentColor"/>
  <path d="M8 13h8"/>
</svg>`;

const _ICON_PERSON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
  <circle cx="12" cy="7" r="4"/>
  <path d="M4 21c0-3.9 3.1-7 7-8h2c3.9 1 7 4.1 7 8v0H4z" opacity="0.8"/>
</svg>`;

const _ICON_CHEVRON_DOWN = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 9l6 6 6-6"/>
</svg>`;

const _ICON_CHEVRON_UP = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M18 15l-6-6-6 6"/>
</svg>`;

class EntriesAppleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._expanded = false;
    this._lastKey  = null; // dirty-check
  }

  setConfig(config) {
    if (!config.entities?.length) throw new Error('[entries-apple-card] Wymagane: entities');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;

    // Dirty-check: zbierz stany encji + stan rozwinięcia w jeden string
    const key = (this._config.entities ?? [])
      .map(id => hass.states[id]?.state ?? '')
      .join('|') + '|' + this._expanded;

    if (key === this._lastKey) return; // nic się nie zmieniło — pomiń render
    this._lastKey = key;

    this._render();
  }

  getCardSize() { return 2; }

  _resolvePerson(personId) {
    const map      = this._config.persons ?? {};
    const entityId = map[personId] ?? `person.${personId}`;
    const entity   = this._hass.states[entityId];
    if (!entity) return { name: personId, picture: null };
    return {
      name:    entity.attributes?.friendly_name ?? personId,
      picture: entity.attributes?.entity_picture ?? null,
    };
  }

  _relativeTime(ts) {
    if (!ts || isNaN(ts)) return '';

    const now     = new Date();
    const date    = new Date(ts);
    const diffMs  = now - ts;
    const diffMin = Math.round(diffMs / 60_000);
    const diffH   = Math.floor(diffMin / 60);

    const hhmm = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

    if (diffMin < 1)  return 'teraz';
    if (diffMin < 60) return `${diffMin} min temu`;

    const sameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth()    === b.getMonth()    &&
      a.getDate()     === b.getDate();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (sameDay(date, now))       return `dziś @ ${hhmm}  (${diffH}h temu)`;
    if (sameDay(date, yesterday)) return `wczoraj @ ${hhmm}`;

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);

    if (date >= startOfWeek) {
      const dayName = date.toLocaleDateString('pl-PL', { weekday: 'long' });
      return `${dayName} @ ${hhmm}`;
    }

    const dateLabel = date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
    return `${dateLabel} @ ${hhmm}`;
  }

  _parseEntry(id) {
    const state = this._hass.states[id];
    if (!state) return { empty: true };

    const raw = (state.state ?? '').trim();
    const pipeIdx = raw.indexOf('|');
    if (!raw || raw === '-' || pipeIdx === -1) return { empty: true };

    const personId = raw.slice(0, pipeIdx).trim();
    const tsRaw    = raw.slice(pipeIdx + 1).trim();

    if (!personId || personId === 'unknown' || personId === 'unavailable') return { empty: true };

    const ts = new Date(tsRaw.replace(' ', 'T')).getTime();

    const person = this._resolvePerson(personId);
    return {
      empty:     false,
      name:      person.name,
      picture:   person.picture,
      ts:        isNaN(ts) ? Date.now() : ts,
      timeLabel: this._relativeTime(isNaN(ts) ? Date.now() : ts),
    };
  }

  _avatarImg(entry, size, border, shadow = false) {
    const shadowStyle = shadow ? 'box-shadow:0 4px 12px rgba(0,0,0,0.3), 0 0 20px rgba(255,149,0,0.2);' : 'box-shadow:0 2px 6px rgba(0,0,0,0.15);';
    const s = `width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid ${border};${shadowStyle}transition:transform 0.2s cubic-bezier(0.4,0,0.2,1);`;
    return entry.picture
      ? `<img style="${s}" src="${entry.picture}" alt="${entry.name}">`
      : `<div style="${s}background:linear-gradient(135deg,#3A3A3C 0%,#2C2C2E 100%);display:flex;align-items:center;justify-content:center;color:#8E8E93;">${_ICON_PERSON}</div>`;
  }

  _render() {
    if (!this._hass || !this._config) return;

    const title    = this._config.title    ?? 'Ostatnie wjazdy';
    const entities = this._config.entities ?? [];
    const MAX_SHOW  = 3;
    const GROUP_MS  = 60_000;

    const entries = entities.map(id => this._parseEntry(id));
    const filled  = entries.filter(e => !e.empty).sort((a, b) => b.ts - a.ts);

    const groups = [];
    for (const entry of filled) {
      const last = groups[groups.length - 1];
      if (last && Math.abs(entry.ts - last[0].ts) < GROUP_MS) {
        last.push(entry);
      } else {
        groups.push([entry]);
      }
    }

    const visibleGroups  = this._expanded ? groups.slice(0, MAX_SHOW) : groups.slice(0, 1);
    const hasMore        = groups.length > 1;
    const remainingCount = Math.min(groups.length - 1, MAX_SHOW - 1);

    // Stała wysokość wiersza — używamy transform do animacji, nie height
    const ROW_H_FIRST = 68; // px - większy na first entry
    const ROW_H_OTHER = 56; // px

    const rowsHTML = visibleGroups.map((group, gi) => {
      const isFirst = gi === 0;
      const age = gi; // 0 = latest, 1 = older, 2 = oldest

      const together = group.length > 1;
      const names    = group.map(e => e.name).join(' & ');
      const time     = group[0].timeLabel;

      // Dynamiczne kolory akcent ów — recent = żywy, old = wygaszony
      const accentColor = isFirst ? '#FF9500' : age === 1 ? '#8E8E93' : '#636366';
      const dotSize     = isFirst ? 13 : 10;
      const dotGlow     = isFirst ? 'box-shadow:0 0 12px rgba(255,149,0,0.6), 0 0 24px rgba(255,149,0,0.3);' : '';

      const avSize   = isFirst ? 48 : 38;
      const avBorder = isFirst ? '#FF9500' : '#48484A';
      const avShadow = isFirst;
      const rowH     = isFirst ? ROW_H_FIRST : ROW_H_OTHER;

      const avatarBlock = together
        ? `<div class="av-group${isFirst ? ' recent' : ''}">${group.map((e, ei) =>
            this._avatarImg(e, 32, accentColor, avShadow).replace('style="', `style="${ei > 0 ? 'margin-left:-12px;z-index:' + (10 - ei) + ';' : 'z-index:10;'}`)
          ).join('')}</div>`
        : `<div class="av-single">${this._avatarImg(group[0], avSize, avBorder, avShadow)}</div>`;

      return `
        <div class="tl-row${isFirst ? ' latest' : ''}" style="height:${rowH}px;">
          <div class="tl-dot${isFirst ? ' latest' : ''}" style="width:${dotSize}px;height:${dotSize}px;background:${accentColor};${dotGlow}"></div>
          ${avatarBlock}
          <div class="tl-info">
            <div class="tl-name${isFirst ? ' big' : age === 1 ? ' medium' : ' old'}">${names}</div>
            ${together ? `<div class="tl-sub">razem</div>` : ''}
          </div>
          <div class="tl-time${isFirst ? ' latest' : ''}">${time}</div>
        </div>`;
    }).join('');

    const toggleBtn = hasMore ? `
      <button class="toggle-btn" id="toggle-btn">
        ${this._expanded
          ? `<span>zwiń</span>${_ICON_CHEVRON_UP}`
          : `<span>+${remainingCount} wcześniej</span>${_ICON_CHEVRON_DOWN}`
        }
      </button>` : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        @keyframes entries-glow-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        @keyframes entries-line-fade {
          from { opacity: 0; transform: scaleY(0.5); }
          to { opacity: 1; transform: scaleY(1); }
        }

        .card {
          background: linear-gradient(145deg, rgba(28,28,30,0.95) 0%, rgba(18,18,20,0.98) 100%);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-radius: 20px;
          padding: 18px;
          box-sizing: border-box;
          font-family: -apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif;
          -webkit-font-smoothing: antialiased;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2);
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
          pointer-events: none;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .header-ic {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(255,149,0,0.15) 0%, rgba(255,149,0,0.08) 100%);
          border: 1px solid rgba(255,149,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FF9500;
          box-shadow: 0 2px 8px rgba(255,149,0,0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .header-ic:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(255,149,0,0.25);
        }

        .header-title {
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.2px;
          color: rgba(255,255,255,0.95);
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .tl {
          position: relative;
          padding-left: 28px;
        }

        .tl-line {
          position: absolute;
          left: 6px;
          top: 20px;
          bottom: 20px;
          width: 2px;
          background: linear-gradient(180deg,
            rgba(255,149,0,0.4) 0%,
            rgba(142,142,147,0.3) 30%,
            rgba(99,99,102,0.2) 70%,
            transparent 100%);
          border-radius: 2px;
          animation: entries-line-fade 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tl-row {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          box-sizing: border-box;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tl-row.latest {
          margin-bottom: 8px;
        }

        .tl-dot {
          position: absolute;
          left: -24px;
          border-radius: 50%;
          border: 2.5px solid rgba(28,28,30,0.95);
          flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tl-dot.latest {
          animation: entries-glow-pulse 2.5s ease-in-out infinite;
        }

        .av-single {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        .av-group {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          border-radius: 50px;
          padding: 3px 8px 3px 3px;
          background: rgba(255,149,0,0.08);
          border: 1.5px solid rgba(255,149,0,0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .av-group.recent {
          background: rgba(255,149,0,0.12);
          border-color: rgba(255,149,0,0.5);
          box-shadow: 0 4px 12px rgba(255,149,0,0.2);
        }

        .tl-info {
          flex: 1;
          min-width: 0;
        }

        .tl-name {
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.3px;
          color: rgba(255,255,255,0.85);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.3s ease;
        }

        .tl-name.big {
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.4px;
          color: rgba(255,255,255,0.98);
        }

        .tl-name.medium {
          color: rgba(255,255,255,0.70);
        }

        .tl-name.old {
          font-size: 14px;
          font-weight: 400;
          color: rgba(142,142,147,0.8);
        }

        .tl-sub {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,149,0,0.7);
          margin-top: 2px;
          letter-spacing: 0.1px;
        }

        .tl-time {
          font-size: 12px;
          font-weight: 400;
          color: rgba(142,142,147,0.8);
          white-space: nowrap;
          flex-shrink: 0;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.1px;
        }

        .tl-time.latest {
          font-size: 13px;
          font-weight: 500;
          color: #FF9500;
          text-shadow: 0 0 8px rgba(255,149,0,0.3);
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin: 12px auto 0;
          background: linear-gradient(135deg, rgba(44,44,46,0.8) 0%, rgba(58,58,60,0.6) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          color: rgba(174,174,178,0.95);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: -0.2px;
          padding: 8px 16px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .toggle-btn:hover {
          background: linear-gradient(135deg, rgba(58,58,60,0.9) 0%, rgba(72,72,74,0.7) 100%);
          border-color: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.95);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .toggle-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      </style>
      <div class="card">
        <div class="header">
          <div class="header-ic">${_ICON_CAR}</div>
          <div class="header-title">${title}</div>
        </div>
        <div class="tl">
          <div class="tl-line"></div>
          ${rowsHTML}
        </div>
        ${toggleBtn}
      </div>`;

    const btn = this.shadowRoot.getElementById('toggle-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        this._expanded = !this._expanded;
        this._lastKey  = null; // wymuś re-render po kliknięciu
        this._render();
      });
    }
  }
}

customElements.define('aha-entries-apple-card', EntriesAppleCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'aha-entries-apple-card',
  name: 'Entries Apple Card',
  description: 'Apple Home style timeline ostatnich wjazdów z glass morphism i smooth animations.',
  preview: false,
});