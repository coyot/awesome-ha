/**
 * temp-gauge-card.js — AHA Temperature & Humidity Gauge Card
 *
 * Layout:
 *   gauge    — dual-arc (temp outer, hum inner)
 *   pills    — absolute overlay top-right, only non-normal states
 *   bottom   — room name HTML, muted
 *
 * Config:
 *   profile: indoor | outdoor     — progi z AHA.TEMP_PROFILES (brak = dotychczasowe progi)
 *   thresholds: {frost, cold, warm, hot} — nadpisuje progi profilu
 *   min_temp / max_temp           — domyślnie z profilu
 *   Stany: mróz / zimno / komfort / ciepło / upał; puls tylko mróz i upał.
 *   Outdoor: zimno i ciepło spokojne (tło navy, bez glow).
 *   Karta <160px szerokości → .compact (bez etykiet min/max).
 *
 * Hover focus mode:
 *   arc hovered  → brightens, tooltip appears
 *   opposite arc → dims to 20%
 *   chrome       → dims to 30%
 */

// Fallbacki, gdyby aha-shared.js nie był załadowany przed kartą
const _GAUGE_ACC = () => (window.AHA && window.AHA.ACCENT) || {
  WORK: '#97C459', INFO: '#85B7EB', HEAT: '#EF9F27', ERROR: '#E24B4A', IDLE: '#5F5E5A', LIGHT: '#FFD60A',
};
const _GAUGE_RGB = () => (window.AHA && window.AHA.ACCENT_RGB) || {
  WORK: '151,196,89', INFO: '133,183,235', HEAT: '239,159,39', ERROR: '226,75,74', IDLE: '95,94,90', LIGHT: '255,214,10',
};
const _GAUGE_SURFACE = () => (window.AHA && window.AHA.THEME && window.AHA.THEME.SURFACE)
  || 'linear-gradient(150deg, #0b1120 0%, #0d1828 100%)';
const _GAUGE_PROFILES = () => (window.AHA && window.AHA.TEMP_PROFILES) || {
  indoor:  { min: 14,  max: 30, frost: 10, cold: 18, warm: 26, hot: 29 },
  outdoor: { min: -20, max: 40, frost: 0,  cold: 5,  warm: 28, hot: 35 },
};
// Brak `profile` w configu → dotychczasowe progi (kompatybilność wsteczna)
const _GAUGE_LEGACY = { min: -10, max: 40, frost: 5, cold: 17, warm: 26, hot: 31 };
const _gaugePulse = (name, rgb) => (window.AHA && typeof window.AHA.pulse === 'function')
  ? window.AHA.pulse(name, rgb, 5, 0.18)
  : `@keyframes ${name}{0%,100%{box-shadow:0 0 0 0 rgba(${rgb},0)}50%{box-shadow:0 0 0 5px rgba(${rgb},0.18)}}`;

class AhaTempGaugeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._uid = Math.random().toString(36).slice(2, 7);
    this._compact = false;
  }

  static getStubConfig() {
    return {
      name: 'Salon',
      temp_entity: 'sensor.salon_temperature',
      humidity_entity: 'sensor.salon_humidity',
      battery_entity: '',
      profile: 'indoor',
    };
  }

  setConfig(config) {
    if (!config.temp_entity) throw new Error('temp_entity jest wymagane');
    this._config = config;
    // Profil progów: indoor | outdoor (AHA.TEMP_PROFILES); brak → dotychczasowe progi
    const profs = _GAUGE_PROFILES();
    this._profileName = config.profile && profs[config.profile] ? config.profile : null;
    const base = this._profileName ? profs[this._profileName] : _GAUGE_LEGACY;
    const th  = config.thresholds || {};
    const num = (v, d) => (v === undefined || v === null || v === '' || isNaN(parseFloat(v))) ? d : parseFloat(v);
    this._prof = {
      min:   num(config.min_temp, base.min),
      max:   num(config.max_temp, base.max),
      frost: num(th.frost, base.frost),
      cold:  num(th.cold,  base.cold),
      warm:  num(th.warm,  base.warm),
      hot:   num(th.hot,   base.hot),
    };
    this._lastSig = null;
    if (this._hass) this.hass = this._hass;
  }

  /* ── ResizeObserver: tryb compact (<160px) + skala tekstu wilgotności ── */
  connectedCallback() {
    if (typeof ResizeObserver === 'undefined') return;
    if (!this._ro) this._ro = new ResizeObserver(() => this._onResize());
    this._ro.observe(this);
  }

  disconnectedCallback() {
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
  }

  _onResize() {
    const w = this.getBoundingClientRect().width;
    const compact = w > 0 && w < 160;
    if (compact !== this._compact) {
      this._compact = compact;
      this.shadowRoot.querySelector('.card')?.classList.toggle('compact', compact);
    }
    this._applyHumFont();
  }

  // Tekst wilgotności ~11px na ekranie niezależnie od skali viewBox
  _applyHumFont() {
    const svg = this.shadowRoot.querySelector('.gauge-svg');
    const ht  = this.shadowRoot.querySelector('.hum-text');
    if (!svg || !ht) return;
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const scale = Math.min(r.width / 200, r.height / 166);
    if (!scale) return;
    const fs = Math.max(9, Math.min(18, 11 / scale));
    ht.setAttribute('font-size', fs.toFixed(1));
    // Mała skala (większy font w jednostkach viewBox) → rozsuń temperaturę i wilgotność
    if (ht.dataset.death === '1') return;
    const tv = this.shadowRoot.getElementById('temp-hit');
    const big = fs > 15;
    if (tv) tv.setAttribute('y', big ? 80 : 86);
    ht.setAttribute('y', big ? 110 : 112);
  }

  set hass(hass) {
    this._hass = hass;
    const c = this._config;
    const sig = [
      c.temp_entity     ? hass.states[c.temp_entity]?.state     : '',
      c.humidity_entity ? hass.states[c.humidity_entity]?.state : '',
      c.battery_entity  ? hass.states[c.battery_entity]?.state  : '',
    ].join('|');
    if (sig === this._lastSig) return;
    this._lastSig = sig;
    this._render();
  }

  _val(entity) {
    if (!this._hass || !entity) return null;
    const s = this._hass.states[entity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return parseFloat(s.state);
  }

  /*
   * Stany wg progów profilu:
   *   t < frost → mróz (alarm, puls)   t < cold → zimno   t < warm → komfort
   *   t < hot   → ciepło               t >= hot → upał (alarm, puls)
   * Profil outdoor: zimno i ciepło są SPOKOJNE (tło navy, bez glow, tylko kolor łuku/liczby).
   */
  _tempState(t) {
    const A = _GAUGE_ACC(), R = _GAUGE_RGB(), NAVY = _GAUGE_SURFACE();
    const p = this._prof || _GAUGE_LEGACY;
    const calm = this._profileName === 'outdoor';
    if (t === null || isNaN(t)) return {
      key: 'offline', cardBg: NAVY, cardBorder: 'rgba(255,255,255,0.07)',
      glowCss: '', tempColor: '#3a3a3c', iconBg: 'rgba(255,255,255,0.06)',
      arcG0: 'rgba(255,255,255,0.18)', arcG1: 'rgba(255,255,255,0.06)', label: 'offline', calm: false,
    };
    if (t < p.frost) return {
      key: 'frost', cardBg: '#07101c', cardBorder: `rgba(${R.INFO},0.62)`,
      glowCss: `radial-gradient(ellipse at 18% 12%, rgba(${R.INFO},0.24) 0%, rgba(${R.INFO},0.09) 40%, transparent 62%), radial-gradient(ellipse at 42% 22%, rgba(${R.INFO},0.16) 0%, rgba(${R.INFO},0.05) 48%, transparent 70%)`,
      tempColor: A.INFO, iconBg: `rgba(${R.INFO},0.15)`,
      arcG0: '#CFE3F7', arcG1: '#4A86C5', label: 'mróz', calm: false,
    };
    if (t < p.cold) return calm ? {
      key: 'cold', cardBg: NAVY, cardBorder: `rgba(${R.INFO},0.30)`,
      glowCss: '', tempColor: A.INFO, iconBg: `rgba(${R.INFO},0.11)`,
      arcG0: '#D6E7F8', arcG1: '#6A9FD8', label: 'zimno', calm: true,
    } : {
      key: 'cold', cardBg: '#0e1822', cardBorder: `rgba(${R.INFO},0.24)`,
      glowCss: `radial-gradient(ellipse at 30% 25%, rgba(${R.INFO},0.12) 0%, transparent 58%)`,
      tempColor: A.INFO, iconBg: `rgba(${R.INFO},0.11)`,
      arcG0: '#D6E7F8', arcG1: '#6A9FD8', label: 'zimno', calm: false,
    };
    if (t < p.warm) return {
      key: 'comfort', cardBg: NAVY, cardBorder: 'rgba(255,255,255,0.08)',
      glowCss: '', tempColor: '#ffffff', iconBg: 'rgba(255,255,255,0.08)',
      arcG0: '#C4E29A', arcG1: '#6A9A34', label: 'komfort', calm: false,
    };
    if (t < p.hot) return calm ? {
      key: 'warm', cardBg: NAVY, cardBorder: `rgba(${R.HEAT},0.35)`,
      glowCss: '', tempColor: A.HEAT, iconBg: `rgba(${R.HEAT},0.12)`,
      arcG0: '#F7CB7D', arcG1: '#C9790C', label: 'ciepło', calm: true,
    } : {
      key: 'warm', cardBg: '#1a1206', cardBorder: `rgba(${R.HEAT},0.40)`,
      glowCss: `radial-gradient(ellipse at 60% 20%, rgba(${R.HEAT},0.16) 0%, rgba(${R.HEAT},0.05) 50%, transparent 70%)`,
      tempColor: A.HEAT, iconBg: `rgba(${R.HEAT},0.14)`,
      arcG0: '#F7CB7D', arcG1: '#C9790C', label: 'ciepło', calm: false,
    };
    return {
      key: 'fire', cardBg: '#150404', cardBorder: `rgba(${R.ERROR},0.72)`,
      glowCss: `radial-gradient(ellipse at 50% 94%, rgba(${R.ERROR},0.46) 0%, rgba(${R.ERROR},0.18) 52%, transparent 72%)`,
      tempColor: '#F0807F', iconBg: `rgba(${R.ERROR},0.17)`,
      arcG0: '#F4A48F', arcG1: '#B83433', label: 'upał', calm: false,
    };
  }

  // Łuk wilgotności: komfort (35–80%) neutralny, poza komfortem akcenty
  _humArcColor(h) {
    const A = _GAUGE_ACC(), R = _GAUGE_RGB();
    if (h === null) return 'rgba(255,255,255,0.15)';
    if (h < 35)  return A.HEAT;
    if (h > 80)  return A.INFO;
    return `rgba(${R.INFO},0.45)`;
  }

  _humTextColor(h) {
    const A = _GAUGE_ACC();
    if (h !== null && h < 35) return A.HEAT;
    if (h !== null && h > 80) return A.INFO;
    return 'rgba(255,255,255,0.55)';
  }

  _render() {
    const cfg      = this._config;
    const name     = cfg.name || 'Pokój';
    const uid  = this._uid;

    const temp = this._val(cfg.temp_entity);
    const hum  = this._val(cfg.humidity_entity);
    const bat  = this._val(cfg.battery_entity);

    const st      = this._tempState(temp);
    const humCol  = this._humArcColor(hum);
    const isOffline = temp === null;

    const A = _GAUGE_ACC(), RGB = _GAUGE_RGB();
    const minT = this._prof.min;
    const maxT = this._prof.max;

    const tempStr  = isOffline ? '—' : temp.toFixed(1) + '°';
    const isDeath  = temp !== null && temp >= 38;
    const humStr  = hum !== null ? hum.toFixed(0) + '%' : '—';
    const humTxtCol = this._humTextColor(hum);
    const hasHum  = !!cfg.humidity_entity;

    const span    = (maxT - minT) || 1;
    const fillPct = isOffline ? 0 : Math.max(0, Math.min(100, (temp - minT) / span * 100));
    const humPct  = hum !== null ? Math.max(0, Math.min(100, hum)) : 0;

    /* ── SVG gauge geometry ── */
    const CX = 100, CY = 90;
    const R1 = 74, SW1 = 13;   // temp  — dominant
    const R2 = 54, SW2 = 7;    // hum   — slender accent (was 10 → 7)
    const FRAC = 0.75;

    const C1 = 2 * Math.PI * R1, ARC1 = FRAC * C1;
    const C2 = 2 * Math.PI * R2, ARC2 = FRAC * C2;

    const tempFillLen = isOffline ? 0 : (fillPct / 100) * ARC1;
    const humFillLen  = hum !== null ? (humPct / 100) * ARC2 : 0;

    // Indicator dot — end of temp fill arc
    const dotRad = (135 + (isOffline ? 0 : (fillPct / 100) * 270)) * Math.PI / 180;
    const dotX = CX + R1 * Math.cos(dotRad);
    const dotY = CY + R1 * Math.sin(dotRad);

    // Min / max range labels
    const LR  = R1 + SW1 / 2 + 9;
    const minA = 135 * Math.PI / 180;
    const maxA = (135 + 270) * Math.PI / 180;
    const fmtT = v => v === 0 ? '0°' : v > 0 ? `+${v}°` : `${v}°`;

    // Extreme-state glow on arc

    // Humidity zone label
    const humZone = hum === null ? '' : hum < 35 ? 'sucho' : hum <= 80 ? 'komfort' : 'wilgotno';

    /* ── HTML tooltip helper (nie SVG — CSS px nie skalują się z viewBox) ── */
    const _ttHtml = (label, valStr, valColor, cls) => `
      <div class="tt-box ${cls}">
        <div class="tt-label">${label}</div>
        <div class="tt-val" style="color:${valColor}">${valStr}</div>
      </div>`;

    /* ── Battery ── */
    const batHTML = (() => {
      if (bat === null || bat >= 25) return '';
      const low   = bat < 20;   // niski poziom → procent widoczny na stałe
      const col   = low ? A.ERROR : 'rgba(255,255,255,0.38)';
      const fillW = Math.round((Math.max(0, Math.min(100, bat)) / 100) * 13);
      return `
        <div class="bat${low ? ' low' : ''}">
          <span class="bat-pct">${Math.round(bat)}%</span>
          <svg width="16" height="8" viewBox="0 0 22 11">
            <rect x=".5" y=".5" width="17" height="10" rx="2.5" fill="none" stroke="${col}" stroke-width="1.1"/>
            <rect x="18" y="3.5" width="2.5" height="4" rx="1" fill="${col}" opacity=".7"/>
            ${fillW > 0 ? `<rect x="2" y="2" width="${fillW}" height="6" rx="1.5" fill="${col}"/>` : ''}
          </svg>
        </div>`;
    })();

    this.shadowRoot.innerHTML = `
<style>
  :host { display: block; width: 100%; height: 100%; position: relative; }

  .card {
    width: 100%; height: 100%;
    border-radius: 20px;
    padding: 10px 10px 8px;
    box-sizing: border-box;
    display: flex; flex-direction: column;
    overflow: hidden; position: relative;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent; user-select: none; cursor: default;
    background: ${st.cardBg};
    border: 1px solid ${st.cardBorder};
    transition: border-color .4s ease, background .4s ease, transform .15s ease;
  }
  .card:active { transform: scale(0.97); }

  .bg-glow {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background: ${st.glowCss || 'none'}; transition: background .4s ease;
  }

  /* ── puls karty — tylko stany alarmowe (mróz, upał): 5px / 0.18 przy 50% ── */
  ${_gaugePulse('gauge-pulse-frost', RGB.INFO)}
  ${_gaugePulse('gauge-pulse-fire', RGB.ERROR)}
  @keyframes frost-pulse  { 0%,100%{opacity:.5}  50%{opacity:.95} }
  @keyframes frost-arc    { 0%,100%{filter:brightness(1)}  50%{filter:brightness(1.28) saturate(1.3)} }
  @keyframes fire-arc     { 0%,100%{opacity:.9} 25%{opacity:1;filter:brightness(1.55) saturate(1.4)} 75%{opacity:.82;filter:brightness(.88)} }
  @keyframes fire-shimmer { 0%,100%{opacity:.55;transform:scaleY(1)} 50%{opacity:.9;transform:scaleY(1.07)} }
  @keyframes death-pulse  { 0%,100%{opacity:.70} 50%{opacity:1} }
  @keyframes death-flicker { 0%,100%{opacity:1} 45%{opacity:.85} 50%{opacity:.60} 55%{opacity:.90} }
  .death-skull { animation: death-pulse 2.8s ease-in-out infinite; }
  .death-skull ellipse[fill="url(#sg)"], .death-skull ellipse:first-child { animation: death-flicker 3.5s ease-in-out infinite; }
  @keyframes mirage-drift { 0%,100%{opacity:0;transform:scaleX(0.88)} 45%{opacity:1;transform:scaleX(1.06)} 90%{opacity:0;transform:scaleX(1.01)} }
  @keyframes ice-crystal-glow { 0%,100%{opacity:.07} 50%{opacity:.19} }

  .card.frost { animation: gauge-pulse-frost 2.4s ease-in-out infinite; }
  .card.fire  { animation: gauge-pulse-fire  2.4s ease-in-out infinite; }
  .card.frost .arc-temp-fill { animation: frost-arc 3.0s ease-in-out infinite; }
  .card.fire  .arc-temp-fill { animation: fire-arc  2.0s ease-in-out infinite; }

  .frost-overlay {
    display:none; position:absolute; inset:0; z-index:1;
    pointer-events:none; border-radius:19px; overflow:hidden;
  }
  .card.frost .frost-overlay { display:block; animation: frost-pulse 3.5s ease-in-out infinite; }

  .fire-overlay {
    display:none; position:absolute; inset:0; z-index:1;
    pointer-events:none; border-radius:19px; overflow:hidden;
  }
  .card.fire .fire-overlay { display:block; animation: fire-shimmer 2.5s ease-in-out infinite; }

  /* ── state label — absolute top-center, lekki napis, nie przesuwa gauge ── */
  .state-label {
    position: absolute; top: 10px; left: 0; right: 0; z-index: 5;
    text-align: center; pointer-events: none;
    font-size: 9px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
    transition: color .5s ease, opacity .5s ease;
  }
  .card.comfort .state-label,
  .card.offline .state-label { display: none; }
  .card.cold  .state-label { color: rgba(${RGB.INFO},0.75); }
  .card.frost .state-label { color: rgba(${RGB.INFO},0.95); }
  .card.warm  .state-label { color: rgba(${RGB.HEAT},0.90); }
  .card.fire  .state-label { color: rgba(255,255,255,0.95); text-shadow: 0 0 12px rgba(${RGB.ERROR},0.90); }

  .mirage-overlay {
    display: none; position: absolute; left: -6%; right: -6%; top: 35%; height: 32px;
    pointer-events: none; z-index: 2; border-radius: 50%;
    background: linear-gradient(transparent, rgba(${RGB.ERROR},0.12), transparent);
  }
  .card.fire .mirage-overlay { display: block; animation: mirage-drift 4.2s ease-in-out infinite; }

  .ice-glow-overlay {
    display: none; position: absolute; inset: 0; pointer-events: none; z-index: 1; border-radius: 19px;
    background: radial-gradient(ellipse at 18% 12%, rgba(${RGB.INFO},0.24) 0%, rgba(${RGB.INFO},0.08) 40%, transparent 62%);
  }
  .card.frost .ice-glow-overlay { display: block; animation: ice-crystal-glow 3.5s ease-in-out infinite; }

  .card.frost .center-val { filter: drop-shadow(0 0 10px rgba(${RGB.INFO},0.80)); }
  .card.frost #g-temp     { filter: drop-shadow(0 0 5px  rgba(${RGB.INFO},0.50)); }

  /* ── room name HTML at bottom ── */
  .room-name {
    text-align: center; font-size: 12px; font-weight: 600;
    color: rgba(255,255,255,0.65); flex-shrink: 0;
    padding-bottom: 4px; position: relative; z-index: 2;
    transition: opacity .22s ease;
  }

  /* ── battery (absolute top-right) ── */
  .bat {
    position: absolute; top: 9px; right: 10px; z-index: 10;
    display: flex; align-items: center; gap: 4px;
  }
  .bat-pct {
    font-size: 9px; font-weight: 600; color: rgba(255,255,255,.8);
    background: rgba(28,28,30,.92); border: .5px solid rgba(255,255,255,.14);
    border-radius: 4px; padding: 1px 4px;
    opacity: 0; pointer-events: none; transition: opacity .15s; backdrop-filter: blur(8px);
  }
  .bat:hover .bat-pct { opacity: 1; }
  .bat.low .bat-pct  { opacity: 1; color: ${A.ERROR}; border-color: rgba(${RGB.ERROR},0.35); }

  /* ── gauge ── */
  .gauge-wrap {
    flex: 1; min-height: 0;
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 2;
  }
  .gauge-svg { width: 100%; height: 100%; overflow: visible; }

  /* ══ HOVER FOCUS MODE — JS-driven (shadow DOM safe) ══ */

  /* arc fill brightens on direct :hover (CSS, reliable) */
  .arc-temp-fill, .arc-hum-fill { transition: filter .2s ease; }
  #g-temp:hover .arc-temp-fill { filter: brightness(1.4) saturate(1.15) !important; }
  #g-hum:hover  .arc-hum-fill  { filter: brightness(1.4) saturate(1.15); }

  /* arc track brightens slightly */
  #g-temp:hover .arc-track-temp,
  #g-hum:hover  .arc-track-hum  { filter: brightness(3); transition: filter .2s ease; }

  /* JS-controlled transition targets */
  #g-temp, #g-hum { transition: opacity .22s ease; }
  .state-label { transition: color .5s ease, opacity .22s ease; }

  /* temperature value — SVG text, wewnątrz łuków */
  .center-val {
    font-family: -apple-system,system-ui,sans-serif;
    font-size: 34px; font-weight: 700; letter-spacing: -1.5px;
    fill: ${st.tempColor}; transition: opacity .2s ease;
    cursor: pointer;
  }

  /* ── HTML tooltips — absolutne w card div (nie w gauge-wrap), z-index 100 ── */
  .tt-box {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -60%);
    background: rgba(10,10,14,0.96);
    border: 0.5px solid rgba(255,255,255,0.13);
    border-radius: 14px; padding: 8px 14px;
    text-align: center; pointer-events: none;
    opacity: 0; transition: opacity .18s ease;
    z-index: 100; white-space: nowrap;
    font-family: -apple-system, system-ui, sans-serif;
  }
  .tt-label {
    font-size: 10px; font-weight: 500;
    color: rgba(255,255,255,0.48); margin-bottom: 4px;
  }
  .tt-val {
    font-size: 22px; font-weight: 700;
    letter-spacing: -0.5px; line-height: 1;
  }

  .range-text {
    font-family: -apple-system,system-ui,sans-serif;
    font-size: 14px; font-weight: 500; fill: rgba(255,255,255,.38);
  }
  /* wąska karta (<160px) — bez etykiet min/max */
  .card.compact .range-text { display: none; }
  .card.compact .gauge-wrap { padding-top: 10px; }

  /* wilgotność — stały tekst pod temperaturą */
  .hum-text {
    font-family: -apple-system,system-ui,sans-serif;
    font-weight: 500; transition: opacity .2s ease, fill .4s ease;
  }
</style>

<div class="card ${st.key}${st.calm ? ' calm' : ''}${this._compact ? ' compact' : ''}">
  <div class="bg-glow"></div>

  <!-- frost crystals overlay -->
  <div class="frost-overlay">
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet">
      <path d="M0,0 Q20,30 0,62"  stroke="rgba(140,210,255,.28)" stroke-width="1.3" fill="none"/>
      <path d="M0,0 Q34,14 68,0"  stroke="rgba(140,210,255,.28)" stroke-width="1.3" fill="none"/>
      <path d="M0,0 Q28,28 48,48" stroke="rgba(140,210,255,.18)" stroke-width="1"   fill="none"/>
      <line x1="22" y1="22" x2="22" y2="42" stroke="rgba(170,230,255,.60)" stroke-width="1.3"/>
      <line x1="12" y1="32" x2="32" y2="32" stroke="rgba(170,230,255,.60)" stroke-width="1.3"/>
      <line x1="15" y1="25" x2="29" y2="39" stroke="rgba(170,230,255,.28)" stroke-width="1"/>
      <line x1="29" y1="25" x2="15" y2="39" stroke="rgba(170,230,255,.28)" stroke-width="1"/>
      <line x1="48" y1="11" x2="48" y2="25" stroke="rgba(170,230,255,.35)" stroke-width="1"/>
      <line x1="41" y1="18" x2="55" y2="18" stroke="rgba(170,230,255,.35)" stroke-width="1"/>
      <circle cx="8"  cy="8"  r="1.6" fill="rgba(210,245,255,.70)"/>
      <circle cx="30" cy="7"  r="1.1" fill="rgba(210,245,255,.50)"/>
      <circle cx="6"  cy="36" r="1.3" fill="rgba(210,245,255,.46)"/>
      <circle cx="50" cy="6"  r="1.0" fill="rgba(210,245,255,.40)"/>
      <circle cx="11" cy="55" r="1.1" fill="rgba(210,245,255,.34)"/>
    </svg>
  </div>

  <!-- fire heat shimmer -->
  <div class="fire-overlay">
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <defs>
        <radialGradient id="hr-${uid}" cx="50%" cy="100%" r="65%">
          <stop offset="0%"   stop-color="rgba(${RGB.ERROR},.22)"/>
          <stop offset="55%"  stop-color="rgba(${RGB.ERROR},.07)"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#hr-${uid})"/>
    </svg>
  </div>

  <!-- mirage heat strip (fire) — C proposal -->
  <div class="mirage-overlay"></div>

  <!-- ice crystal glow (frost) — Z proposal -->
  <div class="ice-glow-overlay"></div>

  ${batHTML}

  <!-- STATE LABEL: absolute top-center, lekki napis, nie przesuwa gauge -->
  <div class="state-label">${['comfort','offline'].includes(st.key) ? '' : st.label}</div>

  <!-- GAUGE -->
  <div class="gauge-wrap">
    <svg class="gauge-svg" viewBox="0 0 200 166" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tg-${uid}" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${st.arcG1}"/>
          <stop offset="100%" stop-color="${st.arcG0}"/>
        </linearGradient>
        <radialGradient id="cg-${uid}" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stop-color="${isOffline ? 'transparent' : st.arcG1 + '18'}"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
        <radialGradient id="sg-${uid}" cx="50%" cy="38%" r="58%">
          <stop offset="0%"   stop-color="rgba(255,70,0,0.30)"/>
          <stop offset="60%"  stop-color="rgba(200,20,0,0.10)"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
      </defs>

      <!-- ambient glow in center -->
      <circle cx="${CX}" cy="${CY}" r="${R2 - SW2/2 - 4}" fill="url(#cg-${uid})"/>

      <!-- death skull ☠️ — emoji przy ≥38°C -->
      ${isDeath ? `
      <text class="death-skull"
        x="${CX}" y="88"
        text-anchor="middle" dominant-baseline="central"
        font-size="72" style="font-family:-apple-system,system-ui,sans-serif">☠️</text>
      ` : ''}

      <!-- temperature value — wewnątrz wewnętrznego łuku, nad ikoną -->
      <text id="temp-hit" class="center-val"
        x="${CX}" y="${isDeath ? CY + 50 : (hasHum ? CY - 4 : CY)}"
        text-anchor="middle" dominant-baseline="central"
        ${isDeath ? `style="font-size:26px;font-weight:700;fill:${A.ERROR}"` : ''}>${tempStr}</text>

      <!-- wilgotność — stały tekst pod temperaturą (tylko gdy skonfigurowano encję) -->
      ${hasHum ? `
      <text class="hum-text" x="${CX}" y="${isDeath ? CY + 68 : CY + 22}" data-death="${isDeath ? 1 : 0}"
        text-anchor="middle" dominant-baseline="central"
        font-size="12" fill="${humTxtCol}">wilg. ${humStr}</text>
      ` : ''}

      <!-- ══ TEMP ARC GROUP ══ -->
      <g id="g-temp" style="cursor:pointer">

        <circle class="arc-track-temp" cx="${CX}" cy="${CY}" r="${R1}"
          fill="none" stroke="rgba(255,255,255,0.055)" stroke-width="${SW1}"
          stroke-dasharray="${ARC1.toFixed(2)} ${C1.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"/>

        ${tempFillLen > 0.5 ? `
        <circle class="arc-temp-fill" cx="${CX}" cy="${CY}" r="${R1}"
          fill="none" stroke="url(#tg-${uid})" stroke-width="${SW1}"
          stroke-dasharray="${tempFillLen.toFixed(2)} ${C1.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"
          />
        ` : ''}

        <!-- hit area -->
        <circle cx="${CX}" cy="${CY}" r="${R1}"
          fill="none" stroke="rgba(255,255,255,0.004)" stroke-width="24"
          stroke-dasharray="${ARC1.toFixed(2)} ${C1.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"
          pointer-events="stroke"/>

      </g>

      <!-- ══ HUM ARC GROUP ══ -->
      <g id="g-hum" style="cursor:pointer">

        <circle class="arc-track-hum" cx="${CX}" cy="${CY}" r="${R2}"
          fill="none" stroke="rgba(255,255,255,0.038)" stroke-width="${SW2}"
          stroke-dasharray="${ARC2.toFixed(2)} ${C2.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"/>

        ${humFillLen > 0.5 ? `
        <circle class="arc-hum-fill" cx="${CX}" cy="${CY}" r="${R2}"
          fill="none" stroke="${humCol}" stroke-width="${SW2}"
          stroke-dasharray="${humFillLen.toFixed(2)} ${C2.toFixed(2)}"
          stroke-linecap="round" stroke-opacity="0.85"
          transform="rotate(135,${CX},${CY})"/>
        ` : ''}

        <!-- hit area -->
        <circle cx="${CX}" cy="${CY}" r="${R2}"
          fill="none" stroke="rgba(255,255,255,0.004)" stroke-width="18"
          stroke-dasharray="${ARC2.toFixed(2)} ${C2.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"
          pointer-events="stroke"/>

      </g>

      <!-- indicator dot -->
      ${!isOffline && tempFillLen > 3 ? `
      <circle class="dot-outer" cx="${dotX.toFixed(2)}" cy="${dotY.toFixed(2)}" r="5"
        fill="${st.arcG0}" opacity="0.85"/>
      <circle cx="${dotX.toFixed(2)}" cy="${dotY.toFixed(2)}" r="2.8"
        fill="rgba(255,255,255,0.95)"/>
      ` : ''}

      <!-- range labels — flanking the gap -->
      <text x="${(CX + LR * Math.cos(minA)).toFixed(1)}" y="${(CY + LR * Math.sin(minA) + 3).toFixed(1)}"
        text-anchor="end"   class="range-text">${fmtT(minT)}</text>
      <text x="${(CX + LR * Math.cos(maxA)).toFixed(1)}" y="${(CY + LR * Math.sin(maxA) + 3).toFixed(1)}"
        text-anchor="start" class="range-text">${fmtT(maxT)}</text>

    </svg>
  </div>

  <!-- ROOM NAME: HTML element at bottom -->
  <div class="room-name">${name}</div>
</div>

<!-- tooltips poza .card — nie są obcięte przez overflow:hidden, pozycjonowane względem :host -->
${_ttHtml('🌡️ Temperatura · ' + st.label, tempStr, st.tempColor, 'tt-temp')}
${_ttHtml('💧 Wilgotność · ' + (humZone || '—'), humStr, hum !== null && hum >= 35 && hum <= 80 ? 'rgba(255,255,255,0.90)' : humCol, 'tt-hum')}`;

    this._applyHumFont();

    /* click → more-info */
    this.shadowRoot.getElementById('g-temp')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true, detail: { entityId: cfg.temp_entity },
      }));
    });
    if (cfg.humidity_entity) {
      this.shadowRoot.getElementById('g-hum')?.addEventListener('click', e => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true, detail: { entityId: cfg.humidity_entity },
        }));
      });
    }
    this.shadowRoot.getElementById('temp-hit')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true, detail: { entityId: cfg.temp_entity },
      }));
    });

    /* hover focus mode — JS driven for shadow DOM reliability */
    {
      const gT  = this.shadowRoot.getElementById('g-temp');
      const gH  = this.shadowRoot.getElementById('g-hum');
      const ttT = this.shadowRoot.querySelector('.tt-temp');
      const ttH = this.shadowRoot.querySelector('.tt-hum');
      const cv  = this.shadowRoot.getElementById('temp-hit');
      const sl  = this.shadowRoot.querySelector('.state-label');
      const rn  = this.shadowRoot.querySelector('.room-name');
      const ht  = this.shadowRoot.querySelector('.hum-text');

      const enter = (showTT, dimArc) => {
        if (showTT)  showTT.style.opacity  = '1';
        if (cv)      cv.style.opacity      = '0';
        if (ht)      ht.style.opacity      = '0';
        if (dimArc)  dimArc.style.opacity  = '0.18';
        if (sl)      sl.style.opacity      = '0.28';
        if (rn)      rn.style.opacity      = '0.28';
      };
      const leave = () => {
        if (ttT) ttT.style.opacity = '0';
        if (ttH) ttH.style.opacity = '0';
        if (cv)  cv.style.opacity  = '1';
        if (ht)  ht.style.opacity  = '';
        if (gT)  gT.style.opacity  = '1';
        if (gH)  gH.style.opacity  = '1';
        if (sl)  sl.style.opacity  = '';
        if (rn)  rn.style.opacity  = '';
      };

      gT?.addEventListener('mouseenter', () => enter(ttT, gH));
      gT?.addEventListener('mouseleave', leave);
      gH?.addEventListener('mouseenter', () => enter(ttH, gT));
      gH?.addEventListener('mouseleave', leave);
    }
  }

  getCardSize() { return 3; }
}

customElements.define('aha-temp-gauge-card', AhaTempGaugeCard);
if (!customElements.get('temp-gauge-card'))
  customElements.define('temp-gauge-card', class extends AhaTempGaugeCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-temp-gauge-card',
  name:        'AHA Temp Gauge Card',
  preview:     false,
  description: 'Gauge temp+wilgotność. Hover = focus mode (dimuje resztę, tooltip). Apple Home glassmorphism.',
});
