/**
 * szambo-finance-card.js — rozliczenie szamba, styl Apple Home
 *
 * UŻYCIE:
 *   type: custom:szambo-finance-card
 *   cost: 320
 *   dom1_name: "Dom 49/1"
 *   dom2_name: "Dom 49/2"
 *   entity_dom1_zaplata: sensor.szambo_dom_1_do_zaplaty
 *   entity_dom2_zaplata: sensor.szambo_dom_2_do_zaplaty
 *   entity_dom1_zuzycie: sensor.szambo_dom_1_zuzycie
 *   entity_dom2_zuzycie: sensor.szambo_dom_2_zuzycie
 */

const R    = 38;
const CIRC = 2 * Math.PI * R;

class SzamboFinanceCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = {
      cost:                config.cost                ?? 320,
      dom1_name:           config.dom1_name           ?? 'Dom 1',
      dom2_name:           config.dom2_name           ?? 'Dom 2',
      entity_dom1_zaplata: config.entity_dom1_zaplata ?? null,
      entity_dom2_zaplata: config.entity_dom2_zaplata ?? null,
      entity_dom1_zuzycie: config.entity_dom1_zuzycie ?? null,
      entity_dom2_zuzycie: config.entity_dom2_zuzycie ?? null,
    };
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() { return 2; }

  _val(id) {
    if (!id || !this._hass) return 0;
    const v = parseFloat(this._hass.states[id]?.state);
    return isNaN(v) ? 0 : v;
  }

  _render() {
    if (!this._hass) return;
    const { CLR_D1, CLR_D2 } = window.AHA.SZAMBO;

    const cost     = this._config.cost;
    const dom1Name = this._config.dom1_name;
    const dom2Name = this._config.dom2_name;

    const d1zl  = this._val(this._config.entity_dom1_zaplata);
    const d2zl  = this._val(this._config.entity_dom2_zaplata);
    const d1m3  = this._val(this._config.entity_dom1_zuzycie);
    const d2m3  = this._val(this._config.entity_dom2_zuzycie);
    const total = d1zl + d2zl;

    const fmt   = v => v.toFixed(2).replace('.', ',');
    const fmtm3 = v => v.toFixed(2).replace('.', ',');

    const d1pct = total > 0 ? Math.round((d1zl / total) * 100) : 50;
    const d2pct = 100 - d1pct;

    const d1arc = (d1pct / 100) * CIRC;
    const d2arc = CIRC - d1arc;

    /* kąt podziału w stopniach — do narysowania sektorów hit-area */
    const splitDeg = (d1pct / 100) * 360;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .card {
          background: #2C2C2E;
          border-radius: 18px;
          padding: 16px 18px;
          box-sizing: border-box;
          font-family: -apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 16px;
        }
        .header-ic {
          width: 30px; height: 30px; border-radius: 9px;
          background: #1C1C1E;
          display: flex; align-items: center; justify-content: center;
          color: #8E8E93;
        }
        .header-title { font-size: 13px; font-weight: 500; color: #AEAEB2; flex: 1; }
        .header-cost  { font-size: 11px; color: #636366; }

        .body { display: flex; align-items: center; gap: 18px; }

        .chart-col {
          flex-shrink: 0;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }

        .chart-wrap {
          position: relative; width: 96px; height: 96px;
        }
        .chart-wrap svg { display: block; }

        /* dwie przezroczyste nakładki hit-area */
        .hit-area {
          position: absolute; inset: 0;
          display: flex;
        }
        .hit-left {
          flex: 1; cursor: pointer;
          /* lewa połowa = Dom1 */
        }
        .hit-right {
          flex: 1; cursor: pointer;
          /* prawa połowa = Dom2 */
        }

        .arc { transition: opacity .2s; }
        .arc.faded   { opacity: .2; }
        .arc.hovered { opacity: 1; filter: brightness(1.15); }

        .legend { display: flex; gap: 12px; }
        .legend-item { display: flex; align-items: center; gap: 4px; }
        .legend-dot  { width: 7px; height: 7px; border-radius: 50%; }
        .legend-lbl  { font-size: 10px; color: #636366; }

        .receipt {
          flex: 1;
          border-left: .5px solid #3A3A3C;
          padding-left: 16px;
        }
        .receipt-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 0;
          border-bottom: .5px dashed #3A3A3C;
          transition: opacity .2s;
          cursor: default;
        }
        .receipt-row.faded   { opacity: .3; }
        .receipt-row.hovered { opacity: 1; }

        .receipt-left { display: flex; flex-direction: column; gap: 2px; }
        .receipt-name { font-size: 13px; color: #fff; font-weight: 500; }
        .receipt-sub  { font-size: 10px; color: #636366; }
        .receipt-val  { font-size: 16px; font-weight: 600; }

        .receipt-total {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 0 0;
        }
        .receipt-total-lbl {
          font-size: 11px; color: #636366;
          text-transform: uppercase; letter-spacing: .4px; font-weight: 500;
        }
        .receipt-total-val {
          font-size: 20px; font-weight: 600; color: #fff; letter-spacing: -.5px;
        }
      </style>

      <div class="card">

        <div class="header">
          <div class="header-ic">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5z"/>
            </svg>
          </div>
          <div class="header-title">Rozliczenie szamba</div>
          <div class="header-cost">wywo\u017a ${cost} z\u0142</div>
        </div>

        <div class="body">

          <div class="chart-col">
            <div class="chart-wrap">
              <svg viewBox="0 0 100 100" width="96" height="96">
                <circle cx="50" cy="50" r="${R}" fill="none" stroke="#3A3A3C" stroke-width="16"/>
                <circle id="arc1" class="arc" cx="50" cy="50" r="${R}" fill="none"
                  stroke="${CLR_D1}" stroke-width="16"
                  stroke-dasharray="${d1arc.toFixed(1)} ${d2arc.toFixed(1)}"
                  stroke-dashoffset="0"
                  transform="rotate(90 50 50)"/>
                <circle id="arc2" class="arc" cx="50" cy="50" r="${R}" fill="none"
                  stroke="${CLR_D2}" stroke-width="16"
                  stroke-dasharray="${d2arc.toFixed(1)} ${d1arc.toFixed(1)}"
                  stroke-dashoffset="${(-d1arc).toFixed(1)}"
                  transform="rotate(90 50 50)"/>
                <text x="50" y="46" text-anchor="middle"
                  font-size="14" font-weight="600" fill="#fff"
                  font-family="-apple-system,sans-serif">${cost}</text>
                <text x="50" y="58" text-anchor="middle"
                  font-size="8" fill="#636366"
                  font-family="-apple-system,sans-serif">z\u0142</text>
              </svg>

              <!-- hit areas — niewidoczne prostokąty nad połówkami wykresu -->
              <div class="hit-area">
                <div class="hit-left"  id="hit1"></div>
                <div class="hit-right" id="hit2"></div>
              </div>
            </div>

            <div class="legend">
              <div class="legend-item">
                <div class="legend-dot" style="background:${CLR_D1};"></div>
                <div class="legend-lbl">49/1</div>
              </div>
              <div class="legend-item">
                <div class="legend-dot" style="background:${CLR_D2};"></div>
                <div class="legend-lbl">49/2</div>
              </div>
            </div>
          </div>

          <div class="receipt">
            <div class="receipt-row" id="row1">
              <div class="receipt-left">
                <div class="receipt-name">${dom1Name}</div>
                <div class="receipt-sub">${fmtm3(d1m3)} m\u00b3 \u00b7 ${d1pct}%</div>
              </div>
              <div class="receipt-val" style="color:${CLR_D1};">${fmt(d1zl)} z\u0142</div>
            </div>
            <div class="receipt-row" id="row2">
              <div class="receipt-left">
                <div class="receipt-name">${dom2Name}</div>
                <div class="receipt-sub">${fmtm3(d2m3)} m\u00b3 \u00b7 ${d2pct}%</div>
              </div>
              <div class="receipt-val" style="color:${CLR_D2};">${fmt(d2zl)} z\u0142</div>
            </div>
            <div class="receipt-total">
              <div class="receipt-total-lbl">Razem</div>
              <div class="receipt-total-val">${fmt(total)} z\u0142</div>
            </div>
          </div>

        </div>
      </div>
    `;

    this._bindHover();
  }

  _bindHover() {
    const sr   = this.shadowRoot;
    const arc1 = sr.getElementById('arc1');
    const arc2 = sr.getElementById('arc2');
    const hit1 = sr.getElementById('hit1');
    const hit2 = sr.getElementById('hit2');
    const row1 = sr.getElementById('row1');
    const row2 = sr.getElementById('row2');
    if (!arc1) return;

    const highlight = (dom) => {
      if (dom === 1) {
        arc1.classList.add('hovered');    arc1.classList.remove('faded');
        arc2.classList.add('faded');      arc2.classList.remove('hovered');
        row1.classList.add('hovered');    row1.classList.remove('faded');
        row2.classList.add('faded');      row2.classList.remove('hovered');
      } else if (dom === 2) {
        arc2.classList.add('hovered');    arc2.classList.remove('faded');
        arc1.classList.add('faded');      arc1.classList.remove('hovered');
        row2.classList.add('hovered');    row2.classList.remove('faded');
        row1.classList.add('faded');      row1.classList.remove('hovered');
      } else {
        [arc1, arc2, row1, row2].forEach(el => el.classList.remove('hovered', 'faded'));
      }
    };

    /* hit areas nad wykresem */
    hit1.addEventListener('mouseenter', () => highlight(1));
    hit1.addEventListener('mouseleave', () => highlight(null));
    hit1.addEventListener('touchstart',  () => highlight(1), { passive: true });
    hit1.addEventListener('touchend',    () => setTimeout(() => highlight(null), 600));

    hit2.addEventListener('mouseenter', () => highlight(2));
    hit2.addEventListener('mouseleave', () => highlight(null));
    hit2.addEventListener('touchstart',  () => highlight(2), { passive: true });
    hit2.addEventListener('touchend',    () => setTimeout(() => highlight(null), 600));

    /* wiersze paragonu */
    row1.addEventListener('mouseenter', () => highlight(1));
    row1.addEventListener('mouseleave', () => highlight(null));
    row2.addEventListener('mouseenter', () => highlight(2));
    row2.addEventListener('mouseleave', () => highlight(null));
  }
}

customElements.define('aha-szambo-finance-card', SzamboFinanceCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-szambo-finance-card',
  name:        'Szambo Finance Card',
  preview:     false,
  description: 'Rozliczenie koszt\u00f3w wywozu szamba z wykresem ko\u0142owym.',
});