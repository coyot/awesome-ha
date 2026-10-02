/**
 * aha-rollershutter-card.js
 *
 * Karta sterowania roletami — styl pergola-card.
 * Obsługuje sekcje (sections) z separatorami, badge X/Y, iconbox, group seg.
 * Sekcje można zwijać/rozwijać klikając w nagłówek sekcji.
 *
 * Config:
 *   type: custom:aha-rollershutter-card
 *   name: Rolety
 *   sections:
 *     - name: Salon
 *       collapsed: true          # optional — domyślnie rozwinięte
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
const SVG_CHEVRON_DOWN = `<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>`;
const SVG_CHEVRON_RIGHT = `<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>`;

/* ── SVG miniaturki rolet (dla nagłówka sekcji) ─────────────────────────────── */
function sectionIconClosed(n = 3) {
  // Małe ikonki symbolizujące zamknięte rolety (szare lamele)
  const s = 'rgba(140,145,155,0.55)';
  const f = 'rgba(140,145,155,0.18)';
  const icons = [];
  for (let i = 0; i < n; i++) {
    const x = 3 + i * 9;
    icons.push(`<rect x="${x}" y="4" width="6" height="16" rx="1" fill="${f}" stroke="${s}" stroke-width="0.8"/>`);
    icons.push(`<rect x="${x}" y="4" width="6" height="2.5" rx="0.7" fill="${s}"/>`);
  }
  return `<svg viewBox="0 0 ${3 + n*9 + 3} 24" xmlns="http://www.w3.org/2000/svg" height="16">${icons.join('')}</svg>`;
}

function sectionIconOpen(n = 3) {
  const c = '#85B7EB';
  const cb = 'rgba(133,183,235,0.13)';
  const icons = [];
  for (let i = 0; i < n; i++) {
    const x = 3 + i * 9;
    icons.push(`<rect x="${x}" y="4" width="6" height="16" rx="1" fill="${cb}" stroke="${c}" stroke-width="0.8"/>`);
    icons.push(`<rect x="${x}" y="4" width="6" height="4" rx="1" fill="${c}"/>`);
  }
  return `<svg viewBox="0 0 ${3 + n*9 + 3} 24" xmlns="http://www.w3.org/2000/svg" height="16">${icons.join('')}</svg>`;
}

/* ── Ikona grupowa do iconboxa sekcji (28×28 viewBox) ──────────────────────── */
function rsGroupIconSvg(states) {
  const n = Math.min(states.length, 3);
  const shown = states.slice(0, n);
  const w = 7, gap = 2.5;
  const totalW = n * w + (n - 1) * gap;
  const startX = (28 - totalW) / 2;
  const icons = [];
  for (let i = 0; i < n; i++) {
    const x = startX + i * (w + gap);
    if (shown[i]) {
      icons.push(`<rect x="${x}" y="4" width="${w}" height="20" rx="1.2" fill="rgba(133,183,235,0.13)" stroke="#85B7EB" stroke-width="0.9"/>`);
      icons.push(`<rect x="${x}" y="4" width="${w}" height="5" rx="1.2" fill="#85B7EB"/>`);
    } else {
      icons.push(`<rect x="${x}" y="4" width="${w}" height="20" rx="1.2" fill="rgba(160,165,175,0.15)" stroke="rgba(160,165,175,0.65)" stroke-width="0.9"/>`);
      icons.push(`<rect x="${x}" y="3.5" width="${w}" height="3" rx="0.8" fill="rgba(160,165,175,0.55)"/>`);
      icons.push(`<rect x="${x+0.5}" y="9"  width="${w-1}" height="2.2" rx="0.5" fill="rgba(160,165,175,0.22)" stroke="rgba(160,165,175,0.40)" stroke-width="0.5"/>`);
      icons.push(`<rect x="${x+0.5}" y="13" width="${w-1}" height="2.2" rx="0.5" fill="rgba(160,165,175,0.22)" stroke="rgba(160,165,175,0.40)" stroke-width="0.5"/>`);
      icons.push(`<rect x="${x+0.5}" y="17" width="${w-1}" height="2.2" rx="0.5" fill="rgba(160,165,175,0.22)" stroke="rgba(160,165,175,0.40)" stroke-width="0.5"/>`);
    }
  }
  return `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" width="28" height="28">${icons.join('')}</svg>`;
}

