class TempHumidityCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getStubConfig() {
    return {
      temp_entity: 'sensor.temperature_salon',
      humidity_entity: '',
      battery_entity: '',
      name: 'Salon',
    };
  }

  setConfig(config) {
    if (!config.temp_entity) throw new Error('temp_entity jest wymagane');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  get _tempVal() {
    if (!this._hass || !this._config.temp_entity) return null;
    const s = this._hass.states[this._config.temp_entity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return parseFloat(s.state);
  }

  get _humVal() {
    if (!this._hass || !this._config.humidity_entity) return null;
    const s = this._hass.states[this._config.humidity_entity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return parseFloat(s.state);
  }

  get _batVal() {
    if (!this._hass || !this._config.battery_entity) return null;
    const s = this._hass.states[this._config.battery_entity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return parseFloat(s.state);
  }

  _getTempState(t) {
    if (t === null) return {
      label: 'OFFLINE', color: 'rgba(255,255,255,0.2)',
      border: 'rgba(255,255,255,0.08)', bg: '#1C1C1E',
      fillColor: 'url(#grad)', fillPct: 0,
      bulbColor: 'rgba(255,255,255,0.15)', glowColor: 'rgba(255,255,255,0)',
      glowWidth: 5,
      pillBg: 'rgba(255,255,255,0.05)', pillBorder: 'rgba(255,255,255,0.1)',
      gradStops: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)'],
      effect: 'none', pulseAnim: '',
    };
    if (t < 5)  return {
      label: 'MRÓZ', color: '#0A84FF',
      border: 'rgba(10,132,255,0.32)', bg: 'linear-gradient(150deg,#040c18,#111820,#1C1C1E)',
      fillColor: 'url(#grad)', fillPct: Math.max(4, ((t + 10) / 15) * 28),
      bulbColor: '#0A84FF', glowColor: 'rgba(10,132,255,0.25)', glowWidth: 6,
      pillBg: 'rgba(10,132,255,0.15)', pillBorder: 'rgba(10,132,255,0.42)',
      gradStops: ['#5AC8FA', '#0A84FF'],
      effect: 'frost', pulseAnim: 'animation: frost-pulse 3s ease-in-out infinite;',
    };
    if (t < 17) return {
      label: 'ZIMNO', color: '#5AC8FA',
      border: 'rgba(90,200,250,0.2)', bg: 'linear-gradient(150deg,#081420,#1C1C1E)',
      fillColor: 'url(#grad)', fillPct: 18 + ((t - 5) / 12) * 24,
      bulbColor: '#5AC8FA', glowColor: 'rgba(90,200,250,0.18)', glowWidth: 5,
      pillBg: 'rgba(90,200,250,0.12)', pillBorder: 'rgba(90,200,250,0.3)',
      gradStops: ['#5AC8FA', '#0A84FF'],
      effect: 'none', pulseAnim: '',
    };
    if (t < 26) return {
      label: 'KOMFORT', color: '#30D158',
      border: 'rgba(48,209,88,0.2)', bg: 'linear-gradient(150deg,#0a1e0e,#1C1C1E)',
      fillColor: 'url(#grad)', fillPct: 42 + ((t - 17) / 9) * 20,
      bulbColor: '#30D158', glowColor: 'rgba(48,209,88,0.2)', glowWidth: 5,
      pillBg: 'rgba(48,209,88,0.12)', pillBorder: 'rgba(48,209,88,0.3)',
      gradStops: ['#30D158', '#25a244'],
      effect: 'none', pulseAnim: '',
    };
    if (t < 31) return {
      label: 'ZA CIEPŁO', color: '#FF9F0A',
      border: 'rgba(255,159,10,0.25)', bg: 'linear-gradient(150deg,#1e1000,#231408,#1C1C1E)',
      fillColor: 'url(#grad)', fillPct: 62 + ((t - 26) / 5) * 20,
      bulbColor: '#FF9F0A', glowColor: 'rgba(255,159,10,0.22)', glowWidth: 5,
      pillBg: 'rgba(255,159,10,0.14)', pillBorder: 'rgba(255,159,10,0.38)',
      gradStops: ['#FFD60A', '#FF9F0A'],
      effect: 'warm', pulseAnim: 'animation: warm-pulse 2.8s ease-in-out infinite;',
    };
    return {
      label: '⚠ UPAŁ', color: '#FF453A',
      border: 'rgba(255,69,58,0.38)', bg: 'linear-gradient(150deg,#1a0404,#220808,#1C1C1E)',
      fillColor: 'url(#grad)', fillPct: 100,
      bulbColor: '#FF2200', glowColor: 'rgba(255,69,58,0.35)', glowWidth: 7,
      pillBg: 'rgba(255,69,58,0.2)', pillBorder: 'rgba(255,69,58,0.55)',
      gradStops: ['#FF6B6B', '#FF2200'],
      effect: 'heat', pulseAnim: 'animation: heat-pulse 2s ease-in-out infinite;',
    };
  }

  _getHumidityState(h) {
    if (h === null) return null;
    if (h < 35) return { label: `💧 ${h.toFixed(0)}%`, color: '#FF9F0A' };
    if (h < 66) return { label: `💧 ${h.toFixed(0)}%`, color: '#30D158' };
    if (h < 81) return { label: `💧 ${h.toFixed(0)}%`, color: '#0A84FF' };
    return           { label: `💧 ${h.toFixed(0)}% ⚠`, color: '#0A84FF' };
  }

  _batteryHTML(pct) {
    if (pct === null) return '';
    const low = pct < 20;
    const col = low ? '#FF453A' : 'rgba(255,255,255,0.45)';
    const fillW = Math.round((Math.max(0, Math.min(100, pct)) / 100) * 13);
    const fillCol = low ? '#FF453A' : 'rgba(255,255,255,0.5)';
    return `
    <div class="bat-wrap">
      <div class="bat-tip">${Math.round(pct)}%</div>
      <svg width="18" height="9" viewBox="0 0 22 11">
        <rect x="0.5" y="0.5" width="17" height="10" rx="2.5"
              fill="none" stroke="${col}" stroke-width="1.1"/>
        <rect x="18" y="3.5" width="2.5" height="4" rx="1" fill="${col}" opacity="0.7"/>
        ${fillW > 0 ? `<rect x="2" y="2" width="${fillW}" height="6" rx="1.5" fill="${fillCol}"/>` : ''}
      </svg>
    </div>`;
  }

  _frostHTML() {
    return `
    <svg class="fx frost-tl" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,0 Q10,18 0,36" stroke="rgba(140,210,255,0.4)" stroke-width="1.2" fill="none"/>
      <path d="M0,0 Q22,8 42,0" stroke="rgba(140,210,255,0.4)" stroke-width="1.2" fill="none"/>
      <path d="M0,0 Q18,18 28,28" stroke="rgba(140,210,255,0.28)" stroke-width="0.9" fill="none"/>
      <path d="M0,0 Q5,28 12,38" stroke="rgba(140,210,255,0.2)" stroke-width="0.8" fill="none"/>
      <path d="M0,0 Q32,5 46,14" stroke="rgba(140,210,255,0.2)" stroke-width="0.8" fill="none"/>
      <line x1="14" y1="14" x2="14" y2="26" stroke="rgba(160,225,255,0.65)" stroke-width="1"/>
      <line x1="8"  y1="20" x2="20" y2="20" stroke="rgba(160,225,255,0.65)" stroke-width="1"/>
      <line x1="10" y1="16" x2="18" y2="24" stroke="rgba(160,225,255,0.38)" stroke-width="0.8"/>
      <line x1="18" y1="16" x2="10" y2="24" stroke="rgba(160,225,255,0.38)" stroke-width="0.8"/>
      <line x1="30" y1="8"  x2="30" y2="16" stroke="rgba(160,225,255,0.45)" stroke-width="0.8"/>
      <line x1="26" y1="12" x2="34" y2="12" stroke="rgba(160,225,255,0.45)" stroke-width="0.8"/>
      <circle cx="6"  cy="6"  r="1.5" fill="rgba(180,235,255,0.6)"/>
      <circle cx="18" cy="4"  r="1"   fill="rgba(180,235,255,0.5)"/>
      <circle cx="4"  cy="20" r="1.2" fill="rgba(180,235,255,0.5)"/>
      <circle cx="26" cy="5"  r="0.8" fill="rgba(180,235,255,0.4)"/>
      <circle cx="8"  cy="30" r="0.9" fill="rgba(180,235,255,0.35)"/>
    </svg>
    <svg class="fx frost-tr" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M60,0 Q50,14 60,28" stroke="rgba(140,210,255,0.35)" stroke-width="1" fill="none"/>
      <path d="M60,0 Q44,6 28,0" stroke="rgba(140,210,255,0.35)" stroke-width="1" fill="none"/>
      <path d="M60,0 Q46,16 38,22" stroke="rgba(140,210,255,0.22)" stroke-width="0.8" fill="none"/>
      <line x1="46" y1="12" x2="46" y2="22" stroke="rgba(160,225,255,0.5)" stroke-width="0.9"/>
      <line x1="41" y1="17" x2="51" y2="17" stroke="rgba(160,225,255,0.5)" stroke-width="0.9"/>
      <line x1="43" y1="14" x2="49" y2="20" stroke="rgba(160,225,255,0.3)" stroke-width="0.7"/>
      <line x1="49" y1="14" x2="43" y2="20" stroke="rgba(160,225,255,0.3)" stroke-width="0.7"/>
      <circle cx="54" cy="5" r="1.2" fill="rgba(180,235,255,0.55)"/>
      <circle cx="46" cy="3" r="0.8" fill="rgba(180,235,255,0.4)"/>
    </svg>
    <svg class="fx frost-bl" viewBox="0 0 55 55" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,55 Q12,44 0,30" stroke="rgba(140,210,255,0.3)" stroke-width="1" fill="none"/>
      <path d="M0,55 Q16,48 30,55" stroke="rgba(140,210,255,0.3)" stroke-width="1" fill="none"/>
      <circle cx="5"  cy="50" r="1"   fill="rgba(180,235,255,0.42)"/>
      <circle cx="14" cy="52" r="0.7" fill="rgba(180,235,255,0.32)"/>
      <line x1="10" y1="40" x2="10" y2="48" stroke="rgba(160,225,255,0.38)" stroke-width="0.8"/>
      <line x1="6"  y1="44" x2="14" y2="44" stroke="rgba(160,225,255,0.38)" stroke-width="0.8"/>
    </svg>
    <div class="flake f1">❄</div>
    <div class="flake f2">❄</div>
    <div class="flake f3">❄</div>`;
  }

  _warmHTML() {
    return `
    <div class="sun-glow"></div>
    <svg class="fx sun-rays" viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
      <line x1="55" y1="15" x2="62" y2="8"  stroke="rgba(255,180,0,0.6)" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="60" y1="25" x2="68" y2="22" stroke="rgba(255,180,0,0.5)" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="55" y1="35" x2="64" y2="35" stroke="rgba(255,180,0,0.5)" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="45" y1="12" x2="48" y2="4"  stroke="rgba(255,180,0,0.4)" stroke-width="1"   stroke-linecap="round"/>
      <line x1="62" y1="14" x2="66" y2="8"  stroke="rgba(255,180,0,0.35)" stroke-width="1"  stroke-linecap="round"/>
    </svg>
    <div class="warm-haze"></div>
    <div class="warm-waves">
      <div class="ww ww1"></div>
      <div class="ww ww2"></div>
      <div class="ww ww3"></div>
      <div class="ww ww4"></div>
    </div>`;
  }

  _heatHTML() {
    return `
    <div class="heat-glow-bg"></div>
    <div class="heat-embers">
      <div class="ember e1"></div>
      <div class="ember e2"></div>
      <div class="ember e3"></div>
      <div class="ember e4"></div>
      <div class="ember e5"></div>
    </div>
    <div class="heat-shimmer-wrap">
      <div class="hs hs1"></div>
      <div class="hs hs2"></div>
      <div class="hs hs3"></div>
      <div class="hs hs4"></div>
    </div>
    <div class="heat-blob"></div>`;
  }

  _render() {
    const cfg = this._config;
    const name = cfg.name || 'Pokój';
    const temp = this._tempVal;
    const hum  = this._humVal;
    const bat  = this._batVal;
    const st   = this._getTempState(temp);
    const hs   = this._getHumidityState(hum);

    const TUBE_TOP = 30;
    const TUBE_H   = 65;
    const fillH = Math.min(TUBE_H, (st.fillPct / 100) * TUBE_H);
    const fillY = TUBE_TOP + TUBE_H - fillH;

    // viewBox 200×150, tube x=158 w=12, bulb cx=164 cy=105 r=12
    const BULB_CY = 105;
    const isOffline = temp === null;
    const tempStr = isOffline ? '--°' : temp.toFixed(1) + '°';

    this.shadowRoot.innerHTML = `
<style>
  :host { display: block; width: 100%; height: 100%; }

  .card {
    position: relative;
    width: 100%;
    aspect-ratio: 4/3;
    border-radius: 18px;
    overflow: hidden;
    background: ${st.bg};
    border: 1px solid ${st.border};
    box-sizing: border-box;
    font-family: -apple-system, system-ui, sans-serif;
    cursor: default;
    transition: transform 0.15s ease;
    ${st.pulseAnim}
  }
  .card:active { transform: scale(0.97); }

  .name {
    position: absolute; top: 10px; left: 12px;
    font-size: 11px; font-weight: 500; z-index: 10;
    color: ${isOffline ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.55)'};
    pointer-events: none;
  }
  .pill {
    position: absolute; bottom: 10px; left: 12px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 8px; font-weight: 700; letter-spacing: 0.4px;
    background: ${st.pillBg}; border: 0.5px solid ${st.pillBorder};
    color: ${st.color}; white-space: nowrap; z-index: 10;
  }
  .humidity {
    position: absolute; top: 57%; left: 12px;
    font-size: 10px; font-weight: 600; z-index: 10;
    color: ${hs ? hs.color : 'transparent'};
    cursor: ${this._config.humidity_entity ? 'pointer' : 'default'};
  }
  .main-svg {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%; z-index: 3;
    pointer-events: none;
  }
  .temp-hit {
    position: absolute; inset: 0; z-index: 4; cursor: pointer;
  }

  /* ── battery ── */
  .bat-wrap {
    position: absolute; top: 9px; right: 10px; z-index: 12;
    display: flex; align-items: center; gap: 5px;
  }
  .bat-tip {
    font-size: 10px; font-weight: 600;
    color: rgba(255,255,255,.80);
    background: rgba(28,28,30,.92);
    border: .5px solid rgba(255,255,255,.15);
    border-radius: 6px; padding: 2px 6px;
    white-space: nowrap;
    opacity: 0; pointer-events: none;
    transition: opacity .15s;
    backdrop-filter: blur(8px);
  }
  .bat-wrap:hover .bat-tip { opacity: 1; }
  @media (max-width: 400px) { .bat-wrap { display: none; } }

  /* ── FROST ── */
  .fx { position: absolute; pointer-events: none; z-index: 2; }
  .frost-tl { top:0; left:0; width:90px; height:90px; opacity:0.55; }
  .frost-tr { top:0; right:0; width:60px; height:60px; opacity:0.42; }
  .frost-bl { bottom:0; left:0; width:55px; height:55px; opacity:0.35; }
  .flake {
    position: absolute; font-size: 10px;
    color: rgba(160,220,255,0.72); z-index: 2; pointer-events: none;
    animation: frost-float 3.4s ease-in-out infinite;
  }
  .f1 { top:7px; left:55px; animation-delay:0s; }
  .f2 { top:22px; left:40px; font-size:7px; opacity:0.55; animation-delay:0.7s; }
  .f3 { top:36px; left:62px; font-size:6px; opacity:0.4; animation-delay:1.3s; }

  /* ── WARM ── */
  .sun-glow {
    position:absolute; top:-22px; right:-22px;
    width:90px; height:90px; border-radius:50%; z-index:1; pointer-events:none;
    background: radial-gradient(circle, rgba(255,180,0,0.18) 0%, rgba(255,120,0,0.08) 50%, transparent 70%);
  }
  .sun-rays { top:0; right:0; width:70px; height:70px; opacity:0.42; z-index:2; }
  .warm-haze {
    position:absolute; bottom:0; left:0; right:0; height:55%; z-index:1; pointer-events:none;
    background: linear-gradient(to top, rgba(255,120,0,0.07), transparent);
  }
  .warm-waves {
    position:absolute; right:28px; bottom:30px;
    display:flex; gap:3px; align-items:flex-end; z-index:4; pointer-events:none;
  }
  .ww {
    width:2px; border-radius:2px;
    background: linear-gradient(to top, rgba(255,159,10,0.55), transparent);
    animation: warm-shimmer 2.4s ease-in-out infinite;
  }
  .ww1 { height:10px; animation-delay:0s; }
  .ww2 { height:14px; animation-delay:0.4s; }
  .ww3 { height:8px;  animation-delay:0.8s; }
  .ww4 { height:12px; animation-delay:0.2s; }

  /* ── HEAT ── */
  .heat-glow-bg {
    position:absolute; bottom:0; right:0; width:130px; height:100%;
    z-index:1; pointer-events:none;
    background: radial-gradient(ellipse at right bottom, rgba(255,60,0,0.14) 0%, transparent 65%);
  }
  .heat-blob {
    position:absolute; right:22px; bottom:20px;
    width:60px; height:18px; border-radius:50%;
    background: radial-gradient(ellipse, rgba(255,100,0,0.38) 0%, transparent 70%);
    filter: blur(3px); z-index:4; pointer-events:none;
  }
  .heat-embers {
    position:absolute; right:26px; bottom:22px;
    display:flex; gap:2px; align-items:flex-end;
    z-index:5; pointer-events:none;
  }
  .ember {
    border-radius: 50% 50% 30% 30%;
    transform-origin: bottom center;
  }
  .e1 { width:6px;  height:22px; background:linear-gradient(to top,#FF6B00,#FF3A00,rgba(255,100,0,0.25),transparent); animation:flicker1 1.4s ease-in-out infinite 0s; }
  .e2 { width:8px;  height:30px; background:linear-gradient(to top,#FF8C00,#FF4500,#FF2200,rgba(255,80,0,0.15),transparent); animation:flicker2 1.6s ease-in-out infinite 0.15s; }
  .e3 { width:6px;  height:20px; background:linear-gradient(to top,#FF6B00,#FF3A00,rgba(255,80,0,0.2),transparent); animation:flicker3 1.3s ease-in-out infinite 0.3s; }
  .e4 { width:5px;  height:16px; background:linear-gradient(to top,#FF8000,#FF3A00,transparent); animation:flicker1 1.5s ease-in-out infinite 0.45s; }
  .e5 { width:7px;  height:25px; background:linear-gradient(to top,#FF6B00,#FF4500,rgba(255,60,0,0.18),transparent); animation:flicker2 1.7s ease-in-out infinite 0.6s; }
  .heat-shimmer-wrap {
    position:absolute; right:20px; bottom:52px;
    display:flex; gap:3px; align-items:flex-end;
    z-index:4; pointer-events:none;
  }
  .hs {
    width:3px; border-radius:2px;
    background: linear-gradient(to top, rgba(255,80,40,0.62), transparent);
    animation: shimmer-heat 1.8s ease-in-out infinite;
  }
  .hs1 { height:14px; animation-delay:0s; }
  .hs2 { height:18px; animation-delay:0.25s; }
  .hs3 { height:11px; animation-delay:0.5s; }
  .hs4 { height:16px; animation-delay:0.12s; }

  /* ── KEYFRAMES ── */
  @keyframes frost-float {
    0%,100% { opacity:0.65; transform:translateY(0) rotate(0deg); }
    50%      { opacity:1;    transform:translateY(-3px) rotate(10deg); }
  }
  @keyframes frost-pulse {
    0%,100% { box-shadow:0 0 0 0 rgba(10,132,255,0); }
    50%      { box-shadow:0 0 0 8px rgba(10,132,255,0.14); }
  }
  @keyframes warm-pulse {
    0%,100% { box-shadow:0 0 0 0 rgba(255,159,10,0); }
    50%      { box-shadow:0 0 0 6px rgba(255,159,10,0.1); }
  }
  @keyframes heat-pulse {
    0%,100% { box-shadow:0 0 0 0 rgba(255,69,58,0); }
    50%      { box-shadow:0 0 0 8px rgba(255,69,58,0.16); }
  }
  @keyframes warm-shimmer {
    0%,100% { opacity:0.28; transform:scaleX(1) translateY(0); }
    50%      { opacity:0.6;  transform:scaleX(1.15) translateY(-2px); }
  }
  @keyframes flicker1 {
    0%,100% { opacity:0.85; transform:scaleX(1)    scaleY(1)    translateY(0); }
    25%      { opacity:1;    transform:scaleX(0.85) scaleY(1.12) translateY(-3px); }
    50%      { opacity:0.9;  transform:scaleX(1.1)  scaleY(0.95) translateY(-1px); }
    75%      { opacity:0.95; transform:scaleX(0.9)  scaleY(1.08) translateY(-4px); }
  }
  @keyframes flicker2 {
    0%,100% { opacity:0.7;  transform:scaleX(1)    scaleY(1)    translateY(0); }
    30%      { opacity:1;    transform:scaleX(1.15) scaleY(1.15) translateY(-5px); }
    60%      { opacity:0.8;  transform:scaleX(0.88) scaleY(0.92) translateY(-2px); }
  }
  @keyframes flicker3 {
    0%,100% { opacity:0.6;  transform:scaleX(1)   scaleY(1)   translateY(0); }
    40%      { opacity:0.95; transform:scaleX(1.2) scaleY(1.2) translateY(-6px); }
    70%      { opacity:0.75; transform:scaleX(0.85) scaleY(0.9) translateY(-3px); }
  }
  @keyframes shimmer-heat {
    0%,100% { opacity:0.4; transform:scaleX(1) translateY(0); }
    33%      { opacity:0.8; transform:scaleX(1.2) translateY(-3px); }
    66%      { opacity:0.5; transform:scaleX(0.85) translateY(-5px); }
  }
</style>

<div class="card">
  ${st.effect === 'frost' ? this._frostHTML() : ''}
  ${st.effect === 'warm'  ? this._warmHTML()  : ''}
  ${st.effect === 'heat'  ? this._heatHTML()  : ''}

  <div class="name">${name}</div>
  ${this._batteryHTML(bat)}
  <div class="temp-hit" id="temp-hit"></div>

  <svg class="main-svg" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${st.gradStops[0]}"/>
        <stop offset="100%" stop-color="${st.gradStops[1]}"/>
      </linearGradient>
      <clipPath id="tube-clip">
        <rect x="158" y="${TUBE_TOP}" width="12" height="${TUBE_H}" rx="6"/>
      </clipPath>
    </defs>

    <!-- temp value -->
    <text x="12" y="68"
      fill="${isOffline ? 'rgba(255,255,255,0.15)' : 'white'}"
      font-size="32" font-weight="700"
      font-family="-apple-system,system-ui"
      letter-spacing="-2">${tempStr}</text>

    <!-- tube background -->
    <rect x="158" y="${TUBE_TOP}" width="12" height="${TUBE_H}" rx="6"
      fill="rgba(255,255,255,0.04)"
      stroke="${isOffline ? 'rgba(255,255,255,0.07)' : st.border}"
      stroke-width="1"/>

    <!-- tube fill -->
    ${!isOffline && fillH > 0 ? `
    <rect x="158" y="${fillY}" width="12" height="${fillH}"
      fill="url(#grad)"
      clip-path="url(#tube-clip)"/>
    ` : ''}

    <!-- tick marks -->
    <line x1="170" y1="${TUBE_TOP + 10}" x2="175" y2="${TUBE_TOP + 10}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <line x1="170" y1="${TUBE_TOP + 25}" x2="175" y2="${TUBE_TOP + 25}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <line x1="170" y1="${TUBE_TOP + 40}" x2="175" y2="${TUBE_TOP + 40}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <line x1="170" y1="${TUBE_TOP + 55}" x2="175" y2="${TUBE_TOP + 55}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

    <!-- bulb glow -->
    ${!isOffline ? `<circle cx="164" cy="${BULB_CY}" r="14" fill="${st.glowColor}"/>` : ''}

    <!-- bulb ring glow -->
    <circle cx="164" cy="${BULB_CY}" r="12"
      fill="none"
      stroke="${isOffline ? 'rgba(255,255,255,0)' : st.glowColor}"
      stroke-width="${st.glowWidth}"/>

    <!-- bulb body -->
    <circle cx="164" cy="${BULB_CY}" r="12"
      fill="${isOffline ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.15)'}"
      stroke="${isOffline ? 'rgba(255,255,255,0.1)' : st.bulbColor}"
      stroke-width="1.5"/>

    <!-- bulb fill -->
    <circle cx="164" cy="${BULB_CY}" r="7.5"
      fill="${isOffline ? 'rgba(255,255,255,0.08)' : st.bulbColor}"/>
  </svg>

  ${hs ? `<div class="humidity" id="hum-hit">${hs.label}</div>` : ''}
  <div class="pill">${st.label}</div>
</div>`;

    this.shadowRoot.getElementById('temp-hit')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._config.temp_entity },
      }));
    });
    if (this._config.humidity_entity) {
      this.shadowRoot.getElementById('hum-hit')?.addEventListener('click', e => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true,
          detail: { entityId: this._config.humidity_entity },
        }));
      });
    }
  }

  getCardSize() { return 3; }
}

customElements.define('aha-temp-humidity-card', TempHumidityCard);
if (!customElements.get('temp-humidity-card'))
  customElements.define('temp-humidity-card', class extends TempHumidityCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-temp-humidity-card',
  name:        'Temp & Humidity Card',
  preview:     false,
  description: 'Kafelek temperatury i wilgotności z termometrem i efektami wizualnymi (mróz, ciepło, upał).',
});