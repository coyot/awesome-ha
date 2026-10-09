/**
 * aha-rain-card — Opady: bieżące, godzinowe, 24h + wykres słupkowy
 *
 * Config:
 *   title:              string  (default 'Opady')
 *   rain_rate_entity:   sensor  – bieżący rain rate (mm/h)
 *   hourly_entity:      sensor  – suma godzinowa (mm)
 *   daily_entity:       sensor  – suma 24h (mm)
 *
 * Registers as: aha-rain-card
 */
(function () {
  'use strict';

  function pad(n) { return String(n).padStart(2, '0'); }
  function isoDate(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
      + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  // ── Rain SVG icon ─────────────────────────────────────────────────────────
  const SVG_RAIN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M6 16a5 5 0 010-10 7 7 0 1114 0 5 5 0 010 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M8 20v1M12 18v2M16 20v1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;

  class AhaRainCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._hass        = null;
      this._config      = {};
      this._history     = [];   // [{hour, maxRate}] — 24 buckets
      this._histLoaded  = false;
      this._lastSig     = '';
    }

    static getStubConfig() {
      return {
        rain_rate_entity: 'sensor.stacja_pogodowa_rain_rate_piezo',
        hourly_entity:    'sensor.stacja_pogodowa_hourly_rain_piezo',
        daily_entity:     'sensor.stacja_pogodowa_24h_rain_piezo',
      };
    }

    setConfig(config) {
      this._config = {
        title:            'Opady',
        rain_rate_entity: 'sensor.stacja_pogodowa_rain_rate_piezo',
        hourly_entity:    'sensor.stacja_pogodowa_hourly_rain_piezo',
        daily_entity:     'sensor.stacja_pogodowa_24h_rain_piezo',
        ...config,
      };
      this._histLoaded = false;
    }

    set hass(hass) {
      const first = !this._hass;
      this._hass = hass;
      const c = this._config;
      const sig = [
        hass.states[c.rain_rate_entity]?.state,
        hass.states[c.hourly_entity]?.state,
        hass.states[c.daily_entity]?.state,
      ].join('|');
      if (!first && sig === this._lastSig && this._histLoaded) return;
      this._lastSig = sig;
      if (!this._histLoaded) this._loadHistory();
      else this._render();
    }

    // ── History fetch ─────────────────────────────────────────────────────

    async _loadHistory() {
      this._histLoaded = true;
      const start = new Date();
      start.setHours(start.getHours() - 24, 0, 0, 0);
      try {
        const resp = await this._hass.callApi('GET',
          `history/period/${isoDate(start)}` +
          `?filter_entity_id=${this._config.rain_rate_entity}` +
          `&minimal_response=true&significant_changes_only=false&no_attributes=true`
        );
        if (Array.isArray(resp) && Array.isArray(resp[0])) {
          this._buildBuckets(resp[0]);
        }
      } catch (e) {
        console.warn('[aha-rain-card] history load failed:', e);
      }
      this._render();
    }

    _buildBuckets(states) {
      // 24 x 1-hour buckets, max rain_rate per bucket
      const now      = new Date();
      const buckets  = Array.from({ length: 24 }, (_, i) => {
        const t = new Date(now);
        t.setHours(t.getHours() - 23 + i, 0, 0, 0);
        return { hour: t.getHours(), ts: t.getTime(), maxRate: 0 };
      });
      for (const s of states) {
        const v = parseFloat(s.state);
        if (isNaN(v) || v < 0) continue;
        const t = new Date(s.last_changed || s.last_updated).getTime();
        // Find matching bucket (floor to hour)
        const bucketIdx = buckets.findIndex((b, i) => {
          const next = i < 23 ? buckets[i + 1].ts : now.getTime() + 1;
          return t >= b.ts && t < next;
        });
        if (bucketIdx >= 0 && v > buckets[bucketIdx].maxRate) {
          buckets[bucketIdx].maxRate = v;
        }
      }
      this._history = buckets;
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    _val(entity) {
      if (!this._hass || !entity) return null;
      const s = this._hass.states[entity];
      if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
      return parseFloat(s.state);
    }

    _fmt(v, decimals = 1) {
      if (v === null) return '–';
      return v.toFixed(decimals);
    }

    // ── SVG bar chart ─────────────────────────────────────────────────────

    _chartSvg() {
      const W = 340, H = 80;
      const PAD_L = 6, PAD_R = 6, PAD_T = 6, PAD_B = 18;
      const chartW = W - PAD_L - PAD_R;
      const chartH = H - PAD_T - PAD_B;
      const buckets = this._history;
      const maxRate = Math.max(...buckets.map(b => b.maxRate), 0.5);

      const barW   = chartW / 24;
      const gap    = barW * 0.18;
      const bw     = barW - gap;
      const nowH   = new Date().getHours();

      let bars = '';
      let labels = '';
      buckets.forEach((b, i) => {
        const x    = PAD_L + i * barW + gap / 2;
        const frac = b.maxRate / maxRate;
        const bh   = Math.max(frac * chartH, b.maxRate > 0 ? 2 : 0);
        const y    = PAD_T + chartH - bh;
        const isCur = b.hour === nowH;
        const alpha = isCur ? '1' : b.maxRate > 0 ? '0.85' : '0.18';
        const fill  = b.maxRate > 0 ? `rgba(48,176,255,${alpha})` : `rgba(255,255,255,0.06)`;

        bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(bh, 2).toFixed(1)}"
          rx="2" fill="${fill}"/>`;

        // Hour label every 6h
        if (b.hour % 6 === 0) {
          labels += `<text x="${(x + bw / 2).toFixed(1)}" y="${H - 2}" text-anchor="middle"
            font-size="8.5" fill="rgba(255,255,255,0.22)" font-family="-apple-system,system-ui,sans-serif"
            font-weight="500">${pad(b.hour)}</text>`;
        }
      });

      // Max label
      const maxLabel = maxRate > 0.5 ? `${maxRate.toFixed(1)} mm/h` : '';

      return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rain-bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#5ac8fa" stop-opacity="1"/>
            <stop offset="100%" stop-color="#0a84ff" stop-opacity="0.85"/>
          </linearGradient>
        </defs>
        ${bars}
        ${labels}
        ${maxLabel ? `<text x="${W - PAD_R}" y="${PAD_T + 8}" text-anchor="end"
          font-size="8" fill="rgba(48,176,255,0.45)" font-family="-apple-system,system-ui,sans-serif">${maxLabel}</text>` : ''}
      </svg>`;
    }

    // ── Render ────────────────────────────────────────────────────────────

    _render() {
      const rate    = this._val(this._config.rain_rate_entity);
      const hourly  = this._val(this._config.hourly_entity);
      const daily   = this._val(this._config.daily_entity);

      const isRaining = rate !== null && rate > 0;
      const pulse     = isRaining
        ? `<style>@keyframes rain-pulse{0%,100%{box-shadow:0 0 0 0px rgba(48,176,255,0.18)}50%{box-shadow:0 0 0 6px rgba(48,176,255,0.18)}}</style>`
        : '';
      const cardExtra  = isRaining ? 'raining' : '';
      const dotAnim    = isRaining ? 'blink' : '';

      this.shadowRoot.innerHTML = `
        <style>
          :host { display:block; font-family:-apple-system,system-ui,sans-serif; }
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
          @keyframes rain-pulse {
            0%,100%{box-shadow:0 0 0 0px rgba(48,176,255,0.18)}
            50%{box-shadow:0 0 0 6px rgba(48,176,255,0.18)}
          }
          .card {
            background: linear-gradient(150deg,#0b1120 0%,#0d1828 100%);
            border-radius: 22px;
            border: 1px solid rgba(255,255,255,0.07);
            padding: 14px 16px 12px;
            overflow: hidden;
            transition: border-color .4s ease, box-shadow .4s ease;
          }
          .card.raining {
            border-color: rgba(48,176,255,0.35);
            animation: rain-pulse 2.5s ease-in-out infinite;
          }

          /* Header */
          .hdr {
            display:flex; align-items:center; justify-content:space-between;
            margin-bottom:14px;
          }
          .hdr-left { display:flex; align-items:center; gap:7px; }
          .icon {
            color: #30B0FF;
            display:flex; align-items:center;
            opacity: ${isRaining ? '1' : '0.5'};
            transition: opacity .4s ease;
          }
          .title {
            font-size:11px; font-weight:600;
            color:rgba(255,255,255,0.35);
            text-transform:uppercase; letter-spacing:.08em;
          }
          .badge {
            display:inline-flex; align-items:center; gap:5px;
            background:rgba(48,176,255,0.12);
            border:1px solid rgba(48,176,255,0.25);
            border-radius:20px; padding:2px 8px 2px 6px;
            font-size:10px; font-weight:700;
            color:#5ac8fa; letter-spacing:.04em;
            text-transform:uppercase;
          }
          .badge-dot {
            width:5px; height:5px; border-radius:50%;
            background:#30B0FF;
            animation: blink 1.2s ease-in-out infinite;
          }

          /* Stats row */
          .stats {
            display:grid; grid-template-columns:1fr 1fr 1fr;
            gap:8px; margin-bottom:14px;
          }
          .stat {
            background:rgba(255,255,255,0.04);
            border:1px solid rgba(255,255,255,0.06);
            border-radius:12px; padding:10px 10px 9px;
            display:flex; flex-direction:column;
          }
          .stat-val {
            font-size:22px; font-weight:700;
            letter-spacing:-0.8px; line-height:1;
            color:rgba(255,255,255,0.90);
            font-variant-numeric:tabular-nums;
          }
          .stat-val.active { color:#5ac8fa; }
          .stat-unit {
            font-size:10px; font-weight:500;
            color:rgba(255,255,255,0.30);
            margin-top:1px; letter-spacing:.02em;
          }
          .stat-lbl {
            font-size:9.5px; font-weight:600;
            color:rgba(255,255,255,0.22);
            margin-top:5px; text-transform:uppercase;
            letter-spacing:.06em;
          }

          /* Chart */
          .chart-wrap {
            margin: 0 -4px;
          }
          .chart-lbl {
            font-size:9px; font-weight:500;
            color:rgba(255,255,255,0.18);
            text-align:right; margin-bottom:2px;
            letter-spacing:.03em;
          }
        </style>
        <div class="card ${cardExtra}">
          <div class="hdr">
            <div class="hdr-left">
              <span class="icon">${SVG_RAIN}</span>
              <span class="title">${this._config.title}</span>
            </div>
            ${isRaining
              ? `<div class="badge"><div class="badge-dot"></div>Pada</div>`
              : `<span style="font-size:10px;color:rgba(255,255,255,0.18);font-weight:500;">Bez opadów</span>`
            }
          </div>

          <div class="stats">
            <div class="stat">
              <span class="stat-val ${isRaining ? 'active' : ''}">${this._fmt(rate)}</span>
              <span class="stat-unit">mm/h</span>
              <span class="stat-lbl">Teraz</span>
            </div>
            <div class="stat">
              <span class="stat-val">${this._fmt(hourly)}</span>
              <span class="stat-unit">mm</span>
              <span class="stat-lbl">Godzina</span>
            </div>
            <div class="stat">
              <span class="stat-val">${this._fmt(daily)}</span>
              <span class="stat-unit">mm</span>
              <span class="stat-lbl">24h</span>
            </div>
          </div>

          <div class="chart-wrap">
            <div class="chart-lbl">Rain rate · ostatnie 24h</div>
            ${this._chartSvg()}
          </div>
        </div>`;
    }

    getCardSize() { return 4; }
  }

  if (!customElements.get('aha-rain-card')) {
    customElements.define('aha-rain-card', AhaRainCard);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.find(c => c.type === 'aha-rain-card')) {
    window.customCards.push({
      type: 'aha-rain-card',
      name: 'AHA Rain Card',
      description: 'Opady: bieżące mm/h, godzinowe, 24h + wykres słupkowy rain rate',
    });
  }
})();
