/**
 * szambo-predict-card.js — predykcja wywozu szamba, styl Apple Home
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
 *   tap_action:              # opcjonalnie
 *     action: more-info
 */

const DEFAULTS = {
  CAPACITY: 10,
  WARN_OBSERVE: 7,
  WARN_PLAN: 9,
};

const COLORS = {
  GREEN: '#34C759',
  ORANGE: '#FF9500',
  RED: '#FF3B30',
  BLUE: '#5AC8FA',
};

class SzamboPredictCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._initialized = false;
  }

  setConfig(config) {
    if (!config.entity_current) {
      throw new Error('[szambo-predict-card] Wymagane: entity_current');
    }
    if (!config.entity_rate) {
      throw new Error('[szambo-predict-card] Wymagane: entity_rate');
    }

    this._config = {
      entity_current: config.entity_current,
      entity_rate: config.entity_rate,
      capacity: config.capacity ?? DEFAULTS.CAPACITY,
      warn_observe: config.warn_observe ?? DEFAULTS.WARN_OBSERVE,
      warn_plan: config.warn_plan ?? DEFAULTS.WARN_PLAN,
      tap_action: config.tap_action ?? { action: 'more-info' },
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this._initialized = true;
      this._setupCard();
    }
    this._render();
  }

  getCardSize() {
    return 2;
  }

  _val(entityId) {
    const entity = this._hass?.states?.[entityId];
    if (!entity) return null;
    const v = parseFloat(entity.state);
    return isNaN(v) ? null : v;
  }

  _handleTap(e) {
    e.stopPropagation();
    const action = this._config.tap_action?.action ?? 'more-info';

    if (action === 'none') return;

    const event = new Event('hass-action', {
      bubbles: true,
      composed: true,
    });
    event.detail = {
      config: {
        ...this._config.tap_action,
        entity: this._config.entity_current,
      },
      action: action,
    };
    this.dispatchEvent(event);
  }

  _setupCard() {
    const style = document.createElement('style');
    style.textContent = this._getStyles();
    this.shadowRoot.appendChild(style);

    const card = document.createElement('div');
    card.className = 'card';
    card.addEventListener('click', (e) => this._handleTap(e));
    this.shadowRoot.appendChild(card);
  }

  _getPolishPluralDays(num) {
    if (num === 1) return 'dzień';
    const mod10 = num % 10;
    const mod100 = num % 100;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return 'dni';
    }
    return 'dni';
  }

  _formatDate(daysToAdd) {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);

    const dayName = new Intl.DateTimeFormat('pl-PL', { weekday: 'long' }).format(d);
    const dateStr = new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);

    return { dayName, dateStr };
  }

  _render() {
    if (!this._hass || !this._initialized) return;

    const card = this.shadowRoot.querySelector('.card');
    if (!card) return;

    const cap = this._config.capacity;
    const current = this._val(this._config.entity_current);
    const rate = this._val(this._config.entity_rate);

    // Handle missing data
    if (current === null || rate === null) {
      card.innerHTML = this._renderError('Brak danych z czujników', 'Sprawdź konfigurację encji');
      return;
    }

    const remaining = Math.max(cap - current, 0);
    const days = rate > 0 ? remaining / rate : null;
    const weekly = rate * 7;
    const fillPct = Math.min(Math.max(Math.round((current / cap) * 100), 0), 100);

    // Date calculation
    let dateStr = null;
    let dayName = null;
    let daysInt = null;
    let daysLabel = '';

    if (days !== null && days > 0) {
      daysInt = Math.round(days);
      const formatted = this._formatDate(daysInt);
      dayName = formatted.dayName;
      dateStr = formatted.dateStr;
      daysLabel = this._getPolishPluralDays(daysInt);
    }

    // State determination
    const noData = rate <= 0 || days === null;
    const isFull = days !== null && days <= 0;

    const isPlan = current >= this._config.warn_plan;
    const isObserve = !isPlan && current >= this._config.warn_observe;

    const barColor = isPlan ? COLORS.RED : isObserve ? COLORS.ORANGE : COLORS.GREEN;
    const accentClr = noData || isFull ? COLORS.RED
                    : isPlan ? COLORS.RED
                    : isObserve ? COLORS.ORANGE
                    : COLORS.BLUE;

    const fmt = v => v.toFixed(3).replace('.', ',');
    const fmt2 = v => v.toFixed(2).replace('.', ',');

    card.innerHTML = this._renderContent({
      noData, isFull, daysInt, daysLabel, dayName, dateStr,
      accentClr, barColor, fillPct, current, cap, rate, weekly, remaining, fmt, fmt2
    });
  }

  _renderError(title, subtitle) {
    return `
      <div class="top">
        <div class="top-left">
          <div class="eyebrow">następny wywóz szamba</div>
          <div class="no-data">${title}</div>
          <div style="font-size:12px;color:#636366;margin-top:4px;">${subtitle}</div>
        </div>
        <div class="icon-box">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="${COLORS.RED}">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
      </div>
    `;
  }

  _renderContent({ noData, isFull, daysInt, daysLabel, dayName, dateStr, accentClr, barColor, fillPct, current, cap, rate, weekly, remaining, fmt, fmt2 }) {
    return `
      <div class="top">
        <div class="top-left">
          <div class="eyebrow">następny wywóz szamba</div>
          ${noData ? `
            <div class="no-data">Brak danych</div>
            <div class="subtitle">Za mało historii zużycia</div>
          ` : isFull ? `
            <div class="no-data">Szambo pełne!</div>
            <div class="subtitle alert">Wywóz natychmiast</div>
          ` : `
            <div class="countdown">
              <span class="days-num">${daysInt}</span>
              <span class="days-lbl">${daysLabel}</span>
            </div>
            <div class="date-row">
              <span class="date-dayname" style="color: ${accentClr};">📅 ${dayName}</span>
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
          <span class="today" style="color: ${barColor};">dziś · ${fmt2(current)} m³</span>
          <span>${cap} m³</span>
        </div>
        <div class="track">
          <div class="track-fill" style="width: ${fillPct}%; background: linear-gradient(to right, ${COLORS.GREEN}, ${barColor});"></div>
          <div class="track-dot" style="left: ${fillPct}%; border-color: ${barColor};"></div>
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
    `;
  }

  _getStyles() {
    return `
      :host {
        display: block;
      }
      .card {
        background: #2C2C2E;
        border-radius: 18px;
        padding: 16px 18px;
        box-sizing: border-box;
        font-family: -apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif;
        -webkit-font-smoothing: antialiased;
        cursor: pointer;
        transition: transform 0.1s ease, opacity 0.1s ease;
      }
      .card:active {
        transform: scale(0.98);
        opacity: 0.9;
      }

      .top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .eyebrow {
        font-size: 11px;
        color: #636366;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .countdown {
        display: flex;
        align-items: baseline;
        gap: 5px;
        line-height: 1;
      }
      .days-num {
        font-size: 46px;
        font-weight: 600;
        color: #fff;
        letter-spacing: -2px;
        transition: all 0.3s ease;
      }
      .days-lbl {
        font-size: 18px;
        color: #636366;
      }
      .date-row {
        display: flex;
        align-items: baseline;
        gap: 6px;
        margin-top: 5px;
      }
      .date-dayname {
        font-size: 14px;
        font-weight: 600;
        text-transform: capitalize;
        transition: color 0.3s ease;
      }
      .date-str {
        font-size: 12px;
        color: #8E8E93;
      }
      .no-data {
        font-size: 20px;
        font-weight: 600;
        color: ${COLORS.RED};
        margin-top: 6px;
      }
      .subtitle {
        font-size: 12px;
        color: #636366;
        margin-top: 4px;
      }
      .subtitle.alert {
        color: #FF6B6B;
      }
      .icon-box {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        background: #1C2A3A;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.2s ease;
      }

      /* pasek postępu */
      .progress-section {
        margin-bottom: 14px;
      }
      .progress-labels {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      .progress-labels span {
        font-size: 10px;
        color: #636366;
      }
      .progress-labels .today {
        font-weight: 500;
        transition: color 0.3s ease;
      }
      .track {
        height: 5px;
        background: #3A3A3C;
        border-radius: 3px;
        position: relative;
        margin-bottom: 4px;
        overflow: hidden;
      }
      .track-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.5s ease, background 0.3s ease;
      }
      .track-dot {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background: #fff;
        border: 2.5px solid;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: left 0.5s ease, border-color 0.3s ease;
      }

      /* metryki */
      .metrics {
        display: flex;
        gap: 8px;
      }
      .metric {
        flex: 1;
        background: #3A3A3C;
        border-radius: 10px;
        padding: 9px 11px;
        transition: transform 0.2s ease;
      }
      .metric:hover {
        transform: translateY(-1px);
      }
      .metric-label {
        font-size: 10px;
        color: #636366;
        margin-bottom: 3px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .metric-val {
        font-size: 15px;
        font-weight: 500;
        color: #fff;
      }
      .metric-unit {
        font-size: 10px;
        color: #636366;
        margin-left: 1px;
      }
    `;
  }
}

customElements.define('aha-szambo-predict-card', SzamboPredictCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-szambo-predict-card',
  name:        'Szambo Predict Card',
  preview:     false,
  description: 'Predykcja wywozu szamba z countdown i paskiem postępu.',
});