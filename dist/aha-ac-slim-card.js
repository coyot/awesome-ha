/**
 * aha-ac-slim-card.js — AHA Climate / AC Slim Card
 *
 * Layout: 4px color-bar | ikona + nazwa + badge + chipy + progress | temp w pokoju
 * Stany:  heating (#EF9F27) · cooling (#85B7EB) · fan (#B4B2A9) · dry (#C97A50) · off (muted)
 * Animacje: pulsujący box-shadow gdy aktywne, migający dot w badge, ikona animowana
 *
 * Config:
 *   entity: climate.xxx          (wymagane)
 *   name:   "override"           (opcjonalne)
 */

const AC_COLORS = {
  heating:  { main: '#EF9F27', r: 239, g: 159, b: 39  },
  cooling:  { main: '#85B7EB', r: 133, g: 183, b: 235 },
  fan:      { main: '#B4B2A9', r: 180, g: 178, b: 169 },
  drying:   { main: '#C97A50', r: 201, g: 122, b: 80  },
  idle:     { main: '#5F5E5A', r: 95,  g: 94,  b: 90  },
  off:      { main: '#3D3D3B', r: 61,  g: 61,  b: 59  },
};

const AC_MODE_LABELS = {
  heat:     { label: 'grzanie',    col: '#EF9F27', bg: 'rgba(239,159,39,0.12)'  },
  cool:     { label: 'chłodzenie', col: '#85B7EB', bg: 'rgba(133,183,235,0.12)' },
  fan_only: { label: 'wentylator', col: '#B4B2A9', bg: 'rgba(180,178,169,0.12)' },
  dry:      { label: 'osuszanie',  col: '#C97A50', bg: 'rgba(201,122,80,0.12)'  },
  auto:     { label: 'auto',       col: '#97C459', bg: 'rgba(151,196,89,0.12)'  },
  off:      { label: 'wyłączone',  col: '#5F5E5A', bg: 'rgba(95,94,90,0.12)'   },
};

const AC_FAN_LABELS = {
  auto:   { label: 'auto',    col: '#97C459', bg: 'rgba(151,196,89,0.10)'  },
  low:    { label: 'cicho',   col: '#7BAED4', bg: 'rgba(123,174,212,0.10)' },
  medium: { label: 'średnio', col: '#85B7EB', bg: 'rgba(133,183,235,0.10)' },
  high:   { label: 'mocno',   col: '#EF9F27', bg: 'rgba(239,159,39,0.10)'  },
};

/* ── SVG icons ── */
const AC_SVG = {
  idle: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7" stroke="#3D3D3B" stroke-width="1.4"/>
    <path d="M10 6v4l3 2" stroke="#3D3D3B" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`,

  heating: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="ac-icon-heat">
    <path d="M10 3 Q8 7 8 10 Q8 13 10 16 Q12 13 12 10 Q12 7 10 3Z"
          stroke="#EF9F27" stroke-width="1.3" fill="rgba(239,159,39,0.18)"/>
    <path d="M10 7 Q8.5 9 8.5 11 Q8.5 13 10 14.5 Q11.5 13 11.5 11 Q11.5 9 10 7Z"
          fill="rgba(239,159,39,0.3)"/>
  </svg>`,

  cooling: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="ac-icon-snow">
    <line x1="10" y1="3"  x2="10" y2="17" stroke="#85B7EB" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="3"  y1="10" x2="17" y2="10" stroke="#85B7EB" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="5"  y1="5"  x2="15" y2="15" stroke="#85B7EB" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="15" y1="5"  x2="5"  y2="15" stroke="#85B7EB" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`,

  fan: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="ac-icon-fan">
    <circle cx="10" cy="10" r="2" fill="#B4B2A9"/>
    <path d="M10 2 Q8 6 10 8"  stroke="#B4B2A9" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M18 10 Q14 8 12 10" stroke="#B4B2A9" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M10 18 Q12 14 10 12" stroke="#B4B2A9" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M2 10 Q6 12 8 10"  stroke="#B4B2A9" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  drying: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M6 12 Q6 8 10 4 Q14 8 14 12 Q14 15 10 15 Q6 15 6 12Z"
          stroke="#C97A50" stroke-width="1.2" fill="none"/>
    <circle cx="10" cy="12" r="2" fill="rgba(201,122,80,0.3)"/>
  </svg>`,
};

