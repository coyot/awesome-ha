/**
 * aha-motion-light-card.js
 * Karta dla czujnika ruchu + natężenia światła (np. Zigbee PIR+LUX)
 *
 * Ikona i glow uwzględniają porę dnia, warunki pogodowe i źródło światła.
 * Dwa chipy: źródło światła + czas od ostatniego ruchu.
 *
 * Config:
 *   entity:              (required) binary_sensor.* — occupancy/motion
 *   illuminance_entity:  (optional) auto z entity id
 *   battery_entity:      (optional) auto z entity id
 *   daylight_entity:     (optional) def: sensor.swiatlo_pora_dnia (0–100%)
 *   outdoor_lux_entity:  (optional) def: sensor.stacja_pogodowa_solar_lux
 *   max_natural_lux:     (optional) def: 50 — kalibracja pomieszczenia
 *   name:                (optional) override nazwy
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
    min-height: 160px;
    border-radius: 20px;
    padding: 10px 12px 10px;
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
    transition: transform 0.15s ease, border-color 0.4s ease;
  }
  .card:active { transform: scale(0.97); }
  .card.motion { animation: ml-card-pulse 2.5s ease-in-out infinite; }

  /* Radial glow overlay */
  .glow {
    position: absolute; inset: 0; pointer-events: none;
    border-radius: 19px; transition: background 0.4s ease;
  }

  /* State label — top-center */
  .state-label {
    position: absolute; top: 10px; left: 0; right: 0; z-index: 5;
    text-align: center; pointer-events: none;
    font-size: 9px; font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase;
    transition: color 0.4s ease;
    color: rgba(255,255,255,0.28);
  }
  .card.motion .state-label { color: rgba(239,159,39,0.95); }

  /* Icon area */
  .icon-area {
    flex: 1; display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 2;
    padding-top: 14px;
  }

  .icon-bg {
    width: 54px; height: 54px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.4s ease, box-shadow 0.4s ease;
  }
  .card.motion .icon-bg { animation: ml-glow-pulse 2.5s ease-in-out infinite; }

  ha-icon { --mdc-icon-size: 28px; transition: color 0.4s ease; }

  /* Pills row */
  .chips {
    display: flex; flex-direction: row; justify-content: center;
    align-items: center; gap: 5px;
    padding: 7px 0 4px;
    position: relative; z-index: 2; flex-shrink: 0;
    min-height: 24px;
  }

  .chip {
    display: inline-flex; align-items: center;
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 10px; font-weight: 600;
    letter-spacing: 0.03em;
    white-space: nowrap;
    transition: background 0.4s ease, color 0.4s ease, opacity 0.4s ease;
  }
  .chip.hidden { opacity: 0; pointer-events: none; }

  /* chip-source — kolor napędzany przez JS */
  .chip-source { }

  /* chip-time — zawsze muted */
  .chip-time {
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.45);
  }

  /* Lux row */
  .lux-row {
    display: flex; align-items: baseline; justify-content: center; gap: 3px;
    position: relative; z-index: 2; flex-shrink: 0;
    padding-bottom: 3px;
  }
  .lux-value {
    font-size: 20px; font-weight: 600; line-height: 1;
    transition: color 0.4s ease;
  }
  .lux-unit {
    font-size: 10px; font-weight: 500;
    color: rgba(255,255,255,0.38); padding-bottom: 2px;
  }

  /* Name */
  .name {
    text-align: center; font-size: 12px; font-weight: 600;
    color: rgba(255,255,255,0.65);
    padding-bottom: 2px;
    position: relative; z-index: 2; flex-shrink: 0;
  }

  /* Battery */
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

/* ── Light source profiles ─────────────────────────────────────────────── */
const _ML_PROFILES = {
  dark_night:    { source: 'natural', chipLabel: 'noc',      icon: 'mdi:weather-night',          r:  58, g:  88, b: 180 },
  dusk:          { source: 'natural', chipLabel: 'zmierzch', icon: 'mdi:weather-sunset-down',    r: 215, g: 125, b:  55 },
  cloudy:        { source: 'natural', chipLabel: 'chmury',   icon: 'mdi:weather-cloudy',         r: 145, g: 160, b: 190 },
  partly_cloudy: { source: 'natural', chipLabel: 'pochmurno',icon: 'mdi:weather-partly-cloudy',  r: 195, g: 185, b: 145 },
  sunny:         { source: 'natural', chipLabel: 'słońce',   icon: 'mdi:white-balance-sunny',    r: 252, g: 218, b:  65 },
  lamp:          { source: 'lamp',    chipLabel: 'lampa',    icon: 'mdi:ceiling-light',          r: 255, g: 188, b:  58 },
};

function _mlClassify(indoorLux, poraDnia, outdoorSolarLux, maxNatural) {
  if (indoorLux === null) return 'dark_night';

  const isNight = poraDnia < 12;
  const isDusk  = poraDnia < 38;

  // Próg lampy: naturalExpected * 1.6 + 18 lx margin
  const naturalExpected = maxNatural * Math.pow(Math.max(0, poraDnia) / 100, 0.7);
  const lampThreshold   = naturalExpected * 1.6 + 18;

  if (indoorLux > lampThreshold) return 'lamp';
  if (isNight) return 'dark_night';
  if (isDusk)  return 'dusk';

  // Dzień — outdoor decyduje
  if (outdoorSolarLux !== null) {
    if (outdoorSolarLux > 20000) return 'sunny';
    if (outdoorSolarLux > 6000)  return 'partly_cloudy';
    return 'cloudy';
  }

  // Fallback po indoor
  if (indoorLux > 150) return 'sunny';
  if (indoorLux > 40)  return 'partly_cloudy';
  return 'cloudy';
}

