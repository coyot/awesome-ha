/**
 * szambo-apple-card.js — Apple Home Premium Edition
 *
 * REDESIGN 2026:
 *   - Glass morphism backgrounds
 *   - 3D tank container z depth & glows
 *   - Multi-layer gradients na liquid
 *   - Enhanced shadows & highlights
 *   - SF Pro typography hierarchy
 *   - Premium alert & billing sections
 *   - Smooth interactive animations
 *
 * UŻYCIE:
 *   type: custom:szambo-apple-card
 *   capacity: 10
 *   warn_observe: 7
 *   warn_plan: 9
 *   dom1_name: "Dom 49/1"
 *   dom2_name: "Dom 49/2"
 *   entity_total:        sensor.szambo_zuzycie
 *   entity_dom1_szambo:  sensor.szambo_dom_1_zuzycie
 *   entity_dom1_ogrod:   sensor.ogrod_1_zuzycie
 *   entity_dom2_szambo:  sensor.szambo_dom_2_zuzycie
 *   entity_dom2_ogrod:   sensor.ogrod_2_zuzycie
 *   entity_stale:        binary_sensor.ogrod_dane_nieaktualne
 */

const CLR_D1        = '#E8C468';
const CLR_D2        = '#5AC8FA';
const CLR_D1_OBS    = '#FFB347';
const CLR_D2_OBS    = '#FF9B85';
const CLR_D1_PLAN   = '#FF6B6B';
const CLR_D2_PLAN   = '#FF3B30';

class SzamboAppleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hover = null;
  }

  setConfig(config) {
    this._config = {
      capacity:            config.capacity            ?? 10,
      warn_observe:        config.warn_observe        ?? 7,
      warn_plan:           config.warn_plan           ?? 9,
      dom1_name:           config.dom1_name           ?? 'Dom 1',
      dom2_name:           config.dom2_name           ?? 'Dom 2',
      entity_total:        config.entity_total        ?? null,
      entity_dom1_szambo:  config.entity_dom1_szambo  ?? null,
      entity_dom1_ogrod:   config.entity_dom1_ogrod   ?? null,
      entity_dom2_szambo:  config.entity_dom2_szambo  ?? null,
      entity_dom2_ogrod:   config.entity_dom2_ogrod   ?? null,
      entity_stale:        config.entity_stale        ?? null,
      entity_dom1_zaplata: config.entity_dom1_zaplata ?? null,
      entity_dom2_zaplata: config.entity_dom2_zaplata ?? null,
    };
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() { return 4; }

  _val(id) {
    if (!id || !this._hass) return 0;
    const v = parseFloat(this._hass.states[id]?.state);
    return isNaN(v) ? 0 : v;
  }

  _renderTankSVG(d1pct, d2pct, emptPct, totalPct, observePct, planPct, clrD1, clrD2, warnObserve, warnPlan) {
    // Isometric projection: 30° angles
    // Tank dimensions
    const w = 50;  // width
    const d = 30;  // depth
    const h = 260; // height

    // Isometric offsets (30° projection)
    const cos30 = Math.cos(Math.PI / 6);
    const sin30 = Math.sin(Math.PI / 6);
    const dx = w * cos30;      // ~43.3
    const dy = w * sin30;      // ~25
    const ddx = d * cos30;     // ~17.3
    const ddy = d * sin30;     // ~10

    // ViewBox with padding
    const vbWidth = dx + ddx + 20;
    const vbHeight = h + dy + 20;

    // Calculate liquid heights
    const h2 = (d2pct / 100) * h;  // Dom 2 (bottom)
    const h1 = (d1pct / 100) * h;  // Dom 1 (top)
    const hEmpty = (emptPct / 100) * h;

    // Y positions (from bottom)
    const yBottom = h + 10;
    const yD2Top = yBottom - h2;
    const yD1Top = yD2Top - h1;

    // Warning line Y positions
    const yPlan = yBottom - (planPct / 100) * h;
    const yObs = yBottom - (observePct / 100) * h;

    // Tank structure points (isometric projection - view from ABOVE)
    // Front face (left side) - vertical
    const front = [
      [5, yBottom],           // bottom left
      [5 + dx, yBottom + dy], // bottom right (goes DOWN as we go right-front)
      [5 + dx, 5 + dy],       // top right
      [5, 5]                  // top left
    ].map(p => p.join(',')).join(' ');

    // Right face (side) - vertical
    const right = [
      [5 + dx, yBottom + dy],             // bottom left (front)
      [5 + dx + ddx, yBottom + dy - ddy], // bottom right (back) (goes UP as we go right-back)
      [5 + dx + ddx, 5 + dy - ddy],       // top right
      [5 + dx, 5 + dy]                    // top left
    ].map(p => p.join(',')).join(' ');

    // Top face - horizontal parallelogram at top
    const top = [
      [5, 5],                       // left
      [5 + dx, 5 + dy],             // front (goes DOWN)
      [5 + dx + ddx, 5 + dy - ddy], // right
      [5 + ddx, 5 - ddy]            // back (goes UP from left)
    ].map(p => p.join(',')).join(' ');

    // Bottom face - horizontal parallelogram at bottom
    const bottom = [
      [5, yBottom],                       // left
      [5 + dx, yBottom + dy],             // front (goes DOWN)
      [5 + dx + ddx, yBottom + dy - ddy], // right
      [5 + ddx, yBottom - ddy]            // back (goes UP from left)
    ].map(p => p.join(',')).join(' ');

    // === LIQUID D2 (bottom layer) ===
    // Front face
    const liquidD2Front = h2 > 0 ? [
      [5, yBottom],
      [5 + dx, yBottom + dy],
      [5 + dx, yD2Top + dy],
      [5, yD2Top]
    ].map(p => p.join(',')).join(' ') : '';

    // Right face
    const liquidD2Right = h2 > 0 ? [
      [5 + dx, yBottom + dy],
      [5 + dx + ddx, yBottom + dy - ddy],
      [5 + dx + ddx, yD2Top + dy - ddy],
      [5 + dx, yD2Top + dy]
    ].map(p => p.join(',')).join(' ') : '';

    // Top surface
    const liquidD2Top = h2 > 0 ? [
      [5, yD2Top],
      [5 + dx, yD2Top + dy],
      [5 + dx + ddx, yD2Top + dy - ddy],
      [5 + ddx, yD2Top - ddy]
    ].map(p => p.join(',')).join(' ') : '';

    // === LIQUID D1 (top layer) ===
    // Front face
    const liquidD1Front = h1 > 0 ? [
      [5, yD2Top],
      [5 + dx, yD2Top + dy],
      [5 + dx, yD1Top + dy],
      [5, yD1Top]
    ].map(p => p.join(',')).join(' ') : '';

    // Right face
    const liquidD1Right = h1 > 0 ? [
      [5 + dx, yD2Top + dy],
      [5 + dx + ddx, yD2Top + dy - ddy],
      [5 + dx + ddx, yD1Top + dy - ddy],
      [5 + dx, yD1Top + dy]
    ].map(p => p.join(',')).join(' ') : '';

    // Top surface
    const liquidD1Top = h1 > 0 ? [
      [5, yD1Top],
      [5 + dx, yD1Top + dy],
      [5 + dx + ddx, yD1Top + dy - ddy],
      [5 + ddx, yD1Top - ddy]
    ].map(p => p.join(',')).join(' ') : '';

    return `
      <svg class="tank-svg" id="tank" viewBox="0 0 ${vbWidth} ${vbHeight}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <!-- Tank gradients -->
          <linearGradient id="grad-front" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(32,32,34,0.85);stop-opacity:1" />
            <stop offset="60%" style="stop-color:rgba(22,22,24,0.92);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(18,18,20,0.95);stop-opacity:1" />
          </linearGradient>

          <linearGradient id="grad-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(24,24,26,0.88);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(16,16,18,0.95);stop-opacity:1" />
          </linearGradient>

          <linearGradient id="grad-top" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgba(48,48,50,0.78);stop-opacity:1" />
            <stop offset="50%" style="stop-color:rgba(38,38,40,0.86);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(32,32,34,0.90);stop-opacity:1" />
          </linearGradient>

          <linearGradient id="grad-bottom" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(18,18,20,0.95);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(12,12,14,0.98);stop-opacity:1" />
          </linearGradient>

          <!-- Liquid gradients - front (lighter) -->
          <linearGradient id="grad-d1-front" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${clrD1};stop-opacity:0.95" />
            <stop offset="60%" style="stop-color:${clrD1};stop-opacity:0.85" />
            <stop offset="100%" style="stop-color:${clrD1};stop-opacity:0.90" />
          </linearGradient>

          <linearGradient id="grad-d2-front" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${clrD2};stop-opacity:0.95" />
            <stop offset="60%" style="stop-color:${clrD2};stop-opacity:0.85" />
            <stop offset="100%" style="stop-color:${clrD2};stop-opacity:0.90" />
          </linearGradient>

          <!-- Liquid gradients - right (darker) -->
          <linearGradient id="grad-d1-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${clrD1};stop-opacity:0.75" />
            <stop offset="100%" style="stop-color:${clrD1};stop-opacity:0.80" />
          </linearGradient>

          <linearGradient id="grad-d2-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${clrD2};stop-opacity:0.75" />
            <stop offset="100%" style="stop-color:${clrD2};stop-opacity:0.80" />
          </linearGradient>

          <!-- Liquid gradients - top (brightest) -->
          <radialGradient id="grad-d1-top" cx="40%" cy="40%">
            <stop offset="0%" style="stop-color:${clrD1};stop-opacity:0.98" />
            <stop offset="100%" style="stop-color:${clrD1};stop-opacity:0.88" />
          </radialGradient>

          <radialGradient id="grad-d2-top" cx="40%" cy="40%">
            <stop offset="0%" style="stop-color:${clrD2};stop-opacity:0.98" />
            <stop offset="100%" style="stop-color:${clrD2};stop-opacity:0.88" />
          </radialGradient>

          <linearGradient id="light-reflection" x1="0%" y1="0%" x2="60%" y2="40%">
            <stop offset="0%" style="stop-color:white;stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:white;stop-opacity:0" />
          </linearGradient>

          <filter id="tank-shadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="2" dy="4" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#tank-shadow)">

          <!-- Render back to front for proper layering -->

          <!-- Bottom face (darkest, barely visible) -->
          <polygon points="${bottom}"
            fill="url(#grad-bottom)"
            stroke="rgba(60,60,62,0.4)"
            stroke-width="0.5"
            opacity="0.6"/>

          <!-- Top face (structural) -->
          <polygon class="iso-top" points="${top}"
            fill="url(#grad-top)"
            stroke="rgba(80,80,82,0.5)"
            stroke-width="1"
            style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.3))"/>

          <!-- Right face (structural) -->
          <polygon class="iso-right" points="${right}"
            fill="url(#grad-right)"
            stroke="rgba(70,70,72,0.6)"
            stroke-width="1"
            style="filter:drop-shadow(2px 0 8px rgba(0,0,0,0.4))"/>

          <!-- Front face (structural) -->
          <polygon class="iso-front" points="${front}"
            fill="url(#grad-front)"
            stroke="rgba(72,72,74,0.7)"
            stroke-width="1.5"/>

          <!-- Liquid D2 (bottom layer) - right face first -->
          ${h2 > 0 ? `<polygon class="liquid-d2" points="${liquidD2Right}"
            fill="url(#grad-d2-right)"
            opacity="0.88"/>` : ''}

          <!-- Liquid D2 - front face -->
          ${h2 > 0 ? `<polygon id="tank-d2" data-dom="2" class="liquid-d2" points="${liquidD2Front}"
            fill="url(#grad-d2-front)"
            opacity="0.88"/>` : ''}

          <!-- Liquid D2 - top surface (only if D1 doesn't exist or is small) -->
          ${h2 > 0 && h1 === 0 ? `<polygon class="liquid-d2" points="${liquidD2Top}"
            fill="url(#grad-d2-top)"
            stroke="${clrD2}"
            stroke-width="0.5"
            opacity="0.92"
            style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.3))"/>` : ''}

          <!-- Liquid D1 (top layer) - right face -->
          ${h1 > 0 ? `<polygon class="liquid-d1" points="${liquidD1Right}"
            fill="url(#grad-d1-right)"
            opacity="0.88"/>` : ''}

          <!-- Liquid D1 - front face -->
          ${h1 > 0 ? `<polygon id="tank-d1" data-dom="1" class="liquid-d1" points="${liquidD1Front}"
            fill="url(#grad-d1-front)"
            opacity="0.88"/>` : ''}

          <!-- Liquid D1 - top surface -->
          ${h1 > 0 ? `<polygon class="liquid-d1" points="${liquidD1Top}"
            fill="url(#grad-d1-top)"
            stroke="${clrD1}"
            stroke-width="0.5"
            opacity="0.92"
            style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.3))"/>` : ''}

          <!-- Warning lines (isometric - parallel to top/bottom edges) -->
          <!-- Observe line (always visible) -->
          <g opacity="${totalPct >= observePct ? '0.95' : '0.35'}" class="warn-line warn-observe">
            <line x1="5" y1="${yObs}" x2="${5 + dx}" y2="${yObs + dy}"
              stroke="#FF9500" stroke-width="${totalPct >= observePct ? '1.8' : '1.2'}"
              stroke-dasharray="${totalPct >= observePct ? '0' : '3 2'}"
              style="filter:drop-shadow(0 0 ${totalPct >= observePct ? '6px' : '2px'} rgba(255,149,0,${totalPct >= observePct ? '0.7' : '0.3'}))"/>
            <line x1="${5 + dx}" y1="${yObs + dy}" x2="${5 + dx + ddx}" y2="${yObs + dy - ddy}"
              stroke="#FF9500" stroke-width="${totalPct >= observePct ? '1.8' : '1.2'}"
              stroke-dasharray="${totalPct >= observePct ? '0' : '3 2'}"
              style="filter:drop-shadow(0 0 ${totalPct >= observePct ? '6px' : '2px'} rgba(255,149,0,${totalPct >= observePct ? '0.7' : '0.3'}))"/>
            <text x="${5 + dx + ddx + 3}" y="${yObs + dy - ddy + 4}"
              font-size="7.5" font-weight="${totalPct >= observePct ? '700' : '600'}" fill="#FF9500"
              opacity="${totalPct >= observePct ? '1' : '0.6'}"
              style="text-shadow:0 0 ${totalPct >= observePct ? '6px' : '3px'} rgba(255,149,0,${totalPct >= observePct ? '0.9' : '0.5'})">${warnObserve}m³</text>
          </g>

          <!-- Plan line (always visible) -->
          <g opacity="${totalPct >= planPct ? '1' : '0.4'}" class="warn-line warn-plan">
            <line x1="5" y1="${yPlan}" x2="${5 + dx}" y2="${yPlan + dy}"
              stroke="#FF3B30" stroke-width="${totalPct >= planPct ? '2.2' : '1.4'}"
              stroke-dasharray="${totalPct >= planPct ? '0' : '4 2'}"
              style="filter:drop-shadow(0 0 ${totalPct >= planPct ? '8px' : '2px'} rgba(255,59,48,${totalPct >= planPct ? '0.8' : '0.3'}))"/>
            <line x1="${5 + dx}" y1="${yPlan + dy}" x2="${5 + dx + ddx}" y2="${yPlan + dy - ddy}"
              stroke="#FF3B30" stroke-width="${totalPct >= planPct ? '2.2' : '1.4'}"
              stroke-dasharray="${totalPct >= planPct ? '0' : '4 2'}"
              style="filter:drop-shadow(0 0 ${totalPct >= planPct ? '8px' : '2px'} rgba(255,59,48,${totalPct >= planPct ? '0.8' : '0.3'}))"/>
            <text x="${5 + dx + ddx + 3}" y="${yPlan + dy - ddy + 4}"
              font-size="7.5" font-weight="${totalPct >= planPct ? '700' : '600'}" fill="#FF3B30"
              opacity="${totalPct >= planPct ? '1' : '0.65'}"
              style="text-shadow:0 0 ${totalPct >= planPct ? '8px' : '3px'} rgba(255,59,48,${totalPct >= planPct ? '1' : '0.5'})">${warnPlan}m³</text>
          </g>

          <!-- Light reflection overlay -->
          <polygon points="${front}"
            fill="url(#light-reflection)"
            opacity="0.12"
            pointer-events="none"/>

        </g>
      </svg>`;
  }

  _render() {
    if (!this._hass) return;

    const cap         = this._config.capacity;
    const warnObserve = this._config.warn_observe;
    const warnPlan    = this._config.warn_plan;
    const dom1Name    = this._config.dom1_name;
    const dom2Name    = this._config.dom2_name;

    const total = this._val(this._config.entity_total);
    const d1sz  = this._val(this._config.entity_dom1_szambo);
    const d1og  = this._val(this._config.entity_dom1_ogrod);
    const d2sz  = this._val(this._config.entity_dom2_szambo);
    const d2og  = this._val(this._config.entity_dom2_ogrod);
    const d1    = d1sz + d1og;
    const d2    = d2sz + d2og;

    const dom1zl  = this._val(this._config.entity_dom1_zaplata);
    const dom2zl  = this._val(this._config.entity_dom2_zaplata);
    const totalZl = dom1zl + dom2zl;
    const fmtZl   = v => v.toFixed(2).replace('.', ',');

    const staleOn = this._config.entity_stale
      ? this._hass.states[this._config.entity_stale]?.state === 'on'
      : false;

    const pct = v => Math.min(Math.round((v / cap) * 100), 100);
    const fmt = v => v.toFixed(2).replace('.', ',');

    const totalPct    = pct(total);
    const observePct  = pct(warnObserve);
    const planPct     = pct(warnPlan);

    const isPlan    = total >= warnPlan;
    const isObserve = !isPlan && total >= warnObserve;
    const isOk      = !isPlan && !isObserve;

    const clrD1    = isPlan ? CLR_D1_PLAN : isObserve ? CLR_D1_OBS : CLR_D1;
    const clrD2    = isPlan ? CLR_D2_PLAN : isObserve ? CLR_D2_OBS : CLR_D2;
    const totalClr = isPlan ? '#FF3B30' : isObserve ? '#FF9500' : '#34C759';

    const alertTxt  = isPlan    ? 'Zaplanuj wywo\u00f3z!'
                    : isObserve ? 'Obserwuj'
                    :             'Poziom w normie';
    const alertBg   = isPlan    ? '#3D1212' : isObserve ? '#3D2C0A' : '#1A2E1A';
    const alertClr  = isPlan    ? '#FF6B6B' : isObserve ? '#FFD080' : '#34C759';
    const alertIcon = isOk
      ? '<path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>'
      : '<path d="M12 2L1 21h22L12 2zm0 3l8.5 14.5h-17L12 5zm-1 6v4h2v-4h-2zm0 6v2h2v-2h-2z"/>';

    const d2pct   = pct(d2);
    const d1pct   = pct(d1);
    const emptPct = Math.max(0, 100 - d1pct - d2pct);

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        @keyframes szambo-liquid-flow {
          0%, 100% { opacity: 0.88; }
          50% { opacity: 0.96; }
        }

        @keyframes szambo-glow-pulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }

        .card {
          background: linear-gradient(145deg,
            rgba(44,44,46,0.95) 0%,
            rgba(28,28,30,0.98) 100%);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-radius: 20px;
          padding: 18px 20px;
          box-sizing: border-box;
          font-family: -apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif;
          -webkit-font-smoothing: antialiased;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4),
                      0 2px 8px rgba(0,0,0,0.2);
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,255,255,0.15) 50%,
            transparent 100%);
          pointer-events: none;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .header-ic {
          width: 34px;
          height: 34px;
          border-radius: 11px;
          background: linear-gradient(135deg,
            rgba(142,142,147,0.15) 0%,
            rgba(99,99,102,0.2) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8E8E93;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15),
                      inset 0 1px 0 rgba(255,255,255,0.08);
          position: relative;
        }

        .header-ic::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(circle at 35% 30%,
            rgba(255,255,255,0.08) 0%,
            transparent 70%);
          pointer-events: none;
        }

        .header-title {
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.3px;
          color: rgba(255,255,255,0.95);
          flex: 1;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .stale-banner {
          display: flex;
          align-items: center;
          gap: 9px;
          background: linear-gradient(135deg,
            rgba(255,214,10,0.12) 0%,
            rgba(200,160,0,0.15) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,214,10,0.25);
          border-radius: 12px;
          padding: 10px 14px;
          margin-bottom: 14px;
          box-shadow: 0 0 20px rgba(255,214,10,0.15),
                      0 2px 8px rgba(0,0,0,0.15),
                      inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .stale-txt {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: -0.1px;
          color: rgba(255,214,10,0.95);
          line-height: 1.4;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .stale-txt b {
          font-weight: 600;
          color: #FFD60A;
        }

        .body { display: flex; gap: 14px; }

        /* ── zbiornik SVG ISO ── */
        .tank-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .tank-svg {
          width: 90px;
          height: 100%;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      filter 0.3s ease;
          filter: drop-shadow(2px 4px 12px rgba(0,0,0,0.35));
        }

        .tank-svg:hover {
          transform: scale(1.02) translateY(-2px);
          filter: drop-shadow(3px 6px 16px rgba(0,0,0,0.45));
        }

        /* SVG elements - do NOT style flex/position */
        .iso-front { transition: opacity 0.3s ease, filter 0.3s ease; }
        .iso-right { transition: opacity 0.3s ease, filter 0.3s ease; }
        .iso-top { transition: opacity 0.3s ease, filter 0.3s ease; }

        .liquid-d1 {
          transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      filter 0.4s ease;
          animation: szambo-liquid-flow 4s ease-in-out infinite;
        }

        .liquid-d2 {
          transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      filter 0.4s ease;
          animation: szambo-liquid-flow 4.5s ease-in-out infinite;
        }

        .liquid-d1.hovered {
          opacity: 1 !important;
          filter: brightness(1.2) saturate(1.2) drop-shadow(0 0 8px currentColor);
        }

        .liquid-d1.faded {
          opacity: 0.35 !important;
          filter: grayscale(0.5) brightness(0.7);
        }

        .liquid-d2.hovered {
          opacity: 1 !important;
          filter: brightness(1.2) saturate(1.2) drop-shadow(0 0 8px currentColor);
        }

        .liquid-d2.faded {
          opacity: 0.35 !important;
          filter: grayscale(0.5) brightness(0.7);
        }

        /* Warning lines */
        .warn-line {
          transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .warn-observe line {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .warn-plan line {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tank-cap-lbl {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: -0.1px;
          color: rgba(142,142,147,0.9);
          text-align: center;
          flex-shrink: 0;
        }

        /* ── dane ── */
        .data {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .total-val {
          font-size: 34px;
          font-weight: 200;
          letter-spacing: -2px;
          color: ${totalClr};
          line-height: 1;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          text-shadow: 0 0 20px ${totalClr}40;
          font-variant-numeric: tabular-nums;
        }

        .total-unit {
          font-size: 15px;
          font-weight: 400;
          letter-spacing: -0.2px;
          color: rgba(142,142,147,0.8);
          margin-left: 4px;
        }

        .total-pct {
          font-size: 14px;
          font-weight: 500;
          letter-spacing: -0.2px;
          color: ${totalClr};
          margin-left: 6px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          font-variant-numeric: tabular-nums;
        }

        .total-sub {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: -0.1px;
          color: rgba(142,142,147,0.75);
          margin-top: 4px;
          margin-bottom: 12px;
        }

        .bar-bg {
          height: 4px;
          background: rgba(58,58,60,0.6);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          border-radius: 3px;
          margin-bottom: 14px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
        }

        .bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .bar-fill::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,255,255,0.2) 50%,
            transparent 100%);
          opacity: 0.5;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(58,58,60,0.8) 20%,
            rgba(58,58,60,0.8) 80%,
            transparent 100%);
          margin: 12px 0;
        }

        .sec {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sec.faded {
          opacity: 0.35;
          filter: grayscale(0.4);
        }

        .sec.hovered {
          opacity: 1;
          filter: grayscale(0);
        }

        .sec-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(142,142,147,0.85);
          margin-bottom: 8px;
        }

        .row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 5px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 8px currentColor;
        }

        .row-name {
          font-size: 13px;
          font-weight: 400;
          letter-spacing: -0.2px;
          color: rgba(174,174,178,0.95);
          flex: 1;
        }

        .row-val {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.3px;
          color: rgba(255,255,255,0.98);
          font-variant-numeric: tabular-nums;
        }

        .row-unit {
          font-size: 11px;
          font-weight: 400;
          color: rgba(142,142,147,0.7);
          margin-left: 2px;
        }

        .mini-bar {
          margin-left: 16px;
          margin-bottom: 7px;
        }

        .billing {
          margin-top: 14px;
          padding: 14px 16px;
          background: linear-gradient(135deg,
            rgba(28,28,30,0.6) 0%,
            rgba(18,18,20,0.8) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2),
                      inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .billing-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .billing-title {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(142,142,147,0.85);
        }

        .billing-total {
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.3px;
          color: rgba(255,255,255,0.98);
          font-variant-numeric: tabular-nums;
        }

        .billing-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 9px;
        }

        .billing-row:last-child {
          margin-bottom: 0;
        }

        .billing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 8px currentColor;
        }

        .billing-name {
          font-size: 13px;
          font-weight: 400;
          letter-spacing: -0.2px;
          color: rgba(174,174,178,0.95);
          flex: 1;
        }

        .billing-bar-wrap {
          flex: 2;
        }

        .billing-bar-bg {
          height: 4px;
          background: rgba(58,58,60,0.5);
          border-radius: 3px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
        }

        .billing-bar-fill {
          height: 100%;
          border-radius: 3px;
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .billing-bar-fill::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,255,255,0.2) 50%,
            transparent 100%);
          opacity: 0.4;
        }

        .billing-val {
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.3px;
          color: rgba(255,255,255,0.98);
          min-width: 70px;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        .billing-sub {
          font-size: 11px;
          font-weight: 400;
          color: rgba(142,142,147,0.7);
          text-align: right;
        }

        .alert {
          margin-top: 14px;
          padding: 10px 14px;
          background: linear-gradient(135deg,
            ${alertBg === '#1A2E1A' ? 'rgba(26,46,26,0.6)' : alertBg === '#3D2C0A' ? 'rgba(61,44,10,0.6)' : 'rgba(61,18,18,0.6)'} 0%,
            ${alertBg === '#1A2E1A' ? 'rgba(20,38,20,0.8)' : alertBg === '#3D2C0A' ? 'rgba(50,35,8,0.8)' : 'rgba(50,14,14,0.8)'} 100%);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid ${alertClr}40;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 0 20px ${alertClr}20,
                      0 2px 8px rgba(0,0,0,0.15),
                      inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .alert-txt {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: -0.1px;
          color: ${alertClr};
          line-height: 1.4;
          text-shadow: 0 0 8px ${alertClr}40;
        }
      </style>

      <div class="card">

        <div class="header">
          <div class="header-ic">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5a2 2 0 00-2 2v4a2 2 0 001 1.73V19a2 2 0 002 2h12a2 2 0 002-2V10.73A2 2 0 0021 9V5a2 2 0 00-2-2zm-7 16a5 5 0 110-10 5 5 0 010 10zm7-11H5V5h14v3z"/>
            </svg>
          </div>
          <div class="header-title">Szambo</div>
        </div>

        ${staleOn ? `
        <div class="stale-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD60A" style="flex-shrink:0">
            <path d="M12 2L1 21h22L12 2zm0 3l8.5 14.5h-17L12 5zm-1 6v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
          </svg>
          <span class="stale-txt"><b>Dane ogrodu nieaktualne</b> \u2014 rzeczywiste zu\u017cycie mo\u017ce by\u0107 wy\u017csze</span>
        </div>` : ''}

        <div class="body">

          <div class="tank-col">
            ${this._renderTankSVG(d1pct, d2pct, emptPct, totalPct, observePct, planPct, clrD1, clrD2, warnObserve, warnPlan)}
            <div class="tank-cap-lbl">${cap} m\u00b3</div>
          </div>

          <div class="data">

            <div>
              <div>
                <span class="total-val">${fmt(total)}</span>
                <span class="total-unit">m\u00b3</span>
                <span class="total-pct">${totalPct}%</span>
              </div>
              <div class="total-sub">zu\u017cycie \u0142\u0105cznie</div>
              <div class="bar-bg">
                <div class="bar-fill" style="width:${totalPct}%;background:${totalClr};"></div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="sec" id="sec1">
              <div class="sec-title">${dom1Name}</div>
              <div class="row">
                <div class="dot" style="background:${clrD1};"></div>
                <div class="row-name">Szambo</div>
                <div class="row-val">${fmt(d1sz)}<span class="row-unit"> m\u00b3</span></div>
              </div>
              <div class="mini-bar">
                <div class="bar-bg"><div class="bar-fill" style="width:${pct(d1sz)}%;background:${clrD1};"></div></div>
              </div>
              <div class="row">
                <div class="dot" style="background:${clrD1};opacity:.4;"></div>
                <div class="row-name">Ogr\u00f3d</div>
                <div class="row-val">${fmt(d1og)}<span class="row-unit"> m\u00b3</span></div>
              </div>
              <div class="mini-bar">
                <div class="bar-bg"><div class="bar-fill" style="width:${pct(d1og)}%;background:${clrD1};opacity:.45;"></div></div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="sec" id="sec2">
              <div class="sec-title">${dom2Name}</div>
              <div class="row">
                <div class="dot" style="background:${clrD2};"></div>
                <div class="row-name">Szambo</div>
                <div class="row-val">${fmt(d2sz)}<span class="row-unit"> m\u00b3</span></div>
              </div>
              <div class="mini-bar">
                <div class="bar-bg"><div class="bar-fill" style="width:${pct(d2sz)}%;background:${clrD2};"></div></div>
              </div>
              <div class="row">
                <div class="dot" style="background:${clrD2};opacity:.4;"></div>
                <div class="row-name">Ogr\u00f3d</div>
                <div class="row-val">${fmt(d2og)}<span class="row-unit"> m\u00b3</span></div>
              </div>
              <div class="mini-bar">
                <div class="bar-bg"><div class="bar-fill" style="width:${pct(d2og)}%;background:${clrD2};opacity:.45;"></div></div>
              </div>
            </div>

          </div>
        </div>

        <div class="alert">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="${alertClr}">${alertIcon}</svg>
          <span class="alert-txt">${alertTxt} \u00b7 zosta\u0142o ${fmt(cap - total)} m\u00b3</span>
        </div>

        ${(dom1zl > 0 || dom2zl > 0) ? `
        <div class="billing">
          <div class="billing-header">
            <span class="billing-title">Rozliczenie</span>
            <span class="billing-total">${fmtZl(totalZl)} z\u0142</span>
          </div>
          <div class="billing-row">
            <div class="billing-dot" style="background:${clrD1};"></div>
            <div class="billing-name">${dom1Name}</div>
            <div class="billing-bar-wrap">
              <div class="billing-bar-bg">
                <div class="billing-bar-fill" style="width:${totalZl > 0 ? Math.round(dom1zl/totalZl*100) : 50}%;background:${clrD1};"></div>
              </div>
            </div>
            <div>
              <div class="billing-val">${fmtZl(dom1zl)} z\u0142</div>
            </div>
          </div>
          <div class="billing-row">
            <div class="billing-dot" style="background:${clrD2};"></div>
            <div class="billing-name">${dom2Name}</div>
            <div class="billing-bar-wrap">
              <div class="billing-bar-bg">
                <div class="billing-bar-fill" style="width:${totalZl > 0 ? Math.round(dom2zl/totalZl*100) : 50}%;background:${clrD2};"></div>
              </div>
            </div>
            <div>
              <div class="billing-val">${fmtZl(dom2zl)} z\u0142</div>
            </div>
          </div>
        </div>` : ''}

      </div>
    `;

    this._bindHover();
  }

  _bindHover() {
    const d1Liquids = this.shadowRoot.querySelectorAll('.liquid-d1');
    const d2Liquids = this.shadowRoot.querySelectorAll('.liquid-d2');
    const sec1 = this.shadowRoot.getElementById('sec1');
    const sec2 = this.shadowRoot.getElementById('sec2');
    if (!d1Liquids.length || !d2Liquids.length) return;

    const highlight = (dom) => {
      if (dom === 1) {
        d1Liquids.forEach(el => { el.classList.add('hovered'); el.classList.remove('faded'); });
        d2Liquids.forEach(el => { el.classList.add('faded'); el.classList.remove('hovered'); });
        sec1?.classList.add('hovered'); sec1?.classList.remove('faded');
        sec2?.classList.add('faded'); sec2?.classList.remove('hovered');
      } else if (dom === 2) {
        d2Liquids.forEach(el => { el.classList.add('hovered'); el.classList.remove('faded'); });
        d1Liquids.forEach(el => { el.classList.add('faded'); el.classList.remove('hovered'); });
        sec2?.classList.add('hovered'); sec2?.classList.remove('faded');
        sec1?.classList.add('faded'); sec1?.classList.remove('hovered');
      } else {
        [...d1Liquids, ...d2Liquids].forEach(el => el.classList.remove('hovered', 'faded'));
        sec1?.classList.remove('hovered', 'faded');
        sec2?.classList.remove('hovered', 'faded');
      }
    };

    d1Liquids.forEach(el => {
      el.addEventListener('mouseenter', () => highlight(1));
      el.addEventListener('mouseleave', () => highlight(null));
      el.addEventListener('touchstart', () => highlight(1), { passive: true });
      el.addEventListener('touchend', () => setTimeout(() => highlight(null), 600));
    });

    d2Liquids.forEach(el => {
      el.addEventListener('mouseenter', () => highlight(2));
      el.addEventListener('mouseleave', () => highlight(null));
      el.addEventListener('touchstart', () => highlight(2), { passive: true });
      el.addEventListener('touchend', () => setTimeout(() => highlight(null), 600));
    });

    /* hover po sekcjach też podświetla zbiornik */
    sec1?.addEventListener('mouseenter', () => highlight(1));
    sec2?.addEventListener('mouseenter', () => highlight(2));
    sec1?.addEventListener('mouseleave', () => highlight(null));
    sec2?.addEventListener('mouseleave', () => highlight(null));
  }
}

customElements.define('szambo-apple-card', SzamboAppleCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'szambo-apple-card',
  name:        'Szambo Apple Card',
  preview:     false,
  description: 'Premium septic tank visualization — Apple Home style with 3D liquid tank, glass morphism, gradient effects, interactive highlighting & smooth animations.',
});