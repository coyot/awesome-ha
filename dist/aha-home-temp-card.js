/**
 * aha-home-temp-card
 *
 * Przegląd temperatur w domu — grid kafelków, każdy z kolorem dopasowanym
 * do wartości. Apple Home dark style.
 *
 * Config:
 *   title: "Temperatury"        (opcjonalne)
 *   sensors:
 *     - entity: sensor.xxx_temperature
 *       name: Salon              (opcjonalne — fallback: friendly_name)
 *       humidity_entity: sensor.xxx_humidity   (opcjonalne)
 */

class AhaHomeTempCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.sensors || !config.sensors.length) throw new Error('Wymagane: sensors[]');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  // ── kolor + etykieta dla temperatury ──
  _tempColor(t) {
    if (t === null) return { color: 'rgba(142,142,147,.65)', bg: 'rgba(142,142,147,.08)', border: 'rgba(142,142,147,.15)' };
    if (t < 16)   return { color: '#5AC8FA', bg: 'rgba(90,200,250,.10)',  border: 'rgba(90,200,250,.22)' };
    if (t < 19)   return { color: '#64D2FF', bg: 'rgba(100,210,255,.10)', border: 'rgba(100,210,255,.20)' };
    if (t < 22)   return { color: '#34C759', bg: 'rgba(52,199,89,.10)',   border: 'rgba(52,199,89,.22)' };
    if (t < 25)   return { color: '#30D158', bg: 'rgba(48,209,88,.10)',   border: 'rgba(48,209,88,.20)' };
    if (t < 27)   return { color: '#FFD60A', bg: 'rgba(255,214,10,.10)',  border: 'rgba(255,214,10,.22)' };
    if (t < 29)   return { color: '#FF9F0A', bg: 'rgba(255,159,10,.10)',  border: 'rgba(255,159,10,.22)' };
    return              { color: '#FF453A', bg: 'rgba(255,69,58,.10)',    border: 'rgba(255,69,58,.22)' };
  }

  _tempLabel(t) {
    if (t === null) return '—';
    if (t < 16)  return 'Zimno';
    if (t < 19)  return 'Chłodno';
    if (t < 22)  return 'Komfortowo';
    if (t < 25)  return 'Ciepło';
    if (t < 27)  return 'Gorąco';
    if (t < 29)  return 'Bardzo gorąco';
    return 'Upalnie';
  }

  // ── termometr SVG skalowany do temperatury ──
  _thermSVG(t, color) {
    const pct  = t === null ? 0 : Math.max(0, Math.min(1, (t - 10) / 30)); // 10–40°C
    const fill = 28 - Math.round(pct * 20); // y: 28 (pusty) → 8 (pełny)
    const h    = 28 - fill;
    return `<svg width="18" height="32" viewBox="0 0 18 32" fill="none">
      <rect x="7" y="3" width="4" height="20" rx="2" fill="rgba(255,255,255,.08)"/>
      <rect x="7" y="${fill}" width="4" height="${h}" rx="2" fill="${color}" opacity=".85"/>
      <circle cx="9" cy="25" r="4.5" fill="${color}" opacity="${t !== null ? '.85' : '.3'}"/>
      <circle cx="9" cy="25" r="2.5" fill="rgba(255,255,255,.35)"/>
    </svg>`;
  }

  _render() {
    if (!this._hass) return;
    const cfg     = this._config;
    const title   = cfg.title || null;

    const tiles = cfg.sensors.map(s => {
      const st   = this._hass.states[s.entity];
      const raw  = st ? parseFloat(st.state) : null;
      const temp = (!isNaN(raw) && raw !== null) ? raw : null;
      const name = s.name || st?.attributes?.friendly_name || s.entity;

      const humSt  = s.humidity_entity ? this._hass.states[s.humidity_entity] : null;
      const humRaw = humSt ? parseFloat(humSt.state) : NaN;
      const hum    = !isNaN(humRaw) ? Math.round(humRaw) : null;

      const { color, bg, border } = this._tempColor(temp);
      const label = this._tempLabel(temp);
      const tempStr = temp !== null ? temp.toFixed(1) : '—';

      return { name, temp, tempStr, hum, color, bg, border, label };
    });

    // min/max dla kontekstu
    const vals = tiles.map(t => t.temp).filter(v => v !== null);
    const minT = vals.length ? Math.min(...vals) : null;
    const maxT = vals.length ? Math.max(...vals) : null;

    this.shadowRoot.innerHTML = `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      :host { display: block; font-family: -apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif; -webkit-font-smoothing: antialiased; }

      .card {
        background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
        border: .5px solid rgba(255,255,255,.08);
        border-radius: 18px;
        padding: 16px;
        position: relative;
        overflow: hidden;
      }
      .card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent);
        pointer-events: none;
      }

      .header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 14px;
      }
      .title {
        font-size: 15px; font-weight: 700;
        color: rgba(255,255,255,.90); letter-spacing: -.2px;
      }
      .range {
        font-size: 11px; color: rgba(255,255,255,.28); font-weight: 500;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 8px;
      }

      .tile {
        background: var(--t-bg);
        border: .5px solid var(--t-border);
        border-radius: 14px;
        padding: 12px 10px 10px;
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        position: relative;
        overflow: hidden;
        transition: background .3s, border-color .3s;
      }
      .tile::after {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, var(--t-color), transparent);
        opacity: .35;
      }

      .tile-name {
        font-size: 10px; font-weight: 600; letter-spacing: .02em;
        color: rgba(255,255,255,.45); text-align: center;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        width: 100%;
      }
      .tile-temp {
        font-size: 26px; font-weight: 700; letter-spacing: -1px; line-height: 1;
        color: var(--t-color); font-variant-numeric: tabular-nums;
      }
      .tile-unit {
        font-size: 13px; font-weight: 400; opacity: .7;
      }
      .tile-label {
        font-size: 9px; font-weight: 600; letter-spacing: .04em;
        color: var(--t-color); opacity: .65; text-transform: uppercase;
        text-align: center;
      }
      .tile-hum {
        font-size: 10px; font-weight: 500;
        color: rgba(255,255,255,.30);
        display: flex; align-items: center; gap: 3px;
      }
      .tile-hum svg { opacity: .5; }

      /* min/max badge */
      .badge {
        position: absolute; top: 6px; right: 6px;
        font-size: 8px; font-weight: 700; letter-spacing: .04em;
        padding: 1px 4px; border-radius: 4px;
        color: var(--t-color);
        background: rgba(0,0,0,.25);
      }
    </style>

    <div class="card">
      ${title || (minT !== null && maxT !== null) ? `
      <div class="header">
        ${title ? `<div class="title">${title}</div>` : '<div></div>'}
        ${minT !== null ? `<div class="range">${minT.toFixed(1)}° – ${maxT.toFixed(1)}°</div>` : ''}
      </div>` : ''}

      <div class="grid">
        ${tiles.map((t, i) => {
          const isMin = t.temp !== null && t.temp === minT && vals.length > 1;
          const isMax = t.temp !== null && t.temp === maxT && vals.length > 1;
          return `<div class="tile" style="--t-color:${t.color};--t-bg:${t.bg};--t-border:${t.border}">
            ${isMin ? `<span class="badge">MIN</span>` : isMax ? `<span class="badge">MAX</span>` : ''}
            <div class="tile-name">${t.name}</div>
            <div class="tile-temp">${t.tempStr}<span class="tile-unit">°</span></div>
            <div class="tile-label">${t.label}</div>
            ${t.hum !== null ? `
            <div class="tile-hum">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M6 1C6 1 2 5.5 2 7.5a4 4 0 008 0C10 5.5 6 1 6 1z" stroke="currentColor" stroke-width="1.2" fill="none"/>
              </svg>
              ${t.hum}%
            </div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  getCardSize() {
    const cols = 3;
    return Math.ceil((this._config?.sensors?.length || 1) / cols) * 2;
  }

  static getStubConfig() {
    return {
      title: 'Temperatury',
      sensors: [
        { entity: 'sensor.temperature_example', name: 'Salon' }
      ]
    };
  }
}

customElements.define('aha-home-temp-card', AhaHomeTempCard);
if (!customElements.get('home-temp-card'))
  customElements.define('home-temp-card', class extends AhaHomeTempCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'aha-home-temp-card',
  name: 'AHA Home Temp Card',
  preview: false,
  description: 'Przegląd temperatur w domu — kolorowany grid kafelków.',
});
