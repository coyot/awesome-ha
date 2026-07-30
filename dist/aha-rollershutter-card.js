/**
 * aha-rollershutter-card.js
 *
 * Karta sterowania roletami (cover entities) z wirtualnym stanem przez input_boolean.
 * Rejestruje się jako: aha-rollershutter-card
 *
 * Config:
 *   type: custom:aha-rollershutter-card
 *   name: Salon
 *   entities:
 *     - entity: cover.rollershutter_0001
 *       boolean: input_boolean.roleta_0001
 *       name: S1
 *   group_open_service: scene.turn_on      # optional
 *   group_open_entity: scene.otworz_rolety # optional
 *   group_close_service: scene.turn_on     # optional
 *   group_close_entity: scene.zamknij_rolety # optional
 */

const RS_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :host { display: block; }

  .rs-card {
    background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
    border-radius: 16px;
    border: 0.5px solid rgba(255,255,255,0.08);
    padding: 14px 16px;
    font-family: -apple-system, system-ui, sans-serif;
    color: rgba(255,255,255,0.85);
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  /* ── Nagłówek ── */
  .rs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .rs-title {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.85);
    letter-spacing: 0.01em;
  }
  .rs-group-btns {
    display: flex;
    gap: 6px;
  }
  .rs-btn-group {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(133,183,235,0.12);
    border: 0.5px solid rgba(133,183,235,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.15s ease, background 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .rs-btn-group:active { transform: scale(0.92); background: rgba(133,183,235,0.20); }
  .rs-btn-group svg { width: 16px; height: 16px; fill: rgba(133,183,235,0.85); }

  /* ── Separator ── */
  .rs-divider {
    height: 0.5px;
    background: rgba(255,255,255,0.06);
    margin-bottom: 10px;
  }

  /* ── Wiersze rolet ── */
  .rs-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 0;
    border-bottom: 0.5px solid rgba(255,255,255,0.04);
  }
  .rs-row:last-child { border-bottom: none; padding-bottom: 0; }
  .rs-row:first-child { padding-top: 0; }

  .rs-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  /* ── Dot stanu ── */
  .rs-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    background: rgba(255,255,255,0.15);
    transition: background 0.4s ease, box-shadow 0.4s ease;
  }
  .rs-dot.open {
    background: #85B7EB;
    box-shadow: 0 0 6px #85B7EB;
    animation: rs-pulse 2.5s ease-in-out infinite;
  }

  @keyframes rs-pulse {
    0%, 100% { opacity: 0.7; box-shadow: 0 0 4px rgba(133,183,235,0.5); }
    50%       { opacity: 1;   box-shadow: 0 0 10px rgba(133,183,235,0.9); }
  }

  .rs-name {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.75);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Przyciski rolety ── */
  .rs-btns {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
  .rs-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
    border: 0.5px solid rgba(255,255,255,0.10);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.15s ease, background 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .rs-btn:active { transform: scale(0.92); background: rgba(255,255,255,0.12); }
  .rs-btn svg { width: 13px; height: 13px; fill: rgba(255,255,255,0.55); }
`;

const RS_SVG_UP = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>`;
const RS_SVG_DOWN = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>`;

class AhaRollershutterCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = null;
    this._hass = null;
    this._rendered = false;
  }

  setConfig(config) {
    if (!config.entities || !Array.isArray(config.entities) || config.entities.length === 0) {
      throw new Error('aha-rollershutter-card: "entities" jest wymagane i musi być listą.');
    }
    this._config = config;
    this._rendered = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._render();
    } else {
      this._updateDots();
    }
  }

  _render() {
    if (!this._config || !this._hass) return;
    const config = this._config;
    const hasGroup = !!(config.group_open_service && config.group_open_entity && config.group_close_service && config.group_close_entity);

    const styleEl = document.createElement('style');
    styleEl.textContent = RS_STYLES;

    const card = document.createElement('div');
    card.className = 'rs-card';

    // Header
    const header = document.createElement('div');
    header.className = 'rs-header';

    const title = document.createElement('div');
    title.className = 'rs-title';
    title.textContent = config.name || 'Rolety';
    header.appendChild(title);

    if (hasGroup) {
      const groupBtns = document.createElement('div');
      groupBtns.className = 'rs-group-btns';

      const btnUp = document.createElement('button');
      btnUp.className = 'rs-btn-group';
      btnUp.innerHTML = RS_SVG_UP;
      btnUp.title = 'Otwórz wszystkie';
      btnUp.addEventListener('click', (e) => { e.stopPropagation(); this._groupAction('open'); });

      const btnDown = document.createElement('button');
      btnDown.className = 'rs-btn-group';
      btnDown.innerHTML = RS_SVG_DOWN;
      btnDown.title = 'Zamknij wszystkie';
      btnDown.addEventListener('click', (e) => { e.stopPropagation(); this._groupAction('close'); });

      groupBtns.appendChild(btnUp);
      groupBtns.appendChild(btnDown);
      header.appendChild(groupBtns);
    }
    card.appendChild(header);

    const divider = document.createElement('div');
    divider.className = 'rs-divider';
    card.appendChild(divider);

    // Entity rows
    const rowsContainer = document.createElement('div');
    rowsContainer.className = 'rs-rows';

    config.entities.forEach((e, idx) => {
      const row = document.createElement('div');
      row.className = 'rs-row';
      row.dataset.idx = idx;

      const left = document.createElement('div');
      left.className = 'rs-left';

      const dot = document.createElement('div');
      dot.className = 'rs-dot';
      const isOpen = this._isOpen(e.boolean);
      if (isOpen) dot.classList.add('open');

      const name = document.createElement('div');
      name.className = 'rs-name';
      name.textContent = e.name || e.entity;

      left.appendChild(dot);
      left.appendChild(name);

      const btns = document.createElement('div');
      btns.className = 'rs-btns';

      const btnUp = document.createElement('button');
      btnUp.className = 'rs-btn';
      btnUp.innerHTML = RS_SVG_UP;
      btnUp.title = 'Otwórz';
      btnUp.addEventListener('click', (ev) => { ev.stopPropagation(); this._singleAction(e.entity, e.boolean, 'open'); });

      const btnDown = document.createElement('button');
      btnDown.className = 'rs-btn';
      btnDown.innerHTML = RS_SVG_DOWN;
      btnDown.title = 'Zamknij';
      btnDown.addEventListener('click', (ev) => { ev.stopPropagation(); this._singleAction(e.entity, e.boolean, 'close'); });

      btns.appendChild(btnUp);
      btns.appendChild(btnDown);

      row.appendChild(left);
      row.appendChild(btns);
      rowsContainer.appendChild(row);
    });

    card.appendChild(rowsContainer);

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(styleEl);
    this.shadowRoot.appendChild(card);

    this._rendered = true;
  }

  _isOpen(booleanId) {
    if (!booleanId || !this._hass) return false;
    const state = this._hass.states[booleanId];
    return state ? state.state === 'on' : false;
  }

  _updateDots() {
    if (!this._config || !this._hass) return;
    const rows = this.shadowRoot.querySelectorAll('.rs-row');
    this._config.entities.forEach((e, idx) => {
      const row = rows[idx];
      if (!row) return;
      const dot = row.querySelector('.rs-dot');
      if (!dot) return;
      const isOpen = this._isOpen(e.boolean);
      if (isOpen) {
        dot.classList.add('open');
      } else {
        dot.classList.remove('open');
      }
    });
  }

  _singleAction(entityId, booleanId, direction) {
    if (!this._hass) return;
    if (direction === 'open') {
      this._hass.callService('cover', 'open_cover', { entity_id: entityId });
      if (booleanId) this._hass.callService('input_boolean', 'turn_on', { entity_id: booleanId });
    } else {
      this._hass.callService('cover', 'close_cover', { entity_id: entityId });
      if (booleanId) this._hass.callService('input_boolean', 'turn_off', { entity_id: booleanId });
    }
  }

  _groupAction(direction) {
    if (!this._hass || !this._config) return;
    const cfg = this._config;
    if (direction === 'open') {
      const [domain, service] = cfg.group_open_service.split('.');
      this._hass.callService(domain, service, { entity_id: cfg.group_open_entity });
      cfg.entities.forEach(e => {
        if (e.boolean) this._hass.callService('input_boolean', 'turn_on', { entity_id: e.boolean });
      });
    } else {
      const [domain, service] = cfg.group_close_service.split('.');
      this._hass.callService(domain, service, { entity_id: cfg.group_close_entity });
      cfg.entities.forEach(e => {
        if (e.boolean) this._hass.callService('input_boolean', 'turn_off', { entity_id: e.boolean });
      });
    }
  }

  getCardSize() {
    const count = this._config && this._config.entities ? this._config.entities.length : 1;
    return Math.ceil(count / 2) + 1;
  }

  static getConfigElement() {
    return document.createElement('div');
  }

  static getStubConfig() {
    return {
      name: 'Rolety',
      entities: [
        { entity: 'cover.rollershutter_0001', boolean: 'input_boolean.roleta_0001', name: 'S1' }
      ]
    };
  }
}

customElements.define('aha-rollershutter-card', AhaRollershutterCard);

// Legacy alias (without prefix) — not applicable for this card type, but register anyway
if (!customElements.get('rollershutter-card')) {
  customElements.define('rollershutter-card', class extends AhaRollershutterCard {});
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'aha-rollershutter-card',
  name: 'AHA Rollershutter Card',
  description: 'Karta sterowania roletami z wirtualnym stanem (input_boolean)',
  preview: false,
});
