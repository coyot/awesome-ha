/**
 * climate-apple-card.js — kompaktowy kafelek, styl Apple Home
 * Ikonka dobierana automatycznie na podstawie obszaru (area) encji.
 *
 * UŻYCIE:
 *   type: custom:climate-apple-card
 *   entity: climate.salon
 *   name: Salon            # opcjonalne
 *   temp_sensor: sensor.X  # opcjonalne
 */

/* ------------------------------------------------------------------ */
/*  SVG paths dla typowych pomieszczeń                                 */
/* ------------------------------------------------------------------ */
const AREA_ICONS = {
  /* salon / living room */
  salon:        'M20 10.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v4.5A2.5 2.5 0 003 13v4h1v1a1 1 0 002 0v-1h12v1a1 1 0 002 0v-1h1v-4a2.5 2.5 0 00-1-2zm-2-4v4h-4V6h4zM6 6h4v4H6V6zm-1 9v-2a.5.5 0 011 0v2H5zm13 0v-2a.5.5 0 011 0v2h-1z',
  living:       'M20 10.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v4.5A2.5 2.5 0 003 13v4h1v1a1 1 0 002 0v-1h12v1a1 1 0 002 0v-1h1v-4a2.5 2.5 0 00-1-2zm-2-4v4h-4V6h4zM6 6h4v4H6V6zm-1 9v-2a.5.5 0 011 0v2H5zm13 0v-2a.5.5 0 011 0v2h-1z',
  lounge:       'M20 10.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v4.5A2.5 2.5 0 003 13v4h1v1a1 1 0 002 0v-1h12v1a1 1 0 002 0v-1h1v-4a2.5 2.5 0 00-1-2zm-2-4v4h-4V6h4zM6 6h4v4H6V6zm-1 9v-2a.5.5 0 011 0v2H5zm13 0v-2a.5.5 0 011 0v2h-1z',

  /* sypialnia / bedroom */
  sypialnia:    'M7 13V7a1 1 0 011-1h8a1 1 0 011 1v6h2V7a3 3 0 00-3-3H8a3 3 0 00-3 3v6H3v4h2v1h2v-1h10v1h2v-1h2v-4H7zm-2 2h14v2H5v-2z',
  bedroom:      'M7 13V7a1 1 0 011-1h8a1 1 0 011 1v6h2V7a3 3 0 00-3-3H8a3 3 0 00-3 3v6H3v4h2v1h2v-1h10v1h2v-1h2v-4H7zm-2 2h14v2H5v-2z',
  master:       'M7 13V7a1 1 0 011-1h8a1 1 0 011 1v6h2V7a3 3 0 00-3-3H8a3 3 0 00-3 3v6H3v4h2v1h2v-1h10v1h2v-1h2v-4H7zm-2 2h14v2H5v-2z',

  /* kuchnia / kitchen */
  kuchnia:      'M10 2v8H8V2H6v8a4 4 0 003 3.87V22h2v-8.13A4 4 0 0014 10V2h-2v8h-2zm8 0h-1v7h1a3 3 0 003-3V5a3 3 0 00-3-3zm0 2a1 1 0 011 1v3a1 1 0 01-1 1h-1V5l1-1z',
  kitchen:      'M10 2v8H8V2H6v8a4 4 0 003 3.87V22h2v-8.13A4 4 0 0014 10V2h-2v8h-2zm8 0h-1v7h1a3 3 0 003-3V5a3 3 0 00-3-3zm0 2a1 1 0 011 1v3a1 1 0 01-1 1h-1V5l1-1z',

  /* łazienka / bathroom */
  lazienka:     'M7 6a2 2 0 114 0 2 2 0 01-4 0zm10 5H4a2 2 0 00-2 2v2a6 6 0 005 5.92V22h2v-1h6v1h2v-1.08A6 6 0 0022 15v-2a2 2 0 00-2-2zm0 4a4 4 0 01-4 4H9a4 4 0 01-4-4v-2h12v2z',
  bathroom:     'M7 6a2 2 0 114 0 2 2 0 01-4 0zm10 5H4a2 2 0 00-2 2v2a6 6 0 005 5.92V22h2v-1h6v1h2v-1.08A6 6 0 0022 15v-2a2 2 0 00-2-2zm0 4a4 4 0 01-4 4H9a4 4 0 01-4-4v-2h12v2z',
  toaleta:      'M7 6a2 2 0 114 0 2 2 0 01-4 0zm10 5H4a2 2 0 00-2 2v2a6 6 0 005 5.92V22h2v-1h6v1h2v-1.08A6 6 0 0022 15v-2a2 2 0 00-2-2zm0 4a4 4 0 01-4 4H9a4 4 0 01-4-4v-2h12v2z',

  /* gabinet / office */
  gabinet:      'M20 3H4a2 2 0 00-2 2v12a2 2 0 002 2h6v2H8v2h8v-2h-2v-2h6a2 2 0 002-2V5a2 2 0 00-2-2zm0 14H4V5h16v12z',
  office:       'M20 3H4a2 2 0 00-2 2v12a2 2 0 002 2h6v2H8v2h8v-2h-2v-2h6a2 2 0 002-2V5a2 2 0 00-2-2zm0 14H4V5h16v12z',
  study:        'M20 3H4a2 2 0 00-2 2v12a2 2 0 002 2h6v2H8v2h8v-2h-2v-2h6a2 2 0 002-2V5a2 2 0 00-2-2zm0 14H4V5h16v12z',

  /* pokój dziecięcy */
  pokoj:        'M12 3a9 9 0 100 18A9 9 0 0012 3zm0 2a7 7 0 110 14A7 7 0 0112 5zm-1 3v5l4 2.5-.75-1.3L11 13V8h-1 1z',
  dziecko:      'M12 2a5 5 0 100 10A5 5 0 0012 2zm0 2a3 3 0 110 6 3 3 0 010-6zM6 20v-1a6 6 0 0112 0v1h2v-1a8 8 0 00-16 0v1h2z',
  child:        'M12 2a5 5 0 100 10A5 5 0 0012 2zm0 2a3 3 0 110 6 3 3 0 010-6zM6 20v-1a6 6 0 0112 0v1h2v-1a8 8 0 00-16 0v1h2z',
  nursery:      'M12 2a5 5 0 100 10A5 5 0 0012 2zm0 2a3 3 0 110 6 3 3 0 010-6zM6 20v-1a6 6 0 0112 0v1h2v-1a8 8 0 00-16 0v1h2z',

  /* przedpokój / hall */
  przedpokoj:   'M12 3L4 9v12h5v-7h6v7h5V9l-8-6z',
  hall:         'M12 3L4 9v12h5v-7h6v7h5V9l-8-6z',
  hallway:      'M12 3L4 9v12h5v-7h6v7h5V9l-8-6z',
  entryway:     'M12 3L4 9v12h5v-7h6v7h5V9l-8-6z',

  /* jadalnia / dining */
  jadalnia:     'M3 13h2v7H3v-7zm4-8h2v15H7V5zm4 3h2v12h-2V8zm4-5h2v17h-2V3zm4 5h2v12h-2V8z',
  dining:       'M3 13h2v7H3v-7zm4-8h2v15H7V5zm4 3h2v12h-2V8zm4-5h2v17h-2V3zm4 5h2v12h-2V8z',

  /* garaż / garage */
  garaz:        'M19 9l-7-6-7 6v11h5v-5h4v5h5V9z',
  garage:       'M19 9l-7-6-7 6v11h5v-5h4v5h5V9z',

  /* domyślna — termometr */
  _default:     'M15 13V5a3 3 0 00-6 0v8a5 5 0 106 0zm-3 5a3 3 0 110-6 3 3 0 010 6z',
};

