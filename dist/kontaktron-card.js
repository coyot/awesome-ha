/**
 * kontaktron-card.js
 * Custom Lovelace card for binary sensors (contact sensors)
 * 
 * States:
 *   off  → closed (green)
 *   on   → open < threshold (yellow)
 *   on   → open ≥ threshold → ALARM (red, pulsing)
 *
 * Config options:
 *   entity:      (required) binary_sensor.*
 *   name:        (optional) override name
 *   icon_closed: (optional) MDI icon when closed,  default: mdi:lock
 *   icon_open:   (optional) MDI icon when open,    default: mdi:lock-open-outline
 *   icon_alarm:  (optional) MDI icon when alarm,   default: mdi:alert
 *   alarm_minutes: (optional) threshold in minutes, default: 10
 *
 * Usage:
 *   type: custom:kontaktron-card
 *   entity: binary_sensor.okno_salon
 *   name: Okno salon
 *   alarm_minutes: 10
 *
 * Registration:
 *   Copy this file to /config/www/kontaktron-card.js
 *   Add to resources:
 *     url: /local/kontaktron-card.js
 *     type: module
 */

const STYLES = `
  :host {
    display: block;
  }

  @keyframes alarm-pulse {
    0%, 100% {
      background: #2c1410;
      box-shadow: 0 0 0 0 rgba(255,69,58,0),
                  0 2px 8px rgba(0,0,0,0.35);
    }
    50% {
      background: #3a1610;
      box-shadow: 0 0 0 5px rgba(255,69,58,0.28),
                  0 0 22px rgba(255,69,58,0.5),
                  0 2px 8px rgba(0,0,0,0.35);
    }
  }

  @keyframes ring-pulse {
    0%   { transform: scale(1);    opacity: 0.85; }
    70%  { transform: scale(1.6);  opacity: 0; }
    100% { transform: scale(1.6);  opacity: 0; }
  }

  @keyframes icon-shake {
    0%,100% { transform: rotate(0deg); }
    15%     { transform: rotate(-12deg); }
    30%     { transform: rotate(10deg); }
    45%     { transform: rotate(-8deg); }
    60%     { transform: rotate(6deg); }
    75%     { transform: rotate(-4deg); }
    90%     { transform: rotate(2deg); }
  }

  .card {
    border-radius: 20px;
    padding: 14px;
    display: grid;
    grid-template-rows: auto 1fr auto auto auto;
    aspect-ratio: 1 / 1;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.15s ease, border-color 0.4s ease;
    border: 1px solid rgba(255,255,255,0.06);
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  .card:active {
    transform: scale(0.96);
  }

  /* ── STATE: closed (normal / inactive) ── */
  .card.closed {
    background: #1c1c1e;
  }
  .card.closed .glow {
    background: none;
  }

  /* ── STATE: open (below threshold) ── */
  .card.open {
    background: #252510;
    border-color: rgba(255,214,10,0.15);
  }
  .card.open .glow {
    background: radial-gradient(ellipse at 30% 30%, rgba(255,214,10,0.11) 0%, transparent 68%);
  }

  /* ── STATE: alarm ── */
  .card.alarm {
    border-color: rgba(255,69,58,0.3);
    animation: alarm-pulse 1.5s ease-in-out infinite;
  }
  .card.alarm .glow {
    background: radial-gradient(ellipse at 30% 30%, rgba(255,69,58,0.18) 0%, transparent 68%);
  }

  /* Glow overlay */
  .glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    transition: background 0.4s ease;
  }

  /* Top row: icon only (name moved to bottom) */
  .top-bar {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  .spacer { /* fills 1fr grid row */ }

  /* Icon area */
  .icon-wrap {
    position: relative;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-bg {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
    transition: background 0.4s ease;
  }
  .closed  .icon-bg { background: rgba(142,142,147,0.12); }
  .open    .icon-bg { background: rgba(255,214,10,0.18); }
  .alarm   .icon-bg { background: rgba(255,69,58,0.22); }

  .ring {
    position: absolute;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 2px solid rgba(255,69,58,0.75);
    z-index: 1;
    pointer-events: none;
    display: none;
  }
  .alarm .ring {
    display: block;
    animation: ring-pulse 1.5s ease-out infinite;
  }

  ha-icon {
    --mdc-icon-size: 20px;
    transition: color 0.4s ease;
  }
  .closed  ha-icon { color: #8e8e93; }
  .open    ha-icon { color: #ffd60a; }
  .alarm   ha-icon {
    color: #ff453a;
    animation: icon-shake 0.8s ease-in-out infinite;
    transform-origin: top center;
  }

  /* Text */
  .name {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.65);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
    padding-bottom: 4px;
    position: relative;
    z-index: 2;
  }

  .state-label {
    font-size: 10px;
    font-weight: 500;
    margin-top: 2px;
    position: relative;
    z-index: 2;
    transition: color 0.4s ease;
  }
  .closed  .state-label { color: #8e8e93; }
  .open    .state-label { color: #ffd60a; }
  .alarm   .state-label { color: #ff453a; }

  .duration {
    font-size: 11px;
    font-weight: 400;
    margin-top: 5px;
    position: relative;
    z-index: 2;
    transition: color 0.4s ease, font-weight 0.3s ease;
  }
  .closed  .duration { color: #636366; }
  .open    .duration { color: #636366; }
  .alarm   .duration { color: #ff6b60; font-weight: 600; }

  /* ── mobile: icon + name only ── */
  @media (max-width: 600px) {
    .bat-wrap    { display: none !important; }
    .state-label { display: none; }
    .duration    { display: none; }
    .card        { grid-template-rows: 1fr auto; padding: 10px; }
    .top-bar     { display: contents; }
    .icon-wrap   { grid-row: 1; align-self: center; justify-self: start; }
    .spacer      { display: none; }
    .name        { grid-row: 2; margin-top: 0; }
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
    white-space: nowrap; opacity: 0; pointer-events: none;
    transition: opacity .15s; backdrop-filter: blur(8px);
  }
  .bat-wrap:hover .bat-tip { opacity: 1; }
  @media (max-width: 400px) { .bat-wrap { display: none; } }
`;

class KontaktronCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._intervalId = null;
  }

  /* ─── HA lifecycle ─────────────────────────────────── */

  set hass(hass) {
    this._hass = hass;
    if (!this._built) {
      this._build();
      this._built = true;
    }
    this._update();
  }

  setConfig(config) {
    if (!config.entity) throw new Error('kontaktron-card: brak pola "entity"');
    this._config = {
      alarm_minutes: 10,
      icon_closed: 'mdi:lock',
      icon_open:   'mdi:lock-open-variant',
      icon_alarm:  'mdi:bell-alert',
      ...config,
    };
  }

  connectedCallback() {
    // Refresh duration text every 30 s
    this._intervalId = setInterval(() => this._update(), 30000);
  }

  disconnectedCallback() {
    clearInterval(this._intervalId);
  }

  /* ─── Build DOM (once) ──────────────────────────────── */

  _build() {
    const shadow = this.shadowRoot;

    const style = document.createElement('style');
    style.textContent = STYLES;
    shadow.appendChild(style);

    this._card = document.createElement('div');
    this._card.className = 'card closed';

    this._card.innerHTML = `
      <div class="glow"></div>
      <div class="top-bar">
        <div class="icon-wrap">
          <div class="ring"></div>
          <div class="icon-bg">
            <ha-icon icon="mdi:lock"></ha-icon>
          </div>
        </div>
      </div>
      <div class="spacer"></div>
      <div class="state-label">zamknięte</div>
      <div class="duration">—</div>
      <div class="name">—</div>
    `;

    this._card.addEventListener('click', () => this._handleClick());

    shadow.appendChild(this._card);

    this._haIcon      = shadow.querySelector('ha-icon');
    this._nameEl      = shadow.querySelector('.name');
    this._stateEl     = shadow.querySelector('.state-label');
    this._durationEl  = shadow.querySelector('.duration');

    /* battery widget — created once, shown only if battery_entity configured */
    this._batWrap = document.createElement('div');
    this._batWrap.className = 'bat-wrap';
    this._batWrap.style.display = 'none';
    this._batWrap.innerHTML = `<div class="bat-tip"></div><svg width="18" height="9" viewBox="0 0 22 11"></svg>`;
    this._card.appendChild(this._batWrap);
    this._batTip = this._batWrap.querySelector('.bat-tip');
    this._batSvg = this._batWrap.querySelector('svg');
  }

  /* ─── Update on state change ─────────────────────────  */

  _update() {
    if (!this._hass || !this._config) return;

    const stateObj = this._hass.states[this._config.entity];
    if (!stateObj) {
      this._nameEl.textContent = this._config.entity;
      this._stateEl.textContent = 'nieznany';
      this._durationEl.textContent = '';
      return;
    }

    const isOpen      = stateObj.state === 'on';
    const name        = this._config.name || stateObj.attributes.friendly_name || this._config.entity;
    const changed     = new Date(stateObj.last_changed);
    const diffMin     = Math.floor((Date.now() - changed.getTime()) / 60000);
    const isAlarm     = isOpen && diffMin >= this._config.alarm_minutes;

    /* Determine visual state class */
    let stateClass, icon, stateText, durationText;

    if (!isOpen) {
      stateClass   = 'closed';
      icon         = this._config.icon_closed;
      stateText    = 'zamknięte';
      durationText = '';
    } else if (!isAlarm) {
      stateClass   = 'open';
      icon         = this._config.icon_open;
      stateText    = 'otwarte';
      durationText = this._formatDuration(diffMin);
    } else {
      stateClass   = 'alarm';
      icon         = this._config.icon_alarm;
      stateText    = 'ALARM';
      durationText = this._formatDuration(diffMin);
    }

    /* Apply */
    this._card.className       = `card ${stateClass}`;
    this._haIcon.setAttribute('icon', icon);
    this._nameEl.textContent   = name;
    this._stateEl.textContent  = stateText;
    this._durationEl.textContent = durationText;
    this._updateBattery();
  }

  _updateBattery() {
    const entity = this._config.battery_entity;
    if (!entity) { this._batWrap.style.display = 'none'; return; }
    const s = this._hass.states[entity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') {
      this._batWrap.style.display = 'none';
      return;
    }
    const pct     = parseFloat(s.state);
    if (pct >= 25) { this._batWrap.style.display = 'none'; return; }
    const low     = pct < 20;
    const col     = low ? '#FF453A' : 'rgba(255,255,255,0.42)';
    const fillCol = low ? '#FF453A' : 'rgba(255,255,255,0.50)';
    const fillW   = Math.round((Math.max(0, Math.min(100, pct)) / 100) * 13);
    this._batTip.textContent = Math.round(pct) + '%';
    this._batSvg.innerHTML = `
      <rect x="0.5" y="0.5" width="17" height="10" rx="2.5"
            fill="none" stroke="${col}" stroke-width="1.1"/>
      <rect x="18" y="3.5" width="2.5" height="4" rx="1" fill="${col}" opacity="0.7"/>
      ${fillW > 0 ? `<rect x="2" y="2" width="${fillW}" height="6" rx="1.5" fill="${fillCol}"/>` : ''}`;
    this._batWrap.style.display = '';
  }

  /* ─── Helpers ───────────────────────────────────────── */

  _formatDuration(minutes) {
    if (minutes < 1)   return 'przed chwilą';
    if (minutes < 60)  return `od ${minutes} min`;
    const h = Math.floor(minutes / 60);
    if (h < 24) {
      const m = minutes % 60;
      return m === 0 ? `od ${h}h` : `od ${h}h ${m}min`;
    }
    const d  = Math.floor(h / 24);
    const hr = h % 24;
    return hr === 0 ? `od ${d}d` : `od ${d}d ${hr}h`;
  }

  _handleClick() {
    const event = new Event('hass-more-info', { bubbles: true, composed: true });
    event.detail = { entityId: this._config.entity };
    this.dispatchEvent(event);
  }

  /* ─── Card size hint for layout ─────────────────────── */

  getCardSize() { return 2; }

  static getConfigElement() {
    // Visual config editor — stub (wystarczy YAML)
    return document.createElement('div');
  }

  static getStubConfig() {
    return {
      entity:         'binary_sensor.example',
      battery_entity: '',
      name:           'Okno salon',
      alarm_minutes:  10,
    };
  }
}

customElements.define('aha-kontaktron-card', KontaktronCard);
if (!customElements.get('kontaktron-card'))
  customElements.define('kontaktron-card', class extends KontaktronCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-kontaktron-card',
  name:        'Kontaktron Card',
  description: 'Karta dla czujnika otwarcia z animowanym alarmem po przekroczeniu czasu',
  preview:     true,
});