function _hexToRgb(hex) {
  // handles #rrggbb and rgba(...) / rgb(...) passthrough
  if (!hex || hex[0] !== '#') return '142,142,147';
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0,2),16);
  const g = parseInt(h.substring(2,4),16);
  const b = parseInt(h.substring(4,6),16);
  return `${r},${g},${b}`;
}

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
    if (pct === null || pct >= 25) return ''; /* show only when low */
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

    const isOffline = temp === null;
    const tempStr   = isOffline ? '--°' : temp.toFixed(1) + '°';

    /* icon per state */
    const icon = isOffline       ? 'mdi:thermometer-off'
               : st.effect === 'frost' ? 'mdi:snowflake'
               : st.effect === 'heat'  ? 'mdi:fire'
               : st.effect === 'warm'  ? 'mdi:weather-sunny'
               : 'mdi:thermometer';

    /* map st colours to design system */
    const accent   = st.color;
    const bg       = st.bg;
    const border   = st.border;

    /* humidity secondary line */
    const humStr = hs ? `💧 ${hum.toFixed(0)}%` : '';
    const humColor = hs ? hs.color : '#636366';

    this.shadowRoot.innerHTML = `
<style>
  :host { display: block; width: 100%; height: 100%; }

  .card {
    border-radius: 18px;
    padding: 14px;
    display: grid;
    grid-template-rows: auto 1fr auto auto;
    aspect-ratio: 1/1;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.15s ease, border-color 0.4s ease;
    background: ${bg};
    border: 1px solid ${border};
    box-sizing: border-box;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    ${st.pulseAnim}
  }
  .card:active { transform: scale(0.96); }

  /* top row: icon badge + name */
  .top-bar {
    display: flex;
    align-items: center;
    gap: 5px;
    position: relative;
    z-index: 2;
    min-width: 0;
    margin-left: -4px; /* pull icon ~4px toward card edge */
  }
  .spacer { /* fills 1fr row, pushes primary/secondary to bottom */ }

  /* glow overlay */
  .glow {
    position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse at 30% 30%, ${isOffline ? 'transparent' : st.glowColor.replace(/[\d.]+\)$/, m => (parseFloat(m)*0.7).toFixed(2)+')')} 0%, transparent 68%);
    transition: background 0.4s ease;
  }

  /* icon badge */
  .icon-wrap {
    position: relative; width: 30px; height: 30px;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .icon-bg {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: ${isOffline ? 'rgba(142,142,147,0.12)' : `rgba(${_hexToRgb(accent)}, 0.18)`};
    transition: background 0.4s ease; z-index: 2; position: relative;
  }
  ha-icon { --mdc-icon-size: 16px; color: ${isOffline ? '#636366' : accent}; }

  /* text rows */
  .name {
    font-size: 12px; font-weight: 500; color: #a1a1a6;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    flex: 1; min-width: 0;
  }
  .primary {
    font-size: 22px; font-weight: 600;
    color: ${isOffline ? '#636366' : accent};
    position: relative; z-index: 2; line-height: 1.1;
    transition: color 0.4s ease;
  }
  .secondary {
    font-size: 11px; font-weight: 400; color: ${humStr ? humColor : '#636366'};
    margin-top: 2px; position: relative; z-index: 2;
    transition: color 0.4s ease;
    cursor: ${cfg.humidity_entity ? 'pointer' : 'default'};
  }

  /* ── mobile: temperature fills card, name at bottom ── */
  @media (max-width: 600px) {
    .bat-wrap  { display: none !important; }
    .secondary { display: none; }
    .card      { grid-template-rows: 1fr auto; padding: 10px; }
    .top-bar   { display: contents; }
    .icon-wrap { display: none; }
    .name      { grid-row: 2; font-size: 11px; }
    .spacer    { display: none; }
    .primary   { grid-row: 1; align-self: center; }
  }

  /* battery */
  .bat-wrap {
    position: absolute; top: 9px; right: 10px; z-index: 12;
    display: flex; align-items: center; gap: 5px;
  }
  .bat-tip {
    font-size: 10px; font-weight: 600; color: rgba(255,255,255,.80);
    background: rgba(28,28,30,.92); border: .5px solid rgba(255,255,255,.15);
    border-radius: 6px; padding: 2px 6px; white-space: nowrap;
    opacity: 0; pointer-events: none; transition: opacity .15s;
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
    position:absolute; right:14px; bottom:14px;
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
    position:absolute; bottom:0; right:0; width:100%; height:60%;
    z-index:1; pointer-events:none;
    background: radial-gradient(ellipse at right bottom, rgba(255,60,0,0.14) 0%, transparent 65%);
  }
  .heat-blob {
    position:absolute; right:14px; bottom:14px;
    width:50px; height:16px; border-radius:50%;
    background: radial-gradient(ellipse, rgba(255,100,0,0.38) 0%, transparent 70%);
    filter: blur(3px); z-index:4; pointer-events:none;
  }
  .heat-embers {
    position:absolute; right:18px; bottom:16px;
    display:flex; gap:2px; align-items:flex-end;
    z-index:5; pointer-events:none;
  }
  .ember { border-radius: 50% 50% 30% 30%; transform-origin: bottom center; }
  .e1 { width:6px;  height:22px; background:linear-gradient(to top,#FF6B00,#FF3A00,rgba(255,100,0,0.25),transparent); animation:flicker1 1.4s ease-in-out infinite 0s; }
  .e2 { width:8px;  height:30px; background:linear-gradient(to top,#FF8C00,#FF4500,#FF2200,rgba(255,80,0,0.15),transparent); animation:flicker2 1.6s ease-in-out infinite 0.15s; }
  .e3 { width:6px;  height:20px; background:linear-gradient(to top,#FF6B00,#FF3A00,rgba(255,80,0,0.2),transparent); animation:flicker3 1.3s ease-in-out infinite 0.3s; }
  .e4 { width:5px;  height:16px; background:linear-gradient(to top,#FF8000,#FF3A00,transparent); animation:flicker1 1.5s ease-in-out infinite 0.45s; }
  .e5 { width:7px;  height:25px; background:linear-gradient(to top,#FF6B00,#FF4500,rgba(255,60,0,0.18),transparent); animation:flicker2 1.7s ease-in-out infinite 0.6s; }
  .heat-shimmer-wrap {
    position:absolute; right:12px; bottom:46px;
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
  <div class="glow"></div>
  ${st.effect === 'frost' ? this._frostHTML() : ''}
  ${st.effect === 'warm'  ? this._warmHTML()  : ''}
  ${st.effect === 'heat'  ? this._heatHTML()  : ''}

  ${this._batteryHTML(bat)}

  <div class="top-bar">
    <div class="icon-wrap">
      <div class="icon-bg">
        <ha-icon icon="${icon}"></ha-icon>
      </div>
    </div>
    <div class="name" id="temp-hit">${name}</div>
  </div>

  <div class="spacer"></div>
  <div class="primary">${tempStr}</div>
  <div class="secondary" id="hum-hit">${humStr}</div>
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