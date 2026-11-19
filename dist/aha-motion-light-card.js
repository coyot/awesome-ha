/**
 * aha-motion-light-card.js
 * Karta dla czujnika ruchu + natężenia światła (np. Zigbee PIR+LUX)
 *
 * Ikona i glow uwzględniają porę dnia, warunki pogodowe i źródło światła
 * (naturalne vs sztuczne — lampa).
 *
 * Config:
 *   entity:              (required) binary_sensor.* — occupancy/motion
 *   illuminance_entity:  (optional) auto z entity id
 *   battery_entity:      (optional) auto z entity id
 *   daylight_entity:     (optional) sensor dający 0-100% — def: sensor.swiatlo_pora_dnia
 *   outdoor_lux_entity:  (optional) sensor lux zewn.    — def: sensor.stacja_pogodowa_solar_lux
 *   max_natural_lux:     (optional) max lux naturalny w tym pomieszczeniu (def: 50)
 *                         — kalibracja: obserwuj max indoor lux bez lampy w pełnym słońcu
 *   name:                (optional) override nazwy
 *
 * Usage:
 *   type: custom:aha-motion-light-card
 *   entity: binary_sensor.ruch_i_swiatlo_gora
 *   name: Ruch i światło
 */

const _ML_STYLES = `
  :host { display: block; width: 100%; height: 100%; }

  @keyframes ml-card-pulse {
    0%, 100% { box-shadow: 0 0 0 0px rgba(var(--lux-rgb), 0); }
    50%       { box-shadow: 0 0 0 5px rgba(var(--lux-rgb), 0.20); }
  }

  @keyframes ml-glow-pulse {
    0%, 100% { filter: brightness(1.0) saturate(1.0); }
    50%       { filter: brightness(1.65) saturate(1.3); }
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
    transition: transform 0.15s ease, border-color 0.5s ease;
  }
  .card:active { transform: scale(0.96); }
  .card.motion { animation: ml-card-pulse 2.5s ease-in-out infinite; }

  .glow {
    position: absolute; inset: 0; pointer-events: none;
    border-radius: 19px; transition: background 0.6s ease;
  }

  .state-label {
    position: absolute; top: 10px; left: 0; right: 0; z-index: 5;
    text-align: center; pointer-events: none;
    font-size: 9px; font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase;
    transition: color 0.4s ease, opacity 0.4s ease;
    color: rgba(255,255,255,0.28);
  }
  .card.motion .state-label { color: rgba(239,159,39,0.95); }

  .icon-area {
    flex: 1; display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 2;
  }

  .icon-bg {
    width: 54px; height: 54px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.6s ease, box-shadow 0.6s ease;
  }
  .card.motion .icon-bg { animation: ml-glow-pulse 2.5s ease-in-out infinite; }

  ha-icon { --mdc-icon-size: 28px; transition: color 0.5s ease; }

  /* Source badge — małe "LAMPA" nad wartością gdy lampa zapalona */
  .source-badge {
    position: absolute; bottom: 44px; left: 0; right: 0; z-index: 6;
    text-align: center; pointer-events: none;
    font-size: 8px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: opacity 0.4s ease, color 0.4s ease;
    opacity: 0;
  }
  .source-badge.visible { opacity: 1; }

  .lux-row {
    display: flex; align-items: baseline; justify-content: center; gap: 3px;
    position: relative; z-index: 2; flex-shrink: 0; padding-bottom: 2px;
  }
  .lux-value {
    font-size: 18px; font-weight: 600; line-height: 1;
    transition: color 0.5s ease;
  }
  .lux-unit {
    font-size: 10px; font-weight: 500;
    color: rgba(255,255,255,0.38); padding-bottom: 1px;
  }

  .name {
    text-align: center; font-size: 12px; font-weight: 600;
    color: rgba(255,255,255,0.65); white-space: normal;
    word-break: break-word; padding-bottom: 4px;
    position: relative; z-index: 2; flex-shrink: 0;
  }

  .bat-wrap {
    position: absolute; top: 9px; right: 10px; z-index: 12;
    display: flex; align-items: center; gap: 5px;
  }
  .bat-tip {
    font-size: 10px; font-weight: 600; color: rgba(255,255,255,.80);
    background: rgba(12,20,36,.95); border: .5px solid rgba(255,255,255,.15);
    border-radius: 6px; padding: 2px 6px; white-space: nowrap;
    opacity: 0; pointer-events: none; transition: opacity .15s;
  }
  .bat-wrap:hover .bat-tip { opacity: 1; }
`;

