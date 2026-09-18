/**
 * aha-energy-sankey-card.js — AHA Energy Sankey Card
 *
 * Diagram Sankey przepływu energii — Apple Home style, animowany.
 * Źródło (sieć) po lewej, odbiorcy po prawej, wypełnione paski beziera
 * z animowanym shimmerem (płynąca elektryczność).
 *
 * Config:
 *   title:       (optional) tytuł karty, default "Przepływ energii"
 *   source_name: (optional) nazwa węzła źródłowego, default "Sieć"
 *   max_watts:   (optional) ref. max W — wyznacza progi pulsu (high/crit)
 *   entities:    (required) lista:
 *     entity:    sensor.* (moc w W lub kW)
 *     name:      etykieta
 *     color:     kolor hex
 *
 * Przykład:
 *   type: custom:aha-energy-sankey-card
 *   title: Przepływ energii
 *   source_name: Sieć
 *   max_watts: 3000
 *   entities:
 *     - entity: sensor.biuro_power
 *       name: Biuro
 *       color: "#85B7EB"
 *     - entity: sensor.living_room_salon_power
 *       name: Salon
 *       color: "#97C459"
 */

const SAN_COLORS = [
  '#85B7EB', '#97C459', '#EF9F27', '#A86AC2',
  '#FF6B6B', '#4EC9B0', '#FF9F0A', '#64D2FF',
];

const SAN_CSS = `
  :host { display: block; width: 100%; }

  @keyframes san-pulse-high {
    0%,100% { box-shadow: 0 0 0 0   rgba(255,159,10,0); }
    50%     { box-shadow: 0 0 0 5px rgba(255,159,10,0.20); }
  }
  @keyframes san-pulse-crit {
    0%,100% { box-shadow: 0 0 0 0   rgba(255,69,58,0); }
    50%     { box-shadow: 0 0 0 6px rgba(255,69,58,0.22); }
  }

  .card {
    background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.06);
    padding: 14px 14px 10px;
    box-sizing: border-box;
    font-family: -apple-system, system-ui, sans-serif;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: border-color .4s ease;
    position: relative;
    overflow: hidden;
  }
  .card.s-high {
    border-color: rgba(255,159,10,0.25);
    animation: san-pulse-high 2.8s ease-in-out infinite;
  }
  .card.s-crit {
    border-color: rgba(255,69,58,0.30);
    animation: san-pulse-crit 2.4s ease-in-out infinite;
  }

  .hdr {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .hdr-title {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.45);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding-top: 2px;
  }
  .hdr-right { text-align: right; }
  .hdr-total {
    font-size: 26px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    letter-spacing: -0.5px;
  }
  .hdr-lbl {
    font-size: 10px;
    color: rgba(255,255,255,0.32);
    margin-top: 2px;
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }
`;

class AhaEnergySankeyCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built = false;
  }

  setConfig(cfg) {
    if (!cfg.entities?.length) throw new Error('aha-energy-sankey-card: wymagane "entities"');
    this._cfg = cfg;
  }

  set hass(h) {
    this._hass = h;
    if (!this._built) { this._build(); this._built = true; }
    this._update();
  }

  getCardSize() { return 4; }

  _build() {
    const style = document.createElement('style');
    style.textContent = SAN_CSS;
    this.shadowRoot.appendChild(style);

    this._card = document.createElement('div');
    this._card.className = 'card';
    this._card.innerHTML = `
      <div class="hdr">
        <div class="hdr-title"></div>
        <div class="hdr-right">
          <div class="hdr-total">—</div>
          <div class="hdr-lbl">łączny pobór</div>
        </div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"></svg>
    `;
    this.shadowRoot.appendChild(this._card);

    this._titleEl = this._card.querySelector('.hdr-title');
    this._totalEl = this._card.querySelector('.hdr-total');
    this._svg     = this._card.querySelector('svg');

    /* click → more-info */
    this._svg.addEventListener('click', e => {
      const el = e.target.closest('[data-entity]');
      if (!el) return;
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: el.dataset.entity },
      }));
    });
  }

  _update() {
    if (!this._hass || !this._cfg) return;
    const cfg = this._cfg;

    /* parse entities */
    const rows = cfg.entities.map((e, i) => {
      const c = typeof e === 'string' ? { entity: e } : e;
      const st = this._hass.states[c.entity];
      const name  = c.name  || st?.attributes?.friendly_name || c.entity;
      const color = c.color || SAN_COLORS[i % SAN_COLORS.length];
      let watts = 0;
      if (st?.state && st.state !== 'unavailable' && st.state !== 'unknown') {
        watts = parseFloat(st.state) || 0;
        const unit = (st.attributes?.unit_of_measurement || '').trim().toLowerCase();
        if (unit === 'kw') watts *= 1000;
      }
      return { name, color, watts, entity: c.entity };
    });

    const totalW = rows.reduce((s, r) => s + r.watts, 0);

    /* header */
    this._titleEl.textContent = cfg.title || 'Przepływ energii';
    this._totalEl.textContent = this._fmt(totalW);

    /* card level */
    const maxW = cfg.max_watts || 0;
    const lvl  = maxW > 0 ? totalW / maxW : 0;
    this._card.className = 'card ' + (lvl > 0.8 ? 's-crit' : lvl > 0.5 ? 's-high' : 's-low');

    this._renderSVG(rows, totalW, cfg.source_name || 'Sieć');
  }

  _fmt(w) {
    if (w >= 1000) return (w / 1000).toFixed(2) + ' kW';
    return Math.round(w) + ' W';
  }

  _renderSVG(rows, totalW, srcName) {
    const sorted = [...rows].sort((a, b) => b.watts - a.watts);
    const N = sorted.length;

    /* SVG coordinate system */
    const VW   = 400;
    const ROW_H = 54;
    const PAD   = 14;
    const VH    = Math.max(160, N * ROW_H + PAD * 2);

    /* layout */
    const SX  = 10,  SW  = 74;            /* source box x, width */
    const CX  = 268, CW  = 130;           /* consumer box x, width */
    const SR  = SX + SW;                  /* source right edge */
    const CPX = SR + (CX - SR) * 0.42;   /* bezier control x */
    const ST  = PAD, SB = VH - PAD;
    const SH  = SB - ST;

    this._svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);

    /* active rows for Sankey bands */
    const active      = sorted.filter(r => r.watts > 0);
    const activeTotal = active.reduce((s, r) => s + r.watts, 0);
    const BAND_TOP    = ST + SH * 0.05;
    const BAND_H      = SH * 0.90;

    /* assign vertical positions on source right edge */
    let srcCurY = BAND_TOP;
    const bandMap = new Map();
    active.forEach(row => {
      const pct = row.watts / activeTotal;
      const bH  = Math.max(5, BAND_H * pct);
      bandMap.set(row.entity, { top: srcCurY, bot: srcCurY + bH, mid: srcCurY + bH / 2 });
      srcCurY += bH;
    });

    let defs = `
      <linearGradient id="sn-src" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1d2e4c"/>
        <stop offset="100%" stop-color="#0d1a2e"/>
      </linearGradient>
    `;
    let bands = '', shimmers = '', srcNode = '', conNodes = '';

    /* ── flow bands + shimmers ── */
    sorted.forEach((row, i) => {
      const conTop = PAD + i * ROW_H;
      const conH   = ROW_H - 10;
      const conMid = conTop + conH / 2;
      const band   = bandMap.get(row.entity);
      if (!band) return;

      const { top: bTop, bot: bBot, mid: bMid } = band;
      const gradId = `sg${i}`;

      defs += `
        <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="${row.color}" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="${row.color}" stop-opacity="0.52"/>
        </linearGradient>
      `;

      /* filled bezier band */
      const d = [
        `M ${SR} ${bTop}`,
        `C ${CPX} ${bTop},  ${CPX} ${conTop},         ${CX} ${conTop}`,
        `L ${CX} ${conTop + conH}`,
        `C ${CPX} ${conTop + conH}, ${CPX} ${bBot}, ${SR} ${bBot}`,
        'Z',
      ].join(' ');
      bands += `<path d="${d}" fill="url(#${gradId})"/>`;

      /* shimmer center line */
      const shimD   = `M ${SR} ${bMid} C ${CPX} ${bMid}, ${CPX} ${conMid}, ${CX} ${conMid}`;
      const approxL = Math.round(Math.hypot(CX - SR, conMid - bMid) * 1.35);
      const dur     = (1.8 + i * 0.22).toFixed(2);
      shimmers += `
        <path d="${shimD}" fill="none" stroke="${row.color}" stroke-width="1.8"
              stroke-opacity="0.55" stroke-dasharray="16 ${approxL}" stroke-linecap="round">
          <animate attributeName="stroke-dashoffset"
                   from="${approxL + 16}" to="0"
                   dur="${dur}s" repeatCount="indefinite"/>
        </path>
      `;
    });

    /* ── source node ── */
    srcNode = `
      <rect x="${SX}" y="${ST}" width="${SW}" height="${SH}" rx="14"
            fill="url(#sn-src)" stroke="rgba(133,183,235,0.25)" stroke-width="0.8"/>
      <text x="${SX + SW / 2}" y="${ST + SH / 2 - 18}"
            text-anchor="middle" font-size="22">⚡</text>
      <text x="${SX + SW / 2}" y="${ST + SH / 2 + 2}"
            text-anchor="middle" font-size="10" font-weight="600"
            fill="rgba(255,255,255,0.5)"
            font-family="-apple-system,system-ui,sans-serif">${srcName}</text>
      <text x="${SX + SW / 2}" y="${ST + SH / 2 + 18}"
            text-anchor="middle" font-size="12" font-weight="700"
            fill="#85B7EB"
            font-family="-apple-system,system-ui,sans-serif">${this._fmt(totalW)}</text>
    `;

    /* ── consumer nodes ── */
    sorted.forEach((row, i) => {
      const conTop  = PAD + i * ROW_H;
      const conH    = ROW_H - 10;
      const conMid  = conTop + conH / 2;
      const active  = row.watts > 0;
      const dotClr  = active ? row.color : 'rgba(255,255,255,0.18)';
      const namClr  = active ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.28)';
      const wClr    = active ? '#fff'  : 'rgba(255,255,255,0.22)';
      const pctStr  = (totalW > 0 && active)
        ? Math.round(row.watts / totalW * 100) + '%'
        : '—';
      const clipId  = `cc${i}`;

      defs += `
        <clipPath id="${clipId}">
          <rect x="${CX + 23}" y="${conTop + 2}" width="${CW - 54}" height="${conH - 4}"/>
        </clipPath>
      `;

      conNodes += `
        <g data-entity="${row.entity}" style="cursor:pointer">
          <rect x="${CX + 2}" y="${conTop}" width="${CW - 4}" height="${conH}" rx="9"
                fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.055)" stroke-width="0.5"/>
          <circle cx="${CX + 14}" cy="${conMid}" r="4.5" fill="${dotClr}"/>
          <text clip-path="url(#${clipId})"
                x="${CX + 24}" y="${conMid - 4}"
                font-size="11" font-weight="500" fill="${namClr}"
                font-family="-apple-system,system-ui,sans-serif"
                dominant-baseline="middle">${row.name}</text>
          <text x="${CX + CW - 6}" y="${conMid - 5}"
                font-size="12" font-weight="700" fill="${wClr}"
                font-family="-apple-system,system-ui,sans-serif"
                text-anchor="end" dominant-baseline="middle">${this._fmt(row.watts)}</text>
          <text x="${CX + CW - 6}" y="${conMid + 9}"
                font-size="10" fill="rgba(255,255,255,0.28)"
                font-family="-apple-system,system-ui,sans-serif"
                text-anchor="end">${pctStr}</text>
        </g>
      `;
    });

    this._svg.innerHTML = `<defs>${defs}</defs>${bands}${shimmers}${srcNode}${conNodes}`;
  }

  static getStubConfig() {
    return {
      title: 'Przepływ energii',
      source_name: 'Sieć',
      entities: [
        { entity: 'sensor.biuro_power',            name: 'Biuro',   color: '#85B7EB' },
        { entity: 'sensor.living_room_salon_power', name: 'Salon',   color: '#97C459' },
        { entity: 'sensor.biuro_wiatrak_power',     name: 'Wiatrak', color: '#EF9F27' },
      ],
    };
  }
}

customElements.define('aha-energy-sankey-card', AhaEnergySankeyCard);
if (!customElements.get('energy-sankey-card'))
  customElements.define('energy-sankey-card', class extends AhaEnergySankeyCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-energy-sankey-card',
  name:        'Energy Sankey Card',
  description: 'Diagram Sankey przepływu energii — Apple Home style, animowany shimmer.',
  preview:     true,
});