/* log10 glow size: 0lx→2, 10lx→10, 100lx→20, 1000lx→30 */
function _mlGlowSize(lux) {
  if (!lux || lux <= 0) return 2;
  return Math.min(34, Math.max(2, Math.round(Math.log10(lux + 1) * 11)));
}

/* Czas od timestampu → krótki string */
function _mlTimeSince(isoTs) {
  const diff = Math.floor((Date.now() - new Date(isoTs).getTime()) / 1000);
  if (diff < 60)   return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/* ── Card class ─────────────────────────────────────────────────────────── */

class AhaMotionLightCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._intervalId = null;
  }

  connectedCallback()    { this._intervalId = setInterval(() => this._updateTimeChip(), 15000); }
  disconnectedCallback() { clearInterval(this._intervalId); }

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
      <div class="chips">
        <span class="chip chip-source hidden">—</span>
        <span class="chip chip-time hidden">—</span>
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

    this._glowEl      = shadow.querySelector('.glow');
    this._iconBg      = shadow.querySelector('.icon-bg');
    this._haIcon      = shadow.querySelector('ha-icon');
    this._nameEl      = shadow.querySelector('.name');
    this._stateEl     = shadow.querySelector('.state-label');
    this._luxValEl    = shadow.querySelector('.lux-value');
    this._chipSource  = shadow.querySelector('.chip-source');
    this._chipTime    = shadow.querySelector('.chip-time');

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

    const isMotion        = occState.state === 'on';
    const name            = this._config.name || occState.attributes.friendly_name || this._config.entity;
    const indoorLux       = this._readSensor(this._illuminanceEntity);
    const poraDnia        = this._readSensor(this._daylightEntity) ?? 50;
    const outdoorSolarLux = this._readSensor(this._outdoorLuxEntity);

    // ── klasyfikacja ──
    const profileKey = _mlClassify(indoorLux, poraDnia, outdoorSolarLux, this._maxNatural);
    const profile    = _ML_PROFILES[profileKey];
    const { r, g, b } = profile;

    const intensity = indoorLux !== null
      ? Math.min(1, Math.log10((indoorLux || 0) + 1) / Math.log10(1001)) : 0;
    const glowSize  = _mlGlowSize(indoorLux);

    // ── card ──
    this._card.className = `card ${isMotion ? 'motion' : 'idle'}`;
    this._card.style.setProperty('--lux-rgb', `${r},${g},${b}`);

    // ── state label ──
    if (isMotion) {
      this._stateEl.textContent = profile.source === 'lamp' ? 'ruch · lampa' : 'ruch wykryty';
    } else {
      this._stateEl.textContent = profile.source === 'lamp' ? 'lampa' : 'brak ruchu';
    }

    // ── chip source (zawsze widoczny) ──
    this._chipSource.textContent = profile.chipLabel;
    this._chipSource.className   = 'chip chip-source';
    const chipBgOp  = 0.12 + intensity * 0.10;
    const chipColOp = 0.65 + intensity * 0.30;
    this._chipSource.style.background = `rgba(${r},${g},${b},${chipBgOp.toFixed(2)})`;
    this._chipSource.style.color      = `rgba(${r},${g},${b},${chipColOp.toFixed(2)})`;

    // ── chip time (od ostatniej zmiany stanu) ──
    this._lastChanged  = occState.last_changed;
    this._chipTimeMotion = isMotion;
    this._updateTimeChip();

    // ── icon ──
    this._haIcon.setAttribute('icon', profile.icon);
    this._haIcon.style.color = `rgb(${r},${g},${b})`;

    // ── icon-bg glow ──
    const bgOp    = 0.06 + intensity * 0.20;
    const glowOp  = (isMotion ? 0.45 : 0.28) + intensity * 0.25;
    const spread  = Math.round(glowSize * 0.35);
    this._iconBg.style.background = indoorLux !== null
      ? `rgba(${r},${g},${b},${bgOp.toFixed(2)})`
      : 'rgba(142,142,147,0.10)';
    this._iconBg.style.boxShadow = (indoorLux !== null && indoorLux > 0)
      ? `0 0 ${glowSize}px ${spread}px rgba(${r},${g},${b},${glowOp.toFixed(2)})`
      : 'none';

    // ── card bg overlay ──
    const overlayOp = intensity * (isMotion ? 0.14 : 0.08);
    this._glowEl.style.background = (indoorLux !== null && indoorLux > 0)
      ? `radial-gradient(ellipse at 50% 65%, rgba(${r},${g},${b},${overlayOp.toFixed(2)}) 0%, transparent 70%)`
      : 'none';

    // ── card border ──
    const borderOp = isMotion ? 0.18 + intensity * 0.18 : 0.03 + intensity * 0.10;
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

  _updateTimeChip() {
    if (!this._lastChanged) return;
    const timeStr  = _mlTimeSince(this._lastChanged);
    const isMotion = this._chipTimeMotion;
    // Motion: "od Xm" (jak długo trwa), idle: "Xm temu" (kiedy skończyło)
    this._chipTime.textContent = isMotion ? `od ${timeStr}` : `${timeStr} temu`;
    this._chipTime.className   = 'chip chip-time';
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
  description: 'Czujnik ruchu i światła — glow z lux, chips źródła i czasu ruchu',
  preview:     true,
});
