/**
 * aha-motion-light-card.js
 * Karta dla czujnika ruchu + natężenia światła (np. Zigbee PIR+LUX)
 *
 * Config:
 *   entity:              (required) binary_sensor.* — occupancy/motion
 *   illuminance_entity:  (optional) sensor.* lux — domyślnie auto z entity id
 *   battery_entity:      (optional) sensor.* battery — domyślnie auto
 *   name:                (optional) override nazwy
 *
 * Stany:
 *   idle        → brak ruchu, kolor neutralny
 *   motion      → wykryto ruch, kolor amber + pulsing box-shadow
 *
 * Rejestracja:
 *   type: custom:aha-motion-light-card
 *   entity: binary_sensor.ruch_i_swiatlo_gora
 *   name: Ruch i światło
 */

const _ML_STYLES = `
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }

  @keyframes motion-pulse {
    0%, 100% {
      box-shadow: 0 0 0 0px rgba(239,159,39,0);
    }
    50% {
      box-shadow: 0 0 0 5px rgba(239,159,39,0.18);
    }
  }

  @keyframes icon-breathe {
    0%, 100% { transform: scale(1);    opacity: 1; }
    50%       { transform: scale(1.08); opacity: 0.88; }
  }

  .card {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 20px;
    padding: 10px 10px 8px;
    display: flex;
    flex-direction: column;
    position: relative;
    cursor: pointer;
    transition: transform 0.15s ease, border-color 0.4s ease, background 0.4s ease, box-shadow 0.4s ease;
    border: 1px solid rgba(255,255,255,0.06);
    box-sizing: border-box;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  .card:active {
    transform: scale(0.96);
  }

  /* ── idle ── */
  .card.idle {
    background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
  }
  .card.idle .glow {
    background: none;
  }

  /* ── motion ── */
  .card.motion {
    background: linear-gradient(150deg, #1a1205 0%, #1f1708 100%);
    border-color: rgba(239,159,39,0.22);
    animation: motion-pulse 2.5s ease-in-out infinite;
  }
  .card.motion .glow {
    background: radial-gradient(ellipse at 30% 30%, rgba(239,159,39,0.13) 0%, transparent 68%);
  }

  /* Glow overlay */
  .glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: 19px;
    transition: background 0.4s ease;
  }

  /* State label — top-center */
  .state-label {
    position: absolute;
    top: 10px; left: 0; right: 0;
    z-index: 5;
    text-align: center;
    pointer-events: none;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: color 0.4s ease, opacity 0.4s ease;
  }
  .idle   .state-label { color: rgba(255,255,255,0.28); }
  .motion .state-label { color: rgba(239,159,39,0.95); }

  /* Icon area */
  .icon-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
  }

  .icon-bg {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.4s ease;
  }
  .idle   .icon-bg { background: rgba(142,142,147,0.12); }
  .motion .icon-bg { background: rgba(239,159,39,0.18); }

  ha-icon {
    --mdc-icon-size: 28px;
    transition: color 0.4s ease;
  }
  .idle   ha-icon { color: #8e8e93; }
  .motion ha-icon {
    color: #EF9F27;
    animation: icon-breathe 2.5s ease-in-out infinite;
  }

  /* Illuminance row */
  .lux-row {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 3px;
    position: relative;
    z-index: 2;
    flex-shrink: 0;
    padding-bottom: 2px;
  }
  .lux-value {
    font-size: 18px;
    font-weight: 600;
    transition: color 0.4s ease;
    line-height: 1;
  }
  .idle   .lux-value { color: rgba(255,255,255,0.75); }
  .motion .lux-value { color: #EF9F27; }

  .lux-unit {
    font-size: 10px;
    font-weight: 500;
    color: rgba(255,255,255,0.38);
    padding-bottom: 1px;
  }

  /* Name */
  .name {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.65);
    white-space: normal;
    word-break: break-word;
    padding-bottom: 4px;
    position: relative;
    z-index: 2;
    flex-shrink: 0;
  }

  /* Battery — top right, pokazuje zawsze (mała ikona) gdy < 25% */
  .bat-wrap {
    position: absolute; top: 9px; right: 10px; z-index: 12;
    display: flex; align-items: center; gap: 5px;
  }
  .bat-tip {
    font-size: 10px; font-weight: 600;
    color: rgba(255,255,255,.80);
    background: rgba(12,20,36,.95);
    border: .5px solid rgba(255,255,255,.15);
    border-radius: 6px; padding: 2px 6px;
    white-space: nowrap; opacity: 0; pointer-events: none;
    transition: opacity .15s;
  }
  .bat-wrap:hover .bat-tip { opacity: 1; }
`;

/* SVG icons — sun levels */
const _ML_ICONS = {
  motion_bright:  'mdi:motion-sensor',
  motion_dark:    'mdi:motion-sensor',
  idle_bright:    'mdi:white-balance-sunny',
  idle_dark:      'mdi:weather-night',
  idle_mid:       'mdi:brightness-5',
};