/* ── Miniaturki mieszane (część otwarta, część zamknięta) ──────────────────── */
function sectionIconMixed(states) {
  const n = states.length;
  const icons = [];
  for (let i = 0; i < n; i++) {
    const x = 3 + i * 9;
    if (states[i]) {
      icons.push(`<rect x="${x}" y="4" width="6" height="16" rx="1" fill="rgba(133,183,235,0.13)" stroke="#85B7EB" stroke-width="0.8"/>`);
      icons.push(`<rect x="${x}" y="4" width="6" height="4" rx="1" fill="#85B7EB"/>`);
    } else {
      icons.push(`<rect x="${x}" y="4" width="6" height="16" rx="1" fill="rgba(140,145,155,0.18)" stroke="rgba(140,145,155,0.55)" stroke-width="0.8"/>`);
      icons.push(`<rect x="${x}" y="4" width="6" height="2.5" rx="0.7" fill="rgba(140,145,155,0.55)"/>`);
    }
  }
  return `<svg viewBox="0 0 ${3 + n*9 + 3} 24" xmlns="http://www.w3.org/2000/svg" height="16">${icons.join('')}</svg>`;
}

/* ── Helper: ikona sekcji zależna od stanów ─────────────────────────────────── */
function sectionStateIcon(states) {
  const hasOpen = states.some(s => s);
  if (hasOpen) return sectionIconMixed(states);
  return sectionIconClosed(Math.min(states.length, 3));
}

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

  /* ── Section header (clickable, collapsible) — row-style ── */
  .rs-sect-hdr {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 10px 12px;
    margin-top: 8px;
    border-radius: 13px;
    background: linear-gradient(135deg, rgba(255,255,255,0.058) 0%, rgba(255,255,255,0.016) 100%);
    border: 0.5px solid rgba(255,255,255,0.10);
    border-left: 2.5px solid rgba(160,165,175,0.28);
    cursor: pointer;
    transition: background 0.35s, border-color 0.35s;
    -webkit-tap-highlight-color: transparent;
  }
  .rs-sect-hdr:active { background: linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%); }
  .rs-sect-hdr.sect-has-open {
    background: linear-gradient(135deg, rgba(133,183,235,0.10) 0%, rgba(133,183,235,0.022) 100%);
    border-color: rgba(133,183,235,0.18);
    border-left-color: rgba(133,183,235,0.55);
  }
  .rs-sect-hdr.sect-all-open {
    background: linear-gradient(135deg, rgba(48,209,88,0.08) 0%, rgba(48,209,88,0.016) 100%);
    border-color: rgba(48,209,88,0.15);
    border-left-color: rgba(48,209,88,0.55);
  }

  /* Iconbox sekcji */
  .rs-sect-iconbox {
    width: 42px; height: 42px;
    border-radius: 12px;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(142,142,147,0.07);
    border: 0.5px solid rgba(142,142,147,0.15);
    transition: background 0.35s, border-color 0.35s, box-shadow 0.45s;
  }
  .rs-sect-iconbox.open {
    background: rgba(133,183,235,0.10);
    border-color: rgba(133,183,235,0.22);
    animation: rs-pulse 2.5s ease-in-out infinite;
  }

  /* Mid: name + state */
  .rs-sect-mid { flex: 1; min-width: 0; }
  .rs-sect-name {
    font-size: 14px; font-weight: 700;
    color: rgba(255,255,255,0.88);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .rs-sect-state-txt {
    font-size: 11px;
    color: #636366;
    margin-top: 2px;
    transition: color 0.25s;
    white-space: nowrap;
  }
  .rs-sect-hdr.sect-has-open .rs-sect-state-txt { color: rgba(133,183,235,0.75); }
  .rs-sect-hdr.sect-all-open .rs-sect-state-txt { color: rgba(48,209,88,0.80); }

  /* Chevron */
  .rs-sect-chevron {
    color: rgba(255,255,255,0.18);
    flex-shrink: 0;
    display: flex; align-items: center;
    transition: color 0.2s;
  }
  .rs-sect-hdr:active .rs-sect-chevron { color: rgba(255,255,255,0.45); }

  /* ── Section group buttons ── */
  .rs-sect-grp-btns { display: flex; gap: 6px; }
  .rs-sect-grp-btn {
    width: 38px; height: 38px;
    border-radius: 11px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: rgba(255,255,255,0.55);
    font-family: inherit;
    transition: transform 0.1s, background 0.15s, color 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .rs-sect-grp-btn:active { transform: scale(0.88); background: rgba(133,183,235,0.18); color: rgba(133,183,235,0.90); border-color: rgba(133,183,235,0.35); }
  .rs-sect-grp-btn[hidden] { display: none; }

  /* ── Collapsible body ── */
  .rs-sect-body {
    overflow: hidden;
    transition: max-height 0.32s ease, opacity 0.25s ease;
    max-height: 800px;
    opacity: 1;
  }
  .rs-sect-body.collapsed {
    max-height: 0;
    opacity: 0;
    pointer-events: none;
  }

  /* ── Group box ── */
  .rs-group-box {
    border-radius: 13px;
    border: 0.5px solid rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.022);
    padding: 0 12px;
    margin-bottom: 4px;
    margin-left: 14px;
    transition: border-color 0.35s;
  }
  .rs-group-box.sect-has-open {
    border-color: rgba(133,183,235,0.13);
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

  /* ── Group row (dół sekcji, fallback gdy brak nagłówkowych buttonów) ── */
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
    gap: 8px;
  }
  .rs-seg-btn {
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
    font-family: inherit;
    transition: transform 0.1s, background 0.15s, color 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .rs-seg-btn:active { transform: scale(0.90); background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.90); }
`;

/* ── Card class ─────────────────────────────────────────────────────────────── */
class AhaRollershutterCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config   = null;
    this._hass     = null;
    this._rendered = false;
    this._collapsed = {};  // persists across re-renders
  }

  setConfig(config) {
    if (!config.sections || !Array.isArray(config.sections) || config.sections.length === 0) {
      throw new Error('aha-rollershutter-card: wymagane pole "sections" (lista sekcji).');
    }
    this._config   = config;
    this._rendered = false;
    // Seed collapsed state from config (only on first load)
    config.sections.forEach((s, i) => {
      if (!(i in this._collapsed)) {
        this._collapsed[i] = !!s.collapsed;
      }
    });
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

  _sectionOpenCount(section) {
    return (section.entities || []).filter(e => this._isOpen(e.boolean)).length;
  }

  _sectionStateClasses(section) {
    const total = (section.entities || []).length;
    const open  = this._sectionOpenCount(section);
    if (open === 0)     return '';
    if (open === total) return 'sect-has-open sect-all-open';
    return 'sect-has-open';
  }

  _sectionAllOpen(section)  { return (section.entities || []).length > 0 && (section.entities || []).every(e => this._isOpen(e.boolean)); }
  _sectionAllClosed(section){ return (section.entities || []).every(e => !this._isOpen(e.boolean)); }

  _sectionStateText(section) {
    const total = (section.entities || []).length;
    const open  = this._sectionOpenCount(section);
    if (open === 0)     return `zamknięte (${total})`;
    if (open === total) return `wszystkie otwarte (${total})`;
    return `${open}/${total} otwarte`;
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
    this._config.sections.forEach((section, sIdx) => {
      const hasGroup = !!(section.group_open_service && section.group_open_entity &&
                          section.group_close_service && section.group_close_entity);
      const collapsed   = !!this._collapsed[sIdx];
      const stateClasses = this._sectionStateClasses(section);
      const stateText    = this._sectionStateText(section);
      const entCount     = (section.entities || []).length;
      const sectStates   = (section.entities || []).map(e => this._isOpen(e.boolean));

      /* ── Section header (row-style, clickable) ── */
      const sectHdr = document.createElement('div');
      sectHdr.className = `rs-sect-hdr ${stateClasses}`;
      sectHdr.dataset.sIdx = sIdx;

      /* Iconbox */
      const sectIconbox = document.createElement('div');
      sectIconbox.className = 'rs-sect-iconbox' + (stateClasses.includes('sect-has-open') ? ' open' : '');
      sectIconbox.innerHTML = rsGroupIconSvg(sectStates);

      /* Mid: name + state */
      const sectMid = document.createElement('div');
      sectMid.className = 'rs-sect-mid';

      const sectName = document.createElement('div');
      sectName.className = 'rs-sect-name';
      sectName.textContent = section.name || '';

      const sectStateTxt = document.createElement('div');
      sectStateTxt.className = 'rs-sect-state-txt';
      sectStateTxt.textContent = stateText;

      sectMid.appendChild(sectName);
      sectMid.appendChild(sectStateTxt);

      /* Chevron */
      const chevron = document.createElement('span');
      chevron.className = 'rs-sect-chevron';
      chevron.innerHTML = collapsed ? SVG_CHEVRON_RIGHT : SVG_CHEVRON_DOWN;

      sectHdr.appendChild(sectIconbox);
      sectHdr.appendChild(sectMid);
      sectHdr.appendChild(chevron);

      /* Group buttons (jeśli sekcja ma group service) */
      if (hasGroup) {
        const grpBtns = document.createElement('div');
        grpBtns.className = 'rs-sect-grp-btns';
        grpBtns.dataset.sIdx = sIdx;

        const btnOpen = document.createElement('button');
        btnOpen.className = 'rs-sect-grp-btn';
        btnOpen.dataset.grp = 'open';
        btnOpen.innerHTML = SVG_UP;
        btnOpen.title = 'Otwórz wszystkie';
        btnOpen.hidden = this._sectionAllOpen(section);
        btnOpen.addEventListener('click', ev => { ev.stopPropagation(); this._groupAction(section, 'open'); });

        const btnClose = document.createElement('button');
        btnClose.className = 'rs-sect-grp-btn';
        btnClose.dataset.grp = 'close';
        btnClose.innerHTML = SVG_DOWN;
        btnClose.title = 'Zamknij wszystkie';
        btnClose.hidden = this._sectionAllClosed(section);
        btnClose.addEventListener('click', ev => { ev.stopPropagation(); this._groupAction(section, 'close'); });

        grpBtns.appendChild(btnOpen);
        grpBtns.appendChild(btnClose);
        sectHdr.appendChild(grpBtns);
      }

      /* Toggle on header click */
      sectHdr.addEventListener('click', () => this._toggleSection(sIdx));

      card.appendChild(sectHdr);

      /* ── Collapsible body ── */
      const body = document.createElement('div');
      body.className = 'rs-sect-body' + (collapsed ? ' collapsed' : '');
      body.dataset.sIdx = sIdx;

      /* Group box */
      const box = document.createElement('div');
      box.className = 'rs-group-box' + (stateClasses ? ` ${stateClasses}` : '');
      box.dataset.sIdx = sIdx;

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

      /* Group row na dole boxa (gdy brak nagłówkowych buttonów — fallback) */
      if (!hasGroup) {
        // Brak dodatkowego wiersza — obsługa grupowa tylko w nagłówku
      }

      body.appendChild(box);
      card.appendChild(body);
    });

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(styleEl);
    this.shadowRoot.appendChild(card);

    this._rendered = true;
    this._updateBadge();
  }

  _toggleSection(sIdx) {
    this._collapsed[sIdx] = !this._collapsed[sIdx];
    const r = this.shadowRoot;
    if (!r) return;

    const body    = r.querySelector(`.rs-sect-body[data-s-idx="${sIdx}"]`);
    const sectHdr = r.querySelector(`.rs-sect-hdr[data-s-idx="${sIdx}"]`);
    const chevron = sectHdr?.querySelector('.rs-sect-chevron');

    if (body) body.classList.toggle('collapsed', this._collapsed[sIdx]);
    if (chevron) chevron.innerHTML = this._collapsed[sIdx] ? SVG_CHEVRON_RIGHT : SVG_CHEVRON_DOWN;
  }

  _updateBadge() {
    const r = this.shadowRoot;
    if (!r) return;
    const total  = this._allEntities().length;
    const open   = this._openCount();
    const active = open > 0;

    const dot   = r.getElementById('rs-badge-dot');
    const txt   = r.getElementById('rs-badge-txt');
    const badge = r.getElementById('rs-badge');
    if (dot)   { dot.classList.toggle('active', active); }
    if (txt)   { txt.textContent = `${open}/${total} otwarte`; }
    if (badge) { badge.classList.toggle('active', active); }
  }

  _updateStates() {
    if (!this._config || !this._hass) return;
    const r = this.shadowRoot;
    if (!r) return;

    this._config.sections.forEach((section, sIdx) => {
      /* Update entity rows */
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

      /* Update section header state */
      const sectHdr = r.querySelector(`.rs-sect-hdr[data-s-idx="${sIdx}"]`);
      const box     = r.querySelector(`.rs-group-box[data-s-idx="${sIdx}"]`);
      if (sectHdr) {
        const stateClasses = this._sectionStateClasses(section);
        const states       = (section.entities || []).map(e => this._isOpen(e.boolean));
        sectHdr.classList.toggle('sect-has-open', stateClasses.includes('sect-has-open'));
        sectHdr.classList.toggle('sect-all-open',  stateClasses.includes('sect-all-open'));

        const sectIconbox = sectHdr.querySelector('.rs-sect-iconbox');
        if (sectIconbox) {
          const wasOpen = sectIconbox.classList.contains('open');
          const isOpen  = stateClasses.includes('sect-has-open');
          sectIconbox.innerHTML = rsGroupIconSvg(states);
          if (isOpen !== wasOpen) sectIconbox.classList.toggle('open', isOpen);
        }

        const stateTxt = sectHdr.querySelector('.rs-sect-state-txt');
        if (stateTxt) stateTxt.textContent = this._sectionStateText(section);

        const grpBtns = r.querySelector(`.rs-sect-grp-btns[data-s-idx="${sIdx}"]`);
        if (grpBtns) {
          const btnOpen  = grpBtns.querySelector('[data-grp="open"]');
          const btnClose = grpBtns.querySelector('[data-grp="close"]');
          if (btnOpen)  btnOpen.hidden  = this._sectionAllOpen(section);
          if (btnClose) btnClose.hidden = this._sectionAllClosed(section);
        }
      }
      if (box) {
        const stateClasses = this._sectionStateClasses(section);
        box.classList.toggle('sect-has-open', stateClasses.includes('sect-has-open'));
      }
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
        entities: [{ entity: 'cover.rollershutter_0001', boolean: 'input_boolean.roleta_0001', name: 'S1' }],
        group_open_service: 'scene.turn_on',
        group_open_entity: 'scene.otworz_rolety_salon',
        group_close_service: 'scene.turn_on',
        group_close_entity: 'scene.zamknij_rolety_salon',
      }]
    };
  }
}

customElements.define('aha-rollershutter-card', AhaRollershutterCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'aha-rollershutter-card',
  name: 'AHA Rollershutter Card',
  description: 'Karta sterowania roletami z sekcjami, badge X/Y, group seg i zwijaniem sekcji',
  preview: false,
});