/* ── Light source profiles ─────────────────────────────────────────────────
 * Każdy profil opisuje jedno "środowisko świetlne":
 *   source  — skąd pochodzi światło (do badging)
 *   icon    — MDI icon
 *   r,g,b   — kolor akcentu (glow, ikona)
 */
const _ML_PROFILES = {
  dark_night:    { source: 'natural', icon: 'mdi:weather-night',          r:  58, g:  88, b: 180 },
  dusk:          { source: 'natural', icon: 'mdi:weather-sunset-down',    r: 215, g: 125, b:  55 },
  cloudy:        { source: 'natural', icon: 'mdi:weather-cloudy',         r: 145, g: 160, b: 190 },
  partly_cloudy: { source: 'natural', icon: 'mdi:weather-partly-cloudy',  r: 195, g: 185, b: 145 },
  sunny:         { source: 'natural', icon: 'mdi:white-balance-sunny',    r: 252, g: 218, b:  65 },
  lamp:          { source: 'lamp',    icon: 'mdi:ceiling-light',          r: 255, g: 188, b:  58 },
};

/**
 * Klasyfikuje środowisko świetlne na podstawie:
 *  - indoorLux       — czujnik wewnętrzny
 *  - poraDnia        — 0–100 % (0=noc, 100=południe)
 *  - outdoorSolarLux — zewnętrzne natężenie słońca (może być null)
 *  - maxNatural      — max lux naturalny w pomieszczeniu (kalibracja)
 */
function _mlClassify(indoorLux, poraDnia, outdoorSolarLux, maxNatural) {
  if (indoorLux === null) return 'dark_night';

  const isNight   = poraDnia < 12;
  const isDusk    = poraDnia < 38;

  // Próg lampy: przy danej porze dnia, ile lux "naturalnych" spodziewamy się?
  //   naturalny max w pokoju = maxNatural * (poraDnia/100)^0.7
  const naturalExpected = maxNatural * Math.pow(Math.max(0, poraDnia) / 100, 0.7);
  const lampThreshold   = naturalExpected * 1.6 + 18; // 60% powyżej naturalnego + margin
  const lampOn          = indoorLux > lampThreshold;

  if (lampOn) return 'lamp';

  if (isNight) return 'dark_night';
  if (isDusk)  return 'dusk';

  // Dzień — jaka pogoda?
  if (outdoorSolarLux !== null) {
    if (outdoorSolarLux > 20000) return 'sunny';
    if (outdoorSolarLux > 6000)  return 'partly_cloudy';
    return 'cloudy';
  }

  // Fallback po indoor lux gdy brak danych outdoor
  if (indoorLux > 150) return 'sunny';
  if (indoorLux > 40)  return 'partly_cloudy';
  return 'cloudy';
}

/* Logarytmiczny rozmiar glowu: 0lx→2, 10lx→10, 100lx→20, 1000lx→30 (cap 34) */
function _mlGlowSize(lux) {
  if (!lux || lux <= 0) return 2;
  return Math.min(34, Math.max(2, Math.round(Math.log10(lux + 1) * 11)));
}

/* ── Card class ──────────────────────────────────────────────────────────── */

class AhaMotionLightCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) { this._build(); this._built = true; }
    this._update();
  }

  setConfig(config) {
    if (!config.entity) throw new Error('aha-motion-light-card: wymagane pole "entity"');
    this._config = config;
    const base = config.entity.replace(/^binary_sensor\./, 'sensor.');
    this._illuminanceEntity = config.illuminance_entity || (base + '_illuminance');
    this._batteryEntity     = config.battery_entity     || (base + '_battery');
    this._daylightEntity    = config.daylight_entity    || 'sensor.swiatlo_pora_dnia';
    this._outdoorLuxEntity  = config.outdoor_lux_entity || 'sensor.stacja_pogodowa_solar_lux';
    this._maxNatural        = config.max_natural_lux    || 50;
  }

  _build() {
    const shadow = this.shadowRoot;
    const style  = document.createElement('style');
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
      <div class="source-badge"></div>
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

    this._glowEl      = shadow.querySelector('.glow');
    this._iconBg      = shadow.querySelector('.icon-bg');
    this._haIcon      = shadow.querySelector('ha-icon');
    this._nameEl      = shadow.querySelector('.name');
    this._stateEl     = shadow.querySelector('.state-label');
    this._luxValEl    = shadow.querySelector('.lux-value');
    this._sourceBadge = shadow.querySelector('.source-badge');

    this._batWrap = document.createElement('div');
    this._batWrap.className = 'bat-wrap';
    this._batWrap.style.display = 'none';
    this._batWrap.innerHTML = `<div class="bat-tip"></div><svg width="18" height="9" viewBox="0 0 22 11"></svg>`;
    this._card.appendChild(this._batWrap);
    this._batTip = this._batWrap.querySelector('.bat-tip');
    this._batSvg = this._batWrap.querySelector('svg');
  }

  _readSensor(entityId) {
    const s = this._hass.states[entityId];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    const v = parseFloat(s.state);
    return isNaN(v) ? null : v;
  }

  _update() {
    if (!this._hass || !this._config) return;

    const occState = this._hass.states[this._config.entity];
    if (!occState) {
      this._nameEl.textContent  = this._config.entity;
      this._stateEl.textContent = 'brak danych';
      return;
    }

    const isMotion       = occState.state === 'on';
    const name           = this._config.name || occState.attributes.friendly_name || this._config.entity;
    const indoorLux      = this._readSensor(this._illuminanceEntity);
    const poraDnia       = this._readSensor(this._daylightEntity) ?? 50;   // fallback: południe
    const outdoorSolarLux = this._readSensor(this._outdoorLuxEntity);       // może być null

    // ── klasyfikacja środowiska świetlnego ──
    const profileKey = _mlClassify(indoorLux, poraDnia, outdoorSolarLux, this._maxNatural);
    const profile    = _ML_PROFILES[profileKey];
    const { r, g, b } = profile;
    const isLamp = profile.source === 'lamp';

    // ── glow intensity (0–1) — logarytmiczny z lux ──
    const intensity  = indoorLux !== null
      ? Math.min(1, Math.log10((indoorLux || 0) + 1) / Math.log10(1001))
      : 0;
    const glowSize   = _mlGlowSize(indoorLux);

    // ── card class ──
    this._card.className = `card ${isMotion ? 'motion' : 'idle'}`;
    this._card.style.setProperty('--lux-rgb', `${r},${g},${b}`);

    // ── state label ──
    if (isMotion) {
      this._stateEl.textContent = isLamp ? 'ruch · lampa' : 'ruch wykryty';
    } else {
      this._stateEl.textContent = isLamp ? 'lampa' : 'brak ruchu';
    }

    // ── source badge (widoczny przy lampie gdy brak ruchu, dyskretny) ──
    if (isLamp && !isMotion) {
      this._sourceBadge.textContent = '💡';
      this._sourceBadge.className = 'source-badge visible';
      this._sourceBadge.style.color = `rgba(${r},${g},${b},0.60)`;
    } else {
      this._sourceBadge.className = 'source-badge';
    }

    // ── icon ──
    this._haIcon.setAttribute('icon', profile.icon);
    this._haIcon.style.color = `rgb(${r},${g},${b})`;

    // ── icon-bg glow ──
    const bgOpacity   = 0.06 + intensity * 0.20;
    const glowOpacity = (isMotion ? 0.45 : 0.28) + intensity * 0.25;
    const spread      = Math.round(glowSize * 0.35);

    this._iconBg.style.background = indoorLux !== null
      ? `rgba(${r},${g},${b},${bgOpacity.toFixed(2)})`
      : 'rgba(142,142,147,0.10)';
    this._iconBg.style.boxShadow = (indoorLux !== null && indoorLux > 0)
      ? `0 0 ${glowSize}px ${spread}px rgba(${r},${g},${b},${glowOpacity.toFixed(2)})`
      : 'none';

    // ── card background radial overlay ──
    const overlayOp = intensity * (isMotion ? 0.14 : 0.08);
    this._glowEl.style.background = (indoorLux !== null && indoorLux > 0)
      ? `radial-gradient(ellipse at 50% 65%, rgba(${r},${g},${b},${overlayOp.toFixed(2)}) 0%, transparent 70%)`
      : 'none';

    // ── card border ──
    const borderOp = isMotion
      ? 0.18 + intensity * 0.18
      : 0.03 + intensity * 0.10;
    this._card.style.borderColor = indoorLux !== null
      ? `rgba(${r},${g},${b},${borderOp.toFixed(2)})`
      : 'rgba(255,255,255,0.06)';

    // ── lux value ──
    this._luxValEl.style.color = indoorLux !== null
      ? `rgba(${r},${g},${b},${(0.70 + intensity * 0.30).toFixed(2)})`
      : 'rgba(255,255,255,0.75)';
    this._luxValEl.textContent = indoorLux !== null ? Math.round(indoorLux) : '—';

    this._nameEl.textContent = name;
    this._updateBattery();
  }

  _updateBattery() {
    const s = this._hass.states[this._batteryEntity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') {
      this._batWrap.style.display = 'none'; return;
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
  description: 'Czujnik ruchu i światła — ikona uwzględnia porę dnia, pogodę i źródło światła',
  preview:     true,
});