function _mlLuxIcon(isMotion, lux) {
  if (isMotion) return 'mdi:motion-sensor';
  if (lux === null) return 'mdi:motion-sensor-off';
  if (lux < 10)  return 'mdi:weather-night';
  if (lux < 100) return 'mdi:brightness-5';
  return 'mdi:white-balance-sunny';
}

class AhaMotionLightCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) {
      this._build();
      this._built = true;
    }
    this._update();
  }

  setConfig(config) {
    if (!config.entity) throw new Error('aha-motion-light-card: wymagane pole "entity"');
    this._config = config;

    // Auto-detect sibling entities based on entity id naming convention
    const base = config.entity.replace(/^binary_sensor\./, 'sensor.');
    this._illuminanceEntity = config.illuminance_entity || (base + '_illuminance');
    this._batteryEntity     = config.battery_entity     || (base + '_battery');
  }

  _build() {
    const shadow = this.shadowRoot;

    const style = document.createElement('style');
    style.textContent = _ML_STYLES;
    shadow.appendChild(style);

    this._card = document.createElement('div');
    this._card.className = 'card idle';
    this._card.innerHTML = `
      <div class="glow"></div>
      <div class="state-label">brak ruchu</div>
      <div class="icon-area">
        <div class="icon-bg">
          <ha-icon icon="mdi:motion-sensor-off"></ha-icon>
        </div>
      </div>
      <div class="lux-row">
        <span class="lux-value">—</span>
        <span class="lux-unit">lx</span>
      </div>
      <div class="name">—</div>
    `;

    this._card.addEventListener('click', () => {
      const e = new Event('hass-more-info', { bubbles: true, composed: true });
      e.detail = { entityId: this._config.entity };
      this.dispatchEvent(e);
    });

    shadow.appendChild(this._card);

    this._haIcon    = shadow.querySelector('ha-icon');
    this._nameEl    = shadow.querySelector('.name');
    this._stateEl   = shadow.querySelector('.state-label');
    this._luxValEl  = shadow.querySelector('.lux-value');

    // Battery widget
    this._batWrap = document.createElement('div');
    this._batWrap.className = 'bat-wrap';
    this._batWrap.style.display = 'none';
    this._batWrap.innerHTML = `<div class="bat-tip"></div><svg width="18" height="9" viewBox="0 0 22 11"></svg>`;
    this._card.appendChild(this._batWrap);
    this._batTip = this._batWrap.querySelector('.bat-tip');
    this._batSvg = this._batWrap.querySelector('svg');
  }

  _update() {
    if (!this._hass || !this._config) return;

    const occState = this._hass.states[this._config.entity];
    if (!occState) {
      this._nameEl.textContent  = this._config.entity;
      this._stateEl.textContent = 'brak danych';
      return;
    }

    const isMotion = occState.state === 'on';
    const name     = this._config.name || occState.attributes.friendly_name || this._config.entity;

    // Illuminance
    const luxState = this._hass.states[this._illuminanceEntity];
    const lux      = luxState && luxState.state !== 'unavailable' && luxState.state !== 'unknown'
                      ? parseFloat(luxState.state)
                      : null;

    const stateClass  = isMotion ? 'motion' : 'idle';
    const stateText   = isMotion ? 'ruch wykryty' : 'brak ruchu';
    const icon        = _mlLuxIcon(isMotion, lux);
    const luxDisplay  = lux !== null ? Math.round(lux) : '—';

    this._card.className         = `card ${stateClass}`;
    this._stateEl.textContent    = stateText;
    this._haIcon.setAttribute('icon', icon);
    this._luxValEl.textContent   = luxDisplay;
    this._nameEl.textContent     = name;

    this._updateBattery();
  }

  _updateBattery() {
    const s = this._hass.states[this._batteryEntity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') {
      this._batWrap.style.display = 'none';
      return;
    }
    const pct = parseFloat(s.state);
    if (pct >= 25) { this._batWrap.style.display = 'none'; return; }
    const low     = pct < 20;
    const col     = low ? '#E24B4A' : 'rgba(255,255,255,0.42)';
    const fillCol = low ? '#E24B4A' : 'rgba(255,255,255,0.50)';
    const fillW   = Math.round((Math.max(0, Math.min(100, pct)) / 100) * 13);
    this._batTip.textContent = Math.round(pct) + '%';
    this._batSvg.innerHTML = `
      <rect x="0.5" y="0.5" width="17" height="10" rx="2.5"
            fill="none" stroke="${col}" stroke-width="1.1"/>
      <rect x="18" y="3.5" width="2.5" height="4" rx="1" fill="${col}" opacity="0.7"/>
      ${fillW > 0 ? `<rect x="2" y="2" width="${fillW}" height="6" rx="1.5" fill="${fillCol}"/>` : ''}`;
    this._batWrap.style.display = '';
  }

  getCardSize() { return 2; }

  static getStubConfig() {
    return {
      entity: 'binary_sensor.ruch_i_swiatlo_gora',
      name:   'Ruch i światło',
    };
  }
}

customElements.define('aha-motion-light-card', AhaMotionLightCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-motion-light-card',
  name:        'Motion + Light Card',
  description: 'Karta czujnika ruchu i natężenia światła z animacją przy wykryciu ruchu',
  preview:     true,
});
