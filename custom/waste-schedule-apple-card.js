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
  'trash-2': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  'leaf': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
  'file-text': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
  'package': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  'recycle': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6l-3.09-5.35A2 2 0 0013.22 0H10.8a2 2 0 00-1.69.95L6 6"/><path d="M14 21.83A2 2 0 0015.83 20l3.59-6.23a2 2 0 00-.74-2.73"/><path d="M4.63 13.79A2 2 0 002 15.49v7.31a2 2 0 001.89 2"/><path d="M13.09 4.46L18 13.79"/><path d="M10.91 4.46L6 13.79"/></svg>`,
  'droplet': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>`,
  'glass': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6"/><path d="M15 2v2.5a2.5 2.5 0 01-2.5 2.5H11.5A2.5 2.5 0 019 4.5V2"/><path d="M9 7l-2 2v7l4-2 3 4 3-6V9c0-1.1-.9-2-2-2"/><path d="M13 11l2 3"/><line x1="10" y1="14" x2="10" y2="14"/></svg>`,
  'armchair': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9V6a2 2 0 00-2-2H7a2 2 0 00-2 2v3"/><path d="M3 11v5a2 2 0 002 2h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2z"/><path d="M5 18v2"/><path d="M19 18v2"/></svg>`,
};

class WasteScheduleAppleCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  setConfig(config) { this._config = config; }
  set hass(hass) { this._hass = hass; this._render(); }

  _parseWaste(wasteConfig) {
    const entity = this._hass.states[wasteConfig.entity];
    if (!entity) return { empty: true };
    const state = entity.state;
    let daysUntil = null; let dateObj = null;
    const dateStr = entity.attributes?.next_date || entity.attributes?.date || state;
    
    if (dateStr && typeof dateStr === 'string' && dateStr.includes('-')) {
        const parts = dateStr.split('T')[0].split('-');
        dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        const today = new Date(); today.setHours(0, 0, 0, 0); dateObj.setHours(0, 0, 0, 0);
        daysUntil = Math.round((dateObj - today) / (1000 * 60 * 60 * 24));
    } else {
        daysUntil = parseInt(state);
        if (!isNaN(daysUntil)) { dateObj = new Date(); dateObj.setDate(dateObj.getDate() + daysUntil); }
    }
    if (daysUntil === null || isNaN(daysUntil)) return { empty: true };
    return { empty: false, name: wasteConfig.name, icon: wasteConfig.icon, color: wasteConfig.color, daysUntil, date: dateObj };
  }

  _formatDays(days, date) {
    const dayName = date.toLocaleDateString('pl-PL', { weekday: 'long' });
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const dateStr = `${date.getDate()}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    if (days < 0) return 'Przeterminowane';
    if (days === 0) return `Dziś, ${capitalizedDay} (${dateStr})`;
    if (days === 1) return `Jutro, ${capitalizedDay} (${dateStr})`;
    return `${capitalizedDay}, za ${days} dni (${dateStr})`;
  }

  _render() {
    const items = (this._config.waste_types ?? []).map(w => this._parseWaste(w)).filter(w => !w.empty).sort((a, b) => a.daysUntil - b.daysUntil);
    if (!items.length) return;

    const minDays = items[0].daysUntil;
    const nextItems = items.filter(i => i.daysUntil === minDays);
    const upcomingItems = items.filter(i => i.daysUntil > minDays);
    const dayCounts = items.reduce((acc, i) => { acc[i.daysUntil] = (acc[i.daysUntil] || 0) + 1; return acc; }, {});

    this.shadowRoot.innerHTML = `
      <style>
        .card { background: linear-gradient(145deg, rgba(28,28,30,0.95) 0%, rgba(18,18,20,0.98) 100%); border-radius: 20px; padding: 18px; color: white; font-family: -apple-system, sans-serif; border: 1px solid rgba(255,255,255,0.08); }
        
        /* FIX NAGŁÓWKA */
        .header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .header-ic { width: 32px; height: 32px; border-radius: 10px; background: rgba(142,142,147,0.15); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: #8E8E93; }
        .header-ic svg { width: 16px; height: 16px; }
        .header-title { font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.9); }

        .next-box { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 15px; border: 1px solid rgba(255,255,255,0.1); }
        .upcoming-item { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(255,255,255,0.06); }
        .multi { border-width: 2px; }
        .icon-l { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .icon-s { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .icon-l svg { width: 28px; height: 28px; } .icon-s svg { width: 18px; height: 18px; }
        .name-l { font-size: 18px; font-weight: 600; letter-spacing: -0.5px; } .name-s { font-size: 14px; font-weight: 500; }
        .time { font-size: 12px; opacity: 0.5; margin-top: 1px; }
        .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.4; margin: 15px 0 8px 5px; font-weight: 700; }
      </style>

      <div class="card">
        <div class="header">
          <div class="header-ic">${ICONS['trash-2']}</div>
          <div class="header-title">${this._config.title || 'Wywóz śmieci'}</div>
        </div>
        
        <div class="section-label">Najbliższe</div>
        ${nextItems.map(item => `
          <div class="next-box ${dayCounts[item.daysUntil] > 1 ? 'multi' : ''}" style="${dayCounts[item.daysUntil] > 1 ? `border-color: ${this._hexToRgba(item.color, 0.6)}` : ''}">
            <div class="icon-l" style="background: ${this._hexToRgba(item.color, 0.2)}; color: ${item.color}; border: 1px solid ${this._hexToRgba(item.color, 0.4)}">${ICONS[item.icon] || ICONS['trash-2']}</div>
            <div class="info">
              <div class="name-l">${item.name}</div>
              <div class="time" style="font-size: 13px;">${this._formatDays(item.daysUntil, item.date)}</div>
            </div>
          </div>
        `).join('')}

        ${upcomingItems.length ? `<div class="section-label">Kolejne wywozy</div>` : ''}
        ${upcomingItems.map(item => `
          <div class="upcoming-item ${dayCounts[item.daysUntil] > 1 ? 'multi' : ''}" style="${dayCounts[item.daysUntil] > 1 ? `border-color: ${this._hexToRgba(item.color, 0.5)}` : ''}">
            <div class="icon-s" style="background: ${this._hexToRgba(item.color, 0.15)}; color: ${item.color};">${ICONS[item.icon] || ICONS['trash-2']}</div>
            <div class="info">
              <div class="name-s">${item.name}</div>
              <div class="time">${this._formatDays(item.daysUntil, item.date)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  _hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}
customElements.define('waste-schedule-apple-card', WasteScheduleAppleCard);