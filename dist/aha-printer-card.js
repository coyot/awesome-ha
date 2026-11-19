/**
 * aha-printer-card.js
 * Karta dla drukarki Brother (HL-L3240CDW i inne)
 *
 * Config:
 *   entity:  (required) sensor.* — główna encja statusu
 *   name:    (optional) override nazwy
 *
 * Encje pochodne (auto z base entity ID):
 *   sensor.{base}_{black,cyan,magenta,yellow}_toner
 *   sensor.{base}_{black,cyan,magenta,yellow}_drum_life
 *   sensor.{base}_{black,cyan,magenta,yellow}_drum_pages_left
 *   sensor.{base}_total_pages / _b_w_pages / _color_pages
 *   sensor.{base}_belt_unit_life / _fuser_life
 *   binary_sensor.{base}_{paper_jam,no_paper,door_open,low_toner,no_toner}
 */

const _PR_STYLES = `
  :host { display: block; width: 100%; height: 100%; }

  @keyframes pr-pulse-print {
    0%,100% { box-shadow: 0 0 0 0px rgba(10,132,255,0); }
    50%     { box-shadow: 0 0 0 5px rgba(10,132,255,0.18); }
  }
  @keyframes pr-pulse-error {
    0%,100% { box-shadow: 0 0 0 0px rgba(226,75,74,0); }
    50%     { box-shadow: 0 0 0 5px rgba(226,75,74,0.22); }
  }
  @keyframes pr-pulse-warn {
    0%,100% { box-shadow: 0 0 0 0px rgba(255,159,10,0); }
    50%     { box-shadow: 0 0 0 5px rgba(255,159,10,0.18); }
  }

  .card {
    width: 100%;
    border-radius: 20px;
    padding: 10px 10px 8px;
    display: flex; flex-direction: column;
    position: relative; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.06);
    box-sizing: border-box;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
    transition: transform 0.15s ease, border-color 0.4s ease, box-shadow 0.4s ease;
  }
  .card:active { transform: scale(0.97); }
  .card.printing { animation: pr-pulse-print 2.5s ease-in-out infinite; border-color: rgba(10,132,255,0.22); }
  .card.error    { animation: pr-pulse-error 2.0s ease-in-out infinite; border-color: rgba(226,75,74,0.28); }
  .card.warning  { animation: pr-pulse-warn  3.0s ease-in-out infinite; border-color: rgba(255,159,10,0.22); }

  .glow {
    position: absolute; inset: 0; pointer-events: none;
    border-radius: 19px; transition: background 0.4s ease;
  }

  /* Status label — top-center */
  .state-label {
    position: absolute; top: 10px; left: 0; right: 0; z-index: 5;
    text-align: center; pointer-events: none;
    font-size: 9px; font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase;
    opacity: 0; transition: opacity 0.4s ease, color 0.4s ease;
  }
  .card.printing .state-label { opacity: 1; color: rgba(10,132,255,0.95); }
  .card.error    .state-label { opacity: 1; color: rgba(226,75,74,0.95); }
  .card.warning  .state-label { opacity: 1; color: rgba(255,159,10,0.95); }

  /* Icon */
  .icon-area {
    flex: 1; min-height: 46px;
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 2; padding-top: 14px;
  }
  .icon-bg {
    width: 50px; height: 50px; border-radius: 15px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.4s ease, box-shadow 0.4s ease;
  }
  ha-icon { --mdc-icon-size: 28px; transition: color 0.4s ease; }

  /* ── Toner bars ─────────────────────────────────────────── */
  .toner-section {
    padding: 6px 2px 2px;
    display: flex; flex-direction: column; gap: 5px;
    position: relative; z-index: 2; flex-shrink: 0;
  }
  .toner-row {
    display: flex; align-items: center; gap: 6px;
    position: relative; overflow: visible; cursor: default;
  }
  .toner-label {
    width: 9px; font-size: 9px; font-weight: 700;
    text-align: center; flex-shrink: 0;
    transition: color 0.3s ease;
  }
  .toner-track {
    flex: 1; height: 4px; border-radius: 99px;
    background: rgba(255,255,255,0.08); overflow: hidden;
  }
  .toner-fill {
    height: 100%; border-radius: 99px;
    transition: width 0.6s ease, background 0.4s ease;
  }
  .toner-pct {
    width: 26px; font-size: 9px; font-weight: 600;
    text-align: right; flex-shrink: 0;
    transition: color 0.3s ease;
  }

  /* ── Alert chips ─────────────────────────────────────────── */
  .alerts {
    display: flex; flex-wrap: wrap; gap: 4px;
    padding: 3px 2px 2px;
    position: relative; z-index: 2; flex-shrink: 0;
  }
  .alert-chip {
    display: none; align-items: center; gap: 3px;
    border-radius: 6px; padding: 2px 7px;
    font-size: 10px; font-weight: 600;
  }
  .alert-chip.active { display: inline-flex; }
  .error-chip { background: rgba(226,75,74,0.15); color: rgba(226,75,74,0.92); }
  .warn-chip  { background: rgba(255,159,10,0.15); color: rgba(255,159,10,0.92); }

  /* ── Pages counter ───────────────────────────────────────── */
  .pages-row {
    text-align: center; font-size: 10px; font-weight: 500;
    color: rgba(255,255,255,0.32);
    padding: 3px 0 1px;
    position: relative; z-index: 2; flex-shrink: 0;
  }

  /* ── Name ────────────────────────────────────────────────── */
  .name {
    text-align: center; font-size: 12px; font-weight: 600;
    color: rgba(255,255,255,0.65);
    padding-bottom: 4px;
    position: relative; z-index: 2; flex-shrink: 0;
  }

  /* ── Tooltips ────────────────────────────────────────────── */
  .tip {
    position: absolute;
    white-space: nowrap;
    font-size: 9px; font-weight: 600;
    color: rgba(255,255,255,.88);
    background: rgba(10,18,32,.96);
    border: .5px solid rgba(255,255,255,.16);
    border-radius: 5px; padding: 3px 7px;
    pointer-events: none; opacity: 0;
    transition: opacity .15s; z-index: 30;
    bottom: calc(100% + 4px);
    left: 50%; transform: translateX(-50%);
  }
  .toner-row:hover .tip  { opacity: 1; }
  .pages-row:hover .tip  { opacity: 1; }
`;

