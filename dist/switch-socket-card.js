/**
 * switch-socket-card.js — AHA Switch / Socket Card
 *
 * OFF → identyczny styl z kontaktron-card (closed): ciemny, wyciszony, brak animacji
 * ON  → żółty glow, pulsowanie, ikona z drop-shadow — jak dotychczasowy switch_socket.yaml
 *
 * Tap: action sheet (Włącz / Wyłącz) | Hold (500ms): more-info
 *
 * Config:
 *   entity:  (required) switch.* | input_boolean.*
 *   name:    (optional) override nazwy
 *   icon:    (optional) MDI icon string (np. 'mdi:power-socket-eu') zamiast domyślnego SVG
 */

const SW_STYLES = `
  :host { display: block; width: 100%; height: 100%; position: relative; }

  @keyframes sw-pulse {
    0%,100% { box-shadow: 0 0 0 0   rgba(255,214,10,0); }
    50%     { box-shadow: 0 0 0 6px rgba(255,214,10,0.12); }
  }
  .card {
    width: 100%; aspect-ratio: 1 / 1;
    border-radius: 20px;
    padding: 10px 10px 8px;
    display: flex; flex-direction: column;
    position: relative; cursor: pointer;
    transition: transform .15s ease, border-color .4s ease, background .4s ease;
    border: 1px solid rgba(255,255,255,0.06);
    box-sizing: border-box;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent; user-select: none;
  }
  .card:active { transform: scale(0.96); }

  /* ── OFF — identyczny z kontaktron .closed ── */
  .card.off { background: #1c1c1e; }
  .card.off .glow { background: none; }

  /* ── ON — żółty glow ── */
  .card.on {
    background: linear-gradient(145deg,#2a2508,#1a1a0e);
    border-color: rgba(255,214,10,0.25);
    animation: sw-pulse 2.8s ease-in-out infinite;
  }
  .card.on .glow {
    background: radial-gradient(ellipse at 30% 30%, rgba(255,214,10,0.11) 0%, transparent 68%);
  }

  .glow {
    position: absolute; inset: 0;
    pointer-events: none; transition: background .4s ease;
  }

  /* ── State text — under icon ── */
  .state-text {
    text-align: center; font-size: 10px; font-weight: 600;
    padding-bottom: 2px; position: relative; z-index: 2; flex-shrink: 0;
    transition: color .4s ease;
  }
  .off .state-text { color: rgba(255,255,255,0.28); }
  .on  .state-text { color: #FFD60A; }

  /* ── Icon area — jak kontaktron ── */
  .icon-area {
    flex: 1; display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 2;
  }
  .icon-bg {
    width: 42px; height: 42px; border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    transition: background .4s ease;
  }
  .off .icon-bg { background: rgba(142,142,147,0.12); }
  .on  .icon-bg { background: rgba(255,214,10,0.18); }

  /* ha-icon fallback gdy config.icon ustawiony */
  ha-icon {
    --mdc-icon-size: 24px;
    transition: color .4s ease, filter .4s ease;
  }
  .off ha-icon { color: #8e8e93; }
  .on  ha-icon { color: #FFD60A; filter: drop-shadow(0 0 5px rgba(255,214,10,0.5)); }

  /* ── Name — jak kontaktron .name ── */
  .name {
    text-align: center; font-size: 12px; font-weight: 600;
    color: rgba(255,255,255,0.65);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    padding-bottom: 4px; position: relative; z-index: 2; flex-shrink: 0;
    transition: color .4s ease;
  }
  .on .name { color: rgba(255,255,255,0.90); }

  /* ── Action sheet overlay ── */
  .action-sheet {
    position: absolute; inset: 0; border-radius: 20px;
    background: rgba(0,0,0,0.68);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 8px;
    opacity: 0; pointer-events: none;
    transition: opacity .15s ease;
    z-index: 10;
  }
  .action-sheet.open { opacity: 1; pointer-events: all; }

  .act-btn {
    width: 78%; padding: 9px 0;
    border-radius: 11px; cursor: pointer;
    font-size: 13px; font-weight: 600;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    transition: transform .1s ease;
  }
  .act-btn:active { transform: scale(0.96); }
  .act-on  { background: rgba(255,214,10,0.18); color: #FFD60A;
              border: 1px solid rgba(255,214,10,0.30); }
  .act-off { background: rgba(142,142,147,0.14); color: rgba(255,255,255,0.60);
              border: 1px solid rgba(142,142,147,0.20); }
`;

/* ── Inline SVG icons ── */
const _svgOn = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none"
    style="filter:drop-shadow(0 0 5px rgba(255,214,10,0.5));flex-shrink:0;">
  <circle cx="12" cy="10" r="5" stroke="#FFD60A" stroke-width="1.6"/>
  <path d="M9 15h6l-.5 3a1 1 0 01-1 .8h-3a1 1 0 01-1-.8L9 15z"
        stroke="#FFD60A" stroke-width="1.4" fill="rgba(255,214,10,0.15)"/>
  <line x1="9.5" y1="18.5" x2="14.5" y2="18.5"
        stroke="#FFD60A" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="12" y1="5" x2="12" y2="3.5"
        stroke="#FFD60A" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="16.5" y1="6.5" x2="17.5" y2="5.5"
        stroke="#FFD60A" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="7.5" y1="6.5" x2="6.5" y2="5.5"
        stroke="#FFD60A" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

