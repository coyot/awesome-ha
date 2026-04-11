class TempHumidityCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getConfigElement() {
    return document.createElement('temp-humidity-card-editor');
  }

  static getStubConfig() {
    return {
      temp_entity: 'sensor.temperature_salon',
      humidity_entity: '',
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

  _getTempState() {
    const t = this._tempVal;
    if (t === null) return { label: 'OFFLINE', color: 'rgba(255,255,255,0.2)', border: 'rgba(255,255,255,0.08)', bg: '#1C1C1E', bgGrad: '#1C1C1E', fillColor: 'rgba(255,255,255,0.08)', fillPct: 0, bulbColor: 'rgba(255,255,255,0.15)', glowColor: 'rgba(255,255,255,0)', pillBg: 'rgba(255,255,255,0.05)', pillBorder: 'rgba(255,255,255,0.1)', effect: 'none' };
    if (t < 5)  return { label: 'MRÓZ',     color: '#0A84FF', border: 'rgba(10,132,255,0.28)',  bg: 'linear-gradient(150deg,#060f1c,#1C1C1E)', bgGrad: '#060f1c', fillColor: 'url(#grad)',  fillPct: Math.max(5, ((t + 10) / 15) * 30),  bulbColor: '#0A84FF', glowColor: 'rgba(10,132,255,0.22)',  pillBg: 'rgba(10,132,255,0.15)',  pillBorder: 'rgba(10,132,255,0.4)',  effect: 'frost' };
    if (t < 17) return { label: 'ZIMNO',    color: '#5AC8FA', border: 'rgba(90,200,250,0.18)',  bg: 'linear-gradient(150deg,#0a1820,#1C1C1E)', bgGrad: '#0a1820', fillColor: 'url(#grad)',  fillPct: 20 + ((t - 5) / 12) * 25,           bulbColor: '#5AC8FA', glowColor: 'rgba(90,200,250,0.15)',  pillBg: 'rgba(90,200,250,0.12)', pillBorder: 'rgba(90,200,250,0.3)',  effect: 'none' };
    if (t < 26) return { label: 'KOMFORT',  color: '#30D158', border: 'rgba(48,209,88,0.18)',   bg: 'linear-gradient(150deg,#0b1e10,#1C1C1E)', bgGrad: '#0b1e10', fillColor: 'url(#grad)',  fillPct: 45 + ((t - 17) / 9) * 20,           bulbColor: '#30D158', glowColor: 'rgba(48,209,88,0.18)',   pillBg: 'rgba(48,209,88,0.12)',  pillBorder: 'rgba(48,209,88,0.3)',   effect: 'none' };
    if (t < 31) return { label: 'ZA CIEPŁO',color: '#FF9F0A', border: 'rgba(255,159,10,0.2)',   bg: 'linear-gradient(150deg,#221508,#1C1C1E)', bgGrad: '#221508', fillColor: 'url(#grad)',  fillPct: 65 + ((t - 26) / 5) * 20,           bulbColor: '#FF9F0A', glowColor: 'rgba(255,159,10,0.2)',   pillBg: 'rgba(255,159,10,0.13)', pillBorder: 'rgba(255,159,10,0.35)', effect: 'none' };
    return                { label: '⚠ UPAŁ', color: '#FF453A', border: 'rgba(255,69,58,0.3)',    bg: 'linear-gradient(150deg,#200808,#1C1C1E)', bgGrad: '#200808', fillColor: 'url(#grad)',  fillPct: 100,                                 bulbColor: '#FF453A', glowColor: 'rgba(255,69,58,0.28)',   pillBg: 'rgba(255,69,58,0.18)',  pillBorder: 'rgba(255,69,58,0.5)',   effect: 'heat' };
  }

  _getHumidityState() {
    const h = this._humVal;
    if (h === null) return null;
    if (h < 35) return { label: '💧 ' + h.toFixed(0) + '%', color: '#FF9F0A' };
    if (h < 66) return { label: '💧 ' + h.toFixed(0) + '%', color: '#30D158' };
    if (h < 81) return { label: '💧 ' + h.toFixed(0) + '%', color: '#0A84FF' };
    return           { label: '💧 ' + h.toFixed(0) + '% ⚠', color: '#0A84FF' };
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

  _getBatteryHTML(pct) {
    if (pct === null) return '';
    const low   = pct < 20;
    const color = low ? '#FF453A' : 'rgba(255,255,255,0.55)';
    const fill  = Math.max(0, Math.min(100, pct));
    const fillW = Math.round((fill / 100) * 14);
    return `
      <div class="bat-wrap">
        <svg width="22" height="11" viewBox="0 0 22 11" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="18" height="10" rx="2.5"
                fill="none" stroke="${color}" stroke-width="1.1" opacity="0.9"/>
          <rect x="19" y="3.5" width="2.5" height="4" rx="1.2"
                fill="${color}" opacity="0.7"/>
          ${fillW > 0 ? `<rect x="2" y="2" width="${fillW}" height="7" rx="1.5"
                fill="${color}"/>` : ''}
        </svg>
        <div class="bat-tip">${Math.round(pct)}%</div>
      </div>`;
  }

  _getFrostSVG() {
    return `
      <svg class="frost-corner frost-tl" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,0 Q8,12 0,24" stroke="rgba(160,220,255,0.35)" stroke-width="1" fill="none"/>
        <path d="M0,0 Q16,6 28,0" stroke="rgba(160,220,255,0.35)" stroke-width="1" fill="none"/>
        <path d="M0,0 Q12,12 18,18" stroke="rgba(160,220,255,0.25)" stroke-width="0.8" fill="none"/>
        <circle cx="5" cy="5" r="1.2" fill="rgba(180,230,255,0.5)"/>
        <circle cx="12" cy="3" r="0.8" fill="rgba(180,230,255,0.4)"/>
        <circle cx="3" cy="14" r="0.9" fill="rgba(180,230,255,0.4)"/>
        <circle cx="18" cy="8" r="0.6" fill="rgba(180,230,255,0.3)"/>
        <line x1="10" y1="10" x2="10" y2="18" stroke="rgba(160,220,255,0.5)" stroke-width="0.8"/>
        <line x1="6" y1="14" x2="14" y2="14" stroke="rgba(160,220,255,0.5)" stroke-width="0.8"/>
        <line x1="7.5" y1="11.5" x2="12.5" y2="16.5" stroke="rgba(160,220,255,0.32)" stroke-width="0.7"/>
        <line x1="12.5" y1="11.5" x2="7.5" y2="16.5" stroke="rgba(160,220,255,0.32)" stroke-width="0.7"/>
      </svg>
      <svg class="frost-corner frost-tr" viewBox="0 0 55 55" xmlns="http://www.w3.org/2000/svg">
        <path d="M55,0 Q47,10 55,22" stroke="rgba(160,220,255,0.28)" stroke-width="1" fill="none"/>
        <path d="M55,0 Q41,5 29,0" stroke="rgba(160,220,255,0.28)" stroke-width="1" fill="none"/>
        <circle cx="51" cy="4" r="1" fill="rgba(180,230,255,0.42)"/>
        <circle cx="44" cy="2" r="0.7" fill="rgba(180,230,255,0.32)"/>
        <circle cx="53" cy="12" r="0.8" fill="rgba(180,230,255,0.32)"/>
        <line x1="47" y1="9" x2="47" y2="17" stroke="rgba(160,220,255,0.4)" stroke-width="0.8"/>
        <line x1="43" y1="13" x2="51" y2="13" stroke="rgba(160,220,255,0.4)" stroke-width="0.8"/>
      </svg>
      <svg class="frost-corner frost-bl" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,50 Q9,40 0,28" stroke="rgba(160,220,255,0.22)" stroke-width="1" fill="none"/>
        <path d="M0,50 Q13,44 24,50" stroke="rgba(160,220,255,0.22)" stroke-width="1" fill="none"/>
        <circle cx="4" cy="46" r="0.9" fill="rgba(180,230,255,0.35)"/>
        <circle cx="10" cy="48" r="0.6" fill="rgba(180,230,255,0.28)"/>
      </svg>
      <div class="frost-flake f1">❄</div>
      <div class="frost-flake f2">❄</div>`;
  }

  _getHeatWaves() {
    return `<div class="heat-waves">
      <div class="wave w1"></div>
      <div class="wave w2"></div>
      <div class="wave w3"></div>
      <div class="wave w4"></div>
      <div class="wave w5"></div>
    </div>`;
  }

  _render() {
    const cfg = this._config;
    const name = cfg.name || 'Pokój';
    const temp = this._tempVal;
    const state = this._getTempState();
    const hum = this._getHumidityState();

    // termometr: tube top=20, height=56, bottom=76, bulb cy=85
    const TUBE_TOP = 20;
    const TUBE_H = 56;
    const fillH = Math.min(TUBE_H, (state.fillPct / 100) * TUBE_H);
    const fillY = TUBE_TOP + TUBE_H - fillH;

    const tempStr = temp !== null ? temp.toFixed(1) + '°' : '--°';
    const isOffline = temp === null;
    const bat = this._batVal;

    // gradient colors per state
    const gradStops = {
      'MRÓZ':     ['#5AC8FA', '#0A84FF'],
      'ZIMNO':    ['#5AC8FA', '#0A84FF'],
      'KOMFORT':  ['#30D158', '#25a244'],
      'ZA CIEPŁO':['#FFD60A', '#FF9F0A'],
      '⚠ UPAŁ':  ['#FF6B6B', '#FF453A'],
    };
    const stops = gradStops[state.label] || ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)'];

    this.shadowRoot.innerHTML = `
    <style>
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .card {
        position: relative;
        width: 100%;
        aspect-ratio: 1/1;
        border-radius: 18px;
        overflow: hidden;
        background: ${state.bg};
        border: 1px solid ${state.border};
        box-sizing: border-box;
        cursor: default;
        transition: transform 0.15s ease;
        font-family: -apple-system, system-ui, sans-serif;
        ${state.effect === 'heat' ? 'animation: heat-pulse 2.2s ease-in-out infinite;' : ''}
        ${state.effect === 'frost' ? 'animation: frost-pulse 3s ease-in-out infinite;' : ''}
      }
      .card:active { transform: scale(0.97); }

      /* FROST */
      .frost-corner { position: absolute; pointer-events: none; }
      .frost-tl { top: 0; left: 0; width: 60px; height: 60px; opacity: 0.55; }
      .frost-tr { top: 0; right: 0; width: 55px; height: 55px; opacity: 0.42; }
      .frost-bl { bottom: 0; left: 0; width: 50px; height: 50px; opacity: 0.35; }
      .frost-flake {
        position: absolute;
        font-size: 10px;
        color: rgba(160,220,255,0.7);
        animation: frost-float 3.4s ease-in-out infinite;
        pointer-events: none;
      }
      .f1 { top: 7px; left: 7px; animation-delay: 0s; }
      .f2 { top: 19px; left: 22px; font-size: 7px; opacity: 0.5; animation-delay: 0.8s; }

      /* HEAT */
      .heat-waves {
        position: absolute;
        left: 66px;
        bottom: 37px;
        display: flex;
        gap: 3px;
        align-items: flex-end;
        pointer-events: none;
      }
      .wave {
        width: 3px;
        border-radius: 2px;
        background: linear-gradient(to top, rgba(255,80,58,0.7), transparent);
        animation: heat-shimmer 1.9s ease-in-out infinite;
      }
      .w1 { height: 13px; animation-delay: 0s; }
      .w2 { height: 17px; animation-delay: 0.28s; }
      .w3 { height: 11px; animation-delay: 0.56s; }
      .w4 { height: 15px; animation-delay: 0.14s; }
      .w5 { height: 9px;  animation-delay: 0.42s; }

      .name {
        position: absolute;
        top: 10px;
        left: 12px;
        font-size: 10px;
        font-weight: 500;
        color: ${isOffline ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.55)'};
        letter-spacing: 0.1px;
        z-index: 2;
        pointer-events: none;
      }
      .pill {
        position: absolute;
        bottom: 9px;
        right: 9px;
        padding: 3px 8px;
        border-radius: 20px;
        font-size: 8px;
        font-weight: 700;
        letter-spacing: 0.35px;
        background: ${state.pillBg};
        border: 0.5px solid ${state.pillBorder};
        color: ${state.color};
        white-space: nowrap;
      }
      .humidity {
        position: absolute;
        bottom: 11px;
        left: 12px;
        font-size: 9px;
        font-weight: 600;
        cursor: ${this._config.humidity_entity ? 'pointer' : 'default'};
        z-index: 4;
      }

      /* ── battery ── */
      .bat-wrap {
        position: absolute;
        top: 9px; right: 9px;
        z-index: 5;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .bat-tip {
        font-size: 10px;
        font-weight: 600;
        color: rgba(255,255,255,.80);
        background: rgba(28,28,30,.92);
        border: .5px solid rgba(255,255,255,.15);
        border-radius: 6px;
        padding: 2px 6px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity .15s;
        backdrop-filter: blur(8px);
      }
      .bat-wrap:hover .bat-tip { opacity: 1; }

      /* ── temp area click ── */
      .temp-hit { position: absolute; inset: 0; cursor: pointer; z-index: 2; }

      @keyframes frost-float {
        0%,100% { opacity: 0.6; transform: translateY(0) rotate(0deg); }
        50%      { opacity: 1;   transform: translateY(-2px) rotate(8deg); }
      }
      @keyframes heat-shimmer {
        0%,100% { opacity: 0.45; transform: scaleX(1) translateY(0); }
        33%      { opacity: 0.85; transform: scaleX(1.2) translateY(-3px); }
        66%      { opacity: 0.55; transform: scaleX(0.88) translateY(-5px); }
      }
      @keyframes heat-pulse {
        0%,100% { box-shadow: 0 0 0 0 rgba(255,69,58,0); }
        50%      { box-shadow: 0 0 0 7px rgba(255,69,58,0.12); }
      }
      @keyframes frost-pulse {
        0%,100% { box-shadow: 0 0 0 0 rgba(10,132,255,0); }
        50%      { box-shadow: 0 0 0 7px rgba(10,132,255,0.13); }
      }
    </style>

    <div class="card">

      ${state.effect === 'frost' ? this._getFrostSVG() : ''}
      ${state.effect === 'heat' ? this._getHeatWaves() : ''}

      <div class="name">${name}</div>
      ${this._getBatteryHTML(bat)}

      <div class="temp-hit" id="temp-hit"></div>

      <svg width="100%" height="100%" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg"
           style="position:absolute;top:0;left:0;pointer-events:none;">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${stops[0]}"/>
            <stop offset="100%" stop-color="${stops[1]}"/>
          </linearGradient>
        </defs>

        <!-- termometr tube (przesunięty w prawo: x=72) -->
        <rect x="72" y="20" width="12" height="56" rx="6"
              fill="rgba(255,255,255,0.04)"
              stroke="${isOffline ? 'rgba(255,255,255,0.07)' : state.border}"
              stroke-width="1"/>

        <!-- fill -->
        ${!isOffline && fillH > 0 ? `
        <rect x="72" y="${fillY}" width="12" height="${fillH}" rx="0"
              fill="${state.fillColor}"
              clip-path="inset(0 0 0 0 round 0 0 6px 6px)"/>
        ` : ''}

        <!-- tick marks -->
        <line x1="84" y1="30" x2="89" y2="30" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        <line x1="84" y1="44" x2="89" y2="44" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        <line x1="84" y1="58" x2="89" y2="58" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

        <!-- bulb outer glow -->
        <circle cx="78" cy="85" r="9" fill="none"
                stroke="${isOffline ? 'rgba(255,255,255,0)' : state.glowColor}"
                stroke-width="5"/>
        <!-- bulb ring -->
        <circle cx="78" cy="85" r="9"
                fill="${isOffline ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.15)'}"
                stroke="${isOffline ? 'rgba(255,255,255,0.1)' : state.bulbColor}"
                stroke-width="1.4"/>
        <!-- bulb fill -->
        <circle cx="78" cy="85" r="5.5"
                fill="${isOffline ? 'rgba(255,255,255,0.08)' : state.bulbColor}"/>

        <!-- temperature value -->
        <text x="62" y="${hum ? '50' : '55'}"
              text-anchor="end"
              fill="${isOffline ? 'rgba(255,255,255,0.15)' : 'white'}"
              font-size="20"
              font-weight="700"
              font-family="-apple-system,system-ui"
              letter-spacing="-0.5">${tempStr}</text>
      </svg>

      ${hum ? `<div class="humidity" id="hum-hit" style="color:${hum.color}">${hum.label}</div>` : ''}

      <div class="pill">${state.label}</div>
    </div>
    `;

    this.shadowRoot.getElementById('temp-hit')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._config.temp_entity },
      }));
    });

    if (this._config.humidity_entity) {
      this.shadowRoot.getElementById('hum-hit')?.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true,
          detail: { entityId: this._config.humidity_entity },
        }));
      });
    }
  }

  getCardSize() { return 2; }
}

customElements.define('aha-temp-humidity-card', TempHumidityCard);
// backward-compat
if (!customElements.get('temp-humidity-card')) customElements.define('temp-humidity-card', class extends TempHumidityCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-temp-humidity-card',
  name:        'Temp & Humidity Card',
  preview:     false,
  description: 'Kafelek temperatury i wilgotności z termometrem i efektami wizualnymi.',
});