function getIconPath(areaName) {
  if (!areaName) return AREA_ICONS._default;
  const normalized = areaName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');

  for (const [key, path] of Object.entries(AREA_ICONS)) {
    if (key === '_default') continue;
    if (normalized.includes(key)) return path;
  }
  return AREA_ICONS._default;
}

/* ------------------------------------------------------------------ */

class ClimateAppleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity) throw new Error('[climate-apple-card] Wymagane: entity');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() { return 1; }

  _getAreaName(entityId) {
    try {
      const entityReg = this._hass.entities?.[entityId];
      let areaId = entityReg?.area_id;

      if (!areaId) {
        const deviceId = entityReg?.device_id;
        if (deviceId) areaId = this._hass.devices?.[deviceId]?.area_id;
      }

      if (areaId) return this._hass.areas?.[areaId]?.name ?? null;
    } catch (_) {}
    return null;
  }

  _render() {
    if (!this._hass || !this._config) return;

    const entityId = this._config.entity;
    const state    = this._hass.states[entityId];

    if (!state) {
      this.shadowRoot.innerHTML = `<p style="padding:10px;color:#FF3B30;font-family:system-ui;font-size:12px;">Nie znaleziono: ${entityId}</p>`;
      return;
    }

    const attr       = state.attributes;
    const isOff      = state.state === 'off';
    const hvacAction = attr.hvac_action ?? (isOff ? 'off' : 'idle');
    const isHeating  = hvacAction === 'heating';
    const isCooling  = hvacAction === 'cooling';
    const isActive   = !isOff && (isHeating || isCooling);

    let currentTemp = attr.current_temperature;
    if (currentTemp == null && this._config.temp_sensor) {
      currentTemp = parseFloat(this._hass.states[this._config.temp_sensor]?.state);
    }
    if (currentTemp == null) {
      for (const g of [
        entityId.replace('climate.', 'sensor.') + '_temperature',
        entityId.replace('climate.', 'sensor.') + '_current_temperature',
      ]) {
        const v = parseFloat(this._hass.states[g]?.state);
        if (!isNaN(v)) { currentTemp = v; break; }
      }
    }
    const curDisplay = currentTemp != null ? Number(currentTemp).toFixed(1) : '--';

    const targetTemp = attr.temperature ?? 20;
    const name       = this._config.name ?? attr.friendly_name ?? entityId;
    const accentClr  = isCooling ? '#32ADE6' : '#FF9500';

    const areaName   = this._getAreaName(entityId);
    const iconPath   = getIconPath(areaName ?? name);

    let statusLabel = 'Wyłączony';
    if (!isOff) {
      if      (isHeating) statusLabel = 'Ogrzewanie';
      else if (isCooling) statusLabel = 'Chłodzenie';
      else                statusLabel = 'Osiągnięto';
    }

    this.shadowRoot.innerHTML = `
      <style>
        @keyframes pdot {
          0%,100% { opacity:1; transform:scale(1)   }
          50%      { opacity:.2; transform:scale(.55) }
        }
        @keyframes rise {
          0%   { transform:translateY(0) scale(1);     opacity:.8  }
          100% { transform:translateY(-45px) scale(2); opacity:0   }
        }

        :host { display:block; }

        .card {
          border-radius: 18px;
          padding: 12px 14px;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #E5E5EA;
          transition: background-color .5s cubic-bezier(.4,0,.2,1);
          font-family: -apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .card.on      { background: #FFE8B8; }
        .card.cooling { background: #C8E4FF; }

        @media (prefers-color-scheme: dark) {
          .card         { background: #2C2C2E; }
          .card.on      { background: #2D1E06; }
          .card.cooling { background: #0A1A2E; }
        }

        .particles { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
        .pt { position:absolute; border-radius:50%; opacity:0; }
        .card.heating .pt { background:#FF9500; animation:rise 2.4s ease-out infinite; }
        .card.cooling .pt { background:#5AC8FA; animation:rise 2.8s ease-out infinite; }
        .pt:nth-child(1) { width:7px;  height:7px;  bottom:14px; left:12%; animation-delay:0s;   }
        .pt:nth-child(2) { width:4px;  height:4px;  bottom:8px;  left:35%; animation-delay:.65s; }
        .pt:nth-child(3) { width:6px;  height:6px;  bottom:18px; left:58%; animation-delay:1.2s; }
        .pt:nth-child(4) { width:4px;  height:4px;  bottom:6px;  left:80%; animation-delay:1.9s; }

        .top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .ibadge {
          width: 34px; height: 34px; border-radius: 10px;
          background: #1C1C1E;
          display: flex; align-items: center; justify-content: center;
          color: #AEAEB2;
          transition: background-color .4s, color .4s;
          flex-shrink: 0;
        }
        .card.on .ibadge      { background: #3D2C0A; color: #FFD080; }
        .card.cooling .ibadge { background: #0C233A; color: #5AC8FA; }

        @media (prefers-color-scheme: dark) {
          .ibadge               { background: #000; color: #636366; }
          .card.on .ibadge      { background: #3D2C0A; color: #FFD080; }
          .card.cooling .ibadge { background: #061628; color: #5AC8FA; }
        }

        .sw {
          width: 38px; height: 22px; border-radius: 11px;
          background: #C7C7CC;
          position: relative; cursor: pointer;
          transition: background-color .22s;
          flex-shrink: 0;
        }
        .sw.on { background: #FF9500; }
        .card.cooling .sw.on { background: #32ADE6; }
        .sw-t {
          width: 18px; height: 18px; background: #fff; border-radius: 50%;
          position: absolute; top: 2px; left: 2px;
          transition: transform .22s cubic-bezier(.4,0,.2,1);
          box-shadow: 0 2px 4px rgba(0,0,0,.28);
        }
        .sw.on .sw-t { transform: translateX(16px); }

        @media (prefers-color-scheme: dark) {
          .sw { background: #48484A; }
        }

        .temp-cur {
          font-size: 36px; font-weight: 600; line-height: 1;
          color: #1C1C1E; letter-spacing: -1.5px;
          position: relative;
        }
        .temp-unit { font-size: 20px; font-weight: 400; color: #8E8E93; letter-spacing: 0; }

        @media (prefers-color-scheme: dark) {
          .temp-cur { color: #FFFFFF; }
        }

        .sub { font-size: 12px; color: #8E8E93; margin-top: 1px; }

        .bottom-row {
          display: flex;
          align-items: center;
          position: relative;
        }

        .status-txt  { font-size: 11px; color: #8E8E93; }

        .dots { display: flex; gap: 3px; align-items: center; margin-right: 4px; }
        .dot  {
          width: 4px; height: 4px; border-radius: 50%;
          display: inline-block;
          animation: pdot 1.1s ease-in-out infinite;
        }
      </style>

      <div class="card ${isOff ? '' : 'on'} ${isHeating ? 'heating' : ''} ${isCooling ? 'cooling' : ''}">

        <div class="particles">
          <div class="pt"></div><div class="pt"></div>
          <div class="pt"></div><div class="pt"></div>
        </div>

        <div class="top-row">
          <div class="ibadge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="${iconPath}"/>
            </svg>
          </div>
          <div class="sw ${isOff ? '' : 'on'}" id="sw"><div class="sw-t"></div></div>
        </div>

        <div>
          <div class="temp-cur">${curDisplay}<span class="temp-unit">°</span></div>
          <div class="sub">${name} · cel ${Number(targetTemp).toFixed(1)}°</div>
        </div>

        <div class="bottom-row">
          ${isActive ? `
            <div class="dots">
              <span class="dot" style="background:${accentClr}"></span>
              <span class="dot" style="background:${accentClr};animation-delay:.15s"></span>
              <span class="dot" style="background:${accentClr};animation-delay:.3s"></span>
            </div>
            <span class="status-txt" style="color:${accentClr}">${statusLabel}</span>
          ` : `<span class="status-txt">${statusLabel}</span>`}
        </div>

      </div>
    `;

    this.shadowRoot.getElementById('sw')?.addEventListener('click', () => {
      if (!this._hass) return;
      const s = this._hass.states[this._config.entity]?.state;
      this._hass.callService('climate', s === 'off' ? 'turn_on' : 'turn_off', {
        entity_id: this._config.entity,
      });
    });
  }
}

customElements.define('climate-apple-card', ClimateAppleCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'climate-apple-card',
  name:        'Climate Apple Card',
  preview:     false,
  description: 'Kompaktowy kafelek klimatu — ikonka z obszaru, styl Apple Home.',
});