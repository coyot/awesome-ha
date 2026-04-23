/**
 * power-overview-card.js — AHA Power Overview Card
 *
 * Pokazuje sumaryczne zużycie prądu na skonfigurowanych encjach (sensor.*_power).
 * Nagłówek: suma W + liczba aktywnych. Każdy rząd: nazwa | pasek | waty.
 * Pulsuje gdy duże obciążenie.
 *
 * Config:
 *   name:       (optional) tytuł karty, default "Zużycie prądu"
 *   entities:   (required) lista encji — string lub { entity, name }
 *   max_watts:  (optional) max W dla skalowania pasków, default: auto (max z encji)
 *   sort:       (optional) 'desc' (default, wg watt malejąco) | 'name' | 'none'
 *
 * Przykład:
 *   type: custom:aha-power-overview-card
 *   name: Zużycie prądu
 *   entities:
 *     - entity: sensor.gniazdko_salon_power
 *       name: TV Salon
 *     - sensor.gniazdko_kuchnia_power
 */

const POW_STYLES = `
  :host { display: block; width: 100%; }

  @keyframes pow-pulse-mid {
    0%,100% { box-shadow: 0 0 0 0   rgba(255,214,10,0); }
    50%     { box-shadow: 0 0 0 5px rgba(255,214,10,0.16); }
  }
  @keyframes pow-pulse-high {
    0%,100% { box-shadow: 0 0 0 0   rgba(255,159,10,0); }
    50%     { box-shadow: 0 0 0 5px rgba(255,159,10,0.20); }
  }
  @keyframes pow-pulse-crit {
    0%,100% { box-shadow: 0 0 0 0   rgba(255,69,58,0); }
    50%     { box-shadow: 0 0 0 5px rgba(255,69,58,0.22); }
  }

  .card {
    background: #1c1c1e;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.06);
    padding: 14px 16px 12px;
    box-sizing: border-box;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    transition: border-color .4s ease, background .4s ease;
    position: relative;
    overflow: hidden;
  }

  .card.s-low  { }
  .card.s-mid  {
    background: linear-gradient(160deg,#1d1a04,#1c1c1e);
    border-color: rgba(255,214,10,0.18);
    animation: pow-pulse-mid 3.2s ease-in-out infinite;
  }
  .card.s-high {
    background: linear-gradient(160deg,#1e1200,#1c1c1e);
    border-color: rgba(255,159,10,0.25);
    animation: pow-pulse-high 2.8s ease-in-out infinite;
  }
  .card.s-crit {
    background: linear-gradient(160deg,#1e0606,#1c1c1e);
    border-color: rgba(255,69,58,0.30);
    animation: pow-pulse-crit 2.4s ease-in-out infinite;
  }

  .glow {
    position: absolute; inset: 0; pointer-events: none;
    transition: background .5s ease;
  }
  .s-low  .glow { background: none; }
  .s-mid  .glow { background: radial-gradient(ellipse at 85% 15%, rgba(255,214,10,0.07) 0%, transparent 55%); }
  .s-high .glow { background: radial-gradient(ellipse at 85% 15%, rgba(255,159,10,0.09) 0%, transparent 55%); }
  .s-crit .glow { background: radial-gradient(ellipse at 85% 15%, rgba(255,69,58,0.09)  0%, transparent 55%); }

  /* ── Header ── */
  .header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 12px; position: relative; z-index: 2;
  }
  .header-left { display: flex; flex-direction: column; gap: 2px; }

  .card-title {
    font-size: 13px; font-weight: 700;
    color: rgba(255,255,255,0.80);
    letter-spacing: -0.1px;
  }
  .active-label {
    font-size: 11px; color: rgba(255,255,255,0.30);
  }

  .total-watts {
    font-size: 30px; font-weight: 700; line-height: 1;
    text-align: right;
    transition: color .4s ease;
  }
  .total-unit { font-size: 14px; font-weight: 400; opacity: 0.65; }

  .s-low  .total-watts { color: rgba(255,255,255,0.28); }
  .s-mid  .total-watts { color: #FFD60A; }
  .s-high .total-watts { color: #FF9F0A; }
  .s-crit .total-watts { color: #FF453A; }

  /* ── Divider ── */
  .divider {
    height: 1px;
    background: rgba(255,255,255,0.06);
    margin: 0 0 10px;
    position: relative; z-index: 2;
  }

  /* ── Rows ── */
  .rows { display: flex; flex-direction: column; gap: 2px; position: relative; z-index: 2; }

  .row {
    display: grid;
    grid-template-columns: 1fr 72px 56px;
    align-items: center;
    gap: 8px;
    padding: 7px 8px;
    margin: 0 -8px;
    border-radius: 10px;
    cursor: pointer;
    transition: background .15s ease;
  }
  .row:active { background: rgba(255,255,255,0.05); transform: scale(0.98); }

  .row-name {
    font-size: 13px; font-weight: 500;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color .3s ease;
  }
  .row.on  .row-name { color: rgba(255,255,255,0.88); }
  .row.off .row-name { color: rgba(255,255,255,0.28); }

  .row-bar-wrap {
    height: 3px; border-radius: 99px;
    background: rgba(255,255,255,0.06);
    overflow: hidden;
  }
  .row-bar {
    height: 100%; border-radius: 99px;
    transition: width .6s ease, background-color .4s ease;
    min-width: 0;
  }

  .row-watts {
    font-size: 12px; font-weight: 600;
    text-align: right;
    transition: color .3s ease;
    white-space: nowrap;
  }
  .row.on  .row-watts { color: rgba(255,255,255,0.75); }
  .row.off .row-watts { color: rgba(255,255,255,0.20); }

  /* ── Unavailable ── */
  .row.unavail .row-name  { color: rgba(255,255,255,0.18); font-style: italic; }
  .row.unavail .row-watts { color: rgba(255,255,255,0.15); }
`;

