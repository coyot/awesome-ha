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
  :host { display: block; position: relative; }

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

  /* ── Overlay potwierdzenia (otwarte czujniki) ── */
  @keyframes ib-fade-in { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }

  .ib-confirm-overlay {
    position: absolute; inset: 0; z-index: 100;
    background: rgba(0,0,0,0.72);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(6px);
    animation: ib-fade-in 0.15s ease;
  }
  .ib-confirm-modal {
    background: linear-gradient(150deg, #0f1c2e 0%, #0b1420 100%);
    border: 1px solid rgba(255,200,50,0.28);
    border-radius: 14px;
    padding: 15px 16px 14px;
    width: calc(100% - 20px);
    font-family: -apple-system, system-ui, sans-serif;
    box-shadow: 0 0 20px rgba(255,180,0,0.12);
  }
  .ib-confirm-title {
    font-size: 12px; font-weight: 700; letter-spacing: .01em;
    color: rgba(255,205,55,0.95);
    margin-bottom: 9px;
    display: flex; align-items: center; gap: 6px;
  }
  .ib-confirm-sensor {
    font-size: 11px; line-height: 1.6;
    color: rgba(255,255,255,0.55);
    padding-left: 4px;
    display: flex; align-items: center; gap: 5px;
  }
  .ib-confirm-sensor::before { content: "·"; color: rgba(255,205,55,0.55); font-size: 14px; }
  .ib-confirm-list { margin-bottom: 13px; }
  .ib-confirm-btns { display: flex; gap: 8px; }
  .ib-confirm-cancel {
    flex: 1; padding: 8px 0; border-radius: 10px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
    color: rgba(255,255,255,0.45);
    font-size: 12px; font-weight: 600;
    cursor: pointer; font-family: inherit;
    transition: background .15s;
  }
  .ib-confirm-cancel:active { background: rgba(255,255,255,0.11); }
  .ib-confirm-ok {
    flex: 1; padding: 8px 0; border-radius: 10px;
    background: rgba(255,205,55,0.14);
    border: 1px solid rgba(255,205,55,0.35);
    color: rgba(255,210,60,0.95);
    font-size: 12px; font-weight: 700;
    cursor: pointer; font-family: inherit;
    transition: background .15s;
  }
  .ib-confirm-ok:active { background: rgba(255,205,55,0.24); }
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

    // status_entities: count how many sub-devices are actually on
    let statusText = isOn ? 'Włączony' : 'Wyłączony';
    const subEntities = item.status_entities || [];
    if (subEntities.length > 0) {
      const activeCount = subEntities.filter(id => this._hass.states[id]?.state === 'on').length;
      if (isOn || activeCount > 0) {
        statusText = `${activeCount}/${subEntities.length} aktywne`;
      }
    }

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
        <div class="ib-status">${statusText}</div>
      </div>
    `;

    tile.querySelector('.ib-toggle').addEventListener('click', e => {
      e.stopPropagation();
      this._toggle(item.entity, item);
    });
    tile.addEventListener('click', () => this._toggle(item.entity, item));

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

  _getOpenSensors(item) {
    // item-level config ma pierwszeństwo nad card-level
    const cfg = {
      confirm_sensors:       item.confirm_sensors       ?? this._config.confirm_sensors,
      confirm_sensor_class:  item.confirm_sensor_class  ?? this._config.confirm_sensor_class,
    };
    const st = this._hass.states;
    if (cfg.confirm_sensors && cfg.confirm_sensors.length) {
      return cfg.confirm_sensors
        .map(id => st[id])
        .filter(s => s && s.state === 'on')
        .map(s => s.attributes.friendly_name || s.entity_id);
    }
    const classes = cfg.confirm_sensor_class;
    if (!classes || !classes.length) return [];
    return Object.values(st)
      .filter(s => s.entity_id.startsWith('binary_sensor.')
                && classes.includes(s.attributes.device_class)
                && s.state === 'on')
      .map(s => s.attributes.friendly_name || s.entity_id);
  }

  _toggle(entityId, item) {
    const stateObj = this._hass.states[entityId];
    const isOn     = stateObj && stateObj.state === 'on';
    // Potwierdzenie tylko przy włączaniu (ON), nie przy wyłączaniu
    if (!isOn) {
      const open = this._getOpenSensors(item || {});
      if (open.length > 0) { this._showConfirm(entityId, open); return; }
    }
    this._hass.callService('input_boolean', 'toggle', { entity_id: entityId });
  }

  _showConfirm(entityId, openSensors) {
    const existing = this.shadowRoot.querySelector('.ib-confirm-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'ib-confirm-overlay';
    overlay.innerHTML = `
      <div class="ib-confirm-modal">
        <div class="ib-confirm-title">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M8 2.5L13.5 13H2.5L8 2.5Z" stroke="rgba(255,205,55,0.90)" stroke-width="1.5" stroke-linejoin="round" fill="rgba(255,205,55,0.10)"/>
            <line x1="8" y1="7" x2="8" y2="10.2" stroke="rgba(255,205,55,0.90)" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="8" cy="12" r="0.75" fill="rgba(255,205,55,0.90)"/>
          </svg>
          Otwarte czujniki (${openSensors.length})
        </div>
        <div class="ib-confirm-list">
          ${openSensors.map(n => `<div class="ib-confirm-sensor">${n}</div>`).join('')}
        </div>
        <div class="ib-confirm-btns">
          <button class="ib-confirm-cancel">Anuluj</button>
          <button class="ib-confirm-ok">Włącz mimo to</button>
        </div>
      </div>`;

    overlay.querySelector('.ib-confirm-cancel').addEventListener('click', e => {
      e.stopPropagation(); overlay.remove();
    });
    overlay.querySelector('.ib-confirm-ok').addEventListener('click', e => {
      e.stopPropagation(); overlay.remove();
      this._hass.callService('input_boolean', 'turn_on', { entity_id: entityId });
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    this.shadowRoot.appendChild(overlay);
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
