/**
 * aha-rollershutter-card.js
 *
 * Karta sterowania roletami — styl pergola-card.
 * Obsługuje sekcje (sections) z separatorami, badge X/Y, iconbox, group seg.
 *
 * Config:
 *   type: custom:aha-rollershutter-card
 *   name: Rolety
 *   sections:
 *     - name: Salon
 *       entities:
 *         - entity: cover.rollershutter_0001
 *           boolean: input_boolean.roleta_0001
 *           name: S1
 *       group_open_service: scene.turn_on
 *       group_open_entity: scene.otworz_rolety
 *       group_close_service: scene.turn_on
 *       group_close_entity: scene.zamknij_rolety
 *     - name: Garaż
 *       entities: [...]
 */

/* ── SVG ikony rolet ───────────────────────────────────────────────────────── */

function rsIconClosed() {
  const s = 'rgba(160,165,175,0.70)';
  const f = 'rgba(160,165,175,0.22)';
  const r = 'rgba(160,165,175,0.55)';
  return `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
    <rect x="3" y="3" width="22" height="22" rx="2.5" fill="none" stroke="${s}" stroke-width="1.3"/>
    <rect x="3" y="3" width="22" height="4" rx="1.8" fill="${r}"/>
    <rect x="3.5" y="8.5"  width="21" height="3.2" rx="0.8" fill="${f}" stroke="${s}" stroke-width="0.8"/>
    <rect x="3.5" y="12.8" width="21" height="3.2" rx="0.8" fill="${f}" stroke="${s}" stroke-width="0.8"/>
    <rect x="3.5" y="17.1" width="21" height="3.2" rx="0.8" fill="${f}" stroke="${s}" stroke-width="0.8"/>
    <rect x="3.5" y="21.4" width="21" height="2.5" rx="0.8" fill="${f}" stroke="${s}" stroke-width="0.8"/>
  </svg>`;
}

function rsIconOpen() {
  const c  = '#85B7EB';
  const cm = 'rgba(133,183,235,0.55)';
  const cb = 'rgba(133,183,235,0.13)';
  return `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
    <rect x="3" y="3" width="22" height="22" rx="2.5" fill="none" stroke="${c}" stroke-width="1.3"/>
    <rect x="3" y="3" width="22" height="6" rx="2" fill="${c}"/>
    <line x1="4.5" y1="5.5"  x2="23.5" y2="5.5"  stroke="rgba(255,255,255,0.40)" stroke-width="0.9"/>
    <line x1="4.5" y1="7.8"  x2="23.5" y2="7.8"  stroke="rgba(255,255,255,0.22)" stroke-width="0.7"/>
    <rect x="3.5" y="10.5" width="21" height="14" rx="1.2" fill="${cb}"/>
    <line x1="5" y1="14.5" x2="23" y2="14.5" stroke="${cm}" stroke-width="0.9"/>
    <line x1="5" y1="19"   x2="23" y2="19"   stroke="rgba(133,183,235,0.28)" stroke-width="0.9"/>
  </svg>`;
}

