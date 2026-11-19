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
 * Ikona i glow zawsze odzwierciedlają poziom oświetlenia (lux).
 * Przy wykryciu ruchu glow pulsuje i karta ma amber border.
 *
 * Usage:
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

  /* Card-level pulse — kolor napędzany przez --lux-r,g,b ustawiane z JS */
  @keyframes ml-card-pulse {
    0%, 100% { box-shadow: 0 0 0 0px rgba(var(--lux-rgb), 0); }
    50%       { box-shadow: 0 0 0 5px rgba(var(--lux-rgb), 0.20); }
  }

  /* Icon-bg brightness pulse przy ruchu */
  @keyframes ml-glow-pulse {
    0%, 100% { filter: brightness(1.0) saturate(1.0); }
    50%       { filter: brightness(1.6) saturate(1.3); }
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
    border: 1px solid rgba(255,255,255,0.06);
    box-sizing: border-box;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
    transition: transform 0.15s ease, border-color 0.5s ease, background 0.5s ease;
  }

  .card:active { transform: scale(0.96); }

  .card.motion {
    animation: ml-card-pulse 2.5s ease-in-out infinite;
  }

  /* Radial glow overlay — napędzany przez JS (background ustawiony inline) */
  .glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: 19px;
    transition: background 0.6s ease;
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
    color: rgba(255,255,255,0.28);
  }
  .card.motion .state-label {
    color: rgba(239,159,39,0.95);
  }

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
    /* background + box-shadow ustawiane z JS na bieżąco */
    transition: background 0.6s ease, box-shadow 0.6s ease;
  }

  .card.motion .icon-bg {
    animation: ml-glow-pulse 2.5s ease-in-out infinite;
  }

  ha-icon {
    --mdc-icon-size: 28px;
    /* color ustawiane z JS */
    transition: color 0.5s ease;
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
    line-height: 1;
    transition: color 0.5s ease;
  }
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

  /* Battery — top right, pokazuje gdy < 25% */
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

/* ── Lux profiles ─────────────────────────────────────────────────────────
 * Każdy poziom ma:
 *   icon  — MDI icon odzwierciedlający poziom oświetlenia
 *   r,g,b — kolor bazy dla glowu i akcentów
 *   label — czytelna etykieta poziomu (opcjonalnie do debugu)
 */
function _mlLuxProfile(lux) {
  if (lux === null || lux < 5)
    return { icon: 'mdi:weather-night',       r:  74, g: 127, b: 210 }; // nocny błękit
  if (lux < 50)
    return { icon: 'mdi:brightness-3',         r: 140, g: 120, b:  90 }; // zmierzch / ciepły brąz
  if (lux < 200)
    return { icon: 'mdi:brightness-5',         r: 200, g: 158, b:  60 }; // półmrok / amber
  if (lux < 800)
    return { icon: 'mdi:brightness-6',         r: 240, g: 196, b:  48 }; // jasno / żółty
  return   { icon: 'mdi:white-balance-sunny',  r: 252, g: 230, b:  90 }; // słonecznie / jasny żółty
}

/* Logarytmiczny rozmiar glowu: 0lx→2, 10lx→10, 100lx→20, 1000lx→30 (cap 34) */
function _mlGlowSize(lux) {
  if (!lux || lux <= 0) return 2;
  return Math.min(34, Math.max(2, Math.round(Math.log10(lux + 1) * 11)));
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
          <ha-icon icon="mdi:weather-night"></ha-icon>
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

    this._glowEl   = shadow.querySelector('.glow');
    this._iconBg   = shadow.querySelector('.icon-bg');
    this._haIcon   = shadow.querySelector('ha-icon');
    this._nameEl   = shadow.querySelector('.name');
    this._stateEl  = shadow.querySelector('.state-label');
    this._luxValEl = shadow.querySelector('.lux-value');

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

    const luxState = this._hass.states[this._illuminanceEntity];
    const lux      = luxState && luxState.state !== 'unavailable' && luxState.state !== 'unknown'
                      ? parseFloat(luxState.state) : null;

    const profile   = _mlLuxProfile(lux);
    const glowSize  = _mlGlowSize(lux);
    const { r, g, b } = profile;

    // Intensity 0–1 (logarithmic) — drives opacity of glows
    const intensity = lux !== null ? Math.min(1, Math.log10((lux || 0) + 1) / Math.log10(1001)) : 0;

    // ── card class ──
    this._card.className = `card ${isMotion ? 'motion' : 'idle'}`;

    // ── CSS custom property dla animacji card-level pulse ──
    this._card.style.setProperty('--lux-rgb', `${r},${g},${b}`);

    // ── state label ──
    this._stateEl.textContent = isMotion ? 'ruch wykryty' : 'brak ruchu';

    // ── icon ──
    this._haIcon.setAttribute('icon', profile.icon);
    this._haIcon.style.color = `rgb(${r},${g},${b})`;

    // ── icon-bg: tło + box-shadow glow (logarytmiczny) ──
    const bgOpacity   = 0.06 + intensity * 0.20;
    // przy braku lux — minimalne szare tło
    const bgColor = lux !== null
      ? `rgba(${r},${g},${b},${bgOpacity.toFixed(2)})`
      : 'rgba(142,142,147,0.10)';

    const glowOpacityBase = isMotion ? 0.45 : 0.28;
    const glowOpacity = glowOpacityBase + intensity * 0.25;
    const spread = Math.round(glowSize * 0.35);

    this._iconBg.style.background  = bgColor;
    this._iconBg.style.boxShadow   = lux !== null && lux > 0
      ? `0 0 ${glowSize}px ${spread}px rgba(${r},${g},${b},${glowOpacity.toFixed(2)})`
      : 'none';

    // ── card background radial glow overlay ──
    const overlayOpacity = intensity * (isMotion ? 0.14 : 0.08);
    this._glowEl.style.background = lux !== null && lux > 0
      ? `radial-gradient(ellipse at 50% 65%, rgba(${r},${g},${b},${overlayOpacity.toFixed(2)}) 0%, transparent 70%)`
      : 'none';

    // ── card border color ──
    const borderOpacity = isMotion
      ? 0.18 + intensity * 0.18
      : 0.03 + intensity * 0.10;
    this._card.style.borderColor = lux !== null
      ? `rgba(${r},${g},${b},${borderOpacity.toFixed(2)})`
      : 'rgba(255,255,255,0.06)';

    // ── lux value color ──
    this._luxValEl.style.color = lux !== null
      ? `rgba(${r},${g},${b},${(0.70 + intensity * 0.30).toFixed(2)})`
      : 'rgba(255,255,255,0.75)';
    this._luxValEl.textContent = lux !== null ? Math.round(lux) : '—';

    this._nameEl.textContent = name;
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
    return { entity: 'binary_sensor.ruch_i_swiatlo_gora', name: 'Ruch i światło' };
  }
}

customElements.define('aha-motion-light-card', AhaMotionLightCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-motion-light-card',
  name:        'Motion + Light Card',
  description: 'Karta czujnika ruchu i natężenia światła — glow skaluje się z luksami',
  preview:     true,
});
