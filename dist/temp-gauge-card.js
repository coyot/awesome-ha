/**
 * temp-gauge-card.js — AHA Temperature & Humidity Gauge Card
 *
 * Dual-arc SVG gauge:
 *   outer arc = temperature in configured range (temperature-reactive color)
 *   inner arc = humidity 0–100%
 *
 * Apple Home glassmorphism • frost / fire animations • alert pills
 * Hover over each arc: highlights arc + shows glassmorphism tooltip
 *
 * Config:
 *   name, icon, temp_entity, humidity_entity, battery_entity
 *   min_temp (default -10), max_temp (default 40)
 */

class AhaTempGaugeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._uid = Math.random().toString(36).slice(2, 7);
  }

  static getStubConfig() {
    return {
      name: 'Salon',
      temp_entity: 'sensor.salon_temperature',
      humidity_entity: 'sensor.salon_humidity',
      battery_entity: '',
      icon: '🛋️',
      min_temp: -10,
      max_temp: 40,
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

  _val(entity) {
    if (!this._hass || !entity) return null;
    const s = this._hass.states[entity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return parseFloat(s.state);
  }

  _tempState(t) {
    if (t === null) return {
      key: 'offline', cardBg: '#1c1c1e', cardBorder: 'rgba(255,255,255,0.07)',
      glowCss: '', tempColor: '#3a3a3c', iconBg: 'rgba(255,255,255,0.06)',
      arcG0: 'rgba(255,255,255,0.18)', arcG1: 'rgba(255,255,255,0.06)', label: 'offline',
    };
    if (t < 5) return {
      key: 'frost', cardBg: '#0b1420', cardBorder: 'rgba(90,200,250,0.35)',
      glowCss: 'radial-gradient(ellipse at 30% 25%, rgba(90,200,250,0.2) 0%, transparent 58%)',
      tempColor: '#5AC8FA', iconBg: 'rgba(90,200,250,0.15)',
      arcG0: '#8FDDFF', arcG1: '#1f7fd8', label: '❄️ mróz',
    };
    if (t < 17) return {
      key: 'cold', cardBg: '#101820', cardBorder: 'rgba(90,200,250,0.15)',
      glowCss: 'radial-gradient(ellipse at 30% 25%, rgba(90,200,250,0.10) 0%, transparent 55%)',
      tempColor: '#7dd4f8', iconBg: 'rgba(90,200,250,0.11)',
      arcG0: '#c0ecff', arcG1: '#5ab8ee', label: 'zimno',
    };
    if (t < 26) return {
      key: 'comfort', cardBg: '#1c1c1e', cardBorder: 'rgba(255,255,255,0.08)',
      glowCss: '',
      tempColor: '#ffffff', iconBg: 'rgba(255,255,255,0.08)',
      arcG0: '#5cf087', arcG1: '#1c9e40', label: 'komfort',
    };
    if (t < 31) return {
      key: 'warm', cardBg: '#1e1508', cardBorder: 'rgba(255,159,10,0.22)',
      glowCss: 'radial-gradient(ellipse at 70% 20%, rgba(255,159,10,0.15) 0%, transparent 55%)',
      tempColor: '#FF9F0A', iconBg: 'rgba(255,159,10,0.14)',
      arcG0: '#FFE066', arcG1: '#e87800', label: 'za ciepło',
    };
    return {
      key: 'fire', cardBg: '#1a0800', cardBorder: 'rgba(255,69,58,0.45)',
      glowCss: 'radial-gradient(ellipse at 50% 80%, rgba(255,80,0,0.30) 0%, transparent 62%)',
      tempColor: '#FF453A', iconBg: 'rgba(255,69,58,0.17)',
      arcG0: '#FF6B6B', arcG1: '#cc1500', label: '🔥 upał',
    };
  }

  _humArcColor(h) {
    if (h === null) return 'rgba(255,255,255,0.15)';
    if (h < 35)  return '#FF9F0A';
    if (h < 66)  return '#30D158';
    if (h < 81)  return '#0A84FF';
    return '#FF453A';
  }

  _render() {
    const cfg  = this._config;
    const name = cfg.name || 'Pokój';
    const icon = cfg.icon || '🏠';
    const uid  = this._uid;

    const temp = this._val(cfg.temp_entity);
    const hum  = this._val(cfg.humidity_entity);
    const bat  = this._val(cfg.battery_entity);

    const st       = this._tempState(temp);
    const humCol   = this._humArcColor(hum);
    const isOffline = temp === null;

    const minT = parseFloat(cfg.min_temp ?? -10);
    const maxT = parseFloat(cfg.max_temp ?? 40);

    const tempStr = isOffline ? '—' : temp.toFixed(1) + '°';
    const humStr  = hum !== null ? hum.toFixed(0) + '%' : '—';

    const fillPct = isOffline ? 0 : Math.max(0, Math.min(100, (temp - minT) / (maxT - minT) * 100));
    const humPct  = hum !== null ? Math.max(0, Math.min(100, hum)) : 0;

    /* ── SVG gauge geometry ── */
    const CX = 100, CY = 90;
    const R1 = 74, SW1 = 13;   // temp ring
    const R2 = 54, SW2 = 10;   // hum ring
    const FRAC = 0.75;          // 270°

    const C1 = 2 * Math.PI * R1, ARC1 = FRAC * C1;
    const C2 = 2 * Math.PI * R2, ARC2 = FRAC * C2;

    const tempFillLen = isOffline ? 0 : (fillPct / 100) * ARC1;
    const humFillLen  = hum !== null ? (humPct / 100) * ARC2 : 0;

    // Indicator dot — end of temp fill arc
    const dotRad = (135 + (isOffline ? 0 : (fillPct / 100) * 270)) * Math.PI / 180;
    const dotX = CX + R1 * Math.cos(dotRad);
    const dotY = CY + R1 * Math.sin(dotRad);

    // Tick marks at 25 / 50 / 75 % of temp range
    const _tick = pct => {
      const a  = (135 + pct * 270) * Math.PI / 180;
      const ri = R1 - SW1 / 2 - 1.5;
      const ro = R1 + SW1 / 2 + 2.5;
      return `<line x1="${(CX+ri*Math.cos(a)).toFixed(1)}" y1="${(CY+ri*Math.sin(a)).toFixed(1)}"
               x2="${(CX+ro*Math.cos(a)).toFixed(1)}" y2="${(CY+ro*Math.sin(a)).toFixed(1)}"
               stroke="rgba(255,255,255,0.14)" stroke-width="1" stroke-linecap="round"/>`;
    };
    const ticks = [0.25, 0.5, 0.75].map(_tick).join('');

    // Min / max labels just outside the ring
    const LR = R1 + SW1 / 2 + 9;
    const minA = 135 * Math.PI / 180;
    const maxA = (135 + 270) * Math.PI / 180;
    const fmtT = v => v === 0 ? '0°' : v > 0 ? `+${v}°` : `${v}°`;

    // Tooltip shared rect geometry (centers in the ring opening)
    const TT = { x: 61, y: 65, w: 78, h: 50, rx: 11 };

    // Extreme-state arc glow
    const useGlow = st.key === 'frost' || st.key === 'fire' || st.key === 'warm';

    /* ── Humidity arc color description ── */
    const humLabel = hum === null ? '—' : hum < 35 ? 'sucho' : hum < 66 ? 'komfort' : hum < 81 ? 'wilgotno' : 'b. wilgotno';

    /* ── Pills — subtle state indicators ── */
    const pillDefs = {
      frost:   { bg: 'rgba(90,200,250,0.10)',  border: 'rgba(90,200,250,0.22)',  color: '#5AC8FA66' },
      cold:    { bg: 'rgba(90,200,250,0.07)',  border: 'rgba(90,200,250,0.15)',  color: '#7dd4f866' },
      comfort: { bg: 'rgba(48,209,88,0.08)',   border: 'rgba(48,209,88,0.18)',   color: '#30D15866' },
      warm:    { bg: 'rgba(255,159,10,0.09)',  border: 'rgba(255,159,10,0.20)',  color: '#FF9F0A66' },
      fire:    { bg: 'rgba(255,69,58,0.10)',   border: 'rgba(255,69,58,0.22)',   color: '#FF453A66' },
      offline: { bg: 'rgba(100,100,100,0.07)', border: 'rgba(100,100,100,0.15)', color: '#63636666' },
    };
    const pills = [];
    if (temp !== null) {
      const p = pillDefs[st.key] || pillDefs.offline;
      pills.push({ label: st.label, ...p });
    }
    if (hum !== null) {
      if      (hum < 35)  pills.push({ label: '🏜️ sucho',    bg: 'rgba(255,159,10,0.08)', border: 'rgba(255,159,10,0.18)', color: '#FF9F0A66' });
      else if (hum >= 81) pills.push({ label: '💦 wilgotno', bg: 'rgba(10,132,255,0.08)', border: 'rgba(10,132,255,0.18)', color: '#0A84FF66' });
    }
    const pillsHTML = pills.map(p =>
      `<span class="pill" style="background:${p.bg};border-color:${p.border};color:${p.color}">${p.label}</span>`
    ).join('');

    /* ── Battery ── */
    const batHTML = (() => {
      if (bat === null || bat >= 25) return '';
      const col   = bat < 20 ? '#FF453A' : 'rgba(255,255,255,0.42)';
      const fillW = Math.round((Math.max(0, Math.min(100, bat)) / 100) * 13);
      return `
        <div class="bat">
          <span class="bat-pct">${Math.round(bat)}%</span>
          <svg width="18" height="9" viewBox="0 0 22 11">
            <rect x=".5" y=".5" width="17" height="10" rx="2.5" fill="none" stroke="${col}" stroke-width="1.1"/>
            <rect x="18" y="3.5" width="2.5" height="4" rx="1" fill="${col}" opacity=".7"/>
            ${fillW > 0 ? `<rect x="2" y="2" width="${fillW}" height="6" rx="1.5" fill="${col}"/>` : ''}
          </svg>
        </div>`;
    })();

    /* ── SVG tooltip helper ── */
    const _tooltip = (label, valStr, valColor) => `
      <g class="arc-tooltip" pointer-events="none">
        <rect x="${TT.x}" y="${TT.y}" width="${TT.w}" height="${TT.h}" rx="${TT.rx}"
          fill="rgba(14,14,18,0.93)" stroke="rgba(255,255,255,0.10)" stroke-width="0.8"/>
        <text x="${CX}" y="${CY - 9}"
          text-anchor="middle" dominant-baseline="central"
          font-family="-apple-system,system-ui,sans-serif"
          font-size="8.5" font-weight="500" fill="rgba(255,255,255,0.40)">${label}</text>
        <text x="${CX}" y="${CY + 11}"
          text-anchor="middle" dominant-baseline="central"
          font-family="-apple-system,system-ui,sans-serif"
          font-size="22" font-weight="700" letter-spacing="-1"
          fill="${valColor}">${valStr}</text>
      </g>`;

    this.shadowRoot.innerHTML = `
<style>
  :host { display: block; width: 100%; height: 100%; }

  .card {
    width: 100%; height: 100%;
    border-radius: 20px;
    padding: 12px 12px 8px;
    box-sizing: border-box;
    display: flex; flex-direction: column;
    overflow: hidden; position: relative;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent; user-select: none; cursor: default;
    background: ${st.cardBg};
    border: 1px solid ${st.cardBorder};
    transition: background 0.5s ease, border-color 0.5s ease, transform 0.15s ease;
  }
  .card:active { transform: scale(0.97); }

  .bg-glow {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background: ${st.glowCss || 'none'}; transition: background 0.5s ease;
  }

  /* ── frost ── */
  @keyframes frost-pulse  { 0%,100%{opacity:.55} 50%{opacity:1} }
  @keyframes frost-card   { 0%,100%{box-shadow:0 0 0 0 rgba(90,200,250,0)} 50%{box-shadow:0 0 22px 3px rgba(90,200,250,.18)} }
  @keyframes frost-arc    { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.28) saturate(1.3)} }
  @keyframes frost-dot    { 0%,100%{opacity:.9} 50%{opacity:1;filter:brightness(1.4)} }

  /* ── fire ── */
  @keyframes fire-card    { 0%,100%{box-shadow:0 0 0 0 rgba(255,69,58,0)} 50%{box-shadow:0 0 26px 4px rgba(255,80,20,.22)} }
  @keyframes fire-arc     { 0%,100%{filter:brightness(1) saturate(1);opacity:.92} 33%{filter:brightness(1.3) saturate(1.4);opacity:1} 66%{filter:brightness(.88);opacity:.84} }
  @keyframes fire-shimmer { 0%,100%{opacity:.6;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.06)} }

  .card.frost { animation: frost-card 3.5s ease-in-out infinite; }
  .card.fire  { animation: fire-card  2.5s ease-in-out infinite; }
  .card.frost .arc-temp-fill { animation: frost-arc 3.5s ease-in-out infinite; }
  .card.fire  .arc-temp-fill { animation: fire-arc  2.2s ease-in-out infinite; }
  .card.frost .dot-outer     { animation: frost-dot 3.5s ease-in-out infinite; }

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

  /* ── header ── */
  .header {
    display:flex; align-items:center; gap:8px;
    flex-shrink:0; position:relative; z-index:5;
  }
  .icon-wrap {
    width:28px; height:28px; border-radius:8px;
    background:${st.iconBg}; display:flex; align-items:center; justify-content:center;
    font-size:15px; flex-shrink:0; transition:background .5s ease;
  }
  .room-name {
    font-size:11px; font-weight:600; color:#a1a1a6;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    flex:1; min-width:0; letter-spacing:.02em;
  }
  .bat { display:flex; align-items:center; gap:4px; flex-shrink:0; }
  .bat-pct {
    font-size:9px; font-weight:600; color:rgba(255,255,255,.8);
    background:rgba(28,28,30,.92); border:.5px solid rgba(255,255,255,.14);
    border-radius:4px; padding:1px 4px;
    opacity:0; pointer-events:none; transition:opacity .15s; backdrop-filter:blur(8px);
  }
  .bat:hover .bat-pct { opacity:1; }

  /* ── gauge ── */
  .gauge-wrap {
    flex:1; min-height:0;
    display:flex; align-items:center; justify-content:center;
    position:relative; z-index:2; margin-top:4px;
  }
  .gauge-svg { width:100%; height:100%; overflow:visible; cursor:default; }

  /* ── arc hover: highlight + tooltip ── */
  .arc-tooltip {
    opacity:0; transition:opacity .18s ease;
    pointer-events:none;
  }
  /* show tooltip + dim the center temp value */
  .gauge-svg:has(#g-temp:hover) .arc-tooltip-temp,
  .gauge-svg:has(#g-hum:hover)  .arc-tooltip-hum  { opacity:1; }
  .gauge-svg:has(#g-temp:hover) .center-val,
  .gauge-svg:has(#g-hum:hover)  .center-val        { opacity:0; }

  /* arc fill brightens on hover */
  #g-temp .arc-temp-fill, #g-hum .arc-hum-fill { transition: filter .2s ease; }
  #g-temp:hover .arc-temp-fill { filter:brightness(1.35) saturate(1.15) !important; }
  #g-hum:hover  .arc-hum-fill  { filter:brightness(1.35) saturate(1.15); }

  /* arc track subtly brightens on hover */
  #g-temp:hover .arc-track-temp,
  #g-hum:hover  .arc-track-hum  { filter:brightness(2.5); }

  /* SVG text classes */
  .center-val {
    font-family:-apple-system,system-ui,sans-serif;
    font-size:30px; font-weight:700; letter-spacing:-1.5px;
    fill:${st.tempColor}; transition:opacity .18s ease;
    cursor:pointer;
  }
  .range-text {
    font-family:-apple-system,system-ui,sans-serif;
    font-size:8px; font-weight:500; fill:rgba(255,255,255,.2);
  }

  /* ── pills ── */
  .pills {
    display:flex; align-items:center; justify-content:center;
    gap:4px; flex-wrap:wrap; flex-shrink:0;
    position:relative; z-index:5; margin-top:4px; min-height:16px;
  }
  .pill {
    display:inline-flex; align-items:center;
    padding:1px 6px; border-radius:99px; border:.5px solid;
    font-size:8px; font-weight:500; letter-spacing:.01em;
    white-space:nowrap; opacity:.75;
  }
</style>

<div class="card ${st.key}">
  <div class="bg-glow"></div>

  <div class="frost-overlay">
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet">
      <path d="M0,0 Q20,30 0,62"  stroke="rgba(140,210,255,.28)" stroke-width="1.3" fill="none"/>
      <path d="M0,0 Q34,14 68,0"  stroke="rgba(140,210,255,.28)" stroke-width="1.3" fill="none"/>
      <path d="M0,0 Q28,28 48,48" stroke="rgba(140,210,255,.18)" stroke-width="1"   fill="none"/>
      <line x1="22" y1="22" x2="22" y2="42" stroke="rgba(170,230,255,.60)" stroke-width="1.3"/>
      <line x1="12" y1="32" x2="32" y2="32" stroke="rgba(170,230,255,.60)" stroke-width="1.3"/>
      <line x1="15" y1="25" x2="29" y2="39" stroke="rgba(170,230,255,.30)" stroke-width="1"/>
      <line x1="29" y1="25" x2="15" y2="39" stroke="rgba(170,230,255,.30)" stroke-width="1"/>
      <line x1="48" y1="11" x2="48" y2="25" stroke="rgba(170,230,255,.38)" stroke-width="1"/>
      <line x1="41" y1="18" x2="55" y2="18" stroke="rgba(170,230,255,.38)" stroke-width="1"/>
      <circle cx="8"  cy="8"  r="1.6" fill="rgba(210,245,255,.70)"/>
      <circle cx="30" cy="7"  r="1.1" fill="rgba(210,245,255,.52)"/>
      <circle cx="6"  cy="36" r="1.3" fill="rgba(210,245,255,.48)"/>
      <circle cx="50" cy="6"  r="1.0" fill="rgba(210,245,255,.42)"/>
      <circle cx="11" cy="55" r="1.1" fill="rgba(210,245,255,.36)"/>
      <circle cx="70" cy="10" r="0.9" fill="rgba(210,245,255,.30)"/>
    </svg>
  </div>

  <div class="fire-overlay">
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <defs>
        <radialGradient id="hr-${uid}" cx="50%" cy="100%" r="65%">
          <stop offset="0%"   stop-color="rgba(255,90,0,.24)"/>
          <stop offset="55%"  stop-color="rgba(200,40,0,.08)"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#hr-${uid})"/>
    </svg>
  </div>

  ${batHTML}

  <div class="header">
    <div class="icon-wrap">${icon}</div>
    <div class="room-name">${name}</div>
  </div>

  <div class="gauge-wrap">
    <svg class="gauge-svg" viewBox="0 0 200 166" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tg-${uid}" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${st.arcG1}"/>
          <stop offset="100%" stop-color="${st.arcG0}"/>
        </linearGradient>
        <filter id="arc-glow-${uid}" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="dot-glow-${uid}" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="cg-${uid}" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stop-color="${isOffline ? 'transparent' : st.arcG1 + '1a'}"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
      </defs>

      <!-- center ambient glow -->
      <circle cx="${CX}" cy="${CY}" r="${R2 - SW2/2 - 4}" fill="url(#cg-${uid})"/>

      <!-- ── temp VALUE — shown when no arc is hovered ── -->
      <text id="temp-hit" class="center-val"
        x="${CX}" y="${CY}"
        text-anchor="middle" dominant-baseline="central">${tempStr}</text>

      <!-- ══ TEMP ARC GROUP — hover triggers tooltip ══ -->
      <g id="g-temp">

        <!-- track -->
        <circle class="arc-track-temp" cx="${CX}" cy="${CY}" r="${R1}"
          fill="none" stroke="rgba(255,255,255,0.055)" stroke-width="${SW1}"
          stroke-dasharray="${ARC1.toFixed(2)} ${C1.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"/>

        <!-- fill -->
        ${tempFillLen > 0.5 ? `
        <circle class="arc-temp-fill" cx="${CX}" cy="${CY}" r="${R1}"
          fill="none" stroke="url(#tg-${uid})" stroke-width="${SW1}"
          stroke-dasharray="${tempFillLen.toFixed(2)} ${C1.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"
          ${useGlow ? `filter="url(#arc-glow-${uid})"` : ''}/>
        ` : ''}

        <!-- tick marks -->
        ${ticks}

        <!-- invisible hit area (full 270° arc, wider stroke) -->
        <circle cx="${CX}" cy="${CY}" r="${R1}"
          fill="none" stroke="rgba(255,255,255,0.005)" stroke-width="24"
          stroke-dasharray="${ARC1.toFixed(2)} ${C1.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"
          cursor="pointer" pointer-events="stroke"/>

        <!-- tooltip: Temperatura -->
        ${_tooltip('Temperatura', tempStr, st.tempColor).replace('class="arc-tooltip"', 'class="arc-tooltip arc-tooltip-temp"')}
      </g>

      <!-- ══ HUM ARC GROUP — hover triggers tooltip ══ -->
      <g id="g-hum">

        <!-- track -->
        <circle class="arc-track-hum" cx="${CX}" cy="${CY}" r="${R2}"
          fill="none" stroke="rgba(255,255,255,0.040)" stroke-width="${SW2}"
          stroke-dasharray="${ARC2.toFixed(2)} ${C2.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"/>

        <!-- fill -->
        ${humFillLen > 0.5 ? `
        <circle class="arc-hum-fill" cx="${CX}" cy="${CY}" r="${R2}"
          fill="none" stroke="${humCol}" stroke-width="${SW2}"
          stroke-dasharray="${humFillLen.toFixed(2)} ${C2.toFixed(2)}"
          stroke-linecap="round" stroke-opacity="0.88"
          transform="rotate(135,${CX},${CY})"/>
        ` : ''}

        <!-- invisible hit area -->
        <circle cx="${CX}" cy="${CY}" r="${R2}"
          fill="none" stroke="rgba(255,255,255,0.005)" stroke-width="20"
          stroke-dasharray="${ARC2.toFixed(2)} ${C2.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"
          cursor="pointer" pointer-events="stroke"/>

        <!-- tooltip: Wilgotność -->
        ${_tooltip('Wilgotność ' + humLabel, humStr, humCol).replace('class="arc-tooltip"', 'class="arc-tooltip arc-tooltip-hum"')}
      </g>

      <!-- ── indicator dot ── -->
      ${!isOffline && tempFillLen > 3 ? `
      <circle class="dot-outer" cx="${dotX.toFixed(2)}" cy="${dotY.toFixed(2)}" r="5"
        fill="${st.arcG0}" opacity="0.85" filter="url(#dot-glow-${uid})"/>
      <circle cx="${dotX.toFixed(2)}" cy="${dotY.toFixed(2)}" r="2.8"
        fill="rgba(255,255,255,0.95)"/>
      ` : ''}

      <!-- ── range labels ── -->
      <text x="${(CX + LR * Math.cos(minA)).toFixed(1)}" y="${(CY + LR * Math.sin(minA) + 3).toFixed(1)}"
        text-anchor="end" class="range-text">${fmtT(minT)}</text>
      <text x="${(CX + LR * Math.cos(maxA)).toFixed(1)}" y="${(CY + LR * Math.sin(maxA) + 3).toFixed(1)}"
        text-anchor="start" class="range-text">${fmtT(maxT)}</text>
    </svg>
  </div>

  <div class="pills">${pillsHTML}</div>
</div>`;

    /* click → more-info */
    this.shadowRoot.getElementById('g-temp')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: cfg.temp_entity },
      }));
    });
    if (cfg.humidity_entity) {
      this.shadowRoot.getElementById('g-hum')?.addEventListener('click', e => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true,
          detail: { entityId: cfg.humidity_entity },
        }));
      });
    }
    /* temp text click (fallback when center visible) */
    this.shadowRoot.getElementById('temp-hit')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: cfg.temp_entity },
      }));
    });
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
  description: 'Podwójny gauge (łuk): temperatura na zewnątrz, wilgotność wewnątrz. Hover = tooltip z wartością. Apple Home dark glassmorphism.',
});