/* ── Chevron SVG ────────────────────────────────────────────────────────────── */
const SVG_UP   = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>`;
const SVG_DOWN = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>`;

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const RS_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :host { display: block; }

  .rs-card {
    background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
    border-radius: 16px;
    border: 0.5px solid rgba(255,255,255,0.08);
    padding: 14px 16px 12px;
    font-family: -apple-system, system-ui, sans-serif;
    color: rgba(255,255,255,0.85);
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  /* ── Header ── */
  .rs-hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .rs-title {
    font-size: 15px;
    font-weight: 700;
    color: rgba(255,255,255,0.92);
    letter-spacing: -0.2px;
  }
  .rs-badge {
    font-size: 11px;
    color: #636366;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.3s;
  }
  .rs-badge.active { color: rgba(255,255,255,0.55); }
  .rs-badge-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: rgba(142,142,147,0.35);
    transition: background 0.3s, box-shadow 0.3s;
    flex-shrink: 0;
  }
  .rs-badge-dot.active {
    background: #30d158;
    box-shadow: 0 0 8px #30d158;
  }

  /* ── Section separator ── */
  .rs-sect-sep {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0 6px;
  }
  .rs-sect-sep::before, .rs-sect-sep::after {
    content: '';
    flex: 1;
    height: 0.5px;
    background: rgba(255,255,255,0.07);
  }
  .rs-sect-sep span {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.20);
    white-space: nowrap;
  }

  /* ── Section group box ── */
  .rs-group-box {
    border-radius: 13px;
    border: 0.5px solid rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.022);
    padding: 0 12px;
    margin-bottom: 4px;
  }

  /* ── Row ── */
  .rs-row {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 10px 0;
  }
  .rs-row + .rs-row { border-top: 0.5px solid rgba(255,255,255,0.07); }

  /* ── Iconbox ── */
  .rs-iconbox {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(142,142,147,0.07);
    border: 0.5px solid rgba(142,142,147,0.15);
    transition: background 0.35s, border-color 0.35s, box-shadow 0.45s;
  }
  .rs-iconbox.open {
    background: rgba(133,183,235,0.10);
    border-color: rgba(133,183,235,0.22);
    animation: rs-pulse 2.5s ease-in-out infinite;
  }

  @keyframes rs-pulse {
    0%, 100% { box-shadow: 0 0 0 0px rgba(133,183,235,0); }
    50%       { box-shadow: 0 0 0 5px rgba(133,183,235,0.18); }
  }

  /* ── Name + status ── */
  .rs-mid { flex: 1; min-width: 0; }
  .rs-name {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.90);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rs-status {
    font-size: 11px;
    color: #636366;
    margin-top: 1px;
  }
  .rs-status.open { color: rgba(133,183,235,0.75); }

  /* ── Up/Down buttons ── */
  .rs-btns {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
  .rs-btn {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.14);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255,255,255,0.60);
    transition: transform 0.1s, background 0.15s, color 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .rs-btn:active { transform: scale(0.90); background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.90); }

  /* ── Group row (dół sekcji) ── */
  .rs-group-row {
    border-top: 0.5px solid rgba(255,255,255,0.07);
    padding: 10px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .rs-group-label {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.25);
  }
  .rs-seg {
    display: flex;
    gap: 3px;
    background: rgba(255,255,255,0.04);
    border: 0.5px solid rgba(255,255,255,0.07);
    border-radius: 11px;
    padding: 3px;
  }
  .rs-seg-btn {
    min-width: 44px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    border: none;
    background: none;
    border-radius: 8px;
    font-family: inherit;
    font-size: 11px;
    font-weight: 700;
    color: rgba(255,255,255,0.40);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.15s, color 0.15s, transform 0.1s;
  }
  .rs-seg-btn:active { transform: scale(0.90); background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.80); }
