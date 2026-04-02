/**
 * szambo-predict-card.js — predykcja wywozu szamba, styl Apple Home (P2)
 *
 * INSTALACJA:
 *   1. Skopiuj do /config/www/szambo-predict-card.js
 *   2. Lovelace → Manage Resources → /local/szambo-predict-card.js (JavaScript Module)
 *
 * UŻYCIE:
 *   type: custom:szambo-predict-card
 *   entity_current:  sensor.szambo_zuzycie
 *   entity_rate:     sensor.szambo_przyrost_dzienny
 *   capacity:        10       # m³, domyślnie 10
 */

class SzamboPredictCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity_current) throw new Error('[szambo-predict-card] Wymagane: entity_current');
    if (!config.entity_rate)    throw new Error('[szambo-predict-card] Wymagane: entity_rate');
    this._config = {
      entity_current: config.entity_current,
      entity_rate:    config.entity_rate,
      capacity:       config.capacity     ?? 10,
      warn_observe:   config.warn_observe ?? 7,
      warn_plan:      config.warn_plan    ?? 9,
    };
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() { return 2; }

  _val(entityId) {
    const v = parseFloat(this._hass.states[entityId]?.state);
    return isNaN(v) ? 0 : v;
  }

  _render() {
    if (!this._hass) return;

    const cap     = this._config.capacity;
    const current = this._val(this._config.entity_current);
    const rate    = this._val(this._config.entity_rate);

    const remaining = Math.max(cap - current, 0);
    const days      = rate > 0 ? remaining / rate : null;
    const weekly    = rate * 7;

    const fillPct   = Math.min(Math.round((current / cap) * 100), 100);

    /* data wywozu */
    let dateStr  = null;
    let dayName  = null;
    let daysInt  = null;
    let daysLabel = '';
    if (days !== null && days > 0) {
      daysInt  = Math.round(days);
      const d  = new Date();
      d.setDate(d.getDate() + daysInt);
      const day    = d.getDate();
      const months = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
      const weekdays = ['niedziela','poniedziałek','wtorek','środa','czwartek','piątek','sobota'];
      dateStr  = `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
      dayName  = weekdays[d.getDay()];
      daysLabel = daysInt === 1 ? 'dzień' : daysInt < 5 ? 'dni' : 'dni';
    }

    /* stan -->  brak danych / pełne / ok */
    const noData  = rate <= 0;
    const isFull  = days !== null && days <= 0;

    const warnObserve = this._config.warn_observe;
    const warnPlan    = this._config.warn_plan;
    const isPlan    = current >= warnPlan;
    const isObserve = !isPlan && current >= warnObserve;
    const barColor  = isPlan    ? '#FF3B30'
                    : isObserve ? '#FF9500'
                    :             '#34C759';
    const dotBorder = barColor;
    const accentClr = noData || isFull ? '#FF3B30'
                    : isPlan            ? '#FF3B30'
                    : isObserve         ? '#FF9500'
                    :                     '#5AC8FA';

    const fmt = v => v.toFixed(3).replace('.', ',');
    const fmt2 = v => v.toFixed(2).replace('.', ',');

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

        .top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .top-left {}
        .eyebrow {
          font-size: 11px; color: #636366;
          margin-bottom: 4px;
        }
        .countdown {
          display: flex; align-items: baseline; gap: 5px; line-height: 1;
        }
        .days-num {
          font-size: 46px; font-weight: 600;
          color: #fff; letter-spacing: -2px;
        }
        .days-lbl {
          font-size: 18px; color: #636366;
        }
        .date-row {
          display: flex; align-items: baseline; gap: 6px;
          margin-top: 5px;
        }
        .date-dayname {
          font-size: 14px; font-weight: 600;
          color: ${accentClr};
          text-transform: capitalize;
        }
        .date-str {
          font-size: 12px;
          color: #8E8E93;
        }
        .no-data {
          font-size: 20px; font-weight: 600; color: #FF3B30;
          margin-top: 6px;
        }

        .icon-box {
          width: 52px; height: 52px; border-radius: 16px;
          background: #1C2A3A;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* pasek postępu */
        .progress-section { margin-bottom: 14px; }
        .progress-labels {
          display: flex; justify-content: space-between;
          margin-bottom: 5px;
        }
        .progress-labels span { font-size: 10px; color: #636366; }
        .progress-labels .today { color: ${barColor}; font-weight: 500; }

        .track {
          height: 5px; background: #3A3A3C; border-radius: 3px;
          position: relative; margin-bottom: 4px;
        }
        .track-fill {
          height: 100%;
          width: ${fillPct}%;
          background: linear-gradient(to right, #34C759, ${barColor});
          border-radius: 3px;
        }
        .track-dot {
          position: absolute;
          top: 50%; left: ${fillPct}%;
          transform: translate(-50%, -50%);
          width: 13px; height: 13px; border-radius: 50%;
          background: #fff;
          border: 2.5px solid ${dotBorder};
        }

        /* metryki */
        .metrics {
          display: flex; gap: 8px;
        }
        .metric {
          flex: 1;
          background: #3A3A3C;
          border-radius: 10px;
          padding: 9px 11px;
        }
        .metric-label {
          font-size: 10px; color: #636366; margin-bottom: 3px;
        }
        .metric-val {
          font-size: 15px; font-weight: 500; color: #fff;
        }
        .metric-unit {
          font-size: 10px; color: #636366; margin-left: 1px;
        }
      </style>

      <div class="card">

        <div class="top">
          <div class="top-left">
            <div class="eyebrow">następny wywóz szamba</div>
            ${noData ? `
              <div class="no-data">Brak danych</div>
              <div style="font-size:12px;color:#636366;margin-top:4px;">Za mało historii zużycia</div>
            ` : isFull ? `
              <div class="no-data">Szambo pełne!</div>
              <div style="font-size:12px;color:#FF6B6B;margin-top:4px;">Wywóz natychmiast</div>
            ` : `
              <div class="countdown">
                <span class="days-num">${daysInt}</span>
                <span class="days-lbl">${daysLabel}</span>
              </div>
              <div class="date-row">
                <span class="date-dayname">📅 ${dayName}</span>
                <span class="date-str">${dateStr}</span>
              </div>
            `}
          </div>
          <div class="icon-box">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="${accentClr}">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM7 12h5v5H7z"/>
            </svg>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-labels">
            <span>ostatni wywóz · 0 m³</span>
            <span class="today">dziś · ${fmt2(current)} m³</span>
            <span>${cap} m³</span>
          </div>
          <div class="track">
            <div class="track-fill"></div>
            <div class="track-dot"></div>
          </div>
        </div>

        <div class="metrics">
          <div class="metric">
            <div class="metric-label">dziennie</div>
            <div class="metric-val">${fmt(rate)}<span class="metric-unit"> m³</span></div>
          </div>
          <div class="metric">
            <div class="metric-label">tygodniowo</div>
            <div class="metric-val">${fmt2(weekly)}<span class="metric-unit"> m³</span></div>
          </div>
          <div class="metric">
            <div class="metric-label">pozostało</div>
            <div class="metric-val">${fmt2(remaining)}<span class="metric-unit"> m³</span></div>
          </div>
        </div>

      </div>
    `;
  }
}

customElements.define('szambo-predict-card', SzamboPredictCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'szambo-predict-card',
  name:        'Szambo Predict Card',
  preview:     false,
  description: 'Predykcja wywozu szamba z countdown i paskiem postępu.',
});