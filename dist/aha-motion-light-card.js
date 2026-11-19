/**
 * aha-motion-light-card.js
 * Karta dla czujnika ruchu + natężenia światła (np. Zigbee PIR+LUX)
 *
 * Config:
 *   entity:              (required) binary_sensor.* — occupancy/motion
 *   illuminance_entity:  (optional) auto z entity id
 *   battery_entity:      (optional) auto z entity id
 *   daylight_entity:     (optional) def: sensor.swiatlo_pora_dnia (0–100%)
 *   outdoor_lux_entity:  (optional) def: sensor.stacja_pogodowa_solar_lux
 *   weather_entity:      (optional) encja pogody — ikona znacznika "dwór"
 *   max_natural_lux:     (optional) def: 50 — kalibracja pomieszczenia
 *   name:                (optional) override nazwy
 *   room:                (optional) nazwa pomieszczenia wyświetlana w stopce
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
    min-height: 180px;
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

  .glow {
    position: absolute; inset: 0; pointer-events: none;
    border-radius: 19px; transition: background 0.4s ease;
  }

  /* State label — top-center, tylko przy ruchu */
  .state-label {
    position: absolute; top: 10px; left: 0; right: 0; z-index: 5;
    text-align: center; pointer-events: none;
    font-size: 9px; font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: rgba(239,159,39,0.95);
    opacity: 0; transition: opacity 0.4s ease;
  }
  .card.motion .state-label { opacity: 1; }

  /* Icon area */
  .icon-area {
    flex: 1; display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 2; padding-top: 14px;
  }

  .icon-bg {
    width: 50px; height: 50px; border-radius: 15px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.4s ease, box-shadow 0.4s ease;
  }
  .card.motion .icon-bg { animation: ml-glow-pulse 2.5s ease-in-out infinite; }
  ha-icon { --mdc-icon-size: 26px; transition: color 0.4s ease; }

  /* ── Log-scale track ───────────────────────────────────── */
  .scale-wrap {
    position: relative;
    height: 28px;          /* tor 4px + markery ±12px centercenter */
    margin: 8px 4px 4px;
    flex-shrink: 0;
    z-index: 2;
  }

  .scale-track {
    position: absolute;
    top: 50%; left: 0; right: 0;
    height: 4px; border-radius: 2px;
    background: rgba(255,255,255,0.08);
    transform: translateY(-50%);
  }

  /* Segment między znacznikami */
  .scale-segment {
    position: absolute;
    top: 50%; height: 3px; border-radius: 2px;
    transform: translateY(-50%);
    transition: left 0.6s cubic-bezier(.2,.8,.2,1),
                width 0.6s cubic-bezier(.2,.8,.2,1),
                background 0.4s ease;
    pointer-events: none;
  }

  /* Tick marks: 10, 100, 1k, 10k lx */
  .scale-ticks {
    position: absolute; top: 0; left: 0; right: 0; height: 100%;
    pointer-events: none;
  }
  .scale-tick {
    position: absolute; top: calc(50% - 5px);
    width: 1px; height: 10px;
    background: rgba(255,255,255,0.12);
  }

  /* Markery */
  .scale-marker {
    position: absolute;
    top: 50%; transform: translate(-50%, -50%);
    width: 20px; height: 20px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    transition: left 0.6s cubic-bezier(.2,.8,.2,1),
                background 0.4s ease,
                top 0.3s ease;
    z-index: 4;
  }
  .scale-marker ha-icon { --mdc-icon-size: 11px; }

  .scale-marker-out {
    background: #2c2c3e;
    z-index: 3;
  }
  .scale-marker-out ha-icon { color: #a1a1a6; }

  /* Lux pill — prawo od tytułu, schowany gdy brak danych */
  .lux-pill {
    display: inline-flex; align-items: center;
    border-radius: 6px; padding: 2px 7px;
    font-size: 10px; font-weight: 600;
    position: absolute; top: 10px; right: 10px; z-index: 6;
    transition: background 0.4s ease, color 0.4s ease;
  }

  /* Railing chip — opcjonalny wskaźnik switch.porecz */
  .railing-chip {
    display: none;                        /* ukryty gdy brak railing_entity */
    align-items: center; gap: 4px;
    justify-content: center;
    padding: 2px 0 3px;
    position: relative; z-index: 2; flex-shrink: 0;
  }
  .railing-chip.visible { display: flex; }

  .railing-pill {
    display: inline-flex; align-items: center; gap: 4px;
    border-radius: 6px; padding: 3px 8px;
    font-size: 10px; font-weight: 600;
    transition: background 0.4s ease, color 0.4s ease, box-shadow 0.4s ease;
  }
  .railing-pill ha-icon { --mdc-icon-size: 11px; }

  .railing-pill.off {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.30);
  }
  .railing-pill.off ha-icon { color: rgba(255,255,255,0.25); }

  .railing-pill.on {
    background: rgba(255,159,10,0.15);
    color: rgba(255,159,10,0.90);
    box-shadow: 0 0 6px 1px rgba(255,159,10,0.12);
  }
  .railing-pill.on ha-icon { color: rgba(255,159,10,0.90); }

  /* Status text */
  .status-text {
    text-align: center; font-size: 10px; font-weight: 500;
    color: rgba(255,255,255,0.45);
    padding: 1px 0 2px;
    position: relative; z-index: 2; flex-shrink: 0;
    transition: color 0.4s ease;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .card.motion .status-text { color: rgba(130,180,255,0.80); }

  /* Name */
  .name {
    text-align: center; font-size: 12px; font-weight: 600;
    color: rgba(255,255,255,0.65);
    padding-bottom: 1px;
    position: relative; z-index: 2; flex-shrink: 0;
  }

  /* Footer: room · stan */
  .footer {
    text-align: center; font-size: 10px; font-weight: 500;
    color: rgba(255,255,255,0.32);
    padding-bottom: 3px;
    position: relative; z-index: 2; flex-shrink: 0;
    transition: color 0.4s ease;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .card.motion .footer { color: rgba(239,159,39,0.50); }

  /* Battery — zawsze widoczna, intensywność rośnie jak poziom spada */
  .bat-wrap {
    position: absolute; top: 30px; right: 10px; z-index: 12;
    display: flex; align-items: center; gap: 4px;
    transition: opacity 0.4s ease;
  }
  .bat-pct {
    font-size: 9px; font-weight: 600;
    background: rgba(12,20,36,.92); border: .5px solid rgba(255,255,255,.14);
    border-radius: 4px; padding: 1px 4px;
    pointer-events: none; transition: opacity .15s, color .3s, border-color .3s;
    opacity: 0;                          /* ukryty domyślnie, hover lub low pokazuje */
    color: rgba(255,255,255,.8);
  }
  .bat-wrap:hover .bat-pct            { opacity: 1; }
  .bat-wrap.bat-low   .bat-pct        { opacity: 1; color: #E24B4A; border-color: rgba(226,75,74,.35); }
  .bat-wrap.bat-warn  .bat-pct        { opacity: 1; color: #FF9F0A; border-color: rgba(255,159,10,.30); }
`;

/* ── Light profiles (kolor ikony + znacznika wewnętrznego) ─────────────── */
const _ML_PROFILES = {
  dark_night:    { chipLabel: 'noc',       icon: 'mdi:weather-night',          r:  58, g:  88, b: 180 },
  dusk:          { chipLabel: 'zmierzch',  icon: 'mdi:weather-sunset-down',    r: 215, g: 125, b:  55 },
  cloudy:        { chipLabel: 'chmury',    icon: 'mdi:weather-cloudy',         r: 145, g: 160, b: 190 },
  partly_cloudy: { chipLabel: 'pochmurno', icon: 'mdi:weather-partly-cloudy',  r: 195, g: 185, b: 145 },
  sunny:         { chipLabel: 'słońce',    icon: 'mdi:white-balance-sunny',    r: 252, g: 218, b:  65 },
  lamp:          { chipLabel: 'lampa',     icon: 'mdi:ceiling-light',          r: 255, g: 188, b:  58 },
};

/* Kolor znacznika "wewnątrz" wg poziomu lux */
function _mlMarkerColor(lux) {
  if (lux === null || lux < 10)  return { r:  94, g:  92, b: 230 }; // indygo
  if (lux < 100)                  return { r: 196, g: 138, b:  58 }; // przyg. bursztyn
  if (lux < 500)                  return { r: 255, g: 159, b:  10 }; // bursztyn
  return                                 { r: 255, g: 214, b:  10 }; // żółty
}

/* Mapowanie warunków pogodowych → ikona MDI */
const _ML_WEATHER_ICONS = {
  'clear-night':      'mdi:weather-night',
  'cloudy':           'mdi:weather-cloudy',
  'fog':              'mdi:weather-fog',
  'hail':             'mdi:weather-hail',
  'lightning':        'mdi:weather-lightning',
  'lightning-rainy':  'mdi:weather-lightning-rainy',
  'partlycloudy':     'mdi:weather-partly-cloudy',
  'pouring':          'mdi:weather-pouring',
  'rainy':            'mdi:weather-rainy',
  'snowy':            'mdi:weather-snowy',
  'snowy-rainy':      'mdi:weather-snowy-rainy',
  'sunny':            'mdi:weather-sunny',
  'windy':            'mdi:weather-windy',
  'windy-variant':    'mdi:weather-windy-variant',
  'exceptional':      'mdi:alert-circle-outline',
};

/* Logarytmiczna pozycja na osi (1–100 000 lx → 0–100%) */
function _mlLuxPos(lux) {
  if (!lux || lux <= 0) return 0;
  return Math.min(100, Math.log10(lux + 1) / 5 * 100);
}

/* Pozycje tick marks (stałe) */
const _ML_TICKS = [
  { lux: 10,    pos: _mlLuxPos(10) },
  { lux: 100,   pos: _mlLuxPos(100) },
  { lux: 1000,  pos: _mlLuxPos(1000) },
  { lux: 10000, pos: _mlLuxPos(10000) },
];

function _mlClassify(indoorLux, poraDnia, outdoorSolarLux, maxNatural) {
  if (indoorLux === null) return 'dark_night';
  const isNight = poraDnia < 12;
  const isDusk  = poraDnia < 38;
  const naturalExpected = maxNatural * Math.pow(Math.max(0, poraDnia) / 100, 0.7);
  const lampThreshold   = naturalExpected * 1.6 + 18;
  if (indoorLux > lampThreshold) return 'lamp';
  if (isNight) return 'dark_night';
  if (isDusk)  return 'dusk';
  if (outdoorSolarLux !== null) {
    if (outdoorSolarLux > 20000) return 'sunny';
    if (outdoorSolarLux > 6000)  return 'partly_cloudy';
    return 'cloudy';
  }
  if (indoorLux > 150) return 'sunny';
  if (indoorLux > 40)  return 'partly_cloudy';
  return 'cloudy';
}

/* Status tekstowy porównania środek vs dwór */
function _mlComparisonStatus(indoorLux, outdoorLux, isMotion, lastChanged) {
  let comparison;
  if (outdoorLux === null || outdoorLux < 10) {
    comparison = 'Na dworze ciemno';
  } else if (indoorLux === null) {
    comparison = 'Brak danych';
  } else {
    const ratio = indoorLux / outdoorLux;
    if (ratio < 0.5)  comparison = 'Ciemniej niż na dworze';
    else if (ratio <= 2.0) comparison = 'Podobnie jak na dworze';
    else comparison = 'Jaśniej niż na dworze';
  }
  if (isMotion) return `Ruch · ${comparison}`;
  if (lastChanged) {
    const diff = Math.floor((Date.now() - new Date(lastChanged).getTime()) / 1000);
    const t = diff < 60 ? `${diff}s` : diff < 3600 ? `${Math.floor(diff/60)}m` : `${Math.floor(diff/3600)}h`;
    return `${comparison} · ${t} temu`;
  }
  return comparison;
}

/* log10 glow size */
function _mlGlowSize(lux) {
  if (!lux || lux <= 0) return 2;
  return Math.min(34, Math.max(2, Math.round(Math.log10(lux + 1) * 11)));
}

/* ── Card ───────────────────────────────────────────────────────────────── */

class AhaMotionLightCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._intervalId = null;
  }

  connectedCallback()    { this._intervalId = setInterval(() => this._tickUpdate(), 15000); }
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
    this._weatherEntity     = config.weather_entity     || null;
    this._maxNatural        = config.max_natural_lux    || 50;
    this._room              = config.room               || null;
    this._railingEntity     = config.railing_entity     || null;
  }

  _build() {
    const shadow = this.shadowRoot;
    const style  = document.createElement('style');
    style.textContent = _ML_STYLES;
    shadow.appendChild(style);

    this._card = document.createElement('div');
    this._card.className = 'card idle';

    // Tick marks HTML (statyczne — pozycje się nie zmieniają)
    const ticksHtml = _ML_TICKS.map(t =>
      `<div class="scale-tick" style="left:${t.pos.toFixed(1)}%"></div>`
    ).join('');

    this._card.innerHTML = `
      <div class="glow"></div>
      <div class="state-label">ruch wykryty</div>
      <div class="lux-pill">— lx</div>
      <div class="icon-area">
        <div class="icon-bg">
          <ha-icon icon="mdi:weather-night"></ha-icon>
        </div>
      </div>
      <div class="scale-wrap">
        <div class="scale-ticks">${ticksHtml}</div>
        <div class="scale-track"></div>
        <div class="scale-segment"></div>
        <div class="scale-marker scale-marker-in">
          <ha-icon icon="mdi:home"></ha-icon>
        </div>
        <div class="scale-marker scale-marker-out">
          <ha-icon icon="mdi:white-balance-sunny"></ha-icon>
        </div>
      </div>
      <div class="railing-chip">
        <div class="railing-pill off">
          <ha-icon icon="mdi:led-strip-variant"></ha-icon>
          <span>poręcz</span>
        </div>
      </div>
      <div class="status-text">—</div>
      <div class="name">—</div>
      <div class="footer">—</div>
    `;

    this._card.addEventListener('click', () => {
      const e = new Event('hass-more-info', { bubbles: true, composed: true });
      e.detail = { entityId: this._config.entity };
      this.dispatchEvent(e);
    });

    shadow.appendChild(this._card);

    this._glowEl      = shadow.querySelector('.glow');
    this._iconBg      = shadow.querySelector('.icon-bg');
    this._haIcon      = shadow.querySelector('.icon-bg ha-icon');
    this._nameEl      = shadow.querySelector('.name');
    this._footerEl    = shadow.querySelector('.footer');
    this._stateEl     = shadow.querySelector('.state-label');
    this._statusEl    = shadow.querySelector('.status-text');
    this._railingChip = shadow.querySelector('.railing-chip');
    this._railingPill = shadow.querySelector('.railing-pill');
    this._luxPill     = shadow.querySelector('.lux-pill');
    this._scaleSegment = shadow.querySelector('.scale-segment');
    this._markerIn    = shadow.querySelector('.scale-marker-in');
    this._markerOut   = shadow.querySelector('.scale-marker-out');
    this._markerInIcon  = shadow.querySelector('.scale-marker-in ha-icon');
    this._markerOutIcon = shadow.querySelector('.scale-marker-out ha-icon');

    this._batWrap = document.createElement('div');
    this._batWrap.className = 'bat-wrap';
    this._batWrap.innerHTML = `<span class="bat-pct"></span><svg width="16" height="8" viewBox="0 0 22 11"></svg>`;
    this._card.appendChild(this._batWrap);
    this._batPct = this._batWrap.querySelector('.bat-pct');
    this._batSvg = this._batWrap.querySelector('svg');
  }

  _readSensor(entityId) {
    if (!entityId) return null;
    const s = this._hass.states[entityId];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    const v = parseFloat(s.state);
    return isNaN(v) ? null : v;
  }

  _update() {
    if (!this._hass || !this._config) return;

    const occState = this._hass.states[this._config.entity];
    if (!occState) {
      this._nameEl.textContent   = this._config.entity;
      this._statusEl.textContent = 'brak danych';
      return;
    }

    const isMotion        = occState.state === 'on';
    const name            = this._config.name || occState.attributes.friendly_name || this._config.entity;
    const indoorLux       = this._readSensor(this._illuminanceEntity);
    const poraDnia        = this._readSensor(this._daylightEntity) ?? 50;
    const outdoorSolarLux = this._readSensor(this._outdoorLuxEntity);

    // ── klasyfikacja ikony / koloru ──
    const profileKey = _mlClassify(indoorLux, poraDnia, outdoorSolarLux, this._maxNatural);
    const profile    = _ML_PROFILES[profileKey];
    const { r, g, b } = profile;
    const intensity  = indoorLux !== null
      ? Math.min(1, Math.log10((indoorLux || 0) + 1) / Math.log10(1001)) : 0;
    const glowSize   = _mlGlowSize(indoorLux);

    // ── card ──
    this._card.className = `card ${isMotion ? 'motion' : 'idle'}`;
    this._card.style.setProperty('--lux-rgb', `${r},${g},${b}`);

    // ── state label (top, motion only) ──
    this._stateEl.textContent = profile.chipLabel === 'lampa' ? 'ruch · lampa' : 'ruch wykryty';

    // ── lux pill (top right) ──
    this._luxPill.textContent = indoorLux !== null ? `${Math.round(indoorLux)} lx` : '— lx';
    this._luxPill.style.background = `rgba(${r},${g},${b},0.15)`;
    this._luxPill.style.color      = `rgba(${r},${g},${b},0.90)`;

    // ── icon (główna, z glowem) ──
    this._haIcon.setAttribute('icon', profile.icon);
    this._haIcon.style.color = `rgb(${r},${g},${b})`;
    const bgOp   = 0.06 + intensity * 0.20;
    const glowOp = (isMotion ? 0.45 : 0.28) + intensity * 0.25;
    const spread = Math.round(glowSize * 0.35);
    this._iconBg.style.background = indoorLux !== null
      ? `rgba(${r},${g},${b},${bgOp.toFixed(2)})` : 'rgba(142,142,147,0.10)';
    this._iconBg.style.boxShadow = (indoorLux !== null && indoorLux > 0)
      ? `0 0 ${glowSize}px ${spread}px rgba(${r},${g},${b},${glowOp.toFixed(2)})` : 'none';
    if (isMotion) this._iconBg.style.animationName = 'ml-glow-pulse';
    else          this._iconBg.style.animationName = 'none';

    // ── skala logarytmiczna ──
    this._updateScale(indoorLux, outdoorSolarLux, r, g, b);

    // ── status porównawczy ──
    this._lastChanged = occState.last_changed;
    this._isMotion    = isMotion;
    this._indoorLux   = indoorLux;
    this._outdoorLux  = outdoorSolarLux;
    this._statusEl.textContent = _mlComparisonStatus(indoorLux, outdoorSolarLux, isMotion, occState.last_changed);

    // ── card bg overlay ──
    const overlayOp = intensity * (isMotion ? 0.14 : 0.08);
    this._glowEl.style.background = (indoorLux !== null && indoorLux > 0)
      ? `radial-gradient(ellipse at 50% 65%, rgba(${r},${g},${b},${overlayOp.toFixed(2)}) 0%, transparent 70%)`
      : 'none';

    // ── card border ──
    const borderOp = isMotion ? 0.18 + intensity * 0.18 : 0.03 + intensity * 0.10;
    this._card.style.borderColor = indoorLux !== null
      ? `rgba(${r},${g},${b},${borderOp.toFixed(2)})` : 'rgba(255,255,255,0.06)';

    // ── name + footer ──
    this._nameEl.textContent = name;
    const stateStr = isMotion
      ? (profile.chipLabel === 'lampa' ? 'ruch · lampa' : 'ruch wykryty')
      : (profile.chipLabel === 'lampa' ? 'lampa' : 'brak ruchu');
    this._footerEl.textContent = this._room ? `${this._room} · ${stateStr}` : stateStr;

    this._updateRailing();
    this._updateBattery();
  }

  _updateScale(indoorLux, outdoorLux, r, g, b) {
    const posIn  = indoorLux  !== null ? _mlLuxPos(indoorLux)  : null;
    const posOut = outdoorLux !== null ? _mlLuxPos(outdoorLux) : null;

    // Znacznik "wewnątrz"
    if (posIn !== null) {
      const mc = _mlMarkerColor(indoorLux);
      this._markerIn.style.left       = `${posIn.toFixed(1)}%`;
      this._markerIn.style.background = `rgb(${mc.r},${mc.g},${mc.b})`;
      this._markerIn.style.display    = '';
      this._markerInIcon.style.color  = `rgba(${Math.round(mc.r*0.3)},${Math.round(mc.g*0.25)},${Math.round(mc.b*0.2)},1)`;
    } else {
      this._markerIn.style.display = 'none';
    }

    // Znacznik "dwór"
    if (posOut !== null) {
      this._markerOut.style.left   = `${posOut.toFixed(1)}%`;
      this._markerOut.style.display = '';
      // Ikona pogody jeśli dostępna
      const weatherIcon = this._getWeatherIcon();
      this._markerOutIcon.setAttribute('icon', weatherIcon);

      // Kolizja: jeśli markery bliżej niż 12%, przesuń outdoor w górę
      if (posIn !== null && Math.abs(posOut - posIn) < 12) {
        this._markerOut.style.top    = 'calc(50% - 10px)';
        this._markerOut.style.border = '2px solid #0d1828';
      } else {
        this._markerOut.style.top    = '50%';
        this._markerOut.style.border = 'none';
      }
    } else {
      this._markerOut.style.display = 'none';
    }

    // Segment między znacznikami
    if (posIn !== null && posOut !== null) {
      const left  = Math.min(posIn, posOut);
      const width = Math.abs(posOut - posIn);
      this._scaleSegment.style.left       = `${left.toFixed(1)}%`;
      this._scaleSegment.style.width      = `${width.toFixed(1)}%`;
      this._scaleSegment.style.background = `rgba(${r},${g},${b},0.35)`;
      this._scaleSegment.style.display    = '';
    } else {
      this._scaleSegment.style.display = 'none';
    }
  }

  _getWeatherIcon() {
    if (!this._weatherEntity) return 'mdi:white-balance-sunny';
    const s = this._hass.states[this._weatherEntity];
    if (!s) return 'mdi:white-balance-sunny';
    return _ML_WEATHER_ICONS[s.state] || 'mdi:weather-cloudy';
  }

  _tickUpdate() {
    // Odśwież status (czas temu) co 15s bez pełnego render
    if (this._statusEl && this._lastChanged !== undefined) {
      this._statusEl.textContent = _mlComparisonStatus(
        this._indoorLux, this._outdoorLux, this._isMotion, this._lastChanged
      );
    }
  }

  _updateRailing() {
    if (!this._railingEntity) {
      this._railingChip.className = 'railing-chip';
      return;
    }
    const s = this._hass.states[this._railingEntity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') {
      this._railingChip.className = 'railing-chip';
      return;
    }
    const isOn = s.state === 'on';
    this._railingChip.className = 'railing-chip visible';
    this._railingPill.className = `railing-pill ${isOn ? 'on' : 'off'}`;
  }

  _updateBattery() {
    const s = this._hass.states[this._batteryEntity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') {
      this._batWrap.style.opacity = '0';
      this._batWrap.style.pointerEvents = 'none';
      return;
    }
    this._batWrap.style.opacity = '';
    this._batWrap.style.pointerEvents = '';

    const pct = Math.round(parseFloat(s.state));

    // Poziomy: full≥60, ok 40-60, warn 20-40, low <20
    let strokeCol, fillCol, wrapClass, svgOpacity;
    if (pct >= 60) {
      strokeCol  = 'rgba(255,255,255,0.22)';
      fillCol    = 'rgba(255,255,255,0.28)';
      wrapClass  = 'bat-wrap';
      svgOpacity = 0.55;
    } else if (pct >= 40) {
      strokeCol  = 'rgba(255,255,255,0.45)';
      fillCol    = 'rgba(255,255,255,0.55)';
      wrapClass  = 'bat-wrap';
      svgOpacity = 0.80;
    } else if (pct >= 20) {
      strokeCol  = '#FF9F0A';
      fillCol    = '#FF9F0A';
      wrapClass  = 'bat-wrap bat-warn';
      svgOpacity = 1;
    } else {
      strokeCol  = '#E24B4A';
      fillCol    = '#E24B4A';
      wrapClass  = 'bat-wrap bat-low';
      svgOpacity = 1;
    }

    this._batWrap.className = wrapClass;
    this._batPct.textContent = `${pct}%`;

    const fillW = Math.round((Math.max(0, Math.min(100, pct)) / 100) * 13);
    this._batSvg.style.opacity = svgOpacity;
    this._batSvg.innerHTML = `
      <rect x=".5" y=".5" width="17" height="10" rx="2.5"
            fill="none" stroke="${strokeCol}" stroke-width="1.1"/>
      <rect x="18" y="3.5" width="2.5" height="4" rx="1" fill="${strokeCol}" opacity=".7"/>
      ${fillW > 0 ? `<rect x="2" y="2" width="${fillW}" height="6" rx="1.5" fill="${fillCol}"/>` : ''}`;
  }

  getCardSize() { return 3; }

  static getStubConfig() {
    return { entity: 'binary_sensor.ruch_i_swiatlo_gora', name: 'Ruch i światło', room: 'Piętro' };
  }
}

customElements.define('aha-motion-light-card', AhaMotionLightCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-motion-light-card',
  name:        'Motion + Light Card',
  description: 'Czujnik ruchu i światła — log-skala środek vs dwór, glow z lux',
  preview:     true,
});
