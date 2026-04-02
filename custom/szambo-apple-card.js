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
          0%, 100% { opacity: 0.85; }
          50% { opacity: 0.95; }
        }

        @keyframes szambo-glow-pulse {
          0%, 100% { opacity: 0.6; }
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

        /* ── zbiornik 3D ── */
        .tank-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          perspective: 800px;
        }

        .tank {
          width: 70px;
          flex: 1;
          position: relative;
          cursor: pointer;
          transform-style: preserve-3d;
          transform: rotateX(8deg) rotateY(-6deg);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tank:hover {
          transform: rotateX(10deg) rotateY(-8deg) scale(1.03);
        }

        /* Front face */
        .tank-front {
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg,
            rgba(32,32,34,0.85) 0%,
            rgba(20,20,22,0.95) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1.5px solid rgba(72,72,74,0.7);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: inset 2px 0 12px rgba(0,0,0,0.5),
                      inset 0 2px 8px rgba(0,0,0,0.4),
                      inset -1px 0 0 rgba(255,255,255,0.03),
                      2px 4px 16px rgba(0,0,0,0.4);
          transform: translateZ(6px);
        }

        /* Right face (side) */
        .tank-right {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 12px;
          background: linear-gradient(180deg,
            rgba(24,24,26,0.9) 0%,
            rgba(16,16,18,0.95) 100%);
          border: 1px solid rgba(60,60,62,0.6);
          border-left: none;
          transform-origin: left center;
          transform: rotateY(85deg) translateZ(6px);
          box-shadow: inset 2px 0 8px rgba(0,0,0,0.6),
                      2px 0 8px rgba(0,0,0,0.3);
        }

        /* Top face */
        .tank-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 12px;
          background: linear-gradient(160deg,
            rgba(48,48,50,0.8) 0%,
            rgba(36,36,38,0.9) 100%);
          border: 1px solid rgba(80,80,82,0.6);
          border-bottom: none;
          transform-origin: center bottom;
          transform: rotateX(85deg) translateZ(6px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.4),
                      inset 0 1px 0 rgba(255,255,255,0.08);
        }

        /* Light reflection on front */
        .tank-front::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 40%;
          height: 40%;
          background: linear-gradient(160deg,
            rgba(255,255,255,0.08) 0%,
            transparent 70%);
          pointer-events: none;
          z-index: 100;
        }

        .tank-empty {
          flex: ${emptPct};
          background: transparent;
          min-height: 0;
        }

        .tank-d1 {
          flex: ${d1pct};
          min-height: 0;
          background: linear-gradient(170deg,
            ${clrD1}f0 0%,
            ${clrD1}cc 40%,
            ${clrD1}dd 100%);
          opacity: 0.90;
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: szambo-liquid-flow 4s ease-in-out infinite;
          box-shadow: inset 2px 0 8px rgba(0,0,0,0.3),
                      inset 0 2px 6px rgba(0,0,0,0.25);
        }

        /* Liquid surface highlight */
        .tank-d1::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,255,255,0.4) 30%,
            rgba(255,255,255,0.25) 70%,
            transparent 100%);
          pointer-events: none;
        }

        /* Liquid reflection */
        .tank-d1::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 25% 15%,
            rgba(255,255,255,0.25) 0%,
            transparent 40%);
          pointer-events: none;
        }

        .tank-d1.hovered {
          opacity: 1;
          filter: brightness(1.2) saturate(1.2);
          box-shadow: inset 2px 0 8px rgba(0,0,0,0.3),
                      inset 0 2px 6px rgba(0,0,0,0.25),
                      0 0 24px ${clrD1}90,
                      inset 0 0 20px ${clrD1}30;
        }

        .tank-d1.faded {
          opacity: 0.35;
          filter: grayscale(0.4) brightness(0.8);
        }

        .tank-d2 {
          flex: ${d2pct};
          min-height: 0;
          background: linear-gradient(170deg,
            ${clrD2}f0 0%,
            ${clrD2}cc 40%,
            ${clrD2}dd 100%);
          opacity: 0.90;
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: szambo-liquid-flow 4.5s ease-in-out infinite;
          box-shadow: inset 2px 0 8px rgba(0,0,0,0.3),
                      inset 0 2px 6px rgba(0,0,0,0.25);
        }

        .tank-d2::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,255,255,0.4) 30%,
            rgba(255,255,255,0.25) 70%,
            transparent 100%);
          pointer-events: none;
        }

        .tank-d2::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 75% 20%,
            rgba(255,255,255,0.25) 0%,
            transparent 40%);
          pointer-events: none;
        }

        .tank-d2.hovered {
          opacity: 1;
          filter: brightness(1.2) saturate(1.2);
          box-shadow: inset 2px 0 8px rgba(0,0,0,0.3),
                      inset 0 2px 6px rgba(0,0,0,0.25),
                      0 0 24px ${clrD2}90,
                      inset 0 0 20px ${clrD2}30;
        }

        .tank-d2.faded {
          opacity: 0.35;
          filter: grayscale(0.4) brightness(0.8);
        }

        .tank-line-plan {
          position: absolute;
          bottom: ${planPct}%;
          left: 0;
          right: 0;
          height: 2px;
          background: #FF3B30;
          opacity: 0.9;
          box-shadow: 0 0 8px rgba(255,59,48,0.6),
                      0 0 16px rgba(255,59,48,0.3);
          z-index: 5;
          animation: szambo-glow-pulse 2s ease-in-out infinite;
        }

        .tank-lbl-plan {
          position: absolute;
          bottom: calc(${planPct}% + 3px);
          right: 4px;
          font-size: 7.5px;
          font-weight: 600;
          letter-spacing: -0.1px;
          color: #FF3B30;
          font-family: -apple-system,'SF Pro Text',sans-serif;
          text-shadow: 0 0 4px rgba(255,59,48,0.8),
                       0 1px 2px rgba(0,0,0,0.5);
          z-index: 6;
        }

        .tank-line-obs {
          position: absolute;
          bottom: ${observePct}%;
          left: 0;
          right: 0;
          height: 1.5px;
          background: #FF9500;
          opacity: 0.85;
          box-shadow: 0 0 6px rgba(255,149,0,0.5),
                      0 0 12px rgba(255,149,0,0.25);
          z-index: 5;
        }

        .tank-lbl-obs {
          position: absolute;
          bottom: calc(${observePct}% + 3px);
          right: 4px;
          font-size: 7.5px;
          font-weight: 600;
          letter-spacing: -0.1px;
          color: #FF9500;
          font-family: -apple-system,'SF Pro Text',sans-serif;
          text-shadow: 0 0 4px rgba(255,149,0,0.7),
                       0 1px 2px rgba(0,0,0,0.5);
          z-index: 6;
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
          color: ${totalClr};a
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
            <div class="tank" id="tank">
              <div class="tank-empty"></div>
              <div class="tank-d1" id="tank-d1" data-dom="1"></div>
              <div class="tank-d2" id="tank-d2" data-dom="2"></div>
              <div class="tank-line-plan"></div>
              <div class="tank-lbl-plan">${warnPlan}m\u00b3</div>
              <div class="tank-line-obs"></div>
              <div class="tank-lbl-obs">${warnObserve}m\u00b3</div>
            </div>
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
    const td1  = this.shadowRoot.getElementById('tank-d1');
    const td2  = this.shadowRoot.getElementById('tank-d2');
    const sec1 = this.shadowRoot.getElementById('sec1');
    const sec2 = this.shadowRoot.getElementById('sec2');
    if (!td1 || !td2) return;

    const highlight = (dom) => {
      if (dom === 1) {
        td1.classList.add('hovered');   td1.classList.remove('faded');
        td2.classList.add('faded');     td2.classList.remove('hovered');
        sec1.classList.add('hovered');  sec1.classList.remove('faded');
        sec2.classList.add('faded');    sec2.classList.remove('hovered');
      } else if (dom === 2) {
        td2.classList.add('hovered');   td2.classList.remove('faded');
        td1.classList.add('faded');     td1.classList.remove('hovered');
        sec2.classList.add('hovered');  sec2.classList.remove('faded');
        sec1.classList.add('faded');    sec1.classList.remove('hovered');
      } else {
        [td1, td2, sec1, sec2].forEach(el => el.classList.remove('hovered', 'faded'));
      }
    };

    td1.addEventListener('mouseenter', () => highlight(1));
    td2.addEventListener('mouseenter', () => highlight(2));
    td1.addEventListener('mouseleave', () => highlight(null));
    td2.addEventListener('mouseleave', () => highlight(null));

    /* touch */
    td1.addEventListener('touchstart', () => highlight(1), { passive: true });
    td2.addEventListener('touchstart', () => highlight(2), { passive: true });
    td1.addEventListener('touchend',   () => setTimeout(() => highlight(null), 600));
    td2.addEventListener('touchend',   () => setTimeout(() => highlight(null), 600));

    /* hover po sekcjach też podświetla zbiornik */
    sec1.addEventListener('mouseenter', () => highlight(1));
    sec2.addEventListener('mouseenter', () => highlight(2));
    sec1.addEventListener('mouseleave', () => highlight(null));
    sec2.addEventListener('mouseleave', () => highlight(null));
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