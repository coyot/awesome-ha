/**
 * kosiarka-slim-card.js
 * Kompaktowa karta dla lawn_mower (Worx Landroid i inne).
 * Styl spójny z vacuum.yaml i ac.yaml:
 *   4px color-bar | treść (nazwa + badge + chipsy + pasek baterii) | bateria%
 *
 * Config:
 *   entity:      (required) lawn_mower.*
 *   name:        (optional) override nazwy
 *
 * Rejestracja:
 *   type: custom:aha-kosiarka-slim-card
 *   lub: type: custom:kosiarka-slim-card
 */

class KosiarkaSlimCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity) throw new Error('kosiarka-slim-card: brak pola "entity"');
    this._config = {
      ...config,
      battery_entity:    config.battery_entity    || null,
      party_mode_entity: config.party_mode_entity || null,
      error_entity:      config.error_entity      || null,
    };
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _stateColor(state) {
    const map = {
      mowing:    '#97C459',
      docking:   '#85B7EB',
      returning: '#85B7EB',
      charging:  '#EF9F27',
      paused:    '#EF9F27',
      docked:    '#5F5E5A',
      error:     '#E24B4A',
      idle:      '#5F5E5A',
    };
    return map[state] || '#5F5E5A';
  }

  _stateLabel(state) {
    const map = {
      mowing:      'kosi',
      docking:     'wraca',
      returning:   'wraca',
      charging:    'ładuje się',
      paused:      'pauza',
      docked:      'w bazie',
      error:       'błąd',
      idle:        'czeka',
      unknown:     'nieznany',
      unavailable: 'niedostępna',
    };
    return map[state] || state;
  }

  _render() {
    const cfg   = this._config;
    const hass  = this._hass;
    if (!hass) return;

    const stateObj = hass.states[cfg.entity];
    const name = cfg.name || stateObj?.attributes?.friendly_name || cfg.entity;

    if (!stateObj) {
      this.shadowRoot.innerHTML = `
        <style>:host{display:block;}</style>
        <div style="padding:14px 16px;background:#1c1c1e;border-radius:16px;
                    font-family:-apple-system,system-ui,sans-serif;
                    color:#636366;font-size:13px;">
          Encja nie znaleziona: <code>${cfg.entity}</code>
        </div>`;
      return;
    }

    const state   = stateObj.state || 'unknown';
    const attrs   = stateObj.attributes || {};
    const zone    = attrs.zone ?? attrs.current_zone ?? null;

    // Battery: dedicated sensor → attribute fallback
    let battery = attrs.battery_level ?? attrs.battery ?? null;
    if (cfg.battery_entity) {
      const bs = hass.states[cfg.battery_entity];
      if (bs && bs.state !== 'unavailable' && bs.state !== 'unknown') {
        const v = parseFloat(bs.state);
        if (!isNaN(v)) battery = v;
      }
    }

    // Error: dedicated sensor → attribute fallback
    let error = attrs.error ?? attrs.error_description ?? null;
    if (cfg.error_entity) {
      const es = hass.states[cfg.error_entity];
      if (es && es.state !== 'unavailable' && es.state !== 'unknown' && es.state !== '0' && es.state !== 'none') {
        error = es.state;
      }
    }

    // Party mode
    let partyMode = false;
    if (cfg.party_mode_entity) {
      const ps = hass.states[cfg.party_mode_entity];
      if (ps) partyMode = ps.state === 'on';
    }

    const color   = this._stateColor(state);
    const label   = this._stateLabel(state);

    const isMowing   = state === 'mowing';
    const isReturning = state === 'docking' || state === 'returning';
    const isCharging = state === 'charging';
    const isActive   = isMowing || isReturning;
    const isError    = state === 'error';

    const batPct   = battery !== null ? Math.round(battery) : null;
    const batColor = batPct === null ? '#5F5E5A'
                   : batPct > 50    ? '#97C459'
                   : batPct > 20    ? '#EF9F27'
                   :                  '#E24B4A';
    const barGrad  = batPct === null ? 'rgba(255,255,255,0.08)'
                   : batPct > 50    ? 'linear-gradient(90deg,#5F8932,#97C459)'
                   : batPct > 20    ? 'linear-gradient(90deg,#9A5230,#EF9F27)'
                   :                  'linear-gradient(90deg,#8F2320,#E24B4A)';

    // Pulse animation when active
    const pulseColor = isMowing ? '151,196,89' : isReturning ? '133,183,235' : null;

    // SVG ikona kosiarki — animowana gdy kosi, kierunkowa gdy wraca
    const svgMowing = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"
        style="flex-shrink:0;animation:slim-mow 1.8s ease-in-out infinite;">
      <rect x="3" y="7" width="14" height="8" rx="3" stroke="#97C459" stroke-width="1.3"/>
      <circle cx="6.5" cy="15.5" r="1.8" fill="none" stroke="#97C459" stroke-width="1.2"/>
      <circle cx="13.5" cy="15.5" r="1.8" fill="none" stroke="#97C459" stroke-width="1.2"/>
      <path d="M8 7V5.5a2 2 0 0 1 4 0V7" stroke="#97C459" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M3 12 Q5 11 7 12" stroke="#97C459" stroke-width="0.9" stroke-opacity="0.5" fill="none"/>
    </svg>`;

    const svgReturning = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"
        style="flex-shrink:0;animation:slim-return 1.3s ease-in-out infinite alternate;">
      <rect x="3" y="7" width="14" height="8" rx="3" stroke="#85B7EB" stroke-width="1.3"/>
      <circle cx="6.5" cy="15.5" r="1.8" fill="none" stroke="#85B7EB" stroke-width="1.2"/>
      <circle cx="13.5" cy="15.5" r="1.8" fill="none" stroke="#85B7EB" stroke-width="1.2"/>
      <path d="M11 4 L8 7 L11 10" stroke="#85B7EB" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const svgDocked = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;">
      <rect x="3" y="7" width="14" height="8" rx="3" stroke="#5F5E5A" stroke-width="1.3"/>
      <circle cx="6.5" cy="15.5" r="1.8" fill="none" stroke="#5F5E5A" stroke-width="1.2"/>
      <circle cx="13.5" cy="15.5" r="1.8" fill="none" stroke="#5F5E5A" stroke-width="1.2"/>
      <circle cx="10" cy="11" r="1.5" fill="#97C459"/>
    </svg>`;

    const svgCharging = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"
        style="flex-shrink:0;animation:slim-charge 1.6s ease-in-out infinite;">
      <rect x="3" y="7" width="14" height="8" rx="3" stroke="#EF9F27" stroke-width="1.3"/>
      <circle cx="6.5" cy="15.5" r="1.8" fill="none" stroke="#EF9F27" stroke-width="1.2"/>
      <circle cx="13.5" cy="15.5" r="1.8" fill="none" stroke="#EF9F27" stroke-width="1.2"/>
      <path d="M11 7.5 L8.5 11 L10.5 11 L9 13.5" stroke="#EF9F27" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const svgPaused = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;">
      <rect x="3" y="7" width="14" height="8" rx="3" stroke="#EF9F27" stroke-width="1.3"/>
      <circle cx="6.5" cy="15.5" r="1.8" fill="none" stroke="#EF9F27" stroke-width="1.2"/>
      <circle cx="13.5" cy="15.5" r="1.8" fill="none" stroke="#EF9F27" stroke-width="1.2"/>
      <rect x="8.5" y="9" width="1.5" height="4" rx="0.5" fill="#EF9F27"/>
      <rect x="11" y="9" width="1.5" height="4" rx="0.5" fill="#EF9F27"/>
    </svg>`;

    const svgError = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;">
      <circle cx="10" cy="10" r="7" stroke="#E24B4A" stroke-width="1.3"/>
      <path d="M10 6.5 L10 11" stroke="#E24B4A" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="13.5" r="0.8" fill="#E24B4A"/>
    </svg>`;

    const svgIcon = isMowing    ? svgMowing
                  : isReturning ? svgReturning
                  : isCharging  ? svgCharging
                  : state === 'paused' ? svgPaused
                  : isError     ? svgError
                  :               svgDocked;

    // Badge — dot animowany gdy aktywny
    const dotBase = `width:5px;height:5px;border-radius:50%;flex-shrink:0;background:${color};`;
    const dotAnim = isActive ? `animation:slim-dot 1.8s ease-in-out infinite;` : '';
    const badgeBg = isActive    ? `rgba(${pulseColor},0.14)`
                  : isError     ? 'rgba(226,75,74,0.14)'
                  : isCharging  ? 'rgba(239,159,39,0.14)'
                  :               'rgba(95,94,90,0.12)';
    const badge = `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;
                                border-radius:99px;font-size:10px;font-weight:600;white-space:nowrap;
                                background:${badgeBg};color:${color};">
      <span style="${dotBase}${dotAnim}"></span>${label}</span>`;

    // Chipsy — strefa, party mode i błąd
    const chips = [];
    if (zone !== null && (isMowing || isReturning))
      chips.push({ label: `strefa ${zone}`, col: color, bg: `rgba(${pulseColor ?? '95,94,90'},0.10)` });
    if (partyMode)
      chips.push({ label: 'party', col: '#FF9F0A', bg: 'rgba(255,159,10,0.12)' });
    if (isError && error)
      chips.push({ label: error, col: '#E24B4A', bg: 'rgba(226,75,74,0.10)' });

    const chipsHTML = chips.map(c =>
      `<span style="font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;
                    background:${c.bg};color:${c.col};white-space:nowrap;">${c.label}</span>`
    ).join('');

    this.shadowRoot.innerHTML = `
<style>
  :host { display: block; }

  .card {
    background: #1c1c1e;
    border-radius: 16px;
    overflow: hidden;
    border: 0.5px solid rgba(255,255,255,0.08);
    font-family: -apple-system, system-ui, sans-serif;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    transition: border-color 0.4s ease;
  }
  .card.mowing   { border-color: rgba(151,196,89,0.35); animation: slim-pulse-mow 2.4s ease-in-out infinite; }
  .card.returning,
  .card.docking  { border-color: rgba(133,183,235,0.35); animation: slim-pulse-ret 2.4s ease-in-out infinite; }
  .card.charging { border-color: rgba(239,159,39,0.25); }
  .card.error    { border-color: rgba(226,75,74,0.35); }

  @keyframes slim-pulse-mow {
    0%,100% { box-shadow: 0 0 0 0 rgba(151,196,89,0); }
    50%     { box-shadow: 0 0 0 5px rgba(151,196,89,0.18); }
  }
  @keyframes slim-pulse-ret {
    0%,100% { box-shadow: 0 0 0 0 rgba(133,183,235,0); }
    50%     { box-shadow: 0 0 0 5px rgba(133,183,235,0.18); }
  }
  @keyframes slim-mow {
    0%,100% { transform: translateX(0) rotate(-1deg); }
    50%     { transform: translateX(2px) rotate(1deg); }
  }
  @keyframes slim-return {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-3px); }
  }
  @keyframes slim-charge {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.6; }
  }
  @keyframes slim-dot {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.2; }
  }

  .inner {
    display: grid;
    grid-template-columns: 4px 1fr auto;
    gap: 0 14px;
    align-items: stretch;
    padding: 14px 16px;
  }

  .bar { width: 4px; border-radius: 99px; align-self: stretch; }

  .body { display: flex; flex-direction: column; gap: 8px; min-width: 0; }

  .row-main { display: flex; align-items: center; gap: 8px; }

  .name {
    font-size: 13px; font-weight: 500; color: #F1EFE8;
    flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .chips { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

  .bat-wrap {
    display: flex; flex-direction: column;
    align-items: flex-end; justify-content: center;
    gap: 3px; min-width: 44px;
  }
  .bat-val {
    font-size: 20px; font-weight: 600; letter-spacing: -0.5px;
    line-height: 1;
  }
  .bat-label { font-size: 10px; color: rgba(255,255,255,0.28); }

  .bat-bar-wrap {
    display: flex; flex-direction: column; gap: 4px;
  }
  .bat-track {
    height: 3px; border-radius: 99px;
    background: rgba(255,255,255,0.07); overflow: hidden;
  }
  .bat-fill { height: 100%; border-radius: 99px; transition: width 1s ease; }
  .bat-meta {
    display: flex; justify-content: space-between;
  }
  .bat-meta span { font-size: 10px; color: rgba(255,255,255,0.28); }
</style>

<div class="card ${state}" id="card">
  <div class="inner">
    <div class="bar" style="background:${color};"></div>

    <div class="body">
      <div class="row-main">
        ${svgIcon}
        <span class="name">${name}</span>
        ${badge}
      </div>

      ${chips.length > 0 ? `<div class="chips">${chipsHTML}</div>` : ''}

      ${batPct !== null ? `
      <div class="bat-bar-wrap">
        <div class="bat-track">
          <div class="bat-fill" style="width:${batPct}%;background:${barGrad};"></div>
        </div>
        <div class="bat-meta">
          <span>${isCharging ? 'ładuje się' : isMowing ? 'kosi' : isReturning ? 'wraca do bazy' : 'bateria'}</span>
          <span>${batPct}%</span>
        </div>
      </div>` : ''}
    </div>

    <div class="bat-wrap">
      <span class="bat-val" style="color:${batColor};">${batPct !== null ? batPct + '%' : '—'}</span>
      <span class="bat-label">bateria</span>
    </div>
  </div>
</div>`;

    this.shadowRoot.getElementById('card')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: cfg.entity },
      }));
    });
  }

  getCardSize() { return 2; }

  static getConfigElement() { return document.createElement('div'); }

  static getStubConfig() {
    return {
      entity:            'lawn_mower.kosiarka',
      name:              'Kosiarka',
      battery_entity:    'sensor.kosiarka_battery',
      party_mode_entity: 'switch.s_party_mode',
      error_entity:      'sensor.kosiarka_error',
    };
  }
}

customElements.define('aha-kosiarka-slim-card', KosiarkaSlimCard);
if (!customElements.get('kosiarka-slim-card'))
  customElements.define('kosiarka-slim-card', class extends KosiarkaSlimCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-kosiarka-slim-card',
  name:        'Kosiarka Slim Card',
  description: 'Kompaktowa karta kosiarki w stylu ac/vacuum — 4px bar, badge, pasek baterii',
  preview:     true,
});
