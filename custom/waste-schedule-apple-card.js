/**
 * waste-schedule-apple-card.js — harmonogram wywozu śmieci, Apple Home style
 *
 * INSTALACJA:
 *   1. Skopiuj do /config/www/waste-schedule-apple-card.js
 *   2. Lovelace → Manage Resources → /local/waste-schedule-apple-card.js (JavaScript Module)
 *
 * UŻYCIE:
 *   type: custom:waste-schedule-apple-card
 *   title: Wywóz śmieci
 *   waste_types:
 *     - entity: sensor.waste_bio
 *       name: Bio
 *       icon: leaf
 *       color: '#8B6F47'
 *     - entity: sensor.waste_paper
 *       name: Papier
 *       icon: file-text
 *       color: '#3A8FD9'
 *     - entity: sensor.waste_plastic
 *       name: Plastik
 *       icon: package
 *       color: '#FFD60A'
 *     - entity: sensor.waste_general
 *       name: Zmieszane
 *       icon: trash-2
 *       color: '#636366'
 *
 * Encje powinny mieć:
 *   - state: data następnego wywozu (YYYY-MM-DD) LUB dni do wywozu
 *   - attributes.days_until: liczba dni (opcjonalnie)
 *   - attributes.next_date: data (opcjonalnie)
 *
 * DESIGN 2026:
 *   - Glass morphism z blur
 *   - Gradient timeline
 *   - Icon system (custom SVG)
 *   - Dynamic color per waste type
 *   - Smooth animations & transitions
 */

const ICONS = {
  'trash-2': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>`,

  'leaf': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>`,

  'file-text': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>`,

  'package': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>`,

  'recycle': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 6l-3.09-5.35A2 2 0 0013.22 0H10.8a2 2 0 00-1.69.95L6 6"/>
    <path d="M14 21.83A2 2 0 0015.83 20l3.59-6.23a2 2 0 00-.74-2.73"/>
    <path d="M4.63 13.79A2 2 0 002 15.49v7.31a2 2 0 001.89 2"/>
    <path d="M13.09 4.46L18 13.79"/>
    <path d="M10.91 4.46L6 13.79"/>
  </svg>`,

  'droplet': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
  </svg>`,
};

class WasteScheduleAppleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._lastKey = null;
  }

  setConfig(config) {
    if (!config.waste_types?.length) {
      throw new Error('[waste-schedule-apple-card] Wymagane: waste_types');
    }
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;

    const key = (this._config.waste_types ?? [])
      .map(w => {
        const e = hass.states[w.entity];
        return `${w.entity}:${e?.state}:${e?.attributes?.days_until ?? ''}`;
      })
      .join('|');

    if (key === this._lastKey) return;
    this._lastKey = key;

    this._render();
  }

  getCardSize() { return 3; }

  _parseWaste(wasteConfig) {
    const entity = this._hass.states[wasteConfig.entity];
    if (!entity) return { empty: true };

    const state = entity.state;
    if (!state || state === 'unavailable' || state === 'unknown') {
      return { empty: true };
    }

    // Sprawdź days_until w attributes lub state
    let daysUntil = entity.attributes?.days_until;
    if (daysUntil === undefined || daysUntil === null) {
      // Spróbuj parsować state jako liczbę dni
      const parsed = parseInt(state);
      if (!isNaN(parsed)) {
        daysUntil = parsed;
      } else {
        // Spróbuj parsować jako datę
        const dateMatch = state.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
          const targetDate = new Date(dateMatch[0]);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          targetDate.setHours(0, 0, 0, 0);
          daysUntil = Math.floor((targetDate - today) / (1000 * 60 * 60 * 24));
        }
      }
    }

    if (daysUntil === undefined || daysUntil === null || isNaN(daysUntil)) {
      return { empty: true };
    }

    return {
      empty: false,
      name: wasteConfig.name || 'Odpad',
      icon: wasteConfig.icon || 'trash-2',
      color: wasteConfig.color || '#8E8E93',
      daysUntil: parseInt(daysUntil),
    };
  }

  _formatDays(days) {
    if (days < 0) return 'Przeterminowane';
    if (days === 0) return 'Dziś';
    if (days === 1) return 'Jutro';
    if (days <= 7) return `Za ${days} dni`;
    if (days <= 14) return `Za ${days} dni`;
    return `Za ${days} dni`;
  }

  _render() {
    if (!this._hass || !this._config) return;

    const title = this._config.title ?? 'Wywóz śmieci';
    const wasteTypes = this._config.waste_types ?? [];

    const items = wasteTypes
      .map(w => ({ ...this._parseWaste(w), originalOrder: wasteTypes.indexOf(w) }))
      .filter(w => !w.empty)
      .sort((a, b) => {
        if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil;
        return a.originalOrder - b.originalOrder;
      });

    if (items.length === 0) {
      this.shadowRoot.innerHTML = this._renderEmpty(title);
      return;
    }

    const nextItem = items[0];
    const upcomingItems = items.slice(1, 4);

    const nextHTML = this._renderNextItem(nextItem);
    const upcomingHTML = upcomingItems.map((item, idx) => this._renderUpcomingItem(item, idx)).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        @keyframes waste-pulse {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        @keyframes waste-slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card {
          background: linear-gradient(145deg,
            rgba(28,28,30,0.95) 0%,
            rgba(18,18,20,0.98) 100%);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-radius: 20px;
          padding: 18px;
          box-sizing: border-box;
          font-family: -apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif;
          -webkit-font-smoothing: antialiased;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4),
                      0 2px 8px rgba(0,0,0,0.2);
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
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,255,255,0.15) 50%,
            transparent 100%);
          pointer-events: none;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .header-ic {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg,
            rgba(142,142,147,0.15) 0%,
            rgba(99,99,102,0.2) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8E8E93;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .header-ic svg {
          width: 16px;
          height: 16px;
        }

        .header-title {
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.2px;
          color: rgba(255,255,255,0.95);
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .next {
          background: linear-gradient(145deg,
            rgba(44,44,46,0.6) 0%,
            rgba(28,28,30,0.8) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          animation: waste-slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .next-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 10px;
        }

        .next-main {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .next-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25),
                      inset 0 1px 0 rgba(255,255,255,0.1);
          position: relative;
          overflow: hidden;
        }

        .next-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%,
            rgba(255,255,255,0.15) 0%,
            transparent 70%);
          pointer-events: none;
        }

        .next-icon svg {
          width: 26px;
          height: 26px;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }

        .next-info {
          flex: 1;
          min-width: 0;
        }

        .next-name {
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.4px;
          color: rgba(255,255,255,0.95);
          margin-bottom: 4px;
        }

        .next-time {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: -0.2px;
        }

        .next-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .next-badge.today {
          background: linear-gradient(135deg,
            rgba(255,59,48,0.2) 0%,
            rgba(255,59,48,0.15) 100%);
          color: #FF6B6B;
          border: 1px solid rgba(255,59,48,0.3);
          animation: waste-pulse 2s ease-in-out infinite;
        }

        .next-badge.tomorrow {
          background: linear-gradient(135deg,
            rgba(255,149,0,0.18) 0%,
            rgba(255,149,0,0.12) 100%);
          color: #FFB366;
          border: 1px solid rgba(255,149,0,0.3);
        }

        .next-badge.soon {
          background: linear-gradient(135deg,
            rgba(52,199,89,0.15) 0%,
            rgba(52,199,89,0.1) 100%);
          color: #6BCE7C;
          border: 1px solid rgba(52,199,89,0.25);
        }

        .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .upcoming {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .upcoming-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: linear-gradient(135deg,
            rgba(58,58,60,0.4) 0%,
            rgba(44,44,46,0.5) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: waste-slide-in 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .upcoming-item:nth-child(2) { animation-delay: 0.1s; }
        .upcoming-item:nth-child(3) { animation-delay: 0.2s; }

        .upcoming-item:hover {
          background: linear-gradient(135deg,
            rgba(58,58,60,0.6) 0%,
            rgba(44,44,46,0.7) 100%);
          border-color: rgba(255,255,255,0.1);
          transform: translateX(2px);
        }

        .upcoming-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .upcoming-icon svg {
          width: 18px;
          height: 18px;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
        }

        .upcoming-info {
          flex: 1;
          min-width: 0;
        }

        .upcoming-name {
          font-size: 14px;
          font-weight: 500;
          letter-spacing: -0.2px;
          color: rgba(255,255,255,0.85);
          margin-bottom: 2px;
        }

        .upcoming-time {
          font-size: 11px;
          font-weight: 400;
          color: rgba(255,255,255,0.4);
          letter-spacing: -0.1px;
        }

        .empty {
          text-align: center;
          padding: 32px 20px;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 14px;
          border-radius: 14px;
          background: linear-gradient(135deg,
            rgba(142,142,147,0.1) 0%,
            rgba(99,99,102,0.15) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(142,142,147,0.6);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .empty-icon svg {
          width: 24px;
          height: 24px;
        }

        .empty-text {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          letter-spacing: -0.2px;
        }
      </style>

      <div class="card">
        <div class="header">
          <div class="header-ic">${ICONS['trash-2']}</div>
          <div class="header-title">${title}</div>
        </div>

        ${nextHTML}

        ${upcomingHTML ? `<div class="upcoming">${upcomingHTML}</div>` : ''}
      </div>
    `;
  }

  _renderNextItem(item) {
    const badgeClass = item.daysUntil === 0 ? 'today'
                     : item.daysUntil === 1 ? 'tomorrow'
                     : 'soon';

    const bgColor = this._hexToRgba(item.color, 0.15);
    const borderColor = this._hexToRgba(item.color, 0.3);

    return `
      <div class="next">
        <div class="next-label">Następny wywóz</div>
        <div class="next-main">
          <div class="next-icon" style="background: linear-gradient(135deg, ${bgColor} 0%, ${this._hexToRgba(item.color, 0.08)} 100%); border: 1px solid ${borderColor}; color: ${item.color};">
            ${ICONS[item.icon] || ICONS['trash-2']}
          </div>
          <div class="next-info">
            <div class="next-name">${item.name}</div>
            <div class="next-time">
              <span class="next-badge ${badgeClass}">
                <span class="dot" style="background: currentColor;"></span>
                ${this._formatDays(item.daysUntil)}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderUpcomingItem(item, idx) {
    const bgColor = this._hexToRgba(item.color, 0.12);
    const borderColor = this._hexToRgba(item.color, 0.25);

    return `
      <div class="upcoming-item">
        <div class="upcoming-icon" style="background: linear-gradient(135deg, ${bgColor} 0%, ${this._hexToRgba(item.color, 0.06)} 100%); border: 1px solid ${borderColor}; color: ${item.color};">
          ${ICONS[item.icon] || ICONS['trash-2']}
        </div>
        <div class="upcoming-info">
          <div class="upcoming-name">${item.name}</div>
          <div class="upcoming-time">${this._formatDays(item.daysUntil)}</div>
        </div>
      </div>
    `;
  }

  _renderEmpty(title) {
    return `
      <style>
        :host { display: block; }
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
        }
        .header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .header-ic { width: 32px; height: 32px; border-radius: 10px; background: linear-gradient(135deg, rgba(142,142,147,0.15) 0%, rgba(99,99,102,0.2) 100%); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: #8E8E93; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        .header-ic svg { width: 16px; height: 16px; }
        .header-title { font-size: 15px; font-weight: 600; letter-spacing: -0.2px; color: rgba(255,255,255,0.95); }
        .empty { text-align: center; padding: 32px 20px; }
        .empty-icon { width: 48px; height: 48px; margin: 0 auto 14px; border-radius: 14px; background: linear-gradient(135deg, rgba(142,142,147,0.1) 0%, rgba(99,99,102,0.15) 100%); display: flex; align-items: center; justify-content: center; color: rgba(142,142,147,0.6); }
        .empty-icon svg { width: 24px; height: 24px; }
        .empty-text { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.5); }
      </style>
      <div class="card">
        <div class="header">
          <div class="header-ic">${ICONS['trash-2']}</div>
          <div class="header-title">${title}</div>
        </div>
        <div class="empty">
          <div class="empty-icon">${ICONS['trash-2']}</div>
          <div class="empty-text">Brak danych o wywozach</div>
        </div>
      </div>
    `;
  }

  _hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}

customElements.define('waste-schedule-apple-card', WasteScheduleAppleCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'waste-schedule-apple-card',
  name: 'Waste Schedule Apple Card',
  description: 'Apple Home style harmonogram wywozu śmieci z glass morphism, timeline view i dynamic colors.',
  preview: false,
});
