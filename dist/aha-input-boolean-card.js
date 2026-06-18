/**
 * aha-input-boolean-card.js
 *
 * Prosta karta dla input_boolean — poziomy wiersz, 110px.
 * Nazwa i ikona pobierane z atrybutów encji HA.
 *
 * Config (jedna encja):
 *   entity: input_boolean.xxx
 *   color:  "#30B0FF"   (optional, default niebieski)
 *   name:   "override"  (optional)
 *   icon:   "mdi:xxx"   (optional)
 *
 * Config (wiele encji — lista):
 *   entities:
 *     - entity: input_boolean.xxx
 *       color: "#34C759"
 *     - entity: input_boolean.yyy
 */

const IB_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :host { display: block; }

  .ib-card {
    background: #1C1C1E;
    border-radius: 16px;
    border: 0.5px solid rgba(255,255,255,0.08);
    overflow: hidden;
    font-family: -apple-system, system-ui, sans-serif;
  }

  .ib-row {
    display: flex;
    align-items: center;
    gap: 14px;
    height: 110px;
    padding: 0 18px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    border-top: 0.5px solid rgba(255,255,255,0.05);
    transition: background 0.2s ease;
  }
  .ib-row:first-child { border-top: none; }
  .ib-row:active { background: rgba(255,255,255,0.03); }

  /* Ikona */
  .ib-icon {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: rgba(255,255,255,0.07);
    transition: background 0.35s ease;
  }
  .ib-row.on .ib-icon { background: var(--c-icon-bg); }

  ha-icon {
    --mdc-icon-size: 20px;
    color: rgba(255,255,255,0.28);
    transition: color 0.35s ease;
  }
  .ib-row.on ha-icon { color: var(--c); }

  /* Tekst */
  .ib-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .ib-name {
    font-size: 14px;
    font-weight: 700;
    color: rgba(255,255,255,0.90);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ib-status {
    font-size: 12px;
    font-weight: 400;
    color: rgba(255,255,255,0.35);
    transition: color 0.3s ease;
  }
  .ib-row.on .ib-status { color: var(--c-status); }

  /* Toggle — krępy, prawie kwadratowy */
  .ib-toggle {
    width: 40px;
    height: 28px;
    border-radius: 9px;
    background: rgba(255,255,255,0.12);
    border: none;
    position: relative;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    transition: background 0.25s ease, box-shadow 0.25s ease;
  }
  .ib-row.on .ib-toggle {
    background: #34C759;
    box-shadow: 0 0 10px rgba(52,199,89,0.40);
  }
  .ib-dot {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255,255,255,0.45);
    box-shadow: 0 1px 3px rgba(0,0,0,0.25);
    transition: transform 0.25s ease, background 0.25s ease;
  }
  .ib-row.on .ib-dot {
    transform: translateX(12px);
    background: #fff;
  }
`;

class AhaInputBooleanCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._prevStates = {};
  }

  setConfig(config) {
    if (!config.entity && !config.entities) throw new Error('Wymagane: entity lub entities');
    this._config = config;
    this._items = config.entities
      ? config.entities.map(e => (typeof e === 'string' ? { entity: e } : e))
      : [{ entity: config.entity, color: config.color, name: config.name, icon: config.icon }];
  }

  set hass(hass) {
    this._hass = hass;
    const changed = this._items.some(item => {
      const s = hass.states[item.entity];
      return s && s.state !== this._prevStates[item.entity];
    });
    if (changed || !this.shadowRoot.querySelector('.ib-card')) {
      this._items.forEach(item => {
        const s = hass.states[item.entity];
        if (s) this._prevStates[item.entity] = s.state;
      });
      this._render();
    }
  }

  _hexToRgb(hex) {
    const h = (hex || '#30B0FF').replace('#', '');
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  }

  _render() {
    if (!this._hass) return;

    this.shadowRoot.innerHTML = `<style>${IB_STYLES}</style><div class="ib-card"></div>`;
    const card = this.shadowRoot.querySelector('.ib-card');

    this._items.forEach(item => {
      const stateObj = this._hass.states[item.entity];
      if (!stateObj) return;

      const isOn = stateObj.state === 'on';
      const name = item.name || stateObj.attributes.friendly_name || item.entity;
      const icon = item.icon || stateObj.attributes.icon || 'mdi:toggle-switch';
      const color = item.color || this._config.color || '#30B0FF';
      const [r, g, b] = this._hexToRgb(color);

      const row = document.createElement('div');
      row.className = `ib-row${isOn ? ' on' : ''}`;
      row.style.cssText = `
        --c: rgb(${r},${g},${b});
        --c-icon-bg: rgba(${r},${g},${b},0.20);
        --c-status: rgba(${r},${g},${b},0.85);
      `;

      row.innerHTML = `
        <div class="ib-icon">
          <ha-icon icon="${icon}"></ha-icon>
        </div>
        <div class="ib-text">
          <span class="ib-name">${name}</span>
          <span class="ib-status">${isOn ? 'Włączony' : 'Wyłączony'}</span>
        </div>
        <button class="ib-toggle" aria-label="Toggle ${name}">
          <span class="ib-dot"></span>
        </button>
      `;

      row.querySelector('.ib-toggle').addEventListener('click', e => {
        e.stopPropagation();
        this._toggle(item.entity);
      });
      row.addEventListener('click', () => this._toggle(item.entity));

      card.appendChild(row);
    });
  }

  _toggle(entityId) {
    this._hass.callService('input_boolean', 'toggle', { entity_id: entityId });
  }

  getCardSize() {
    return this._items ? this._items.length * 2 : 2;
  }

  static getStubConfig() {
    return { entity: 'input_boolean.example' };
  }
}

customElements.define('aha-input-boolean-card', AhaInputBooleanCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'aha-input-boolean-card',
  name: 'AHA Input Boolean Card',
  description: 'Simple toggle card for input_boolean entities',
});