/* ── Styles ── */
const AC_STYLES = `
  :host { display: block; width: 100%; }

  @keyframes ac-pulse-heat {
    0%,100% { box-shadow: 0 0 0 0   rgba(239,159,39,0); }
    50%     { box-shadow: 0 0 0 5px rgba(239,159,39,0.18); }
  }
  @keyframes ac-pulse-cool {
    0%,100% { box-shadow: 0 0 0 0   rgba(133,183,235,0); }
    50%     { box-shadow: 0 0 0 5px rgba(133,183,235,0.18); }
  }
  @keyframes ac-pulse-fan {
    0%,100% { box-shadow: 0 0 0 0   rgba(180,178,169,0); }
    50%     { box-shadow: 0 0 0 5px rgba(180,178,169,0.14); }
  }
  @keyframes ac-pulse-dry {
    0%,100% { box-shadow: 0 0 0 0   rgba(201,122,80,0); }
    50%     { box-shadow: 0 0 0 5px rgba(201,122,80,0.18); }
  }
  @keyframes ac-dot  { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes ac-heat { 0%,100%{transform:scaleY(1) translateY(0);opacity:1} 50%{transform:scaleY(0.95) translateY(-1px);opacity:0.85} }
  @keyframes ac-snow { to{transform:rotate(360deg)} }
  @keyframes ac-fan  { to{transform:rotate(360deg)} }

  .card {
    display: grid;
    grid-template-columns: 4px 1fr auto;
    gap: 0 14px;
    align-items: stretch;
    padding: 14px 16px;
    background: #1C1C1E;
    border-radius: 16px;
    border: 0.5px solid rgba(255,255,255,0.08);
    cursor: pointer;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    transition: transform 0.15s ease, border-color 0.4s ease, background 0.4s ease;
    box-sizing: border-box;
  }
  .card:active { transform: scale(0.97); }

  .card.heating {
    border-color: rgba(239,159,39,0.30);
    animation: ac-pulse-heat 2.4s ease-in-out infinite;
  }
  .card.cooling {
    border-color: rgba(133,183,235,0.30);
    animation: ac-pulse-cool 2.4s ease-in-out infinite;
  }
  .card.fan {
    border-color: rgba(180,178,169,0.22);
    animation: ac-pulse-fan 2.8s ease-in-out infinite;
  }
  .card.drying {
    border-color: rgba(201,122,80,0.30);
    animation: ac-pulse-dry 2.4s ease-in-out infinite;
  }

  /* ── Color bar ── */
  .bar {
    border-radius: 99px;
    align-self: stretch;
    transition: background 0.4s ease;
  }

  /* ── Body ── */
  .body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  /* ── Top row: icon + name + badge ── */
  .top {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .icon { flex-shrink: 0; display: flex; align-items: center; }
  .ac-icon-heat { animation: ac-heat 1.5s ease-in-out infinite; }
  .ac-icon-snow { animation: ac-snow 3s linear infinite; }
  .ac-icon-fan  { animation: ac-fan 2s linear infinite; }

  .name {
    font-size: 13px;
    font-weight: 500;
    color: #F1EFE8;
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Badge ── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 99px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background 0.4s ease, color 0.4s ease;
  }
  .badge-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .badge-dot.blink { animation: ac-dot 1.8s ease-in-out infinite; }

  /* ── Chips ── */
  .chips {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .chip {
    font-size: 11px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 6px;
    white-space: nowrap;
  }

  /* ── Progress bar ── */
  .progress-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .progress-track {
    height: 3px;
    border-radius: 99px;
    background: rgba(255,255,255,0.07);
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 1s ease;
  }
  .progress-labels {
    display: flex;
    justify-content: space-between;
  }
  .progress-labels span {
    font-size: 10px;
    color: rgba(255,255,255,0.28);
  }

  /* ── Right column ── */
  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 2px;
    min-width: 52px;
  }
  .temp-val {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.5px;
    line-height: 1;
    transition: color 0.4s ease;
  }
  .temp-label {
    font-size: 10px;
    color: rgba(255,255,255,0.28);
  }
`;

class AhaAcSlimCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built = false;
  }

  setConfig(config) {
    if (!config.entity) throw new Error('aha-ac-slim-card: wymagane pole "entity"');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) { this._build(); this._built = true; }
    this._update();
  }

  _build() {
    const shadow = this.shadowRoot;

    const style = document.createElement('style');
    style.textContent = AC_STYLES;
    shadow.appendChild(style);

    shadow.innerHTML += `
      <div class="card" id="card">
        <div class="bar" id="bar"></div>
        <div class="body">
          <div class="top">
            <div class="icon" id="icon"></div>
            <div class="name" id="name">—</div>
            <div class="badge" id="badge">
              <span class="badge-dot" id="dot"></span>
              <span id="badge-label">—</span>
            </div>
          </div>
          <div class="chips" id="chips"></div>
          <div class="progress-wrap" id="progress" style="display:none;">
            <div class="progress-track">
              <div class="progress-fill" id="progress-fill"></div>
            </div>
            <div class="progress-labels">
              <span id="progress-desc"></span>
              <span id="progress-pct"></span>
            </div>
          </div>
        </div>
        <div class="right">
          <div class="temp-val" id="temp">—°</div>
          <div class="temp-label">w pokoju</div>
        </div>
      </div>
    `;

    shadow.querySelector('#card').addEventListener('click', () => this._moreInfo());

    this._card       = shadow.querySelector('#card');
    this._bar        = shadow.querySelector('#bar');
    this._icon       = shadow.querySelector('#icon');
    this._name       = shadow.querySelector('#name');
    this._badge      = shadow.querySelector('#badge');
    this._dot        = shadow.querySelector('#dot');
    this._badgeLabel = shadow.querySelector('#badge-label');
    this._chips      = shadow.querySelector('#chips');
    this._progress   = shadow.querySelector('#progress');
    this._pFill      = shadow.querySelector('#progress-fill');
    this._pDesc      = shadow.querySelector('#progress-desc');
    this._pPct       = shadow.querySelector('#progress-pct');
    this._temp       = shadow.querySelector('#temp');
    this._built      = true;
  }

  _update() {
    if (!this._hass || !this._config || !this._built) return;
    const stateObj = this._hass.states[this._config.entity];
    if (!stateObj) return;

    const mode   = stateObj.state || 'off';
    const action = stateObj.attributes.hvac_action || mode;
    const currentTemp = stateObj.attributes.current_temperature ?? null;
    const targetTemp  = stateObj.attributes.temperature ?? null;
    const fanMode     = (stateObj.attributes.fan_mode || 'auto').toLowerCase();
    const name = this._config.name || stateObj.attributes.friendly_name || this._config.entity;

    /* ── classify state ── */
    const isHeating = action === 'heating';
    const isCooling = action === 'cooling';
    const isFan     = action === 'fan' || mode === 'fan_only';
    const isDrying  = mode === 'dry';
    const isOff     = mode === 'off';
    const isActive  = isHeating || isCooling || isFan || isDrying;

    const stateKey = isHeating ? 'heating'
                   : isCooling ? 'cooling'
                   : isFan     ? 'fan'
                   : isDrying  ? 'drying'
                   : isOff     ? 'off' : 'idle';

    const col = AC_COLORS[stateKey];

    /* ── card class ── */
    this._card.className = `card ${isActive ? stateKey : ''}`;

    /* ── color bar ── */
    this._bar.style.background = col.main;

    /* ── icon ── */
    this._icon.innerHTML = isHeating ? AC_SVG.heating
                         : isCooling ? AC_SVG.cooling
                         : isFan     ? AC_SVG.fan
                         : isDrying  ? AC_SVG.drying
                         : AC_SVG.idle;

    /* ── name ── */
    this._name.textContent = name;

    /* ── badge ── */
    const badgeLabel = isHeating ? 'grzeje'
                     : isCooling ? 'chłodzi'
                     : isFan     ? 'wentyluje'
                     : isDrying  ? 'osusza'
                     : isOff     ? 'wyłączona' : 'czeka';

    const badgeBg = isActive
      ? `rgba(${col.r},${col.g},${col.b},0.14)`
      : 'rgba(95,94,90,0.12)';

    this._badge.style.background = badgeBg;
    this._badge.style.color      = isActive ? col.main : '#5F5E5A';
    this._dot.style.background   = isActive ? col.main : '#5F5E5A';
    this._dot.className          = `badge-dot${isActive ? ' blink' : ''}`;
    this._badgeLabel.textContent = badgeLabel;

    /* ── chips ── */
    const modeInfo = AC_MODE_LABELS[mode] ?? AC_MODE_LABELS.off;
    const fanInfo  = AC_FAN_LABELS[fanMode] ?? { label: fanMode, col: '#888780', bg: 'rgba(136,135,128,0.10)' };

    let chipsHtml = `<span class="chip" style="background:${modeInfo.bg};color:${modeInfo.col};">${modeInfo.label}</span>`;

    if (!isOff) {
      chipsHtml += `<span class="chip" style="background:${fanInfo.bg};color:${fanInfo.col};">${fanInfo.label}</span>`;
    }
    if (!isOff && targetTemp !== null) {
      chipsHtml += `<span class="chip" style="background:rgba(151,196,89,0.10);color:#97C459;">▶ ${targetTemp}°C</span>`;
    }
    this._chips.innerHTML = chipsHtml;

    /* ── progress bar ── */
    if (isActive && (isHeating || isCooling) && currentTemp !== null && targetTemp !== null) {
      const diff = Math.abs(targetTemp - currentTemp);
      let pct, desc;
      if (diff < 0.5) {
        pct  = 100;
        desc = 'temperatura osiągnięta';
      } else {
        const range = 10;
        pct  = Math.min(100, Math.max(0, Math.round(((range - diff) / range) * 100)));
        desc = isHeating ? `dogrzewa +${diff.toFixed(1)}°C` : `schładza −${diff.toFixed(1)}°C`;
      }
      const grad = isHeating ? 'linear-gradient(90deg,#9A5230,#EF9F27)'
                             : 'linear-gradient(90deg,#185FA5,#85B7EB)';
      this._pFill.style.width      = `${pct}%`;
      this._pFill.style.background = grad;
      this._pDesc.textContent      = desc;
      this._pPct.textContent       = `${pct}%`;
      this._progress.style.display = '';
    } else {
      this._progress.style.display = 'none';
    }

    /* ── right: current temp ── */
    const tempCol = isHeating ? '#EF9F27' : isCooling ? '#85B7EB' : '#5F5E5A';
    this._temp.textContent  = currentTemp !== null ? `${currentTemp.toFixed(1)}°` : '—°';
    this._temp.style.color  = tempCol;
  }

  _moreInfo() {
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true, composed: true,
      detail: { entityId: this._config.entity },
    }));
  }

  getCardSize() { return 2; }

  static getStubConfig() {
    return { entity: 'climate.example' };
  }
}

customElements.define('aha-ac-slim-card', AhaAcSlimCard);
if (!customElements.get('ac-slim-card'))
  customElements.define('ac-slim-card', class extends AhaAcSlimCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-ac-slim-card',
  name:        'AHA AC Slim Card',
  description: 'Slim card dla klimatyzacji — grzanie/chłodzenie z animowanym pulse, progress bar, chipy trybu i wentylatora.',
  preview:     true,
});