const _svgOff = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;">
  <circle cx="12" cy="10" r="5" stroke="#8e8e93" stroke-width="1.6"/>
  <path d="M9 15h6l-.5 3a1 1 0 01-1 .8h-3a1 1 0 01-1-.8L9 15z"
        stroke="#8e8e93" stroke-width="1.4"/>
  <line x1="9.5" y1="18.5" x2="14.5" y2="18.5"
        stroke="#8e8e93" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

class AhaSwitchSocketCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built = false;
  }

  setConfig(config) {
    if (!config.entity) throw new Error('switch-socket-card: brak pola "entity"');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) { this._build(); this._built = true; }
    this._update();
  }

  /* ── Build DOM once ── */
  _build() {
    const shadow = this.shadowRoot;

    const style = document.createElement('style');
    style.textContent = SW_STYLES;
    shadow.appendChild(style);

    this._card = document.createElement('div');
    this._card.className = 'card off';
    this._card.innerHTML = `
      <div class="glow"></div>
      <div class="icon-area">
        <div class="icon-bg">
          <div class="icon-inner"></div>
        </div>
      </div>
      <div class="state-text">wyłączone</div>
      <div class="name">—</div>
    `;

    /* hold detection: 500ms → more-info, short tap → action sheet */
    let holdTimer = null;
    let didHold = false;
    this._card.addEventListener('pointerdown', () => {
      didHold = false;
      holdTimer = setTimeout(() => { didHold = true; this._moreInfo(); }, 500);
    });
    this._card.addEventListener('pointerup',     () => clearTimeout(holdTimer));
    this._card.addEventListener('pointercancel', () => clearTimeout(holdTimer));
    this._card.addEventListener('click', () => { if (!didHold) this._showSheet(); });

    shadow.appendChild(this._card);

    /* action sheet — sibling of card, poza overflow:hidden */
    this._sheet = document.createElement('div');
    this._sheet.className = 'action-sheet';
    this._sheet.innerHTML = `
      <button class="act-btn act-on">Włącz</button>
      <button class="act-btn act-off">Wyłącz</button>
    `;
    this._sheet.addEventListener('click', e => {
      if (e.target === this._sheet) this._hideSheet();       // klik na backdrop
    });
    this._sheet.querySelector('.act-on').addEventListener('click',  () => this._callService('turn_on'));
    this._sheet.querySelector('.act-off').addEventListener('click', () => this._callService('turn_off'));
    shadow.appendChild(this._sheet);

    this._iconEl  = shadow.querySelector('.icon-inner');
    this._stateEl = shadow.querySelector('.state-text');
    this._nameEl  = shadow.querySelector('.name');

    /* ha-icon — tworzymy raz jeśli config.icon ustawiony */
    if (this._config?.icon) {
      this._haIcon = document.createElement('ha-icon');
      this._iconEl.appendChild(this._haIcon);
    }
  }

  /* ── Update on state change ── */
  _update() {
    if (!this._hass || !this._config) return;
    const stateObj = this._hass.states[this._config.entity];
    if (!stateObj) return;

    const on   = stateObj.state === 'on';
    const name = this._config.name
               || stateObj.attributes.friendly_name
               || this._config.entity;

    this._card.className      = `card ${on ? 'on' : 'off'}`;
    this._stateEl.textContent = on ? 'włączone' : 'wyłączone';
    this._nameEl.textContent  = name;

    if (this._config.icon) {
      if (this._haIcon) this._haIcon.setAttribute('icon', this._config.icon);
    } else {
      this._iconEl.innerHTML = on ? _svgOn : _svgOff;
    }
  }

  /* ── Action sheet ── */
  _showSheet() { this._sheet?.classList.add('open'); }
  _hideSheet() { this._sheet?.classList.remove('open'); }

  _callService(service) {
    const entity = this._config.entity;
    this._hass.callService(entity.split('.')[0], service, { entity_id: entity });
    this._hideSheet();
  }

  _moreInfo() {
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true, composed: true,
      detail: { entityId: this._config.entity },
    }));
  }

  getCardSize() { return 2; }

  static getConfigElement() { return document.createElement('div'); }

  static getStubConfig() {
    return { entity: 'switch.example', name: 'Gniazdko' };
  }
}

customElements.define('aha-switch-socket-card', AhaSwitchSocketCard);
if (!customElements.get('switch-socket-card'))
  customElements.define('switch-socket-card', class extends AhaSwitchSocketCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-switch-socket-card',
  name:        'Switch / Socket Card',
  description: 'Karta przełącznika/gniazdka — OFF jak kontaktron, ON żółty glow. Tap: toggle, hold: more-info.',
  preview:     true,
});