`;

/* ── Card class ─────────────────────────────────────────────────────────────── */
class AhaRollershutterCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config  = null;
    this._hass    = null;
    this._rendered = false;
  }

  setConfig(config) {
    if (!config.sections || !Array.isArray(config.sections) || config.sections.length === 0) {
      throw new Error('aha-rollershutter-card: wymagane pole "sections" (lista sekcji).');
    }
    this._config  = config;
    this._rendered = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._render();
    } else {
      this._updateStates();
    }
  }

  _allEntities() {
    return (this._config.sections || []).flatMap(s => s.entities || []);
  }

  _isOpen(booleanId) {
    if (!booleanId || !this._hass) return false;
    return this._hass.states[booleanId]?.state === 'on';
  }

  _openCount() {
    return this._allEntities().filter(e => this._isOpen(e.boolean)).length;
  }

  _render() {
    if (!this._config || !this._hass) return;

    const styleEl = document.createElement('style');
    styleEl.textContent = RS_STYLES;

    const card = document.createElement('div');
    card.className = 'rs-card';

    /* ── Header ── */
    const hdr = document.createElement('div');
    hdr.className = 'rs-hdr';

    const title = document.createElement('div');
    title.className = 'rs-title';
    title.textContent = this._config.name || 'Rolety';

    const badge = document.createElement('div');
    badge.className = 'rs-badge';
    badge.id = 'rs-badge';

    const dot = document.createElement('div');
    dot.className = 'rs-badge-dot';
    dot.id = 'rs-badge-dot';

    const badgeTxt = document.createElement('span');
    badgeTxt.id = 'rs-badge-txt';

    badge.appendChild(dot);
    badge.appendChild(badgeTxt);
    hdr.appendChild(title);
    hdr.appendChild(badge);
    card.appendChild(hdr);

    /* ── Sections ── */
    const total = this._allEntities().length;

    this._config.sections.forEach((section, sIdx) => {
      /* Section separator */
      const sep = document.createElement('div');
      sep.className = 'rs-sect-sep';
      sep.innerHTML = `<span>${section.name || ''}</span>`;
      card.appendChild(sep);

      /* Group box */
      const box = document.createElement('div');
      box.className = 'rs-group-box';
      box.dataset.section = sIdx;

      /* Entity rows */
      (section.entities || []).forEach((e, eIdx) => {
        const row = document.createElement('div');
        row.className = 'rs-row';
        row.dataset.sIdx = sIdx;
        row.dataset.eIdx = eIdx;

        /* Iconbox */
        const iconbox = document.createElement('div');
        iconbox.className = 'rs-iconbox';
        const isOpen = this._isOpen(e.boolean);
        iconbox.innerHTML = isOpen ? rsIconOpen() : rsIconClosed();
        if (isOpen) iconbox.classList.add('open');

        /* Mid */
        const mid = document.createElement('div');
        mid.className = 'rs-mid';

        const name = document.createElement('div');
        name.className = 'rs-name';
        name.textContent = e.name || e.entity;

        const status = document.createElement('div');
        status.className = 'rs-status' + (isOpen ? ' open' : '');
        status.textContent = isOpen ? 'otwarta' : 'zamknięta';

        mid.appendChild(name);
        mid.appendChild(status);

        /* Buttons */
        const btns = document.createElement('div');
        btns.className = 'rs-btns';

        const btnUp = document.createElement('button');
        btnUp.className = 'rs-btn';
        btnUp.innerHTML = SVG_UP;
        btnUp.title = 'Otwórz';
        btnUp.addEventListener('click', ev => { ev.stopPropagation(); this._singleAction(e.entity, e.boolean, 'open'); });

        const btnDown = document.createElement('button');
        btnDown.className = 'rs-btn';
        btnDown.innerHTML = SVG_DOWN;
        btnDown.title = 'Zamknij';
        btnDown.addEventListener('click', ev => { ev.stopPropagation(); this._singleAction(e.entity, e.boolean, 'close'); });

        btns.appendChild(btnUp);
        btns.appendChild(btnDown);

        row.appendChild(iconbox);
        row.appendChild(mid);
        row.appendChild(btns);
        box.appendChild(row);
      });

      /* Group row (jeśli sekcja ma group service) */
      const hasGroup = !!(section.group_open_service && section.group_open_entity &&
                          section.group_close_service && section.group_close_entity);
      if (hasGroup) {
        const groupRow = document.createElement('div');
        groupRow.className = 'rs-group-row';

        const label = document.createElement('div');
        label.className = 'rs-group-label';
        label.textContent = 'Wszystkie';

        const seg = document.createElement('div');
        seg.className = 'rs-seg';

        const segUp = document.createElement('button');
        segUp.className = 'rs-seg-btn';
        segUp.innerHTML = SVG_UP + 'Otwórz';
        segUp.addEventListener('click', ev => { ev.stopPropagation(); this._groupAction(section, 'open'); });

        const segDown = document.createElement('button');
        segDown.className = 'rs-seg-btn';
        segDown.innerHTML = SVG_DOWN + 'Zamknij';
        segDown.addEventListener('click', ev => { ev.stopPropagation(); this._groupAction(section, 'close'); });

        seg.appendChild(segUp);
        seg.appendChild(segDown);
        groupRow.appendChild(label);
        groupRow.appendChild(seg);
        box.appendChild(groupRow);
      }

      card.appendChild(box);
    });

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(styleEl);
    this.shadowRoot.appendChild(card);

    this._rendered = true;
    this._updateBadge();
  }

  _updateBadge() {
    const r = this.shadowRoot;
    if (!r) return;
    const total  = this._allEntities().length;
    const open   = this._openCount();
    const active = open > 0;

    const dot = r.getElementById('rs-badge-dot');
    const txt = r.getElementById('rs-badge-txt');
    const badge = r.getElementById('rs-badge');
    if (dot)  { dot.classList.toggle('active', active); }
    if (txt)  { txt.textContent = `${open}/${total} otwarte`; }
    if (badge) { badge.classList.toggle('active', active); }
  }

  _updateStates() {
    if (!this._config || !this._hass) return;
    const r = this.shadowRoot;
    if (!r) return;

    this._config.sections.forEach((section, sIdx) => {
      (section.entities || []).forEach((e, eIdx) => {
        const row = r.querySelector(`.rs-row[data-s-idx="${sIdx}"][data-e-idx="${eIdx}"]`);
        if (!row) return;
        const iconbox = row.querySelector('.rs-iconbox');
        const status  = row.querySelector('.rs-status');
        if (!iconbox || !status) return;
        const isOpen  = this._isOpen(e.boolean);
        const wasOpen = iconbox.classList.contains('open');
        if (isOpen !== wasOpen) {
          iconbox.innerHTML = isOpen ? rsIconOpen() : rsIconClosed();
          iconbox.classList.toggle('open', isOpen);
          status.textContent = isOpen ? 'otwarta' : 'zamknięta';
          status.className = 'rs-status' + (isOpen ? ' open' : '');
        }
      });
    });

    this._updateBadge();
  }

  _singleAction(entityId, booleanId, dir) {
    if (!this._hass) return;
    if (dir === 'open') {
      this._hass.callService('cover', 'open_cover', { entity_id: entityId });
      if (booleanId) this._hass.callService('input_boolean', 'turn_on', { entity_id: booleanId });
    } else {
      this._hass.callService('cover', 'close_cover', { entity_id: entityId });
      if (booleanId) this._hass.callService('input_boolean', 'turn_off', { entity_id: booleanId });
    }
  }

  _groupAction(section, dir) {
    if (!this._hass) return;
    if (dir === 'open') {
      const [domain, svc] = section.group_open_service.split('.');
      this._hass.callService(domain, svc, { entity_id: section.group_open_entity });
      (section.entities || []).forEach(e => {
        if (e.boolean) this._hass.callService('input_boolean', 'turn_on', { entity_id: e.boolean });
      });
    } else {
      const [domain, svc] = section.group_close_service.split('.');
      this._hass.callService(domain, svc, { entity_id: section.group_close_entity });
      (section.entities || []).forEach(e => {
        if (e.boolean) this._hass.callService('input_boolean', 'turn_off', { entity_id: e.boolean });
      });
    }
  }

  getCardSize() {
    const count = this._allEntities().length;
    return Math.ceil(count / 2) + 2;
  }

  static getStubConfig() {
    return {
      name: 'Rolety',
      sections: [{
        name: 'Salon',
        entities: [{ entity: 'cover.rollershutter_0001', boolean: 'input_boolean.roleta_0001', name: 'S1' }]
      }]
    };
  }
}

customElements.define('aha-rollershutter-card', AhaRollershutterCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'aha-rollershutter-card',
  name: 'AHA Rollershutter Card',
  description: 'Karta sterowania roletami z sekcjami, badge X/Y i group seg',
  preview: false,
});
