/**
 * aha-input-boolean-card.js
 *
 * Kafelek dla input_boolean — ikona góra-lewo, toggle góra-prawo (iOS pill),
 * nazwa + status na dole. Nazwa i ikona z atrybutów encji HA.
 *
 * Config (jeden kafelek):
 *   entity: input_boolean.xxx
 *   color:  "#30B0FF"   (optional, default niebieski)
 *   name:   "override"  (optional)
 *   icon:   "mdi:xxx"   (optional)
 *
 * Config (wiele kafelków w gridzie 2 kolumny):
 *   entities:
 *     - entity: input_boolean.xxx
 *       color: "#34C759"
 *     - entity: input_boolean.yyy
 */

const IB_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :host { display: block; }

  .ib-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .ib-tile {
    background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
    border-radius: 16px;
    border: 0.5px solid rgba(255,255,255,0.08);
    padding: 14px;
    display: flex;
    flex-direction: column;
    min-height: 110px;
    cursor: pointer;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    transition: transform 0.15s ease, border-color 0.35s ease, background 0.35s ease;
  }
  .ib-tile:active { transform: scale(0.96); }
  .ib-tile.on {
    border-color: var(--c-border);
    background: var(--c-bg);
  }

  /* ── Górny rząd: ikona + toggle ── */
  .ib-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .ib-icon {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: rgba(255,255,255,0.07);
    transition: background 0.35s ease;
  }
  .ib-tile.on .ib-icon { background: var(--c-icon-bg); }

  ha-icon {
    --mdc-icon-size: 19px;
    color: rgba(255,255,255,0.28);
    transition: color 0.35s ease;
  }
  .ib-tile.on ha-icon { color: var(--c); }

  /* ── iOS pill toggle ── */
  .ib-toggle {
    width: 44px;
    height: 26px;
    border-radius: 13px;
    background: rgba(255,255,255,0.12);
    border: none;
    position: relative;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    transition: background 0.25s ease, box-shadow 0.25s ease;
  }
  .ib-tile.on .ib-toggle {
    background: #34C759;
    box-shadow: 0 0 10px rgba(52,199,89,0.40);
  }
  .ib-dot {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255,255,255,0.50);
    box-shadow: 0 1px 3px rgba(0,0,0,0.25);
    transition: transform 0.25s ease, background 0.25s ease;
  }
  .ib-tile.on .ib-dot {
    transform: translateX(18px);
    background: #fff;
  }

  /* ── Dół: nazwa + status ── */
  .ib-bottom { margin-top: auto; padding-top: 10px; }

  .ib-name {
    font-size: 13px;
    font-weight: 700;
    color: rgba(255,255,255,0.38);
    line-height: 1.25;
    word-break: break-word;
    transition: color 0.35s ease;
  }
  .ib-tile.on .ib-name { color: rgba(255,255,255,0.92); }
  .ib-status {
    font-size: 11px;
    font-weight: 400;
    color: rgba(255,255,255,0.35);
    margin-top: 3px;
    transition: color 0.3s ease;
  }
  .ib-tile.on .ib-status { color: var(--c-status); }
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
    if (changed || !this.shadowRoot.querySelector('.ib-tile')) {
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

  _buildTile(item) {
    const stateObj = this._hass.states[item.entity];
    if (!stateObj) return null;

    const isOn = stateObj.state === 'on';
    const name = item.name || stateObj.attributes.friendly_name || item.entity;
    const icon = item.icon || stateObj.attributes.icon || 'mdi:toggle-switch';
    const color = item.color || this._config.color || '#30B0FF';
    const [r, g, b] = this._hexToRgb(color);

    const tile = document.createElement('div');
    tile.className = `ib-tile${isOn ? ' on' : ''}`;
    tile.style.cssText = `
      --c: rgb(${r},${g},${b});
      --c-border: rgba(${r},${g},${b},0.30);
      --c-bg: rgba(${r},${g},${b},0.07);
      --c-icon-bg: rgba(${r},${g},${b},0.22);
      --c-status: rgba(${r},${g},${b},0.85);
    `;

    tile.innerHTML = `
      <div class="ib-top">
        <div class="ib-icon">
          <ha-icon icon="${icon}"></ha-icon>
        </div>
        <button class="ib-toggle" aria-label="Toggle ${name}">
          <span class="ib-dot"></span>
        </button>
      </div>
      <div class="ib-bottom">
        <div class="ib-name">${name}</div>
        <div class="ib-status">${isOn ? 'Włączony' : 'Wyłączony'}</div>
      </div>
    `;

    tile.querySelector('.ib-toggle').addEventListener('click', e => {
      e.stopPropagation();
      this._toggle(item.entity);
    });
    tile.addEventListener('click', () => this._toggle(item.entity));

    return tile;
  }

  _render() {
    if (!this._hass) return;

    const isSingle = this._items.length === 1;
    this.shadowRoot.innerHTML = `<style>${IB_STYLES}</style>`;

    if (isSingle) {
      const tile = this._buildTile(this._items[0]);
      if (tile) this.shadowRoot.appendChild(tile);
    } else {
      const grid = document.createElement('div');
      grid.className = 'ib-grid';
      this._items.forEach(item => {
        const tile = this._buildTile(item);
        if (tile) grid.appendChild(tile);
      });
      this.shadowRoot.appendChild(grid);
    }
  }

  _toggle(entityId) {
    this._hass.callService('input_boolean', 'toggle', { entity_id: entityId });
  }

  getCardSize() {
    const rows = Math.ceil((this._items ? this._items.length : 1) / 2);
    return rows * 2;
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
  description: 'Toggle tile card for input_boolean entities',
});
