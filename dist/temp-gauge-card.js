/**
 * temp-gauge-card.js — AHA Temperature & Humidity Gauge Card
 *
 * Layout:
 *   gauge    — dual-arc (temp outer, hum inner); room icon embedded inside
 *   pills    — absolute overlay top-right, only non-normal states
 *   bottom   — room name HTML, muted
 *
 * Hover focus mode:
 *   arc hovered  → brightens, tooltip appears
 *   opposite arc → dims to 20%
 *   chrome       → dims to 30%
 *
 * Room icons (room_type config key):
 *   salon | sypialnia | biuro | lazienka | pokoj_dzieciecy | pergola | ogrod
 *   Falls back to cfg.icon emoji if room_type not set.
 */

/* ─── macOS-style white room icons (SVG paths, coordinate origin = icon center) ─── */
const S = `fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"`;
const ROOM_ICONS = {

  salon: `
    <rect ${S} x="-6" y="-8.5" width="12" height="7.5" rx="1.5"/>
    <rect ${S} x="-8.5" y="-1" width="17" height="5" rx="1.5"/>
    <rect ${S} x="-11" y="-3" width="2.5" height="7.5" rx="1.5"/>
    <rect ${S} x="8.5" y="-3" width="2.5" height="7.5" rx="1.5"/>
    <line ${S} x1="-7" y1="4" x2="-7" y2="7"/>
    <line ${S} x1="7" y1="4" x2="7" y2="7"/>`,

  sypialnia: `
    <rect ${S} x="-8.5" y="-8.5" width="17" height="4" rx="1.5"/>
    <rect ${S} x="-8.5" y="-4.5" width="17" height="10" rx="1.5"/>
    <rect ${S} x="-7" y="-3.5" width="5" height="3.5" rx="1" stroke-opacity="0.55"/>
    <rect ${S} x="2" y="-3.5" width="5" height="3.5" rx="1" stroke-opacity="0.55"/>
    <line ${S} x1="-8.5" y1="0.5" x2="8.5" y2="0.5" stroke-opacity="0.30"/>
    <line ${S} x1="-6.5" y1="5.5" x2="-6.5" y2="8.5"/>
    <line ${S} x1="6.5" y1="5.5" x2="6.5" y2="8.5"/>`,

  biuro: `
    <rect ${S} x="-6.5" y="-9" width="13" height="9.5" rx="1.5"/>
    <line ${S} x1="-4.5" y1="-6.5" x2="4.5" y2="-6.5" stroke-opacity="0.42"/>
    <line ${S} x1="-4.5" y1="-4.5" x2="1.5" y2="-4.5" stroke-opacity="0.42"/>
    <line ${S} x1="0" y1="0.5" x2="0" y2="3.5"/>
    <line ${S} x1="-4" y1="3.5" x2="4" y2="3.5"/>
    <rect ${S} x="-7" y="5.5" width="14" height="2.5" rx="1"/>`,

  lazienka: `
    <path ${S} d="M-9,8 L-9,-0.5 Q-9,-5 -5.5,-5 L-4.5,-5 Q-3,-5 -3,-3 L-3,1 L9,1 L9,8 Z"/>
    <line ${S} x1="-5.5" y1="-5" x2="-5.5" y2="-8"/>
    <line ${S} x1="-7.5" y1="-8" x2="-3.5" y2="-8"/>
    <circle ${S} cx="1" cy="5.5" r="1.3" stroke-opacity="0.58"/>`,

  pokoj_dzieciecy: `
    <path fill="rgba(255,255,255,0.78)" stroke="rgba(255,255,255,0.92)" stroke-width="0.8" stroke-linejoin="round"
      d="M0,-8.5 L2.2,-3 L8,-2.7 L3.5,1.2 L5,7 L0,3.8 L-5,7 L-3.5,1.2 L-8,-2.7 L-2.2,-3 Z"/>`,

  pergola: `
    <line ${S} x1="-8" y1="8" x2="-8" y2="-4"/>
    <line ${S} x1="8" y1="8" x2="8" y2="-4"/>
    <line ${S} x1="-9.5" y1="-4" x2="9.5" y2="-4"/>
    <line ${S} x1="-6.5" y1="-4" x2="-6.5" y2="-8.5"/>
    <line ${S} x1="-2.5" y1="-4" x2="-2.5" y2="-8.5"/>
    <line ${S} x1="2.5" y1="-4" x2="2.5" y2="-8.5"/>
    <line ${S} x1="6.5" y1="-4" x2="6.5" y2="-8.5"/>
    <line ${S} x1="-10" y1="8" x2="10" y2="8"/>`,

  ogrod: `
    <path ${S} d="M-3.5,8.5 L-5,4.5 L5,4.5 L3.5,8.5 Z"/>
    <line ${S} x1="-7" y1="4.5" x2="7" y2="4.5"/>
    <line ${S} x1="0" y1="4.5" x2="0" y2="0"/>
    <path ${S} d="M0,0 Q-8,0.5 -6.5,-6.5 Q-1,-9.5 0,-8 Q1,-9.5 6.5,-6.5 Q8,0.5 0,0 Z"
      fill="rgba(255,255,255,0.08)"/>
    <line ${S} x1="0" y1="0" x2="0" y2="-8" stroke-opacity="0.35"/>
    <line ${S} x1="0" y1="-2.5" x2="-3.5" y2="-5" stroke-opacity="0.35"/>
    <line ${S} x1="0" y1="-5" x2="3.5" y2="-7" stroke-opacity="0.35"/>`,

  garaz: `
    <path ${S} d="M-9,-3.5 L0,-8.5 L9,-3.5"/>
    <rect ${S} x="-7.5" y="-3.5" width="15" height="11.5" rx="1"/>
    <line ${S} x1="-7.5" y1="0.2" x2="7.5" y2="0.2" stroke-opacity="0.55"/>
    <line ${S} x1="-7.5" y1="3.8" x2="7.5" y2="3.8" stroke-opacity="0.55"/>
    <circle ${S} cx="0" cy="6.5" r="1.1" stroke-opacity="0.72"/>`,
};

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
      room_type: 'salon',   // salon|sypialnia|biuro|lazienka|pokoj_dzieciecy|pergola|ogrod
      icon: '🛋️',           // emoji fallback when room_type not set
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
      key: 'frost', cardBg: '#07101c', cardBorder: 'rgba(90,200,250,0.55)',
      glowCss: 'radial-gradient(ellipse at 40% 20%, rgba(90,200,250,0.30) 0%, rgba(90,200,250,0.10) 48%, transparent 70%)',
      tempColor: '#5AC8FA', iconBg: 'rgba(90,200,250,0.15)',
      arcG0: '#8FDDFF', arcG1: '#1f7fd8', label: 'mróz',
    };
    if (t < 17) return {
      key: 'cold', cardBg: '#0e1822', cardBorder: 'rgba(90,200,250,0.22)',
      glowCss: 'radial-gradient(ellipse at 30% 25%, rgba(90,200,250,0.13) 0%, transparent 58%)',
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
      key: 'warm', cardBg: '#1c1100', cardBorder: 'rgba(255,159,10,0.40)',
      glowCss: 'radial-gradient(ellipse at 60% 20%, rgba(255,159,10,0.24) 0%, rgba(255,100,0,0.10) 50%, transparent 70%)',
      tempColor: '#FF9F0A', iconBg: 'rgba(255,159,10,0.14)',
      arcG0: '#FFE066', arcG1: '#e87800', label: 'za ciepło',
    };
    return {
      key: 'fire', cardBg: '#150200', cardBorder: 'rgba(255,69,58,0.65)',
      glowCss: 'radial-gradient(ellipse at 50% 85%, rgba(255,80,0,0.45) 0%, rgba(200,20,0,0.20) 52%, transparent 70%)',
      tempColor: '#FF453A', iconBg: 'rgba(255,69,58,0.17)',
      arcG0: '#FF6B6B', arcG1: '#cc1500', label: 'upał',
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
    const cfg      = this._config;
    const name     = cfg.name || 'Pokój';
    const emojiIcon = cfg.icon || '🏠';
    const roomType  = cfg.room_type || null;
    const svgIcon   = roomType && ROOM_ICONS[roomType] ? ROOM_ICONS[roomType] : null;
    const uid  = this._uid;

    const temp = this._val(cfg.temp_entity);
    const hum  = this._val(cfg.humidity_entity);
    const bat  = this._val(cfg.battery_entity);

    const st      = this._tempState(temp);
    const humCol  = this._humArcColor(hum);
    const isOffline = temp === null;

    const minT = parseFloat(cfg.min_temp ?? -10);
    const maxT = parseFloat(cfg.max_temp ?? 40);

    const tempStr = isOffline ? '—' : temp.toFixed(1) + '°';
    const humStr  = hum !== null ? hum.toFixed(0) + '%' : '—';

    const fillPct = isOffline ? 0 : Math.max(0, Math.min(100, (temp - minT) / (maxT - minT) * 100));
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
    const useGlow = st.key === 'frost' || st.key === 'fire' || st.key === 'warm';

    // Humidity zone label
    const humZone = hum === null ? '' : hum < 35 ? 'sucho' : hum < 66 ? 'komfort' : hum < 81 ? 'wilgotno' : 'b. wilgotno';

    /* ── SVG tooltip helper ── */
    const TT = { x: 61, y: 63, w: 78, h: 54, rx: 11 };
    const _tooltip = (label, valStr, valColor, cls) => `
      <g class="${cls}" pointer-events="none">
        <rect x="${TT.x}" y="${TT.y}" width="${TT.w}" height="${TT.h}" rx="${TT.rx}"
          fill="rgba(12,12,16,0.94)" stroke="rgba(255,255,255,0.10)" stroke-width="0.8"/>
        <text x="${CX}" y="${CY - 9}"
          text-anchor="middle" dominant-baseline="central"
          font-family="-apple-system,system-ui,sans-serif"
          font-size="8.5" font-weight="500" fill="rgba(255,255,255,0.38)">${label}</text>
        <text x="${CX}" y="${CY + 13}"
          text-anchor="middle" dominant-baseline="central"
          font-family="-apple-system,system-ui,sans-serif"
          font-size="22" font-weight="700" letter-spacing="-1"
          fill="${valColor}">${valStr}</text>
      </g>`;

    /* ── Battery ── */
    const batHTML = (() => {
      if (bat === null || bat >= 25) return '';
      const col   = bat < 20 ? '#FF453A' : 'rgba(255,255,255,0.38)';
      const fillW = Math.round((Math.max(0, Math.min(100, bat)) / 100) * 13);
      return `
        <div class="bat">
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
  :host { display: block; width: 100%; height: 100%; }

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
    transition: background .5s ease, border-color .5s ease, transform .15s ease;
  }
  .card:active { transform: scale(0.97); }

  .bg-glow {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background: ${st.glowCss || 'none'}; transition: background .5s ease;
  }

  /* ── frost card + arc ── */
  @keyframes frost-pulse  { 0%,100%{opacity:.5}  50%{opacity:.95} }
  @keyframes frost-card   {
    0%,100% { box-shadow: 0 0 0 0 rgba(90,200,250,0); }
    50%     { box-shadow: 0 0 40px 12px rgba(90,200,250,.36), 0 0 0 3px rgba(90,200,250,.16), inset 0 0 28px rgba(90,200,250,.06); }
  }
  @keyframes frost-arc    { 0%,100%{filter:brightness(1)}  50%{filter:brightness(1.28) saturate(1.3)} }

  /* ── frost icon: shiver + icy glow ── */
  @keyframes icon-frost {
    0%   { transform: scale(1) translateX(0);        box-shadow: 0 0 5px 1px rgba(90,200,250,0.35), inset 0 0 6px rgba(90,200,250,0.15); }
    18%  { transform: scale(1.05) translateX(-1.5px); box-shadow: 0 0 12px 3px rgba(90,200,250,0.65), inset 0 0 8px rgba(90,200,250,0.25); }
    36%  { transform: scale(0.97) translateX(1.5px);  box-shadow: 0 0 7px 2px rgba(90,200,250,0.45), inset 0 0 6px rgba(90,200,250,0.18); }
    54%  { transform: scale(1.04) translateX(-1px);   box-shadow: 0 0 16px 5px rgba(90,200,250,0.75), inset 0 0 10px rgba(140,220,255,0.3); }
    72%  { transform: scale(0.98) translateX(1px);    box-shadow: 0 0 9px 2px rgba(90,200,250,0.50), inset 0 0 7px rgba(90,200,250,0.2); }
    100% { transform: scale(1) translateX(0);        box-shadow: 0 0 5px 1px rgba(90,200,250,0.35), inset 0 0 6px rgba(90,200,250,0.15); }
  }

  /* ── warm card ── */
  @keyframes warm-card    {
    0%,100% { box-shadow: 0 0 0 0 rgba(255,159,10,0); }
    50%     { box-shadow: 0 0 30px 8px rgba(255,159,10,.30), 0 0 0 2px rgba(255,159,10,.14), inset 0 0 20px rgba(255,100,0,.05); }
  }

  /* ── fire card + arc ── */
  @keyframes fire-card    {
    0%,100% { box-shadow: 0 0 0 0 rgba(255,69,58,0); }
    30%     { box-shadow: 0 0 50px 16px rgba(255,80,20,.45), 0 0 0 4px rgba(255,69,58,.22), inset 0 0 32px rgba(255,40,0,.08); }
    70%     { box-shadow: 0 0 24px 6px rgba(255,80,20,.25); }
  }
  @keyframes fire-arc     { 0%,100%{opacity:.9} 25%{opacity:1;filter:brightness(1.32) saturate(1.4)} 75%{opacity:.82;filter:brightness(.88)} }
  @keyframes fire-shimmer { 0%,100%{opacity:.55;transform:scaleY(1)} 50%{opacity:.9;transform:scaleY(1.07)} }

  /* ── fire icon: flicker + rising glow ── */
  @keyframes icon-fire {
    0%   { transform: scale(1)    translateY(0px)   scaleX(1);    box-shadow: 0 -3px 8px  2px rgba(255,80,0,0.50); }
    12%  { transform: scale(1.07) translateY(-2px)  scaleX(0.94); box-shadow: 0 -5px 18px 4px rgba(255,110,0,0.75); }
    28%  { transform: scale(0.96) translateY( 0px)  scaleX(1);    box-shadow: 0 -2px 5px  1px rgba(255,60,0,0.35); }
    45%  { transform: scale(1.09) translateY(-3px)  scaleX(0.91); box-shadow: 0 -6px 22px 5px rgba(255,130,0,0.85); }
    62%  { transform: scale(0.97) translateY(-1px)  scaleX(1.02); box-shadow: 0 -3px 10px 2px rgba(255,80,0,0.55); }
    78%  { transform: scale(1.06) translateY(-2px)  scaleX(0.95); box-shadow: 0 -5px 16px 3px rgba(255,100,0,0.70); }
    90%  { transform: scale(0.98) translateY( 0px)  scaleX(1);    box-shadow: 0 -2px 6px  1px rgba(255,60,0,0.40); }
    100% { transform: scale(1)    translateY(0px)   scaleX(1);    box-shadow: 0 -3px 8px  2px rgba(255,80,0,0.50); }
  }

  /* ── warm icon: gentle warm pulse ── */
  @keyframes icon-warm {
    0%,100% { box-shadow: 0 0 5px 1px rgba(255,159,10,0.35); }
    50%     { box-shadow: 0 0 12px 3px rgba(255,159,10,0.65); transform: scale(1.04); }
  }

  /* ── cold icon: slow cool pulse ── */
  @keyframes icon-cold {
    0%,100% { box-shadow: 0 0 4px 1px rgba(90,200,250,0.22); }
    50%     { box-shadow: 0 0 9px 2px rgba(90,200,250,0.42); }
  }

  .card.frost { animation: frost-card 3.0s ease-in-out infinite; }
  .card.warm  { animation: warm-card  3.5s ease-in-out infinite; }
  .card.fire  { animation: fire-card  2.0s ease-in-out infinite; }
  .card.frost .arc-temp-fill { animation: frost-arc 3.0s ease-in-out infinite; }
  .card.fire  .arc-temp-fill { animation: fire-arc  2.0s ease-in-out infinite; }

  /* icon animations — SVG text element, use drop-shadow + transform */
  .icon-svg { transform-box: fill-box; transform-origin: center; transition: opacity .2s ease; }
  .card.frost .icon-svg { animation: icon-frost-svg 2.8s ease-in-out infinite; }
  .card.fire  .icon-svg { animation: icon-fire-svg  1.6s ease-in-out infinite; }
  .card.warm  .icon-svg { animation: icon-warm-svg  2.4s ease-in-out infinite; }
  .card.cold  .icon-svg { animation: icon-cold-svg  3.5s ease-in-out infinite; }

  @keyframes icon-frost-svg {
    0%   { transform: scale(1)    translateX(0px);    filter: drop-shadow(0 0 2px rgba(90,200,250,0.40)); }
    18%  { transform: scale(1.08) translateX(-1.5px); filter: drop-shadow(0 0 7px rgba(90,200,250,0.85)); }
    36%  { transform: scale(0.95) translateX(1.5px);  filter: drop-shadow(0 0 3px rgba(90,200,250,0.50)); }
    54%  { transform: scale(1.06) translateX(-1px);   filter: drop-shadow(0 0 11px rgba(90,200,250,1.0)); }
    72%  { transform: scale(0.97) translateX(1px);    filter: drop-shadow(0 0 5px rgba(90,200,250,0.60)); }
    100% { transform: scale(1)    translateX(0px);    filter: drop-shadow(0 0 2px rgba(90,200,250,0.40)); }
  }
  @keyframes icon-fire-svg {
    0%   { transform: scale(1)    translateY(0px)  scaleX(1);    filter: drop-shadow(0 -2px 4px rgba(255,80,0,0.55)); }
    12%  { transform: scale(1.10) translateY(-2px) scaleX(0.91); filter: drop-shadow(0 -4px 10px rgba(255,110,0,0.85)); }
    28%  { transform: scale(0.95) translateY(0px)  scaleX(1);    filter: drop-shadow(0 -1px 2px rgba(255,60,0,0.40)); }
    45%  { transform: scale(1.13) translateY(-3px) scaleX(0.89); filter: drop-shadow(0 -5px 14px rgba(255,140,0,1.0)); }
    62%  { transform: scale(0.97) translateY(-1px) scaleX(1.02); filter: drop-shadow(0 -2px 6px rgba(255,80,0,0.60)); }
    78%  { transform: scale(1.08) translateY(-2px) scaleX(0.93); filter: drop-shadow(0 -4px 9px rgba(255,100,0,0.75)); }
    100% { transform: scale(1)    translateY(0px)  scaleX(1);    filter: drop-shadow(0 -2px 4px rgba(255,80,0,0.55)); }
  }
  @keyframes icon-warm-svg {
    0%,100% { filter: drop-shadow(0 0 2px rgba(255,159,10,0.35)); }
    50%     { transform: scale(1.05); filter: drop-shadow(0 0 7px rgba(255,159,10,0.70)); }
  }
  @keyframes icon-cold-svg {
    0%,100% { filter: drop-shadow(0 0 2px rgba(90,200,250,0.22)); }
    50%     { filter: drop-shadow(0 0 6px rgba(90,200,250,0.50)); }
  }

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
  .card.cold  .state-label { color: rgba(125,212,248,0.55); }
  .card.frost .state-label { color: rgba(90,200,250,0.90); }
  .card.warm  .state-label { color: rgba(255,159,10,0.90); }
  .card.fire  .state-label { color: rgba(255,100,70,0.95); }

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
  .center-val {
    font-family: -apple-system,system-ui,sans-serif;
    font-size: 34px; font-weight: 700; letter-spacing: -1.5px;
    fill: ${st.tempColor}; transition: opacity .2s ease;
    cursor: pointer;
  }

  /* tooltips — opacity controlled by JS, rendered last in SVG for proper z-order */
  .tt-temp, .tt-hum { opacity: 0; transition: opacity .2s ease; pointer-events: none; }

  .range-text {
    font-family: -apple-system,system-ui,sans-serif;
    font-size: 8px; font-weight: 500; fill: rgba(255,255,255,.18);
  }
</style>

<div class="card ${st.key}">
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
          <stop offset="0%"   stop-color="rgba(255,90,0,.22)"/>
          <stop offset="55%"  stop-color="rgba(200,40,0,.07)"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#hr-${uid})"/>
    </svg>
  </div>

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
        <filter id="arc-glow-${uid}" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="dot-glow-${uid}" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="cg-${uid}" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stop-color="${isOffline ? 'transparent' : st.arcG1 + '18'}"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
      </defs>

      <!-- ambient glow in center -->
      <circle cx="${CX}" cy="${CY}" r="${R2 - SW2/2 - 4}" fill="url(#cg-${uid})"/>

      <!-- temperature value — fades when arc hovered -->
      <text id="temp-hit" class="center-val"
        x="${CX}" y="${CY}"
        text-anchor="middle" dominant-baseline="central">${tempStr}</text>

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
          ${useGlow ? `filter="url(#arc-glow-${uid})"` : ''}/>
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
        fill="${st.arcG0}" opacity="0.85" filter="url(#dot-glow-${uid})"/>
      <circle cx="${dotX.toFixed(2)}" cy="${dotY.toFixed(2)}" r="2.8"
        fill="rgba(255,255,255,0.95)"/>
      ` : ''}

      <!-- range labels — flanking the gap -->
      <text x="${(CX + LR * Math.cos(minA)).toFixed(1)}" y="${(CY + LR * Math.sin(minA) + 3).toFixed(1)}"
        text-anchor="end"   class="range-text">${fmtT(minT)}</text>
      <text x="${(CX + LR * Math.cos(maxA)).toFixed(1)}" y="${(CY + LR * Math.sin(maxA) + 3).toFixed(1)}"
        text-anchor="start" class="range-text">${fmtT(maxT)}</text>

      <!-- icon inside gauge — centered in the arc gap at the bottom -->
      ${svgIcon
        ? `<g transform="translate(${CX},138) scale(1.5)" pointer-events="none">
             <g class="icon-svg">${svgIcon}</g>
           </g>`
        : `<text class="icon-svg"
             x="${CX}" y="138"
             text-anchor="middle" dominant-baseline="central"
             font-size="26">${emojiIcon}</text>`
      }

      <!-- tooltips — LAST in SVG for correct z-order (render above icon/labels) -->
      ${_tooltip('🌡️ Temperatura · ' + st.label, tempStr, st.tempColor, 'tt-temp')}
      ${_tooltip('💧 Wilgotność · ' + (humZone || '—'), humStr, humCol, 'tt-hum')}
    </svg>
  </div>

  <!-- ROOM NAME: HTML element at bottom -->
  <div class="room-name">${name}</div>
</div>`;

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

      const enter = (showTT, dimArc) => {
        if (showTT)  showTT.style.opacity  = '1';
        if (cv)      cv.style.opacity      = '0';
        if (dimArc)  dimArc.style.opacity  = '0.18';
        if (sl)      sl.style.opacity      = '0.28';
        if (rn)      rn.style.opacity      = '0.28';
      };
      const leave = () => {
        if (ttT) ttT.style.opacity = '0';
        if (ttH) ttH.style.opacity = '0';
        if (cv)  cv.style.opacity  = '1';
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