/* ── Helpers ── */
const _wattColor = w => {
  if (w <   1) return 'rgba(255,255,255,0.10)';
  if (w < 100) return '#30D158';
  if (w < 500) return '#FFD60A';
  if (w < 1500) return '#FF9F0A';
  return '#FF453A';
};

const _cardState = w => {
  if (w <   50) return 's-low';
  if (w < 1000) return 's-mid';
  if (w < 3000) return 's-high';
  return 's-crit';
};

const _fmtW = w => {
  if (w >= 1000) return (w / 1000).toFixed(2).replace('.', ',') + '<span class="total-unit"> kW</span>';
  return Math.round(w) + '<span class="total-unit"> W</span>';
};

const _fmtRow = w => {
  if (w >= 1000) return (w / 1000).toFixed(2).replace('.', ',') + ' kW';
  if (w <   10)  return w.toFixed(1) + ' W';
  return Math.round(w) + ' W';
};

const _activeLabel = n => {
  if (n === 0) return 'wszystkie wyłączone';
  if (n === 1) return '1 aktywne';
  return `${n} aktywnych`;
};

/* ── Card ── */
class AhaPowerOverviewCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built = false;
  }

  setConfig(config) {
    if (!config.entities?.length) throw new Error('power-overview-card: brak pola "entities"');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) { this._build(); this._built = true; }
    this._update();
  }

  /* ── Build DOM once ── */
  _build() {
    const s = document.createElement('style');
    s.textContent = POW_STYLES;
    this.shadowRoot.appendChild(s);

    this._card = document.createElement('div');
    this._card.className = 'card s-low';
    this._card.innerHTML = `
      <div class="glow"></div>
      <div class="header">
        <div class="header-left">
          <div class="card-title">⚡ —</div>
          <div class="active-label">—</div>
        </div>
        <div class="total-watts">—</div>
      </div>
      <div class="divider"></div>
      <div class="rows"></div>
    `;
    this.shadowRoot.appendChild(this._card);

    this._titleEl  = this._card.querySelector('.card-title');
    this._activeEl = this._card.querySelector('.active-label');
    this._totalEl  = this._card.querySelector('.total-watts');
    this._rowsEl   = this._card.querySelector('.rows');
  }

  /* ── Update on state change ── */
  _update() {
    if (!this._hass || !this._config) return;

    const cfg = this._config;

    /* parse entities */
    const rows = cfg.entities.map(e => {
      const c = typeof e === 'string' ? { entity: e } : e;
      const st = this._hass.states[c.entity];
      const name = c.name || st?.attributes?.friendly_name || c.entity;

      if (!st || st.state === 'unavailable' || st.state === 'unknown') {
        return { name, watts: 0, entity: c.entity, avail: false };
      }

      let watts = parseFloat(st.state);
      if (isNaN(watts)) return { name, watts: 0, entity: c.entity, avail: false };

      /* handle kW unit */
      const unit = (st.attributes?.unit_of_measurement || '').trim().toLowerCase();
      if (unit === 'kw') watts *= 1000;

      return { name, watts, entity: c.entity, avail: true };
    });

    /* sort */
    const sort = cfg.sort ?? 'desc';
    if (sort === 'desc') rows.sort((a, b) => b.watts - a.watts);
    else if (sort === 'name') rows.sort((a, b) => a.name.localeCompare(b.name));

    /* totals */
    const totalW    = rows.reduce((s, r) => s + r.watts, 0);
    const activeN   = rows.filter(r => r.watts >= 1).length;
    const peakW     = cfg.max_watts ?? Math.max(...rows.map(r => r.watts), 1);
    const cardState = _cardState(totalW);
    const title     = cfg.name ?? 'Zużycie prądu';

    /* ── patch card class (keeps animation running if class unchanged) ── */
    this._card.className = `card ${cardState}`;

    /* ── header ── */
    this._titleEl.textContent  = `⚡ ${title}`;
    this._activeEl.textContent = _activeLabel(activeN);
    this._totalEl.innerHTML    = _fmtW(totalW);

    /* ── rows ── */
    this._rowsEl.innerHTML = rows.map(r => {
      const pct      = peakW > 0 ? Math.min(100, (r.watts / peakW) * 100) : 0;
      const barColor = _wattColor(r.watts);
      const cls      = !r.avail ? 'unavail' : r.watts >= 1 ? 'on' : 'off';
      const wattStr  = !r.avail ? '—' : _fmtRow(r.watts);

      return `
        <div class="row ${cls}" data-entity="${r.entity}">
          <div class="row-name">${r.name}</div>
          <div class="row-bar-wrap">
            <div class="row-bar" style="width:${pct.toFixed(1)}%;background-color:${barColor}"></div>
          </div>
          <div class="row-watts">${wattStr}</div>
        </div>`;
    }).join('');

    /* ── tap → more-info ── */
    this._rowsEl.querySelectorAll('.row[data-entity]').forEach(el => {
      el.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true,
          detail: { entityId: el.dataset.entity },
        }));
      });
    });
  }

  getCardSize() {
    const n = this._config?.entities?.length ?? 4;
    return 2 + Math.ceil(n / 2);
  }

  static getConfigElement() { return document.createElement('div'); }

  static getStubConfig() {
    return {
      name: 'Zużycie prądu',
      entities: [
        { entity: 'sensor.gniazdko_salon_power',   name: 'TV Salon' },
        { entity: 'sensor.gniazdko_kuchnia_power', name: 'Kuchnia' },
        { entity: 'sensor.gniazdko_biuro_power',   name: 'Biuro' },
      ],
    };
  }
}

customElements.define('aha-power-overview-card', AhaPowerOverviewCard);
if (!customElements.get('power-overview-card'))
  customElements.define('power-overview-card', class extends AhaPowerOverviewCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-power-overview-card',
  name:        'Power Overview Card',
  description: 'Zbiorcze zużycie prądu na gniazdkach — suma W, paski, kolor wg obciążenia.',
  preview:     true,
});
