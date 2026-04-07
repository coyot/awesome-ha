/**
 * garden-meters-card.js — liczniki ogrodowe, styl Apple iOS
 *
 * INSTALACJA:
 *   1. Skopiuj do /config/www/garden-meters-card.js
 *   2. Lovelace → Manage Resources → /local/garden-meters-card.js (JavaScript Module)
 *
 * UŻYCIE:
 *   type: custom:garden-meters-card
 *   entity_ogrod1:   input_number.ogrod_1
 *   entity_ogrod2:   input_number.ogrod_2
 *   entity_confirm1: input_button.ogrod_1_potwierdz
 *   entity_confirm2: input_button.ogrod_2_potwierdz
 *   entity_updated1: input_datetime.ogrod_1_ostatnia_aktualizacja
 *   entity_updated2: input_datetime.ogrod_2_ostatnia_aktualizacja
 *   entity_stale1:   binary_sensor.ogrod_1_dane_nieaktualne
 *   entity_stale2:   binary_sensor.ogrod_2_dane_nieaktualne
 *   name1: "Ogród 1"
 *   name2: "Ogród 2"
 *   step: 0.001
 */

class GardenMetersCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._editing1 = false;
    this._editing2 = false;
    this._val1     = null;
    this._val2     = null;
    this._dirty1   = false;
    this._dirty2   = false;
    this._saving1  = false;
    this._saving2  = false;
  }

  setConfig(config) {
    this._config = {
      entity_ogrod1:   config.entity_ogrod1   ?? 'input_number.ogrod_1',
      entity_ogrod2:   config.entity_ogrod2   ?? 'input_number.ogrod_2',
      entity_confirm1: config.entity_confirm1 ?? config.entity_confirm ?? 'input_button.ogrod_1_potwierdz',
      entity_confirm2: config.entity_confirm2 ?? config.entity_confirm ?? 'input_button.ogrod_2_potwierdz',
      entity_updated1: config.entity_updated1 ?? config.entity_updated ?? 'input_datetime.ogrod_1_ostatnia_aktualizacja',
      entity_updated2: config.entity_updated2 ?? config.entity_updated ?? 'input_datetime.ogrod_2_ostatnia_aktualizacja',
      entity_stale1:   config.entity_stale1   ?? config.entity_stale   ?? 'binary_sensor.ogrod_1_dane_nieaktualne',
      entity_stale2:   config.entity_stale2   ?? config.entity_stale   ?? 'binary_sensor.ogrod_2_dane_nieaktualne',
      name1:           config.name1           ?? 'Ogród 1',
      name2:           config.name2           ?? 'Ogród 2',
      step:            config.step            ?? 0.001,
    };
  }

  set hass(hass) {
    this._hass = hass;
    // Only re-render when neither field is being edited
    if (!this._editing1 && !this._editing2) this._render();
  }

  getCardSize() { return 4; }

  _numVal(id) {
    const v = parseFloat(this._hass?.states[id]?.state);
    return isNaN(v) ? 0 : v;
  }

  _isStale(id) {
    return this._hass?.states[id]?.state === 'on';
  }

  _fmtDatetime(id) {
    const s = this._hass?.states[id]?.state;
    if (!s || s === 'unknown' || s === 'unavailable') return 'brak danych';
    try {
      const d    = new Date(s);
      const now  = new Date();
      const diff = Math.floor((now - d) / 86400000);
      const time = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
      if (diff === 0) return `dziś ${time}`;
      if (diff === 1) return `wczoraj ${time}`;
      return `${d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })} ${time}`;
    } catch { return s; }
  }

  _render() {
    if (!this._hass) return;

    const cfg    = this._config;
    const v1     = this._numVal(cfg.entity_ogrod1);
    const v2     = this._numVal(cfg.entity_ogrod2);
    const stale1 = this._isStale(cfg.entity_stale1);
    const stale2 = this._isStale(cfg.entity_stale2);
    const upd1   = this._fmtDatetime(cfg.entity_updated1);
    const upd2   = this._fmtDatetime(cfg.entity_updated2);

    if (this._val1 === null) this._val1 = v1;
    if (this._val2 === null) this._val2 = v2;

    const block = (n, val, stale, upd, dirty, saving, idx) => {
      const accent    = stale ? '#FF9F0A' : '#30D158';
      const accentDim = stale ? 'rgba(255,159,10,.12)' : 'rgba(48,209,88,.12)';
      const statusTxt = stale ? `nieaktualne · ${upd}` : `aktualne · ${upd}`;

      const btnActive = dirty || saving;
      const btnBg     = btnActive ? 'rgba(48,209,88,.16)'  : 'rgba(255,255,255,.07)';
      const btnBorder = btnActive ? 'rgba(48,209,88,.45)'  : 'rgba(255,255,255,.12)';
      const btnColor  = btnActive ? '#30D158'              : '#636366';
      const btnLabel  = dirty    ? 'Zapisz'               : 'Potwierdź';

      return `
        <div class="block ${stale ? 'block--stale' : ''}">
          <div class="block-head">
            <div class="block-title-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="${accent}" style="flex-shrink:0;opacity:.85;">
                <path d="M17 8C8 10 5.9 16.17 3.82 19.43L5 20l1-2h1l2-4h1l1-3h1l2-6 3 3zM4 8l1-3 3 3-1 3z"/>
              </svg>
              <span class="block-name">${n}</span>
            </div>
            <span class="badge" style="color:${accent};background:${accentDim};">
              ${stale ? '⚠\u00A0' : ''}${statusTxt}
            </span>
          </div>

          <div class="field-row">
            <div class="field-wrap">
              <label class="field-label" for="inp${idx}">Odczyt wodomierza</label>
              <div class="field-inner">
                <input class="field-inp" id="inp${idx}"
                       type="number"
                       value="${val.toFixed(3)}"
                       step="${cfg.step}"
                       min="0"
                       inputmode="decimal"
                       autocomplete="off">
                <span class="field-unit">m³</span>
              </div>
            </div>

            <button class="save-btn" id="save${idx}"
                    style="background:${btnBg};border-color:${btnBorder};color:${btnColor}"
                    ${saving ? 'disabled' : ''}>
              ${saving
                ? `<span class="spin">↻</span>`
                : `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;">
                     <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                   </svg><span>${btnLabel}</span>`
              }
            </button>
          </div>
        </div>`;
    };

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        .card {
          background: #1C1C1E;
          border-radius: 20px;
          border: 0.5px solid rgba(255,255,255,0.08);
          overflow: hidden;
          font-family: -apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .card-inner { padding: 16px 16px 14px; display: flex; flex-direction: column; gap: 10px; }

        /* ── header ─────────────────────────────────────────────── */
        .header {
          display: flex; align-items: center; gap: 8px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .header-title {
          font-size: 11px; font-weight: 700; color: #636366;
          letter-spacing: .08em; text-transform: uppercase;
        }

        /* ── block ──────────────────────────────────────────────── */
        .block {
          background: #2C2C2E;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 13px 14px 12px;
          transition: border-color .35s, box-shadow .35s;
        }
        .block--stale {
          border-color: rgba(255,159,10,.35);
          box-shadow: 0 0 16px 3px rgba(255,159,10,.18);
        }

        .block-head {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 8px;
          margin-bottom: 10px;
        }
        .block-title-row { display: flex; align-items: center; gap: 6px; }
        .block-name { font-size: 14px; font-weight: 600; color: #E5E5EA; }
        .badge {
          font-size: 10px; font-weight: 500;
          padding: 2px 8px; border-radius: 20px;
          white-space: nowrap; flex-shrink: 0; margin-top: 1px;
        }

        /* ── field ──────────────────────────────────────────────── */
        .field-row {
          display: flex; align-items: flex-end; gap: 8px;
        }
        .field-wrap {
          flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0;
        }
        .field-label {
          font-size: 10px; font-weight: 500; color: #48484A;
          letter-spacing: .04em; text-transform: uppercase; padding-left: 2px;
        }
        .field-inner {
          display: flex; align-items: center;
          background: #3A3A3C; border-radius: 10px;
          padding: 9px 12px 9px 12px;
          border: 1px solid rgba(255,255,255,0.08);
          transition: border-color .2s, box-shadow .2s;
        }
        .field-inner:focus-within {
          border-color: rgba(48,209,88,.55);
          box-shadow: 0 0 0 3px rgba(48,209,88,.12);
        }
        input[type=number].field-inp {
          background: transparent; border: none; outline: none;
          font-size: 22px; font-weight: 700; color: #F2F2F7;
          width: 100%; font-family: inherit;
          -moz-appearance: textfield; letter-spacing: -.5px;
          caret-color: #30D158;
        }
        input[type=number].field-inp::-webkit-inner-spin-button,
        input[type=number].field-inp::-webkit-outer-spin-button { -webkit-appearance: none; }
        .field-unit {
          font-size: 12px; font-weight: 500; color: #48484A;
          flex-shrink: 0; margin-left: 5px;
        }

        /* ── save button ────────────────────────────────────────── */
        .save-btn {
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; gap: 5px;
          padding: 0 14px; height: 46px;
          border-radius: 10px; border: 1px solid;
          font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: inherit;
          transition: background .15s, border-color .15s, color .15s, transform .1s, filter .15s;
          user-select: none; letter-spacing: -.1px; white-space: nowrap;
        }
        .save-btn:hover:not(:disabled) { filter: brightness(1.15); }
        .save-btn:active:not(:disabled) { transform: scale(.97); }
        .save-btn:disabled { opacity: .4; cursor: default; }

        .spin {
          display: inline-block;
          animation: spin .75s linear infinite;
          font-size: 16px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── footer accent bar ──────────────────────────────────── */
        .footer-bar { display: flex; height: 2px; }
        .footer-bar .seg { flex: 1; transition: background .4s; }
      </style>

      <div class="card">
        <div class="card-inner">

          <div class="header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#636366">
              <path d="M17 8C8 10 5.9 16.17 3.82 19.43L5 20l1-2h1l2-4h1l1-3h1l2-6 3 3zM4 8l1-3 3 3-1 3z"/>
            </svg>
            <span class="header-title">Liczniki ogrodowe</span>
          </div>

          ${block(cfg.name1, this._val1, stale1, upd1, this._dirty1, this._saving1, 1)}
          ${block(cfg.name2, this._val2, stale2, upd2, this._dirty2, this._saving2, 2)}

        </div>
        <div class="footer-bar">
          <div class="seg" style="background:${stale1 ? '#FF9F0A' : '#30D158'};opacity:.5;"></div>
          <div class="seg" style="background:${stale2 ? '#FF9F0A' : '#30D158'};opacity:.5;"></div>
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const cfg = this._config;
    [1, 2].forEach(idx => {
      const inp      = this.shadowRoot.getElementById(`inp${idx}`);
      const save     = this.shadowRoot.getElementById(`save${idx}`);
      const entityId = idx === 1 ? cfg.entity_ogrod1 : cfg.entity_ogrod2;

      inp.addEventListener('focus', () => {
        if (idx === 1) this._editing1 = true;
        else           this._editing2 = true;
        inp.select();
      });
      inp.addEventListener('input', () => this._handleChange(inp, idx, entityId));
      inp.addEventListener('blur',  () => {
        if (idx === 1) this._editing1 = false;
        else           this._editing2 = false;
      });
      save.addEventListener('click', () => this._save(idx));
    });
  }

  _handleChange(inp, idx, entityId) {
    const v     = parseFloat(inp.value);
    const orig  = this._numVal(entityId);
    const dirty = !isNaN(v) && v !== orig;
    if (idx === 1) { this._val1 = isNaN(v) ? 0 : v; this._dirty1 = dirty; }
    else           { this._val2 = isNaN(v) ? 0 : v; this._dirty2 = dirty; }
    this._refreshSaveBtn(idx, dirty, false);
  }

  _refreshSaveBtn(idx, dirty, saving) {
    const btn = this.shadowRoot.getElementById(`save${idx}`);
    if (!btn) return;
    const active = dirty || saving;
    btn.style.background  = active ? 'rgba(48,209,88,.16)'  : 'rgba(255,255,255,.07)';
    btn.style.borderColor = active ? 'rgba(48,209,88,.45)'  : 'rgba(255,255,255,.12)';
    btn.style.color       = active ? '#30D158'              : '#636366';
    btn.innerHTML = saving
      ? `<span class="spin">↻</span>`
      : `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;">
           <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
         </svg><span>${dirty ? 'Zapisz' : 'Potwierdź'}</span>`;
  }

  async _save(idx) {
    if (!this._hass) return;
    const cfg      = this._config;
    const entityN  = idx === 1 ? cfg.entity_ogrod1   : cfg.entity_ogrod2;
    const confirmN = idx === 1 ? cfg.entity_confirm1  : cfg.entity_confirm2;
    const val      = idx === 1 ? this._val1           : this._val2;

    if (idx === 1) this._saving1 = true; else this._saving2 = true;
    this._refreshSaveBtn(idx, false, true);

    try {
      await this._hass.callService('input_number', 'set_value', { entity_id: entityN, value: val });
      await this._hass.callService('input_button', 'press',     { entity_id: confirmN });

      const btn = this.shadowRoot.getElementById(`save${idx}`);
      if (btn) {
        btn.innerHTML         = `<svg width="13" height="13" viewBox="0 0 24 24" fill="#30D158" style="flex-shrink:0;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg><span>Zapisano</span>`;
        btn.style.color       = '#30D158';
        btn.style.background  = 'rgba(48,209,88,.16)';
        btn.style.borderColor = 'rgba(48,209,88,.45)';
      }

      if (idx === 1) { this._dirty1 = false; this._saving1 = false; this._editing1 = false; }
      else           { this._dirty2 = false; this._saving2 = false; this._editing2 = false; }
      setTimeout(() => this._render(), 1400);

    } catch (err) {
      console.error('GardenMetersCard save error', err);
      if (idx === 1) this._saving1 = false; else this._saving2 = false;
      const btn = this.shadowRoot.getElementById(`save${idx}`);
      if (btn) {
        btn.disabled          = false;
        btn.innerHTML         = `<span>⚠ Błąd</span>`;
        btn.style.color       = '#FF453A';
        btn.style.background  = 'rgba(255,69,58,.1)';
        btn.style.borderColor = 'rgba(255,69,58,.3)';
        setTimeout(() => this._render(), 3000);
      }
    }
  }
}

customElements.define('garden-meters-card', GardenMetersCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'garden-meters-card',
  name:        'Garden Meters Card',
  preview:     false,
  description: 'Liczniki ogrodowe z edycją inline, statusem per-licznik i osobnymi przyciskami zapisu.',
});
