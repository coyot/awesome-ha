/**
 * aha-forecast-card  — 24h scrollable forecast chart
 * Replaces cards/16hr_forecast.yaml (button-card version)
 * Registers as: aha-forecast-card  (legacy: forecast-card)
 */
(function () {
  'use strict';

  // ── Colour helpers ───────────────────────────────────────────────────────────

  function tempColor(t) {
    if (t === null || t === undefined) return '#aaaaaa';
    if (t <= -20) return '#9B59B6';
    if (t <= -10) return '#6C5CE7';
    if (t <=   0) return '#4A90D9';
    if (t <=   5) return '#5DADE2';
    if (t <=  10) return '#48C9B0';
    if (t <=  15) return '#52BE80';
    if (t <=  18) return '#A9DFBF';
    if (t <=  22) return '#F9E79F';
    if (t <=  25) return '#F5CBA7';
    if (t <=  28) return '#F0A500';
    if (t <=  32) return '#E74C3C';
    if (t <=  36) return '#C0392B';
    return '#922B21';
  }

  function bgAccentFromTemp(t) {
    if (t === null || t === undefined) return { glow: 'rgba(90,160,255,0.16)', accent: '#5ab0ff' };
    if (t <=  0) return { glow: 'rgba(74,144,217,0.20)',  accent: '#4A90D9' };
    if (t <= 10) return { glow: 'rgba(72,201,176,0.18)',  accent: '#48C9B0' };
    if (t <= 18) return { glow: 'rgba(82,190,128,0.18)',  accent: '#52BE80' };
    if (t <= 25) return { glow: 'rgba(245,200,80,0.18)',  accent: '#F0C040' };
    if (t <= 32) return { glow: 'rgba(231,76,60,0.20)',   accent: '#E87040' };
    return              { glow: 'rgba(192,57,43,0.22)',   accent: '#C0392B' };
  }

  // ── Weather labels ───────────────────────────────────────────────────────────

  const WX = {
    'sunny': 'Słonecznie', 'clear-night': 'Bezchmurnie',
    'partlycloudy': 'Zm. zachmurzenie', 'cloudy': 'Zachmurzenie',
    'rainy': 'Deszcz', 'pouring': 'Ulewa', 'snowy': 'Śnieg',
    'snowy-rainy': 'Deszcz ze śniegiem', 'hail': 'Grad',
    'lightning': 'Burza', 'lightning-rainy': 'Burza z deszczem',
    'fog': 'Mgła', 'windy': 'Wietrzno', 'windy-variant': 'Wietrzno',
    'exceptional': 'Wyjątkowo',
  };

  // ── SVG icon builder ─────────────────────────────────────────────────────────

  function buildIcon(st) {
    const s = '#F5A623', cl = '#6a7a9a', r = '#5ab0ff', sn = '#aee4f8', b = '#FFD060', m = '#c8d8f0';
    const rays = [0, 60, 120, 180, 240, 300].map(function (d) {
      const a = d * Math.PI / 180;
      return '<line x1="' + (Math.cos(a) * 5.5).toFixed(1) + '" y1="' + (Math.sin(a) * 5.5).toFixed(1)
        + '" x2="' + (Math.cos(a) * 7.8).toFixed(1) + '" y2="' + (Math.sin(a) * 7.8).toFixed(1)
        + '" stroke="' + s + '" stroke-width="1.5" stroke-linecap="round"/>';
    }).join('');
    if (st === 'sunny')
      return '<circle r="4" fill="' + s + '"/>' + rays;
    if (st === 'clear-night')
      return '<path d="M0-7.5a7.5 7.5 0 000 15 5.5 5.5 0 010-15z" fill="' + m + '"/>';
    if (st === 'partlycloudy')
      return '<circle cx="-2" cy="-2" r="3.5" fill="' + s + '" opacity=".9"/>'
        + '<path d="M-5.5 4a4.5 4.5 0 019 0H-5.5z" fill="' + cl + '"/>'
        + '<circle cx="-0.5" cy="1" r="3" fill="' + cl + '"/>';
    if (st === 'rainy' || st === 'pouring')
      return '<path d="M-6 0a5 5 0 0110 0H-6z" fill="' + cl + '"/>'
        + '<circle cx="-1" cy="-2.5" r="3" fill="' + cl + '"/>'
        + '<line x1="-4" y1="5" x2="-5" y2="9" stroke="' + r + '" stroke-width="1.5" stroke-linecap="round"/>'
        + '<line x1="0" y1="5" x2="-1" y2="9" stroke="' + r + '" stroke-width="1.5" stroke-linecap="round"/>'
        + '<line x1="4" y1="5" x2="3" y2="9" stroke="' + r + '" stroke-width="1.5" stroke-linecap="round"/>';
    if (st === 'snowy' || st === 'snowy-rainy') {
      const arms = [0, 60, 120].map(function (d) {
        const a = d * Math.PI / 180, r2 = 7;
        const x1 = (Math.cos(a) * r2).toFixed(1), y1 = (Math.sin(a) * r2).toFixed(1);
        const x2 = (-Math.cos(a) * r2).toFixed(1), y2 = (-Math.sin(a) * r2).toFixed(1);
        const mx1 = (Math.cos(a) * 4.2).toFixed(1), my1 = (Math.sin(a) * 4.2).toFixed(1);
        const mx2 = (-Math.cos(a) * 4.2).toFixed(1), my2 = (-Math.sin(a) * 4.2).toFixed(1);
        const pa = a + Math.PI / 2;
        const bx = (Math.cos(pa) * 2).toFixed(1), by = (Math.sin(pa) * 2).toFixed(1);
        return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + sn + '" stroke-width="1.4" stroke-linecap="round"/>'
          + '<line x1="' + (parseFloat(mx1) + parseFloat(bx)).toFixed(1) + '" y1="' + (parseFloat(my1) + parseFloat(by)).toFixed(1) + '" x2="' + (parseFloat(mx1) - parseFloat(bx)).toFixed(1) + '" y2="' + (parseFloat(my1) - parseFloat(by)).toFixed(1) + '" stroke="' + sn + '" stroke-width="1" stroke-linecap="round"/>'
          + '<line x1="' + (parseFloat(mx2) + parseFloat(bx)).toFixed(1) + '" y1="' + (parseFloat(my2) + parseFloat(by)).toFixed(1) + '" x2="' + (parseFloat(mx2) - parseFloat(bx)).toFixed(1) + '" y2="' + (parseFloat(my2) - parseFloat(by)).toFixed(1) + '" stroke="' + sn + '" stroke-width="1" stroke-linecap="round"/>';
      }).join('');
      return arms + '<circle r="1.5" fill="' + sn + '"/>';
    }
    if (st === 'lightning' || st === 'lightning-rainy')
      return '<path d="M-6-1a5 5 0 0110 0H-6z" fill="' + cl + '"/>'
        + '<polygon points="1,-1 -3,6 0,6 -2,11" fill="' + b + '"/>';
    if (st === 'fog')
      return '<line x1="-7" y1="-4" x2="7" y2="-4" stroke="' + cl + '" stroke-width="2" stroke-linecap="round" opacity=".7"/>'
        + '<line x1="-5" y1="0" x2="5" y2="0" stroke="' + cl + '" stroke-width="2" stroke-linecap="round" opacity=".55"/>'
        + '<line x1="-7" y1="4" x2="4" y2="4" stroke="' + cl + '" stroke-width="2" stroke-linecap="round" opacity=".4"/>';
    if (st === 'windy' || st === 'windy-variant')
      return '<path d="M-7-4 Q0-8 7-4" stroke="' + r + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
        + '<path d="M-7 0 Q0-4 7 0" stroke="' + r + '" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".7"/>'
        + '<path d="M-7 4 Q0 1 5 4" stroke="' + r + '" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".45"/>';
    // cloudy / default
    return '<path d="M-6 3a5 5 0 0110 0H-6z" fill="' + cl + '"/>'
      + '<circle cx="-1" cy="0" r="3.5" fill="' + cl + '"/>'
      + '<circle cx="4" cy="1" r="2.5" fill="' + cl + '"/>';
  }

  // ── Bezier curve ─────────────────────────────────────────────────────────────

  function bezierPath(pts) {
    if (!pts.length) return '';
    let d = 'M ' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], c = pts[i];
      const mx = ((p.x + c.x) / 2).toFixed(1);
      d += ' C ' + mx + ' ' + p.y.toFixed(1) + ',' + mx + ' ' + c.y.toFixed(1) + ',' + c.x.toFixed(1) + ' ' + c.y.toFixed(1);
    }
    return d;
  }

  // ── Card element ─────────────────────────────────────────────────────────────

  class ForecastCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._hass = null;
      this._config = {};
      this._tooltipVisible = {}; // index → bool (for mobile toggle)
    }

    static getStubConfig() {
      return {
        forecast_entity: 'sensor.forecast_hourly_json',
        weather_entity: 'weather.forecast_home',
        temp_entity: 'sensor.stacja_pogodowa_outdoor_temperature',
      };
    }

    setConfig(config) {
      this._config = {
        forecast_entity: 'sensor.forecast_hourly_json',
        weather_entity: 'weather.forecast_home',
        temp_entity: 'sensor.stacja_pogodowa_outdoor_temperature',
        ...config,
      };
    }

    set hass(hass) {
      this._hass = hass;
      this._render();
    }

    // ── Data helpers ───────────────────────────────────────────────────────────

    _slots() {
      const hass = this._hass;
      const cfg = this._config;
      const fcEntity = hass.states[cfg.forecast_entity];
      const rawFc = fcEntity && fcEntity.attributes && fcEntity.attributes.forecast;
      const fcAll = Array.isArray(rawFc) ? rawFc : [];

      const wxNow = (hass.states[cfg.weather_entity] || {}).state || 'cloudy';
      const tNowStr = (hass.states[cfg.temp_entity] || {}).state;
      const tNow = tNowStr !== undefined ? parseFloat(tNowStr) : null;

      const slots = fcAll
        .filter(function (_, i) { return i % 2 === 0; })
        .slice(0, 12)
        .map(function (fc) {
          const dt = new Date(fc.datetime);
          const hh = String(dt.getHours()).padStart(2, '0');
          const temp = typeof fc.temperature === 'number' ? fc.temperature : null;
          const prec = typeof fc.precipitation === 'number' ? Math.max(0, fc.precipitation) : 0;
          const cond = fc.condition || 'cloudy';
          const isSnow = cond === 'snowy' || cond === 'snowy-rainy';
          return { hh, temp, prec, cond, isSnow };
        });

      if (slots.length > 0) {
        slots[0].cond = wxNow;
        if (tNow !== null && !isNaN(tNow)) slots[0].temp = tNow;
      }

      return { slots, wxNow, tNow };
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    _render() {
      if (!this._hass) return;

      const BG1 = '#0e1a2e', BG2 = '#091220';
      const RAIN_COL = '#4da8ff', SNOW_COL = '#aee4f8';

      const { slots, wxNow } = this._slots();
      const wxLabel = WX[wxNow] || wxNow;

      if (slots.length === 0) {
        this.shadowRoot.innerHTML = `
          <style>:host{display:block}</style>
          <div style="background:linear-gradient(145deg,${BG1},${BG2});border-radius:22px;padding:24px 20px;font-family:-apple-system,system-ui,sans-serif;">
            <div style="font-size:13px;color:rgba(255,255,255,0.35);text-align:center;line-height:1.7;">
              Brak prognozy.<br>Sprawdź ${this._config.forecast_entity}<br>w Developer Tools → States.
            </div>
          </div>`;
        return;
      }

      const allT = slots.map(s => s.temp).filter(t => t !== null);
      const tMin = allT.length ? Math.min(...allT) : 0;
      const tMax = allT.length ? Math.max(...allT) : 20;
      const tMid = (tMin + tMax) / 2;
      const palette = bgAccentFromTemp(tMid);
      const GLOW = palette.glow;
      const tHiColor = tempColor(tMax);
      const tLoColor = tempColor(tMin);

      // ── Layout constants ───────────────────────────────────────────────────
      const COL_W  = 54;
      const SVG_PX = COL_W * slots.length;
      const ICON_Y  = 8;
      const HOUR_Y  = 30;
      const TEMP_Y  = 46;
      const CURVE_Y = 58;
      const CURVE_H = 44;
      const BAR_MAX = 14;
      const BAR_Y   = CURVE_Y + CURVE_H + 4;
      const MM_Y    = BAR_Y + BAR_MAX + 9;
      const SVG_H   = MM_Y + 2;

      const cx = i => i * COL_W + COL_W / 2;

      // ── Temperature curve ──────────────────────────────────────────────────
      const tRngPad = (tMax - tMin) || 1;
      const tMinP   = tMin - tRngPad * 0.15;
      const tMaxP   = tMax + tRngPad * 0.15;
      const tRng2   = tMaxP - tMinP;

      const ty = t => t === null
        ? CURVE_Y + CURVE_H / 2
        : CURVE_Y + CURVE_H - ((t - tMinP) / tRng2) * CURVE_H;

      const pts = slots.map((s, i) => ({ x: cx(i), y: ty(s.temp), t: s.temp }));
      const curve  = bezierPath(pts);
      const first  = pts[0];
      const last   = pts[pts.length - 1];
      const aBottom = (BAR_Y + BAR_MAX).toFixed(1);
      const area   = curve
        + ' L ' + last.x.toFixed(1) + ' ' + aBottom
        + ' L ' + first.x.toFixed(1) + ' ' + aBottom + ' Z';

      // ── Gradients ──────────────────────────────────────────────────────────
      let gradStops = '';
      slots.forEach((s, i) => {
        const pct = slots.length > 1 ? ((i / (slots.length - 1)) * 100).toFixed(1) : '50';
        gradStops += `<stop offset="${pct}%" stop-color="${tempColor(s.temp)}"/>`;
      });
      const fillCol = tempColor(tMid);

      const maxPrec = Math.max(...slots.map(s => s.prec), 0.01);
      const hasRain = slots.some(s => s.prec > 0 && !s.isSnow);
      const hasSnow = slots.some(s => s.prec > 0 && s.isSnow);

      // ── SVG columns (static markup, no inline handlers) ────────────────────
      let cols = '';
      slots.forEach((s, i) => {
        const x   = cx(i);
        const now = i === 0;
        const bh  = s.prec > 0 ? Math.max(2, (s.prec / maxPrec) * BAR_MAX) : 0;
        const tS  = s.temp !== null ? s.temp.toFixed(0) + '°' : '—';
        const tC  = tempColor(s.temp);
        const barCol = s.isSnow ? SNOW_COL : RAIN_COL;

        if (now) {
          cols += `<rect x="${(x - COL_W / 2).toFixed(1)}" y="2" width="${COL_W}" height="${SVG_H - 4}" rx="11" fill="rgba(255,255,255,0.05)"/>`;
        }

        cols += `<g transform="translate(${x.toFixed(1)},${(ICON_Y + 2).toFixed(1)})" opacity="${now ? 1 : 0.80}">${buildIcon(s.cond)}</g>`;

        const hCol = now ? '#ffffff' : 'rgba(255,255,255,0.32)';
        const hTxt = now ? 'teraz' : s.hh + ':00';
        cols += `<text x="${x.toFixed(1)}" y="${HOUR_Y}" text-anchor="middle" font-family="-apple-system,system-ui,sans-serif" font-size="9" font-weight="500" fill="${hCol}">${hTxt}</text>`;

        cols += `<text x="${x.toFixed(1)}" y="${TEMP_Y}" text-anchor="middle" font-family="-apple-system,system-ui,sans-serif" font-size="11" font-weight="${now ? 700 : 600}" fill="${tC}">${tS}</text>`;

        if (bh > 0) {
          cols += `<rect x="${(x - 8).toFixed(1)}" y="${(BAR_Y + BAR_MAX - bh).toFixed(1)}" width="16" height="${bh.toFixed(1)}" rx="3" fill="${barCol}" opacity="${s.isSnow ? .65 : .60}"/>`;
          cols += `<text x="${x.toFixed(1)}" y="${MM_Y}" text-anchor="middle" font-family="-apple-system,system-ui,sans-serif" font-size="7" font-weight="500" fill="${barCol}" opacity=".80">${s.prec.toFixed(1)}</text>`;
        }

        // Tooltip hit area — identified by data-col attribute, handled by addEventListener
        const dotPY  = pts[i].y;
        const hasPrec = s.prec >= 0.05;
        const TW = 38, TH = hasPrec ? 28 : 17;
        const tipY = dotPY - TH - 8 < 2 ? dotPY + 10 : dotPY - TH - 8;
        const tipX = Math.max(TW / 2 + 2, Math.min(SVG_PX - TW / 2 - 2, x));

        cols += `<g class="fc-col" data-col="${i}" data-tip-visible="0">`;
        // Invisible hit rect covering whole column
        cols += `<rect class="fc-hit" x="${(x - COL_W / 2).toFixed(1)}" y="0" width="${COL_W}" height="${SVG_H}" fill="transparent" style="cursor:crosshair"/>`;
        // Tooltip group — hidden initially via opacity class
        cols += `<g class="fc-tip" style="opacity:0;transition:opacity .12s ease" pointer-events="none">`;
        cols += `<circle cx="${x.toFixed(1)}" cy="${dotPY.toFixed(1)}" r="6" fill="${tC}" opacity=".22"/>`;
        cols += `<circle cx="${x.toFixed(1)}" cy="${dotPY.toFixed(1)}" r="3" fill="${tC}"/>`;
        cols += `<rect x="${(tipX - TW / 2).toFixed(1)}" y="${tipY.toFixed(1)}" width="${TW}" height="${TH}" rx="5" fill="rgba(8,14,30,0.96)" stroke="rgba(255,255,255,0.14)" stroke-width="0.8"/>`;
        cols += `<text x="${tipX.toFixed(1)}" y="${(tipY + 11).toFixed(1)}" text-anchor="middle" font-family="-apple-system,system-ui,sans-serif" font-size="10.5" font-weight="700" fill="${tC}">${tS}</text>`;
        if (hasPrec) {
          cols += `<text x="${tipX.toFixed(1)}" y="${(tipY + 22).toFixed(1)}" text-anchor="middle" font-family="-apple-system,system-ui,sans-serif" font-size="7.5" font-weight="500" fill="${barCol}">${s.prec.toFixed(1)} mm</text>`;
        }
        cols += `</g></g>`;
      });

      const dotX = first.x.toFixed(1);
      const dotY = first.y.toFixed(1);
      const dotC = tempColor(first.t);

      const legendHtml = (hasRain || hasSnow) ? `
        <div style="padding:4px 18px 6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          ${hasRain ? `<div style="display:flex;align-items:center;gap:4px;">
            <div style="width:10px;height:10px;border-radius:2px;background:#4da8ff;opacity:.60;"></div>
            <span style="font-size:10px;color:rgba(255,255,255,0.28);">deszcz (mm)</span>
          </div>` : ''}
          ${hasSnow ? `<div style="display:flex;align-items:center;gap:4px;">
            <div style="width:10px;height:10px;border-radius:2px;background:#aee4f8;opacity:.65;"></div>
            <span style="font-size:10px;color:rgba(255,255,255,0.28);">śnieg (mm)</span>
          </div>` : ''}
        </div>` : '';

      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; }
          .card {
            background: linear-gradient(145deg, ${BG1} 0%, ${BG2} 100%);
            border-radius: 22px;
            overflow: hidden;
            position: relative;
            font-family: -apple-system, system-ui, sans-serif;
            border: 1px solid rgba(255,255,255,0.07);
          }
          .glow {
            position: absolute; top: -40px; right: -30px;
            width: 180px; height: 180px; border-radius: 50%;
            background: radial-gradient(circle, ${GLOW} 0%, transparent 65%);
            pointer-events: none;
          }
          .header {
            padding: 15px 18px 11px;
            display: flex; justify-content: space-between; align-items: center;
            position: relative; z-index: 1;
          }
          .sep { margin: 0 18px; height: 1px; background: rgba(255,255,255,0.06); }
          .chart-wrap { padding: 10px 0 8px; position: relative; z-index: 1; }
          .scroll {
            overflow-x: scroll; -webkit-overflow-scrolling: touch;
            padding: 0 14px;
            scrollbar-width: none; -ms-overflow-style: none;
            touch-action: pan-x;
          }
          .scroll::-webkit-scrollbar { display: none; }
          .svg-inner { display: block; overflow: visible; }
        </style>
        <div class="card">
          <div class="glow"></div>
          <div class="header">
            <div>
              <div style="font-size:10px;font-weight:500;color:rgba(255,255,255,0.28);margin-bottom:3px;text-transform:uppercase;letter-spacing:.07em;">Prognoza · 24h</div>
              <div style="font-size:14px;font-weight:600;color:rgba(255,255,255,0.62);">${wxLabel}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:10px;color:rgba(255,255,255,0.26);margin-bottom:3px;">zakres</div>
              <div style="font-size:14px;font-weight:700;letter-spacing:-.3px;">
                <span style="color:${tLoColor}">${tMin.toFixed(0)}°</span>
                <span style="color:rgba(255,255,255,0.20);font-weight:400;margin:0 3px;">—</span>
                <span style="color:${tHiColor}">${tMax.toFixed(0)}°</span>
              </div>
            </div>
          </div>
          <div class="sep"></div>
          <div class="chart-wrap">
            <div class="scroll">
              <div style="min-width:${SVG_PX}px;width:${SVG_PX}px;">
                <svg class="svg-inner" viewBox="0 0 ${SVG_PX} ${SVG_H}" width="${SVG_PX}" height="${SVG_H}" preserveAspectRatio="xMinYMid meet">
                  <defs>
                    <linearGradient id="fcg" x1="0" y1="0" x2="1" y2="0">${gradStops}</linearGradient>
                    <linearGradient id="fag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="${fillCol}" stop-opacity=".22"/>
                      <stop offset="100%" stop-color="${fillCol}" stop-opacity="0"/>
                    </linearGradient>
                    <clipPath id="fac"><rect x="0" y="0" width="${SVG_PX}" height="${SVG_H}"/></clipPath>
                  </defs>
                  <g clip-path="url(#fac)">
                    ${cols}
                    <path d="${area}" fill="url(#fag)"/>
                    <path d="${curve}" stroke="url(#fcg)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="${dotX}" cy="${dotY}" r="3.5" fill="${dotC}"/>
                    <circle cx="${dotX}" cy="${dotY}" r="6.5" fill="${dotC}" opacity=".20"/>
                  </g>
                </svg>
              </div>
            </div>
            ${legendHtml}
          </div>
        </div>`;

      this._attachTooltipListeners();
    }

    // ── Tooltip event listeners (proper DOM, no inline handlers) ──────────────

    _attachTooltipListeners() {
      const root = this.shadowRoot;
      root.querySelectorAll('.fc-col').forEach(colG => {
        const hit = colG.querySelector('.fc-hit');
        const tip = colG.querySelector('.fc-tip');
        if (!hit || !tip) return;

        // Desktop hover
        hit.addEventListener('mouseenter', () => { tip.style.opacity = '1'; });
        hit.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });

        // Mobile tap toggle
        hit.addEventListener('click', () => {
          const visible = tip.style.opacity === '1';
          // Close all others
          root.querySelectorAll('.fc-tip').forEach(t => { t.style.opacity = '0'; });
          if (!visible) tip.style.opacity = '1';
        });
      });
    }

    getCardSize() { return 3; }
  }

  // ── Register ───────────────────────────────────────────────────────────────

  if (!customElements.get('aha-forecast-card')) {
    customElements.define('aha-forecast-card', ForecastCard);
  }
  if (!customElements.get('forecast-card')) {
    customElements.define('forecast-card', class extends ForecastCard {});
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.find(c => c.type === 'aha-forecast-card')) {
    window.customCards.push({
      type: 'aha-forecast-card',
      name: 'AHA Forecast Card',
      description: '24h scrollable forecast chart with interactive temperature tooltip',
    });
  }

})();