const _PR_TONERS = [
  { key: 'black',   label: 'K', fillNormal: 'rgba(210,210,210,0.75)' },
  { key: 'cyan',    label: 'C', fillNormal: 'rgba(0,200,255,0.82)'   },
  { key: 'magenta', label: 'M', fillNormal: 'rgba(255,55,95,0.82)'   },
  { key: 'yellow',  label: 'Y', fillNormal: 'rgba(255,214,10,0.82)'  },
];

const _PR_LABEL_COLORS = {
  black:   { normal: 'rgba(180,180,185,0.70)' },
  cyan:    { normal: 'rgba(0,200,255,0.65)'   },
  magenta: { normal: 'rgba(255,55,95,0.65)'   },
  yellow:  { normal: 'rgba(255,214,10,0.65)'  },
};

function _prTonerStyle(pct) {
  if (pct <= 10) return { fill: 'rgba(226,75,74,0.90)', text: '#E24B4A' };
  if (pct <= 24) return { fill: 'rgba(255,159,10,0.88)', text: '#FF9F0A' };
  return null; // normal — use color-specific
}

class AhaPrinterCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) { this._build(); this._built = true; }
    this._update();
  }

  setConfig(config) {
    if (!config.entity) throw new Error('aha-printer-card: wymagane pole "entity"');
    this._config = config;
    const base = config.entity.replace(/^sensor\./, '');
    this._base = base;
  }

  _s(entityId) {
    const s = this._hass?.states[entityId];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return s;
  }
  _n(entityId) {
    const s = this._s(entityId);
    if (!s) return null;
    const v = parseFloat(s.state);
    return isNaN(v) ? null : v;
  }

  _build() {
    const shadow = this.shadowRoot;
    const style = document.createElement('style');
    style.textContent = _PR_STYLES;
    shadow.appendChild(style);

    this._card = document.createElement('div');
    this._card.className = 'card idle';

    const tonerRows = _PR_TONERS.map(t => `
      <div class="toner-row" data-key="${t.key}">
        <span class="toner-label">${t.label}</span>
        <div class="toner-track"><div class="toner-fill" style="width:0%"></div></div>
        <span class="toner-pct">—</span>
        <div class="tip"></div>
      </div>`).join('');

    this._card.innerHTML = `
      <div class="glow"></div>
      <div class="state-label">drukuje</div>
      <div class="icon-area">
        <div class="icon-bg">
          <ha-icon icon="mdi:printer"></ha-icon>
        </div>
      </div>
      <div class="toner-section">${tonerRows}</div>
      <div class="alerts">
        <span class="alert-chip error-chip" data-alert="paper_jam">⚠ Zacięcie</span>
        <span class="alert-chip error-chip" data-alert="no_paper">Brak papieru</span>
        <span class="alert-chip error-chip" data-alert="door_open">Otwarte drzwi</span>
        <span class="alert-chip error-chip" data-alert="no_toner">Brak tonera</span>
        <span class="alert-chip warn-chip"  data-alert="low_toner">Mało tonera</span>
      </div>
      <div class="pages-row">— stron<div class="tip"></div></div>
      <div class="name">—</div>
    `;

    this._card.addEventListener('click', () => {
      const e = new Event('hass-more-info', { bubbles: true, composed: true });
      e.detail = { entityId: this._config.entity };
      this.dispatchEvent(e);
    });

    shadow.appendChild(this._card);

    this._glowEl    = shadow.querySelector('.glow');
    this._stateEl   = shadow.querySelector('.state-label');
    this._iconBg    = shadow.querySelector('.icon-bg');
    this._haIcon    = shadow.querySelector('ha-icon');
    this._nameEl    = shadow.querySelector('.name');
    this._pagesRow  = shadow.querySelector('.pages-row');
    this._pagesTip  = shadow.querySelector('.pages-row .tip');

    this._tonerRows = {};
    _PR_TONERS.forEach(t => {
      const row = shadow.querySelector(`.toner-row[data-key="${t.key}"]`);
      this._tonerRows[t.key] = {
        label: row.querySelector('.toner-label'),
        fill:  row.querySelector('.toner-fill'),
        pct:   row.querySelector('.toner-pct'),
        tip:   row.querySelector('.tip'),
      };
    });

    this._alertChips = {};
    shadow.querySelectorAll('.alert-chip').forEach(el => {
      this._alertChips[el.dataset.alert] = el;
    });
  }

  _update() {
    if (!this._hass || !this._config) return;
    const b = this._base;

    // ── Status ──
    const statusState = this._s(`sensor.${b}`)?.state ?? 'unknown';
    const name = this._config.name || this._s(`sensor.${b}`)?.attributes?.friendly_name || b;

    const isError = ['error', 'stopped', 'offline'].includes(statusState) ||
      ['paper_jam', 'no_paper', 'door_open', 'no_toner'].some(a =>
        this._s(`binary_sensor.${b}_${a}`)?.state === 'on');
    const isWarn  = !isError && this._s(`binary_sensor.${b}_low_toner`)?.state === 'on';
    const isPrint = !isError && !isWarn && statusState === 'printing';

    const cardState = isError ? 'error' : isPrint ? 'printing' : isWarn ? 'warning' : 'idle';
    this._card.className = `card ${cardState}`;

    const stateLabels = {
      printing: 'drukuje',
      error:    'błąd',
      warning:  'uwaga',
    };
    this._stateEl.textContent = stateLabels[cardState] ?? '';

    // ── Icon + glow ──
    const iconMap = { printing: 'mdi:printer-check', error: 'mdi:printer-alert', warning: 'mdi:printer-alert' };
    const iconColors = {
      printing: { r:10,  g:132, b:255 },
      error:    { r:226, g:75,  b:74  },
      warning:  { r:255, g:159, b:10  },
      idle:     { r:142, g:142, b:147 },
    };
    const { r, g, b: bc } = iconColors[cardState];
    this._haIcon.setAttribute('icon', iconMap[cardState] ?? 'mdi:printer');
    this._haIcon.style.color = `rgb(${r},${g},${bc})`;
    this._iconBg.style.background = `rgba(${r},${g},${bc},${cardState === 'idle' ? 0.10 : 0.16})`;
    this._iconBg.style.boxShadow = cardState !== 'idle'
      ? `0 0 18px 4px rgba(${r},${g},${bc},0.20)` : 'none';
    this._glowEl.style.background = cardState !== 'idle'
      ? `radial-gradient(ellipse at 50% 60%, rgba(${r},${g},${bc},0.10) 0%, transparent 70%)`
      : 'none';

    // ── Toner bars ──
    _PR_TONERS.forEach(t => {
      const pct = this._n(`sensor.${b}_${t.key}_toner`);
      const els = this._tonerRows[t.key];
      if (pct === null) {
        els.fill.style.width = '0%';
        els.pct.textContent  = '—';
        return;
      }
      const override = _prTonerStyle(pct);
      const fillColor  = override?.fill  ?? t.fillNormal;
      const textColor  = override?.text  ?? _PR_LABEL_COLORS[t.key].normal;
      els.fill.style.width      = `${pct}%`;
      els.fill.style.background = fillColor;
      els.label.style.color     = textColor;
      els.pct.style.color       = textColor;
      els.pct.textContent       = `${pct}%`;

      // Tooltip: drum life + pages left
      const drum = this._n(`sensor.${b}_${t.key}_drum_life`);
      const left = this._n(`sensor.${b}_${t.key}_drum_pages_left`);
      const parts = [`toner: ${pct}%`];
      if (drum !== null) parts.push(`bęben: ${drum}%`);
      if (left !== null) parts.push(`zostało ~${Math.round(left).toLocaleString('pl')} str`);
      els.tip.textContent = parts.join(' · ');
    });

    // ── Alerts ──
    ['paper_jam', 'no_paper', 'door_open', 'no_toner', 'low_toner'].forEach(a => {
      const chip = this._alertChips[a];
      if (!chip) return;
      const active = this._s(`binary_sensor.${b}_${a}`)?.state === 'on';
      chip.classList.toggle('active', active);
    });

    // ── Pages ──
    const total  = this._n(`sensor.${b}_total_pages`);
    const bw     = this._n(`sensor.${b}_b_w_pages`);
    const color  = this._n(`sensor.${b}_color_pages`);
    const duplex = this._n(`sensor.${b}_duplex_pages`);

    if (total !== null) {
      // Update text node only (preserve .tip child)
      this._pagesRow.childNodes[0].textContent = `${Math.round(total).toLocaleString('pl')} stron`;
      const tipParts = [];
      if (bw    !== null) tipParts.push(`B&W: ${Math.round(bw)}`);
      if (color !== null) tipParts.push(`kolor: ${Math.round(color)}`);
      if (duplex!== null) tipParts.push(`duplex: ${Math.round(duplex)}`);
      const belt  = this._n(`sensor.${b}_belt_unit_life`);
      const fuser = this._n(`sensor.${b}_fuser_life`);
      if (belt  !== null) tipParts.push(`taśma: ${belt}%`);
      if (fuser !== null) tipParts.push(`grzałka: ${fuser}%`);
      this._pagesTip.textContent = tipParts.join(' · ');
    }

    // ── Name ──
    this._nameEl.textContent = name;
  }

  getCardSize() { return 3; }

  static getStubConfig() {
    return { entity: 'sensor.pietro_hl_l3240cdw', name: 'HL-L3240CDW' };
  }
}

customElements.define('aha-printer-card', AhaPrinterCard);
if (!customElements.get('printer-card'))
  customElements.define('printer-card', class extends AhaPrinterCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-printer-card',
  name:        'Printer Card',
  description: 'Karta drukarki Brother — tonery K/C/M/Y, alerty, licznik stron',
  preview:     true,
});
