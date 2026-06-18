/**
 * aha-input-boolean-card.js
 *
 * Apple Home style toggle row dla input_boolean.
 * Nazwa i ikona pobierane automatycznie z atrybutów encji HA.
 *
 * Config (jedna encja):
 *   entity: input_boolean.xxx
 *   color:  "#30B0FF"   (optional, default niebieski)
 *   name:   "override"  (optional)
 *   icon:   "mdi:xxx"   (optional)
 *   info:   "sensor.xxx" | "Dowolny tekst" (optional, dodatkowa linia)
 *
 * Config (wiele encji w jednej karcie):
 *   entities:
 *     - entity: input_boolean.xxx
 *       color: "#34C759"
 *     - entity: input_boolean.yyy
 */

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
      : [{ entity: config.entity, color: config.color, name: config.name, icon: config.icon, info: config.info }];
    this._renderShell();
  }

  set hass(hass) {
    this._hass = hass;
    // Re-render only when any item's state changes
    const changed = this._items.some(item => {
      const s = hass.states[item.entity];
      return s && s.state !== this._prevStates[item.entity];
    });
    if (changed || !this.shadowRoot.querySelector('.ib-list')) {
      this._items.forEach(item => {
        const s = hass.states[item.entity];
        if (s) this._prevStates[item.entity] = s.state;
      });
      this._renderRows();
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

  _renderShell() {
    this.shadowRoot.innerHTML = `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :host { display: block; }

        .ib-card {
          background: #1C1C1E;
          border-radius: 16px;
          border: 0.5px solid rgba(255,255,255,0.08);
          overflow: hidden;
          font-family: -apple-system, system-ui, sans-serif;
        }

        .ib-list { display: flex; flex-direction: column; }

        .ib-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 15px;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          transition: background 0.2s ease;
          border-top: 0.5px solid rgba(255,255,255,0.05);
        }
        .ib-row:first-child { border-top: none; }
        .ib-row:active { background: rgba(255,255,255,0.04); }

        .ib-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.3s ease;
        }
        ha-icon {
          --mdc-icon-size: 17px;
          transition: color 0.3s ease;
        }

        .ib-text {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ib-name {
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.3s ease;
        }
        .ib-info {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* iOS toggle */
        .ib-toggle {
          position: relative;
          width: 44px;
          height: 26px;
          border-radius: 13px;
          background: rgba(255,255,255,0.12);
          border: none;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          transition: background 0.25s ease;
        }
        .ib-toggle.on { background: #34C759; }

        .ib-knob {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.35);
          transition: transform 0.25s ease;
        }
        .ib-toggle.on .ib-knob { transform: translateX(18px); }
      </style>
      <div class="ib-card">
        <div class="ib-list"></div>
      </div>
    `;
  }

  _renderRows() {
    if (!this._hass) return;
    const list = this.shadowRoot.querySelector('.ib-list');
    if (!list) return;
    list.innerHTML = '';

    this._items.forEach(item => {
      const stateObj = this._hass.states[item.entity];
      if (!stateObj) return;

      const isOn = stateObj.state === 'on';
      const name = item.name || stateObj.attributes.friendly_name || item.entity;
      const icon = item.icon || stateObj.attributes.icon || 'mdi:toggle-switch';
      const color = item.color || this._config.color || '#30B0FF';
      const [r, g, b] = this._hexToRgb(color);

      // Info line: sensor entity or static text
      let infoText = '';
      const infoSrc = item.info || this._config.info;
      if (infoSrc) {
        const infoState = this._hass.states[infoSrc];
        if (infoState) {
          const unit = infoState.attributes.unit_of_measurement || '';
          infoText = `${infoState.state}${unit ? ' ' + unit : ''}`;
        } else {
          infoText = infoSrc;
        }
      }

      const row = document.createElement('div');
      row.className = 'ib-row';
      row.dataset.entity = item.entity;
      row.innerHTML = `
        <div class="ib-icon" style="background:${isOn ? `rgba(${r},${g},${b},0.20)` : 'rgba(255,255,255,0.07)'}">
          <ha-icon icon="${icon}" style="color:${isOn ? `rgb(${r},${g},${b})` : 'rgba(255,255,255,0.30)'}"></ha-icon>
        </div>
        <div class="ib-text">
          <span class="ib-name" style="color:${isOn ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.55)'}">${name}</span>
          ${infoText ? `<span class="ib-info">${infoText}</span>` : ''}
        </div>
        <button class="ib-toggle ${isOn ? 'on' : ''}" aria-label="Toggle ${name}">
          <span class="ib-knob"></span>
        </button>
      `;

      const toggle = row.querySelector('.ib-toggle');
      toggle.addEventListener('click', e => {
        e.stopPropagation();
        this._toggle(item.entity);
      });
      row.addEventListener('click', () => this._toggle(item.entity));

      list.appendChild(row);
    });
  }

  _toggle(entityId) {
    this._hass.callService('input_boolean', 'toggle', { entity_id: entityId });
  }

  getCardSize() {
    return Math.max(1, this._items ? this._items.length : 1);
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
  description: 'Apple Home style toggle card for input_boolean entities',
});
