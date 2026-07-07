/**
 * aha-shared.js — wspólne stałe dla wszystkich kart awesome-ha
 * Musi być załadowany przed pozostałymi kartami.
 */
window.AHA = window.AHA || {};

window.AHA.MONTHS = [
  'stycznia','lutego','marca','kwietnia','maja','czerwca',
  'lipca','sierpnia','września','października','listopada','grudnia'
];

window.AHA.SZAMBO = {
  CLR_D1:      '#E8C468',
  CLR_D2:      '#5AC8FA',
  CLR_D1_OBS:  '#FFB347',
  CLR_D2_OBS:  '#FF9B85',
  CLR_D1_PLAN: '#FF6B6B',
  CLR_D2_PLAN: '#FF3B30',
};

// Apple-style dark theme — surfaces, status, text
window.AHA.THEME = {
  BG1:      '#1C1C1E',   // primary surface
  BG2:      '#2C2C2E',   // secondary surface
  BG3:      '#3A3A3C',   // tertiary surface
  BG4:      '#48484A',   // quaternary / muted element

  SUCCESS:  '#34C759',
  WARNING:  '#FF9500',
  ERROR:    '#FF453A',
  INFO:     '#5AC8FA',

  TEXT1:    'rgba(255,255,255,0.98)',
  TEXT2:    '#AEAEB2',
  TEXT3:    '#8E8E93',
  TEXT4:    '#636366',

  BORDER:   'rgba(255,255,255,0.08)',
};

// SF Pro font stack
window.AHA.FONT = "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif";
/**
 * action-apple-card.js — przycisk akcji + nawigacji, Apple Home Premium
 *
 * REDESIGN 2026:
 *   - Glass morphism backgrounds
 *   - Multi-layer gradients & glows
 *   - Enhanced animations (ripple, pulse, check)
 *   - SF Pro typography hierarchy
 *   - Premium confirm dialog
 *
 * INSTALACJA:
 *   1. Skopiuj do /config/www/action-apple-card.js
 *   2. Lovelace → Manage Resources → /local/action-apple-card.js (JavaScript Module)
 *
 * UŻYCIE — przycisk akcji (domyślny):
 *   type: custom:action-apple-card
 *   entity: script.otworz_brame
 *   name: Otwórz bramę
 *   icon: mdi:garage          # dowolna ikona MDI z HA
 *
 * UŻYCIE — przycisk kompaktowy (compact: true):
 *   type: custom:action-apple-card
 *   entity: cover.rollershutter_0008
 *   name: Roleta w górę
 *   icon: mdi:blinds-open
 *   compact: true
 *   tap_action:
 *     action: call-service
 *     service: cover.open_cover
 *     target:
 *       entity_id: cover.rollershutter_0008
 *
 * UŻYCIE — przycisk nawigacji (variant: nav):
 *   type: custom:action-apple-card
 *   name: Szambo
 *   icon: mdi:toilet
 *   variant: nav              # niebieski styl N2
 *   tap_action:
 *     action: navigate
 *     navigation_path: /dashboard-dom/3
 *
 * UŻYCIE — z warunkiem (czerwone podświetlenie gdy spełniony):
 *   type: custom:action-apple-card
 *   name: Szambo
 *   icon: mdi:toilet
 *   variant: nav
 *   condition:
 *     entity: sensor.szambo_zuzycie
 *     above: 8            # state > 8  (float)
 *     # below: 50         # state < 50 (float)
 *     # state: "on"       # dokładne dopasowanie stringa
 *   tap_action:
 *     action: navigate
 *     navigation_path: /dashboard-dom/3
 *
 * DOSTĘPNE tap_action.action:
 *   navigate      → navigation_path: /ścieżka
 *   call-service  → service: domain.action, service_data: {}
 *   toggle        → entity: (brana z entity lub tap_action.entity)
 *   url           → url_path: https://...
 *   none          → nic nie robi
 *   (brak)        → domyślne wywołanie serwisu encji
 *
 * WŁASNE IKONY (icon: bez "mdi:") — wbudowane fallbacki:
 *   garage, gate, blind, blind_up, blind_down, scene, light,
 *   fan, lock, unlock, home, bell, movie, party, sleep, away, poop
 */

const BUILTIN_ICONS = {
  garage:     'M19 9l-7-6-7 6v11h5v-5h4v5h5V9z',
  gate:       'M3 4h18v2H3V4zm0 3h18v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7zm8 2v6l4-3-4-3z',
  blind:      'M3 4h18v2H3V4zm0 3h18v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7zm8 2v6l4-3-4-3z',
  blind_up:   'M12 4l-8 8h5v8h6v-8h5z',
  blind_down: 'M12 20l8-8h-5V4H9v8H4z',
  scene:      'M12 2a10 10 0 100 20A10 10 0 0012 2zm-1 3v5.586l-2.707 2.707 1.414 1.414L12 14.414l3.293-3.293-1.414-1.414L13 11.586V7h-2z',
  light:      'M12 2a7 7 0 00-7 7c0 2.6 1.4 4.9 3.5 6.2V17a1 1 0 001 1h5a1 1 0 001-1v-1.8A7 7 0 0012 2zm-1 17h2v1a1 1 0 01-2 0v-1z',
  fan:        'M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0',
  lock:       'M18 8h-1V6A5 5 0 007 6v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4zm3.1-9H8.9V6a3.1 3.1 0 016.2 0v2z',
  unlock:     'M18 8h-1V6A5 5 0 007.1 5.1L9 7a3 3 0 015 2.1V8H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4z',
  home:       'M12 3L4 9v12h5v-7h6v7h5V9l-8-6z',
  bell:       'M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11a6 6 0 00-5-5.91V4a1 1 0 00-2 0v1.09A6 6 0 007 11v5l-2 2v1h14v-1l-2-2z',
  movie:      'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V4h-4z',
  party:      'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z',
  sleep:      'M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z',
  away:       'M13.49 5.48a3.5 3.5 0 11-3.5 3.5 3.5 3.5 0 013.5-3.5zm-7.5 15s-1 0-1-1 1-4 8.5-4 8.5 3 8.5 4-1 1-1 1h-15z',
  poop:       'M11 4c0-1.1.9-2 2-2s2 .9 2 2c0 .55-.22 1.05-.58 1.42C15.5 6.1 16.5 7.4 16.5 9c0 .35-.04.69-.11 1.01C17.84 10.34 19 11.55 19 13c0 1.5-1.1 2.78-2.56 2.97C16.62 16.27 17 16.88 17 17.5c0 1.38-1.34 2.5-3 2.5H10c-1.66 0-3-1.12-3-2.5 0-.62.38-1.23.56-1.53C6.1 15.78 5 14.5 5 13c0-1.45 1.16-2.66 2.61-2.99A4.496 4.496 0 018 9c0-1.6 1-2.9 2.42-3.57A2.01 2.01 0 0111 4z',
  play:       'M8 5v14l11-7z',
};

/* ------------------------------------------------------------------ */
/*  MDI icon resolver — używa ha-icon z HA jeśli dostępne             */
/* ------------------------------------------------------------------ */
function buildIconHTML(iconStr, size = 22) {
  if (!iconStr) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="${BUILTIN_ICONS.play}"/></svg>`;

  if (iconStr.startsWith('mdi:')) {
    return `<ha-icon icon="${iconStr}" style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;--mdc-icon-size:${size}px;"></ha-icon>`;
  }

  const path = BUILTIN_ICONS[iconStr] ?? BUILTIN_ICONS.play;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="${path}"/></svg>`;
}

/* ------------------------------------------------------------------ */

class ActionAppleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity && !config.tap_action) throw new Error('[action-apple-card] Podaj entity lub tap_action');
    this._config = config;
    this._confirmed = false;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const stateNow = hass.states[this._config.entity]?.attributes?.friendly_name;
    const conditionState = this._config.condition
      ? hass.states[this._config.condition.entity]?.state
      : null;

    if (
      !this._rendered ||
      stateNow !== this._lastFriendlyName ||
      conditionState !== this._lastConditionState
    ) {
      this._lastFriendlyName  = stateNow;
      this._lastConditionState = conditionState;
      this._render();
    }
  }

  getCardSize() { return 1; }

  _isNav() {
    return this._config.variant === 'nav' ||
      this._config.tap_action?.action === 'navigate' ||
      this._config.tap_action?.action === 'url';
  }

  /* ---------------------------------------------------------------- */
  /*  Ewaluacja warunku — "lambda" w YAML                              */
  /*                                                                   */
  /*  condition:                                                        */
  /*    entity: sensor.szambo_zuzycie                                  */
  /*    above: 8          →  state > 8   (porównanie float)            */
  /*    below: 50         →  state < 50  (porównanie float)            */
  /*    state: "on"       →  state === "on" (string)                   */
  /* ---------------------------------------------------------------- */
  _evalCondition() {
    const cond = this._config.condition;
    if (!cond || !this._hass) return false;

    const raw = this._hass.states[cond.entity]?.state;
    if (raw == null) return false;

    const val = parseFloat(raw);

    if (cond.above != null && !isNaN(val)) return val > cond.above;
    if (cond.below != null && !isNaN(val)) return val < cond.below;
    if (cond.state != null)                return raw === String(cond.state);

    return false;
  }

  _render() {
    this._rendered  = true;
    const cfg       = this._config;
    const isNav     = this._isNav();
    const isCompact = !!cfg.compact;
    const isDanger  = this._evalCondition();

    const name     = cfg.name ?? this._hass?.states?.[cfg.entity]?.attributes?.friendly_name ?? cfg.entity ?? '—';
    const iconSize = isCompact ? 18 : 22;
    const iconHTML = buildIconHTML(cfg.icon, iconSize);
    const subLabel = isNav ? (cfg.subtitle ?? 'otwórz panel') : null;

    /* kolory zależne od warunku */
    const idleColor      = isDanger ? '#FF453A'                       : '#8E8E93';
    const hoverColor     = isDanger ? '#FF3B30'                       : '#F5A623';
    const hoverGlow      = isDanger ? 'rgba(255,59,48,0.7)'           : 'rgba(245,166,35,0.7)';
    const hoverShadow    = isDanger ? 'rgba(255,59,48,0.25)'          : 'rgba(245,166,35,0.25)';
    const icBg           = isDanger ? '#3A1212'                       : '#242424';
    const icBorderTop    = isDanger ? '#5A2020'                       : '#404040';

    const navIconHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5AC8FA" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>`;
    const checkHTML   = `
      <svg width="${isCompact ? 11 : 14}" height="${isCompact ? 11 : 14}" viewBox="0 0 24 24" fill="none">
        <polyline class="check-path" points="4,12 10,18 20,6"
          stroke="#fff" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

    this.shadowRoot.innerHTML = `
      <style>
        @keyframes action-check {
          0%   { stroke-dashoffset: 30; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes action-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(0.96); }
          60%  { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        @keyframes action-ripple {
          0%   { transform: scale(0); opacity: 0.22; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        @keyframes action-danger-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255,59,48,0),
                        0 4px 16px rgba(0,0,0,0.2);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(255,59,48,0.3),
                        0 0 20px rgba(255,59,48,0.4),
                        0 4px 16px rgba(0,0,0,0.3);
          }
        }
        @keyframes action-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        :host { display: block; }

        .outer {
          border-radius: ${isCompact ? '52px' : cfg.pill ? '102px' : '20px'};
          padding: 0;
          background: transparent;
        }

        .card {
          background: linear-gradient(145deg,
            rgba(56,56,58,0.95) 0%,
            rgba(44,44,46,0.98) 100%);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border-radius: ${isCompact ? '50px' : cfg.pill ? '100px' : '18px'};
          padding: ${isNav ? '18px 20px' : isCompact ? '10px 14px' : '15px 18px'};
          display: flex;
          align-items: center;
          gap: ${isCompact ? '12px' : '16px'};
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          box-sizing: border-box;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 4px 16px rgba(0,0,0,0.2),
                      0 2px 4px rgba(0,0,0,0.1),
                      inset 0 1px 0 rgba(255,255,255,0.1);
          ${isDanger ? 'animation: action-danger-pulse 2.5s ease-in-out infinite;' : ''}
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

        .card:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3),
                      0 2px 8px rgba(0,0,0,0.15),
                      inset 0 1px 0 rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.12);
        }

        .card:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2),
                      0 1px 2px rgba(0,0,0,0.1),
                      inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .card.fired {
          animation: action-pop 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .rip {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle,
            rgba(255,255,255,0.4) 0%,
            rgba(255,255,255,0.2) 40%,
            transparent 70%);
          pointer-events: none;
          opacity: 0;
          transform: scale(0);
          margin-left: -40px;
          margin-top: -40px;
        }
        .card.fired .rip {
          animation: action-ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ic {
          width: ${isNav ? '52px' : isCompact ? '36px' : '48px'};
          height: ${isNav ? '52px' : isCompact ? '36px' : '48px'};
          border-radius: ${isNav ? '16px' : isCompact ? '11px' : '14px'};
          background: ${isDanger
            ? 'linear-gradient(135deg, rgba(58,18,18,0.8) 0%, rgba(44,14,14,0.9) 100%)'
            : isNav
              ? 'linear-gradient(135deg, rgba(28,42,58,0.6) 0%, rgba(18,32,48,0.8) 100%)'
              : 'linear-gradient(135deg, rgba(58,58,60,0.6) 0%, rgba(44,44,46,0.8) 100%)'};
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid ${isDanger
            ? 'rgba(255,59,48,0.2)'
            : isNav
              ? 'rgba(90,200,250,0.15)'
              : 'rgba(255,255,255,0.08)'};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${idleColor};
          flex-shrink: 0;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15),
                      inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .ic::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(circle at 30% 30%,
            ${isDanger
              ? 'rgba(255,69,58,0.15)'
              : isNav
                ? 'rgba(90,200,250,0.1)'
                : 'rgba(255,255,255,0.05)'} 0%,
            transparent 70%);
          pointer-events: none;
        }

        .card:hover .ic {
          color: ${hoverColor};
          background: ${isDanger
            ? 'linear-gradient(135deg, rgba(255,59,48,0.25) 0%, rgba(200,40,35,0.3) 100%)'
            : isNav
              ? 'linear-gradient(135deg, rgba(90,200,250,0.2) 0%, rgba(60,170,230,0.25) 100%)'
              : 'linear-gradient(135deg, rgba(245,166,35,0.2) 0%, rgba(220,150,30,0.25) 100%)'};
          border-color: ${isDanger
            ? 'rgba(255,59,48,0.4)'
            : isNav
              ? 'rgba(90,200,250,0.3)'
              : 'rgba(245,166,35,0.3)'};
          box-shadow: 0 0 20px ${hoverShadow},
                      0 0 40px ${hoverShadow},
                      0 4px 12px rgba(0,0,0,0.2),
                      inset 0 1px 0 rgba(255,255,255,0.15);
          transform: scale(1.05);
        }

        .card.fired .ic {
          background: ${isNav
            ? 'linear-gradient(135deg, rgba(90,200,250,0.35) 0%, rgba(60,170,230,0.4) 100%)'
            : 'linear-gradient(135deg, rgba(255,224,158,0.9) 0%, rgba(255,200,100,0.95) 100%)'};
          color: ${isNav ? '#5AC8FA' : '#8B5A00'};
          border-color: ${isNav ? 'rgba(90,200,250,0.5)' : 'rgba(255,200,100,0.6)'};
          box-shadow: 0 0 24px ${isNav ? 'rgba(90,200,250,0.4)' : 'rgba(245,166,35,0.5)'},
                      0 4px 12px rgba(0,0,0,0.2);
          transform: scale(1);
        }

        .texts {
          flex: 1;
          min-width: 0;
        }

        .title {
          font-size: ${isNav ? '17px' : isCompact ? '14px' : '15px'};
          font-weight: ${isNav ? '600' : '500'};
          letter-spacing: ${isNav ? '-0.4px' : '-0.3px'};
          color: rgba(255,255,255,0.98);
          font-family: -apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif;
          -webkit-font-smoothing: antialiased;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s ease;
        }

        .card:hover .title {
          color: rgba(255,255,255,1);
        }

        .sub {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: -0.1px;
          color: #5AC8FA;
          margin-top: 3px;
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: -apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif;
          -webkit-font-smoothing: antialiased;
          text-shadow: 0 0 8px rgba(90,200,250,0.3);
        }

        .badge {
          width: ${isNav ? '34px' : isCompact ? '24px' : '30px'};
          height: ${isNav ? '34px' : isCompact ? '24px' : '30px'};
          border-radius: 50%;
          background: ${isNav
            ? 'linear-gradient(135deg, rgba(28,42,58,0.8) 0%, rgba(18,32,48,0.95) 100%)'
            : 'linear-gradient(135deg, rgba(58,58,60,0.6) 0%, rgba(44,44,46,0.8) 100%)'};
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid ${isNav ? 'rgba(90,200,250,0.15)' : 'rgba(255,255,255,0.08)'};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 6px rgba(0,0,0,0.15),
                      inset 0 1px 0 rgba(255,255,255,0.08);
          position: relative;
        }

        .badge::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(circle at 40% 30%,
            ${isNav ? 'rgba(90,200,250,0.15)' : 'rgba(255,255,255,0.08)'} 0%,
            transparent 70%);
          pointer-events: none;
        }

        .card:hover .badge {
          transform: scale(1.08);
          box-shadow: 0 0 12px ${isNav ? 'rgba(90,200,250,0.25)' : 'rgba(245,166,35,0.2)'},
                      0 2px 8px rgba(0,0,0,0.2),
                      inset 0 1px 0 rgba(255,255,255,0.12);
          border-color: ${isNav ? 'rgba(90,200,250,0.3)' : 'rgba(245,166,35,0.2)'};
        }

        .card.fired .badge {
          background: ${isNav
            ? 'linear-gradient(135deg, rgba(90,200,250,0.35) 0%, rgba(60,170,230,0.4) 100%)'
            : 'linear-gradient(135deg, rgba(52,199,89,0.9) 0%, rgba(40,180,70,0.95) 100%)'};
          border-color: ${isNav ? 'rgba(90,200,250,0.5)' : 'rgba(52,199,89,0.6)'};
          box-shadow: 0 0 20px ${isNav ? 'rgba(90,200,250,0.5)' : 'rgba(52,199,89,0.6)'},
                      0 2px 8px rgba(0,0,0,0.2);
          transform: scale(1);
        }

        .check-path {
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
          filter: drop-shadow(0 0 2px rgba(255,255,255,0.3));
        }

        .card.fired .check-path {
          animation: action-check 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.05s;
        }
      </style>

      <div class="outer">
        <div class="card" id="card">
          <div class="rip" id="rip"></div>
          <div class="ic">${iconHTML}</div>
          <div class="texts">
            <div class="title">${name}</div>
            ${isNav ? `<div class="sub">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#5AC8FA">
                <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
              </svg>
              ${subLabel}
            </div>` : ''}
          </div>
          <div class="badge">
            ${isNav ? navIconHTML : checkHTML}
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('card').addEventListener('click', e => this._handleTap(e));
  }

  _handleTap(e) {
    if (this._config.confirm) {
      this._showConfirm();
      return;
    }
    this._execute(e);
  }

  _showConfirm() {
    const msg     = this._config.confirm_text   ?? 'Czy na pewno?';
    const confirm = this._config.confirm_ok     ?? 'Tak, wykonaj';
    const cancel  = this._config.confirm_cancel ?? 'Anuluj';

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9999;
      background:rgba(0,0,0,0.75);
      backdrop-filter:blur(20px);
      -webkit-backdrop-filter:blur(20px);
      display:flex;align-items:center;justify-content:center;
      font-family:-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif;
      animation:action-fade-in 0.2s ease;
    `;

    overlay.innerHTML = `
      <style>
        @keyframes action-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes action-modal-in {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .action-modal {
          animation: action-modal-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .action-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .action-btn:hover {
          transform: translateY(-1px);
        }
        .action-btn:active {
          transform: translateY(0) scale(0.98);
        }
      </style>
      <div class="action-modal" style="
        background:linear-gradient(145deg, rgba(44,44,46,0.95) 0%, rgba(28,28,30,0.98) 100%);
        backdrop-filter:blur(40px);
        -webkit-backdrop-filter:blur(40px);
        border-radius:24px;
        padding:28px 24px 20px;
        width:300px;
        box-sizing:border-box;
        border:1px solid rgba(255,255,255,0.1);
        box-shadow:0 20px 60px rgba(0,0,0,0.5),
                   0 8px 24px rgba(0,0,0,0.3),
                   inset 0 1px 0 rgba(255,255,255,0.1);
        text-align:center;
      ">
        <div style="
          width:56px;height:56px;border-radius:50%;
          background:linear-gradient(135deg, rgba(255,149,0,0.2) 0%, rgba(200,110,0,0.25) 100%);
          backdrop-filter:blur(10px);
          -webkit-backdrop-filter:blur(10px);
          border:1px solid rgba(255,149,0,0.3);
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 18px;
          box-shadow:0 0 20px rgba(255,149,0,0.3),
                     0 4px 12px rgba(0,0,0,0.2),
                     inset 0 1px 0 rgba(255,255,255,0.15);
        ">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <circle cx="12" cy="17" r="0.5" fill="#FF9500"/>
          </svg>
        </div>
        <div style="
          font-size:17px;font-weight:600;letter-spacing:-0.4px;
          color:rgba(255,255,255,0.98);margin-bottom:8px;
          text-shadow:0 1px 2px rgba(0,0,0,0.3);
        ">${msg}</div>
        <div style="
          font-size:13px;font-weight:400;letter-spacing:-0.1px;
          color:rgba(142,142,147,0.9);margin-bottom:24px;
          line-height:1.4;
        ">Tej akcji nie można cofnąć.</div>
        <div style="display:flex;gap:10px;">
          <button id="conf-cancel" class="action-btn" style="
            flex:1;padding:14px;border-radius:14px;border:none;cursor:pointer;
            background:linear-gradient(135deg, rgba(58,58,60,0.8) 0%, rgba(44,44,46,0.9) 100%);
            backdrop-filter:blur(10px);
            -webkit-backdrop-filter:blur(10px);
            color:rgba(174,174,178,0.95);
            font-size:15px;font-weight:500;letter-spacing:-0.2px;
            font-family:inherit;
            border:1px solid rgba(255,255,255,0.08);
            box-shadow:0 2px 8px rgba(0,0,0,0.2),
                       inset 0 1px 0 rgba(255,255,255,0.08);
          ">${cancel}</button>
          <button id="conf-ok" class="action-btn" style="
            flex:1;padding:14px;border-radius:14px;border:none;cursor:pointer;
            background:linear-gradient(135deg, #FF9500 0%, #E68600 100%);
            color:#fff;
            font-size:15px;font-weight:600;letter-spacing:-0.2px;
            font-family:inherit;
            border:1px solid rgba(255,170,50,0.4);
            box-shadow:0 0 20px rgba(255,149,0,0.3),
                       0 4px 12px rgba(0,0,0,0.3),
                       inset 0 1px 0 rgba(255,255,255,0.2);
            text-shadow:0 1px 2px rgba(0,0,0,0.2);
          ">${confirm}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#conf-cancel').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    overlay.querySelector('#conf-ok').addEventListener('click', () => {
      document.body.removeChild(overlay);
      this._execute(null);
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) document.body.removeChild(overlay);
    });
  }

  _execute(e) {
    const card = this.shadowRoot.getElementById('card');
    const rip  = this.shadowRoot.getElementById('rip');
    if (card && rip && e) {
      const rect = card.getBoundingClientRect();
      rip.style.left = (e.clientX - rect.left) + 'px';
      rip.style.top  = (e.clientY - rect.top)  + 'px';
    }
    if (card) {
      card.classList.remove('fired');
      void card.offsetWidth;
      card.classList.add('fired');
      setTimeout(() => card.classList.remove('fired'), 900);
    }

    const tapAction = this._config.tap_action;

    if (tapAction) {
      switch (tapAction.action) {
        case 'navigate':
          window.history.pushState(null, '', tapAction.navigation_path);
          window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
          break;
        case 'url':
          window.open(tapAction.url_path, tapAction.target ?? '_blank');
          break;
        case 'call-service': {
          const [domain, service] = (tapAction.service ?? '').split('.');
          this._hass?.callService(domain, service, tapAction.service_data ?? {});
          break;
        }
        case 'toggle':
          if (this._hass && this._config.entity) {
            const domain = this._config.entity.split('.')[0];
            this._hass.callService(domain, 'toggle', { entity_id: this._config.entity });
          }
          break;
        case 'none':
          break;
      }
      return;
    }

    /* domyślne — wywołaj serwis encji */
    if (!this._hass || !this._config.entity) return;
    const entityId = this._config.entity;
    const domain   = entityId.split('.')[0];
    const svcMap   = {
      script:        ['script',        'turn_on'],
      scene:         ['scene',         'turn_on'],
      switch:        ['switch',        'toggle'],
      input_boolean: ['input_boolean', 'toggle'],
      light:         ['light',         'toggle'],
      cover:         ['cover',         'toggle'],
      lock:          ['lock',          'toggle'],
      fan:           ['fan',           'toggle'],
      button:        ['button',        'press'],
      input_button:  ['input_button',  'press'],
    };
    const [sd, sa] = svcMap[domain] ?? [domain, 'turn_on'];
    this._hass.callService(sd, sa, { entity_id: entityId });
  }
}

customElements.define('aha-action-apple-card', ActionAppleCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-action-apple-card',
  name:        'Action Apple Card',
  preview:     false,
  description: 'Premium action & navigation button — Apple Home style with glass morphism, gradient layers, smooth animations.',
});/**
 * entries-apple-card.js — ostatnie wjazdy, Apple Home style
 *
 * input_text.wjazd_x  →  format: "tk|2026-03-19 08:25:26"
 *
 * INSTALACJA:
 *   1. Skopiuj do /config/www/entries-apple-card.js
 *   2. Lovelace → Manage Resources → /local/entries-apple-card.js (JavaScript Module)
 *
 * UŻYCIE:
 *   type: custom:entries-apple-card
 *   title: Wjazdy
 *   entities:
 *     - input_text.wjazd_1
 *     - input_text.wjazd_2
 *     - input_text.wjazd_3
 *   persons:
 *     tk: person.tk
 *     mk: person.mk
 *
 * REDESIGN 2026:
 *   - Glass morphism background
 *   - Gradient timeline z opacity fadeout
 *   - Dynamic color accents (recent vs old)
 *   - Glow effects & smooth animations
 *   - SF Pro typography hierarchy
 */

const _ICON_CAR = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 17h14v-4H5v4z"/>
  <path d="M5 13L7 8h10l2 5"/>
  <circle cx="7.5" cy="17" r="1.5" fill="currentColor"/>
  <circle cx="16.5" cy="17" r="1.5" fill="currentColor"/>
  <path d="M8 13h8"/>
</svg>`;

const _ICON_PERSON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
  <circle cx="12" cy="7" r="4"/>
  <path d="M4 21c0-3.9 3.1-7 7-8h2c3.9 1 7 4.1 7 8v0H4z" opacity="0.8"/>
</svg>`;

const _ICON_CHEVRON_DOWN = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 9l6 6 6-6"/>
</svg>`;

const _ICON_CHEVRON_UP = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M18 15l-6-6-6 6"/>
</svg>`;

class EntriesAppleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._expanded = false;
    this._lastKey  = null; // dirty-check
  }

  setConfig(config) {
    if (!config.entities?.length) throw new Error('[entries-apple-card] Wymagane: entities');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;

    // Dirty-check: zbierz stany encji + stan rozwinięcia w jeden string
    const key = (this._config.entities ?? [])
      .map(id => hass.states[id]?.state ?? '')
      .join('|') + '|' + this._expanded;

    if (key === this._lastKey) return; // nic się nie zmieniło — pomiń render
    this._lastKey = key;

    this._render();
  }

  getCardSize() { return 2; }

  _resolvePerson(personId) {
    const map      = this._config.persons ?? {};
    const entityId = map[personId] ?? `person.${personId}`;
    const entity   = this._hass.states[entityId];
    if (!entity) return { name: personId, picture: null };
    return {
      name:    entity.attributes?.friendly_name ?? personId,
      picture: entity.attributes?.entity_picture ?? null,
    };
  }

  _relativeTime(ts) {
    if (!ts || isNaN(ts)) return '';

    const now     = new Date();
    const date    = new Date(ts);
    const diffMs  = now - ts;
    const diffMin = Math.round(diffMs / 60_000);
    const diffH   = Math.floor(diffMin / 60);

    const hhmm = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

    if (diffMin < 1)  return 'teraz';
    if (diffMin < 60) return `${diffMin} min temu`;

    const sameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth()    === b.getMonth()    &&
      a.getDate()     === b.getDate();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (sameDay(date, now))       return `dziś @ ${hhmm}  (${diffH}h temu)`;
    if (sameDay(date, yesterday)) return `wczoraj @ ${hhmm}`;

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);

    if (date >= startOfWeek) {
      const dayName = date.toLocaleDateString('pl-PL', { weekday: 'long' });
      return `${dayName} @ ${hhmm}`;
    }

    const dateLabel = date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
    return `${dateLabel} @ ${hhmm}`;
  }

  _parseEntry(id) {
    const state = this._hass.states[id];
    if (!state) return { empty: true };

    const raw = (state.state ?? '').trim();
    const pipeIdx = raw.indexOf('|');
    if (!raw || raw === '-' || pipeIdx === -1) return { empty: true };

    const personId = raw.slice(0, pipeIdx).trim();
    const tsRaw    = raw.slice(pipeIdx + 1).trim();

    if (!personId || personId === 'unknown' || personId === 'unavailable') return { empty: true };

    const ts = new Date(tsRaw.replace(' ', 'T')).getTime();

    const person = this._resolvePerson(personId);
    return {
      empty:     false,
      name:      person.name,
      picture:   person.picture,
      ts:        isNaN(ts) ? Date.now() : ts,
      timeLabel: this._relativeTime(isNaN(ts) ? Date.now() : ts),
    };
  }

  _avatarImg(entry, size, border, shadow = false) {
    const shadowStyle = shadow ? 'box-shadow:0 4px 12px rgba(0,0,0,0.3), 0 0 20px rgba(255,149,0,0.2);' : 'box-shadow:0 2px 6px rgba(0,0,0,0.15);';
    const s = `width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid ${border};${shadowStyle}transition:transform 0.2s cubic-bezier(0.4,0,0.2,1);`;
    return entry.picture
      ? `<img style="${s}" src="${entry.picture}" alt="${entry.name}">`
      : `<div style="${s}background:linear-gradient(135deg,#3A3A3C 0%,#2C2C2E 100%);display:flex;align-items:center;justify-content:center;color:#8E8E93;">${_ICON_PERSON}</div>`;
  }

  _render() {
    if (!this._hass || !this._config) return;

    const title    = this._config.title    ?? 'Ostatnie wjazdy';
    const entities = this._config.entities ?? [];
    const MAX_SHOW  = 3;
    const GROUP_MS  = 60_000;

    const entries = entities.map(id => this._parseEntry(id));
    const filled  = entries.filter(e => !e.empty).sort((a, b) => b.ts - a.ts);

    const groups = [];
    for (const entry of filled) {
      const last = groups[groups.length - 1];
      if (last && Math.abs(entry.ts - last[0].ts) < GROUP_MS) {
        last.push(entry);
      } else {
        groups.push([entry]);
      }
    }

    const visibleGroups  = this._expanded ? groups.slice(0, MAX_SHOW) : groups.slice(0, 1);
    const hasMore        = groups.length > 1;
    const remainingCount = Math.min(groups.length - 1, MAX_SHOW - 1);

    // Stała wysokość wiersza — używamy transform do animacji, nie height
    const ROW_H_FIRST = 68; // px - większy na first entry
    const ROW_H_OTHER = 56; // px

    const rowsHTML = visibleGroups.map((group, gi) => {
      const isFirst = gi === 0;
      const age = gi; // 0 = latest, 1 = older, 2 = oldest

      const together = group.length > 1;
      const names    = group.map(e => e.name).join(' & ');
      const time     = group[0].timeLabel;

      // Dynamiczne kolory akcent ów — recent = żywy, old = wygaszony
      const accentColor = isFirst ? '#FF9500' : age === 1 ? '#8E8E93' : '#636366';
      const dotSize     = isFirst ? 13 : 10;
      const dotGlow     = isFirst ? 'box-shadow:0 0 12px rgba(255,149,0,0.6), 0 0 24px rgba(255,149,0,0.3);' : '';

      const avSize   = isFirst ? 48 : 38;
      const avBorder = isFirst ? '#FF9500' : '#48484A';
      const avShadow = isFirst;
      const rowH     = isFirst ? ROW_H_FIRST : ROW_H_OTHER;

      const avatarBlock = together
        ? `<div class="av-group${isFirst ? ' recent' : ''}">${group.map((e, ei) =>
            this._avatarImg(e, 32, accentColor, avShadow).replace('style="', `style="${ei > 0 ? 'margin-left:-12px;z-index:' + (10 - ei) + ';' : 'z-index:10;'}`)
          ).join('')}</div>`
        : `<div class="av-single">${this._avatarImg(group[0], avSize, avBorder, avShadow)}</div>`;

      return `
        <div class="tl-row${isFirst ? ' latest' : ''}" style="height:${rowH}px;">
          <div class="tl-dot${isFirst ? ' latest' : ''}" style="width:${dotSize}px;height:${dotSize}px;background:${accentColor};${dotGlow}"></div>
          ${avatarBlock}
          <div class="tl-info">
            <div class="tl-name${isFirst ? ' big' : age === 1 ? ' medium' : ' old'}">${names}</div>
            ${together ? `<div class="tl-sub">razem</div>` : ''}
          </div>
          <div class="tl-time${isFirst ? ' latest' : ''}">${time}</div>
        </div>`;
    }).join('');

    const toggleBtn = hasMore ? `
      <button class="toggle-btn" id="toggle-btn">
        ${this._expanded
          ? `<span>zwiń</span>${_ICON_CHEVRON_UP}`
          : `<span>+${remainingCount} wcześniej</span>${_ICON_CHEVRON_DOWN}`
        }
      </button>` : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        @keyframes entries-glow-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        @keyframes entries-line-fade {
          from { opacity: 0; transform: scaleY(0.5); }
          to { opacity: 1; transform: scaleY(1); }
        }

        .card {
          background: linear-gradient(145deg, rgba(28,28,30,0.95) 0%, rgba(18,18,20,0.98) 100%);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-radius: 20px;
          padding: 18px;
          box-sizing: border-box;
          font-family: -apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif;
          -webkit-font-smoothing: antialiased;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2);
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
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
          pointer-events: none;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .header-ic {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(255,149,0,0.15) 0%, rgba(255,149,0,0.08) 100%);
          border: 1px solid rgba(255,149,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FF9500;
          box-shadow: 0 2px 8px rgba(255,149,0,0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .header-ic:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(255,149,0,0.25);
        }

        .header-title {
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.2px;
          color: rgba(255,255,255,0.95);
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .tl {
          position: relative;
          padding-left: 28px;
        }

        .tl-line {
          position: absolute;
          left: 6px;
          top: 20px;
          bottom: 20px;
          width: 2px;
          background: linear-gradient(180deg,
            rgba(255,149,0,0.4) 0%,
            rgba(142,142,147,0.3) 30%,
            rgba(99,99,102,0.2) 70%,
            transparent 100%);
          border-radius: 2px;
          animation: entries-line-fade 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tl-row {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          box-sizing: border-box;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tl-row.latest {
          margin-bottom: 8px;
        }

        .tl-dot {
          position: absolute;
          left: -24px;
          border-radius: 50%;
          border: 2.5px solid rgba(28,28,30,0.95);
          flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tl-dot.latest {
          animation: entries-glow-pulse 2.5s ease-in-out infinite;
        }

        .av-single {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        .av-group {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          border-radius: 50px;
          padding: 3px 8px 3px 3px;
          background: rgba(255,149,0,0.08);
          border: 1.5px solid rgba(255,149,0,0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .av-group.recent {
          background: rgba(255,149,0,0.12);
          border-color: rgba(255,149,0,0.5);
          box-shadow: 0 4px 12px rgba(255,149,0,0.2);
        }

        .tl-info {
          flex: 1;
          min-width: 0;
        }

        .tl-name {
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.3px;
          color: rgba(255,255,255,0.85);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.3s ease;
        }

        .tl-name.big {
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.4px;
          color: rgba(255,255,255,0.98);
        }

        .tl-name.medium {
          color: rgba(255,255,255,0.70);
        }

        .tl-name.old {
          font-size: 14px;
          font-weight: 400;
          color: rgba(142,142,147,0.8);
        }

        .tl-sub {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,149,0,0.7);
          margin-top: 2px;
          letter-spacing: 0.1px;
        }

        .tl-time {
          font-size: 12px;
          font-weight: 400;
          color: rgba(142,142,147,0.8);
          white-space: nowrap;
          flex-shrink: 0;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.1px;
        }

        .tl-time.latest {
          font-size: 13px;
          font-weight: 500;
          color: #FF9500;
          text-shadow: 0 0 8px rgba(255,149,0,0.3);
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin: 12px auto 0;
          background: linear-gradient(135deg, rgba(44,44,46,0.8) 0%, rgba(58,58,60,0.6) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          color: rgba(174,174,178,0.95);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: -0.2px;
          padding: 8px 16px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .toggle-btn:hover {
          background: linear-gradient(135deg, rgba(58,58,60,0.9) 0%, rgba(72,72,74,0.7) 100%);
          border-color: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.95);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .toggle-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      </style>
      <div class="card">
        <div class="header">
          <div class="header-ic">${_ICON_CAR}</div>
          <div class="header-title">${title}</div>
        </div>
        <div class="tl">
          <div class="tl-line"></div>
          ${rowsHTML}
        </div>
        ${toggleBtn}
      </div>`;

    const btn = this.shadowRoot.getElementById('toggle-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        this._expanded = !this._expanded;
        this._lastKey  = null; // wymuś re-render po kliknięciu
        this._render();
      });
    }
  }
}

customElements.define('aha-entries-apple-card', EntriesAppleCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'aha-entries-apple-card',
  name: 'Entries Apple Card',
  description: 'Apple Home style timeline ostatnich wjazdów z glass morphism i smooth animations.',
  preview: false,
});/**
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
          background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
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
          background: rgba(255,255,255,0.06);
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
          background: rgba(255,255,255,0.08); border-radius: 10px;
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

customElements.define('aha-garden-meters-card', GardenMetersCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-garden-meters-card',
  name:        'Garden Meters Card',
  preview:     false,
  description: 'Liczniki ogrodowe z edycją inline, statusem per-licznik i osobnymi przyciskami zapisu.',
});
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
      slim:                config.slim                ?? false,
    };
  }

  set hass(hass) {
    this._hass = hass;
    this._config.slim ? this._renderSlim() : this._render();
  }

  getCardSize() { return this._config?.slim ? 2 : 4; }

  _val(id) {
    if (!id || !this._hass) return 0;
    const v = parseFloat(this._hass.states[id]?.state);
    return isNaN(v) ? 0 : v;
  }

  _renderTankSVG(d1pct, d2pct, emptPct, totalPct, observePct, planPct, clrD1, clrD2, warnObserve, warnPlan, tankH = 260) {
    // Isometric projection: 30° angles
    // Tank dimensions
    const w = 50;  // width
    const d = 30;  // depth
    const h = tankH; // height

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
    const { CLR_D1, CLR_D2, CLR_D1_OBS, CLR_D2_OBS, CLR_D1_PLAN, CLR_D2_PLAN } = window.AHA.SZAMBO;

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

    // Zbiornik wizualizuje tylko zużycie szamba (nie ogrodu — ogród nie wpada do zbiornika)
    const d2pct   = pct(d2sz);
    const d1pct   = pct(d1sz);
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

  _renderSlim() {
    if (!this._hass) return;
    const { CLR_D1, CLR_D2, CLR_D1_OBS, CLR_D2_OBS, CLR_D1_PLAN, CLR_D2_PLAN } = window.AHA.SZAMBO;
    // SLIM — full rewrite

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

    const dom1zl  = this._val(this._config.entity_dom1_zaplata);
    const dom2zl  = this._val(this._config.entity_dom2_zaplata);
    const fmtZl   = v => v.toFixed(2).replace('.', ',');

    const staleOn = this._config.entity_stale
      ? this._hass.states[this._config.entity_stale]?.state === 'on'
      : false;

    const pct = v => Math.min(Math.round((v / cap) * 100), 100);
    const fmt = v => v.toFixed(2).replace('.', ',');

    const totalPct   = pct(total);
    const observePct = pct(warnObserve);
    const planPct    = pct(warnPlan);
    const d1pct      = pct(d1sz);
    const d2pct      = pct(d2sz);
    const emptPct    = Math.max(0, 100 - d1pct - d2pct);

    const isPlan    = total >= warnPlan;
    const isObserve = !isPlan && total >= warnObserve;
    const isOk      = !isPlan && !isObserve;

    const clrD1    = isPlan ? CLR_D1_PLAN : isObserve ? CLR_D1_OBS : CLR_D1;
    const clrD2    = isPlan ? CLR_D2_PLAN : isObserve ? CLR_D2_OBS : CLR_D2;
    const totalClr = isPlan ? '#FF3B30' : isObserve ? '#FF9500' : '#34C759';

    const alertTxt   = isPlan    ? 'Zam\u00f3w wyw\u00f3z!'
                     : isObserve ? 'Obserwuj'
                     :             'W normie';
    const alertBgRgb = isPlan ? '255,59,48' : isObserve ? '255,149,0' : '52,199,89';

    const tankSvg = this._renderTankSVG(
      d1pct, d2pct, emptPct, totalPct, observePct, planPct,
      clrD1, clrD2, warnObserve, warnPlan, 140
    );

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        @keyframes szambo-slim-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(${alertBgRgb},0); }
          50%       { box-shadow: 0 0 0 5px rgba(${alertBgRgb},0.18); }
        }
        @keyframes szambo-liquid-flow {
          0%, 100% { opacity: 0.88; }
          50%       { opacity: 0.96; }
        }

        .card {
          background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
          border-radius: 16px;
          padding: 14px 16px;
          box-sizing: border-box;
          font-family: -apple-system, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          border: 0.5px solid ${!isOk ? `rgba(${alertBgRgb},0.30)` : 'rgba(255,255,255,0.08)'};
          display: flex;
          gap: 12px;
          align-items: stretch;
          transition: border-color 0.4s ease;
          ${!isOk ? `animation: szambo-slim-pulse ${isPlan ? '2s' : '3s'} ease-in-out infinite;` : ''}
        }
        .card:active { transform: scale(0.97); transition: transform 0.15s ease; }

        .color-bar {
          width: 4px;
          border-radius: 3px;
          background: ${totalClr};
          flex-shrink: 0;
          align-self: stretch;
          transition: background 0.4s ease;
        }

        /* tank */
        .tank-col {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .tank-svg {
          height: 140px;
          width: auto;
          filter: drop-shadow(1px 2px 6px rgba(0,0,0,0.35));
        }
        .liquid-d1 { animation: szambo-liquid-flow 4s ease-in-out infinite; }
        .liquid-d2 { animation: szambo-liquid-flow 4.5s ease-in-out infinite; }

        /* middle data */
        .data {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .title {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.90);
          letter-spacing: -0.2px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 500;
          color: ${totalClr};
          background: rgba(${alertBgRgb},0.16);
          border-radius: 6px;
          padding: 2px 6px;
        }
        .badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: ${totalClr};
          flex-shrink: 0;
        }
        .stale-chip {
          font-size: 10px;
          font-weight: 500;
          color: #FFD60A;
          background: rgba(255,214,10,0.12);
          border-radius: 5px;
          padding: 1px 5px;
        }

        .div {
          height: 1px;
          background: rgba(58,58,60,0.7);
          border-radius: 1px;
        }

        /* dom section — horizontal layout */
        .houses {
          display: flex;
          gap: 0;
          align-items: flex-start;
        }
        .dom {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .dom-sep {
          width: 1px;
          background: rgba(58,58,60,0.9);
          align-self: stretch;
          margin: 0 10px;
          flex-shrink: 0;
        }
        .dom-header {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .dom-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dom-name {
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.70);
          letter-spacing: 0.1px;
          text-transform: uppercase;
        }
        .dom-vals {
          display: flex;
          gap: 8px;
        }
        .val-group {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .val-lbl {
          font-size: 9px;
          font-weight: 400;
          color: rgba(142,142,147,0.55);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .val-num {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.95);
          letter-spacing: -0.3px;
          font-variant-numeric: tabular-nums;
        }
        .val-unit {
          font-size: 10px;
          font-weight: 400;
          color: rgba(142,142,147,0.6);
          margin-left: 1px;
        }

        .billing {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .billing-lbl {
          font-size: 10px;
          font-weight: 500;
          color: rgba(142,142,147,0.50);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .billing-val {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.60);
          font-variant-numeric: tabular-nums;
        }
        .billing-sep {
          color: rgba(142,142,147,0.30);
          font-size: 10px;
        }

        /* right metric — big value */
        .metric {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          gap: 3px;
        }
        .metric-val {
          font-size: 26px;
          font-weight: 600;
          letter-spacing: -1px;
          color: ${totalClr};
          line-height: 1;
          font-variant-numeric: tabular-nums;
          transition: color 0.4s ease;
        }
        .metric-unit {
          font-size: 11px;
          font-weight: 400;
          color: rgba(142,142,147,0.65);
          text-align: right;
        }
        .metric-pct {
          font-size: 15px;
          font-weight: 600;
          color: rgba(142,142,147,0.80);
          font-variant-numeric: tabular-nums;
          text-align: right;
        }
      </style>

      <div class="card">
        <div class="color-bar"></div>

        <div class="tank-col">${tankSvg}</div>

        <div class="data">
          <div class="title-row">
            <span class="title">Szambo</span>
            <span class="badge"><span class="badge-dot"></span>${alertTxt}</span>
            ${staleOn ? '<span class="stale-chip">\u26a0\ufe0f og.</span>' : ''}
          </div>

          <div class="div"></div>

          <div class="houses">
            <div class="dom">
              <div class="dom-header">
                <div class="dom-dot" style="background:${clrD1};"></div>
                <span class="dom-name">${dom1Name}</span>
              </div>
              <div class="dom-vals">
                <div class="val-group">
                  <span class="val-lbl">Woda</span>
                  <span class="val-num">${fmt(d1sz)}<span class="val-unit">&nbsp;m\u00b3</span></span>
                </div>
                <div class="val-group">
                  <span class="val-lbl">Ogr\u00f3d</span>
                  <span class="val-num">${fmt(d1og)}<span class="val-unit">&nbsp;m\u00b3</span></span>
                </div>
              </div>
            </div>

            <div class="dom-sep"></div>

            <div class="dom">
              <div class="dom-header">
                <div class="dom-dot" style="background:${clrD2};"></div>
                <span class="dom-name">${dom2Name}</span>
              </div>
              <div class="dom-vals">
                <div class="val-group">
                  <span class="val-lbl">Woda</span>
                  <span class="val-num">${fmt(d2sz)}<span class="val-unit">&nbsp;m\u00b3</span></span>
                </div>
                <div class="val-group">
                  <span class="val-lbl">Ogr\u00f3d</span>
                  <span class="val-num">${fmt(d2og)}<span class="val-unit">&nbsp;m\u00b3</span></span>
                </div>
              </div>
            </div>
          </div>

          ${(dom1zl > 0 || dom2zl > 0) ? `
          <div class="div"></div>
          <div class="billing">
            <span class="billing-lbl">Rozlicz.</span>
            <span class="billing-val">${fmtZl(dom1zl)}&nbsp;z\u0142</span>
            <span class="billing-sep">/</span>
            <span class="billing-val">${fmtZl(dom2zl)}&nbsp;z\u0142</span>
          </div>` : ''}
        </div>

        <div class="metric">
          <div class="metric-val">${fmt(total)}</div>
          <div class="metric-unit">m\u00b3</div>
          <div class="metric-pct">${totalPct}%</div>
        </div>
      </div>
    `;
  }

  _hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `${r},${g},${b}`;
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

customElements.define('aha-szambo-apple-card', SzamboAppleCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-szambo-apple-card',
  name:        'Szambo Apple Card',
  preview:     false,
  description: 'Premium septic tank visualization — Apple Home style with 3D liquid tank, glass morphism, gradient effects, interactive highlighting & smooth animations.',
});/**
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
  GREEN:  window.AHA.THEME.SUCCESS,
  ORANGE: window.AHA.THEME.WARNING,
  RED:    window.AHA.THEME.ERROR,
  BLUE:   window.AHA.THEME.INFO,
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
      slim: config.slim ?? false,
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
    return this._config?.slim ? 1 : 2;
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
    style.textContent = this._config.slim ? this._getSlimStyles() : this._getStyles();
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

    const args = { noData, isFull, daysInt, daysLabel, dayName, dateStr, accentClr, barColor, fillPct, current, cap, rate, weekly, remaining, fmt, fmt2 };
    card.innerHTML = this._config.slim
      ? this._renderSlimContent(args)
      : this._renderContent(args);
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

  _renderSlimContent({ noData, isFull, daysInt, daysLabel, dayName, dateStr, accentClr, barColor, fillPct, current, cap, rate, remaining, fmt, fmt2 }) {
    const alertBgRgb = accentClr === COLORS.RED ? '255,59,48' : accentClr === COLORS.ORANGE ? '255,149,0' : accentClr === COLORS.BLUE ? '10,132,255' : '52,199,89';

    if (noData || isFull) {
      return `
        <div class="color-bar" style="background:${COLORS.RED}"></div>
        <div class="body">
          <div class="content">
            <div class="title-row">
              <span class="title">Wywóz szamba</span>
              <span class="badge" style="color:${COLORS.RED};background:rgba(255,59,48,0.16);">
                <span class="badge-dot" style="background:${COLORS.RED}"></span>
                ${isFull ? 'Szambo pełne!' : 'Brak danych'}
              </span>
            </div>
            <div class="sub">${isFull ? 'Wywóz natychmiast' : 'Za mało historii zużycia'}</div>
          </div>
          <div class="metric"><div class="metric-val" style="color:${COLORS.RED}">!</div></div>
        </div>
      `;
    }

    return `
      <div class="color-bar" style="background:${accentClr}"></div>
      <div class="body">
        <div class="content">
          <div class="title-row">
            <span class="title">Wywóz szamba</span>
            <span class="badge" style="color:${accentClr};background:rgba(${alertBgRgb},0.16);">
              <span class="badge-dot" style="background:${accentClr}"></span>
              ${accentClr === COLORS.RED ? 'Zaplanuj!' : accentClr === COLORS.ORANGE ? 'Obserwuj' : 'W terminie'}
            </span>
          </div>
          <div class="date-row">
            <span class="date-icon">📅</span>
            <span class="date-name" style="color:${accentClr}">${dayName}</span>
            <span class="date-str">${dateStr}</span>
          </div>
        </div>
        <div class="metric">
          <div class="metric-val" style="color:${accentClr}">${daysInt}</div>
          <div class="metric-lbl">${daysLabel}</div>
        </div>
      </div>
    `;
  }

  _getSlimStyles() {
    return `
      :host { display: block; }
      .card {
        background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
        border-radius: 16px;
        padding: 14px 16px;
        box-sizing: border-box;
        font-family: -apple-system, system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
        border: 0.5px solid rgba(255,255,255,0.08);
        cursor: pointer;
        display: flex;
        gap: 12px;
        align-items: stretch;
      }
      .card:active { transform: scale(0.97); transition: transform 0.15s ease; }

      .color-bar {
        width: 4px;
        border-radius: 3px;
        flex-shrink: 0;
        align-self: stretch;
        transition: background 0.4s ease;
      }

      .body {
        flex: 1;
        display: flex;
        gap: 10px;
        align-items: center;
        min-width: 0;
      }

      .content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .title-row {
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .title {
        font-size: 13px;
        font-weight: 600;
        color: rgba(255,255,255,0.90);
        letter-spacing: -0.2px;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        font-weight: 500;
        border-radius: 6px;
        padding: 2px 6px;
      }
      .badge-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .date-row {
        display: flex;
        align-items: baseline;
        gap: 5px;
      }
      .date-icon { font-size: 11px; }
      .date-name {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: -0.2px;
        text-transform: capitalize;
        transition: color 0.3s ease;
      }
      .date-str {
        font-size: 11px;
        color: rgba(142,142,147,0.75);
      }

      .stats-row {
        display: flex;
        align-items: center;
        gap: 5px;
        flex-wrap: wrap;
      }
      .stat {
        display: inline-flex;
        align-items: baseline;
        gap: 3px;
      }
      .stat-lbl {
        font-size: 10px;
        color: rgba(142,142,147,0.60);
        text-transform: uppercase;
        letter-spacing: 0.2px;
      }
      .stat-val {
        font-size: 11px;
        font-weight: 600;
        color: rgba(255,255,255,0.80);
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.2px;
      }
      .stat-sep {
        font-size: 10px;
        color: rgba(142,142,147,0.30);
      }

      .sub {
        font-size: 11px;
        color: rgba(142,142,147,0.65);
      }

      /* right countdown */
      .metric {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        gap: 2px;
      }
      .metric-val {
        font-size: 28px;
        font-weight: 600;
        letter-spacing: -1.5px;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        transition: color 0.3s ease;
      }
      .metric-lbl {
        font-size: 11px;
        font-weight: 400;
        color: rgba(142,142,147,0.65);
        text-align: right;
      }
    `;
  }

  _getStyles() {
    return `
      :host {
        display: block;
      }
      .card {
        background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
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
});/**
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
          background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
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
          background: rgba(255,255,255,0.06);
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
});/**
 * waste-schedule-apple-card.js — Apple-style waste pickup schedule
 *
 * Config:
 *   type: custom:waste-schedule-apple-card
 *   title: "Wywóz śmieci"       # optional
 *   upcoming_limit: 5            # optional, default 5
 *   show_calendar: true          # optional, default false
 *   waste_types:
 *     - entity: sensor.harmonogram_bio
 *       name: Bio
 *       icon: leaf
 *       color: "#8B6F47"
 *       future_dates_sensor: sensor.bio_future  # optional
 *   future_dates_sensor: sensor.waste_future    # optional global
 *
 * Entity state formats supported:
 *   - ISO date: "2026-04-08" or "2026-04-08T00:00:00"
 *   - Integer (days until): "3" → today + 3 days
 *   - Attribute: next_date / date / next_pickup / next_collection
 */

const _C = {
  textPrimary:   '#F5F5F7',
  textSecondary: window.AHA.THEME.TEXT2,
  textTertiary:  window.AHA.THEME.TEXT4,
  urgent:        window.AHA.THEME.ERROR,
  soon:          '#FF9F0A',
  later:         '#64D2FF',   // jasny błękit zamiast żółtego — wyraźny kontrast vs pomarańcz
  upcoming:      '#4ade8a',   // delikatna zieleń — spokojnie, nie pilne
};

const _ICONS = {
  'trash-2':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  'leaf':     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
  'file-text':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
  'package':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  'recycle':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6l-3.09-5.35A2 2 0 0013.22 0H10.8a2 2 0 00-1.69.95L6 6"/><path d="M14 21.83A2 2 0 0015.83 20l3.59-6.23a2 2 0 00-.74-2.73"/><path d="M4.63 13.79A2 2 0 002 15.49v7.31"/><path d="M13.09 4.46L18 13.79"/><path d="M10.91 4.46L6 13.79"/></svg>`,
  'droplet':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>`,
  'glass':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8l-1 7H9z"/><path d="M9 9c0 3 3 5 3 9"/><path d="M15 9c0 3-3 5-3 9"/><line x1="7" y1="22" x2="17" y2="22"/></svg>`,
  'armchair': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9V6a2 2 0 00-2-2H7a2 2 0 00-2 2v3"/><path d="M3 11v5a2 2 0 002 2h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2z"/><path d="M5 18v2"/><path d="M19 18v2"/></svg>`,
};

// Mon-indexed (index 0 = Monday, 6 = Sunday)
const _DAY_LETTERS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

// Godzina po której dzisiejszy odbiór uznajemy za "przeszłą sprawę"
const _DONE_HOUR = 7.5; // 7:30

class WasteScheduleAppleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig({
    title = 'Wywóz śmieci',
    waste_types = [],
    upcoming_limit = 5,
    show_calendar = false,
    future_dates_sensor,
  } = {}) {
    this._config = { title, waste_types, upcoming_limit, show_calendar, future_dates_sensor };
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() { return this._config?.show_calendar ? 6 : 5; }

  /* ── Date helpers ── */

  _dateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  _strToDate(str) {
    const p = str.split('T')[0].split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  _today() {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }

  _weekMonday(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay();
    d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
    return d;
  }

  _daysFrom(date) {
    const ref = this._today();
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    return Math.round((d - ref) / 86400000);
  }

  _relLabel(n) {
    if (n === 0) return 'Dziś';
    if (n === 1) return 'Jutro';
    return `za ${n} dni`;
  }

  /**
   * Czy dzisiejszy odbiór jest już "przeszłą sprawą"?
   * Tak — jeśli dziś i godzina >= _DONE_HOUR (7:30)
   */
  _isTodayDone(n) {
    if (n !== 0) return false;
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    return hour >= _DONE_HOUR;
  }

  /**
   * Zwraca { color, level } na podstawie bliskości w czasie.
   * level: 'done' | 'urgent' | 'soon' | 'later' | 'upcoming' | 'distant'
   *
   * Poziomy kolorystyczne:
   *   done     — dziś po 7:30 — wygaszone (już po sprawie)
   *   urgent   — dziś / jutro — czerwony
   *   soon     — ≤3 dni, ten sam tydzień — pomarańcz
   *   later    — następny tydzień — błękit (odróżnia się od pomarańczu)
   *   upcoming — 8–14 dni — delikatna zieleń (spokojnie)
   *   distant  — 15+ dni — szary
   */
  _urgencyMeta(n, date) {
    if (this._isTodayDone(n))       return { color: '#4a4a4f',   level: 'done'     };

    const today = this._today();
    const nextMonday = this._weekMonday(today);
    nextMonday.setDate(nextMonday.getDate() + 7);
    const weekAfterNext = new Date(nextMonday);
    weekAfterNext.setDate(weekAfterNext.getDate() + 7);

    const d = new Date(date); d.setHours(0, 0, 0, 0);

    if (n <= 1)                      return { color: _C.urgent,   level: 'urgent'   };
    if (n <= 3 && d < nextMonday)    return { color: _C.soon,     level: 'soon'     };
    if (d < weekAfterNext)           return { color: _C.later,    level: 'later'    };
    if (n <= 14)                     return { color: _C.upcoming, level: 'upcoming' };
    return                                  { color: '#636366',   level: 'distant'  };
  }

  /* ── Data ── */

  _parseWaste(wc) {
    const entity = this._hass.states[wc.entity];
    if (!entity) return [];

    const today = this._today();
    const dates = [];

    const raw =
      entity.attributes?.next_date ??
      entity.attributes?.date ??
      entity.attributes?.next_pickup ??
      entity.attributes?.next_collection ??
      entity.state;

    if (raw !== undefined && raw !== null && String(raw) !== 'unknown' && String(raw) !== 'unavailable') {
      const s = String(raw).trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        const d = this._strToDate(s);
        if (!isNaN(d)) dates.push(d);
      } else if (/^\d+$/.test(s)) {
        const d = new Date(today);
        d.setDate(d.getDate() + parseInt(s, 10));
        dates.push(d);
      }
    }

    const fSensor = wc.future_dates_sensor || this._config.future_dates_sensor;
    if (fSensor) {
      const fe = this._hass.states[fSensor];
      if (fe) {
        const rawF = fe.attributes?.dates ?? fe.attributes?.date_list ?? fe.state ?? '';
        const list = Array.isArray(rawF) ? rawF : String(rawF).split(',').map(s => s.trim());
        list.filter(s => /\d{4}-\d{2}-\d{2}/.test(s)).forEach(s => dates.push(this._strToDate(s)));
      }
    }

    const seen = new Set();
    return dates
      .filter(d => { const k = this._dateKey(d); if (seen.has(k)) return false; seen.add(k); return true; })
      .map(date => ({ name: wc.name, icon: wc.icon || 'trash-2', color: wc.color || _C.textTertiary, date }));
  }

  _buildCollectionMap() {
    const today = this._today();
    const start = this._weekMonday(today);
    const end = new Date(start);
    end.setDate(end.getDate() + 30);

    const map = {};
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      map[this._dateKey(new Date(d))] = [];
    }

    (this._config.waste_types || []).forEach(wt => {
      this._parseWaste(wt).forEach(item => {
        const k = this._dateKey(item.date);
        if (map[k]) map[k].push(item);
      });
    });

    return map;
  }

  /* ── Render helpers ── */

  _renderCalCell(date, items, { isToday, isPast }) {
    const dow = date.getDay(); // 0=Sun
    const isWeekend = dow === 0 || dow === 6;
    const letter = _DAY_LETTERS[dow === 0 ? 6 : dow - 1];
    const hasItems = items.length > 0;

    const dots = items.slice(0, 3).map(it =>
      `<span class="cal-dot" style="background:${it.color}"></span>`
    ).join('') + (items.length > 3 ? '<span class="cal-dot-more">+</span>' : '');

    const cls = [
      'cal-cell',
      isToday && 'cal-today',
      isPast  && 'cal-past',
      isWeekend && 'cal-weekend',
      hasItems && !isPast && 'cal-has-items',
    ].filter(Boolean).join(' ');

    const key = this._dateKey(date);

    return `
      <div class="${cls}" data-date="${key}" data-has-items="${hasItems && !isPast}">
        <span class="cal-letter">${letter}</span>
        <span class="cal-num">${date.getDate()}</span>
        <div class="cal-dots">${hasItems && !isPast ? dots : ''}</div>
      </div>`;
  }

  _renderChip(item) {
    const icon = _ICONS[item.icon] || _ICONS['trash-2'];
    return `
      <div class="chip" style="background:${item.color}1a;border-color:${item.color}44;">
        <span class="chip-ic" style="color:${item.color};">${icon}</span>
        <span class="chip-name" style="color:${item.color};">${item.name}</span>
      </div>`;
  }

  /* ── Main render ── */

  _render() {
    if (!this._config?.waste_types?.length || !this._hass) return;

    const today = this._today();
    const todayKey = this._dateKey(today);
    const colMap = this._buildCollectionMap();
    const showCal = this._config.show_calendar;

    /* Calendar */
    let calHTML = '';
    if (showCal) {
      const weekStart = this._weekMonday(today);
      const calDays = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        const key = this._dateKey(d);
        return { date: d, items: colMap[key] || [], isToday: key === todayKey, isPast: d < today };
      });

      const rowHTML = (days) =>
        `<div class="cal-row">${days.map(day => this._renderCalCell(day.date, day.items, day)).join('')}</div>`;

      calHTML = `${rowHTML(calDays.slice(0, 7))}${rowHTML(calDays.slice(7, 14))}<div class="divider"></div>`;
    }

    /* Grouped upcoming list */
    const grouped = Object.entries(colMap)
      .filter(([, arr]) => arr.length > 0)
      .map(([k, arr]) => ({ key: k, date: this._strToDate(k), items: arr }))
      .sort((a, b) => a.date - b.date)
      .filter(g => this._daysFrom(g.date) >= 0)
      .slice(0, this._config.upcoming_limit);

    const listHTML = grouped.length === 0
      ? `<div class="empty">Brak zaplanowanych wywozów</div>`
      : grouped.map((g, i) => {
          const n = this._daysFrom(g.date);
          const { color: uc, level } = this._urgencyMeta(n, g.date);
          const label = this._relLabel(n);

          const isDone     = level === 'done';
          const isDistant  = level === 'distant' || level === 'upcoming' || isDone;

          // Pełna data — pogrubiony dzień tygodnia + pełna nazwa miesiąca
          const dateStr = g.date.toLocaleDateString('pl-PL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          });
          // Wyciągnij dzień tygodnia i resztę do osobnych spanów
          const dateParts = g.date.toLocaleDateString('pl-PL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          });
          // Capitalize weekday, format: "Środa, 9 kwietnia"
          const weekdayStr = g.date.toLocaleDateString('pl-PL', { weekday: 'long' });
          const restStr    = g.date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });
          const capitalWeekday = weekdayStr.charAt(0).toUpperCase() + weekdayStr.slice(1);
          const formattedDate = `<strong>${capitalWeekday}</strong>, ${restStr}`;

          // Left bar glow
          const barGlow = level === 'urgent'
            ? `box-shadow:0 0 10px ${uc}99,0 0 4px ${uc}cc;`
            : level === 'soon'
            ? `box-shadow:0 0 6px ${uc}66;`
            : level === 'later'
            ? `box-shadow:0 0 6px ${uc}55;`
            : level === 'upcoming'
            ? `box-shadow:0 0 5px ${uc}44;`
            : '';
          const barOpacity = isDistant ? 'opacity:0.25;' : '';

          // Tło wiersza — tylko dla pilnych
          const itemBg = level === 'urgent' ? `background:${uc}0d;` : '';

          // Badge — tylko urgent / soon / later
          const showBadge = !isDistant && level !== 'upcoming';
          const badgeHTML = showBadge ? (() => {
            const bg     = `${uc}${level === 'urgent' ? '2a' : '18'}`;
            const border = `${uc}${level === 'urgent' ? '55' : '33'}`;
            return `<span class="list-badge" style="color:${uc};background:${bg};border-color:${border};">${label}</span>`;
          })() : '';

          // Ikona ✓ dla "done" (dziś po 7:30)
          const doneIcon = isDone
            ? `<span class="done-check">✓</span>`
            : '';

          const sep = i < grouped.length - 1 ? ' sep' : '';
          const doneClass = isDone ? ' list-done' : '';

          return `
            <div class="list-item${sep}${doneClass}" data-date="${g.key}" style="${itemBg}">
              <div class="urgency-bar" style="background:${uc};${barGlow}${barOpacity}"></div>
              <div class="list-body">
                <div class="list-top">
                  <span class="list-date${isDistant ? ' list-date-muted' : ''}">${formattedDate}</span>
                  ${badgeHTML}${doneIcon}
                </div>
                <div class="list-chips">${g.items.map(it => this._renderChip(it)).join('')}</div>
              </div>
            </div>`;
        }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        .card {
          background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 16px 14px 12px;
          color: ${_C.textPrimary};
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow: 0 10px 32px rgba(0,0,0,0.5);
          position: relative;
          overflow: hidden;
        }
        .card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          pointer-events: none;
        }

        /* ── Header ── */
        .header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 14px;
        }
        .header-ic {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(142,142,147,0.14);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          color: #8E8E93; flex-shrink: 0;
        }
        .header-ic svg { width: 14px; height: 14px; }
        .header-title {
          font-size: 15px; font-weight: 600; letter-spacing: -0.3px;
          color: rgba(255,255,255,0.93);
        }

        /* ── Calendar ── */
        .cal-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }
        .cal-row + .cal-row { margin-top: 6px; }

        .cal-cell {
          display: flex; flex-direction: column; align-items: center;
          padding: 5px 2px;
          border-radius: 10px;
          transition: background 0.15s, transform 0.15s;
          cursor: default;
        }
        .cal-has-items {
          cursor: pointer;
        }
        .cal-has-items:hover, .cal-hover {
          background: rgba(255,255,255,0.1);
          transform: scale(1.07);
          z-index: 1;
          position: relative;
        }
        .cal-today {
          background: rgba(255,255,255,0.11);
          border: 1px solid rgba(255,255,255,0.14);
        }
        .cal-today:hover, .cal-today.cal-hover {
          background: rgba(255,255,255,0.18);
        }
        .cal-past {
          opacity: 0.28;
        }
        .cal-weekend:not(.cal-today) {
          opacity: 0.38;
        }
        .cal-weekend.cal-past {
          opacity: 0.18;
        }

        .cal-letter {
          font-size: 9px; font-weight: 500; color: ${_C.textTertiary};
          text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 3px;
        }
        .cal-today .cal-letter { color: ${_C.textSecondary}; }
        .cal-num {
          font-size: 13px; font-weight: 400; line-height: 1; color: ${_C.textSecondary};
        }
        .cal-today .cal-num { font-weight: 700; color: ${_C.textPrimary}; }
        .cal-dots {
          display: flex; gap: 2px; align-items: center;
          margin-top: 5px; min-height: 5px;
        }
        .cal-dot {
          width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
        }
        .cal-dot-more { font-size: 7px; color: ${_C.textTertiary}; line-height: 1; }

        /* ── Divider ── */
        .divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 14px -14px 0;
        }

        /* ── List ── */
        .list-item {
          display: flex;
          align-items: stretch;
          gap: 0;
          padding: 11px 0;
          border-radius: 10px;
          position: relative;
          transition: background 0.2s;
        }
        .list-item:hover {
          background: rgba(255,255,255,0.03) !important;
        }
        .list-item.highlighted {
          background: rgba(255,255,255,0.05) !important;
        }
        .list-item.highlighted .urgency-bar {
          filter: brightness(1.3);
        }
        .list-item.sep {
          border-bottom: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px 10px 0 0;
        }

        /* Wygaszone — dziś po 7:30 */
        .list-done {
          opacity: 0.42;
        }
        .list-done .list-chips .chip {
          filter: saturate(0.3);
        }

        .urgency-bar {
          width: 3px;
          border-radius: 2px;
          flex-shrink: 0;
          margin-right: 12px;
          align-self: stretch;
          transition: filter 0.2s, box-shadow 0.2s;
        }

        .list-body { flex: 1; min-width: 0; }
        .list-top {
          display: flex; align-items: center;
          justify-content: space-between; gap: 8px;
          margin-bottom: 7px;
        }
        .list-date {
          font-size: 12px; font-weight: 400; color: ${_C.textSecondary};
          text-transform: capitalize; flex: 1; min-width: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .list-date strong {
          font-weight: 700;
          color: ${_C.textPrimary};
        }
        .list-date-muted {
          color: ${_C.textTertiary};
        }
        .list-date-muted strong {
          color: ${_C.textSecondary};
          font-weight: 600;
        }

        /* Ikona ✓ dla done */
        .done-check {
          font-size: 13px;
          color: #4a4a4f;
          margin-left: 4px;
          flex-shrink: 0;
        }

        /* Badge pill */
        .list-badge {
          font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid;
          flex-shrink: 0;
          white-space: nowrap;
        }

        /* Chips */
        .list-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 9px 4px 6px;
          border-radius: 20px; border: 1px solid transparent;
        }
        .chip-ic {
          width: 13px; height: 13px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .chip-ic svg { width: 11px; height: 11px; }
        .chip-name { font-size: 12px; font-weight: 500; white-space: nowrap; }

        .empty {
          font-size: 13px; color: ${_C.textTertiary};
          text-align: center; padding: 16px 0;
        }
      </style>

      <div class="card">
        <div class="header">
          <div class="header-ic">${_ICONS['trash-2']}</div>
          <span class="header-title">${this._config.title}</span>
        </div>

        ${calHTML}

        <div class="list-section">${listHTML}</div>
      </div>
    `;

    this._attachEvents();
  }

  /* ── Calendar ↔ list hover bridge ── */

  _attachEvents() {
    const shadow = this.shadowRoot;

    shadow.querySelectorAll('.cal-cell[data-has-items="true"]').forEach(cell => {
      const key = cell.dataset.date;

      cell.addEventListener('mouseenter', () => {
        cell.classList.add('cal-hover');
        shadow.querySelector(`.list-item[data-date="${key}"]`)?.classList.add('highlighted');
      });

      cell.addEventListener('mouseleave', () => {
        cell.classList.remove('cal-hover');
        shadow.querySelector(`.list-item[data-date="${key}"]`)?.classList.remove('highlighted');
      });
    });
  }
}

customElements.define('aha-waste-schedule-apple-card', WasteScheduleAppleCard);// astronomical-events-card.js
// Place in: /config/www/astronomical-events-card.js
// Register in Lovelace resources:
//   url: /local/astronomical-events-card.js
//   type: module

// ── REST sensor (wklej do configuration.yaml) ────────────────────────────────
// sensor:
//   - platform: rest
//     name: upcoming_launches
//     resource: https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=10&format=json
//     value_template: "{{ value_json.count }}"
//     json_attributes:
//       - results
//     scan_interval: 3600
//
// Karta:
//   type: custom:aha-astronomical-events-card
//   launches_entity: sensor.upcoming_launches   # opcjonalne, to jest default
// ─────────────────────────────────────────────────────────────────────────────

const TYPES = {
  eclipse:       { label: 'Zaćmienie Słońca',   r: 220, g: 160, b: 30  },
  lunar_eclipse: { label: 'Zaćmienie Księżyca', r: 220, g: 70,  b: 70  },
  meteors:       { label: 'Rój meteorów',       r: 130, g: 90,  b: 230 },
  conjunction:   { label: 'Koniunkcja',         r: 60,  g: 180, b: 240 },
  planet:        { label: 'Planety',            r: 50,  g: 190, b: 150 },
  moon:          { label: 'Księżyc',            r: 200, g: 180, b: 80  },
  launch:        { label: 'Start rakiety',      r: 10,  g: 132, b: 255 },
};

// ── Kolory agencji ────────────────────────────────────────────────────────────
function agencyColor(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('spacex'))    return { r: 10,  g: 132, b: 255 }; // niebieski
  if (n.includes('nasa'))      return { r: 255, g: 107, b: 53  }; // pomarańcz
  if (n.includes('esa') || n.includes('european')) return { r: 52, g: 199, b: 89 }; // zielony
  if (n.includes('roscosmos') || n.includes('russian')) return { r: 255, g: 69, b: 58 }; // czerwony
  if (n.includes('rocket lab')) return { r: 191, g: 90, b: 242 }; // fiolet
  if (n.includes('ula'))       return { r: 255, g: 214, b: 10  }; // żółty
  if (n.includes('isro'))      return { r: 255, g: 149, b: 0   }; // amber
  if (n.includes('jaxa'))      return { r: 100, g: 210, b: 255 }; // błękit
  return { r: 100, g: 210, b: 255 };
}

// ── Status startu → kolor ─────────────────────────────────────────────────────
function statusColor(abbrev) {
  if (abbrev === 'Go')      return { r: 52,  g: 199, b: 89  };
  if (abbrev === 'Success') return { r: 52,  g: 199, b: 89  };
  if (abbrev === 'Hold')    return { r: 255, g: 214, b: 10  };
  if (abbrev === 'Failure') return { r: 255, g: 69,  b: 58  };
  return { r: 99, g: 99, b: 102 }; // TBD / inne
}

// ── Statyczne zjawiska astronomiczne ─────────────────────────────────────────
const RAW = [
  { date:'2026-04-22', type:'meteors',       name:'Liridy 2026',                     desc:'Jeden z najstarszych rojów — okruchy komety Thatcher (1861). Meteory szybkie (49 km/s), często zostawiają smugi. Aktywne 16–25 kwietnia.',       how:'Wyjdź po 01:00, z dala od świateł. Patrz na całe niebo. 20 min adaptacji oka.',                                tip:'Pora: 01:00–04:00 · Bez sprzętu' },
  { date:'2026-06-09', type:'conjunction',   name:'Wenus + Jowisz',                  desc:'Dwie najjaśniejsze planety zbliżają się na 1.6°. Lornetka ujawni 4 księżyce galileuszowe Jowisza.',                                             how:'Patrz na zachód–NW 30–60 min po zachodzie Słońca.',                                                                tip:'Pora: 20:30–22:00 · Kierunek: zachód-NW · Lornetka' },
  { date:'2026-08-12', type:'eclipse',       name:'Zaćmienie Słońca + Perseidy',     desc:'Zaćmienie częściowe ~80% po południu, a nocą Perseidy przy nowiu — czarne niebo. Takie połączenie raz na dekady.',                             how:'Zaćmienie 19:15–20:04 — OKULARY ISO 12312-2 obowiązkowe. Perseidy: od 23:00 kierunek NE.',                          tip:'Okulary ISO 12312-2 obowiązkowe · Perseidy: po 23:00' },
  { date:'2026-08-28', type:'lunar_eclipse', name:'Zaćmienie Księżyca 96%',          desc:'Ziemia zakryje 96% tarczy. Księżyc nabierze głębokiego czerwono-pomarańczowego koloru. Widoczne z Polski.',                                     how:'Wyjdź rano — Księżyc nisko na zachodzie. Lornetka podkreśli barwy.',                                               tip:'Pora: 04:12–05:52 · Kierunek: zachód · Lornetka' },
  { date:'2026-10-04', type:'planet',        name:'Saturn w opozycji 2026',          desc:'Saturn wschodzi o zachodzie Słońca i widoczny jest całą noc. Pierścienie wyraźnie lepsze niż w 2025.',                                          how:'Lornetka pokaże owalny kształt. Teleskop 60mm+ ujawni pierścienie. Szukaj w Rybach.',                              tip:'Pora: cała noc · Lornetka lub mały teleskop' },
  { date:'2026-10-21', type:'meteors',       name:'Orionidy 2026',                   desc:'Okruchy słynnej komety Halleya wpadające z 66 km/s. Księżyc (72%) zachodzi po północy — potem lepiej.',                                        how:'Obserwuj po 02:00. Radiant blisko Betelgezy.',                                                                     tip:'Pora: 02:00–05:00 · Bez sprzętu' },
  { date:'2026-11-12', type:'meteors',       name:'Taurydy Północne 2026',           desc:'Wolne, ale spektakularne bolidy rozświetlające całe niebo. W 2026 jedne z lepszych warunków w dekadzie (księżyc 7%).',                          how:'Obserwuj całą noc. Warto nagrywać kamerą szerokokątną.',                                                           tip:'Pora: od 21:00 · Gołe oko lub kamera' },
  { date:'2026-11-15', type:'conjunction',   name:'Mars + Jowisz 2026',              desc:'Rdzawy Mars i kremowy Jowisz zbliżają się do 1°. Kontrast barw efektowny nawet gołym okiem.',                                                  how:'Wstań 1.5h przed wschodem Słońca. Lornetka pokaże 4 księżyce Jowisza.',                                           tip:'Pora: 04:00–06:00 · Kierunek: południe · Lornetka' },
  { date:'2026-11-17', type:'meteors',       name:'Leonidy 2026',                    desc:'Najszybsze meteory roku (71 km/s) — długie świetliste smugi. Księżyc (45%) zachodzi po północy.',                                              how:'Obserwuj po 01:00. Radiant w gwiazdozbiorze Lwa.',                                                                 tip:'Pora: 01:00–05:00 · Bez sprzętu' },
  { date:'2026-12-13', type:'meteors',       name:'Geminidy 2026',                   desc:'NAJLEPSZY rój roku — liczne, kolorowe, od wczesnego wieczoru. Asteroida 3200 Phaethon. W 2026 prawie bez księżyca (21%).',                     how:'Wyjdź po 21:00. Radiant w Bliźniętach. Koc i ciepłe ubranie!',                                                   tip:'Pora: 21:00–04:00 · Bez sprzętu' },
  { date:'2026-12-23', type:'moon',          name:'Superksiężyc — rekord 2026',      desc:'Najbliższy Księżyc od 7 lat (221 668 km). Tarcza wyraźnie większa i jaśniejsza. Kolejny tak bliski dopiero w 2028.',                           how:'Obserwuj przy wschodzie — iluzja horyzontu. Zdjęcie z punktem odniesienia.',                                      tip:'Pora: wschód Księżyca · Aparat' },
  { date:'2027-01-03', type:'meteors',       name:'Kwadrantydy 2027',                desc:'Ostry szczyt trwający kilka godzin — timing kluczowy. W 2027 lepsze warunki niż rok wcześniej (księżyc 20%).',                                 how:'Szczyt ok. 03:00 w nocy z 2 na 3 stycznia. Krótkie okno!',                                                        tip:'Pora: 01:00–05:00 · Kierunek: NE · Bez sprzętu' },
  { date:'2027-02-10', type:'planet',        name:'Jowisz w opozycji 2027',          desc:'Najlepszy dzień roku do obserwacji Jowisza. Wschodzi o zachodzie Słońca, widoczny całą noc.',                                                  how:'Lornetka: dostrzeż Io, Europę, Ganimedes, Kallisto.',                                                              tip:'Pora: cała noc · Lornetka' },
  { date:'2027-05-06', type:'meteors',       name:'Eta Akwarydy 2027',               desc:'Okruchy komety Halley, szybkie (66 km/s). W 2027 nów tuż przed szczytem — prawie idealne ciemne niebo.',                                      how:'Obserwuj 03:00–05:00. Radiant w Akwariuszu.',                                                                      tip:'Pora: 03:00–05:00 · Kierunek: SE · Bez sprzętu' },
  { date:'2027-08-02', type:'eclipse',       name:'Zaćmienie Słońca 2027',           desc:'Najdłuższe całkowite zaćmienie XXI wieku. Pas: S.Hiszpania, Maroko, Egipt (Luksor 6 min 23 s). Z Polski częściowe wieczorem.',                 how:'Z Polski: okulary ISO 12312-2. Warto pojechać do Málagas lub Luksoru.',                                            tip:'Okulary ISO 12312-2 · Całkowite: Egipt / S.Hiszpania' },
  { date:'2027-08-12', type:'meteors',       name:'Perseidy 2027',                   desc:'Ciepłe sierpniowe noce, jasne meteory ze smugami. Okruchy komety Swift-Tuttle.',                                                               how:'Wyjdź po 23:00. Kierunek NE na Perseusza. 1h bez telefonu.',                                                       tip:'Pora: 23:00–04:00 · Kierunek: NE · Bez sprzętu' },
  { date:'2027-12-14', type:'meteors',       name:'Geminidy 2027',                   desc:'Coroczny król rojów. Kolorowe, liczne, od wczesnego wieczoru. Asteroida 3200 Phaethon.',                                                      how:'Wyjdź po 21:00. Radiant w Bliźniętach. Grudzień — ciepłe ubranie.',                                               tip:'Pora: 21:00–04:00 · Bez sprzętu' },
  { date:'2028-01-12', type:'lunar_eclipse', name:'Zaćmienie Księżyca 2028',         desc:'Pełnia wilka 2028 to superksiężyc i zaćmienie częściowe. Księżyc wychodzi nad horyzont już częściowo w cieniu.',                               how:'Obserwuj wschód Księżyca — wychodzi już częściowo zaćmiony.',                                                      tip:'Pora: wschód Księżyca · Lornetka' },
  { date:'2028-02-10', type:'moon',          name:'Superksiężyc 2028 — ekstremalny', desc:'Pobija grudniowy rekord z 2026. Jeden z najbliższych pełni XXI wieku.',                                                                        how:'Obserwuj wschód. Zdjęcie obok budynku. Lornetka ujawni kratery.',                                                  tip:'Pora: wschód Księżyca · Aparat' },
  { date:'2028-07-22', type:'eclipse',       name:'Całkowite zaćmienie Słońca 2028', desc:'Australia i południowa Azja — Sydney i wybrzeże wschodnie. Z Europy niewidoczne.',                                                            how:'Z Polski: brak. Australia: planuj podróż z wyprzedzeniem!',                                                        tip:'Całkowite: Australia, Indie · Z Polski: brak' },
  { date:'2028-08-12', type:'meteors',       name:'Perseidy 2028',                   desc:'Niezmiennie jeden z najpewniejszych rojów. Ciepłe noce, jasne meteory ze smugami.',                                                           how:'Wyjdź po 23:00. Kierunek NE. 1h na ciemnym niebie.',                                                               tip:'Pora: 23:00–04:00 · Bez sprzętu' },
  { date:'2028-12-14', type:'meteors',       name:'Geminidy 2028',                   desc:'Kolorowe, liczne, od wczesnego wieczoru. Sprawdź fazę księżyca — decyduje o warunkach.',                                                      how:'Wyjdź po 21:00. Radiant w Bliźniętach. Ciepłe ubranie.',                                                          tip:'Pora: 21:00–04:00 · Bez sprzętu' },
  { date:'2028-12-31', type:'lunar_eclipse', name:'Zaćmienie Księżyca — Sylwester!', desc:'Całkowite zaćmienie w ostatnią noc 2028. Czerwony Księżyc przez ponad godzinę — atrakcja sylwestrowa!',                                       how:'Obserwuj wieczorem 31 grudnia. Gołym okiem.',                                                                      tip:'Pora: wieczór 31 gru · Bez sprzętu' },
  { date:'2029-03-30', type:'moon',          name:'Superksiężyc 2029 — ekstremalny', desc:'Marcowa pełnia może być jedną z najbliższych całego XXI wieku.',                                                                               how:'Obserwuj wschód. Porównaj ze zwykłymi pełniami.',                                                                  tip:'Pora: wschód Księżyca · Aparat' },
  { date:'2029-05-06', type:'meteors',       name:'Eta Akwarydy 2029',               desc:'Szybkie meteory ze smugami. Lepiej widoczne z południa Europy, ale jasne bolidy widać wszędzie.',                                             how:'Obserwuj 03:00–05:00. Radiant w Akwariuszu.',                                                                      tip:'Pora: 03:00–05:00 · Kierunek: SE · Bez sprzętu' },
  { date:'2029-08-12', type:'meteors',       name:'Perseidy 2029',                   desc:'Ciepłe noce, komfortowe warunki, wiele jasnych meteorów ze smugami.',                                                                         how:'Wyjdź po 23:00. Kierunek NE. Godzina bez telefonu.',                                                               tip:'Pora: 23:00–04:00 · Bez sprzętu' },
  { date:'2029-11-17', type:'meteors',       name:'Leonidy 2029 — uwaga!',           desc:'Kometa Tempel-Tuttle powraca w 2031. Aktywność może rosnąć w latach poprzedzających peryhelia.',                                              how:'Obserwuj po 01:00. Radiant w Lwie.',                                                                               tip:'Pora: 01:00–05:00 · Bez sprzętu' },
  { date:'2029-12-14', type:'meteors',       name:'Geminidy 2029',                   desc:'Asteroida 3200 Phaethon — zawsze warto wychodzić bez względu na rok.',                                                                        how:'Wyjdź po 21:00. Ciepłe ubranie! Cały nieboskłon.',                                                                 tip:'Pora: 21:00–04:00 · Bez sprzętu' },
  { date:'2030-06-01', type:'eclipse',       name:'Obrączkowe zaćmienie 2030',       desc:'"Ring of fire" — Algieria, Tunezja, Grecja, Turcja. Z Polski zaćmienie częściowe.',                                                          how:'Z Polski: okulary ISO 12312-2. Grecja/Turcja: efekt pierścienia ognia.',                                           tip:'Okulary ISO 12312-2 · Ring of fire: Grecja/Turcja' },
  { date:'2030-06-15', type:'lunar_eclipse', name:'Zaćmienie Księżyca 2030',         desc:'Częściowe zaćmienie w czerwcu. Ciemna część tarczy nabiera brunatno-czerwonego odcienia.',                                                    how:'Wyjdź wieczorem. Lornetka podkreśli barwy. Aparat na statywie.',                                                   tip:'Pora: wieczór 15 czerwca · Lornetka' },
  { date:'2030-08-12', type:'meteors',       name:'Perseidy 2030',                   desc:'Niezawodny sierpniowy spektakl. Sprawdź fazę księżyca przed wyjściem.',                                                                       how:'Wyjdź po 23:00. Kierunek NE.',                                                                                      tip:'Pora: 23:00–04:00 · Bez sprzętu' },
  { date:'2030-11-25', type:'eclipse',       name:'Całkowite zaćmienie Słońca 2030', desc:'Namibia, Botswana, Australia. Z Europy niewidoczne — szansa dla globtroterów.',                                                               how:'Namibia i Australia: totality. Z Europy: brak.',                                                                   tip:'Całkowite: Namibia, Australia · Z Polski: brak' },
  { date:'2030-12-14', type:'meteors',       name:'Geminidy 2030',                   desc:'Domykają rok astronomiczny. Najlepszy rój roku, niezawodny od dekad.',                                                                        how:'Wyjdź po 21:00. Radiant w Bliźniętach. Termos z herbatą.',                                                         tip:'Pora: 21:00–04:00 · Bez sprzętu' },
  { date:'2031-05-07', type:'meteors',       name:'Eta Akwarydy 2031',               desc:'Kometa Halley zbliża się. Strumień pyłu może być gęstszy — Eta Akwarydy mogą zaskoczyć.',                                                    how:'Obserwuj przed świtem. Radiant w Akwariuszu.',                                                                      tip:'Pora: 03:00–05:00 · Kierunek: SE · Bez sprzętu' },
  { date:'2031-08-12', type:'meteors',       name:'Perseidy 2031',                   desc:'Kometa Swift-Tuttle daleko, ale strumień stabilny przez dziesiątki lat.',                                                                     how:'Wyjdź po 23:00. NE na Perseusza. Bez telefonu!',                                                                   tip:'Pora: 23:00–04:00 · Bez sprzętu' },
  { date:'2031-11-17', type:'meteors',       name:'Leonidy 2031 — HISTORYCZNE!',     desc:'Kometa Tempel-Tuttle w peryhelium! W 1966, 1999, 2001 notowano tysiące meteorów/h. Możliwy deszcz stulecia — MUST SEE!',                     how:'Śledź prognozy. Obserwuj całą noc 16–18 listopada.',                                                                tip:'Pora: cała noc 16–18 lis · PRIORYTET' },
  { date:'2031-12-14', type:'meteors',       name:'Geminidy 2031',                   desc:'Zamykają dekadę 2026–2031. Asteroida 3200 Phaethon — unikat wśród rojów.',                                                                    how:'Wyjdź po 21:00. Radiant Bliźnięta. Termos, ciepłe ubranie.',                                                      tip:'Pora: 21:00–04:00 · Bez sprzętu' },
];

// ── Filtr ważności startu ─────────────────────────────────────────────────────
function isImportantLaunch(l) {
  const agency  = (l.launch_service_provider?.name ?? '').toLowerCase();
  const rocket  = (l.rocket?.configuration?.name ?? '').toLowerCase();
  const mission = (l.mission?.name ?? l.name ?? '').toLowerCase();
  const mType   = (l.mission?.type ?? '').toLowerCase();
  const orbit   = (l.mission?.orbit?.abbrev ?? '').toLowerCase();

  // ── Wyklucz rutynowe konstelacje ──────────────────────────────────────────
  if (mission.includes('starlink'))              return false;
  if (mission.includes('oneweb'))                return false;
  if (mission.includes('o3b'))                   return false;
  if (mission.includes('transporter') && agency.includes('spacex')) return false; // rideshare

  // ── Przełomowe rakiety — zawsze ───────────────────────────────────────────
  if (rocket.includes('starship'))               return true;
  if (rocket.includes('falcon heavy'))           return true;
  if (rocket.includes('sls'))                    return true;
  if (rocket.includes('vulcan'))                 return true;
  if (rocket.includes('new glenn'))              return true;
  if (rocket.includes('ariane 6'))               return true;
  if (rocket.includes('h3'))                     return true;  // JAXA H3

  // ── Misje załogowe ────────────────────────────────────────────────────────
  if (mType.includes('human'))                   return true;
  if (mission.includes('crew'))                  return true;
  if (mission.includes('starliner'))             return true;
  if (/soyuz ms-\d/.test(mission))               return true;

  // ── Księżyc / Mars / głęboka przestrzeń ──────────────────────────────────
  if (mType.includes('lunar'))                   return true;
  if (mType.includes('mars'))                    return true;
  if (mType.includes('planetary'))               return true;
  if (mType.includes('deep space'))              return true;
  if (['tli','lunar','mars','halo','nrho','sel2','l2'].some(o => orbit.includes(o))) return true;

  // ── Agencje rządowe / naukowe ─────────────────────────────────────────────
  if (agency.includes('nasa'))                   return true;
  if (agency.includes('esa') || agency.includes('european')) return true;
  if (agency.includes('jaxa'))                   return true;
  if (agency.includes('isro'))                   return true;
  if (agency.includes('cnsa') || agency.includes('chinese')) return true;
  if (agency.includes('roscosmos'))              return true;

  // ── SpaceX (non-Starlink już odfiltrowany) ────────────────────────────────
  if (agency.includes('spacex'))                 return true;

  return false;
}

// ── Pomocnicze ────────────────────────────────────────────────────────────────

function fmtDate(d) {
  const x = new Date(d + 'T00:00:00');
  return x.getDate() + ' ' + window.AHA.MONTHS[x.getMonth()] + ' ' + x.getFullYear();
}

function fmtDatetime(iso) {
  const x = new Date(iso);
  const months = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
  const d = x.getDate() + ' ' + months[x.getMonth()] + ' ' + x.getFullYear();
  const t = x.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
  return d + ' · ' + t;
}

// ── Ikony SVG ─────────────────────────────────────────────────────────────────

function makeIcon(type, r, g, b) {
  const c = `rgba(${r},${g},${b},`;
  if (type === 'eclipse')
    return `<svg width="22" height="22" viewBox="0 0 22 22"><circle cx="9" cy="11" r="7" fill="${c}.18)" stroke="${c}.85)" stroke-width="1.5"/><circle cx="17" cy="11" r="7" fill="#111"/></svg>`;
  if (type === 'lunar_eclipse')
    return `<svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="8" fill="${c}.18)" stroke="${c}.85)" stroke-width="1.5"/><circle cx="7" cy="8" r="2.5" fill="${c}.4)"/></svg>`;
  if (type === 'meteors')
    return `<svg width="22" height="22" viewBox="0 0 22 22"><line x1="16" y1="2" x2="4" y2="14" stroke="${c}.9)" stroke-width="2" stroke-linecap="round"/><line x1="11" y1="4" x2="2" y2="16" stroke="${c}.45)" stroke-width="1.5" stroke-linecap="round"/><circle cx="17" cy="3" r="2" fill="${c}.9)"/></svg>`;
  if (type === 'conjunction')
    return `<svg width="22" height="22" viewBox="0 0 22 22"><circle cx="7.5" cy="11" r="5" fill="${c}.18)" stroke="${c}.85)" stroke-width="1.5"/><circle cx="16" cy="11" r="3.5" fill="${c}.12)" stroke="${c}.7)" stroke-width="1.2"/></svg>`;
  if (type === 'planet')
    return `<svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="6" fill="${c}.18)" stroke="${c}.85)" stroke-width="1.5"/><ellipse cx="11" cy="11" rx="10" ry="3.2" fill="none" stroke="${c}.5)" stroke-width="1.2"/></svg>`;
  if (type === 'moon')
    return `<svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="8" fill="${c}.18)" stroke="${c}.85)" stroke-width="1.5"/><circle cx="8" cy="8" r="1.8" fill="${c}.4)"/><circle cx="13" cy="13" r="1.2" fill="${c}.3)"/></svg>`;
  if (type === 'launch')
    return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2C11 2 7 7 7 13h8c0-6-4-11-4-11z" fill="${c}.20)" stroke="${c}.85)" stroke-width="1.4" stroke-linejoin="round"/>
      <rect x="9" y="13" width="4" height="3" rx="1" fill="${c}.30)"/>
      <path d="M7 13c-1.5 0-2.5 1-2.5 2.5L7 16" stroke="${c}.60)" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M15 13c1.5 0 2.5 1 2.5 2.5L15 16" stroke="${c}.60)" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="11" cy="9" r="1.5" fill="${c}.90)"/>
    </svg>`;
  return '';
}

const PAGE = 3;

// ── Karta ─────────────────────────────────────────────────────────────────────

class AstronomicalEventsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._offset = 0;
    this._expanded = new Set();
    this._hass = null;
    this._config = {};
  }

  setConfig(config) {
    this._config = config;
    this._page = config.page_size || PAGE;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  // ── Parsuj starty z REST sensor ─────────────────────────────────────────────
  _getLaunches() {
    if (!this._hass) return [];
    const entityId = this._config.launches_entity || 'sensor.upcoming_launches';
    const entity = this._hass.states[entityId];
    if (!entity) { this._launchStatus = 'missing'; return []; }
    if (entity.state === 'unavailable' || entity.state === 'unknown') {
      this._launchStatus = 'unavailable:' + entity.state; return [];
    }

    // HA może serializować json_attributes jako string zamiast parsowanego obiektu
    let results = entity.attributes.results;
    if (typeof results === 'string') {
      try { results = JSON.parse(results); } catch(e) {}
    }
    if (!Array.isArray(results)) { this._launchStatus = 'no_results'; return []; }

    const filterAll = (this._config.launches_filter === 'all');
    const upcoming  = results.filter(l => l.net && new Date(l.net) >= new Date());
    const filtered  = filterAll ? upcoming : upcoming.filter(isImportantLaunch);
    this._launchSkipped = upcoming.length - filtered.length;
    this._launchStatus = 'ok:' + filtered.length;

    const now = new Date(); now.setHours(0, 0, 0, 0);

    return filtered
      .filter(l => l.net && new Date(l.net) >= now)
      .map(l => {
        const net    = new Date(l.net);
        const days   = Math.round((net - now) / 86400000);
        const agency = l.launch_service_provider?.name ?? 'Nieznana';
        const rocket = l.rocket?.configuration?.name ?? '';
        const col    = agencyColor(agency);
        const sc     = statusColor(l.status?.abbrev ?? '');
        return {
          // pola wspólne z astronomicznymi
          date:  net.toISOString().slice(0, 10),
          type:  'launch',
          name:  l.mission?.name ?? l.name,
          desc:  l.mission?.description ?? '',
          how:   `${rocket}${l.pad?.location?.name ? ' · ' + l.pad.location.name : ''}`,
          tip:   `NET: ${fmtDatetime(l.net)}`,
          days,
          // pola specyficzne dla startu
          _net:          net,
          _agency:       agency,
          _rocket:       rocket,
          _missionType:  l.mission?.type ?? '',
          _orbit:        l.mission?.orbit?.abbrev ?? '',
          _statusName:   l.status?.name ?? '',
          _statusAbbrev: l.status?.abbrev ?? '',
          _statusColor:  sc,
          _agencyColor:  col,
          // nadpisz kolory TYPES dla tego konkretnego startu
          _r: col.r, _g: col.g, _b: col.b,
        };
      });
  }

  // ── Połącz i posortuj zdarzenia ─────────────────────────────────────────────
  _getEvents() {
    const now = new Date(); now.setHours(0, 0, 0, 0);

    const astro = RAW
      .map(e => {
        const t    = new Date(e.date + 'T00:00:00');
        const days = Math.round((t - now) / 86400000);
        return { ...e, days };
      })
      .filter(e => e.days >= 0);

    const launches = this._getLaunches();

    return [...astro, ...launches].sort((a, b) => {
      // najpierw według dni, potem launches mają precyzyjny _net
      if (a.days !== b.days) return a.days - b.days;
      const ta = a._net ?? new Date(a.date + 'T12:00:00');
      const tb = b._net ?? new Date(b.date + 'T12:00:00');
      return ta - tb;
    });
  }

  _toggle(idx) {
    if (this._expanded.has(idx)) this._expanded.delete(idx);
    else this._expanded.add(idx);
    this._render();
  }

  _prev() {
    this._offset = Math.max(0, this._offset - this._page);
    this._expanded.clear();
    this._render();
  }

  _next() {
    const all = this._getEvents();
    this._offset = Math.min(this._offset + this._page, all.length - this._page);
    this._expanded.clear();
    this._render();
  }

  _render() {
    const all   = this._getEvents();
    const page  = this._page;
    const off   = this._offset;
    const slice = all.slice(off, off + page);
    const canPrev = off > 0;
    const canNext = off + page < all.length;

    // Liczniki typów do nagłówka
    const launchCount = all.filter(e => e.type === 'launch').length;

    const css = `
      :host { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
      .card {
        background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
        border-radius: 16px;
        overflow: hidden;
        padding: 14px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .header-title {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: .10em;
        text-transform: uppercase;
        color: rgba(255,255,255,.28);
      }
      .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .launch-pill {
        font-size: 9px;
        font-weight: 600;
        padding: 2px 7px;
        border-radius: 20px;
        background: rgba(10,132,255,0.15);
        color: rgba(10,132,255,0.90);
        border: 1px solid rgba(10,132,255,0.30);
        letter-spacing: .04em;
      }
      .header-count {
        font-size: 10px;
        color: rgba(255,255,255,.20);
      }
      .event {
        border-radius: 12px;
        margin-bottom: 8px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.08);
        background: rgba(255,255,255,.03);
        transition: border-color .2s;
      }
      .event.expanded { border-color: rgba(255,255,255,.13); }
      .event.is-launch { background: rgba(10,132,255,0.04); }
      .event-row {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 11px 13px;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }
      .event-row:active { background: rgba(255,255,255,.04); }
      .icon-wrap {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .event-meta { flex: 1; min-width: 0; text-align: left; }
      .event-name {
        font-size: 13px;
        font-weight: 600;
        color: rgba(255,255,255,.90);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .event-date {
        font-size: 11px;
        color: rgba(255,255,255,.30);
        margin-top: 2px;
      }
      .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 5px;
      }
      .badge {
        display: inline-block;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: .04em;
        padding: 2px 7px;
        border-radius: 20px;
      }
      .event-right {
        display: flex;
        align-items: center;
        gap: 7px;
        flex-shrink: 0;
      }
      .countdown { text-align: right; }
      .countdown-num {
        font-weight: 200;
        line-height: 1;
        letter-spacing: -1px;
      }
      .countdown-label {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: .08em;
        color: rgba(255,255,255,.28);
        margin-top: 2px;
      }
      .chevron {
        flex-shrink: 0;
        transition: transform .22s ease;
        opacity: .35;
      }
      .chevron.open { transform: rotate(180deg); opacity: .6; }
      .details {
        display: none;
        padding: 10px 13px 14px;
        border-top: 1px solid rgba(255,255,255,.06);
        text-align: left;
        animation: fadeIn .18s ease;
      }
      .details.open { display: block; }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .desc {
        font-size: 12px;
        line-height: 1.65;
        color: rgba(255,255,255,.50);
        margin: 0 0 8px;
      }
      .how {
        font-size: 11.5px;
        line-height: 1.55;
        color: rgba(255,255,255,.35);
        margin: 0 0 10px;
      }
      .tip-box {
        font-size: 11px;
        font-weight: 600;
        padding: 7px 11px;
        border-radius: 9px;
        display: inline-block;
      }
      .launch-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-bottom: 10px;
      }
      .launch-meta-chip {
        font-size: 10px;
        padding: 3px 9px;
        border-radius: 8px;
        background: rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.45);
        border: 1px solid rgba(255,255,255,0.08);
      }
      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid rgba(255,255,255,.06);
      }
      .footer-info { font-size: 10px; color: rgba(255,255,255,.22); }
      .nav-btn {
        font-size: 11px;
        padding: 5px 14px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(255,255,255,.05);
        color: rgba(255,255,255,.50);
        cursor: pointer;
        font-family: inherit;
        transition: background .15s, color .15s;
      }
      .nav-btn:active { background: rgba(255,255,255,.10); color: rgba(255,255,255,.80); }
      .nav-btn:disabled {
        border-color: rgba(255,255,255,.04);
        background: transparent;
        color: rgba(255,255,255,.16);
        cursor: default;
      }
      .urgent-bar {
        width: 3px;
        border-radius: 2px;
        align-self: stretch;
        flex-shrink: 0;
        margin-left: -13px;
        margin-right: 2px;
      }
      .no-launches {
        font-size: 10px;
        color: rgba(255,255,255,0.18);
        text-align: center;
        padding: 6px 0 2px;
      }
    `;

    const eventsHtml = slice.map((ev, localIdx) => {
      const globalIdx = off + localIdx;
      const isLaunch  = ev.type === 'launch';
      const r = ev._r ?? TYPES[ev.type]?.r ?? 100;
      const g = ev._g ?? TYPES[ev.type]?.g ?? 200;
      const b = ev._b ?? TYPES[ev.type]?.b ?? 255;
      const T = TYPES[ev.type] || TYPES.meteors;
      const c = `rgba(${r},${g},${b},`;
      const isOpen   = this._expanded.has(globalIdx);
      const isUrgent = ev.days <= 3;

      const dLabel = ev.days === 0 ? 'dziś!' : ev.days === 1 ? 'jutro' : ev.days;
      const dUnit  = ev.days <= 1 ? '' : 'dni';
      const dSize  = ev.days <= 1 ? '15px' : '26px';

      const urgentBarHtml = isUrgent
        ? `<div class="urgent-bar" style="background:linear-gradient(to bottom,${c}.7),${c}.2));"></div>`
        : '';

      // Badge / label
      let badgesHtml = '';
      if (isLaunch) {
        const sc = ev._statusColor;
        const sc_ = `rgba(${sc.r},${sc.g},${sc.b},`;
        badgesHtml = `
          <div class="badges">
            <span class="badge" style="background:${c}.13);color:${c}.90);border:1px solid ${c}.25);">${ev._agency}</span>
            <span class="badge" style="background:${sc_}.13);color:${sc_}.90);border:1px solid ${sc_}.25);">${ev._statusName}</span>
          </div>`;
      } else {
        badgesHtml = `
          <div class="badges">
            <span class="badge" style="background:${c}.13);color:${c}.90);border:1px solid ${c}.25);">${T.label}</span>
          </div>`;
      }

      // Detail dla startu
      let detailsContent = '';
      if (isLaunch) {
        const chips = [
          ev._rocket       && `🚀 ${ev._rocket}`,
          ev._missionType  && `📡 ${ev._missionType}`,
          ev._orbit        && `🛸 ${ev._orbit}`,
        ].filter(Boolean).map(t => `<span class="launch-meta-chip">${t}</span>`).join('');

        detailsContent = `
          ${ev.how ? `<div class="launch-meta">${chips}</div>` : ''}
          ${ev.desc ? `<p class="desc">${ev.desc}</p>` : '<p class="desc" style="color:rgba(255,255,255,.25);">Brak opisu misji.</p>'}
          <div class="tip-box" style="background:${c}.10);color:${c}.90);border:1px solid ${c}.22);">⏰ ${ev.tip}</div>`;
      } else {
        detailsContent = `
          <p class="desc">${ev.desc}</p>
          <p class="how">🔭 ${ev.how}</p>
          <div class="tip-box" style="background:${c}.10);color:${c}.90);border:1px solid ${c}.22);">⏰ ${ev.tip}</div>`;
      }

      // Data: dla startu pokaż datetime, dla astro tylko datę
      const dateLabel = isLaunch
        ? fmtDatetime(ev._net.toISOString())
        : fmtDate(ev.date);

      return `
        <div class="event${isOpen ? ' expanded' : ''}${isLaunch ? ' is-launch' : ''}" data-idx="${globalIdx}">
          <div class="event-row" data-action="toggle" data-idx="${globalIdx}">
            ${urgentBarHtml}
            <div class="icon-wrap" style="background:${c}.12);border:1px solid ${c}.25);">
              ${makeIcon(ev.type, r, g, b)}
            </div>
            <div class="event-meta">
              <div class="event-name">${ev.name}</div>
              <div class="event-date">${dateLabel}</div>
              ${badgesHtml}
            </div>
            <div class="event-right">
              <div class="countdown">
                <div class="countdown-num" style="font-size:${dSize};color:${c}1);">${dLabel}</div>
                <div class="countdown-label">${dUnit}</div>
              </div>
              <svg class="chevron${isOpen ? ' open' : ''}" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4,6 8,10 12,6"/>
              </svg>
            </div>
          </div>
          <div class="details${isOpen ? ' open' : ''}">
            ${detailsContent}
          </div>
        </div>`;
    }).join('');

    const _status = this._launchStatus || 'none';
    const _statusHint =
      _status === 'missing'       ? 'brak sensor.upcoming_launches' :
      _status.startsWith('unavailable') ? `sensor ${_status.split(':')[1]}` :
      _status === 'no_results'    ? 'sensor OK, brak atrybutu results' :
      _status.startsWith('ok:0')  ? 'sensor OK, 0 wyników' : '';

    const skipped = this._launchSkipped ?? 0;
    const filterAll = (this._config.launches_filter === 'all');
    const launchInfo = launchCount > 0
      ? `<span class="launch-pill" title="${!filterAll && skipped > 0 ? `pominięto ${skipped} rutynowych (Starlink itp.) · dodaj launches_filter: all by zobaczyć wszystko` : ''}">🚀 ${launchCount} start${launchCount > 1 ? 'ów' : ''}${!filterAll && skipped > 0 ? ` <span style="opacity:.55;font-weight:400">+${skipped} ukryte</span>` : ''}</span>`
      : `<span class="no-launches" title="${_statusHint || 'sprawdź sensor.upcoming_launches'}">${_statusHint ? '⚠ ' + _statusHint : 'brak danych o startach'}</span>`;

    const html = `
      <style>${css}</style>
      <div class="card">
        <div class="header">
          <span class="header-title">Nadchodzące zjawiska</span>
          <div class="header-right">
            ${launchInfo}
            <span class="header-count">${all.length} w kalendarzu</span>
          </div>
        </div>
        <div class="events-list">
          ${eventsHtml}
        </div>
        <div class="footer">
          <button class="nav-btn" id="btn-prev" ${canPrev ? '' : 'disabled'}>← wcześniej</button>
          <span class="footer-info">${off + 1}–${Math.min(off + page, all.length)} z ${all.length}</span>
          <button class="nav-btn" id="btn-next" ${canNext ? '' : 'disabled'}>dalej →</button>
        </div>
      </div>`;

    this.shadowRoot.innerHTML = html;

    this.shadowRoot.querySelectorAll('[data-action="toggle"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggle(parseInt(el.getAttribute('data-idx')));
      });
    });

    const btnPrev = this.shadowRoot.getElementById('btn-prev');
    const btnNext = this.shadowRoot.getElementById('btn-next');
    if (btnPrev && !btnPrev.disabled) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); this._prev(); });
    if (btnNext && !btnNext.disabled) btnNext.addEventListener('click', (e) => { e.stopPropagation(); this._next(); });
  }

  getCardSize() { return 4; }
}

customElements.define('aha-astronomical-events-card', AstronomicalEventsCard);
/**
 * climate-apple-card.js — kompaktowy kafelek, styl Apple Home
 * Ikonka dobierana automatycznie na podstawie obszaru (area) encji.
 *
 * UŻYCIE:
 *   type: custom:climate-apple-card
 *   entity: climate.salon
 *   name: Salon            # opcjonalne
 *   temp_sensor: sensor.X  # opcjonalne
 */

/* ------------------------------------------------------------------ */
/*  SVG paths dla typowych pomieszczeń                                 */
/* ------------------------------------------------------------------ */
const AREA_ICONS = {
  /* salon / living room */
  salon:        'M20 10.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v4.5A2.5 2.5 0 003 13v4h1v1a1 1 0 002 0v-1h12v1a1 1 0 002 0v-1h1v-4a2.5 2.5 0 00-1-2zm-2-4v4h-4V6h4zM6 6h4v4H6V6zm-1 9v-2a.5.5 0 011 0v2H5zm13 0v-2a.5.5 0 011 0v2h-1z',
  living:       'M20 10.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v4.5A2.5 2.5 0 003 13v4h1v1a1 1 0 002 0v-1h12v1a1 1 0 002 0v-1h1v-4a2.5 2.5 0 00-1-2zm-2-4v4h-4V6h4zM6 6h4v4H6V6zm-1 9v-2a.5.5 0 011 0v2H5zm13 0v-2a.5.5 0 011 0v2h-1z',
  lounge:       'M20 10.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v4.5A2.5 2.5 0 003 13v4h1v1a1 1 0 002 0v-1h12v1a1 1 0 002 0v-1h1v-4a2.5 2.5 0 00-1-2zm-2-4v4h-4V6h4zM6 6h4v4H6V6zm-1 9v-2a.5.5 0 011 0v2H5zm13 0v-2a.5.5 0 011 0v2h-1z',

  /* sypialnia / bedroom */
  sypialnia:    'M7 13V7a1 1 0 011-1h8a1 1 0 011 1v6h2V7a3 3 0 00-3-3H8a3 3 0 00-3 3v6H3v4h2v1h2v-1h10v1h2v-1h2v-4H7zm-2 2h14v2H5v-2z',
  bedroom:      'M7 13V7a1 1 0 011-1h8a1 1 0 011 1v6h2V7a3 3 0 00-3-3H8a3 3 0 00-3 3v6H3v4h2v1h2v-1h10v1h2v-1h2v-4H7zm-2 2h14v2H5v-2z',
  master:       'M7 13V7a1 1 0 011-1h8a1 1 0 011 1v6h2V7a3 3 0 00-3-3H8a3 3 0 00-3 3v6H3v4h2v1h2v-1h10v1h2v-1h2v-4H7zm-2 2h14v2H5v-2z',

  /* kuchnia / kitchen */
  kuchnia:      'M10 2v8H8V2H6v8a4 4 0 003 3.87V22h2v-8.13A4 4 0 0014 10V2h-2v8h-2zm8 0h-1v7h1a3 3 0 003-3V5a3 3 0 00-3-3zm0 2a1 1 0 011 1v3a1 1 0 01-1 1h-1V5l1-1z',
  kitchen:      'M10 2v8H8V2H6v8a4 4 0 003 3.87V22h2v-8.13A4 4 0 0014 10V2h-2v8h-2zm8 0h-1v7h1a3 3 0 003-3V5a3 3 0 00-3-3zm0 2a1 1 0 011 1v3a1 1 0 01-1 1h-1V5l1-1z',

  /* łazienka / bathroom */
  lazienka:     'M7 6a2 2 0 114 0 2 2 0 01-4 0zm10 5H4a2 2 0 00-2 2v2a6 6 0 005 5.92V22h2v-1h6v1h2v-1.08A6 6 0 0022 15v-2a2 2 0 00-2-2zm0 4a4 4 0 01-4 4H9a4 4 0 01-4-4v-2h12v2z',
  bathroom:     'M7 6a2 2 0 114 0 2 2 0 01-4 0zm10 5H4a2 2 0 00-2 2v2a6 6 0 005 5.92V22h2v-1h6v1h2v-1.08A6 6 0 0022 15v-2a2 2 0 00-2-2zm0 4a4 4 0 01-4 4H9a4 4 0 01-4-4v-2h12v2z',
  toaleta:      'M7 6a2 2 0 114 0 2 2 0 01-4 0zm10 5H4a2 2 0 00-2 2v2a6 6 0 005 5.92V22h2v-1h6v1h2v-1.08A6 6 0 0022 15v-2a2 2 0 00-2-2zm0 4a4 4 0 01-4 4H9a4 4 0 01-4-4v-2h12v2z',

  /* gabinet / office */
  gabinet:      'M20 3H4a2 2 0 00-2 2v12a2 2 0 002 2h6v2H8v2h8v-2h-2v-2h6a2 2 0 002-2V5a2 2 0 00-2-2zm0 14H4V5h16v12z',
  office:       'M20 3H4a2 2 0 00-2 2v12a2 2 0 002 2h6v2H8v2h8v-2h-2v-2h6a2 2 0 002-2V5a2 2 0 00-2-2zm0 14H4V5h16v12z',
  study:        'M20 3H4a2 2 0 00-2 2v12a2 2 0 002 2h6v2H8v2h8v-2h-2v-2h6a2 2 0 002-2V5a2 2 0 00-2-2zm0 14H4V5h16v12z',

  /* pokój dziecięcy */
  pokoj:        'M12 3a9 9 0 100 18A9 9 0 0012 3zm0 2a7 7 0 110 14A7 7 0 0112 5zm-1 3v5l4 2.5-.75-1.3L11 13V8h-1 1z',
  dziecko:      'M12 2a5 5 0 100 10A5 5 0 0012 2zm0 2a3 3 0 110 6 3 3 0 010-6zM6 20v-1a6 6 0 0112 0v1h2v-1a8 8 0 00-16 0v1h2z',
  child:        'M12 2a5 5 0 100 10A5 5 0 0012 2zm0 2a3 3 0 110 6 3 3 0 010-6zM6 20v-1a6 6 0 0112 0v1h2v-1a8 8 0 00-16 0v1h2z',
  nursery:      'M12 2a5 5 0 100 10A5 5 0 0012 2zm0 2a3 3 0 110 6 3 3 0 010-6zM6 20v-1a6 6 0 0112 0v1h2v-1a8 8 0 00-16 0v1h2z',

  /* przedpokój / hall */
  przedpokoj:   'M12 3L4 9v12h5v-7h6v7h5V9l-8-6z',
  hall:         'M12 3L4 9v12h5v-7h6v7h5V9l-8-6z',
  hallway:      'M12 3L4 9v12h5v-7h6v7h5V9l-8-6z',
  entryway:     'M12 3L4 9v12h5v-7h6v7h5V9l-8-6z',

  /* jadalnia / dining */
  jadalnia:     'M3 13h2v7H3v-7zm4-8h2v15H7V5zm4 3h2v12h-2V8zm4-5h2v17h-2V3zm4 5h2v12h-2V8z',
  dining:       'M3 13h2v7H3v-7zm4-8h2v15H7V5zm4 3h2v12h-2V8zm4-5h2v17h-2V3zm4 5h2v12h-2V8z',

  /* garaż / garage */
  garaz:        'M19 9l-7-6-7 6v11h5v-5h4v5h5V9z',
  garage:       'M19 9l-7-6-7 6v11h5v-5h4v5h5V9z',

  /* domyślna — termometr */
  _default:     'M15 13V5a3 3 0 00-6 0v8a5 5 0 106 0zm-3 5a3 3 0 110-6 3 3 0 010 6z',
};

function getIconPath(areaName) {
  if (!areaName) return AREA_ICONS._default;
  const normalized = areaName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');

  for (const [key, path] of Object.entries(AREA_ICONS)) {
    if (key === '_default') continue;
    if (normalized.includes(key)) return path;
  }
  return AREA_ICONS._default;
}

/* ------------------------------------------------------------------ */

class ClimateAppleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity) throw new Error('[climate-apple-card] Wymagane: entity');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() { return 1; }

  _getAreaName(entityId) {
    try {
      const entityReg = this._hass.entities?.[entityId];
      let areaId = entityReg?.area_id;

      if (!areaId) {
        const deviceId = entityReg?.device_id;
        if (deviceId) areaId = this._hass.devices?.[deviceId]?.area_id;
      }

      if (areaId) return this._hass.areas?.[areaId]?.name ?? null;
    } catch (_) {}
    return null;
  }

  _render() {
    if (!this._hass || !this._config) return;

    const entityId = this._config.entity;
    const state    = this._hass.states[entityId];

    if (!state) {
      this.shadowRoot.innerHTML = `<p style="padding:10px;color:#FF3B30;font-family:system-ui;font-size:12px;">Nie znaleziono: ${entityId}</p>`;
      return;
    }

    const attr       = state.attributes;
    const isOff      = state.state === 'off';
    const hvacAction = attr.hvac_action ?? (isOff ? 'off' : 'idle');
    const isHeating  = hvacAction === 'heating';
    const isCooling  = hvacAction === 'cooling';
    const isActive   = !isOff && (isHeating || isCooling);

    let currentTemp = attr.current_temperature;
    if (currentTemp == null && this._config.temp_sensor) {
      currentTemp = parseFloat(this._hass.states[this._config.temp_sensor]?.state);
    }
    if (currentTemp == null) {
      for (const g of [
        entityId.replace('climate.', 'sensor.') + '_temperature',
        entityId.replace('climate.', 'sensor.') + '_current_temperature',
      ]) {
        const v = parseFloat(this._hass.states[g]?.state);
        if (!isNaN(v)) { currentTemp = v; break; }
      }
    }
    const curDisplay = currentTemp != null ? Number(currentTemp).toFixed(1) : '--';

    const targetTemp = attr.temperature ?? 20;
    const name       = this._config.name ?? attr.friendly_name ?? entityId;
    const accentClr  = isCooling ? '#32ADE6' : '#FF9500';

    const areaName   = this._getAreaName(entityId);
    const iconPath   = getIconPath(areaName ?? name);

    let statusLabel = 'Wyłączony';
    if (!isOff) {
      if      (isHeating) statusLabel = 'Ogrzewanie';
      else if (isCooling) statusLabel = 'Chłodzenie';
      else                statusLabel = 'Osiągnięto';
    }

    this.shadowRoot.innerHTML = `
      <style>
        @keyframes pdot {
          0%,100% { opacity:1; transform:scale(1)   }
          50%      { opacity:.2; transform:scale(.55) }
        }
        @keyframes rise {
          0%   { transform:translateY(0) scale(1);     opacity:.8  }
          100% { transform:translateY(-45px) scale(2); opacity:0   }
        }

        :host { display:block; }

        .card {
          border-radius: 18px;
          padding: 12px 14px;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #E5E5EA;
          transition: background-color .5s cubic-bezier(.4,0,.2,1);
          font-family: -apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .card.on      { background: #FFE8B8; }
        .card.cooling { background: #C8E4FF; }

        @media (prefers-color-scheme: dark) {
          .card         { background: #2C2C2E; }
          .card.on      { background: #2D1E06; }
          .card.cooling { background: #0A1A2E; }
        }

        .particles { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
        .pt { position:absolute; border-radius:50%; opacity:0; }
        .card.heating .pt { background:#FF9500; animation:rise 2.4s ease-out infinite; }
        .card.cooling .pt { background:#5AC8FA; animation:rise 2.8s ease-out infinite; }
        .pt:nth-child(1) { width:7px;  height:7px;  bottom:14px; left:12%; animation-delay:0s;   }
        .pt:nth-child(2) { width:4px;  height:4px;  bottom:8px;  left:35%; animation-delay:.65s; }
        .pt:nth-child(3) { width:6px;  height:6px;  bottom:18px; left:58%; animation-delay:1.2s; }
        .pt:nth-child(4) { width:4px;  height:4px;  bottom:6px;  left:80%; animation-delay:1.9s; }

        .top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .ibadge {
          width: 34px; height: 34px; border-radius: 10px;
          background: #1C1C1E;
          display: flex; align-items: center; justify-content: center;
          color: #AEAEB2;
          transition: background-color .4s, color .4s;
          flex-shrink: 0;
        }
        .card.on .ibadge      { background: #3D2C0A; color: #FFD080; }
        .card.cooling .ibadge { background: #0C233A; color: #5AC8FA; }

        @media (prefers-color-scheme: dark) {
          .ibadge               { background: #000; color: #636366; }
          .card.on .ibadge      { background: #3D2C0A; color: #FFD080; }
          .card.cooling .ibadge { background: #061628; color: #5AC8FA; }
        }

        .sw {
          width: 38px; height: 22px; border-radius: 11px;
          background: #C7C7CC;
          position: relative; cursor: pointer;
          transition: background-color .22s;
          flex-shrink: 0;
        }
        .sw.on { background: #FF9500; }
        .card.cooling .sw.on { background: #32ADE6; }
        .sw-t {
          width: 18px; height: 18px; background: #fff; border-radius: 50%;
          position: absolute; top: 2px; left: 2px;
          transition: transform .22s cubic-bezier(.4,0,.2,1);
          box-shadow: 0 2px 4px rgba(0,0,0,.28);
        }
        .sw.on .sw-t { transform: translateX(16px); }

        @media (prefers-color-scheme: dark) {
          .sw { background: #48484A; }
        }

        .temp-cur {
          font-size: 36px; font-weight: 600; line-height: 1;
          color: #1C1C1E; letter-spacing: -1.5px;
          position: relative;
        }
        .temp-unit { font-size: 20px; font-weight: 400; color: #8E8E93; letter-spacing: 0; }

        @media (prefers-color-scheme: dark) {
          .temp-cur { color: #FFFFFF; }
        }

        .sub { font-size: 12px; color: #8E8E93; margin-top: 1px; }

        .bottom-row {
          display: flex;
          align-items: center;
          position: relative;
        }

        .status-txt  { font-size: 11px; color: #8E8E93; }

        .dots { display: flex; gap: 3px; align-items: center; margin-right: 4px; }
        .dot  {
          width: 4px; height: 4px; border-radius: 50%;
          display: inline-block;
          animation: pdot 1.1s ease-in-out infinite;
        }
      </style>

      <div class="card ${isOff ? '' : 'on'} ${isHeating ? 'heating' : ''} ${isCooling ? 'cooling' : ''}">

        <div class="particles">
          <div class="pt"></div><div class="pt"></div>
          <div class="pt"></div><div class="pt"></div>
        </div>

        <div class="top-row">
          <div class="ibadge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="${iconPath}"/>
            </svg>
          </div>
          <div class="sw ${isOff ? '' : 'on'}" id="sw"><div class="sw-t"></div></div>
        </div>

        <div>
          <div class="temp-cur">${curDisplay}<span class="temp-unit">°</span></div>
          <div class="sub">${name} · cel ${Number(targetTemp).toFixed(1)}°</div>
        </div>

        <div class="bottom-row">
          ${isActive ? `
            <div class="dots">
              <span class="dot" style="background:${accentClr}"></span>
              <span class="dot" style="background:${accentClr};animation-delay:.15s"></span>
              <span class="dot" style="background:${accentClr};animation-delay:.3s"></span>
            </div>
            <span class="status-txt" style="color:${accentClr}">${statusLabel}</span>
          ` : `<span class="status-txt">${statusLabel}</span>`}
        </div>

      </div>
    `;

    this.shadowRoot.getElementById('sw')?.addEventListener('click', () => {
      if (!this._hass) return;
      const s = this._hass.states[this._config.entity]?.state;
      this._hass.callService('climate', s === 'off' ? 'turn_on' : 'turn_off', {
        entity_id: this._config.entity,
      });
    });
  }
}

customElements.define('aha-climate-apple-card', ClimateAppleCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-climate-apple-card',
  name:        'Climate Apple Card',
  preview:     false,
  description: 'Kompaktowy kafelek klimatu — ikonka z obszaru, styl Apple Home.',
});// solar-clock-card.js
// Place in: /config/www/solar-clock-card.js
// Resource: url: /local/solar-clock-card.js  type: module

const LAT = 52.40, LON = 16.87;
const SHOW_PLANETS = true;

const DAYS   = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];
const pad = n => String(n).padStart(2,'0');

// ─── SUN MATH ────────────────────────────────────────────────────────────────

function dayOfYear(d){ return Math.floor((d - new Date(d.getFullYear(),0,0)) / 86400000); }

function solarElev(date, lat, lon, hour) {
  const d2 = new Date(date);
  d2.setHours(Math.floor(hour), Math.floor((hour%1)*60), Math.floor(((hour*60)%1)*60), 0);
  const doy = dayOfYear(d2);
  const decl = 23.45 * Math.sin(Math.PI/180 * (360/365*(doy-81)));
  const B = (360/365*(doy-81)) * Math.PI/180;
  const eot = 9.87*Math.sin(2*B) - 7.53*Math.cos(B) - 1.5*Math.sin(B);
  const tz = -d2.getTimezoneOffset()/60;
  const noon = 12*60 - 4*(lon - 15*tz) - eot;
  const ha = (hour*60 - noon) / 4;
  const sinE = Math.sin(lat*Math.PI/180)*Math.sin(decl*Math.PI/180)
             + Math.cos(lat*Math.PI/180)*Math.cos(decl*Math.PI/180)*Math.cos(ha*Math.PI/180);
  return Math.asin(Math.max(-1, Math.min(1, sinE))) * 180/Math.PI;
}

function findCross(date, lat, lon, rising) {
  let br = null;
  for (let h = 0; h < 24; h += 1/60) {
    const p = solarElev(date, lat, lon, h-1/60), c = solarElev(date, lat, lon, h);
    if (rising && p<0 && c>=0) { br=[h-1/60,h]; break; }
    if (!rising && p>=0 && c<0) { br=[h-1/60,h]; break; }
  }
  if (!br) return null;
  let lo=br[0], hi=br[1];
  for (let i=0; i<8; i++) {
    const mid=(lo+hi)/2, e=solarElev(date,lat,lon,mid);
    if (rising){ if(e<0)lo=mid; else hi=mid; }
    else        { if(e>=0)lo=mid; else hi=mid; }
  }
  return (lo+hi)/2;
}

function fmtH(h) {
  if (h===null) return '—';
  const hh=Math.floor(h), mm=Math.round((h-hh)*60);
  const m2=mm===60?0:mm, h2=mm===60?hh+1:hh;
  return pad(h2)+':'+pad(m2);
}

// ─── PLANETS ─────────────────────────────────────────────────────────────────

function julianDay(date){ return date.getTime()/86400000 + 2440587.5; }

function planetPosition(name, date, lat, lon) {
  const JD = julianDay(date);
  const T = (JD-2451545.0)/36525;
  const d = JD - 2451543.5;
  const planets = {
    Merkury:{e:0.20563,L0:252.251,Ldot:4.09234,w:77.456},
    Wenus:  {e:0.00677,L0:181.980,Ldot:1.60214,w:131.564},
    Mars:   {e:0.09340,L0:355.433,Ldot:0.52403,w:336.060},
    Jowisz: {e:0.04839,L0:34.396, Ldot:0.08309,w:14.728},
    Saturn: {e:0.05415,L0:49.954, Ldot:0.03346,w:92.432},
  };
  const p = planets[name]; if (!p) return null;
  const L = ((p.L0 + p.Ldot*d)%360+360)%360;
  const M = (L - p.w + 360) % 360;
  const Mr = M*Math.PI/180;
  const C = (2*p.e - p.e**3/4)*Math.sin(Mr) + (5/4)*p.e**2*Math.sin(2*Mr) + (13/12)*p.e**3*Math.sin(3*Mr);
  const lon_ecl = (L + C*180/Math.PI + 360) % 360;
  const eps = 23.4393 - 0.0130*T;
  const er = eps*Math.PI/180, lr = lon_ecl*Math.PI/180;
  const RA = Math.atan2(Math.sin(lr)*Math.cos(er), Math.cos(lr)) * 180/Math.PI;
  const Dec = Math.asin(Math.sin(er)*Math.sin(lr)) * 180/Math.PI;
  const LST0 = 100.4606 + 36000.7701*T + lon/15;
  const nowH2 = date.getHours() + date.getMinutes()/60 + date.getSeconds()/3600;
  const LST = ((LST0 + nowH2*15)%360+360)%360;
  const HA = ((LST - RA)%360+360)%360;
  const HAr=HA*Math.PI/180, latr=lat*Math.PI/180, Decr=Dec*Math.PI/180;
  const sinAlt = Math.sin(latr)*Math.sin(Decr) + Math.cos(latr)*Math.cos(Decr)*Math.cos(HAr);
  const alt = Math.asin(Math.max(-1,Math.min(1,sinAlt))) * 180/Math.PI;
  const cosAlt = Math.cos(alt*Math.PI/180);
  const cosAz = cosAlt>0.0001 ? (Math.sin(Decr) - Math.sin(latr)*sinAlt)/(Math.cos(latr)*cosAlt) : 0;
  const azRaw = Math.acos(Math.max(-1,Math.min(1,cosAz))) * 180/Math.PI;
  const az = Math.sin(HAr)>0 ? 360-azRaw : azRaw;
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  const dir = dirs[Math.round(az/45)%8];
  const magMap = {Merkury:-0.5,Wenus:-4.0,Mars:0.5,Jowisz:-2.5,Saturn:0.8};
  return { alt:Math.round(alt*10)/10, az:Math.round(az), dir, mag:magMap[name], visible:alt>5 };
}

const PLANET_NAMES   = ['Wenus','Jowisz','Mars','Saturn','Merkury'];
const PLANET_SYMBOLS = {Wenus:'♀',Jowisz:'♃',Mars:'♂',Saturn:'♄',Merkury:'☿'};
const PLANET_COLORS  = {Wenus:'255,220,80',Jowisz:'255,195,120',Mars:'255,100,60',Saturn:'215,175,80',Merkury:'150,195,220'};

// ─── EVENTS ──────────────────────────────────────────────────────────────────

const EVENTS = [
  { date:'2026-04-22', type:'meteors',     label:'Liridy',                    sublabel:'Do 20 meteorów/h · korzystne warunki (księżyc 27%)', sublabelToday:'Maksimum Lirydów tej nocy · ok. 20 meteorów/h · księżyc umiarkowany', sublabelTomorrow:'Jutro noc: Liridy · 20 meteorów/h · wyjdź po północy', hasMeteors:false },
  { date:'2026-06-09', type:'conjunction', label:'Koniunkcja Wenus i Jowisza', sublabel:'Dwie najjaśniejsze planety ~1.6° od siebie · wieczór na zachodzie', sublabelToday:'Wenus i Jowisz dziś wieczór ~1.6° od siebie — spektakularny widok!', sublabelTomorrow:'Jutro wieczór: Wenus + Jowisz razem na niebie — najjaśniejsza para!', hasMeteors:false },
  { date:'2026-08-12', type:'eclipse',     label:'Zaćmienie Słońca',          sublabel:'~80% tarczy w Polsce · godz. 19:15 · całkowite w Hiszpanii', sublabelToday:'Start 19:15 · max 19:56 (~80%) · nie patrz bez okularów ISO 12312-2', sublabelTomorrow:'Jutro godz. 19:15 · ~80% tarczy · kup okulary ISO 12312-2', hasMeteors:true },
  { date:'2026-08-12', type:'meteors',     label:'Perseidy 2026',             sublabel:'Do 60 meteorów/h · bezksiężycowa noc — idealne warunki!', sublabelToday:'Perseidy + zaćmienie tej samej nocy! 60/h · nów — czarne niebo', sublabelTomorrow:'Jutro noc: Perseidy 60/h + zaćmienie Słońca — wyjątkowa noc!', hasMeteors:false },
  { date:'2026-08-28', type:'lunar_eclipse', label:'Zaćmienie Księżyca',      sublabel:'Częściowe ~96% · widoczne z Polski · godz. 04:12', sublabelToday:'Częściowe zaćmienie 96% — wschodzi czerwonawy Księżyc · godz. 04:12', sublabelTomorrow:'Jutro rano godz. 04:12 · częściowe zaćmienie 96% · bez sprzętu', hasMeteors:false },
  { date:'2026-10-04', type:'planet',      label:'Saturn w opozycji',         sublabel:'Pierścienie pod kątem 10° · najlepszy czas na obserwację', sublabelToday:'Saturn dziś w opozycji — najjaśniejszy w roku · pierścienie coraz lepiej widoczne', sublabelTomorrow:'Jutro Saturn w opozycji — szukaj go przez lornetkę', hasMeteors:false },
  { date:'2026-10-21', type:'meteors',     label:'Orionidy',                  sublabel:'Do 20 meteorów/h · księżyc 72% — obserwuj po 2:00', sublabelToday:'Maksimum Orionidów · 20/h · najlepiej po godz. 02:00 gdy księżyc zajdzie', sublabelTomorrow:'Jutro noc: Orionidy 20/h · wyjdź po godz. 02:00', hasMeteors:false },
  { date:'2026-11-12', type:'meteors',     label:'Taurydy Północne',          sublabel:'Wolne, jasne bolidy · księżyc 7% — prawie idealne warunki', sublabelToday:'Taurydy Północne — wolne efektowne bolidy · ciemne niebo', sublabelTomorrow:'Jutro noc: Taurydy — jasne powolne bolidy, warto wyglądać', hasMeteors:false },
  { date:'2026-11-15', type:'conjunction', label:'Koniunkcja Marsa i Jowisza',sublabel:'Tuż przed świtem · południe nieba · łatwa do obserwacji', sublabelToday:'Mars i Jowisz blisko siebie dziś przed świtem · patrz na południe', sublabelTomorrow:'Jutro przed świtem: Mars + Jowisz w bliskiej koniunkcji', hasMeteors:false },
  { date:'2026-11-17', type:'meteors',     label:'Leonidy',                   sublabel:'Do 15 meteorów/h · księżyc 45% · obserwuj po 01:00', sublabelToday:'Maksimum Leonidów · szybkie meteory z Lwa · wyjdź po 01:00', sublabelTomorrow:'Jutro noc: Leonidy · 15/h · wyjdź po godz. 01:00', hasMeteors:false },
  { date:'2026-11-24', type:'moon',        label:'Superksiężyc — listopad',   sublabel:'Drugi superksiężyc 2026 · wyraźnie większy i jaśniejszy', sublabelToday:'Dziś superksiężyc! Księżyc wyjątkowo blisko Ziemi — obserwuj wschód', sublabelTomorrow:'Jutro superksiężyc listopadowy · wyjdź na wschód księżyca', hasMeteors:false },
  { date:'2026-12-13', type:'meteors',     label:'Geminidy 2026',             sublabel:'Do 120 meteorów/h · księżyc 21% — doskonałe warunki!', sublabelToday:'Geminidy — NAJLEPSZY rój roku! 120/h · prawie ciemne niebo · WYJDŹ!', sublabelTomorrow:'Jutro noc: Geminidy 120/h · księżyc nie przeszkadza — nie przegap!', hasMeteors:false },
  { date:'2026-12-23', type:'moon',        label:'Superksiężyc — rekord 2026',sublabel:'Najbliższy księżyc od 2019 r. · 221 668 km od Ziemi', sublabelToday:'Rekordowy superksiężyc! Największy i najjaśniejszy od 2019 r. — wyjdź na zewnątrz!', sublabelTomorrow:'Jutro rekordowy superksiężyc 2026 · najbliższy od 7 lat!', hasMeteors:false },
  { date:'2027-01-03', type:'meteors',     label:'Kwadrantydy 2027',          sublabel:'Do 80 meteorów/h · księżyc 20% — dobre warunki', sublabelToday:'Kwadrantydy — ostry szczyt kilka godzin! 80/h · obserwuj ok. 03:00', sublabelTomorrow:'Jutro 3 stycznia: Kwadrantydy 80/h · szczyt trwa tylko kilka godzin', hasMeteors:false },
  { date:'2027-08-02', type:'eclipse',     label:'Zaćmienie Słońca 2027',     sublabel:'Najdłuższe w XXI w. · 6 min 23 s · Egipt, S. Hiszpania', sublabelToday:'Całkowite zaćmienie — najdłuższe w XXI w. · nie patrz bez okularów', sublabelTomorrow:'Jutro zaćmienie 2027 · całkowite w Egipcie 6 min 23 s', hasMeteors:false },
  { date:'2027-08-12', type:'meteors',     label:'Perseidy 2027',             sublabel:'Do 100 meteorów/h · sprawdź fazę księżyca', sublabelToday:'Perseidy 2027 · do 100 meteorów/h · klasyczna letnia noc', sublabelTomorrow:'Jutro noc: Perseidy 2027 · do 100/h', hasMeteors:false },
  { date:'2031-11-17', type:'meteors',     label:'Leonidy 2031 — HISTORYCZNE!',sublabel:'Możliwy deszcz meteorów · Tempel-Tuttle w peryhelium!', sublabelToday:'Leonidy 2031 — możliwe tysiące meteorów/h! Obserwuj całą noc!', sublabelTomorrow:'Jutro Leonidy 2031 — możliwy deszcz stulecia!', hasMeteors:false },
];

function daysUntil(dateStr) {
  const target = new Date(dateStr); target.setHours(0,0,0,0);
  const today  = new Date();         today.setHours(0,0,0,0);
  return Math.round((target - today) / 86400000);
}

// ─── ICON GENERATORS ─────────────────────────────────────────────────────────

function typeTheme(type) {
  switch(type) {
    case 'eclipse':       return {r:255,g:190,b:50};
    case 'lunar_eclipse': return {r:255,g:80, b:80};
    case 'meteors':       return {r:160,g:100,b:255};
    case 'conjunction':   return {r:80, g:200,b:255};
    case 'planet':        return {r:60, g:200,b:160};
    case 'moon':          return {r:220,g:200,b:100};
    default:              return {r:160,g:160,b:160};
  }
}

function eventIcon(type, size, ac) {
  const r = size/2, c = ac;
  switch(type) {
    case 'eclipse':
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
        <circle cx="${r*0.78}" cy="${r}" r="${r*0.62}" fill="${c.replace('1)','0.28)')}" stroke="${c}" stroke-width="${r*0.14}"/>
        <circle cx="${r*1.5}" cy="${r}" r="${r*0.62}" fill="rgba(8,12,28,0.92)"/></svg>`;
    case 'lunar_eclipse':
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
        <circle cx="${r}" cy="${r}" r="${r*0.72}" fill="${c.replace('1)','0.22)')}" stroke="${c}" stroke-width="${r*0.13}"/>
        <circle cx="${r*0.72}" cy="${r*0.68}" r="${r*0.16}" fill="${c.replace('1)','0.45)')}"/></svg>`;
    case 'meteors':
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
        <line x1="${size*.75}" y1="${size*.08}" x2="${size*.18}" y2="${size*.65}" stroke="rgba(180,130,255,.95)" stroke-width="${size*.10}" stroke-linecap="round"/>
        <line x1="${size*.50}" y1="${size*.20}" x2="${size*.05}" y2="${size*.75}" stroke="rgba(160,110,255,.75)" stroke-width="${size*.08}" stroke-linecap="round"/>
        <circle cx="${size*.82}" cy="${size*.16}" r="${size*.10}" fill="rgba(230,200,255,.95)"/>
        <circle cx="${size*.55}" cy="${size*.26}" r="${size*.07}" fill="rgba(210,175,255,.80)"/></svg>`;
    case 'conjunction':
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
        <circle cx="${r*.6}" cy="${r}" r="${r*.42}" fill="${c.replace('1)','0.25)')}" stroke="${c}" stroke-width="${r*.12}"/>
        <circle cx="${r*1.45}" cy="${r}" r="${r*.30}" fill="${c.replace('1)','0.18)')}" stroke="${c.replace('1)','0.72)')}" stroke-width="${r*.10}"/></svg>`;
    case 'planet':
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
        <circle cx="${r}" cy="${r}" r="${r*.52}" fill="${c.replace('1)','0.22)')}" stroke="${c}" stroke-width="${r*.12}"/>
        <ellipse cx="${r}" cy="${r}" rx="${r*.90}" ry="${r*.22}" fill="none" stroke="${c.replace('1)','0.55)')}" stroke-width="${r*.09}"/></svg>`;
    case 'moon':
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
        <circle cx="${r}" cy="${r}" r="${r*.75}" fill="${c.replace('1)','0.20)')}" stroke="${c}" stroke-width="${r*.13}"/>
        <circle cx="${r*.72}" cy="${r*.68}" r="${r*.15}" fill="${c.replace('1)','0.38)')}"/>
        <circle cx="${r*1.25}" cy="${r*1.22}" r="${r*.10}" fill="${c.replace('1)','0.25)')}"/></svg>`;
    default:
      return '';
  }
}

// ─── BACKGROUND ──────────────────────────────────────────────────────────────

function generateDynamicBg(elev, temp, weather, phase) {
  let c1, c2, c3;
  if (elev < -18) { c1='#010204'; c2='#020408'; c3='#030610'; }
  else if (elev < -12) {
    const t=(elev+18)/6;
    if (phase.includes('R')) {
      c1=`rgb(${2+Math.floor(t*4)},${4+Math.floor(t*6)},${14+Math.floor(t*12)})`;
      c2=`rgb(${5+Math.floor(t*8)},${8+Math.floor(t*12)},${24+Math.floor(t*20)})`;
      c3=`rgb(${3+Math.floor(t*5)},${6+Math.floor(t*8)},${16+Math.floor(t*14)})`;
    } else { c1='#030410'; c2='#060618'; c3='#040512'; }
  }
  else if (elev < -6) {
    const t=(elev+12)/6;
    if (phase.includes('R')) {
      c1=`rgb(${6+Math.floor(t*20)},${10+Math.floor(t*15)},${26+Math.floor(t*30)})`;
      c2=`rgb(${7+Math.floor(t*35)},${12+Math.floor(t*20)},${44+Math.floor(t*40)})`;
      c3=`rgb(${5+Math.floor(t*18)},${8+Math.floor(t*12)},${24+Math.floor(t*28)})`;
    } else {
      c1=`rgb(${26-Math.floor(t*20)},${16-Math.floor(t*10)},${24-Math.floor(t*14)})`;
      c2=`rgb(${44-Math.floor(t*32)},${28-Math.floor(t*18)},${30-Math.floor(t*20)})`;
      c3=`rgb(${22-Math.floor(t*16)},${18-Math.floor(t*12)},${22-Math.floor(t*14)})`;
    }
  }
  else if (elev < 0) {
    const t=(elev+6)/6;
    if (phase.includes('R')) {
      c1=`rgb(${Math.floor(6+t*18)},${Math.floor(7+t*18)},${Math.floor(24+t*14)})`;
      c2=`rgb(${Math.floor(20+t*34)},${Math.floor(10+t*30)},${Math.floor(38+t*8)})`;
      c3=`rgb(${Math.floor(30+t*24)},${Math.floor(12+t*18)},${Math.floor(8+t*10)})`;
    } else {
      c1=`rgb(${Math.floor(28-t*8)},${Math.floor(6+t*6)},${Math.floor(6+t*2)})`;
      c2=`rgb(${Math.floor(60-t*20)},${Math.floor(14-t*4)},${Math.floor(8+t*2)})`;
      c3=`rgb(${Math.floor(24-t*6)},${Math.floor(6+t*4)},${Math.floor(6+t*10)})`;
    }
  }
  else if (elev < 4) {
    const t=elev/4;
    if (phase.includes('R')) {
      c1=`rgb(${Math.floor(24+t*30)},${Math.floor(25+t*20)},${Math.floor(38-t*18)})`;
      c2=`rgb(${Math.floor(54+t*50)},${Math.floor(40+t*30)},${Math.floor(46-t*26)})`;
      c3=`rgb(${Math.floor(54+t*40)},${Math.floor(30+t*25)},${Math.floor(18-t*8)})`;
    } else {
      c1=`rgb(${Math.floor(28-t*8)},${Math.floor(12-t*6)},${Math.floor(8-t*2)})`;
      c2=`rgb(${Math.floor(60-t*20)},${Math.floor(14-t*8)},${Math.floor(10-t*4)})`;
      c3=`rgb(${Math.floor(24-t*6)},${Math.floor(10-t*4)},${Math.floor(16+t*4)})`;
    }
  }
  else {
    let r1=4,g1=12,b1=32,r2=7,g2=18,b2=48;
    if (temp !== null) {
      if (temp>=30){ r1+=Math.floor((temp-30)*.8); g1+=Math.floor((temp-30)*.4); r2+=Math.floor((temp-30)*1.2); g2+=Math.floor((temp-30)*.6); }
      else if (temp<=5){ b1+=Math.floor((5-temp)*.6); b2+=Math.floor((5-temp)*1.0); }
    }
    c1=`rgb(${r1},${g1},${b1})`; c2=`rgb(${r2},${g2},${b2})`;
    c3=`rgb(${Math.floor(r1*.8)},${Math.floor(g1*.9)},${Math.floor(b1*1.1)})`;
  }
  if (['rainy','pouring','lightning','lightning-rainy'].includes(weather)) {
    const dim = s => s.replace(/rgb\((\d+),(\d+),(\d+)\)/,(m,r,g,b)=>`rgb(${Math.floor(r*.7)},${Math.floor(g*.7)},${Math.floor(b*.8)})`);
    c1=dim(c1); c2=dim(c2);
  } else if (weather==='cloudy') {
    const dim = s => s.replace(/rgb\((\d+),(\d+),(\d+)\)/,(m,r,g,b)=>`rgb(${Math.floor(r*.85)},${Math.floor(g*.85)},${Math.floor(b*.90)})`);
    c1=dim(c1);
  }
  return `linear-gradient(158deg,${c1} 0%,${c2} 50%,${c3} 100%)`;
}

// ─── SUN GLOW STYLE ──────────────────────────────────────────────────────────

function sunStyle(e, r) {
  if (e<-18) return {col:'rgba(120,148,220,.90)',rad:3.2,rings:[{rx:9,op:.18,c:'rgba(100,130,210,1)'}]};
  if (e<-12) return {col:r?'rgba(55,70,155,.70)':'rgba(50,50,140,.70)',rad:2.8,rings:[{rx:8,op:.18,c:r?'rgba(65,85,195,1)':'rgba(58,58,175,1)'}]};
  if (e<-6)  return {col:r?'rgba(68,105,210,.88)':'rgba(138,62,210,.88)',rad:3.5,rings:[{rx:13,op:.12,c:r?'rgba(68,105,230,1)':'rgba(155,55,230,1)'},{rx:7,op:.28,c:r?'rgba(78,118,240,1)':'rgba(168,62,240,1)'}]};
  if (e<0)   return {col:r?'rgba(255,145,45,.95)':'rgba(255,72,32,.95)',rad:4.8,rings:[{rx:24,op:.04,c:r?'rgba(255,148,42,1)':'rgba(255,75,28,1)'},{rx:15,op:.10,c:r?'rgba(255,158,55,1)':'rgba(255,88,38,1)'},{rx:9,op:.24,c:r?'rgba(255,172,72,1)':'rgba(255,105,52,1)'}]};
  if (e<4)   return {col:r?'rgba(255,215,90,1)':'rgba(255,128,42,1)',rad:6.8,rings:[{rx:44,op:.025,c:r?'rgba(255,205,55,1)':'rgba(255,105,25,1)'},{rx:30,op:.06,c:r?'rgba(255,212,68,1)':'rgba(255,118,35,1)'},{rx:20,op:.135,c:r?'rgba(255,220,88,1)':'rgba(255,135,50,1)'},{rx:12,op:.26,c:r?'rgba(255,228,112,1)':'rgba(255,155,68,1)'}]};
  if (e<13)  return {col:'rgba(255,235,108,1)',rad:5.5,rings:[{rx:32,op:.035,c:'rgba(255,225,55,1)'},{rx:22,op:.082,c:'rgba(255,230,75,1)'},{rx:14,op:.185,c:'rgba(255,238,105,1)'},{rx:8,op:.355,c:'rgba(255,244,145,1)'}]};
  if (e<40)  return {col:'rgba(255,248,175,1)',rad:5.0,rings:[{rx:26,op:.038,c:'rgba(255,240,88,1)'},{rx:17,op:.09,c:'rgba(255,244,110,1)'},{rx:11,op:.20,c:'rgba(255,248,148,1)'},{rx:6.5,op:.385,c:'rgba(255,252,195,1)'}]};
  return {col:'rgba(255,254,225,1)',rad:5.8,rings:[{rx:30,op:.04,c:'rgba(255,250,168,1)'},{rx:20,op:.092,c:'rgba(255,252,185,1)'},{rx:13,op:.20,c:'rgba(255,253,205,1)'},{rx:8,op:.395,c:'rgba(255,255,228,1)'}]};
}

// ─── THEME ───────────────────────────────────────────────────────────────────

const TH = {
  night:   {acc:'#38486E',tc:'#8898BE',gr:'38,52,110'},
  astR:    {acc:'#4858A0',tc:'#B0BAE0',gr:'58,68,162'},
  astS:    {acc:'#404898',tc:'#A8B0D8',gr:'50,55,152'},
  navR:    {acc:'#4078C8',tc:'#BCCEF5',gr:'55,105,202'},
  navS:    {acc:'#9055C0',tc:'#D0C0F5',gr:'140,78,195'},
  civR:    {acc:'#AA52F8',tc:'#E8D2FF',gr:'170,78,248'},
  civS:    {acc:'#FF4C4C',tc:'#FFCECE',gr:'255,68,68'},
  sunrise: {acc:'#FF8038',tc:'#FFE0BE',gr:'255,118,44'},
  sunset:  {acc:'#FF4418',tc:'#FFCAA8',gr:'255,62,20'},
  goldenR: {acc:'#FFAA38',tc:'#FFE8BE',gr:'255,162,40'},
  goldenS: {acc:'#FF7E1E',tc:'#FFD4A0',gr:'255,112,26'},
  day:     {acc:'#52C4F8',tc:'#FFFFFF',gr:'82,196,250'},
  noon:    {acc:'#68D5FF',tc:'#FFFFFF',gr:'95,215,255'},
};

// ─── THE CARD ─────────────────────────────────────────────────────────────────

class SolarClockCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._tickInterval = null;
    this._launchInterval = null;
    this._launches = [];        // cached launch data from API
    this._tickerIndex = 0;      // current ticker item
    this._tickerTimer = null;
  }

  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._tickInterval) {
      this._render();
      this._tickInterval = setInterval(() => this._render(), 60000);
      this._fetchLaunches();
      this._launchInterval = setInterval(() => this._fetchLaunches(), 3600000);
    }
  }

  disconnectedCallback() {
    if (this._tickInterval) { clearInterval(this._tickInterval); this._tickInterval = null; }
    if (this._launchInterval) { clearInterval(this._launchInterval); this._launchInterval = null; }
    if (this._tickerTimer) { clearInterval(this._tickerTimer); this._tickerTimer = null; }
  }

  // ── fetch upcoming launches from Launch Library 2 (free, no key) ────────────
  async _fetchLaunches() {
    try {
      const url = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?format=json&limit=10&status=1,2,3&mode=list';
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      // Filter: only notable missions (SpaceX, NASA, ESA, Roscosmos, Blue Origin, Rocket Lab crewed/major)
      const NOTABLE_AGENCIES = ['spacex','nasa','esa','roscosmos','blue origin','rocket lab','jaxa','isro','cnsa','northrop'];
      const NOTABLE_KEYWORDS = ['crew','dragon','artemis','orion','starship','webb','hubble','iss','moon','mars','jupiter','saturn','europa','gateway','axiom','starliner'];
      this._launches = (data.results || [])
        .filter(l => {
          const agency = (l.launch_service_provider?.name || '').toLowerCase();
          const name   = (l.name || '').toLowerCase();
          const mission= (l.mission?.description || '').toLowerCase();
          const isNotableAgency   = NOTABLE_AGENCIES.some(a => agency.includes(a));
          const isNotableMission  = NOTABLE_KEYWORDS.some(k => name.includes(k) || mission.includes(k));
          return isNotableAgency || isNotableMission;
        })
        .slice(0, 8)
        .map(l => ({
          name: l.name,
          agency: l.launch_service_provider?.name || '',
          date: new Date(l.net),
          status: l.status?.abbrev || '',
          pad: l.pad?.location?.country_code || '',
          url: l.url,
        }));
      this._render();
    } catch(e) {
      // silently fail - no internet or API down
    }
  }

  // ── compute all values ──────────────────────────────────────────────────────
  _compute() {
    const hass = this._hass;
    const now  = new Date();
    const nowH = now.getHours() + now.getMinutes()/60 + now.getSeconds()/3600;
    const elev = solarElev(now, LAT, LON, nowH);
    const isR  = elev >= solarElev(now, LAT, LON, nowH - 0.25);

    let noonH=12, noonE=-90;
    for (let h=9; h<=15; h+=1/60) { const e=solarElev(now,LAT,LON,h); if(e>noonE){noonE=e;noonH=h;} }
    const atNoon = elev>=noonE-1.5 && elev>0;

    const riseH = findCross(now, LAT, LON, true);
    const setH  = findCross(now, LAT, LON, false);

    const states = hass?.states || {};
    const rRaw = states['sun.sun']?.attributes?.next_rising || states['sun.sun']?.attributes?.next_dawn;
    const sRaw = states['sun.sun']?.attributes?.next_setting || states['sun.sun']?.attributes?.next_dusk;
    let riseStr, setStr;
    if (rRaw) { const r=new Date(rRaw); riseStr=r.getDate()!==now.getDate()?fmtH(riseH):pad(r.getHours())+':'+pad(r.getMinutes()); }
    else riseStr = fmtH(riseH);
    if (sRaw) { const s=new Date(sRaw); setStr=s.getDate()!==now.getDate()?fmtH(setH):pad(s.getHours())+':'+pad(s.getMinutes()); }
    else setStr = fmtH(setH);

    let phaseKey, phaseName;
    if      (atNoon)       { phaseKey='noon';   phaseName='Południe solarne'; }
    else if (elev>=0) {
      if      (elev<4)     { phaseKey=isR?'sunrise':'sunset';  phaseName=isR?'Wschód słońca':'Zachód słońca'; }
      else if (elev<13)    { phaseKey=isR?'goldenR':'goldenS'; phaseName=isR?'Złota godzina ↑':'Złota godzina ↓'; }
      else                 { phaseKey='day';    phaseName='Dzień'; }
    }
    else if (elev>=-6)     { phaseKey=isR?'civR':'civS';  phaseName=isR?'Świt cywilny':'Zmierzch cywilny'; }
    else if (elev>=-12)    { phaseKey=isR?'navR':'navS';  phaseName=isR?'Świt żeglarski':'Zmierzch żeglarski'; }
    else if (elev>=-18)    { phaseKey=isR?'astR':'astS';  phaseName=isR?'Świt astronomiczny':'Zmierzch astronomiczny'; }
    else                   { phaseKey='night';  phaseName='Noc'; }

    const tempRaw = states['sensor.stacja_pogodowa_outdoor_temperature']?.state;
    const temp = tempRaw ? parseFloat(tempRaw) : null;
    const weatherState = states['weather.forecast_home']?.state || 'unknown';

    const isNight = elev < -6;
    const visiblePlanets = (SHOW_PLANETS && isNight)
      ? PLANET_NAMES
          .map(name => ({name, pos: planetPosition(name, now, LAT, LON)}))
          .filter(p => p.pos && p.pos.visible)
          .sort((a,b) => b.pos.alt - a.pos.alt)
      : [];

    const TM = TH[phaseKey] || TH.day;
    const dynamicBg = generateDynamicBg(elev, temp, weatherState, phaseKey);

    return { now, nowH, elev, isR, noonE, riseStr, setStr, phaseKey, phaseName,
             temp, weatherState, isNight, visiblePlanets, TM, dynamicBg };
  }

  // ── build SVG chart ─────────────────────────────────────────────────────────
  _buildChart(now, nowH, elev, isR, TM) {
    const W=280, H=108, EMIN=-30, EMAX=65, ERANGE=EMAX-EMIN;
    const eToY = e => H-8-((e-EMIN)/ERANGE)*(H-16);
    const hToX = h => (h/24)*W;
    const horizY=eToY(0), y6=eToY(-6), y12=eToY(-12), y18=eToY(-18);

    const pts=[];
    for (let i=0; i<=96; i++) { const h=i/4; pts.push({x:hToX(h).toFixed(2),y:eToY(solarElev(now,LAT,LON,h)).toFixed(2)}); }
    const pathD = pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(' ');
    const fillD = `M${hToX(0).toFixed(2)},${horizY.toFixed(2)} `
                + pts.map(p=>`L${p.x},${Math.min(parseFloat(p.y),horizY).toFixed(2)}`).join(' ')
                + ` L${hToX(24).toFixed(2)},${horizY.toFixed(2)} Z`;

    const dotX=hToX(nowH).toFixed(2), dotY=eToY(elev).toFixed(2);
    const ss=sunStyle(elev,isR);

    const ringsEl=ss.rings.map((g,i)=>`
      <ellipse cx="${dotX}" cy="${dotY}" rx="${g.rx}" ry="${g.rx}" fill="${g.c}" opacity="${g.op}">
        <animate attributeName="rx" values="${g.rx};${(g.rx*1.08).toFixed(1)};${g.rx}" dur="${3+i*.5}s" repeatCount="indefinite"/>
        <animate attributeName="ry" values="${g.rx};${(g.rx*1.08).toFixed(1)};${g.rx}" dur="${3+i*.5}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="${g.op};${(g.op*1.3).toFixed(2)};${g.op}" dur="${3+i*.5}s" repeatCount="indefinite"/>
      </ellipse>`).join('');

    const sunEl=`<circle cx="${dotX}" cy="${dotY}" r="${ss.rad}" fill="${ss.col}">
      <animate attributeName="r" values="${ss.rad};${(ss.rad*1.04).toFixed(1)};${ss.rad}" dur="3.5s" repeatCount="indefinite"/>
    </circle>`;

    const vLine=`<line x1="${dotX}" y1="${(parseFloat(dotY)+ss.rad+1).toFixed(2)}" x2="${dotX}" y2="${horizY.toFixed(2)}"
      stroke="${elev>=0?'rgba(255,245,178,.13)':'rgba(130,130,255,.08)'}"
      stroke-width=".7" stroke-dasharray="2 3.5"/>`;

    const hGlow=(elev>-4&&elev<6)?`<ellipse cx="${dotX}" cy="${horizY.toFixed(2)}" rx="100" ry="14"
      fill="${isR?'rgba(255,165,42,.18)':'rgba(255,68,18,.18)'}">
      <animate attributeName="opacity" values=".6;1;.6" dur="3.5s" repeatCount="indefinite"/></ellipse>`:'';

    const xLbls=[0,6,12,18,24].map(h=>{
      const x=hToX(h).toFixed(1),l=h===24?'24':pad(h);
      return `<text x="${x}" y="${H}" text-anchor="middle" font-size="7" fill="rgba(255,255,255,.18)" font-family="-apple-system,sans-serif">${l}</text>`;
    }).join('');

    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <defs>
        <linearGradient id="sf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="rgba(82,198,250,.20)"/>
          <stop offset="100%" stop-color="rgba(82,198,250,0)"/>
        </linearGradient>
        <clipPath id="abz"><rect x="0" y="0" width="${W}" height="${horizY.toFixed(2)}"/></clipPath>
      </defs>
      <rect x="0" y="${horizY.toFixed(2)}" width="${W}" height="${(y6-horizY).toFixed(2)}"   fill="rgba(100,30,165,.08)"/>
      <rect x="0" y="${y6.toFixed(2)}"     width="${W}" height="${(y12-y6).toFixed(2)}"      fill="rgba(30,50,165,.10)"/>
      <rect x="0" y="${y12.toFixed(2)}"    width="${W}" height="${(y18-y12).toFixed(2)}"     fill="rgba(10,14,58,.14)"/>
      <rect x="0" y="${y18.toFixed(2)}"    width="${W}" height="${(H-y18+4).toFixed(2)}"     fill="rgba(2,3,10,.20)"/>
      <path d="${fillD}" fill="url(#sf)"/>
      <path d="${pathD}" fill="none" stroke="rgba(82,198,250,.16)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="${pathD}" fill="none" stroke="rgba(82,198,250,.88)" stroke-width="1.75" stroke-linejoin="round" clip-path="url(#abz)"/>
      <line x1="0" y1="${horizY.toFixed(2)}" x2="${W}" y2="${horizY.toFixed(2)}" stroke="rgba(255,255,255,.20)" stroke-width=".85" stroke-dasharray="4 6"/>
      <text x="${W-2}" y="${(horizY-2.5).toFixed(2)}" text-anchor="end" font-size="7" fill="rgba(255,255,255,.25)" font-family="-apple-system,sans-serif">0°</text>
      ${xLbls}${hGlow}${vLine}${ringsEl}${sunEl}
    </svg>`;
  }

  // ── build event banners ─────────────────────────────────────────────────────
  _buildBanners() {
    return EVENTS
      .map(ev => ({ev, days: daysUntil(ev.date)}))
      .filter(({days}) => days >= 0 && days <= 30)
      .sort((a,b) => a.days - b.days)
      .slice(0, 1)
      .map(({ev, days}) => this._renderBanner(ev, days))
      .join('');
  }

  _renderBanner(ev, days) {
    const isToday=days===0, isTomorrow=days===1, isUrgent=days<=7;
    let acR, acG, acB;
    if      (isToday)    { acR=255; acG=70;  acB=0; }
    else if (isTomorrow) { acR=255; acG=130; acB=0; }
    else if (isUrgent)   { acR=255; acG=180; acB=30; }
    else { const t=typeTheme(ev.type); acR=t.r; acG=t.g; acB=t.b; }

    const ac  = `rgba(${acR},${acG},${acB},1)`;
    const acM = `rgba(${acR},${acG},${acB},.85)`;
    const acL = `rgba(${acR},${acG},${acB},.18)`;
    const acB2= `rgba(${acR},${acG},${acB},.35)`;
    const pillText = isToday?'dziś!':isTomorrow?'jutro':`${days} dni`;
    const sublabel = isToday?ev.sublabelToday:isTomorrow?ev.sublabelTomorrow:ev.sublabel;

    if (isToday) {
      const meteorExtra = ev.hasMeteors
        ? `<div style="margin-top:5px;display:flex;align-items:center;gap:6px;">
            <div style="font-size:10px;font-weight:600;color:rgba(180,130,255,.92);background:rgba(150,90,255,.15);border:1px solid rgba(150,90,255,.35);padding:2px 8px;border-radius:8px;">+ Perseidy tej nocy</div>
            <div style="font-size:10px;color:rgba(255,255,255,.35);">2 zjawiska jednocześnie</div>
           </div>` : '';
      return `<div class="banner today" style="border-top:2px solid ${acB2};">
        <div class="banner-bg" style="background:${acL};"></div>
        <div class="banner-inner">
          <div class="banner-icon pulse" style="background:rgba(${acR},${acG},${acB},.20);border:2px solid ${acB2};">
            ${eventIcon(ev.type,20,ac)}
            <div class="icon-ring" style="border-color:rgba(${acR},${acG},${acB},.40);"></div>
          </div>
          <div class="banner-text">
            <div style="font-size:12px;font-weight:600;color:${ac};text-transform:uppercase;letter-spacing:.05em;">${ev.label} — dziś!</div>
            <div style="font-size:10px;color:rgba(255,220,150,.75);margin-top:2px;">${sublabel}</div>
            ${meteorExtra}
          </div>
          <div class="banner-pill pulse" style="color:${ac};background:rgba(${acR},${acG},${acB},.18);border:1.5px solid ${acB2};">${pillText}</div>
        </div>
      </div>`;
    }
    if (isTomorrow) {
      return `<div class="banner tomorrow" style="border-top:2px solid ${acB2};background:rgba(${acR},${acG},${acB},.08);">
        <div class="banner-inner">
          <div class="banner-icon" style="background:rgba(${acR},${acG},${acB},.15);border:1.5px solid ${acB2};">
            ${eventIcon(ev.type,18,ac)}
          </div>
          <div class="banner-text">
            <div style="font-size:11px;font-weight:600;color:${ac};text-transform:uppercase;letter-spacing:.05em;">Jutro: ${ev.label}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.40);margin-top:1px;">${sublabel}</div>
          </div>
          <div class="banner-pill pulse-slow" style="color:${ac};background:rgba(${acR},${acG},${acB},.18);border:1.5px solid ${acB2};">${pillText}</div>
        </div>
      </div>`;
    }
    if (isUrgent) {
      return `<div class="banner urgent" style="border-top:1px solid rgba(${acR},${acG},${acB},.30);background:rgba(${acR},${acG},${acB},.06);">
        <div class="banner-inner">
          <div class="banner-icon sm" style="background:rgba(${acR},${acG},${acB},.12);border:1px solid rgba(${acR},${acG},${acB},.35);">
            ${eventIcon(ev.type,14,ac)}
          </div>
          <div class="banner-text">
            <div style="font-size:10px;font-weight:600;color:${acM};text-transform:uppercase;letter-spacing:.06em;">${ev.label} za ${days} dni</div>
            <div style="font-size:10px;color:rgba(255,255,255,.38);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${sublabel}</div>
          </div>
          <div class="banner-pill pulse-slow" style="font-size:11px;color:${acM};background:rgba(${acR},${acG},${acB},.14);border:1px solid rgba(${acR},${acG},${acB},.35);">${pillText}</div>
        </div>
      </div>`;
    }
    return `<div class="banner normal">
      <div class="banner-inner">
        <div class="banner-icon sm" style="background:rgba(${acR},${acG},${acB},.10);border:1px solid rgba(${acR},${acG},${acB},.25);">
          ${eventIcon(ev.type,14,ac)}
        </div>
        <div class="banner-text">
          <div style="font-size:10px;font-weight:600;color:rgba(${acR},${acG},${acB},.85);text-transform:uppercase;letter-spacing:.06em;">${ev.label}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${sublabel}</div>
        </div>
        <div class="banner-pill" style="font-size:11px;color:rgba(${acR},${acG},${acB},.85);background:rgba(${acR},${acG},${acB},.12);border:1px solid rgba(${acR},${acG},${acB},.25);">${pillText}</div>
      </div>
    </div>`;
  }

  // ── main render ─────────────────────────────────────────────────────────────
  _render() {
    if (!this._hass) return;
    const { now, nowH, elev, isR, TM, dynamicBg, phaseName, phaseKey,
            riseStr, setStr, temp, weatherState, isNight, visiblePlanets } = this._compute();

    const elevStr = (elev>=0?'+':'')+elev.toFixed(1)+'°';
    const hasToday = EVENTS.some(ev => daysUntil(ev.date)===0);

    const chartSVG = this._buildChart(now, nowH, elev, isR, TM);
    const banners  = this._buildBanners();

    // random particle seeds (stable per render)
    const rainDrops = ['rainy','pouring','lightning','lightning-rainy'].includes(weatherState)
      ? [...Array(12)].map((_,i)=>`<div class="raindrop" style="left:${((i*137+13)%100)}%;animation-delay:${((i*.17)%2).toFixed(2)}s;animation-duration:${(.8+((i*.23)%0.6)).toFixed(2)}s;"></div>`).join('') : '';
    const snowFlakes = ['snowy','snowy-rainy'].includes(weatherState)||(temp!==null&&temp<0)
      ? [...Array(10)].map((_,i)=>`<div class="snowflake" style="left:${((i*97+7)%100)}%;width:${(2+(i*.3)%2).toFixed(1)}px;height:${(2+(i*.3)%2).toFixed(1)}px;animation-delay:${((i*.31)%3).toFixed(2)}s;animation-duration:${(2+(i*.4)%2).toFixed(2)}s;--drift:${(((i*11)%20)-10)}px;"></div>`).join('') : '';

    const css = `
      :host { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }

      @keyframes glow-pulse  { 0%,100%{opacity:.28;transform:scale(1)} 50%{opacity:.48;transform:scale(1.12)} }
      @keyframes breathe     { 0%,100%{opacity:1} 50%{opacity:.75} }
      @keyframes breathe-slow{ 0%,100%{opacity:1} 50%{opacity:.80} }
      @keyframes shimmer     { 0%,100%{opacity:.65} 50%{opacity:.90} }
      @keyframes bg-shift    { 0%,100%{filter:hue-rotate(0deg) brightness(1)} 50%{filter:hue-rotate(5deg) brightness(1.05)} }
      @keyframes cloud-drift { from{transform:translateX(-50px)} to{transform:translateX(50px)} }
      @keyframes rain-fall   { 0%{transform:translateY(-10px);opacity:0} 10%{opacity:.5} 90%{opacity:.3} 100%{transform:translateY(240px);opacity:0} }
      @keyframes snow-fall   { 0%{transform:translateY(-10px) translateX(0);opacity:0} 10%{opacity:.7} 90%{opacity:.5} 100%{transform:translateY(240px) translateX(var(--drift,10px));opacity:0} }
      @keyframes ring-pulse  { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.3);opacity:0} }
      @keyframes tooltip-in  { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }

      .card {
        background: ${dynamicBg};
        border-radius: 24px;
        padding: 20px 20px 16px;
        position: relative;
        overflow: hidden;
        min-height: 228px;
        animation: bg-shift 30s ease-in-out infinite;
        ${hasToday ? 'border:2px solid rgba(255,70,0,.55);' : ''}
      }
      .card::before {
        content:''; position:absolute; top:-55px; left:50%; transform:translateX(-50%);
        width:270px; height:210px;
        background:radial-gradient(ellipse,rgba(${TM.gr},.18) 0%,transparent 72%);
        pointer-events:none;
        animation: glow-pulse ${elev>=0?'3.5s':'5s'} cubic-bezier(.4,0,.2,1) infinite;
      }
      .card::after {
        content:''; position:absolute; inset:0;
        background:radial-gradient(ellipse at ${(nowH/24*100).toFixed(0)}% 35%,rgba(${TM.gr},.12) 0%,transparent 65%);
        pointer-events:none;
        animation: shimmer 4s cubic-bezier(.4,0,.2,1) infinite;
      }

      /* atmospheric layers */
      .atm { position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:0; opacity:${elev>=0?.15:.08}; }
      .cloud { position:absolute; border-radius:50%; filter:blur(25px); }
      .c1 { top:15%; left:-10%; width:180px; height:60px; background:radial-gradient(ellipse,rgba(255,255,255,.08) 0%,transparent 70%); animation:cloud-drift 45s linear infinite; }
      .c2 { top:40%; left:20%; width:220px; height:70px; background:radial-gradient(ellipse,rgba(255,255,255,.06) 0%,transparent 70%); animation:cloud-drift 60s -10s linear infinite; }
      .c3 { top:65%; left:-5%; width:160px; height:55px; background:radial-gradient(ellipse,rgba(255,255,255,.07) 0%,transparent 70%); animation:cloud-drift 52s -25s linear infinite; }

      .raindrop { position:absolute; top:-10px; width:1.5px; height:14px;
        background:linear-gradient(to bottom,rgba(120,180,255,.4),rgba(120,180,255,0));
        animation:rain-fall linear infinite; }
      .snowflake { position:absolute; top:-10px; border-radius:50%; background:rgba(220,235,255,.6);
        animation:snow-fall ease-in-out infinite; }

      /* content */
      .content { position:relative; z-index:1; }
      .top { display:flex; justify-content:space-between; align-items:flex-start; }
      .day-label { font-size:11px; font-weight:600; color:${TM.acc}; text-transform:uppercase; letter-spacing:.12em; }
      .date-label { font-size:11px; color:${TM.acc}88; letter-spacing:.03em; }
      .phase-badge {
        font-size:9px; font-weight:600; letter-spacing:.08em; text-transform:uppercase;
        white-space:nowrap; color:${TM.acc};
        border:1px solid ${TM.acc}44; padding:2px 8px; border-radius:12px; background:${TM.acc}14;
        animation:breathe 3s ease-in-out infinite;
      }

      /* planets */
      .planets { display:flex; gap:5px; flex-wrap:wrap; justify-content:flex-end; margin-top:5px; position:relative; }
      .planet-pill {
        display:flex; flex-direction:column; align-items:center; gap:1px;
        border-radius:10px; padding:3px 7px; cursor:pointer;
        -webkit-tap-highlight-color: transparent;
        user-select:none; position:relative;
        transition: background .15s, border-color .15s;
      }
      .planet-pill:active { filter:brightness(1.3); }
      .planet-sym  { font-size:13px; line-height:1; }
      .planet-name { font-size:7px; font-weight:600; text-transform:uppercase; letter-spacing:.04em; line-height:1.2; }

      /* planet tooltip */
      .planet-tooltip {
        display:none; position:absolute; bottom:calc(100% + 6px); right:0;
        background:rgba(8,12,30,.97); border-radius:10px;
        padding:8px 12px; white-space:nowrap; z-index:999;
        box-shadow:0 4px 20px rgba(0,0,0,.7);
        animation:tooltip-in .15s ease;
        min-width:140px;
      }
      .planet-tooltip.visible { display:block; }
      .planet-tooltip .tip-title { font-size:11px; font-weight:700; margin-bottom:4px; }
      .planet-tooltip .tip-row   { font-size:10px; color:rgba(255,255,255,.50); line-height:1.8; }
      .planet-tooltip .tip-val   { color:rgba(255,255,255,.88); }

      .time {
        font-size:65px; font-weight:200; letter-spacing:-3px; line-height:1;
        color:${TM.tc}; margin:3px 0 0; font-variant-numeric:tabular-nums;
        text-align:center; width:100%; display:block;
      }

      .chart { margin:10px 0 4px; }
      .stats { display:flex; justify-content:space-between; align-items:flex-start; margin-top:7px; }
      .stat { display:flex; flex-direction:column; }
      .stat-val   { font-size:14px; font-weight:600; color:rgba(255,255,255,.82); letter-spacing:-.2px; }
      .stat-label { font-size:9px; font-weight:500; color:rgba(255,255,255,.28); text-transform:uppercase; letter-spacing:.07em; margin-top:1px; }


      /* ── ticker ─────────────────────────────────────────────────── */
      .ticker {
        margin: 10px -20px -16px;
        border-top: 1px solid rgba(255,255,255,.07);
        border-radius: 0 0 24px 24px;
        overflow: hidden;
        position: relative;
      }
      .ticker-inner {
        display: flex;
        align-items: stretch;
        min-height: 38px;
      }
      .ticker-type-bar {
        width: 3px;
        flex-shrink: 0;
        border-radius: 0;
      }
      .ticker-body {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 14px 7px 10px;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: background .15s;
        position: relative;
        overflow: hidden;
      }
      .ticker-body:active { background: rgba(255,255,255,.04); }
      .ticker-icon {
        font-size: 13px;
        flex-shrink: 0;
        line-height: 1;
      }
      .ticker-text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
      }
      .ticker-label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .07em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ticker-sub {
        font-size: 9.5px;
        color: rgba(255,255,255,.35);
        margin-top: 1px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ticker-pill {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 8px;
        white-space: nowrap;
        flex-shrink: 0;
        letter-spacing: -.2px;
      }
      .ticker-nav {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 2px;
        padding: 0 10px 0 0;
        flex-shrink: 0;
      }
      .ticker-dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: rgba(255,255,255,.18);
        transition: background .2s, transform .2s;
      }
      .ticker-dot.active {
        background: rgba(255,255,255,.55);
        transform: scale(1.3);
      }
      @keyframes ticker-slide-in {
        from { opacity:0; transform:translateY(6px); }
        to   { opacity:1; transform:translateY(0); }
      }
      .ticker-body { animation: ticker-slide-in .25s ease; }

      /* banners */
      .banner { margin-left:-20px; margin-right:-20px; margin-bottom:-16px;
                border-radius:0 0 24px 24px; position:relative; overflow:hidden; }
      .banner.today    { padding:12px 20px 16px; margin-top:10px; }
      .banner.tomorrow { padding:11px 20px 14px; margin-top:10px; }
      .banner.urgent   { padding:10px 20px 13px; margin-top:10px; }
      .banner.normal   { padding:10px 20px 12px; margin-top:11px; border-top:1px solid rgba(255,255,255,.07); }
      .banner-bg { position:absolute; inset:0; animation:breathe 1.2s ease-in-out infinite; }
      .banner-inner { position:relative; z-index:1; display:flex; align-items:center; gap:10px; }
      .banner-text  { flex:1; min-width:0; }
      .banner-icon  {
        width:34px; height:34px; border-radius:50%; flex-shrink:0;
        display:flex; align-items:center; justify-content:center; position:relative;
      }
      .banner-icon.sm { width:28px; height:28px; }
      .banner-pill {
        font-size:12px; font-weight:600; padding:4px 10px;
        border-radius:10px; white-space:nowrap; flex-shrink:0;
      }
      .icon-ring {
        position:absolute; inset:-4px; border-radius:50%; border:2px solid;
        animation:ring-pulse 1.2s ease-in-out infinite;
      }
      .pulse      { animation:breathe 1.2s ease-in-out infinite; }
      .pulse-slow { animation:breathe-slow 1.8s ease-in-out infinite; }
    `;

    const planetsHtml = visiblePlanets.length > 0
      ? `<div class="planets">${visiblePlanets.map(({name,pos}) => {
          const col = PLANET_COLORS[name];
          const sym = PLANET_SYMBOLS[name];
          return `<div class="planet-pill" data-planet="${name}"
            style="background:rgba(${col},.12);border:1px solid rgba(${col},.30);">
            <span class="planet-sym" style="color:rgba(${col},1);">${sym}</span>
            <span class="planet-name" style="color:rgba(${col},.80);">${name.slice(0,3)}</span>
            <div class="planet-tooltip" data-tip="${name}">
              <div class="tip-title" style="color:rgba(${col},1);">${sym} ${name}</div>
              <div class="tip-row">Wysokość:&nbsp;<span class="tip-val">${pos.alt>0?'+':''}${pos.alt}°</span></div>
              <div class="tip-row">Kierunek:&nbsp;<span class="tip-val">${pos.dir}&nbsp;(${pos.az}°)</span></div>
              <div class="tip-row">Jasność:&nbsp;<span class="tip-val">${pos.mag>0?'+':''}${pos.mag}&nbsp;mag</span></div>
            </div>
          </div>`;
        }).join('')}</div>` : '';

    const html = `
      <style>${css}</style>
      <div class="card">
        <div class="atm">
          <div class="cloud c1"></div>
          <div class="cloud c2"></div>
          <div class="cloud c3"></div>
          ${rainDrops}${snowFlakes}
        </div>
        <div class="content">
          <div class="top">
            <div>
              <div class="day-label">${DAYS[now.getDay()]}</div>
              <div class="date-label">${now.getDate()} ${window.AHA.MONTHS[now.getMonth()]} ${now.getFullYear()}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;">
              <span class="phase-badge">${phaseName}</span>
              ${planetsHtml}
            </div>
          </div>
          <div class="time">${pad(now.getHours())}:${pad(now.getMinutes())}</div>
          <div class="chart">${chartSVG}</div>
          <div class="stats">
            <div class="stat">
              <span class="stat-val">${riseStr}</span>
              <span class="stat-label">Wschód ☀︎</span>
            </div>
            <div class="stat" style="text-align:center">
              <span class="stat-val" style="color:${TM.acc}">${elevStr}</span>
              <span class="stat-label">Wysokość</span>
            </div>
            <div class="stat" style="text-align:right">
              <span class="stat-val">${setStr}</span>
              <span class="stat-label">Zachód ☀︎</span>
            </div>
          </div>
          ${banners}
        </div>
      </div>`;

    this.shadowRoot.innerHTML = html;
    this._bindEvents();
  }

  _bindEvents() {
    // Planet tooltips — toggle on tap/click, close on outside click
    const pills = this.shadowRoot.querySelectorAll('.planet-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const tip = pill.querySelector('.planet-tooltip');
        const isOpen = tip.classList.contains('visible');
        this.shadowRoot.querySelectorAll('.planet-tooltip.visible').forEach(t => t.classList.remove('visible'));
        if (!isOpen) tip.classList.add('visible');
      });
    });

    // Close tooltips on click outside
    this.shadowRoot.querySelector('.card').addEventListener('click', () => {
      this.shadowRoot.querySelectorAll('.planet-tooltip.visible').forEach(t => t.classList.remove('visible'));
    });

    // Ticker — tap to advance manually
    const tickerBody = this.shadowRoot.querySelector('[data-ticker-click]');
    if (tickerBody) {
      tickerBody.addEventListener('click', (e) => {
        e.stopPropagation();
        const items = this._buildTickerItems();
        if (!items.length) return;
        this._tickerIndex = (this._tickerIndex + 1) % items.length;
        // re-render just the ticker area without full card redraw
        const ticker = this.shadowRoot.querySelector('.ticker');
        if (ticker) ticker.outerHTML; // force, but easier to just partial-render:
        this._renderTickerOnly();
      });
    }
  }

  _renderTickerOnly() {
    const items = this._buildTickerItems();
    const ticker = this.shadowRoot.querySelector('.ticker');
    if (!ticker || !items.length) return;
    const html = this._renderTicker(items);
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const newTicker = tmp.firstElementChild;
    if (newTicker) {
      ticker.replaceWith(newTicker);
      // re-bind click on new element
      const tb = this.shadowRoot.querySelector('[data-ticker-click]');
      if (tb) tb.addEventListener('click', (e) => {
        e.stopPropagation();
        const items2 = this._buildTickerItems();
        if (!items2.length) return;
        this._tickerIndex = (this._tickerIndex + 1) % items2.length;
        this._renderTickerOnly();
      });
    }
  }

  _startTickerAuto() {
    if (this._tickerTimer) { clearInterval(this._tickerTimer); this._tickerTimer = null; }
    const items = this._buildTickerItems();
    if (items.length <= 1) return;
    this._tickerTimer = setInterval(() => {
      this._tickerIndex = (this._tickerIndex + 1) % items.length;
      this._renderTickerOnly();
    }, 5000);
  }


  // ── build ticker items (astro events + launches) ───────────────────────────
  _buildTickerItems() {
    const items = [];
    const now = new Date(); now.setHours(0,0,0,0);

    // Astronomical events — next 365 days
    EVENTS.forEach(ev => {
      const days = daysUntil(ev.date);
      if (days < 0 || days > 365) return;
      const t = typeTheme(ev.type);
      let countdown, urgency;
      if      (days === 0) { countdown = 'dziś!';   urgency = 'high'; }
      else if (days === 1) { countdown = 'jutro';   urgency = 'mid'; }
      else if (days <= 7)  { countdown = days+'d';  urgency = 'mid'; }
      else                 { countdown = days+'d';  urgency = 'low'; }
      const EMOJI = { eclipse:'🌒', lunar_eclipse:'🌕', meteors:'🌠', conjunction:'🔭', planet:'🪐', moon:'🌙' };
      items.push({ kind:'astro', label:ev.label, sub:ev.sublabel, countdown, urgency,
                   r:t.r, g:t.g, b:t.b, emoji:EMOJI[ev.type]||'✨', days });
    });

    // Rocket launches
    this._launches.forEach(l => {
      const diff = l.date - new Date();
      if (diff < -3600000) return; // skip if more than 1h past
      const AGENCY_COLOR = {
        'spacex':    {r:200,g:200,b:200},
        'nasa':      {r:11, g:103,b:184},
        'esa':       {r:0,  g:125,b:195},
        'roscosmos': {r:180,g:40, b:40},
        'blue origin':{r:0, g:140,b:255},
        'rocket lab':{r:200,g:50, b:50},
      };
      const agencyKey = Object.keys(AGENCY_COLOR).find(k => l.agency.toLowerCase().includes(k));
      const col = AGENCY_COLOR[agencyKey] || {r:160,g:160,b:160};
      let countdown, urgency;
      if (diff < 0)                      { countdown = 'LIVE!'; urgency = 'high'; }
      else if (diff < 3600000)           { countdown = Math.ceil(diff/60000)+'m'; urgency = 'high'; }
      else if (diff < 86400000)          { countdown = Math.ceil(diff/3600000)+'h'; urgency = 'mid'; }
      else {
        const days = Math.ceil(diff/86400000);
        countdown = days+'d';
        urgency = days <= 7 ? 'mid' : 'low';
      }
      const agencyShort = l.agency.replace('National Aeronautics and Space Administration','NASA')
                                  .replace('Space Exploration Technologies Corp.','SpaceX')
                                  .replace('European Space Agency','ESA');
      items.push({ kind:'launch', label:l.name, sub:agencyShort + (l.pad ? ' · '+l.pad : ''),
                   countdown, urgency, r:col.r, g:col.g, b:col.b, emoji:'🚀', days: Math.ceil(diff/86400000) });
    });

    // Sort: today/live first, then by days
    items.sort((a,b) => {
      const uo = {high:0,mid:1,low:2};
      if (uo[a.urgency] !== uo[b.urgency]) return uo[a.urgency] - uo[b.urgency];
      return (a.days||0) - (b.days||0);
    });

    return items;
  }

  _renderTicker(items) {
    if (!items.length) return '';
    const idx = this._tickerIndex % items.length;
    const item = items[idx];
    const { r, g, b, urgency, emoji, label, sub, countdown } = item;

    const barBg = urgency === 'high'
      ? 'linear-gradient(to bottom,rgba(255,70,0,1),rgba(255,140,0,1))'
      : urgency === 'mid'
        ? `linear-gradient(to bottom,rgba(${r},${g},${b},.9),rgba(${r},${g},${b},.4))`
        : `rgba(${r},${g},${b},.35)`;

    const pillBg    = `rgba(${r},${g},${b},.18)`;
    const pillBord  = `rgba(${r},${g},${b},.40)`;
    const pillColor = urgency === 'high' ? 'rgba(255,130,60,1)' : `rgba(${r},${g},${b},1)`;
    const labelColor= `rgba(${r},${g},${b},.92)`;

    const dots = items.slice(0,Math.min(items.length,8)).map((_, i) =>
      `<div class="ticker-dot${i===idx?' active':''}"></div>`).join('');

    return `<div class="ticker">
      <div class="ticker-inner">
        <div class="ticker-type-bar" style="background:${barBg};"></div>
        <div class="ticker-body" data-ticker-click>
          <span class="ticker-icon">${emoji}</span>
          <div class="ticker-text">
            <div class="ticker-label" style="color:${labelColor};">${label}</div>
            <div class="ticker-sub">${sub}</div>
          </div>
          <div class="ticker-pill" style="background:${pillBg};border:1px solid ${pillBord};color:${pillColor};">${countdown}</div>
        </div>
        <div class="ticker-nav">${dots}</div>
      </div>
    </div>`;
  }

  getCardSize() { return 5; }
}

customElements.define('aha-solar-clock-card', SolarClockCard);class TelecoCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._curDeg = 0;
    this._raf    = null;
    this._rendered = false;
  }

  setConfig(config) {
    this._config = config;
    this._entity = config.entity || 'cover.teleco_leds2';
    this._name   = config.name   || 'Żaluzje';
    this._room   = config.room   || '';
  }

  set hass(hass) {
    this._hass = hass;
    const state = hass.states[this._entity];
    if (!state) return;
    const tilt = state.attributes.current_tilt_position ?? 0;
    const pos  = state.attributes.current_position     ?? 0;
    const st   = state.state;
    if (!this._rendered) { this._render(); this._rendered = true; }
    this._update(tilt, pos, st);
  }

  _svc(service, data = {}) {
    this._hass.callService('cover', service, { entity_id: this._entity, ...data });
  }

  _deg(tilt) {
    const kf = [[0,0],[33,52],[66,85],[100,135]];
    for (let i = 0; i < kf.length - 1; i++) {
      const [p0,d0] = kf[i], [p1,d1] = kf[i+1];
      if (tilt >= p0 && tilt <= p1) return d0 + (tilt-p0)/(p1-p0)*(d1-d0);
    }
    return 135;
  }

  _drawSlat(deg, color) {
    const W = 32, H = 32;
    const cx = W/2, cy = H/2, HL = W/2 - 4, TH = Math.max(2, HL * 0.16);
    const r  = deg * Math.PI / 180;
    const ca = Math.cos(r), sa = Math.sin(r);
    const px = -sa * TH, py = ca * TH;
    const x1 = cx - HL*ca, y1 = cy - HL*sa;
    const x2 = cx + HL*ca, y2 = cy + HL*sa;
    const f  = ([x,y]) => `${x.toFixed(1)},${y.toFixed(1)}`;
    const body  = [[x1-px,y1-py],[x2-px,y2-py],[x2+px,y2+py],[x1+px,y1+py]].map(f).join(' ');
    const shine = [[x1-px*.3,y1-py*.3],[x2-px*.3,y2-py*.3],[x2+px*.12,y2+py*.12],[x1+px*.12,y1+py*.12]].map(f).join(' ');
    const c = color || 'rgba(255,159,10,.88)';
    return `<polygon points="${body}" fill="${c}"/>
      <polygon points="${shine}" fill="rgba(255,255,255,.22)"/>
      <circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="2.2" fill="rgba(0,0,0,.55)" stroke="${c}" stroke-width=".9"/>
      <circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="2.2" fill="rgba(0,0,0,.55)" stroke="${c}" stroke-width=".9"/>`;
  }

  _label(tilt, pos, st) {
    if (st === 'opening') return 'Otwieranie\u2026';
    if (st === 'closing') return 'Zamykanie\u2026';
    if (tilt === 0)  return 'Zamkni\u0119te';
    if (tilt < 30)   return 'Lekko uchylone';
    if (tilt < 70)   return 'Uchylone';
    if (tilt < 100)  return 'Prawie otwarte';
    return 'Otwarte';
  }

  // Attach press feedback: instant visual change on pointerdown, revert on pointerup/cancel
  _bindPress(el, pressedClass) {
    const on  = () => el.classList.add(pressedClass);
    const off = () => el.classList.remove(pressedClass);
    el.addEventListener('pointerdown',   on,  { passive: true });
    el.addEventListener('pointerup',     off, { passive: true });
    el.addEventListener('pointercancel', off, { passive: true });
    el.addEventListener('pointerleave',  off, { passive: true });
  }

  _render() {
    const PRESETS = [0, 33, 66, 100];
    const PRESET_LABELS = ['Zamknięte', 'Lekko', 'Uchylone', 'Otwarte'];

    this.shadowRoot.innerHTML = `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      :host{display:block;font-family:-apple-system,'SF Pro Text','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}

      /* ── glow wrapper ── */
      .glow{ border-radius:18px; transition:box-shadow .5s ease; }
      .glow.on{
        box-shadow:
          0 0 0 1px rgba(255,159,10,.22),
          0 0 18px 2px rgba(255,159,10,.14),
          0 0 40px 6px rgba(255,159,10,.07);
      }

      /* ── card ── */
      .card{
        background:linear-gradient(150deg,#0b1120 0%,#0d1828 100%);
        border-radius:18px;
        padding:14px 16px 16px;
        position:relative;
        overflow:hidden;
      }
      .card::before{
        content:'';position:absolute;top:0;left:0;right:0;height:1px;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);
        pointer-events:none;
      }

      /* ── main row ── */
      .main{display:flex;align-items:center;gap:12px;margin-bottom:10px}

      .iconbox{
        width:48px;height:48px;border-radius:13px;
        display:flex;align-items:center;justify-content:center;flex-shrink:0;
        background:rgba(142,142,147,.07);
        border:.5px solid rgba(142,142,147,.15);
        transition:background .35s,border-color .35s;
      }

      .mid{flex:1;min-width:0}
      .name{
        font-size:13px;font-weight:600;
        color:rgba(255,255,255,.90);
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
      }
      .room{font-size:11px;color:#636366;font-weight:400}
      .status{
        font-size:11px;color:#636366;
        margin-top:3px;min-height:14px;
        transition:color .3s;
      }

      .pct-wrap{flex-shrink:0;text-align:right}
      .pct{
        font-size:28px;font-weight:700;letter-spacing:-1px;
        line-height:1;font-variant-numeric:tabular-nums;
        transition:color .3s;
      }
      .pu{font-size:12px;font-weight:400;color:rgba(255,255,255,.28)}

      /* ── progress bar ── */
      .track{
        height:3px;background:rgba(255,255,255,.06);
        border-radius:2px;overflow:hidden;margin-bottom:12px;
      }
      .fill{
        height:100%;border-radius:2px;
        transition:width .45s cubic-bezier(.4,0,.2,1),background .35s;
      }

      /* ── preset pills ── */
      .pills{display:flex;gap:5px;margin-bottom:12px}
      .pill{
        flex:1;
        min-height:44px;
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
        border-radius:11px;
        font-size:10px;font-weight:600;
        color:rgba(255,255,255,.35);
        background:rgba(255,255,255,.04);
        cursor:pointer;
        border:.5px solid transparent;
        touch-action:manipulation;
        -webkit-tap-highlight-color:transparent;
        user-select:none;
        transition:background .15s,border-color .15s,color .15s;
        /* reset button styles */
        appearance:none;-webkit-appearance:none;
        font-family:inherit;
        padding:0;
      }
      .pill-pct{font-size:11px;font-weight:700;line-height:1}
      .pill-lbl{font-size:9px;font-weight:500;opacity:.7;line-height:1}
      .pill.on{
        background:rgba(255,159,10,.16);
        color:#ff9f0a;
        border-color:rgba(255,159,10,.32);
      }
      .pill.pressed{
        background:rgba(255,255,255,.12);
        color:rgba(255,255,255,.80);
        transform:scale(.94);
      }
      .pill.on.pressed{
        background:rgba(255,159,10,.28);
        color:#ff9f0a;
      }

      /* ── action buttons ── */
      .btns{
        display:flex;gap:6px;
        border-top:.5px solid rgba(255,255,255,.07);
        padding-top:10px;
      }
      .btn{
        flex:1;
        min-height:48px;
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;
        background:rgba(255,255,255,.055);
        border-radius:12px;
        font-size:10px;font-weight:600;
        color:rgba(255,255,255,.50);
        cursor:pointer;
        border:.5px solid rgba(255,255,255,.09);
        touch-action:manipulation;
        -webkit-tap-highlight-color:transparent;
        user-select:none;
        transition:background .12s,color .12s,border-color .12s;
        /* reset button styles */
        appearance:none;-webkit-appearance:none;
        font-family:inherit;
        padding:0;
      }
      .btn.pressed{
        background:rgba(255,255,255,.15);
        color:rgba(255,255,255,.95);
        border-color:rgba(255,255,255,.22);
        transform:scale(.96);
      }
      .btn.stop.pressed{
        background:rgba(255,69,58,.20);
        color:#ff453a;
        border-color:rgba(255,69,58,.32);
      }
      /* hover only on non-touch */
      @media(hover:hover){
        .btn:hover{color:rgba(255,255,255,.85);background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.14)}
        .btn.stop:hover{background:rgba(255,69,58,.12);color:#ff453a;border-color:rgba(255,69,58,.20)}
        .pill:hover:not(.on){background:rgba(255,255,255,.08);color:rgba(255,255,255,.70)}
      }
    </style>

    <div class="glow" id="glow">
      <div class="card">
        <div class="main">
          <div class="iconbox" id="iconbox">
            <svg id="icon" width="32" height="32" viewBox="0 0 32 32" overflow="visible"></svg>
          </div>
          <div class="mid">
            <div class="name">${this._name}${this._room ? `<span class="room"> \u00b7 ${this._room}</span>` : ''}</div>
            <div class="status" id="status">\u2014</div>
          </div>
          <div class="pct-wrap">
            <span class="pct" id="pct">\u2014</span><span class="pu">%</span>
          </div>
        </div>

        <div class="track">
          <div class="fill" id="fill"></div>
        </div>

        <div class="pills" id="pills">
          ${PRESETS.map((t, i) => `<button class="pill" type="button" data-tilt="${t}">
            <span class="pill-pct">${t}%</span>
            <span class="pill-lbl">${PRESET_LABELS[i]}</span>
          </button>`).join('')}
        </div>

        <div class="btns">
          <button class="btn" type="button" id="btn-close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 3v8M3.5 7.5L7 11l3.5-3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Zamknij
          </button>
          <button class="btn stop" type="button" id="btn-stop">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="currentColor"/></svg>
            Stop
          </button>
          <button class="btn" type="button" id="btn-open">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 11V3M3.5 6.5L7 3l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Otwórz
          </button>
        </div>
      </div>
    </div>`;

    // initial slat
    const iconEl = this.shadowRoot.getElementById('icon');
    if (iconEl) iconEl.innerHTML = this._drawSlat(0, 'rgba(142,142,147,.65)');

    // action buttons
    const btnOpen  = this.shadowRoot.getElementById('btn-open');
    const btnStop  = this.shadowRoot.getElementById('btn-stop');
    const btnClose = this.shadowRoot.getElementById('btn-close');

    this._bindPress(btnOpen,  'pressed');
    this._bindPress(btnStop,  'pressed');
    this._bindPress(btnClose, 'pressed');

    btnOpen.addEventListener('click',  () => this._svc('open_cover'));
    btnStop.addEventListener('click',  () => this._svc('stop_cover'));
    btnClose.addEventListener('click', () => this._svc('close_cover'));

    this.shadowRoot.querySelectorAll('.pill').forEach(btn => {
      this._bindPress(btn, 'pressed');
      btn.addEventListener('click', () => {
        this._svc('set_cover_tilt_position', { tilt_position: parseInt(btn.dataset.tilt) });
      });
    });
  }

  _animateTo(target) {
    if (this._raf) cancelAnimationFrame(this._raf);
    const start = this._curDeg, diff = target - start;
    const dur = 420, t0 = performance.now();
    const ease = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
    const tilt  = this._lastTilt ?? 0;
    const color = tilt > 0 ? 'rgba(255,159,10,.88)' : 'rgba(142,142,147,.65)';
    const svg   = this.shadowRoot.getElementById('icon');
    const step  = now => {
      const t = Math.min((now - t0) / dur, 1);
      this._curDeg = start + diff * ease(t);
      if (svg) svg.innerHTML = this._drawSlat(this._curDeg, color);
      if (t < 1) this._raf = requestAnimationFrame(step);
      else this._curDeg = target;
    };
    this._raf = requestAnimationFrame(step);
  }

  _update(tilt, pos, st) {
    this._lastTilt = tilt;
    const r   = this.shadowRoot;
    const on  = tilt > 0;
    const acc = on ? '#ff9f0a' : 'rgba(142,142,147,.8)';
    const slatColor = on ? 'rgba(255,159,10,.88)' : 'rgba(142,142,147,.65)';

    const pctEl    = r.getElementById('pct');
    const statusEl = r.getElementById('status');
    const fillEl   = r.getElementById('fill');
    const glowEl   = r.getElementById('glow');
    const iconbox  = r.getElementById('iconbox');

    if (pctEl)    { pctEl.textContent = tilt; pctEl.style.color = acc; }
    if (statusEl) { statusEl.textContent = this._label(tilt, pos, st); statusEl.style.color = on ? 'rgba(255,159,10,.70)' : '#636366'; }
    if (fillEl)   { fillEl.style.width = tilt + '%'; fillEl.style.background = on ? '#ff9f0a' : 'rgba(142,142,147,.4)'; }
    if (glowEl)   glowEl.classList.toggle('on', on);
    if (iconbox) {
      iconbox.style.background = on ? 'rgba(255,159,10,.10)' : 'rgba(142,142,147,.07)';
      iconbox.style.border     = `.5px solid ${on ? 'rgba(255,159,10,.20)' : 'rgba(142,142,147,.15)'}`;
    }

    r.querySelectorAll('.pill').forEach(b => {
      b.classList.toggle('on', parseInt(b.dataset.tilt) === tilt);
    });

    const targetDeg = this._deg(tilt);
    if (Math.abs(targetDeg - this._curDeg) > 0.5) {
      this._animateTo(targetDeg);
    } else {
      const svg = r.getElementById('icon');
      if (svg) svg.innerHTML = this._drawSlat(this._curDeg, slatColor);
    }
  }

  getCardSize() { return 3; }
}

customElements.define('aha-teleco-card', TelecoCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-teleco-card',
  name:        'Teleco Blind Card',
  preview:     false,
  description: 'Sterowanie żaluzjami w stylu Apple Home (pełna karta z presetami).',
});
class TelecoSlimCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._curDeg  = 0;
    this._raf     = null;
    this._built   = false;
  }

  setConfig(config) {
    this._config = config;
    this._entity = config.entity || 'cover.teleco';
    this._name   = config.name   || 'Żaluzje';
  }

  set hass(hass) {
    this._hass = hass;
    const state = hass.states[this._entity];
    if (!state) return;
    const tilt = state.attributes.current_tilt_position ?? 0;
    const pos  = state.attributes.current_position     ?? 0;
    const st   = state.state;
    if (!this._built) { this._build(); this._built = true; }
    this._update(tilt, pos, st);
  }

  _svc(service, data = {}) {
    this._hass.callService('cover', service, { entity_id: this._entity, ...data });
  }

  _deg(tilt) {
    const kf = [[0,0],[33,52],[66,85],[100,135]];
    for (let i = 0; i < kf.length - 1; i++) {
      const [p0,d0] = kf[i], [p1,d1] = kf[i+1];
      if (tilt >= p0 && tilt <= p1) return d0 + (tilt-p0)/(p1-p0)*(d1-d0);
    }
    return 135;
  }

  _drawSlat(deg, color) {
    const W = 24, H = 24;
    const cx = W/2, cy = H/2, HL = W/2 - 3, TH = Math.max(1.5, HL * 0.16);
    const r  = deg * Math.PI / 180;
    const ca = Math.cos(r), sa = Math.sin(r);
    const px = -sa * TH, py = ca * TH;
    const x1 = cx - HL*ca, y1 = cy - HL*sa;
    const x2 = cx + HL*ca, y2 = cy + HL*sa;
    const f  = ([x,y]) => `${x.toFixed(1)},${y.toFixed(1)}`;
    const body  = [[x1-px,y1-py],[x2-px,y2-py],[x2+px,y2+py],[x1+px,y1+py]].map(f).join(' ');
    const shine = [[x1-px*.3,y1-py*.3],[x2-px*.3,y2-py*.3],[x2+px*.12,y2+py*.12],[x1+px*.12,y1+py*.12]].map(f).join(' ');
    const c = color || 'rgba(142,142,147,.65)';
    return `<polygon points="${body}" fill="${c}"/>
      <polygon points="${shine}" fill="rgba(255,255,255,.22)"/>
      <circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="1.6" fill="rgba(0,0,0,.55)" stroke="${c}" stroke-width=".8"/>
      <circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="1.6" fill="rgba(0,0,0,.55)" stroke="${c}" stroke-width=".8"/>`;
  }

  _label(tilt, st) {
    if (st === 'opening') return 'Otwieranie\u2026';
    if (st === 'closing') return 'Zamykanie\u2026';
    if (tilt === 0)   return 'Zamkni\u0119te';
    if (tilt < 30)    return 'Lekko uchylone';
    if (tilt < 70)    return 'Uchylone';
    if (tilt < 100)   return 'Prawie otwarte';
    return 'Otwarte';
  }

  _build() {
    this.shadowRoot.innerHTML = `
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :host{display:block;font-family:-apple-system,'SF Pro Text','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}

  .glow{border-radius:14px;transition:box-shadow .5s ease}
  .glow.on{
    box-shadow:
      0 0 0 1px rgba(255,159,10,.18),
      0 0 14px 2px rgba(255,159,10,.10),
      0 0 32px 4px rgba(255,159,10,.05);
  }

  .card{
    background:linear-gradient(150deg, #0b1120 0%, #0d1828 100%);border-radius:14px;
    padding:11px 12px 9px;
    position:relative;overflow:hidden;
  }
  .card::before{
    content:'';position:absolute;top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);
    pointer-events:none;
  }

  .row{display:flex;align-items:center;gap:9px;margin-bottom:7px}

  .iconbox{
    width:34px;height:34px;border-radius:9px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    background:rgba(142,142,147,.07);border:.5px solid rgba(142,142,147,.14);
    transition:background .35s,border-color .35s;
  }

  .mid{flex:1;min-width:0}
  .name{
    font-size:13px;font-weight:600;color:rgba(255,255,255,.90);
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  }
  .status{font-size:10px;color:#636366;margin-top:1px;transition:color .3s}

  .pct{
    font-size:19px;font-weight:700;letter-spacing:-.5px;
    font-variant-numeric:tabular-nums;flex-shrink:0;transition:color .3s;
  }
  .pu{font-size:10px;font-weight:400;color:rgba(255,255,255,.28);margin-left:1px}

  .acts{display:flex;gap:4px;flex-shrink:0}
  .act{
    width:28px;height:28px;border-radius:8px;
    display:flex;align-items:center;justify-content:center;
    background:rgba(255,255,255,.05);border:.5px solid rgba(255,255,255,.08);
    cursor:pointer;color:rgba(255,255,255,.40);
    transition:color .15s,background .15s,transform .1s;
    -webkit-tap-highlight-color:transparent;user-select:none;
  }
  .act:active{transform:scale(.90)}
  .act:hover{color:rgba(255,255,255,.80);background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.14)}
  .act.stop:hover{background:rgba(255,69,58,.12);color:#ff453a;border-color:rgba(255,69,58,.22)}

  .track{height:2px;background:rgba(255,255,255,.05);border-radius:2px;overflow:hidden}
  .fill{height:100%;border-radius:2px;transition:width .45s cubic-bezier(.4,0,.2,1),background .35s}
</style>

<div class="glow" id="glow">
  <div class="card">
    <div class="row">
      <div class="iconbox" id="iconbox">
        <svg id="icon" width="24" height="24" viewBox="0 0 24 24" overflow="visible"></svg>
      </div>
      <div class="mid">
        <div class="name" id="name"></div>
        <div class="status" id="status">\u2014</div>
      </div>
      <span class="pct" id="pct">\u2014</span><span class="pu">%</span>
      <div class="acts">
        <div class="act" id="act-close" title="Zamknij">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M3.5 8L7 11.5 10.5 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="act stop" id="act-stop" title="Stop">
          <svg width="9" height="9" viewBox="0 0 14 14" fill="none"><rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor"/></svg>
        </div>
        <div class="act" id="act-open" title="Otwórz">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 12V2M3.5 6L7 2.5 10.5 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
    </div>
    <div class="track"><div class="fill" id="fill"></div></div>
  </div>
</div>`;

    this.shadowRoot.getElementById('name').textContent = this._name;
    this.shadowRoot.getElementById('icon').innerHTML   = this._drawSlat(0, 'rgba(142,142,147,.65)');

    this.shadowRoot.getElementById('act-open').addEventListener('click',  () => this._svc('open_cover'));
    this.shadowRoot.getElementById('act-stop').addEventListener('click',  () => this._svc('stop_cover'));
    this.shadowRoot.getElementById('act-close').addEventListener('click', () => this._svc('close_cover'));
  }

  _animateTo(target) {
    if (this._raf) cancelAnimationFrame(this._raf);
    const start = this._curDeg, diff = target - start;
    const dur = 380, t0 = performance.now();
    const ease = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
    const color = (this._lastTilt ?? 0) > 0 ? 'rgba(255,159,10,.88)' : 'rgba(142,142,147,.65)';
    const svg   = this.shadowRoot.getElementById('icon');
    const step  = now => {
      const t = Math.min((now - t0) / dur, 1);
      this._curDeg = start + diff * ease(t);
      if (svg) svg.innerHTML = this._drawSlat(this._curDeg, color);
      if (t < 1) this._raf = requestAnimationFrame(step);
      else this._curDeg = target;
    };
    this._raf = requestAnimationFrame(step);
  }

  _update(tilt, pos, st) {
    this._lastTilt = tilt;
    const r   = this.shadowRoot;
    const on  = tilt > 0;
    const acc = on ? '#ff9f0a' : 'rgba(142,142,147,.75)';

    r.getElementById('pct').textContent    = tilt;
    r.getElementById('pct').style.color    = acc;
    r.getElementById('status').textContent = this._label(tilt, st);
    r.getElementById('status').style.color = on ? 'rgba(255,159,10,.65)' : '#636366';

    const fill = r.getElementById('fill');
    fill.style.width      = tilt + '%';
    fill.style.background = on ? '#ff9f0a' : 'rgba(142,142,147,.35)';

    r.getElementById('glow').classList.toggle('on', on);
    const ib = r.getElementById('iconbox');
    ib.style.background  = on ? 'rgba(255,159,10,.10)' : 'rgba(142,142,147,.07)';
    ib.style.borderColor = on ? 'rgba(255,159,10,.20)'  : 'rgba(142,142,147,.14)';

    const targetDeg = this._deg(tilt);
    if (Math.abs(targetDeg - this._curDeg) > 0.5) {
      this._animateTo(targetDeg);
    } else {
      const svg = r.getElementById('icon');
      if (svg) svg.innerHTML = this._drawSlat(this._curDeg, on ? 'rgba(255,159,10,.88)' : 'rgba(142,142,147,.65)');
    }
  }

  getCardSize() { return 1; }

  static getStubConfig() {
    return { entity: 'cover.teleco', name: 'Żaluzje' };
  }
}

customElements.define('aha-teleco-card-slim', TelecoSlimCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-teleco-card-slim',
  name:        'Teleco Blind Card — Slim',
  preview:     false,
  description: 'Sterowanie żaluzjami — wersja slim (jeden rząd z przyciskami ikonkowymi).',
});
function _hexToRgb(hex) {
  if (!hex || hex[0] !== '#') return '142,142,147';
  const h = hex.replace('#', '');
  return `${parseInt(h.substring(0,2),16)},${parseInt(h.substring(2,4),16)},${parseInt(h.substring(4,6),16)}`;
}

class AhaTempHumidityCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getStubConfig() {
    return {
      name: 'Salon',
      temp_entity: 'sensor.salon_temperature',
      humidity_entity: 'sensor.salon_humidity',
      battery_entity: '',
      icon: '🛋️',
      min_temp: -10,
      max_temp: 40,
    };
  }

  setConfig(config) {
    if (!config.temp_entity) throw new Error('temp_entity jest wymagane');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  /* ── value helpers ── */
  _val(entity) {
    if (!this._hass || !entity) return null;
    const s = this._hass.states[entity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return parseFloat(s.state);
  }

  /* ── temperature state → full design token set ── */
  _tempState(t) {
    if (t === null) return {
      key: 'offline',
      cardBg: '#1c1c1e',
      cardBorder: 'rgba(255,255,255,0.07)',
      glowCss: '',
      tempColor: '#3a3a3c',
      humColor: '#3a3a3c',
      iconBg: 'rgba(255,255,255,0.06)',
      namColor: '#3a3a3c',
      dotColor: '#3a3a3c',
      dotGlow: 'none',
      dotPct: 0,
      label: 'offline',
    };
    if (t < 5) return {
      key: 'frost',
      cardBg: '#0b1420',
      cardBorder: 'rgba(90,200,250,0.32)',
      glowCss: 'radial-gradient(ellipse at 0% 0%, rgba(90,200,250,0.16) 0%, transparent 60%)',
      tempColor: '#5AC8FA',
      humColor: '#5AC8FA',
      iconBg: 'rgba(90,200,250,0.14)',
      nameColor: 'rgba(90,200,250,0.4)',
      dotColor: '#5AC8FA',
      dotGlow: '0 0 6px rgba(90,200,250,0.7)',
      dotPct: Math.max(2, ((t + 10) / 50) * 100),
      label: 'mróz',
    };
    if (t < 17) return {
      key: 'cold',
      cardBg: '#101820',
      cardBorder: 'rgba(90,200,250,0.15)',
      glowCss: 'radial-gradient(ellipse at 10% 10%, rgba(90,200,250,0.09) 0%, transparent 55%)',
      tempColor: '#7dd4f8',
      humColor: '#5AC8FA',
      iconBg: 'rgba(90,200,250,0.10)',
      nameColor: '#3a3a3c',
      dotColor: '#7dd4f8',
      dotGlow: '0 0 5px rgba(90,200,250,0.5)',
      dotPct: ((t + 10) / 50) * 100,
      label: 'zimno',
    };
    if (t < 26) return {
      key: 'comfort',
      cardBg: '#1c1c1e',
      cardBorder: 'rgba(255,255,255,0.08)',
      glowCss: '',
      tempColor: '#ffffff',
      humColor: '#30D158',
      iconBg: 'rgba(255,255,255,0.07)',
      nameColor: '#3a3a3c',
      dotColor: '#ffffff',
      dotGlow: '0 0 5px rgba(255,255,255,0.55)',
      dotPct: ((t + 10) / 50) * 100,
      label: 'komfort',
    };
    if (t < 31) return {
      key: 'warm',
      cardBg: '#1e1508',
      cardBorder: 'rgba(255,159,10,0.22)',
      glowCss: 'radial-gradient(ellipse at 100% 0%, rgba(255,159,10,0.13) 0%, transparent 55%)',
      tempColor: '#FF9F0A',
      humColor: '#FF9F0A',
      iconBg: 'rgba(255,159,10,0.12)',
      nameColor: 'rgba(255,159,10,0.35)',
      dotColor: '#FF9F0A',
      dotGlow: '0 0 6px rgba(255,159,10,0.65)',
      dotPct: ((t + 10) / 50) * 100,
      label: 'za ciepło',
    };
    return {
      key: 'fire',
      cardBg: '#1a0800',
      cardBorder: 'rgba(255,69,58,0.42)',
      glowCss: 'radial-gradient(ellipse at 50% 110%, rgba(255,80,0,0.32) 0%, rgba(180,20,0,0.12) 45%, transparent 68%)',
      tempColor: '#FF453A',
      humColor: '#FF453A',
      iconBg: 'rgba(255,69,58,0.15)',
      nameColor: 'rgba(255,69,58,0.35)',
      dotColor: '#FF453A',
      dotGlow: '0 0 7px rgba(255,69,58,0.8)',
      dotPct: Math.min(98, ((t + 10) / 50) * 100),
      label: 'upał',
    };
  }

  /* ── humidity color ── */
  _humColor(h, st) {
    if (h === null) return st.humColor;
    if (h < 35)  return '#FF9F0A';
    if (h < 66)  return '#30D158';
    if (h < 81)  return '#0A84FF';
    return '#FF453A';
  }

  /* ── battery HTML ── */
  _batteryHTML(pct) {
    if (pct === null || pct >= 25) return '';
    const col = pct < 20 ? '#FF453A' : 'rgba(255,255,255,0.45)';
    const fillW = Math.round((Math.max(0, Math.min(100, pct)) / 100) * 13);
    return `
      <div class="bat">
        <span class="bat-pct">${Math.round(pct)}%</span>
        <svg width="20" height="10" viewBox="0 0 22 11">
          <rect x="0.5" y="0.5" width="17" height="10" rx="2.5" fill="none" stroke="${col}" stroke-width="1.1"/>
          <rect x="18" y="3.5" width="2.5" height="4" rx="1" fill="${col}" opacity="0.7"/>
          ${fillW > 0 ? `<rect x="2" y="2" width="${fillW}" height="6" rx="1.5" fill="${col}"/>` : ''}
        </svg>
      </div>`;
  }

  /* ── frost crystals overlay ── */
  _frostHTML() {
    return `
      <svg class="overlay-svg frost-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,0 Q14,22 0,44" stroke="rgba(140,210,255,0.35)" stroke-width="1.1" fill="none"/>
        <path d="M0,0 Q26,10 52,0" stroke="rgba(140,210,255,0.35)" stroke-width="1.1" fill="none"/>
        <path d="M0,0 Q22,22 34,34" stroke="rgba(140,210,255,0.22)" stroke-width="0.9" fill="none"/>
        <line x1="18" y1="18" x2="18" y2="32" stroke="rgba(160,225,255,0.6)" stroke-width="1"/>
        <line x1="11" y1="25" x2="25" y2="25" stroke="rgba(160,225,255,0.6)" stroke-width="1"/>
        <line x1="13" y1="20" x2="23" y2="30" stroke="rgba(160,225,255,0.32)" stroke-width="0.8"/>
        <line x1="23" y1="20" x2="13" y2="30" stroke="rgba(160,225,255,0.32)" stroke-width="0.8"/>
        <line x1="38" y1="10" x2="38" y2="20" stroke="rgba(160,225,255,0.4)" stroke-width="0.8"/>
        <line x1="33" y1="15" x2="43" y2="15" stroke="rgba(160,225,255,0.4)" stroke-width="0.8"/>
        <circle cx="7"  cy="7"  r="1.5" fill="rgba(180,235,255,0.65)"/>
        <circle cx="24" cy="5"  r="1"   fill="rgba(180,235,255,0.5)"/>
        <circle cx="5"  cy="26" r="1.2" fill="rgba(180,235,255,0.5)"/>
        <circle cx="34" cy="6"  r="0.9" fill="rgba(180,235,255,0.4)"/>
        <circle cx="10" cy="38" r="1"   fill="rgba(180,235,255,0.35)"/>
        <circle cx="48" cy="8"  r="0.8" fill="rgba(180,235,255,0.3)"/>
      </svg>`;
  }

  /* ── fire flames overlay ── */
  _fireHTML() {
    return `
      <div class="flames">
        <div class="flame fl1"></div>
        <div class="flame fl2"></div>
        <div class="flame fl3"></div>
        <div class="flame fl4"></div>
      </div>`;
  }

  /* ── main render ── */
  _render() {
    const cfg  = this._config;
    const name = cfg.name  || 'Pokój';
    const icon = cfg.icon  || '🏠';
    const temp = this._val(cfg.temp_entity);
    const hum  = this._val(cfg.humidity_entity);
    const bat  = this._val(cfg.battery_entity);
    const st   = this._tempState(temp);
    const hCol = this._humColor(hum, st);

    const minT = parseFloat(cfg.min_temp ?? -10);
    const maxT = parseFloat(cfg.max_temp ?? 40);

    const tempStr  = temp === null ? '--°' : temp.toFixed(1) + '°';
    const isOffline = temp === null;
    // show humidity only when out of comfortable range (< 35% or ≥ 66%)
    const showHum  = hum !== null && (hum < 35 || hum >= 66);
    const humStr   = showHum ? hum.toFixed(0) + '%' : '';

    /* ── thermometer fill % ── */
    const fillPct = isOffline ? 0 : Math.max(0, Math.min(100, (temp - minT) / (maxT - minT) * 100));

    const gradMap = {
      offline: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)'],
      frost:   ['#5AC8FA', '#0A84FF'],
      cold:    ['#a8dff8', '#7dd4f8'],
      comfort: ['#30D158', '#25a244'],
      warm:    ['#FFD60A', '#FF9F0A'],
      fire:    ['#FF6B6B', '#FF453A'],
    };
    const [g0, g1]  = gradMap[st.key] || gradMap.comfort;
    const glowFill  = isOffline ? 'none' : `${g1}44`;

    this.shadowRoot.innerHTML = `
<style>
  :host { display: block; width: 100%; height: 100%; }

  .card {
    width: 100%; height: 100%;
    border-radius: 16px;
    padding: 12px;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    cursor: default;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    background: ${st.cardBg};
    border: 1px solid ${st.cardBorder};
    transition: transform 0.15s ease, border-color 0.5s ease, background 0.5s ease;
  }
  .card:active { transform: scale(0.97); }

  .bg-glow {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background: ${st.glowCss || 'none'};
    transition: background 0.5s ease;
  }

  .overlay-svg { position: absolute; pointer-events: none; z-index: 1; }
  .frost-svg { top: 0; left: 0; width: 100px; height: 100px; opacity: 0.6; }

  .flames {
    position: absolute; bottom: 10px; right: 40px;
    display: flex; gap: 2px; align-items: flex-end;
    z-index: 1; pointer-events: none;
  }
  .flame { border-radius: 50% 50% 30% 30%; transform-origin: bottom center; animation: flicker 1.8s ease-in-out infinite; }
  .fl1 { width: 5px;  height: 18px; background: linear-gradient(to top, #FF6B00, #FF3A00, rgba(255,80,0,0.06));  animation-duration: 1.5s; animation-delay: 0s;    }
  .fl2 { width: 8px;  height: 28px; background: linear-gradient(to top, #FF8C00, #FF4500, rgba(255,60,0,0.05));  animation-duration: 1.9s; animation-delay: 0.18s; }
  .fl3 { width: 6px;  height: 20px; background: linear-gradient(to top, #FF6B00, #FF3A00, rgba(255,70,0,0.06));  animation-duration: 1.4s; animation-delay: 0.35s; }
  .fl4 { width: 5px;  height: 14px; background: linear-gradient(to top, #FF5500, #FF2200, rgba(255,50,0,0.05));  animation-duration: 1.6s; animation-delay: 0.55s; }

  .bat {
    position: absolute; top: 9px; right: 34px; z-index: 10;
    display: flex; align-items: center; gap: 5px;
  }
  .bat-pct {
    font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.8);
    background: rgba(28,28,30,0.92); border: 0.5px solid rgba(255,255,255,0.14);
    border-radius: 5px; padding: 2px 5px;
    opacity: 0; pointer-events: none; transition: opacity 0.15s;
    backdrop-filter: blur(8px);
  }
  .bat:hover .bat-pct { opacity: 1; }

  /* ── left column ── */
  .left {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column;
    justify-content: space-between;
    position: relative; z-index: 2;
    padding-right: 26px; /* space reserved for absolute thermometer */
  }
  .top { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
  .icon-wrap {
    width: 30px; height: 30px; border-radius: 9px;
    background: ${st.iconBg};
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; flex-shrink: 0;
    transition: background 0.5s ease;
  }
  .room-name {
    font-size: 11px; font-weight: 500; color: #a1a1a6;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .temp-val {
    font-size: 22px; font-weight: 700;
    letter-spacing: -1px; line-height: 1;
    color: ${st.tempColor};
    transition: color 0.5s ease;
    cursor: pointer;
  }
  .hum-val {
    font-size: 11px; font-weight: 500;
    color: ${hCol};
    margin-top: 3px;
    transition: color 0.4s ease;
    cursor: ${cfg.humidity_entity ? 'pointer' : 'default'};
  }

  /* ── right thermometer — absolute, outside flex flow ── */
  .thermo-col {
    position: absolute;
    top: 12px; right: 12px; bottom: 12px;
    width: 20px;
    z-index: 2;
  }
  .tube {
    position: absolute;
    top: 0; bottom: 10px;
    left: 50%; transform: translateX(-50%);
    width: 10px;
    border-radius: 5px 5px 2px 2px;
    background: rgba(255,255,255,0.04);
    border: 1px solid ${isOffline ? 'rgba(255,255,255,0.07)' : st.cardBorder};
    overflow: hidden;
    box-sizing: border-box;
  }
  .tube-fill {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    background: linear-gradient(to top, ${g1}, ${g0});
    transition: height 0.6s ease;
  }
  .bulb {
    position: absolute;
    bottom: 0; left: 50%; transform: translateX(-50%);
    width: 18px; height: 18px;
    border-radius: 50%;
    background: ${isOffline ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.15)'};
    border: 1.4px solid ${isOffline ? 'rgba(255,255,255,0.1)' : g0};
    box-shadow: ${isOffline ? 'none' : `0 0 8px ${glowFill}`};
    display: flex; align-items: center; justify-content: center;
  }
  .bulb-fill {
    width: 11px; height: 11px;
    border-radius: 50%;
    background: ${isOffline ? 'rgba(255,255,255,0.08)' : g1};
  }
  @media (max-width: 400px) {
    .thermo-col { width: 16px; }
    .left { padding-right: 20px; }
    .tube { width: 8px; border-radius: 4px 4px 1.5px 1.5px; }
    .bulb { width: 14px; height: 14px; }
    .bulb-fill { width: 9px; height: 9px; }
  }
  @media (max-width: 320px) {
    .thermo-col { width: 12px; }
    .left { padding-right: 15px; }
    .tube { width: 6px; border-radius: 3px 3px 1px 1px; }
    .bulb { width: 11px; height: 11px; }
    .bulb-fill { width: 6px; height: 6px; }
  }

  @keyframes flicker {
    0%,100% { transform: scaleX(1)    scaleY(1)    translateY(0);   opacity: 0.9; }
    25%      { transform: scaleX(0.85) scaleY(1.12) translateY(-3px); opacity: 1;   }
    50%      { transform: scaleX(1.1)  scaleY(0.95) translateY(-1px); opacity: 0.85; }
    75%      { transform: scaleX(0.9)  scaleY(1.08) translateY(-4px); opacity: 0.95; }
  }
</style>

<div class="card" id="card">
  <div class="bg-glow"></div>

  ${st.key === 'frost' ? this._frostHTML() : ''}
  ${st.key === 'fire'  ? this._fireHTML()  : ''}

  ${this._batteryHTML(bat)}

  <div class="left">
    <div class="top">
      <div class="icon-wrap">${icon}</div>
      <div class="room-name">${name}</div>
    </div>
    <div class="bottom">
      ${showHum ? `<div class="hum-val" id="hum-hit">💧 ${humStr}</div>` : '<div id="hum-hit"></div>'}
      <div class="temp-val" id="temp-hit">${tempStr}</div>
    </div>
  </div>

  <div class="thermo-col">
    <div class="tube">
      <div class="tube-fill" style="height:${fillPct.toFixed(1)}%"></div>
    </div>
    <div class="bulb">
      <div class="bulb-fill"></div>
    </div>
  </div>
</div>`;

    /* click → more-info */
    this.shadowRoot.getElementById('temp-hit')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._config.temp_entity },
      }));
    });

    if (cfg.humidity_entity) {
      this.shadowRoot.getElementById('hum-hit')?.addEventListener('click', e => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true,
          detail: { entityId: this._config.humidity_entity },
        }));
      });
    }
  }

  getCardSize() { return 3; }
}

customElements.define('aha-temp-humidity-card', AhaTempHumidityCard);
if (!customElements.get('temp-humidity-card'))
  customElements.define('temp-humidity-card', class extends AhaTempHumidityCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-temp-humidity-card',
  name:        'AHA Temp & Humidity Card',
  preview:     false,
  description: 'Kafelek temperatury i wilgotności — Apple Home dark style. Reaktywne tło (mróz/komfort/upał), gradient range-bar, ikona jako parametr.',
});class TempSlimCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getStubConfig() {
    return { temp_entity: 'sensor.temperature_salon', name: 'Salon' };
  }

  setConfig(config) {
    if (!config.temp_entity) throw new Error('temp_entity jest wymagane');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  get _tempVal() {
    if (!this._hass || !this._config.temp_entity) return null;
    const s = this._hass.states[this._config.temp_entity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return parseFloat(s.state);
  }

  _getTempState(t) {
    if (t === null) return {
      label: 'OFFLINE', color: 'rgba(255,255,255,0.2)',
      border: 'rgba(255,255,255,0.08)', bg: '#1C1C1E',
      fillPct: 0, bulbColor: 'rgba(255,255,255,0.15)',
      glowColor: 'rgba(255,255,255,0)', glowWidth: 5,
      pillBg: 'rgba(255,255,255,0.05)', pillBorder: 'rgba(255,255,255,0.1)',
      gradStops: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)'],
      effect: 'none', pulseAnim: '',
    };
    if (t < 5)  return {
      label: 'MRÓZ', color: '#0A84FF',
      border: 'rgba(10,132,255,0.32)', bg: 'linear-gradient(150deg,#040c18,#111820,#1C1C1E)',
      fillPct: Math.max(4, ((t + 10) / 15) * 28),
      bulbColor: '#0A84FF', glowColor: 'rgba(10,132,255,0.25)', glowWidth: 6,
      pillBg: 'rgba(10,132,255,0.15)', pillBorder: 'rgba(10,132,255,0.42)',
      gradStops: ['#5AC8FA', '#0A84FF'],
      effect: 'frost', pulseAnim: 'animation: frost-pulse 3s ease-in-out infinite;',
    };
    if (t < 17) return {
      label: 'ZIMNO', color: '#5AC8FA',
      border: 'rgba(90,200,250,0.2)', bg: 'linear-gradient(150deg,#081420,#1C1C1E)',
      fillPct: 18 + ((t - 5) / 12) * 24,
      bulbColor: '#5AC8FA', glowColor: 'rgba(90,200,250,0.18)', glowWidth: 5,
      pillBg: 'rgba(90,200,250,0.12)', pillBorder: 'rgba(90,200,250,0.3)',
      gradStops: ['#5AC8FA', '#0A84FF'],
      effect: 'none', pulseAnim: '',
    };
    if (t < 26) return {
      label: 'KOMFORT', color: '#30D158',
      border: 'rgba(48,209,88,0.2)', bg: 'linear-gradient(150deg,#0a1e0e,#1C1C1E)',
      fillPct: 42 + ((t - 17) / 9) * 20,
      bulbColor: '#30D158', glowColor: 'rgba(48,209,88,0.2)', glowWidth: 5,
      pillBg: 'rgba(48,209,88,0.12)', pillBorder: 'rgba(48,209,88,0.3)',
      gradStops: ['#30D158', '#25a244'],
      effect: 'none', pulseAnim: '',
    };
    if (t < 31) return {
      label: 'ZA CIEPŁO', color: '#FF9F0A',
      border: 'rgba(255,159,10,0.25)', bg: 'linear-gradient(150deg,#1e1000,#231408,#1C1C1E)',
      fillPct: 62 + ((t - 26) / 5) * 20,
      bulbColor: '#FF9F0A', glowColor: 'rgba(255,159,10,0.22)', glowWidth: 5,
      pillBg: 'rgba(255,159,10,0.14)', pillBorder: 'rgba(255,159,10,0.38)',
      gradStops: ['#FFD60A', '#FF9F0A'],
      effect: 'warm', pulseAnim: 'animation: warm-pulse 2.8s ease-in-out infinite;',
    };
    return {
      label: '⚠ UPAŁ', color: '#FF453A',
      border: 'rgba(255,69,58,0.38)', bg: 'linear-gradient(150deg,#1a0404,#220808,#1C1C1E)',
      fillPct: 100,
      bulbColor: '#FF2200', glowColor: 'rgba(255,69,58,0.35)', glowWidth: 7,
      pillBg: 'rgba(255,69,58,0.2)', pillBorder: 'rgba(255,69,58,0.55)',
      gradStops: ['#FF6B6B', '#FF2200'],
      effect: 'heat', pulseAnim: 'animation: heat-pulse 2s ease-in-out infinite;',
    };
  }

  _frostHTML() {
    return `
    <svg class="fx frost-tl" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,0 Q10,18 0,36" stroke="rgba(140,210,255,0.4)" stroke-width="1.2" fill="none"/>
      <path d="M0,0 Q22,8 42,0" stroke="rgba(140,210,255,0.4)" stroke-width="1.2" fill="none"/>
      <path d="M0,0 Q18,18 28,28" stroke="rgba(140,210,255,0.28)" stroke-width="0.9" fill="none"/>
      <line x1="14" y1="14" x2="14" y2="26" stroke="rgba(160,225,255,0.65)" stroke-width="1"/>
      <line x1="8"  y1="20" x2="20" y2="20" stroke="rgba(160,225,255,0.65)" stroke-width="1"/>
      <line x1="10" y1="16" x2="18" y2="24" stroke="rgba(160,225,255,0.38)" stroke-width="0.8"/>
      <line x1="18" y1="16" x2="10" y2="24" stroke="rgba(160,225,255,0.38)" stroke-width="0.8"/>
      <circle cx="6"  cy="6"  r="1.5" fill="rgba(180,235,255,0.6)"/>
      <circle cx="18" cy="4"  r="1"   fill="rgba(180,235,255,0.5)"/>
      <circle cx="4"  cy="20" r="1.2" fill="rgba(180,235,255,0.5)"/>
    </svg>`;
  }

  _warmHTML() {
    return `
    <div class="sun-glow"></div>
    <svg class="fx sun-rays" viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
      <line x1="55" y1="15" x2="62" y2="8"  stroke="rgba(255,180,0,0.6)" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="60" y1="25" x2="68" y2="22" stroke="rgba(255,180,0,0.5)" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="55" y1="35" x2="64" y2="35" stroke="rgba(255,180,0,0.5)" stroke-width="1.2" stroke-linecap="round"/>
    </svg>
    <div class="warm-haze"></div>
    <div class="warm-waves">
      <div class="ww ww1"></div><div class="ww ww2"></div>
      <div class="ww ww3"></div><div class="ww ww4"></div>
    </div>`;
  }

  _heatHTML() {
    return `
    <div class="heat-glow-bg"></div>
    <div class="heat-embers">
      <div class="ember e1"></div><div class="ember e2"></div>
      <div class="ember e3"></div><div class="ember e4"></div>
    </div>
    <div class="heat-shimmer-wrap">
      <div class="hs hs1"></div><div class="hs hs2"></div>
      <div class="hs hs3"></div><div class="hs hs4"></div>
    </div>
    <div class="heat-blob"></div>`;
  }

  _render() {
    const name = this._config.name || 'Pokój';
    const temp = this._tempVal;
    const st   = this._getTempState(temp);

    const TUBE_TOP = 22, TUBE_H = 72;
    const fillH = Math.min(TUBE_H, (st.fillPct / 100) * TUBE_H);
    const fillY = TUBE_TOP + TUBE_H - fillH;
    const BULB_CY = 108;
    const isOffline = temp === null;
    const tempStr = isOffline ? '--°' : temp.toFixed(1) + '°';

    this.shadowRoot.innerHTML = `
<style>
  :host { display: block; width: 100%; height: 100%; }

  .card {
    position: relative;
    width: 100%;
    aspect-ratio: 1/1;
    border-radius: 18px;
    overflow: hidden;
    background: ${st.bg};
    border: 1px solid ${st.border};
    box-sizing: border-box;
    font-family: -apple-system, system-ui, sans-serif;
    cursor: pointer;
    transition: transform 0.15s ease;
    ${st.pulseAnim}
  }
  .card:active { transform: scale(0.97); }

  .name {
    position: absolute; top: 11px; left: 13px;
    font-size: 11px; font-weight: 500; z-index: 10;
    color: ${isOffline ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.55)'};
    pointer-events: none;
  }
  .pill {
    position: absolute; bottom: 11px; left: 13px;
    padding: 3px 9px; border-radius: 20px;
    font-size: 8px; font-weight: 700; letter-spacing: 0.4px;
    background: ${st.pillBg}; border: 0.5px solid ${st.pillBorder};
    color: ${st.color}; white-space: nowrap; z-index: 10;
    pointer-events: none;
  }
  .main-svg {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%; z-index: 3;
    pointer-events: none;
  }

  /* ── FROST ── */
  .fx { position: absolute; pointer-events: none; z-index: 2; }
  .frost-tl { top:0; left:0; width:75px; height:75px; opacity:0.55; }
  .frost-tr { top:0; right:0; width:50px; height:50px; opacity:0.42; }
  .frost-bl { bottom:0; left:0; width:45px; height:45px; opacity:0.3; }
  .flake {
    position: absolute; font-size: 9px;
    color: rgba(160,220,255,0.72); z-index: 2; pointer-events: none;
    animation: frost-float 3.4s ease-in-out infinite;
  }
  .f1 { top:7px; left:50px; animation-delay:0s; }
  .f2 { top:20px; left:36px; font-size:6px; opacity:0.55; animation-delay:0.7s; }
  .f3 { top:32px; left:56px; font-size:5px; opacity:0.4; animation-delay:1.3s; }

  /* ── WARM ── */
  .sun-glow {
    position:absolute; top:-20px; right:-20px;
    width:80px; height:80px; border-radius:50%; z-index:1; pointer-events:none;
    background: radial-gradient(circle, rgba(255,180,0,0.18) 0%, rgba(255,120,0,0.08) 50%, transparent 70%);
  }
  .sun-rays { top:0; right:0; width:60px; height:60px; opacity:0.42; z-index:2; }
  .warm-haze {
    position:absolute; bottom:0; left:0; right:0; height:55%; z-index:1; pointer-events:none;
    background: linear-gradient(to top, rgba(255,120,0,0.07), transparent);
  }
  .warm-waves {
    position:absolute; right:24px; bottom:28px;
    display:flex; gap:3px; align-items:flex-end; z-index:4; pointer-events:none;
  }
  .ww { width:2px; border-radius:2px;
    background: linear-gradient(to top, rgba(255,159,10,0.55), transparent);
    animation: warm-shimmer 2.4s ease-in-out infinite; }
  .ww1 { height:9px; animation-delay:0s; }
  .ww2 { height:13px; animation-delay:0.4s; }
  .ww3 { height:7px;  animation-delay:0.8s; }
  .ww4 { height:11px; animation-delay:0.2s; }

  /* ── HEAT ── */
  .heat-glow-bg {
    position:absolute; bottom:0; right:0; width:110px; height:100%;
    z-index:1; pointer-events:none;
    background: radial-gradient(ellipse at right bottom, rgba(255,60,0,0.14) 0%, transparent 65%);
  }
  .heat-blob {
    position:absolute; right:18px; bottom:18px;
    width:50px; height:15px; border-radius:50%;
    background: radial-gradient(ellipse, rgba(255,100,0,0.38) 0%, transparent 70%);
    filter: blur(3px); z-index:4; pointer-events:none;
  }
  .heat-embers {
    position:absolute; right:22px; bottom:20px;
    display:flex; gap:2px; align-items:flex-end;
    z-index:5; pointer-events:none;
  }
  .ember { border-radius: 50% 50% 30% 30%; transform-origin: bottom center; }
  .e1 { width:5px;  height:18px; background:linear-gradient(to top,#FF6B00,#FF3A00,rgba(255,100,0,0.25),transparent); animation:flicker1 1.4s ease-in-out infinite 0s; }
  .e2 { width:7px;  height:26px; background:linear-gradient(to top,#FF8C00,#FF4500,#FF2200,rgba(255,80,0,0.15),transparent); animation:flicker2 1.6s ease-in-out infinite 0.15s; }
  .e3 { width:5px;  height:17px; background:linear-gradient(to top,#FF6B00,#FF3A00,rgba(255,80,0,0.2),transparent); animation:flicker3 1.3s ease-in-out infinite 0.3s; }
  .e4 { width:4px;  height:14px; background:linear-gradient(to top,#FF8000,#FF3A00,transparent); animation:flicker1 1.5s ease-in-out infinite 0.45s; }
  .heat-shimmer-wrap {
    position:absolute; right:17px; bottom:46px;
    display:flex; gap:3px; align-items:flex-end;
    z-index:4; pointer-events:none;
  }
  .hs { width:2.5px; border-radius:2px;
    background: linear-gradient(to top, rgba(255,80,40,0.62), transparent);
    animation: shimmer-heat 1.8s ease-in-out infinite; }
  .hs1 { height:12px; animation-delay:0s; }
  .hs2 { height:16px; animation-delay:0.25s; }
  .hs3 { height:9px;  animation-delay:0.5s; }
  .hs4 { height:14px; animation-delay:0.12s; }

  /* ── KEYFRAMES ── */
  @keyframes frost-float {
    0%,100% { opacity:0.65; transform:translateY(0) rotate(0deg); }
    50%      { opacity:1;    transform:translateY(-3px) rotate(10deg); }
  }
  @keyframes frost-pulse {
    0%,100% { box-shadow:0 0 0 0 rgba(10,132,255,0); }
    50%      { box-shadow:0 0 0 8px rgba(10,132,255,0.14); }
  }
  @keyframes warm-pulse {
    0%,100% { box-shadow:0 0 0 0 rgba(255,159,10,0); }
    50%      { box-shadow:0 0 0 6px rgba(255,159,10,0.1); }
  }
  @keyframes heat-pulse {
    0%,100% { box-shadow:0 0 0 0 rgba(255,69,58,0); }
    50%      { box-shadow:0 0 0 8px rgba(255,69,58,0.16); }
  }
  @keyframes warm-shimmer {
    0%,100% { opacity:0.28; transform:scaleX(1) translateY(0); }
    50%      { opacity:0.6;  transform:scaleX(1.15) translateY(-2px); }
  }
  @keyframes flicker1 {
    0%,100% { opacity:0.85; transform:scaleX(1) scaleY(1) translateY(0); }
    25%      { opacity:1;   transform:scaleX(0.85) scaleY(1.12) translateY(-3px); }
    75%      { opacity:0.95; transform:scaleX(0.9) scaleY(1.08) translateY(-4px); }
  }
  @keyframes flicker2 {
    0%,100% { opacity:0.7; transform:scaleX(1) scaleY(1) translateY(0); }
    30%      { opacity:1;  transform:scaleX(1.15) scaleY(1.15) translateY(-5px); }
  }
  @keyframes flicker3 {
    0%,100% { opacity:0.6;  transform:scaleX(1) scaleY(1) translateY(0); }
    40%      { opacity:0.95; transform:scaleX(1.2) scaleY(1.2) translateY(-6px); }
  }
  @keyframes shimmer-heat {
    0%,100% { opacity:0.4; transform:scaleX(1) translateY(0); }
    33%      { opacity:0.8; transform:scaleX(1.2) translateY(-3px); }
  }
</style>

<div class="card">
  ${st.effect === 'frost' ? this._frostHTML() : ''}
  ${st.effect === 'warm'  ? this._warmHTML()  : ''}
  ${st.effect === 'heat'  ? this._heatHTML()  : ''}

  <div class="name">${name}</div>

  <svg class="main-svg" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${st.gradStops[0]}"/>
        <stop offset="100%" stop-color="${st.gradStops[1]}"/>
      </linearGradient>
      <clipPath id="tube-clip">
        <rect x="104" y="${TUBE_TOP}" width="10" height="${TUBE_H}" rx="5"/>
      </clipPath>
    </defs>

    <!-- temp value -->
    <text x="12" y="62"
      fill="${isOffline ? 'rgba(255,255,255,0.15)' : 'white'}"
      font-size="36" font-weight="700"
      font-family="-apple-system,system-ui"
      letter-spacing="-1.5">${tempStr}</text>

    <!-- tube background -->
    <rect x="104" y="${TUBE_TOP}" width="10" height="${TUBE_H}" rx="5"
      fill="rgba(255,255,255,0.04)"
      stroke="${isOffline ? 'rgba(255,255,255,0.07)' : st.border}"
      stroke-width="1"/>

    <!-- tube fill -->
    ${!isOffline && fillH > 0 ? `
    <rect x="104" y="${fillY}" width="10" height="${fillH}"
      fill="url(#grad)" clip-path="url(#tube-clip)"/>
    ` : ''}

    <!-- tick marks -->
    <line x1="114" y1="${TUBE_TOP + 10}" x2="119" y2="${TUBE_TOP + 10}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <line x1="114" y1="${TUBE_TOP + 24}" x2="119" y2="${TUBE_TOP + 24}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <line x1="114" y1="${TUBE_TOP + 38}" x2="119" y2="${TUBE_TOP + 38}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <line x1="114" y1="${TUBE_TOP + 52}" x2="119" y2="${TUBE_TOP + 52}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

    <!-- bulb glow -->
    ${!isOffline ? `<circle cx="109" cy="${BULB_CY}" r="12" fill="${st.glowColor}"/>` : ''}
    <circle cx="109" cy="${BULB_CY}" r="11"
      fill="none"
      stroke="${isOffline ? 'rgba(255,255,255,0)' : st.glowColor}"
      stroke-width="${st.glowWidth}"/>
    <!-- bulb body -->
    <circle cx="109" cy="${BULB_CY}" r="10"
      fill="${isOffline ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.15)'}"
      stroke="${isOffline ? 'rgba(255,255,255,0.1)' : st.bulbColor}"
      stroke-width="1.4"/>
    <!-- bulb fill -->
    <circle cx="109" cy="${BULB_CY}" r="6.5"
      fill="${isOffline ? 'rgba(255,255,255,0.08)' : st.bulbColor}"/>
  </svg>

  <div class="pill">${st.label}</div>
</div>`;

    this.shadowRoot.querySelector('.card')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._config.temp_entity },
      }));
    });
  }

  getCardSize() { return 2; }
}

customElements.define('aha-temp-slim-card', TempSlimCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-temp-slim-card',
  name:        'Temp Slim Card',
  preview:     false,
  description: 'Kompaktowy kwadratowy kafelek temperatury z termometrem i efektami wizualnymi.',
});
/**
 * temp-gauge-card.js — AHA Temperature & Humidity Gauge Card
 *
 * Layout:
 *   gauge    — dual-arc (temp outer, hum inner)
 *   pills    — absolute overlay top-right, only non-normal states
 *   bottom   — room name HTML, muted
 *
 * Hover focus mode:
 *   arc hovered  → brightens, tooltip appears
 *   opposite arc → dims to 20%
 *   chrome       → dims to 30%
 */

class AhaTempGaugeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._uid = Math.random().toString(36).slice(2, 7);
  }

  static getStubConfig() {
    return {
      name: 'Salon',
      temp_entity: 'sensor.salon_temperature',
      humidity_entity: 'sensor.salon_humidity',
      battery_entity: '',
      min_temp: -10,
      max_temp: 40,
    };
  }

  setConfig(config) {
    if (!config.temp_entity) throw new Error('temp_entity jest wymagane');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    const c = this._config;
    const sig = [
      c.temp_entity     ? hass.states[c.temp_entity]?.state     : '',
      c.humidity_entity ? hass.states[c.humidity_entity]?.state : '',
      c.battery_entity  ? hass.states[c.battery_entity]?.state  : '',
    ].join('|');
    if (sig === this._lastSig) return;
    this._lastSig = sig;
    this._render();
  }

  _val(entity) {
    if (!this._hass || !entity) return null;
    const s = this._hass.states[entity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return parseFloat(s.state);
  }

  _tempState(t) {
    if (t === null) return {
      key: 'offline', cardBg: 'linear-gradient(150deg, #0b1120 0%, #0d1828 100%)', cardBorder: 'rgba(255,255,255,0.07)',
      glowCss: '', tempColor: '#3a3a3c', iconBg: 'rgba(255,255,255,0.06)',
      arcG0: 'rgba(255,255,255,0.18)', arcG1: 'rgba(255,255,255,0.06)', label: 'offline',
    };
    if (t < 5) return {
      key: 'frost', cardBg: '#07101c', cardBorder: 'rgba(90,200,250,0.62)',
      glowCss: 'radial-gradient(ellipse at 18% 12%, rgba(100,180,255,0.24) 0%, rgba(90,200,250,0.09) 40%, transparent 62%), radial-gradient(ellipse at 42% 22%, rgba(90,200,250,0.18) 0%, rgba(90,200,250,0.05) 48%, transparent 70%)',
      tempColor: '#5AC8FA', iconBg: 'rgba(90,200,250,0.15)',
      arcG0: '#8FDDFF', arcG1: '#1f7fd8', label: 'mróz',
    };
    if (t < 17) return {
      key: 'cold', cardBg: '#0e1822', cardBorder: 'rgba(90,200,250,0.22)',
      glowCss: 'radial-gradient(ellipse at 30% 25%, rgba(90,200,250,0.13) 0%, transparent 58%)',
      tempColor: '#7dd4f8', iconBg: 'rgba(90,200,250,0.11)',
      arcG0: '#c0ecff', arcG1: '#5ab8ee', label: 'zimno',
    };
    if (t < 26) return {
      key: 'comfort', cardBg: 'linear-gradient(150deg, #0b1120 0%, #0d1828 100%)', cardBorder: 'rgba(255,255,255,0.08)',
      glowCss: '',
      tempColor: '#ffffff', iconBg: 'rgba(255,255,255,0.08)',
      arcG0: '#5cf087', arcG1: '#1c9e40', label: 'komfort',
    };
    if (t < 31) return {
      key: 'warm', cardBg: '#1c1100', cardBorder: 'rgba(255,159,10,0.40)',
      glowCss: 'radial-gradient(ellipse at 60% 20%, rgba(255,159,10,0.24) 0%, rgba(255,100,0,0.10) 50%, transparent 70%)',
      tempColor: '#FF9F0A', iconBg: 'rgba(255,159,10,0.14)',
      arcG0: '#FFE066', arcG1: '#e87800', label: 'za ciepło',
    };
    return {
      key: 'fire', cardBg: '#150200', cardBorder: 'rgba(255,69,58,0.72)',
      glowCss: 'radial-gradient(ellipse at 50% 94%, rgba(255,110,0,0.62) 0%, rgba(210,30,0,0.28) 52%, transparent 72%)',
      tempColor: '#FF9F4A', iconBg: 'rgba(255,69,58,0.17)',
      arcG0: '#FFAA55', arcG1: '#cc1500', label: 'upał',
    };
  }

  _humArcColor(h) {
    if (h === null) return 'rgba(255,255,255,0.15)';
    if (h < 35)  return '#FF9F0A';
    if (h < 66)  return '#30D158';
    if (h < 81)  return '#0A84FF';
    return '#FF453A';
  }

  _render() {
    const cfg      = this._config;
    const name     = cfg.name || 'Pokój';
    const uid  = this._uid;

    const temp = this._val(cfg.temp_entity);
    const hum  = this._val(cfg.humidity_entity);
    const bat  = this._val(cfg.battery_entity);

    const st      = this._tempState(temp);
    const humCol  = this._humArcColor(hum);
    const isOffline = temp === null;

    const minT = parseFloat(cfg.min_temp ?? -10);
    const maxT = parseFloat(cfg.max_temp ?? 40);

    const tempStr  = isOffline ? '—' : temp.toFixed(1) + '°';
    const isDeath  = temp !== null && temp >= 38;
    const humStr  = hum !== null ? hum.toFixed(0) + '%' : '—';

    const fillPct = isOffline ? 0 : Math.max(0, Math.min(100, (temp - minT) / (maxT - minT) * 100));
    const humPct  = hum !== null ? Math.max(0, Math.min(100, hum)) : 0;

    /* ── SVG gauge geometry ── */
    const CX = 100, CY = 90;
    const R1 = 74, SW1 = 13;   // temp  — dominant
    const R2 = 54, SW2 = 7;    // hum   — slender accent (was 10 → 7)
    const FRAC = 0.75;

    const C1 = 2 * Math.PI * R1, ARC1 = FRAC * C1;
    const C2 = 2 * Math.PI * R2, ARC2 = FRAC * C2;

    const tempFillLen = isOffline ? 0 : (fillPct / 100) * ARC1;
    const humFillLen  = hum !== null ? (humPct / 100) * ARC2 : 0;

    // Indicator dot — end of temp fill arc
    const dotRad = (135 + (isOffline ? 0 : (fillPct / 100) * 270)) * Math.PI / 180;
    const dotX = CX + R1 * Math.cos(dotRad);
    const dotY = CY + R1 * Math.sin(dotRad);

    // Min / max range labels
    const LR  = R1 + SW1 / 2 + 9;
    const minA = 135 * Math.PI / 180;
    const maxA = (135 + 270) * Math.PI / 180;
    const fmtT = v => v === 0 ? '0°' : v > 0 ? `+${v}°` : `${v}°`;

    // Extreme-state glow on arc

    // Humidity zone label
    const humZone = hum === null ? '' : hum < 35 ? 'sucho' : hum < 66 ? 'komfort' : hum < 81 ? 'wilgotno' : 'b. wilgotno';

    /* ── HTML tooltip helper (nie SVG — CSS px nie skalują się z viewBox) ── */
    const _ttHtml = (label, valStr, valColor, cls) => `
      <div class="tt-box ${cls}">
        <div class="tt-label">${label}</div>
        <div class="tt-val" style="color:${valColor}">${valStr}</div>
      </div>`;

    /* ── Battery ── */
    const batHTML = (() => {
      if (bat === null || bat >= 25) return '';
      const col   = bat < 20 ? '#FF453A' : 'rgba(255,255,255,0.38)';
      const fillW = Math.round((Math.max(0, Math.min(100, bat)) / 100) * 13);
      return `
        <div class="bat">
          <span class="bat-pct">${Math.round(bat)}%</span>
          <svg width="16" height="8" viewBox="0 0 22 11">
            <rect x=".5" y=".5" width="17" height="10" rx="2.5" fill="none" stroke="${col}" stroke-width="1.1"/>
            <rect x="18" y="3.5" width="2.5" height="4" rx="1" fill="${col}" opacity=".7"/>
            ${fillW > 0 ? `<rect x="2" y="2" width="${fillW}" height="6" rx="1.5" fill="${col}"/>` : ''}
          </svg>
        </div>`;
    })();

    this.shadowRoot.innerHTML = `
<style>
  :host { display: block; width: 100%; height: 100%; position: relative; }

  .card {
    width: 100%; height: 100%;
    border-radius: 20px;
    padding: 10px 10px 8px;
    box-sizing: border-box;
    display: flex; flex-direction: column;
    overflow: hidden; position: relative;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent; user-select: none; cursor: default;
    background: ${st.cardBg};
    border: 1px solid ${st.cardBorder};
    transition: border-color .5s ease, transform .15s ease;
  }
  .card:active { transform: scale(0.97); }

  .bg-glow {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background: ${st.glowCss || 'none'}; transition: background .5s ease;
  }

  /* ── card pulse — ten sam styl co ac.yaml / vacuum: prosty spread bez blur ── */
  @keyframes frost-card {
    0%,100% { box-shadow: 0 0 0 0   rgba(90,200,250,0); }
    50%     { box-shadow: 0 0 0 5px rgba(90,200,250,0.22); }
  }
  @keyframes warm-card {
    0%,100% { box-shadow: 0 0 0 0   rgba(255,159,10,0); }
    50%     { box-shadow: 0 0 0 5px rgba(255,159,10,0.20); }
  }
  @keyframes fire-card {
    0%,100% { box-shadow: 0 0 0 0   rgba(255,69,58,0); }
    50%     { box-shadow: 0 0 0 6px rgba(255,69,58,0.30), 0 0 22px 3px rgba(255,100,0,0.20); }
  }
  @keyframes frost-pulse  { 0%,100%{opacity:.5}  50%{opacity:.95} }
  @keyframes frost-arc    { 0%,100%{filter:brightness(1)}  50%{filter:brightness(1.28) saturate(1.3)} }
  @keyframes fire-arc     { 0%,100%{opacity:.9} 25%{opacity:1;filter:brightness(1.55) saturate(1.4)} 75%{opacity:.82;filter:brightness(.88)} }
  @keyframes fire-shimmer { 0%,100%{opacity:.55;transform:scaleY(1)} 50%{opacity:.9;transform:scaleY(1.07)} }
  @keyframes heat-hue     { 0%,100%{filter:hue-rotate(0deg)} 50%{filter:hue-rotate(8deg)} }
  @keyframes death-pulse  { 0%,100%{opacity:.70} 50%{opacity:1} }
  @keyframes death-flicker { 0%,100%{opacity:1} 45%{opacity:.85} 50%{opacity:.60} 55%{opacity:.90} }
  .death-skull { animation: death-pulse 2.8s ease-in-out infinite; }
  .death-skull ellipse[fill="url(#sg)"], .death-skull ellipse:first-child { animation: death-flicker 3.5s ease-in-out infinite; }
  @keyframes mirage-drift { 0%,100%{opacity:0;transform:scaleX(0.88)} 45%{opacity:1;transform:scaleX(1.06)} 90%{opacity:0;transform:scaleX(1.01)} }
  @keyframes ice-crystal-glow { 0%,100%{opacity:.07} 50%{opacity:.19} }

  .card.frost { animation: frost-card 3.0s ease-in-out infinite; }
  .card.warm  { animation: warm-card  3.5s ease-in-out infinite; }
  .card.fire  { animation: fire-card  2.0s ease-in-out infinite, heat-hue 3.0s ease-in-out infinite; }
  .card.frost .arc-temp-fill { animation: frost-arc 3.0s ease-in-out infinite; }
  .card.fire  .arc-temp-fill { animation: fire-arc  2.0s ease-in-out infinite; }

  .frost-overlay {
    display:none; position:absolute; inset:0; z-index:1;
    pointer-events:none; border-radius:19px; overflow:hidden;
  }
  .card.frost .frost-overlay { display:block; animation: frost-pulse 3.5s ease-in-out infinite; }

  .fire-overlay {
    display:none; position:absolute; inset:0; z-index:1;
    pointer-events:none; border-radius:19px; overflow:hidden;
  }
  .card.fire .fire-overlay { display:block; animation: fire-shimmer 2.5s ease-in-out infinite; }

  /* ── state label — absolute top-center, lekki napis, nie przesuwa gauge ── */
  .state-label {
    position: absolute; top: 10px; left: 0; right: 0; z-index: 5;
    text-align: center; pointer-events: none;
    font-size: 9px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
    transition: color .5s ease, opacity .5s ease;
  }
  .card.comfort .state-label,
  .card.offline .state-label { display: none; }
  .card.cold  .state-label { color: rgba(125,212,248,0.55); }
  .card.frost .state-label { color: rgba(90,200,250,0.90); }
  .card.warm  .state-label { color: rgba(255,159,10,0.90); }
  .card.fire  .state-label { color: rgba(255,255,255,0.95); text-shadow: 0 0 12px rgba(255,120,0,0.92); }

  .mirage-overlay {
    display: none; position: absolute; left: -6%; right: -6%; top: 35%; height: 32px;
    pointer-events: none; z-index: 2; border-radius: 50%;
    background: linear-gradient(transparent, rgba(255,140,40,0.13), transparent);
  }
  .card.fire .mirage-overlay { display: block; animation: mirage-drift 4.2s ease-in-out infinite; }

  .ice-glow-overlay {
    display: none; position: absolute; inset: 0; pointer-events: none; z-index: 1; border-radius: 19px;
    background: radial-gradient(ellipse at 18% 12%, rgba(100,180,255,0.24) 0%, rgba(90,200,250,0.08) 40%, transparent 62%);
  }
  .card.frost .ice-glow-overlay { display: block; animation: ice-crystal-glow 3.5s ease-in-out infinite; }

  .card.frost .center-val { filter: drop-shadow(0 0 10px rgba(120,200,255,0.88)); }
  .card.frost #g-temp     { filter: drop-shadow(0 0 5px  rgba(100,190,255,0.52)); }

  /* ── room name HTML at bottom ── */
  .room-name {
    text-align: center; font-size: 12px; font-weight: 600;
    color: rgba(255,255,255,0.65); flex-shrink: 0;
    padding-bottom: 4px; position: relative; z-index: 2;
    transition: opacity .22s ease;
  }

  /* ── battery (absolute top-right) ── */
  .bat {
    position: absolute; top: 9px; right: 10px; z-index: 10;
    display: flex; align-items: center; gap: 4px;
  }
  .bat-pct {
    font-size: 9px; font-weight: 600; color: rgba(255,255,255,.8);
    background: rgba(28,28,30,.92); border: .5px solid rgba(255,255,255,.14);
    border-radius: 4px; padding: 1px 4px;
    opacity: 0; pointer-events: none; transition: opacity .15s; backdrop-filter: blur(8px);
  }
  .bat:hover .bat-pct { opacity: 1; }

  /* ── gauge ── */
  .gauge-wrap {
    flex: 1; min-height: 0;
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 2;
  }
  .gauge-svg { width: 100%; height: 100%; overflow: visible; }

  /* ══ HOVER FOCUS MODE — JS-driven (shadow DOM safe) ══ */

  /* arc fill brightens on direct :hover (CSS, reliable) */
  .arc-temp-fill, .arc-hum-fill { transition: filter .2s ease; }
  #g-temp:hover .arc-temp-fill { filter: brightness(1.4) saturate(1.15) !important; }
  #g-hum:hover  .arc-hum-fill  { filter: brightness(1.4) saturate(1.15); }

  /* arc track brightens slightly */
  #g-temp:hover .arc-track-temp,
  #g-hum:hover  .arc-track-hum  { filter: brightness(3); transition: filter .2s ease; }

  /* JS-controlled transition targets */
  #g-temp, #g-hum { transition: opacity .22s ease; }
  .state-label { transition: color .5s ease, opacity .22s ease; }

  /* temperature value — SVG text, wewnątrz łuków */
  .center-val {
    font-family: -apple-system,system-ui,sans-serif;
    font-size: 34px; font-weight: 700; letter-spacing: -1.5px;
    fill: ${st.tempColor}; transition: opacity .2s ease;
    cursor: pointer;
  }

  /* ── HTML tooltips — absolutne w card div (nie w gauge-wrap), z-index 100 ── */
  .tt-box {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -60%);
    background: rgba(10,10,14,0.96);
    border: 0.5px solid rgba(255,255,255,0.13);
    border-radius: 14px; padding: 8px 14px;
    text-align: center; pointer-events: none;
    opacity: 0; transition: opacity .18s ease;
    z-index: 100; white-space: nowrap;
    font-family: -apple-system, system-ui, sans-serif;
  }
  .tt-label {
    font-size: 10px; font-weight: 500;
    color: rgba(255,255,255,0.42); margin-bottom: 4px;
  }
  .tt-val {
    font-size: 22px; font-weight: 700;
    letter-spacing: -0.5px; line-height: 1;
  }

  .range-text {
    font-family: -apple-system,system-ui,sans-serif;
    font-size: 14px; font-weight: 500; fill: rgba(255,255,255,.38);
  }
</style>

<div class="card ${st.key}">
  <div class="bg-glow"></div>

  <!-- frost crystals overlay -->
  <div class="frost-overlay">
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet">
      <path d="M0,0 Q20,30 0,62"  stroke="rgba(140,210,255,.28)" stroke-width="1.3" fill="none"/>
      <path d="M0,0 Q34,14 68,0"  stroke="rgba(140,210,255,.28)" stroke-width="1.3" fill="none"/>
      <path d="M0,0 Q28,28 48,48" stroke="rgba(140,210,255,.18)" stroke-width="1"   fill="none"/>
      <line x1="22" y1="22" x2="22" y2="42" stroke="rgba(170,230,255,.60)" stroke-width="1.3"/>
      <line x1="12" y1="32" x2="32" y2="32" stroke="rgba(170,230,255,.60)" stroke-width="1.3"/>
      <line x1="15" y1="25" x2="29" y2="39" stroke="rgba(170,230,255,.28)" stroke-width="1"/>
      <line x1="29" y1="25" x2="15" y2="39" stroke="rgba(170,230,255,.28)" stroke-width="1"/>
      <line x1="48" y1="11" x2="48" y2="25" stroke="rgba(170,230,255,.35)" stroke-width="1"/>
      <line x1="41" y1="18" x2="55" y2="18" stroke="rgba(170,230,255,.35)" stroke-width="1"/>
      <circle cx="8"  cy="8"  r="1.6" fill="rgba(210,245,255,.70)"/>
      <circle cx="30" cy="7"  r="1.1" fill="rgba(210,245,255,.50)"/>
      <circle cx="6"  cy="36" r="1.3" fill="rgba(210,245,255,.46)"/>
      <circle cx="50" cy="6"  r="1.0" fill="rgba(210,245,255,.40)"/>
      <circle cx="11" cy="55" r="1.1" fill="rgba(210,245,255,.34)"/>
    </svg>
  </div>

  <!-- fire heat shimmer -->
  <div class="fire-overlay">
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <defs>
        <radialGradient id="hr-${uid}" cx="50%" cy="100%" r="65%">
          <stop offset="0%"   stop-color="rgba(255,90,0,.22)"/>
          <stop offset="55%"  stop-color="rgba(200,40,0,.07)"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#hr-${uid})"/>
    </svg>
  </div>

  <!-- mirage heat strip (fire) — C proposal -->
  <div class="mirage-overlay"></div>

  <!-- ice crystal glow (frost) — Z proposal -->
  <div class="ice-glow-overlay"></div>

  ${batHTML}

  <!-- STATE LABEL: absolute top-center, lekki napis, nie przesuwa gauge -->
  <div class="state-label">${['comfort','offline'].includes(st.key) ? '' : st.label}</div>

  <!-- GAUGE -->
  <div class="gauge-wrap">
    <svg class="gauge-svg" viewBox="0 0 200 166" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tg-${uid}" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${st.arcG1}"/>
          <stop offset="100%" stop-color="${st.arcG0}"/>
        </linearGradient>
        <radialGradient id="cg-${uid}" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stop-color="${isOffline ? 'transparent' : st.arcG1 + '18'}"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
        <radialGradient id="sg-${uid}" cx="50%" cy="38%" r="58%">
          <stop offset="0%"   stop-color="rgba(255,70,0,0.30)"/>
          <stop offset="60%"  stop-color="rgba(200,20,0,0.10)"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
      </defs>

      <!-- ambient glow in center -->
      <circle cx="${CX}" cy="${CY}" r="${R2 - SW2/2 - 4}" fill="url(#cg-${uid})"/>

      <!-- death skull ☠️ — emoji przy ≥38°C -->
      ${isDeath ? `
      <text class="death-skull"
        x="${CX}" y="88"
        text-anchor="middle" dominant-baseline="central"
        font-size="72" style="font-family:-apple-system,system-ui,sans-serif">☠️</text>
      ` : ''}

      <!-- temperature value — wewnątrz wewnętrznego łuku, nad ikoną -->
      <text id="temp-hit" class="center-val"
        x="${CX}" y="${isDeath ? CY + 55 : CY}"
        text-anchor="middle" dominant-baseline="central"
        ${isDeath ? `style="font-size:26px;font-weight:700;fill:rgba(255,85,25,0.95)"` : ''}>${tempStr}</text>

      <!-- ══ TEMP ARC GROUP ══ -->
      <g id="g-temp" style="cursor:pointer">

        <circle class="arc-track-temp" cx="${CX}" cy="${CY}" r="${R1}"
          fill="none" stroke="rgba(255,255,255,0.055)" stroke-width="${SW1}"
          stroke-dasharray="${ARC1.toFixed(2)} ${C1.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"/>

        ${tempFillLen > 0.5 ? `
        <circle class="arc-temp-fill" cx="${CX}" cy="${CY}" r="${R1}"
          fill="none" stroke="url(#tg-${uid})" stroke-width="${SW1}"
          stroke-dasharray="${tempFillLen.toFixed(2)} ${C1.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"
          />
        ` : ''}

        <!-- hit area -->
        <circle cx="${CX}" cy="${CY}" r="${R1}"
          fill="none" stroke="rgba(255,255,255,0.004)" stroke-width="24"
          stroke-dasharray="${ARC1.toFixed(2)} ${C1.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"
          pointer-events="stroke"/>

      </g>

      <!-- ══ HUM ARC GROUP ══ -->
      <g id="g-hum" style="cursor:pointer">

        <circle class="arc-track-hum" cx="${CX}" cy="${CY}" r="${R2}"
          fill="none" stroke="rgba(255,255,255,0.038)" stroke-width="${SW2}"
          stroke-dasharray="${ARC2.toFixed(2)} ${C2.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"/>

        ${humFillLen > 0.5 ? `
        <circle class="arc-hum-fill" cx="${CX}" cy="${CY}" r="${R2}"
          fill="none" stroke="${humCol}" stroke-width="${SW2}"
          stroke-dasharray="${humFillLen.toFixed(2)} ${C2.toFixed(2)}"
          stroke-linecap="round" stroke-opacity="0.85"
          transform="rotate(135,${CX},${CY})"/>
        ` : ''}

        <!-- hit area -->
        <circle cx="${CX}" cy="${CY}" r="${R2}"
          fill="none" stroke="rgba(255,255,255,0.004)" stroke-width="18"
          stroke-dasharray="${ARC2.toFixed(2)} ${C2.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"
          pointer-events="stroke"/>

      </g>

      <!-- indicator dot -->
      ${!isOffline && tempFillLen > 3 ? `
      <circle class="dot-outer" cx="${dotX.toFixed(2)}" cy="${dotY.toFixed(2)}" r="5"
        fill="${st.arcG0}" opacity="0.85"/>
      <circle cx="${dotX.toFixed(2)}" cy="${dotY.toFixed(2)}" r="2.8"
        fill="rgba(255,255,255,0.95)"/>
      ` : ''}

      <!-- range labels — flanking the gap -->
      <text x="${(CX + LR * Math.cos(minA)).toFixed(1)}" y="${(CY + LR * Math.sin(minA) + 3).toFixed(1)}"
        text-anchor="end"   class="range-text">${fmtT(minT)}</text>
      <text x="${(CX + LR * Math.cos(maxA)).toFixed(1)}" y="${(CY + LR * Math.sin(maxA) + 3).toFixed(1)}"
        text-anchor="start" class="range-text">${fmtT(maxT)}</text>

    </svg>
  </div>

  <!-- ROOM NAME: HTML element at bottom -->
  <div class="room-name">${name}</div>
</div>

<!-- tooltips poza .card — nie są obcięte przez overflow:hidden, pozycjonowane względem :host -->
${_ttHtml('🌡️ Temperatura · ' + st.label, tempStr, st.tempColor, 'tt-temp')}
${_ttHtml('💧 Wilgotność · ' + (humZone || '—'), humStr, humCol, 'tt-hum')}`;

    /* click → more-info */
    this.shadowRoot.getElementById('g-temp')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true, detail: { entityId: cfg.temp_entity },
      }));
    });
    if (cfg.humidity_entity) {
      this.shadowRoot.getElementById('g-hum')?.addEventListener('click', e => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true, detail: { entityId: cfg.humidity_entity },
        }));
      });
    }
    this.shadowRoot.getElementById('temp-hit')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true, detail: { entityId: cfg.temp_entity },
      }));
    });

    /* hover focus mode — JS driven for shadow DOM reliability */
    {
      const gT  = this.shadowRoot.getElementById('g-temp');
      const gH  = this.shadowRoot.getElementById('g-hum');
      const ttT = this.shadowRoot.querySelector('.tt-temp');
      const ttH = this.shadowRoot.querySelector('.tt-hum');
      const cv  = this.shadowRoot.getElementById('temp-hit');
      const sl  = this.shadowRoot.querySelector('.state-label');
      const rn  = this.shadowRoot.querySelector('.room-name');

      const enter = (showTT, dimArc) => {
        if (showTT)  showTT.style.opacity  = '1';
        if (cv)      cv.style.opacity      = '0';
        if (dimArc)  dimArc.style.opacity  = '0.18';
        if (sl)      sl.style.opacity      = '0.28';
        if (rn)      rn.style.opacity      = '0.28';
      };
      const leave = () => {
        if (ttT) ttT.style.opacity = '0';
        if (ttH) ttH.style.opacity = '0';
        if (cv)  cv.style.opacity  = '1';
        if (gT)  gT.style.opacity  = '1';
        if (gH)  gH.style.opacity  = '1';
        if (sl)  sl.style.opacity  = '';
        if (rn)  rn.style.opacity  = '';
      };

      gT?.addEventListener('mouseenter', () => enter(ttT, gH));
      gT?.addEventListener('mouseleave', leave);
      gH?.addEventListener('mouseenter', () => enter(ttH, gT));
      gH?.addEventListener('mouseleave', leave);
    }
  }

  getCardSize() { return 3; }
}

customElements.define('aha-temp-gauge-card', AhaTempGaugeCard);
if (!customElements.get('temp-gauge-card'))
  customElements.define('temp-gauge-card', class extends AhaTempGaugeCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-temp-gauge-card',
  name:        'AHA Temp Gauge Card',
  preview:     false,
  description: 'Gauge temp+wilgotność. Hover = focus mode (dimuje resztę, tooltip). Apple Home glassmorphism.',
});
/**
 * kontaktron-card.js
 * Custom Lovelace card for binary sensors (contact sensors)
 * 
 * States:
 *   off  → closed (green)
 *   on   → open < threshold (yellow)
 *   on   → open ≥ threshold → ALARM (red, pulsing)
 *
 * Config options:
 *   entity:      (required) binary_sensor.*
 *   name:        (optional) override name
 *   icon_closed: (optional) MDI icon when closed,  default: mdi:lock
 *   icon_open:   (optional) MDI icon when open,    default: mdi:lock-open-outline
 *   icon_alarm:  (optional) MDI icon when alarm,   default: mdi:alert
 *   alarm_minutes: (optional) threshold in minutes, default: 10
 *
 * Usage:
 *   type: custom:kontaktron-card
 *   entity: binary_sensor.okno_salon
 *   name: Okno salon
 *   alarm_minutes: 10
 *
 * Registration:
 *   Copy this file to /config/www/kontaktron-card.js
 *   Add to resources:
 *     url: /local/kontaktron-card.js
 *     type: module
 */

const STYLES = `
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }

  @keyframes alarm-pulse {
    0%, 100% {
      background: #2c1410;
      box-shadow: 0 0 0 0 rgba(255,69,58,0),
                  0 2px 8px rgba(0,0,0,0.35);
    }
    50% {
      background: #3a1610;
      box-shadow: 0 0 0 5px rgba(255,69,58,0.28),
                  0 0 22px rgba(255,69,58,0.5),
                  0 2px 8px rgba(0,0,0,0.35);
    }
  }

  @keyframes ring-pulse {
    0%   { transform: scale(1);    opacity: 0.85; }
    70%  { transform: scale(1.6);  opacity: 0; }
    100% { transform: scale(1.6);  opacity: 0; }
  }

  @keyframes icon-shake {
    0%,100% { transform: rotate(0deg); }
    15%     { transform: rotate(-12deg); }
    30%     { transform: rotate(10deg); }
    45%     { transform: rotate(-8deg); }
    60%     { transform: rotate(6deg); }
    75%     { transform: rotate(-4deg); }
    90%     { transform: rotate(2deg); }
  }

  .card {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 20px;
    padding: 10px 10px 8px;
    display: flex;
    flex-direction: column;
    position: relative;
    cursor: pointer;
    transition: transform 0.15s ease, border-color 0.4s ease, background 0.4s ease;
    border: 1px solid rgba(255,255,255,0.06);
    box-sizing: border-box;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  .card:active {
    transform: scale(0.96);
  }

  /* ── STATE: closed (normal / inactive) ── */
  .card.closed {
    background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
  }
  .card.closed .glow {
    background: none;
  }

  /* ── STATE: open (below threshold) ── */
  .card.open {
    background: #252510;
    border-color: rgba(255,214,10,0.15);
  }
  .card.open .glow {
    background: radial-gradient(ellipse at 30% 30%, rgba(255,214,10,0.11) 0%, transparent 68%);
  }

  /* ── STATE: alarm ── */
  .card.alarm {
    border-color: rgba(255,69,58,0.3);
    animation: alarm-pulse 1.5s ease-in-out infinite;
  }
  .card.alarm .glow {
    background: radial-gradient(ellipse at 30% 30%, rgba(255,69,58,0.18) 0%, transparent 68%);
  }

  /* Glow overlay */
  .glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: 19px;
    transition: background 0.4s ease;
  }

  /* State label — top-center, identyczny styl jak temp-gauge-card */
  .state-label {
    position: absolute;
    top: 10px; left: 0; right: 0;
    z-index: 5;
    text-align: center;
    pointer-events: none;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: color 0.4s ease, opacity 0.4s ease;
  }
  .closed .state-label { opacity: 0; }
  .open   .state-label { color: rgba(255,214,10,0.90); }
  .alarm  .state-label { color: rgba(255,255,255,0.92); text-shadow: 0 0 8px rgba(200,30,0,0.70); }

  /* Icon area */
  .icon-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
  }

  .icon-wrap {
    position: relative;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-bg {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
    transition: background 0.4s ease;
  }
  .closed  .icon-bg { background: rgba(142,142,147,0.12); }
  .open    .icon-bg { background: rgba(255,214,10,0.18); }
  .alarm   .icon-bg { background: rgba(255,69,58,0.22); }

  .ring {
    position: absolute;
    width: 54px;
    height: 54px;
    border-radius: 16px;
    border: 2px solid rgba(255,69,58,0.75);
    z-index: 1;
    pointer-events: none;
    display: none;
  }
  .alarm .ring {
    display: block;
    animation: ring-pulse 1.5s ease-out infinite;
  }

  ha-icon {
    --mdc-icon-size: 28px;
    transition: color 0.4s ease;
  }
  .closed  ha-icon { color: #8e8e93; }
  .open    ha-icon { color: #ffd60a; }
  .alarm   ha-icon {
    color: #ff453a;
    animation: icon-shake 0.8s ease-in-out infinite;
    transform-origin: top center;
  }

  /* Duration — czas otwarcia, centered, kolorowany stanem */
  .duration {
    text-align: center;
    font-size: 10px;
    font-weight: 500;
    position: relative;
    z-index: 2;
    flex-shrink: 0;
    padding-bottom: 4px;
    transition: color 0.4s ease, font-weight 0.3s ease;
  }
  .closed .duration { display: none; }
  .open   .duration { color: rgba(255,214,10,0.65); }
  .alarm  .duration { color: #ff6b60; font-weight: 600; }

  /* Name — identyczny z .room-name w temp-gauge */
  .name {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.65);
    white-space: normal;
    word-break: break-word;
    padding-bottom: 4px;
    position: relative;
    z-index: 2;
    flex-shrink: 0;
  }

  /* ── battery ── */
  .bat-wrap {
    position: absolute; top: 9px; right: 10px; z-index: 12;
    display: flex; align-items: center; gap: 5px;
  }
  .bat-tip {
    font-size: 10px; font-weight: 600;
    color: rgba(255,255,255,.80);
    background: rgba(28,28,30,.92);
    border: .5px solid rgba(255,255,255,.15);
    border-radius: 6px; padding: 2px 6px;
    white-space: nowrap; opacity: 0; pointer-events: none;
    transition: opacity .15s; backdrop-filter: blur(8px);
  }
  .bat-wrap:hover .bat-tip { opacity: 1; }
  @media (max-width: 400px) { .bat-wrap { display: none; } }
`;

class KontaktronCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._intervalId = null;
  }

  /* ─── HA lifecycle ─────────────────────────────────── */

  set hass(hass) {
    this._hass = hass;
    if (!this._built) {
      this._build();
      this._built = true;
    }
    this._update();
  }

  setConfig(config) {
    if (!config.entity) throw new Error('kontaktron-card: brak pola "entity"');
    const iconClosed = config.icon_closed || 'mdi:lock';
    this._config = {
      alarm_minutes: 10,
      icon_alarm:    'mdi:bell-alert',
      ...config,
      icon_closed: iconClosed,
      // Jeśli icon_open nie podano → użyj icon_closed (garage zawsze ten sam icon)
      icon_open: config.icon_open || iconClosed,
    };
  }

  connectedCallback() {
    // Refresh duration text every 30 s
    this._intervalId = setInterval(() => this._update(), 30000);
  }

  disconnectedCallback() {
    clearInterval(this._intervalId);
  }

  /* ─── Build DOM (once) ──────────────────────────────── */

  _build() {
    const shadow = this.shadowRoot;

    const style = document.createElement('style');
    style.textContent = STYLES;
    shadow.appendChild(style);

    this._card = document.createElement('div');
    this._card.className = 'card closed';

    this._card.innerHTML = `
      <div class="glow"></div>
      <div class="state-label"></div>
      <div class="icon-area">
        <div class="icon-wrap">
          <div class="ring"></div>
          <div class="icon-bg">
            <ha-icon icon="mdi:lock"></ha-icon>
          </div>
        </div>
      </div>
      <div class="duration"></div>
      <div class="name">—</div>
    `;

    this._card.addEventListener('click', () => this._handleClick());

    shadow.appendChild(this._card);

    this._haIcon      = shadow.querySelector('ha-icon');
    this._nameEl      = shadow.querySelector('.name');
    this._stateEl     = shadow.querySelector('.state-label');
    this._durationEl  = shadow.querySelector('.duration');

    /* battery widget — created once, shown only if battery_entity configured */
    this._batWrap = document.createElement('div');
    this._batWrap.className = 'bat-wrap';
    this._batWrap.style.display = 'none';
    this._batWrap.innerHTML = `<div class="bat-tip"></div><svg width="18" height="9" viewBox="0 0 22 11"></svg>`;
    this._card.appendChild(this._batWrap);
    this._batTip = this._batWrap.querySelector('.bat-tip');
    this._batSvg = this._batWrap.querySelector('svg');
  }

  /* ─── Update on state change ─────────────────────────  */

  _update() {
    if (!this._hass || !this._config) return;

    const stateObj = this._hass.states[this._config.entity];
    if (!stateObj) {
      this._nameEl.textContent  = this._config.entity;
      this._stateEl.textContent = '';
      return;
    }

    const isOpen  = stateObj.state === 'on';
    const name    = this._config.name || stateObj.attributes.friendly_name || this._config.entity;
    const changed = new Date(stateObj.last_changed);
    const diffMin = Math.floor((Date.now() - changed.getTime()) / 60000);
    const isAlarm = isOpen && diffMin >= this._config.alarm_minutes;

    let stateClass, icon, stateText, durationText;

    if (!isOpen) {
      stateClass   = 'closed';
      icon         = this._config.icon_closed;
      stateText    = '';
      durationText = '';
    } else if (!isAlarm) {
      stateClass   = 'open';
      icon         = this._config.icon_open;
      stateText    = 'otwarte';
      durationText = this._formatDuration(diffMin);
    } else {
      stateClass   = 'alarm';
      icon         = this._config.icon_alarm;
      stateText    = 'alarm';
      durationText = this._formatDuration(diffMin);
    }

    this._card.className          = `card ${stateClass}`;
    this._haIcon.setAttribute('icon', icon);
    this._nameEl.textContent      = name;
    this._stateEl.textContent     = stateText;
    this._durationEl.textContent  = durationText;
    this._updateBattery();
  }

  _updateBattery() {
    const entity = this._config.battery_entity;
    if (!entity) { this._batWrap.style.display = 'none'; return; }
    const s = this._hass.states[entity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') {
      this._batWrap.style.display = 'none';
      return;
    }
    const pct     = parseFloat(s.state);
    if (pct >= 25) { this._batWrap.style.display = 'none'; return; }
    const low     = pct < 20;
    const col     = low ? '#FF453A' : 'rgba(255,255,255,0.42)';
    const fillCol = low ? '#FF453A' : 'rgba(255,255,255,0.50)';
    const fillW   = Math.round((Math.max(0, Math.min(100, pct)) / 100) * 13);
    this._batTip.textContent = Math.round(pct) + '%';
    this._batSvg.innerHTML = `
      <rect x="0.5" y="0.5" width="17" height="10" rx="2.5"
            fill="none" stroke="${col}" stroke-width="1.1"/>
      <rect x="18" y="3.5" width="2.5" height="4" rx="1" fill="${col}" opacity="0.7"/>
      ${fillW > 0 ? `<rect x="2" y="2" width="${fillW}" height="6" rx="1.5" fill="${fillCol}"/>` : ''}`;
    this._batWrap.style.display = '';
  }

  /* ─── Helpers ───────────────────────────────────────── */

  _formatDuration(minutes) {
    if (minutes < 1)   return 'przed chwilą';
    if (minutes < 60)  return `od ${minutes} min`;
    const h = Math.floor(minutes / 60);
    if (h < 24) {
      const m = minutes % 60;
      return m === 0 ? `od ${h}h` : `od ${h}h ${m}min`;
    }
    const d  = Math.floor(h / 24);
    const hr = h % 24;
    return hr === 0 ? `od ${d}d` : `od ${d}d ${hr}h`;
  }

  _handleClick() {
    const event = new Event('hass-more-info', { bubbles: true, composed: true });
    event.detail = { entityId: this._config.entity };
    this.dispatchEvent(event);
  }

  /* ─── Card size hint for layout ─────────────────────── */

  getCardSize() { return 2; }

  static getConfigElement() {
    // Visual config editor — stub (wystarczy YAML)
    return document.createElement('div');
  }

  static getStubConfig() {
    return {
      entity:         'binary_sensor.example',
      battery_entity: '',
      name:           'Okno salon',
      alarm_minutes:  10,
    };
  }
}

customElements.define('aha-kontaktron-card', KontaktronCard);
if (!customElements.get('kontaktron-card'))
  customElements.define('kontaktron-card', class extends KontaktronCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-kontaktron-card',
  name:        'Kontaktron Card',
  description: 'Karta dla czujnika otwarcia z animowanym alarmem po przekroczeniu czasu',
  preview:     true,
});/**
 * kosiarka-card.js  v2.0
 * Karta lawn_mower — dwa tryby: slim (domyślny) i verbose.
 * Jeden plik, jedna klasa, aliasy rejestrowane w kosiarka-slim-card.js.
 *
 * Config:
 *   entity:                (required) lawn_mower.*
 *   name:                  (optional)
 *   battery_entity:        (optional) sensor.*
 *   party_mode_entity:     (optional) switch.*
 *   error_entity:          (optional) sensor.*
 *   daily_progress_entity: (optional) sensor.*
 *   rain_entity:           (optional) binary_sensor.*
 *   next_schedule_entity:  (optional) sensor.*
 *   lawn_size_entity:      (optional) number.*
 *   edge_entity:           (optional) switch.*
 *   blade_runtime_entity:  (optional) sensor.*
 *   blade_warn_days:       (optional) default 90
 *   blade_reset_entity:    (optional) button.* — przycisk reset licznika noży
 */

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const KOS_ACCENT = {
  mowing:    '#97C459',
  returning: '#85B7EB',
  docking:   '#85B7EB',
  charging:  '#EF9F27',
  paused:    '#EF9F27',
  docked:    '#5F5E5A',
  idle:      '#5F5E5A',
  error:     '#E24B4A',
};

const KOS_LABEL = {
  mowing:      'kosi',
  returning:   'wraca',
  docking:     'wraca',
  charging:    'ładuje się',
  paused:      'pauza',
  docked:      'w bazie',
  idle:        'czeka',
  error:       'błąd',
  unknown:     'nieznany',
  unavailable: 'niedostępna',
};

const KOS_PULSE_ANIM = {
  mowing:    'kos-pulse-green  2.4s ease-in-out infinite',
  returning: 'kos-pulse-blue   2.4s ease-in-out infinite',
  docking:   'kos-pulse-blue   2.4s ease-in-out infinite',
  charging:  'kos-pulse-orange 2.8s ease-in-out infinite',
  paused:    'kos-pulse-orange 2.8s ease-in-out infinite',
  error:     'kos-pulse-red    2.0s ease-in-out infinite',
};

// ─────────────────────────────────────────────
// SVG icons (22×22, styl identyczny z vacuum)
// ─────────────────────────────────────────────

function kosSvgMowing() {
  const c = '#97C459';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"
      style="flex-shrink:0;animation:kos-mow 1.8s ease-in-out infinite;">
    <rect x="2" y="8" width="18" height="9" rx="3" stroke="${c}" stroke-width="1.4"/>
    <circle cx="6" cy="17" r="2.2" fill="none" stroke="${c}" stroke-width="1.2"/>
    <circle cx="16" cy="17" r="2.2" fill="none" stroke="${c}" stroke-width="1.2"/>
    <path d="M8.5 8 V6 a2.5 2.5 0 0 1 5 0 V8" stroke="${c}" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M2 13 Q5 12 8 13" stroke="${c}" stroke-width="0.9" stroke-opacity="0.5" fill="none"/>
  </svg>`;
}

function kosSvgReturning() {
  const c = '#85B7EB';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"
      style="flex-shrink:0;animation:kos-ret 1.3s ease-in-out infinite alternate;">
    <rect x="2" y="8" width="18" height="9" rx="3" stroke="${c}" stroke-width="1.4"/>
    <circle cx="6" cy="17" r="2.2" fill="none" stroke="${c}" stroke-width="1.2"/>
    <circle cx="16" cy="17" r="2.2" fill="none" stroke="${c}" stroke-width="1.2"/>
    <path d="M13 5 L9 8 L13 11" stroke="${c}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function kosSvgCharging() {
  const c = '#EF9F27';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"
      style="flex-shrink:0;animation:kos-charge 1.6s ease-in-out infinite;">
    <rect x="2" y="8" width="18" height="9" rx="3" stroke="${c}" stroke-width="1.4"/>
    <circle cx="6" cy="17" r="2.2" fill="none" stroke="${c}" stroke-width="1.2"/>
    <circle cx="16" cy="17" r="2.2" fill="none" stroke="${c}" stroke-width="1.2"/>
    <path d="M12 8.5 L9.5 12 L11.5 12 L10 15.5" stroke="${c}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function kosSvgDocked() {
  const c = '#5F5E5A';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <rect x="2" y="8" width="18" height="9" rx="3" stroke="${c}" stroke-width="1.4"/>
    <circle cx="6" cy="17" r="2.2" fill="none" stroke="${c}" stroke-width="1.2"/>
    <circle cx="16" cy="17" r="2.2" fill="none" stroke="${c}" stroke-width="1.2"/>
    <circle cx="11" cy="12.5" r="1.8" fill="#97C459"/>
  </svg>`;
}

function kosSvgPaused() {
  const c = '#EF9F27';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <rect x="7" y="5" width="2.5" height="12" rx="1.2" fill="${c}"/>
    <rect x="12.5" y="5" width="2.5" height="12" rx="1.2" fill="${c}"/>
  </svg>`;
}

function kosSvgError() {
  const c = '#E24B4A';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <circle cx="11" cy="11" r="8" stroke="${c}" stroke-width="1.4"/>
    <path d="M11 6.5 L11 12" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="11" cy="15" r="1" fill="${c}"/>
  </svg>`;
}

function kosSvgEdge() {
  const c = '#E24B4A';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"
      style="flex-shrink:0;animation:kos-mow 1.8s ease-in-out infinite;">
    <rect x="2" y="8" width="18" height="9" rx="3" stroke="${c}" stroke-width="1.4"/>
    <circle cx="6" cy="17" r="2.2" fill="none" stroke="${c}" stroke-width="1.2"/>
    <circle cx="16" cy="17" r="2.2" fill="none" stroke="${c}" stroke-width="1.2"/>
    <rect x="1" y="1" width="20" height="20" rx="3" stroke="${c}" stroke-width="0.9" stroke-dasharray="3 2" fill="none"/>
  </svg>`;
}

function kosSvgIdle() {
  const c = '#888780';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <circle cx="11" cy="11" r="7" stroke="${c}" stroke-width="1.4"/>
    <circle cx="11" cy="11" r="2.5" fill="${c}"/>
  </svg>`;
}

function kosSvgParty() {
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <rect x="2" y="8" width="18" height="9" rx="3" stroke="#EF9F27" stroke-width="1.4"/>
    <circle cx="6" cy="17" r="2.2" fill="none" stroke="#EF9F27" stroke-width="1.2"/>
    <circle cx="16" cy="17" r="2.2" fill="none" stroke="#EF9F27" stroke-width="1.2"/>
    <path d="M11 3.5 L12.2 6.5 L9.8 6.5 Z" fill="#E24B4A"/>
    <circle cx="11" cy="3" r="0.8" fill="#EF9F27"/>
    <path d="M7.5 5.5 L9 7.5" stroke="#97C459" stroke-width="1" stroke-linecap="round"/>
    <path d="M14.5 5.5 L13 7.5" stroke="#85B7EB" stroke-width="1" stroke-linecap="round"/>
  </svg>`;
}

function kosSvgToggleExpand() {
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.2"/>
    <line x1="5" y1="9" x2="13" y2="9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="9" y1="5" x2="9"  y2="13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`;
}

function kosSvgToggleCollapse() {
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.2"/>
    <line x1="5" y1="9" x2="13" y2="9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`;
}

function kosGetIcon(state, isEdge, partyMode) {
  if (partyMode && state === 'docked') return kosSvgParty();
  if (isEdge)                          return kosSvgEdge();
  switch (state) {
    case 'mowing':    return kosSvgMowing();
    case 'returning':
    case 'docking':   return kosSvgReturning();
    case 'charging':  return kosSvgCharging();
    case 'paused':    return kosSvgPaused();
    case 'error':     return kosSvgError();
    case 'docked':    return kosSvgDocked();
    default:          return kosSvgIdle();
  }
}

function kosFmtBlade(d) {
  return d < 14 ? `${d}d` : d < 60 ? `${Math.round(d/7)}tyg.` : `${Math.round(d/30)}mies.`;
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const KOS_STYLES = `
  :host { display: block; width: 100%; }
  * { box-sizing: border-box; }

  @keyframes kos-pulse-green {
    0%, 100% { box-shadow: 0 0 0 0   rgba(151,196,89,0.0); }
    50%       { box-shadow: 0 0 0 5px rgba(151,196,89,0.18); }
  }
  @keyframes kos-pulse-blue {
    0%, 100% { box-shadow: 0 0 0 0   rgba(133,183,235,0.0); }
    50%       { box-shadow: 0 0 0 5px rgba(133,183,235,0.18); }
  }
  @keyframes kos-pulse-orange {
    0%, 100% { box-shadow: 0 0 0 0   rgba(239,159,39,0.0); }
    50%       { box-shadow: 0 0 0 5px rgba(239,159,39,0.18); }
  }
  @keyframes kos-pulse-red {
    0%, 100% { box-shadow: 0 0 0 0   rgba(226,75,74,0.0); }
    50%       { box-shadow: 0 0 0 5px rgba(226,75,74,0.18); }
  }
  @keyframes kos-dot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.2; }
  }
  @keyframes kos-mow {
    0%, 100% { transform: translateX(0) rotate(-1deg); }
    50%       { transform: translateX(2px) rotate(1deg); }
  }
  @keyframes kos-ret {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-3px); }
  }
  @keyframes kos-charge {
    0%, 100% { filter: drop-shadow(0 0 0px  rgba(239,159,39,0)); }
    50%       { filter: drop-shadow(0 0 5px  rgba(239,159,39,0.55)); }
  }

  .card {
    background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
    border-radius: 16px;
    font-family: -apple-system, system-ui, sans-serif;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    transition: border-color 0.4s ease, background 0.4s ease;
  }
  .card.slim    { border: 0.5px solid rgba(255,255,255,0.08); }
  .card.verbose { border: 1px solid rgba(255,255,255,0.08); }
  .card:active  { transform: scale(0.97); transition: transform 0.12s ease; }

  .toggle-btn {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; opacity: 0.3;
    cursor: pointer; color: #F1EFE8; flex-shrink: 0;
    transition: opacity 0.15s ease;
    -webkit-tap-highlight-color: transparent;
    border: none; background: none; padding: 0;
  }
  .toggle-btn:hover  { opacity: 0.65; }
  .toggle-btn:active { transform: scale(0.92); }

  .ctrl-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 500; font-family: -apple-system, system-ui, sans-serif;
    color: rgba(255,255,255,0.60);
    background: rgba(255,255,255,0.07);
    border: 0.5px solid rgba(255,255,255,0.12);
    border-radius: 8px; padding: 6px 10px;
    cursor: pointer; flex-shrink: 0;
    transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .ctrl-btn:hover  { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.85); }
  .ctrl-btn:active { transform: scale(0.95); }

  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 99px;
    font-size: 10px; font-weight: 600; white-space: nowrap; flex-shrink: 0;
  }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .badge-dot.pulse { animation: kos-dot 1.8s ease-in-out infinite; }

  .sep     { height: 1px; background: rgba(255,255,255,0.05); }
  .section { padding: 12px 14px; }

  .header-row  { display: flex; align-items: center; gap: 8px; }
  .header-text { flex: 1; min-width: 0; }
  .header-name {
    font-size: 14px; font-weight: 600; color: #F1EFE8;
    text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .header-sub {
    font-size: 11px; color: #888780; margin-top: 1px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center;
  }

  .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; }
  .stat-item  {
    display: flex; flex-direction: column; gap: 3px;
    padding: 8px 10px; background: rgba(255,255,255,0.04); border-radius: 10px;
  }
  .stat-label { font-size: 10px; color: rgba(255,255,255,0.35); }
  .stat-value { font-size: 14px; font-weight: 600; color: #F1EFE8; line-height: 1; }

  .bar-row   { display: flex; flex-direction: column; gap: 8px; }
  .bar-item  { display: flex; flex-direction: column; gap: 5px; }
  .bar-header{ display: flex; justify-content: space-between; align-items: center; }
  .bar-label { font-size: 10px; color: rgba(255,255,255,0.35); }
  .bar-value { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.60); }
  .bar-track { height: 3px; background: rgba(255,255,255,0.07); border-radius: 99px; overflow: hidden; }
  .bar-fill  { height: 100%; border-radius: 99px; transition: width 1s ease; }

  .chips-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .chip {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 500; padding: 4px 10px;
    border-radius: 8px; white-space: nowrap;
  }

  .error-box {
    display: flex; align-items: flex-start; gap: 10px;
    background: rgba(226,75,74,0.08); border-radius: 10px;
    padding: 10px; border: 0.5px solid rgba(226,75,74,0.20);
  }
  .err-icon  { flex-shrink: 0; margin-top: 1px; }
  .err-title { font-size: 12px; font-weight: 600; color: #E24B4A; margin-bottom: 2px; }
  .err-desc  { font-size: 11px; color: rgba(255,255,255,0.55); }
`;

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

class KosiarkaCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._mode    = 'slim';
    this._hass    = null;
    this._config  = null;
    this._lastSig = null;
  }

  setConfig(config) {
    if (!config.entity) throw new Error('kosiarka-card: wymagane pole "entity"');
    this._config = {
      entity:                config.entity,
      name:                  config.name || null,
      battery_entity:        config.battery_entity        || null,
      party_mode_entity:     config.party_mode_entity     || null,
      error_entity:          config.error_entity          || null,
      daily_progress_entity: config.daily_progress_entity || null,
      rain_entity:           config.rain_entity           || null,
      next_schedule_entity:  config.next_schedule_entity  || null,
      lawn_size_entity:      config.lawn_size_entity      || null,
      edge_entity:           config.edge_entity           || null,
      blade_runtime_entity:  config.blade_runtime_entity  || null,
      blade_warn_days:       config.blade_warn_days       || 90,
      blade_reset_entity:    config.blade_reset_entity    || null,
    };
  }

  set hass(hass) {
    this._hass = hass;
    const sig = this._getStateSig();
    if (sig === this._lastSig) return;
    this._lastSig = sig;
    this._renderCard();
  }

  _toggleMode() {
    this._mode = this._mode === 'slim' ? 'verbose' : 'slim';
    this._lastSig = null; // force re-render
    this._renderCard();
  }

  _getStateSig() {
    const h = this._hass, c = this._config;
    const e = h.states[c.entity];
    return [
      this._mode, e?.state, e?.last_changed,
      c.battery_entity        ? h.states[c.battery_entity]?.state        : '',
      c.party_mode_entity     ? h.states[c.party_mode_entity]?.state     : '',
      c.error_entity          ? h.states[c.error_entity]?.state          : '',
      c.daily_progress_entity ? h.states[c.daily_progress_entity]?.state : '',
      c.rain_entity           ? h.states[c.rain_entity]?.state           : '',
      c.next_schedule_entity  ? h.states[c.next_schedule_entity]?.state  : '',
      c.edge_entity           ? h.states[c.edge_entity]?.state           : '',
      c.blade_runtime_entity  ? h.states[c.blade_runtime_entity]?.state  : '',
    ].join('|');
  }

  // ── Data gathering ───────────────────────────

  _getData() {
    const hass = this._hass, cfg = this._config;
    const stateObj = hass.states[cfg.entity];
    const name = cfg.name || stateObj?.attributes?.friendly_name || cfg.entity;

    if (!stateObj) return { name, unavailable: true, state: 'unavailable' };

    const state = stateObj.state || 'unknown';
    const attrs = stateObj.attributes || {};

    // Battery
    let battery = attrs.battery_level ?? attrs.battery ?? null;
    if (cfg.battery_entity) {
      const bs = hass.states[cfg.battery_entity];
      if (bs && bs.state !== 'unavailable' && bs.state !== 'unknown') {
        const v = parseFloat(bs.state); if (!isNaN(v)) battery = v;
      }
    }
    const batPct = battery !== null ? Math.round(battery) : null;

    // Error
    const _noErr = new Set(['unavailable','unknown','0','none','no_error','ok','']);
    let error = attrs.error ?? attrs.error_description ?? null;
    if (cfg.error_entity) {
      const es = hass.states[cfg.error_entity];
      if (es && !_noErr.has(es.state)) error = es.state;
    }

    // Party mode
    let partyMode = false;
    if (cfg.party_mode_entity) {
      const ps = hass.states[cfg.party_mode_entity];
      if (ps) partyMode = ps.state === 'on';
    }

    // Edge cut
    let isEdge = false;
    if (cfg.edge_entity) {
      const ee = hass.states[cfg.edge_entity];
      if (ee) isEdge = ee.state === 'on';
    }
    if (!isEdge) {
      const act = (attrs.activity ?? attrs.status_description ?? '').toLowerCase();
      isEdge = act.includes('edge') || act.includes('border');
    }

    // Daily progress
    let dailyProgress = null;
    if (cfg.daily_progress_entity) {
      const dp = hass.states[cfg.daily_progress_entity];
      if (dp && dp.state !== 'unavailable' && dp.state !== 'unknown') {
        const v = parseFloat(dp.state);
        if (!isNaN(v)) dailyProgress = Math.min(100, Math.round(v));
      }
    }

    // Rain
    let isRaining = false;
    if (cfg.rain_entity) {
      const rs = hass.states[cfg.rain_entity];
      if (rs) isRaining = rs.state === 'on';
    }

    // Next schedule
    let nextSchedule = null;
    if (cfg.next_schedule_entity) {
      const ns = hass.states[cfg.next_schedule_entity];
      if (ns && ns.state !== 'unavailable' && ns.state !== 'unknown') {
        try {
          const d = new Date(ns.state);
          const diffH = Math.round((d - new Date()) / 36e5);
          if (diffH >= 0 && diffH < 48)
            nextSchedule = diffH < 1 ? 'za chwilę'
                         : diffH < 24 ? `za ${diffH}h`
                         : `jutro ${d.toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'})}`;
        } catch(e) {}
      }
    }

    // Blade runtime
    let bladeDays = null;
    if (cfg.blade_runtime_entity) {
      const br = hass.states[cfg.blade_runtime_entity];
      if (br && br.state !== 'unavailable' && br.state !== 'unknown') {
        try {
          const d = Math.floor((Date.now() - new Date(br.state).getTime()) / 86400000);
          if (!isNaN(d) && d >= 0) bladeDays = d;
        } catch(e) {}
      }
    }
    const bladeWarnDays = cfg.blade_warn_days;
    const bladeLabel    = bladeDays !== null ? kosFmtBlade(bladeDays) : null;
    const bladeWarn     = bladeDays !== null && bladeDays >= bladeWarnDays;
    const bladePre      = bladeDays !== null && bladeDays >= bladeWarnDays * 0.75 && !bladeWarn;

    const isMowing    = state === 'mowing';
    const isReturning = state === 'returning' || state === 'docking';
    const isCharging  = state === 'charging';
    const isDocked    = state === 'docked';
    const isPaused    = state === 'paused';
    const isError     = state === 'error';
    const isActive    = isMowing || isReturning;

    const accent     = isEdge ? '#E24B4A' : (KOS_ACCENT[state] || '#5F5E5A');
    const stateLabel = isEdge ? 'krawędź' : (KOS_LABEL[state] || state);
    const zone       = attrs.zone ?? attrs.current_zone ?? null;

    return {
      name, state, attrs, accent, stateLabel,
      batPct, error,
      partyMode, isEdge, isRaining,
      dailyProgress, nextSchedule,
      bladeDays, bladeLabel, bladeWarn, bladePre,
      zone,
      isMowing, isReturning, isCharging, isDocked, isPaused, isError, isActive,
      unavailable: false,
    };
  }

  _getBatColors(batPct, isDocked) {
    if (batPct === null) return { col: '#5F5E5A', grad: 'rgba(255,255,255,0.08)' };
    if (isDocked) {
      const col  = batPct > 90 ? '#7A8A75' : batPct > 60 ? '#6B7A68' : batPct > 30 ? '#8A7A60' : '#8A6A60';
      const grad = batPct > 60 ? 'linear-gradient(90deg,#5A6356,#7A8A75)'
                 : batPct > 30 ? 'linear-gradient(90deg,#6A5A40,#8A7A60)'
                 :               'linear-gradient(90deg,#6A4A40,#8A6A60)';
      return { col, grad };
    }
    const col  = batPct > 50 ? '#97C459' : batPct > 20 ? '#EF9F27' : '#E24B4A';
    const grad = batPct > 50 ? 'linear-gradient(90deg,#5F8932,#97C459)'
               : batPct > 20 ? 'linear-gradient(90deg,#9A5230,#EF9F27)'
               :               'linear-gradient(90deg,#8F2320,#E24B4A)';
    return { col, grad };
  }

  // ── Slim card ────────────────────────────────

  _renderSlim(d) {
    const { name, state, accent, stateLabel, batPct,
            partyMode, isEdge, isRaining,
            bladeDays, bladeLabel, bladeWarn, bladePre,
            zone, isMowing, isReturning, isCharging,
            isDocked, isPaused, isError, isActive,
            dailyProgress, error } = d;

    const { col: batColor, grad: barGrad } = this._getBatColors(batPct, isDocked);

    const pulseAnim = isEdge ? KOS_PULSE_ANIM.error : KOS_PULSE_ANIM[state];
    const borderStyle = pulseAnim
      ? `border:1px solid ${accent}47;animation:${pulseAnim};`
      : 'border:0.5px solid rgba(255,255,255,0.08);';

    const icon = kosGetIcon(state, isEdge, partyMode);

    // Badge
    const badgeLabel  = isEdge ? 'krawędź' : stateLabel;
    const isActiveBadge = isActive || isEdge || isError || isCharging || isPaused;
    const badgeBg = isActiveBadge
      ? `background:${accent}22;color:${accent};`
      : `background:rgba(95,94,90,0.12);color:${accent};`;

    // Chips
    const chips = [];
    if (zone !== null && isActive)
      chips.push(`<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;background:${accent}1a;color:${accent};">strefa ${zone}</span>`);
    if (partyMode)
      chips.push(`<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;background:rgba(239,159,39,0.12);color:#EF9F27;">party 🎉</span>`);
    if (isRaining)
      chips.push(`<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;background:rgba(133,183,235,0.12);color:#85B7EB;">deszcz</span>`);
    if (bladeWarn)
      chips.push(`<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;background:rgba(226,75,74,0.12);color:#E24B4A;"><span style="width:5px;height:5px;border-radius:50%;background:#E24B4A;animation:kos-dot 1.8s ease-in-out infinite;flex-shrink:0;display:inline-block;"></span>noże: ${bladeLabel}</span>`);
    else if (bladePre)
      chips.push(`<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;background:rgba(239,159,39,0.10);color:#EF9F27;">noże: ${bladeLabel}</span>`);
    if (isError && error)
      chips.push(`<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;background:rgba(226,75,74,0.12);color:#E24B4A;"><span style="width:5px;height:5px;border-radius:50%;background:#E24B4A;animation:kos-dot 1.8s ease-in-out infinite;flex-shrink:0;display:inline-block;"></span>${error}</span>`);

    const chipsRow = chips.length > 0
      ? `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">${chips.join('')}</div>` : '';

    // Progress bar
    const barShowsDaily = dailyProgress !== null && (isMowing || isReturning || (isDocked && dailyProgress < 100));
    const barPct   = barShowsDaily ? dailyProgress : batPct;
    const barLabel = barShowsDaily
      ? (isMowing ? 'postęp dzienny' : isReturning ? 'wraca' : 'plan dnia')
      : (isCharging ? 'ładuje się' : isMowing ? 'kosi' : isReturning ? 'wraca' : 'bateria');
    const barRight = barPct !== null ? `${barPct}%` : '';
    const barGradFinal = barShowsDaily ? `linear-gradient(90deg,${accent}88,${accent})` : barGrad;

    // Right column
    const rightVal   = batPct !== null ? `${batPct}%` : '—';
    const rightLabel = isCharging ? 'ładuje się' : isMowing ? 'kosi' : isReturning ? 'wraca' : isDocked ? 'w bazie' : 'bateria';

    return `
      <div class="card slim" style="${borderStyle}">
        <div style="display:grid;grid-template-columns:4px 1fr auto;gap:0 14px;
                    align-items:stretch;padding:14px 16px;
                    font-family:-apple-system,system-ui,sans-serif;">

          <div style="width:4px;border-radius:16px 0 0 16px;background:${accent};align-self:stretch;"></div>

          <div style="display:flex;flex-direction:column;gap:8px;min-width:0;">

            <div style="display:flex;align-items:center;gap:8px;">
              ${icon}
              <span style="font-size:13px;font-weight:500;color:#F1EFE8;flex:1;min-width:0;
                           overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span>
              <span class="badge" style="${badgeBg}">
                <span class="badge-dot ${isActiveBadge ? 'pulse' : ''}" style="background:${accent};"></span>
                ${badgeLabel}
              </span>
            </div>

            ${chipsRow}

            ${barPct !== null ? `
            <div style="display:flex;flex-direction:column;gap:4px;">
              <div style="height:3px;border-radius:99px;background:rgba(255,255,255,0.07);overflow:hidden;">
                <div style="height:100%;width:${barPct}%;border-radius:99px;
                            background:${barGradFinal};transition:width 1s ease;"></div>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="font-size:10px;color:rgba(255,255,255,0.28);">${barLabel}</span>
                <span style="font-size:10px;color:rgba(255,255,255,0.28);">${barRight}</span>
              </div>
            </div>` : ''}

          </div>

          <div style="display:flex;align-items:center;gap:6px;">
            <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:center;
                        gap:2px;min-width:52px;">
              <span style="font-size:20px;font-weight:600;letter-spacing:-0.5px;line-height:1;
                           color:${batColor};">${rightVal}</span>
              <span style="font-size:10px;color:rgba(255,255,255,0.28);white-space:nowrap;">${rightLabel}</span>
            </div>
            <button class="toggle-btn" title="Rozwiń">${kosSvgToggleExpand()}</button>
          </div>

        </div>
      </div>`;
  }

  // ── Verbose card ─────────────────────────────

  _renderVerbose(d) {
    const { name, state, accent, stateLabel, batPct,
            partyMode, isEdge, isRaining, nextSchedule,
            isActive, isCharging, isError, isPaused, isDocked,
            isMowing, isReturning, error } = d;

    const pulseAnim   = isEdge ? KOS_PULSE_ANIM.error : KOS_PULSE_ANIM[state];
    const borderStyle = pulseAnim
      ? `border:1px solid ${accent}47;animation:${pulseAnim};`
      : 'border:1px solid rgba(255,255,255,0.08);';

    const icon = kosGetIcon(state, isEdge, partyMode);

    const badgeLabel    = isEdge ? 'krawędź' : stateLabel;
    const isActiveBadge = isActive || isEdge || isError || isCharging || isPaused;
    const badgeBg = isActiveBadge
      ? `background:${accent}22;color:${accent};`
      : `background:rgba(95,94,90,0.12);color:${accent};`;

    const subParts = [];
    if (isRaining) subParts.push('deszcz');
    if (nextSchedule && !isActive) subParts.push(nextSchedule);
    const subTitle = subParts.join(' · ');

    const sections = [];

    // Section 1: Header
    sections.push(`
      <div class="section">
        <div class="header-row">
          <div style="flex-shrink:0;display:flex;align-items:center;">${icon}</div>
          <div class="header-text">
            <div class="header-name">${name}</div>
            ${subTitle ? `<div class="header-sub">${subTitle}</div>` : ''}
          </div>
          <span class="badge" style="${badgeBg}">
            <span class="badge-dot ${isActiveBadge ? 'pulse' : ''}" style="background:${accent};"></span>
            ${badgeLabel}
          </span>
          <button class="toggle-btn" title="Zwiń">${kosSvgToggleCollapse()}</button>
        </div>
      </div>`);

    // Section 2: Stats
    sections.push('<div class="sep"></div>');
    sections.push(`<div class="section">${this._renderStats(d)}</div>`);

    // Section 3: Bars
    sections.push('<div class="sep"></div>');
    sections.push(`<div class="section">${this._renderBars(d)}</div>`);

    // Section 4: Chips (optional)
    const chipsHtml = this._renderChips(d);
    if (chipsHtml) {
      sections.push('<div class="sep"></div>');
      sections.push(`<div class="section">${chipsHtml}</div>`);
    }

    // Section 5: Controls (party mode + blade reset)
    const hasParty = !!this._config.party_mode_entity;
    const hasBlade = !!this._config.blade_reset_entity;
    if (hasParty || hasBlade) {
      const { bladeDays, bladeLabel, bladeWarn, bladePre } = d;
      const bladeCol = bladeWarn ? '#E24B4A' : bladePre ? '#EF9F27' : 'rgba(255,255,255,0.45)';
      const bladeInfo = bladeDays !== null ? `<span style="font-size:11px;color:${bladeCol};font-variant-numeric:tabular-nums;">${bladeLabel}</span>` : '';

      const partyOn = partyMode;
      const partyBtnStyle = partyOn
        ? 'background:rgba(239,159,39,0.18);color:#EF9F27;border-color:rgba(239,159,39,0.35);'
        : '';

      const btns = [];
      if (hasParty) btns.push(`
        <button class="ctrl-btn party-toggle-btn" style="${partyBtnStyle}" title="Party mode">
          🎉 Party${partyOn ? ' ON' : ''}
        </button>`);
      if (hasBlade) btns.push(`
        <button class="ctrl-btn blade-reset-btn" title="Reset licznika noży">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
          </svg>
          Reset noży
        </button>`);

      sections.push('<div class="sep"></div>');
      sections.push(`
        <div class="section" style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          ${hasBlade ? `<div style="display:flex;flex-direction:column;gap:2px;">
            <span style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.4px;">Noże — przebieg</span>
            ${bladeInfo}
          </div>` : '<div></div>'}
          <div style="display:flex;gap:8px;">${btns.join('')}</div>
        </div>`);
    }

    // Section 6: Error (optional)
    if (isError && error) {
      sections.push('<div class="sep"></div>');
      sections.push(`
        <div class="section">
          <div class="error-box">
            <div class="err-icon">${kosSvgError()}</div>
            <div>
              <div class="err-title">Błąd kosiarski</div>
              <div class="err-desc">${error}</div>
            </div>
          </div>
        </div>`);
    }


    return `<div class="card verbose" style="${borderStyle}">${sections.join('')}</div>`;
  }

  _renderStats(d) {
    const { batPct, stateLabel, accent, zone,
            dailyProgress, nextSchedule, bladeDays,
            isMowing, isReturning, isDocked } = d;
    const { col: batColor } = this._getBatColors(batPct, isDocked);
    const bladeWarnDays = this._config.blade_warn_days;

    const items = [
      { label: 'Bateria', value: batPct !== null ? `${batPct}%` : '—', col: batColor },
      { label: 'Stan',    value: stateLabel,                             col: accent  },
    ];

    // Row 1 third cell — most contextual
    if (zone !== null && (isMowing || isReturning))
      items.push({ label: 'Strefa', value: `${zone}`, col: accent });
    else if (dailyProgress !== null)
      items.push({ label: 'Postęp', value: `${dailyProgress}%`, col: '#97C459' });
    else if (nextSchedule)
      items.push({ label: 'Plan', value: nextSchedule, col: '#85B7EB' });
    else
      items.push({ label: '', value: '', col: '' });

    // Row 2 — blade + plan (if not already shown)
    const row2 = [];
    if (bladeDays !== null) {
      const col = bladeDays >= bladeWarnDays ? '#E24B4A'
                : bladeDays >= bladeWarnDays*0.75 ? '#EF9F27'
                : 'rgba(255,255,255,0.50)';
      row2.push({ label: 'Noże', value: kosFmtBlade(bladeDays), col });
    }
    if (nextSchedule && !(items[2].label === 'Plan'))
      row2.push({ label: 'Plan', value: nextSchedule, col: '#85B7EB' });
    if (dailyProgress !== null && items[2].label !== 'Postęp')
      row2.push({ label: 'Postęp', value: `${dailyProgress}%`, col: '#97C459' });

    if (row2.length > 0) {
      while (row2.length < 3) row2.push({ label: '', value: '', col: '' });
      items.push(...row2.slice(0, 3));
    }

    return `<div class="stats-grid">${items.map(i => `
      <div class="stat-item">
        <span class="stat-label">${i.label}</span>
        <span class="stat-value" style="color:${i.col || 'rgba(255,255,255,0.28)'};">${i.value}</span>
      </div>`).join('')}</div>`;
  }

  _renderBars(d) {
    const { batPct, dailyProgress, accent, isMowing, isReturning, isCharging, isDocked } = d;
    const { grad: barGrad } = this._getBatColors(batPct, isDocked);

    const bars = [];
    if (batPct !== null) {
      const label = isCharging ? 'Ładuje się' : isMowing ? 'Kosi' : isReturning ? 'Wraca' : 'Bateria';
      bars.push({ label, value: `${batPct}%`, pct: batPct, grad: barGrad });
    }
    if (dailyProgress !== null) {
      const grad = `linear-gradient(90deg,${accent}88,${accent})`;
      bars.push({ label: 'Postęp dzienny', value: `${dailyProgress}%`, pct: dailyProgress, grad });
    }

    if (bars.length === 0)
      return `<div style="font-size:11px;color:rgba(255,255,255,0.28);">Brak danych</div>`;

    return `<div class="bar-row">${bars.map(b => `
      <div class="bar-item">
        <div class="bar-header">
          <span class="bar-label">${b.label}</span>
          <span class="bar-value">${b.value}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${b.pct}%;background:${b.grad};"></div>
        </div>
      </div>`).join('')}</div>`;
  }

  _renderChips(d) {
    const { partyMode, isRaining, bladeWarn, bladePre, bladeLabel, zone,
            isMowing, isReturning, accent } = d;

    const chips = [];
    if (bladeWarn)
      chips.push({ label: `noże: ${bladeLabel}`, col: '#E24B4A', bg: 'rgba(226,75,74,0.12)', dot: true });
    else if (bladePre)
      chips.push({ label: `noże: ${bladeLabel}`, col: '#EF9F27', bg: 'rgba(239,159,39,0.10)' });
    if (partyMode)
      chips.push({ label: 'party 🎉', col: '#EF9F27', bg: 'rgba(239,159,39,0.10)' });
    if (isRaining)
      chips.push({ label: 'deszcz', col: '#85B7EB', bg: 'rgba(133,183,235,0.12)' });
    if (zone !== null && (isMowing || isReturning))
      chips.push({ label: `strefa ${zone}`, col: accent, bg: `${accent}1a` });

    if (chips.length === 0) return '';

    return `<div class="chips-row">${chips.map(c => {
      const dot = c.dot
        ? `<span style="width:5px;height:5px;border-radius:50%;background:${c.col};flex-shrink:0;
                        animation:kos-dot 1.8s ease-in-out infinite;display:inline-block;"></span>` : '';
      return `<span class="chip" style="background:${c.bg};color:${c.col};">${dot}${c.label}</span>`;
    }).join('')}</div>`;
  }

  // ── Render + listeners ───────────────────────

  _renderCard() {
    if (!this._hass || !this._config) return;
    const d = this._getData();

    if (d.unavailable) {
      this.shadowRoot.innerHTML = `<style>${KOS_STYLES}</style>
        <div class="card slim" style="border:0.5px solid rgba(255,255,255,0.08);">
          <div style="padding:14px 16px;font-size:12px;color:rgba(255,255,255,0.30);">
            Encja niedostępna: ${this._config.entity}
          </div>
        </div>`;
      return;
    }

    const html = this._mode === 'slim' ? this._renderSlim(d) : this._renderVerbose(d);
    this.shadowRoot.innerHTML = `<style>${KOS_STYLES}</style>${html}`;

    this.shadowRoot.querySelector('.toggle-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      this._toggleMode();
    });
    this.shadowRoot.querySelector('.blade-reset-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      this._hass.callService('button', 'press', { entity_id: this._config.blade_reset_entity });
    });
    this.shadowRoot.querySelector('.party-toggle-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      this._hass.callService('switch', 'toggle', { entity_id: this._config.party_mode_entity });
    });
    this.shadowRoot.querySelector('.card')?.addEventListener('click', e => {
      if (!e.target.closest('button')) this._moreInfo();
    });
  }

  _moreInfo() {
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true, composed: true,
      detail: { entityId: this._config.entity },
    }));
  }

  getCardSize() { return 2; }
  static getConfigElement() { return document.createElement('div'); }
  static getStubConfig() {
    return {
      entity:                'lawn_mower.kosiarka',
      name:                  'Kosiarka',
      battery_entity:        'sensor.kosiarka_battery',
      party_mode_entity:     'switch.s_party_mode',
      error_entity:          'sensor.kosiarka_error',
      daily_progress_entity: 'sensor.s_daily_progress',
      rain_entity:           'binary_sensor.s_rain_sensor',
      next_schedule_entity:  'sensor.s_next_schedule',
      blade_runtime_entity:  'sensor.s_blade_runtime_reset_time',
      blade_warn_days:       90,
    };
  }
}

customElements.define('aha-kosiarka-card', KosiarkaCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-kosiarka-card',
  name:        'Kosiarka Card',
  description: 'Karta kosiarki w stylu roborock-vacuum-card — slim i verbose, tryb party, edge, ostrzeżenia o nożach',
  preview:     true,
});
// kosiarka-slim-card.js — deprecated, use custom:aha-kosiarka-card
/**
 * power-overview-card.js — AHA Power Overview Card
 *
 * Pokazuje sumaryczne zużycie prądu na skonfigurowanych encjach (sensor.*_power).
 * Nagłówek: suma W + liczba aktywnych. Każdy rząd: nazwa | pasek | waty.
 * Pulsuje gdy duże obciążenie.
 *
 * Config:
 *   name:       (optional) tytuł karty, default "Zużycie prądu"
 *   entities:   (required) lista encji — string lub { entity, name }
 *   max_watts:  (optional) max W dla skalowania pasków, default: auto (max z encji)
 *   sort:       (optional) 'desc' (default, wg watt malejąco) | 'name' | 'none'
 *
 * Przykład:
 *   type: custom:aha-power-overview-card
 *   name: Zużycie prądu
 *   entities:
 *     - entity: sensor.gniazdko_salon_power
 *       name: TV Salon
 *     - sensor.gniazdko_kuchnia_power
 */

const POW_STYLES = `
  :host { display: block; width: 100%; }

  @keyframes pow-pulse-mid {
    0%,100% { box-shadow: 0 0 0 0   rgba(255,214,10,0); }
    50%     { box-shadow: 0 0 0 5px rgba(255,214,10,0.16); }
  }
  @keyframes pow-pulse-high {
    0%,100% { box-shadow: 0 0 0 0   rgba(255,159,10,0); }
    50%     { box-shadow: 0 0 0 5px rgba(255,159,10,0.20); }
  }
  @keyframes pow-pulse-crit {
    0%,100% { box-shadow: 0 0 0 0   rgba(255,69,58,0); }
    50%     { box-shadow: 0 0 0 5px rgba(255,69,58,0.22); }
  }

  .card {
    background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.06);
    padding: 14px 16px 12px;
    box-sizing: border-box;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    transition: border-color .4s ease, background .4s ease;
    position: relative;
    overflow: hidden;
  }

  .card.s-low  { }
  .card.s-mid  {
    background: linear-gradient(160deg,#1d1a04,#1c1c1e);
    border-color: rgba(255,214,10,0.18);
    animation: pow-pulse-mid 3.2s ease-in-out infinite;
  }
  .card.s-high {
    background: linear-gradient(160deg,#1e1200,#1c1c1e);
    border-color: rgba(255,159,10,0.25);
    animation: pow-pulse-high 2.8s ease-in-out infinite;
  }
  .card.s-crit {
    background: linear-gradient(160deg,#1e0606,#1c1c1e);
    border-color: rgba(255,69,58,0.30);
    animation: pow-pulse-crit 2.4s ease-in-out infinite;
  }

  .glow {
    position: absolute; inset: 0; pointer-events: none;
    transition: background .5s ease;
  }
  .s-low  .glow { background: none; }
  .s-mid  .glow { background: radial-gradient(ellipse at 85% 15%, rgba(255,214,10,0.07) 0%, transparent 55%); }
  .s-high .glow { background: radial-gradient(ellipse at 85% 15%, rgba(255,159,10,0.09) 0%, transparent 55%); }
  .s-crit .glow { background: radial-gradient(ellipse at 85% 15%, rgba(255,69,58,0.09)  0%, transparent 55%); }

  /* ── Header ── */
  .header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 12px; position: relative; z-index: 2;
  }
  .header-left { display: flex; flex-direction: column; gap: 2px; }

  .card-title {
    font-size: 13px; font-weight: 700;
    color: rgba(255,255,255,0.80);
    letter-spacing: -0.1px;
  }
  .active-label {
    font-size: 11px; color: rgba(255,255,255,0.30);
  }

  .total-watts {
    font-size: 30px; font-weight: 700; line-height: 1;
    text-align: right;
    transition: color .4s ease;
  }
  .total-unit { font-size: 14px; font-weight: 400; opacity: 0.65; }

  .s-low  .total-watts { color: rgba(255,255,255,0.28); }
  .s-mid  .total-watts { color: #FFD60A; }
  .s-high .total-watts { color: #FF9F0A; }
  .s-crit .total-watts { color: #FF453A; }

  /* ── Divider ── */
  .divider {
    height: 1px;
    background: rgba(255,255,255,0.06);
    margin: 0 0 10px;
    position: relative; z-index: 2;
  }

  /* ── Rows ── */
  .rows { display: flex; flex-direction: column; gap: 2px; position: relative; z-index: 2; }

  .row {
    display: grid;
    grid-template-columns: 1fr 72px 56px;
    align-items: center;
    gap: 8px;
    padding: 7px 8px;
    margin: 0 -8px;
    border-radius: 10px;
    cursor: pointer;
    transition: background .15s ease;
  }
  .row:active { background: rgba(255,255,255,0.05); transform: scale(0.98); }

  .row-name {
    font-size: 13px; font-weight: 500;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color .3s ease;
  }
  .row.on  .row-name { color: rgba(255,255,255,0.88); }
  .row.off .row-name { color: rgba(255,255,255,0.28); }

  .row-bar-wrap {
    height: 3px; border-radius: 99px;
    background: rgba(255,255,255,0.06);
    overflow: hidden;
  }
  .row-bar {
    height: 100%; border-radius: 99px;
    transition: width .6s ease, background-color .4s ease;
    min-width: 0;
  }

  .row-watts {
    font-size: 12px; font-weight: 600;
    text-align: right;
    transition: color .3s ease;
    white-space: nowrap;
  }
  .row.on  .row-watts { color: rgba(255,255,255,0.75); }
  .row.off .row-watts { color: rgba(255,255,255,0.20); }

  /* ── Unavailable ── */
  .row.unavail .row-name  { color: rgba(255,255,255,0.18); font-style: italic; }
  .row.unavail .row-watts { color: rgba(255,255,255,0.15); }
`;

/* ── Helpers ── */
const _wattColor = w => {
  if (w <   1) return 'rgba(255,255,255,0.10)';
  if (w < 100) return '#30D158';
  if (w < 500) return '#FFD60A';
  if (w < 1500) return '#FF9F0A';
  return '#FF453A';
};

const _cardState = w => {
  if (w <   50) return 's-low';
  if (w < 1000) return 's-mid';
  if (w < 3000) return 's-high';
  return 's-crit';
};

const _fmtW = w => {
  if (w >= 1000) return (w / 1000).toFixed(2).replace('.', ',') + '<span class="total-unit"> kW</span>';
  return Math.round(w) + '<span class="total-unit"> W</span>';
};

const _fmtRow = w => {
  if (w >= 1000) return (w / 1000).toFixed(2).replace('.', ',') + ' kW';
  if (w <   10)  return w.toFixed(1) + ' W';
  return Math.round(w) + ' W';
};

const _activeLabel = n => {
  if (n === 0) return 'wszystkie wyłączone';
  if (n === 1) return '1 aktywne';
  return `${n} aktywnych`;
};

/* ── Card ── */
class AhaPowerOverviewCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built = false;
  }

  setConfig(config) {
    if (!config.entities?.length) throw new Error('power-overview-card: brak pola "entities"');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) { this._build(); this._built = true; }
    this._update();
  }

  /* ── Build DOM once ── */
  _build() {
    const s = document.createElement('style');
    s.textContent = POW_STYLES;
    this.shadowRoot.appendChild(s);

    this._card = document.createElement('div');
    this._card.className = 'card s-low';
    this._card.innerHTML = `
      <div class="glow"></div>
      <div class="header">
        <div class="header-left">
          <div class="card-title">⚡ —</div>
          <div class="active-label">—</div>
        </div>
        <div class="total-watts">—</div>
      </div>
      <div class="divider"></div>
      <div class="rows"></div>
    `;
    this.shadowRoot.appendChild(this._card);

    this._titleEl  = this._card.querySelector('.card-title');
    this._activeEl = this._card.querySelector('.active-label');
    this._totalEl  = this._card.querySelector('.total-watts');
    this._rowsEl   = this._card.querySelector('.rows');
  }

  /* ── Update on state change ── */
  _update() {
    if (!this._hass || !this._config) return;

    const cfg = this._config;

    /* parse entities */
    const rows = cfg.entities.map(e => {
      const c = typeof e === 'string' ? { entity: e } : e;
      const st = this._hass.states[c.entity];
      const name = c.name || st?.attributes?.friendly_name || c.entity;

      if (!st || st.state === 'unavailable' || st.state === 'unknown') {
        return { name, watts: 0, entity: c.entity, avail: false };
      }

      let watts = parseFloat(st.state);
      if (isNaN(watts)) return { name, watts: 0, entity: c.entity, avail: false };

      /* handle kW unit */
      const unit = (st.attributes?.unit_of_measurement || '').trim().toLowerCase();
      if (unit === 'kw') watts *= 1000;

      return { name, watts, entity: c.entity, avail: true };
    });

    /* sort */
    const sort = cfg.sort ?? 'desc';
    if (sort === 'desc') rows.sort((a, b) => b.watts - a.watts);
    else if (sort === 'name') rows.sort((a, b) => a.name.localeCompare(b.name));

    /* totals */
    const totalW    = rows.reduce((s, r) => s + r.watts, 0);
    const activeN   = rows.filter(r => r.watts >= 1).length;
    const peakW     = cfg.max_watts ?? Math.max(...rows.map(r => r.watts), 1);
    const cardState = _cardState(totalW);
    const title     = cfg.name ?? 'Zużycie prądu';

    /* ── patch card class (keeps animation running if class unchanged) ── */
    this._card.className = `card ${cardState}`;

    /* ── header ── */
    this._titleEl.textContent  = `⚡ ${title}`;
    this._activeEl.textContent = _activeLabel(activeN);
    this._totalEl.innerHTML    = _fmtW(totalW);

    /* ── rows ── */
    this._rowsEl.innerHTML = rows.map(r => {
      const pct      = peakW > 0 ? Math.min(100, (r.watts / peakW) * 100) : 0;
      const barColor = _wattColor(r.watts);
      const cls      = !r.avail ? 'unavail' : r.watts >= 1 ? 'on' : 'off';
      const wattStr  = !r.avail ? '—' : _fmtRow(r.watts);

      return `
        <div class="row ${cls}" data-entity="${r.entity}">
          <div class="row-name">${r.name}</div>
          <div class="row-bar-wrap">
            <div class="row-bar" style="width:${pct.toFixed(1)}%;background-color:${barColor}"></div>
          </div>
          <div class="row-watts">${wattStr}</div>
        </div>`;
    }).join('');

    /* ── tap → more-info ── */
    this._rowsEl.querySelectorAll('.row[data-entity]').forEach(el => {
      el.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true,
          detail: { entityId: el.dataset.entity },
        }));
      });
    });
  }

  getCardSize() {
    const n = this._config?.entities?.length ?? 4;
    return 2 + Math.ceil(n / 2);
  }

  static getConfigElement() { return document.createElement('div'); }

  static getStubConfig() {
    return {
      name: 'Zużycie prądu',
      entities: [
        { entity: 'sensor.gniazdko_salon_power',   name: 'TV Salon' },
        { entity: 'sensor.gniazdko_kuchnia_power', name: 'Kuchnia' },
        { entity: 'sensor.gniazdko_biuro_power',   name: 'Biuro' },
      ],
    };
  }
}

customElements.define('aha-power-overview-card', AhaPowerOverviewCard);
if (!customElements.get('power-overview-card'))
  customElements.define('power-overview-card', class extends AhaPowerOverviewCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-power-overview-card',
  name:        'Power Overview Card',
  description: 'Zbiorcze zużycie prądu na gniazdkach — suma W, paski, kolor wg obciążenia.',
  preview:     true,
});
/**
 * switch-socket-card.js — AHA Switch / Socket Card
 *
 * OFF → identyczny styl z kontaktron-card (closed): ciemny, wyciszony, brak animacji
 * ON  → żółty glow, pulsowanie, ikona z drop-shadow — jak dotychczasowy switch_socket.yaml
 *
 * Tap: natywny popup HA (more-info z wbudowanym togglem)
 *
 * Config:
 *   entity:  (required) switch.* | input_boolean.*
 *   name:    (optional) override nazwy
 *   icon:    (optional) MDI icon string (np. 'mdi:power-socket-eu') zamiast domyślnego SVG
 */

const SW_STYLES = `
  :host { display: block; width: 100%; height: 100%; }

  @keyframes sw-pulse {
    0%,100% { box-shadow: 0 0 0 0   rgba(255,214,10,0); }
    50%     { box-shadow: 0 0 0 6px rgba(255,214,10,0.12); }
  }
  .card {
    width: 100%; aspect-ratio: 1 / 1;
    border-radius: 20px;
    padding: 10px 10px 8px;
    display: flex; flex-direction: column;
    position: relative; cursor: pointer;
    transition: transform .15s ease, border-color .4s ease, background .4s ease;
    border: 1px solid rgba(255,255,255,0.06);
    box-sizing: border-box;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent; user-select: none;
  }
  .card:active { transform: scale(0.96); }

  /* ── OFF — identyczny z kontaktron .closed ── */
  .card.off { background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%); }
  .card.off .glow { background: none; }

  /* ── ON — żółty glow ── */
  .card.on {
    background: linear-gradient(145deg,#2a2508,#1a1a0e);
    border-color: rgba(255,214,10,0.25);
    animation: sw-pulse 2.8s ease-in-out infinite;
  }
  .card.on .glow {
    background: radial-gradient(ellipse at 30% 30%, rgba(255,214,10,0.11) 0%, transparent 68%);
  }

  .glow {
    position: absolute; inset: 0;
    pointer-events: none; transition: background .4s ease;
  }

  /* ── State text — under icon ── */
  .state-text {
    text-align: center; font-size: 10px; font-weight: 600;
    padding-bottom: 2px; position: relative; z-index: 2; flex-shrink: 0;
    transition: color .4s ease;
  }
  .off .state-text { color: rgba(255,255,255,0.28); }
  .on  .state-text { color: #FFD60A; }

  /* ── Icon area — jak kontaktron ── */
  .icon-area {
    flex: 1; display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 2;
  }
  .icon-bg {
    width: 42px; height: 42px; border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    transition: background .4s ease;
  }
  .off .icon-bg { background: rgba(142,142,147,0.12); }
  .on  .icon-bg { background: rgba(255,214,10,0.18); }

  /* ha-icon fallback gdy config.icon ustawiony */
  ha-icon {
    --mdc-icon-size: 24px;
    transition: color .4s ease, filter .4s ease;
  }
  .off ha-icon { color: #8e8e93; }
  .on  ha-icon { color: #FFD60A; filter: drop-shadow(0 0 5px rgba(255,214,10,0.5)); }

  /* ── Name — jak kontaktron .name ── */
  .name {
    text-align: center; font-size: 12px; font-weight: 600;
    color: rgba(255,255,255,0.65);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    padding-bottom: 4px; position: relative; z-index: 2; flex-shrink: 0;
    transition: color .4s ease;
  }
  .on .name { color: rgba(255,255,255,0.90); }

`;

/* ── Inline SVG icons ── */
const _svgOn = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none"
    style="filter:drop-shadow(0 0 5px rgba(255,214,10,0.5));flex-shrink:0;">
  <circle cx="12" cy="10" r="5" stroke="#FFD60A" stroke-width="1.6"/>
  <path d="M9 15h6l-.5 3a1 1 0 01-1 .8h-3a1 1 0 01-1-.8L9 15z"
        stroke="#FFD60A" stroke-width="1.4" fill="rgba(255,214,10,0.15)"/>
  <line x1="9.5" y1="18.5" x2="14.5" y2="18.5"
        stroke="#FFD60A" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="12" y1="5" x2="12" y2="3.5"
        stroke="#FFD60A" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="16.5" y1="6.5" x2="17.5" y2="5.5"
        stroke="#FFD60A" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="7.5" y1="6.5" x2="6.5" y2="5.5"
        stroke="#FFD60A" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

const _svgOff = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;">
  <circle cx="12" cy="10" r="5" stroke="#8e8e93" stroke-width="1.6"/>
  <path d="M9 15h6l-.5 3a1 1 0 01-1 .8h-3a1 1 0 01-1-.8L9 15z"
        stroke="#8e8e93" stroke-width="1.4"/>
  <line x1="9.5" y1="18.5" x2="14.5" y2="18.5"
        stroke="#8e8e93" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

class AhaSwitchSocketCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built = false;
  }

  setConfig(config) {
    if (!config.entity) throw new Error('switch-socket-card: brak pola "entity"');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) { this._build(); this._built = true; }
    this._update();
  }

  /* ── Build DOM once ── */
  _build() {
    const shadow = this.shadowRoot;

    const style = document.createElement('style');
    style.textContent = SW_STYLES;
    shadow.appendChild(style);

    this._card = document.createElement('div');
    this._card.className = 'card off';
    this._card.innerHTML = `
      <div class="glow"></div>
      <div class="icon-area">
        <div class="icon-bg">
          <div class="icon-inner"></div>
        </div>
      </div>
      <div class="state-text">wyłączone</div>
      <div class="name">—</div>
    `;

    this._card.addEventListener('click', () => this._moreInfo());

    shadow.appendChild(this._card);

    this._iconEl  = shadow.querySelector('.icon-inner');
    this._stateEl = shadow.querySelector('.state-text');
    this._nameEl  = shadow.querySelector('.name');

    /* ha-icon — tworzymy raz jeśli config.icon ustawiony */
    if (this._config?.icon) {
      this._haIcon = document.createElement('ha-icon');
      this._iconEl.appendChild(this._haIcon);
    }
  }

  /* ── Update on state change ── */
  _update() {
    if (!this._hass || !this._config) return;
    const stateObj = this._hass.states[this._config.entity];
    if (!stateObj) return;

    const on   = stateObj.state === 'on';
    const name = this._config.name
               || stateObj.attributes.friendly_name
               || this._config.entity;

    this._card.className      = `card ${on ? 'on' : 'off'}`;
    this._stateEl.textContent = on ? 'włączone' : 'wyłączone';
    this._nameEl.textContent  = name;

    if (this._config.icon) {
      if (this._haIcon) this._haIcon.setAttribute('icon', this._config.icon);
    } else {
      this._iconEl.innerHTML = on ? _svgOn : _svgOff;
    }
  }

  _moreInfo() {
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true, composed: true,
      detail: { entityId: this._config.entity },
    }));
  }

  getCardSize() { return 2; }

  static getConfigElement() { return document.createElement('div'); }

  static getStubConfig() {
    return { entity: 'switch.example', name: 'Gniazdko' };
  }
}

customElements.define('aha-switch-socket-card', AhaSwitchSocketCard);
if (!customElements.get('switch-socket-card'))
  customElements.define('switch-socket-card', class extends AhaSwitchSocketCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-switch-socket-card',
  name:        'Switch / Socket Card',
  description: 'Karta przełącznika/gniazdka — OFF jak kontaktron, ON żółty glow. Tap: natywny popup HA.',
  preview:     true,
});
/**
 * aha-log-history-card.js
 * Log History Card — Timeline · Ikony · Avatary · Paginacja
 *
 * Czyta wpisy JSON z input_text.log_h1 … input_text.log_hN
 * Obsługiwane typy: porecz | szambo | wjazd | kontaktrony_22 | kontaktrony_deszcz | kwiaty | wiatrak_biuro | biuro_prad | nawodnienie_ogrod2 | garden_ambient
 *
 * Config:
 *   slots:     (optional) liczba slotów do odczytu, default: 50
 *   page_size: (optional) wpisy na stronę, default: 10
 *   person_tk: (optional) entity_id osoby TK, default: person.tk
 *   person_mk: (optional) entity_id osoby MK, default: person.mk
 *
 * Usage:
 *   type: custom:aha-log-history-card
 *
 * Registration: aha-log-history-card + alias log-history-card
 */

const LH_STYLES = `
  :host { display: block; width: 100%; }
  * { box-sizing: border-box; }

  .card {
    background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
    border-radius: 20px;
    padding: 16px;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  /* ── Range tabs ── */
  .range-row {
    display: flex;
    gap: 5px;
    margin-bottom: 14px;
  }
  .range-btn {
    padding: 4px 11px;
    border-radius: 20px;
    cursor: pointer;
    border: 0.5px solid rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.04);
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,0.30);
    transition: background .2s ease, color .2s ease, border-color .2s ease;
  }
  .range-btn.active {
    border-color: rgba(255,255,255,0.22);
    background: rgba(255,255,255,0.11);
    font-weight: 600;
    color: rgba(255,255,255,0.72);
  }

  /* ── Timeline container ── */
  .timeline {
    position: relative;
    padding-left: 36px;
  }
  .timeline-line {
    position: absolute;
    left: 13px;
    top: 6px;
    bottom: 6px;
    width: 1px;
    background: rgba(255,255,255,0.07);
  }

  /* ── Day separator ── */
  .day-sep {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .05em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.18);
    padding: 10px 0 8px;
    margin-left: -36px;
  }
  .day-sep.first { padding-top: 0; }

  /* ── Entry row ── */
  .entry {
    position: relative;
    padding-bottom: 12px;
  }
  .entry-node {
    position: absolute;
    left: -36px;
    top: 0;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: 1px solid transparent;
  }
  .entry-body {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    padding-top: 3px;
  }
  .entry-main { flex: 1; min-width: 0; }
  .entry-title {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .entry-detail {
    font-size: 11px;
    color: rgba(255,255,255,0.30);
    margin-top: 2px;
    line-height: 1.3;
    white-space: normal;
  }
  .entry-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
  }
  .entry-time {
    font-size: 10px;
    color: rgba(255,255,255,0.22);
    font-weight: 500;
    white-space: nowrap;
  }

  /* ── Avatars ── */
  .avatars { display: flex; align-items: center; }
  .avatar {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px solid #1c1c1e;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .avatar span { font-size: 7px; font-weight: 700; }

  /* ── Empty state ── */
  .empty {
    text-align: center;
    padding: 28px 0;
    font-size: 12px;
    color: rgba(255,255,255,0.22);
  }

  /* ── Load more ── */
  .load-more {
    margin-top: 12px;
    width: 100%;
    padding: 8px;
    border-radius: 10px;
    cursor: pointer;
    border: 0.5px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,0.30);
    text-align: center;
    transition: background .15s ease;
  }
  .load-more:active { background: rgba(255,255,255,0.08); }
`;

// ── IIFE — żeby helper functions nie wyciekały do globalnego scope w bundlu ──
(function () {

// ── SVG ICONS ────────────────────────────────────────────────────────────────

function iconSvg(e) {
  const s = (color, path) =>
    `<svg viewBox="0 0 24 24" fill="none" width="13" height="13">${path(color)}</svg>`;

  if (e.typ === 'porecz') {
    if (e.akcja === 'ON') return s('rgba(255,214,10,0.9)', c => `
      <circle cx="12" cy="12" r="4" fill="${c}"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke="${c.replace('0.9','0.7')}" stroke-width="2" stroke-linecap="round"/>`);
    return s('rgba(150,150,155,0.50)', c => `
      <circle cx="12" cy="12" r="5" stroke="${c}" stroke-width="1.8"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2"
        stroke="${c.replace('0.50','0.25')}" stroke-width="1.5" stroke-linecap="round"/>`);
  }

  if (e.typ === 'szambo') return s('rgba(255,159,10,0.85)', c => `
    <rect x="3" y="11" width="18" height="8" rx="2" fill="${c.replace('0.85','0.45')}"/>
    <path d="M7 11V8a5 5 0 0110 0v3" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="8" cy="15" r="1" fill="${c}"/>
    <circle cx="16" cy="15" r="1" fill="${c}"/>`);

  if (e.typ === 'wjazd') {
    const people = Array.isArray(e.kto) ? e.kto : [e.kto];
    const col = people.length > 1 || people[0] === 'mk'
      ? 'rgba(191,90,242,0.85)' : 'rgba(10,132,255,0.85)';
    return s(col, c => `
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`);
  }

  if (e.typ === 'kontaktrony_22') {
    const col = e.otwarte > 0 ? 'rgba(255,69,58,0.85)' : 'rgba(52,199,89,0.85)';
    return s(col, c => `
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="${c.replace('0.85','0.25')}" stroke="${c}" stroke-width="1.6"/>
      <circle cx="12" cy="9" r="2.5" fill="${c}"/>`);
  }

  if (e.typ === 'garden_ambient') {
    const col = e.akcja === 'ON' ? 'rgba(255,179,71,0.85)' : 'rgba(99,99,102,0.75)';
    return s(col, c => `
      <circle cx="12" cy="12" r="4" stroke="${c}" stroke-width="1.7" fill="none"/>
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="${c}" stroke-width="1.7" stroke-linecap="round"/>`);
  }

  if (e.typ === 'kontaktrony_deszcz') {
    const col = 'rgba(90,170,255,0.85)';
    return s(col, c => `
      <path d="M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 15.25" stroke="${c}" stroke-width="1.7"
        stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <line x1="8" y1="19" x2="8" y2="21" stroke="${c}" stroke-width="1.7" stroke-linecap="round"/>
      <line x1="8" y1="13" x2="8" y2="15" stroke="${c}" stroke-width="1.7" stroke-linecap="round"/>
      <line x1="12" y1="21" x2="12" y2="23" stroke="${c}" stroke-width="1.7" stroke-linecap="round"/>
      <line x1="12" y1="15" x2="12" y2="17" stroke="${c}" stroke-width="1.7" stroke-linecap="round"/>
      <line x1="16" y1="19" x2="16" y2="21" stroke="${c}" stroke-width="1.7" stroke-linecap="round"/>`);
  }

  if (e.typ === 'kwiaty') {
    const col = e.akcja === 'OPEN' ? 'rgba(52,199,89,0.88)' : 'rgba(142,142,147,0.55)';
    return s(col, c => `
      <path d="M12 21v-8" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M12 13c0 0-3-2-3-5a3 3 0 016 0c0 3-3 5-3 5z"
        fill="${c.replace(/[\d.]+\)$/, '0.28)')}" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M12 15c0 0 2.5-1.5 4-4" stroke="${c.replace(/[\d.]+\)$/, '0.55)')}" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M12 17c0 0-2.5-1-3.5-3.5" stroke="${c.replace(/[\d.]+\)$/, '0.55)')}" stroke-width="1.3" stroke-linecap="round"/>
    `);
  }

  if (e.typ === 'wiatrak_biuro') {
    const col = e.akcja === 'ON' ? 'rgba(255,59,48,0.90)' : 'rgba(150,150,155,0.50)';
    const hub = e.akcja === 'ON' ? 'rgba(255,59,48,1.00)' : 'rgba(150,150,155,0.65)';
    return `<svg viewBox="0 0 24 24" width="13" height="13">
      <ellipse cx="12" cy="7.5" rx="2.8" ry="4.5" fill="${col}" transform="rotate(0 12 12)"/>
      <ellipse cx="12" cy="7.5" rx="2.8" ry="4.5" fill="${col}" transform="rotate(120 12 12)"/>
      <ellipse cx="12" cy="7.5" rx="2.8" ry="4.5" fill="${col}" transform="rotate(240 12 12)"/>
      <circle cx="12" cy="12" r="2" fill="${hub}"/>
    </svg>`;
  }

  if (e.typ === 'biuro_prad') {
    const col = e.akcja === 'WARN' ? 'rgba(255,159,10,0.90)' : 'rgba(150,150,155,0.50)';
    return s(col, c => `
      <rect x="7" y="11" width="10" height="8" rx="2"
        fill="${c.replace(/[\d.]+\)$/, '0.22)')}" stroke="${c}" stroke-width="1.6"/>
      <path d="M9 11V8a3 3 0 016 0v3" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="10" y1="15" x2="14" y2="15" stroke="${c}" stroke-width="1.4" stroke-linecap="round"/>
    `);
  }

  if (e.typ === 'nawodnienie_ogrod2') {
    return s('rgba(48,176,255,0.88)', c => `
      <path d="M12 3C12 3 7 10 7 14a5 5 0 0010 0C17 10 12 3 12 3z"
        fill="${c.replace(/[\d.]+\)$/, '0.25)')}" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M10 15.5 Q9.5 13.5 11 12.5"
        stroke="rgba(255,255,255,0.30)" stroke-width="1.2" stroke-linecap="round" fill="none"/>
    `);
  }

  if (e.typ === 'teleco_pergola') {
    const open = e.akcja?.startsWith('OPEN');
    const rain = e.akcja === 'CLOSE_DESZCZ';
    const col  = open ? 'rgba(255,100,10,0.90)'
               : rain ? 'rgba(10,132,255,0.85)'
               :        'rgba(150,150,155,0.50)';
    return open
      ? s(col, c => `
          <line x1="6"  y1="3" x2="6"  y2="21" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="12" y1="3" x2="12" y2="21" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="18" y1="3" x2="18" y2="21" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
        `)
      : s(col, c => `
          <line x1="3" y1="8"  x2="21" y2="8"  stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="3" y1="12" x2="21" y2="12" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="3" y1="16" x2="21" y2="16" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
        `);
  }

  if (e.typ === 'ac_pokoj_dzieci') {
    const col = e.akcja === 'ON' ? 'rgba(90,200,250,0.90)' : 'rgba(150,150,155,0.50)';
    return s(col, c => `
      <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1"
        stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="2.5" fill="${c.replace(/[\d.]+\)$/, '0.30)')}" stroke="${c}" stroke-width="1.3"/>
    `);
  }

  if (e.typ === 'strychowy_roleta') {
    return s('rgba(255,100,10,0.90)', c => `
      <path d="M12 3v10.27" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="12" cy="16" r="3" fill="${c.replace(/[\d.]+\)$/, '0.30)')}" stroke="${c}" stroke-width="1.5"/>
      <path d="M9 3h6M9 6h6M9 9h4" stroke="${c.replace(/[\d.]+\)$/, '0.40)')}" stroke-width="1.2" stroke-linecap="round"/>
    `);
  }

  if (e.typ === 'tryb_noc') {
    const on = e.akcja === 'ON';
    const col = on ? 'rgba(94,92,230,0.90)' : 'rgba(150,150,155,0.50)';
    return s(col, c => `
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
        fill="${c.replace(/[\d.]+\)$/, '0.25)')}" stroke="${c}" stroke-width="1.6"
        stroke-linecap="round" stroke-linejoin="round"/>
    `);
  }

  return `<svg viewBox="0 0 24 24" fill="none" width="13" height="13">
    <circle cx="12" cy="12" r="5" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
  </svg>`;
}

// ── NODE STYLE ────────────────────────────────────────────────────────────────

function nodeStyle(e) {
  if (e.typ === 'porecz')
    return e.akcja === 'ON'
      ? { bg: 'rgba(255,214,10,0.14)', outline: 'rgba(255,214,10,0.25)' }
      : { bg: 'rgba(99,99,102,0.18)',  outline: 'rgba(99,99,102,0.20)' };
  if (e.typ === 'szambo')
    return { bg: 'rgba(255,159,10,0.14)', outline: 'rgba(255,159,10,0.25)' };
  if (e.typ === 'wjazd') {
    const people = Array.isArray(e.kto) ? e.kto : [e.kto];
    return people.length > 1 || people[0] === 'mk'
      ? { bg: 'rgba(191,90,242,0.14)', outline: 'rgba(191,90,242,0.22)' }
      : { bg: 'rgba(10,132,255,0.14)', outline: 'rgba(10,132,255,0.22)' };
  }
  if (e.typ === 'kontaktrony_22')
    return e.otwarte > 0
      ? { bg: 'rgba(255,69,58,0.14)',  outline: 'rgba(255,69,58,0.25)' }
      : { bg: 'rgba(52,199,89,0.14)',  outline: 'rgba(52,199,89,0.22)' };
  if (e.typ === 'garden_ambient')
    return e.akcja === 'ON'
      ? { bg: 'rgba(255,179,71,0.13)', outline: 'rgba(255,179,71,0.25)' }
      : { bg: 'rgba(99,99,102,0.14)',  outline: 'rgba(99,99,102,0.20)' };
  if (e.typ === 'kontaktrony_deszcz')
    return { bg: 'rgba(90,170,255,0.13)', outline: 'rgba(90,170,255,0.25)' };
  if (e.typ === 'kwiaty')
    return e.akcja === 'OPEN'
      ? { bg: 'rgba(52,199,89,0.13)',  outline: 'rgba(52,199,89,0.22)' }
      : { bg: 'rgba(99,99,102,0.14)',  outline: 'rgba(99,99,102,0.20)' };
  if (e.typ === 'wiatrak_biuro')
    return e.akcja === 'ON'
      ? { bg: 'rgba(255,59,48,0.14)', outline: 'rgba(255,59,48,0.25)' }
      : { bg: 'rgba(99,99,102,0.18)', outline: 'rgba(99,99,102,0.20)' };
  if (e.typ === 'biuro_prad')
    return e.akcja === 'WARN'
      ? { bg: 'rgba(255,159,10,0.14)', outline: 'rgba(255,159,10,0.25)' }
      : { bg: 'rgba(99,99,102,0.18)',  outline: 'rgba(99,99,102,0.20)' };
  if (e.typ === 'nawodnienie_ogrod2')
    return { bg: 'rgba(48,176,255,0.13)', outline: 'rgba(48,176,255,0.25)' };
  if (e.typ === 'teleco_pergola') {
    const open = e.akcja?.startsWith('OPEN');
    const rain = e.akcja === 'CLOSE_DESZCZ';
    return open ? { bg: 'rgba(255,100,10,0.13)',  outline: 'rgba(255,100,10,0.28)' }
         : rain ? { bg: 'rgba(10,132,255,0.12)',  outline: 'rgba(10,132,255,0.22)' }
         :        { bg: 'rgba(99,99,102,0.14)',    outline: 'rgba(99,99,102,0.20)' };
  }
  if (e.typ === 'ac_pokoj_dzieci')
    return e.akcja === 'ON'
      ? { bg: 'rgba(90,200,250,0.13)', outline: 'rgba(90,200,250,0.25)' }
      : { bg: 'rgba(99,99,102,0.14)',  outline: 'rgba(99,99,102,0.20)' };
  if (e.typ === 'strychowy_roleta')
    return { bg: 'rgba(255,100,10,0.13)', outline: 'rgba(255,100,10,0.28)' };
  if (e.typ === 'tryb_noc')
    return e.akcja === 'ON'
      ? { bg: 'rgba(94,92,230,0.14)',  outline: 'rgba(94,92,230,0.28)' }
      : { bg: 'rgba(99,99,102,0.14)',  outline: 'rgba(99,99,102,0.20)' };
  return { bg: 'rgba(255,255,255,0.07)', outline: 'rgba(255,255,255,0.10)' };
}

// ── TITLE + DETAIL ────────────────────────────────────────────────────────────

const FIRE_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none">
  <path d="M12 2C12 2 9 7 9 10.5c0 .8.2 1.5.5 2-.3-.1-.5-.4-.5-.8C9 10 10 8 10 8s-3 3-3 6a5 5 0 0010 0c0-3-2-5-2-5s0 2-1.5 2.5C12.5 9 12 2 12 2z"
    fill="rgba(255,100,10,0.90)"/>
  <path d="M12 17c0 1-.7 1.8-1.5 1.5" stroke="rgba(255,200,80,0.55)" stroke-width="1.2" stroke-linecap="round"/>
</svg>`;

function titleAndDetail(e, PEOPLE) {
  if (e.typ === 'porecz') {
    const col = e.akcja === 'ON' ? 'rgba(255,214,10,0.90)' : 'rgba(150,150,155,0.55)';
    return {
      titleColor: col,
      titleText: `Poręcz — ${e.akcja === 'ON' ? 'włączono' : 'wyłączono'}`,
      detail: e.info ?? '',
      avatarPeople: null,
    };
  }
  if (e.typ === 'szambo') return {
    titleColor: 'rgba(255,159,10,0.90)',
    titleText: 'Wywóz szamba',
    detail: `Dom1: ${e.d1m}m³ = ${e.d1z}zł · Dom2: ${e.d2m}m³ = ${e.d2z}zł · Razem: ${e.lm}m³`,
    avatarPeople: null,
  };
  if (e.typ === 'wjazd') {
    const people = Array.isArray(e.kto) ? e.kto : [e.kto];
    const names  = people.map(p => PEOPLE[p]?.name ?? p).join(' & ');
    const both   = people.length > 1;
    const col    = both || people[0] === 'mk' ? 'rgba(191,90,242,0.90)' : 'rgba(10,132,255,0.90)';
    return {
      titleColor: col,
      titleText: `Wjazd — ${names}`,
      detail: 'brama otwarta automatycznie',
      avatarPeople: people,
    };
  }
  if (e.typ === 'kontaktrony_22') {
    const n   = e.otwarte ?? 0;
    const col = n > 0 ? 'rgba(255,69,58,0.90)' : 'rgba(52,199,89,0.90)';
    const txt = n > 0 ? `Otwarte czujniki (${n})` : 'Wszystkie czujniki zamknięte';
    const lista = e.lista ? e.lista.split(' | ').join('\n') : '';
    return {
      titleColor: col,
      titleText: txt,
      detail: lista,
      avatarPeople: null,
    };
  }
  if (e.typ === 'garden_ambient') {
    const on = e.akcja === 'ON';
    return {
      titleColor: on ? 'rgba(255,179,71,0.90)' : 'rgba(142,142,147,0.70)',
      titleText:  on ? 'Ogród — ambient włączony' : 'Ogród — ambient wyłączony',
      detail:     e.info ?? '',
      avatarPeople: null,
    };
  }
  if (e.typ === 'kontaktrony_deszcz') {
    const n     = e.otwarte ?? 0;
    const lista = e.lista ? e.lista.split(' | ').join('\n') : '';
    const src   = e.trigger === 'deszcz_start' ? 'start deszczu' : 'otwarcie czujnika';
    return {
      titleColor: 'rgba(90,170,255,0.90)',
      titleText:  `Deszcz — otwarte czujniki (${n})`,
      detail:     `${lista}\n${src}`.trim(),
      avatarPeople: null,
    };
  }
  if (e.typ === 'kwiaty') {
    const open = e.akcja === 'OPEN';
    return {
      titleColor: open ? 'rgba(52,199,89,0.90)' : 'rgba(142,142,147,0.70)',
      titleText:  open ? 'Kwiaty — rolety otwarte' : 'Kwiaty — rolety zamknięte',
      detail:     e.info ?? '',
      avatarPeople: null,
    };
  }
  if (e.typ === 'wiatrak_biuro') {
    const on = e.akcja === 'ON';
    return {
      titleColor: on ? 'rgba(255,59,48,0.90)' : 'rgba(150,150,155,0.60)',
      titleText:  `Wiatrak biuro — ${on ? 'włączono' : 'wyłączono'}`,
      detail:     e.info ?? '',
      avatarPeople: null,
    };
  }
  if (e.typ === 'biuro_prad') {
    const warn = e.akcja === 'WARN';
    return {
      titleColor: warn ? 'rgba(255,159,10,0.90)' : 'rgba(150,150,155,0.60)',
      titleText:  warn ? 'Biuro prąd — wyłączenie za 1h' : 'Biuro prąd — wyłączono',
      detail:     e.info ?? '',
      avatarPeople: null,
    };
  }
  if (e.typ === 'nawodnienie_ogrod2') {
    const delta = typeof e.delta === 'number' ? e.delta.toFixed(3) : e.delta;
    const ogrod = typeof e.ogrod2 === 'number' ? e.ogrod2.toFixed(3) : e.ogrod2;
    return {
      titleColor: 'rgba(48,176,255,0.90)',
      titleText:  `Nawodnienie ogród 2 — +${delta} m³`,
      detail:     `licznik ogrodu: ${ogrod} m³`,
      avatarPeople: null,
    };
  }
  if (e.typ === 'ac_pokoj_dzieci') {
    const on = e.akcja === 'ON';
    return {
      titleColor: on ? 'rgba(90,200,250,0.90)' : 'rgba(150,150,155,0.60)',
      titleText:  `Pokój dzieci — chłodzenie ${on ? 'włączone' : 'wyłączone'}`,
      detail:     e.info ?? '',
      avatarPeople: null,
    };
  }
  if (e.typ === 'teleco_pergola') {
    const stats = [
      e.temp != null ? `${e.temp}°C` : null,
      e.hum  != null ? `${e.hum}%`   : null,
    ].filter(Boolean).join(' · ');
    const open = e.akcja?.startsWith('OPEN');
    const titles = {
      OPEN_DOM:     { col: 'rgba(255,100,10,0.90)', txt: 'Pergola — lamele otwarte (upał)' },
      OPEN_POZA:    { col: 'rgba(255,100,10,0.80)', txt: 'Pergola — przewietrzenie 30 min (upał)' },
      CLOSE_DESZCZ: { col: 'rgba(10,132,255,0.90)', txt: 'Pergola — zamknięto (deszcz)' },
      CLOSE_TEMP:   { col: 'rgba(150,150,155,0.65)', txt: 'Pergola — zamknięto (norma)' },
      CLOSE_30MIN:  { col: 'rgba(150,150,155,0.65)', txt: 'Pergola — koniec przewietrzenia' },
      CLOSE_NOC:    { col: 'rgba(150,150,155,0.65)', txt: 'Pergola — zamknięto (22:00)' },
    };
    const t = titles[e.akcja] ?? { col: 'rgba(150,150,155,0.65)', txt: 'Pergola — lamele' };
    return {
      titleColor:   t.col,
      titleText:    t.txt,
      detail:       stats || (e.info ?? ''),
      avatarPeople: null,
      rightSvg:     open ? FIRE_SVG : null,
    };
  }
  if (e.typ === 'strychowy_roleta') {
    const temp = e.temp != null ? `${e.temp}°C` : null;
    const hum  = e.hum  != null ? `${e.hum}%`   : null;
    const parts = [temp, hum].filter(Boolean);
    return {
      titleColor:   'rgba(255,100,10,0.90)',
      titleText:    'Strychowy — roleta zamknięta (upał)',
      detail:       parts.length ? parts.join(' · ') : (e.info ?? ''),
      avatarPeople: null,
      rightSvg:     FIRE_SVG,
    };
  }
  if (e.typ === 'tryb_noc') {
    const on = e.akcja === 'ON';
    const details = [];
    if (on && e.otwarte != null && e.otwarte > 0) details.push(`otwarte czujniki: ${e.otwarte}`);
    if (!on) details.push('reset o wschodzie słońca');
    return {
      titleColor:   on ? 'rgba(94,92,230,0.90)' : 'rgba(150,150,155,0.60)',
      titleText:    on ? 'Tryb nocny — aktywowany' : 'Tryb nocny — wyłączony',
      detail:       details.join(' · ') || (e.info ?? ''),
      avatarPeople: null,
    };
  }
  return {
    titleColor: 'rgba(255,255,255,0.60)',
    titleText: e.typ ?? '—',
    detail: '',
    avatarPeople: null,
  };
}

// ── DATE HELPERS ──────────────────────────────────────────────────────────────

function lhcFmtTime(ts) {
  return new Date(ts).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(ts) {
  const d     = new Date(ts);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yest  = new Date(today); yest.setDate(yest.getDate() - 1);
  if (d >= today) return 'Dziś';
  if (d >= yest)  return 'Wczoraj';
  return d.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
}

function dateKey(ts) { return new Date(ts).toDateString(); }

// ── CARD ELEMENT ──────────────────────────────────────────────────────────────

class AhaLogHistoryCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass   = null;
    this._config = {};
    this._range  = 'week';
    this._page   = 1;
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  // ── READ ENTRIES ───────────────────────────────────────────────────────────

  _readEntries() {
    const slots = this._config.slots ?? 100;
    const entries = [];
    for (let i = 1; i <= slots; i++) {
      const raw = this._hass?.states[`input_text.log_h${i}`]?.state ?? '';
      if (!raw || raw === 'unknown' || raw === 'unavailable' || !raw.startsWith('{')) continue;
      try {
        const e = JSON.parse(raw);
        if (e.ts) entries.push(e);
      } catch (_) {}
    }
    // sort newest first (slots may not be perfectly ordered)
    entries.sort((a, b) => new Date(b.ts) - new Date(a.ts));
    return entries;
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────

  _render() {
    if (!this._hass) return;

    const PAGE_SIZE = this._config.page_size ?? 10;
    const personTkId = this._config.person_tk ?? 'person.tk';
    const personMkId = this._config.person_mk ?? 'person.mk';

    const imgTK = this._hass.states[personTkId]?.attributes?.entity_picture ?? null;
    const imgMK = this._hass.states[personMkId]?.attributes?.entity_picture ?? null;

    const PEOPLE = {
      tk: { name: 'Tomek',  initials: 'TK', bg: '#1a3a5c', text: '#5ac8fa', img: imgTK },
      mk: { name: 'Monika', initials: 'MK', bg: '#3a1a5c', text: '#bf5af2', img: imgMK },
    };

    const allEntries = this._readEntries();

    const rangeStart = (() => {
      const d = new Date(); d.setHours(0, 0, 0, 0);   // midnight today
      if (this._range === 'today') return d;
      if (this._range === 'week')  { d.setDate(d.getDate() - 6); return d; }
      /* month */                    d.setDate(d.getDate() - 29); return d;
    })();
    const visible = allEntries.filter(e => new Date(e.ts) >= rangeStart);
    const shown   = visible.slice(0, this._page * PAGE_SIZE);
    const hasMore = visible.length > shown.length;
    const remaining = visible.length - shown.length;

    // ── build DOM ────────────────────────────────────────────────────────────

    const shadow = this.shadowRoot;
    shadow.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = LH_STYLES;
    shadow.appendChild(style);

    const card = document.createElement('div');
    card.className = 'card';

    // Range row
    const rangeRow = document.createElement('div');
    rangeRow.className = 'range-row';
    [['today', 'Dziś'], ['week', 'Tydzień'], ['month', 'Miesiąc']].forEach(([key, label]) => {
      const btn = document.createElement('div');
      btn.className = 'range-btn' + (this._range === key ? ' active' : '');
      btn.textContent = label;
      btn.addEventListener('click', () => {
        this._range = key;
        this._page  = 1;
        this._render();
      });
      rangeRow.appendChild(btn);
    });
    card.appendChild(rangeRow);

    // Timeline
    const timeline = document.createElement('div');
    timeline.className = 'timeline';

    const line = document.createElement('div');
    line.className = 'timeline-line';
    timeline.appendChild(line);

    if (visible.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'Brak zdarzeń w tym zakresie';
      timeline.appendChild(empty);
    } else {
      let lastDate = null;
      let firstSep = true;

      shown.forEach(e => {
        const dk = dateKey(e.ts);
        if (dk !== lastDate) {
          const sep = document.createElement('div');
          sep.className = 'day-sep' + (firstSep ? ' first' : '');
          sep.textContent = fmtDate(e.ts);
          timeline.appendChild(sep);
          lastDate = dk;
          firstSep = false;
        }

        const ns  = nodeStyle(e);
        const td  = titleAndDetail(e, PEOPLE);

        // entry wrapper
        const entry = document.createElement('div');
        entry.className = 'entry';

        // node
        const node = document.createElement('div');
        node.className = 'entry-node';
        node.style.background  = ns.bg;
        node.style.outlineColor = ns.outline;
        node.innerHTML = iconSvg(e);
        entry.appendChild(node);

        // body
        const body = document.createElement('div');
        body.className = 'entry-body';

        // main (title + detail)
        const main = document.createElement('div');
        main.className = 'entry-main';

        const titleEl = document.createElement('div');
        titleEl.className = 'entry-title';
        titleEl.style.color = td.titleColor;
        titleEl.textContent = td.titleText;
        main.appendChild(titleEl);

        if (td.detail) {
          const detailEl = document.createElement('div');
          detailEl.className = 'entry-detail';
          detailEl.style.whiteSpace = 'pre-line';
          detailEl.textContent = td.detail;
          main.appendChild(detailEl);
        }

        body.appendChild(main);

        // right (avatars + time)
        const right = document.createElement('div');
        right.className = 'entry-right';

        if (td.avatarPeople && td.avatarPeople.length > 0) {
          const avatarsEl = document.createElement('div');
          avatarsEl.className = 'avatars';
          td.avatarPeople.forEach((pk, i) => {
            const p = PEOPLE[pk];
            if (!p) return;
            const av = document.createElement('div');
            av.className = 'avatar';
            av.style.background  = p.bg;
            av.style.marginLeft  = i === 0 ? '0' : '-5px';
            if (p.img) {
              const img = document.createElement('img');
              img.src = p.img;
              av.appendChild(img);
            } else {
              const sp = document.createElement('span');
              sp.textContent = p.initials;
              sp.style.color = p.text;
              av.appendChild(sp);
            }
            avatarsEl.appendChild(av);
          });
          right.appendChild(avatarsEl);
        }

        if (td.rightSvg) {
          const iconWrap = document.createElement('div');
          iconWrap.innerHTML = td.rightSvg;
          right.appendChild(iconWrap);
        }

        const timeEl = document.createElement('div');
        timeEl.className = 'entry-time';
        timeEl.textContent = lhcFmtTime(e.ts);
        right.appendChild(timeEl);

        body.appendChild(right);
        entry.appendChild(body);
        timeline.appendChild(entry);
      });
    }

    card.appendChild(timeline);

    // Load more
    if (hasMore) {
      const more = document.createElement('div');
      more.className = 'load-more';
      more.textContent = `Pokaż więcej (${remaining})`;
      more.addEventListener('click', () => {
        this._page++;
        this._render();
      });
      card.appendChild(more);
    }

    shadow.appendChild(card);
  }

  getCardSize() { return 4; }
}

customElements.define('aha-log-history-card', AhaLogHistoryCard);
customElements.define('log-history-card', class extends AhaLogHistoryCard {});

})(); // end IIFE
/**
 * roborock-vacuum-card.js
 * Custom Lovelace card for Roborock Saros 10R (vacuum.marty_mccleaner)
 *
 * Two display modes toggled by icon in top-right corner:
 *   slim    — compact 64px bar
 *   verbose — full card with stats, dock diagram, consumables, actions
 *
 * Registration: roborock-vacuum-card + alias aha-roborock-vacuum-card
 *
 * ─────────────────────────────────────────────────────────────────────
 * PEŁNA KONFIGURACJA YAML
 * ─────────────────────────────────────────────────────────────────────
 *
 * type: custom:roborock-vacuum-card
 *
 * # Wymagane
 * entity: vacuum.marty_mccleaner
 *
 * # Opcjonalne — nazwa wyświetlana (fallback: friendly_name encji)
 * name: Marty McCleaner
 *
 * # Tryb startowy: 'slim' (default) lub 'verbose'
 * default_mode: slim
 *
 * # Encja dokstacji (opcjonalne) — jeśli dok ma osobną encję w HA
 * dock_entity: vacuum.marty_mccleaner_dock
 *
 * # Pokaż/ukryj sekcję doku w trybie verbose (default: true)
 * # false = sekcja doku nigdy nie jest wyświetlana
 * # true  = sekcja doku widoczna gdy dock_entity podany LUB gdy
 * #         robot myje/suszy mop, opróżnia pojemnik lub ładuje się
 * show_dock: true
 *
 * # Podgląd mapy (opcjonalne) — image entity z Roborock integration
 * map_image: image.marty_mccleaner_salon
 *
 * sensors:
 *   # Poziom baterii robota (unit: %)
 *   battery:          sensor.marty_mccleaner_battery
 *
 *   # Powierzchnia sprzątana w bieżącej sesji (unit: m²)
 *   area:             sensor.marty_mccleaner_cleaning_area
 *
 *   # Czas trwania bieżącej sesji (unit: min)
 *   time:             sensor.marty_mccleaner_cleaning_time
 *
 *   # Postęp sprzątania bieżącej sesji (unit: %)
 *   progress:         sensor.marty_mccleaner_cleaning_progress
 *
 *   # Aktualnie sprzątany pokój
 *   current_room:     sensor.marty_mccleaner_current_room
 *
 *   # Szczegółowy status (washing_the_mop, air_drying_stopping, itp.)
 *   status:           sensor.marty_mccleaner_status
 *
 *   # Kod aktywnego błędu (none gdy brak)
 *   vacuum_error:     sensor.marty_mccleaner_vacuum_error
 *
 *   # Statystyki łączne (życiowe)
 *   total_area:       sensor.marty_mccleaner_total_cleaning_area
 *   total_time:       sensor.marty_mccleaner_total_cleaning_time
 *   total_count:      sensor.marty_mccleaner_total_cleaning_count
 *
 *   # Konsumables — czas pozostały do wymiany (unit: h)
 *   filter_left:      sensor.marty_mccleaner_filter_time_left
 *   main_brush_left:  sensor.marty_mccleaner_main_brush_time_left
 *   side_brush_left:  sensor.marty_mccleaner_side_brush_time_left
 *   sensor_left:      sensor.marty_mccleaner_sensor_time_left
 *
 * binary_sensors:
 *   # Czy robot aktualnie się ładuje
 *   charging:         binary_sensor.marty_mccleaner_charging
 *
 *   # Czy mop jest założony
 *   mop_attached:     binary_sensor.marty_mccleaner_mop_attached
 *
 *   # Czy pojemnik na wodę jest założony
 *   water_box:        binary_sensor.marty_mccleaner_water_box_attached
 *
 *   # Alarm braku wody — pokazuje czerwony alert
 *   water_shortage:   binary_sensor.marty_mccleaner_water_shortage
 *
 * selects:
 *   # Intensywność mopowania: off, slight, low, medium, moderate, high, extreme
 *   mop_intensity:    select.marty_mccleaner_mop_intensity
 *
 *   # Tryb mopowania: standard, deep, deep_plus, fast, smart_mode, custom
 *   mop_mode:         select.marty_mccleaner_mop_mode
 *
 *   # Wybrana mapa
 *   selected_map:     select.marty_mccleaner_selected_map
 *
 * ─────────────────────────────────────────────────────────────────────
 * MINIMALNA KONFIGURACJA (tylko encja główna)
 * ─────────────────────────────────────────────────────────────────────
 *
 * type: custom:roborock-vacuum-card
 * entity: vacuum.marty_mccleaner
 *
 * ─────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const STATUS_GROUPS = {
  cleaning:    ['cleaning', 'segment_cleaning', 'zoned_cleaning', 'spot_cleaning', 'manual_mode'],
  mopping:     ['robot_status_mopping', 'segment_mopping', 'zoned_mopping'],
  combo:       ['clean_mop_cleaning', 'clean_mop_mopping',
                'segment_clean_mop_cleaning', 'segment_clean_mop_mopping',
                'zoned_clean_mop_cleaning', 'zoned_clean_mop_mopping'],
  returning:   ['returning_home', 'going_to_target', 'going_to_wash_the_mop', 'back_to_dock_washing_duster'],
  docking:     ['docking'],
  mop_washing: ['washing_the_mop', 'washing_the_mop_2'],
  mop_drying:  ['air_drying_stopping'],
  emptying:    ['emptying_the_bin'],
  charging:    ['charging', 'charging_complete'],
  idle:        ['idle', 'charger_disconnected', 'starting'],
  error:       ['error', 'charging_problem', 'low_battery', 'battery_error'],
  locked:      ['locked'],
  updating:    ['updating', 'shutting_down'],
  offline:     ['device_offline'],
};

const ACCENT = {
  cleaning:    '#97C459',
  mopping:     '#85B7EB',
  combo:       '#97C459',
  returning:   '#85B7EB',
  docking:     '#85B7EB',
  mop_washing: '#7BAED4',
  mop_drying:  '#C97A50',
  emptying:    '#EF9F27',
  charging:    '#5F5E5A',
  idle:        '#888780',
  error:       '#E24B4A',
  locked:      '#E24B4A',
  updating:    '#888780',
  offline:     '#E24B4A',
};

const BADGE_LABELS = {
  cleaning:    'sprząta',
  mopping:     'mopuje',
  combo:       'sprząta+mop',
  returning:   'wraca',
  docking:     'dokuje',
  mop_washing: 'myje mop',
  mop_drying:  'suszy mop',
  emptying:    'opróżnia',
  charging:    'w bazie',
  idle:        'czeka',
  error:       'błąd',
  locked:      'zablokowany',
  updating:    'aktualizuje',
  offline:     'offline',
};

const FAN_MAP = {
  quiet:                { label: 'cichy',        col: '#7BAED4', bg: 'rgba(123,174,212,0.12)' },
  balanced:             { label: 'zbalansowany', col: '#85B7EB', bg: 'rgba(133,183,235,0.12)' },
  turbo:                { label: 'turbo',        col: '#E8724A', bg: 'rgba(232,114,74,0.12)'  },
  max:                  { label: 'max',           col: '#E24B4A', bg: 'rgba(226,75,74,0.12)'   },
  max_plus:             { label: 'max+',          col: '#E24B4A', bg: 'rgba(226,75,74,0.12)'   },
  off_raise_main_brush: { label: 'szczotka',      col: '#888780', bg: 'rgba(136,135,128,0.12)' },
  smart_mode:           { label: 'smart',         col: '#5E9CF5', bg: 'rgba(94,156,245,0.12)'  },
  custom:               { label: 'własny',        col: '#888780', bg: 'rgba(136,135,128,0.12)' },
};

const MOP_INTENSITY_MAP = {
  off:      null,
  slight:   { label: 'mop: mini',    col: '#7BAED4', bg: 'rgba(123,174,212,0.12)' },
  low:      { label: 'mop: lekko',   col: '#7BAED4', bg: 'rgba(123,174,212,0.12)' },
  medium:   { label: 'mop: średnio', col: '#85B7EB', bg: 'rgba(133,183,235,0.12)' },
  moderate: { label: 'mop: mocno',   col: '#C97A50', bg: 'rgba(201,122,80,0.12)'  },
  high:     { label: 'mop: bardzo',  col: '#C97A50', bg: 'rgba(201,122,80,0.12)'  },
  extreme:  { label: 'mop: max',     col: '#E8724A', bg: 'rgba(232,114,74,0.12)'  },
};

const MOP_MODE_MAP = {
  standard:   { label: 'standard',  col: '#85B7EB', bg: 'rgba(133,183,235,0.12)' },
  deep:       { label: 'głęboko',   col: '#7BAED4', bg: 'rgba(123,174,212,0.12)' },
  deep_plus:  { label: 'głęboko+',  col: '#7BAED4', bg: 'rgba(123,174,212,0.12)' },
  fast:       { label: 'szybko',    col: '#EF9F27', bg: 'rgba(239,159,39,0.12)'  },
  smart_mode: { label: 'smart',     col: '#5E9CF5', bg: 'rgba(94,156,245,0.12)'  },
  custom:     { label: 'własny',    col: '#888780', bg: 'rgba(136,135,128,0.12)' },
};

const CONSUMABLES = [
  { key: 'filter_left',     label: 'Filtr',          maxHours: 150, warnAt: 30  },
  { key: 'main_brush_left', label: 'Szczotka gł.',   maxHours: 300, warnAt: 60  },
  { key: 'side_brush_left', label: 'Szczotka bocz.', maxHours: 200, warnAt: 40  },
  { key: 'sensor_left',     label: 'Czujnik',        maxHours: 30,  warnAt: 8   },
];

const ERROR_MAP = {
  none:                    null,
  lidar_blocked:           'LiDAR zasłonięty — wyczyść czujnik',
  bumper_stuck:            'Zderzak zablokowany',
  wheels_suspended:        'Koła w powietrzu — sprawdź podłogę',
  cliff_sensor_error:      'Błąd czujnika krawędzi',
  main_brush_jammed:       'Szczotka główna zablokowana',
  side_brush_jammed:       'Szczotka boczna zablokowana',
  wheels_jammed:           'Koła zablokowane',
  robot_trapped:           'Robot utknął — pomóż mu',
  no_dustbin:              'Brak pojemnika na pył',
  strainer_error:          'Błąd filtra',
  compass_error:           'Błąd kompasu',
  low_battery:             'Niski poziom baterii',
  charging_error:          'Błąd ładowania',
  wall_sensor_dirty:       'Brudny czujnik ściany',
  robot_tilted:            'Robot przechylony',
  side_brush_error:        'Błąd szczotki bocznej',
  fan_error:               'Błąd wentylatora',
  dock:                    'Problem z dokiem',
  optical_flow_sensor_dirt:'Brudny czujnik optyczny',
  robot_on_carpet:         'Robot na dywanie (mop)',
  filter_blocked:          'Filtr zatkany — wyczyść',
  invisible_wall_detected: 'Wykryto wirtualną ścianę',
  cannot_cross_carpet:     'Nie może przejechać po dywanie',
  mopping_roller_1:        'Problem z wałkiem mopa',
  mopping_roller_error_2:  'Problem z wałkiem mopa (2)',
  clear_water_box_hoare:   'Brudny pojemnik czystej wody',
  dirty_water_box_hoare:   'Brudny pojemnik brudnej wody',
  water_carriage_drop:     'Upadł pojemnik z wodą',
  up_water_exception:      'Problem z pompą wody (nalewanie)',
  drain_water_exception:   'Problem z pompą wody (odprowadzanie)',
  temperature_protection:  'Ochrona temperatury aktywna',
  audio_error:             'Błąd głośnika',
};

const DOCK_STATUS_LABELS = {
  washing_the_mop:           { icon: '🫧', text: 'myje mop',           color: '#7BAED4' },
  washing_the_mop_2:         { icon: '🫧', text: 'myje mop (2)',        color: '#7BAED4' },
  going_to_wash_the_mop:     { icon: '↩',  text: 'jedzie myć mop',      color: '#85B7EB' },
  air_drying_stopping:       { icon: '🌡', text: 'suszy mop',           color: '#C97A50' },
  emptying_the_bin:          { icon: '🌪', text: 'opróżnia pył',        color: '#EF9F27' },
  back_to_dock_washing_duster:{ icon: '↩', text: 'wraca myć szczotkę', color: '#85B7EB' },
  charging:                  { icon: '⚡', text: 'ładuje',             color: '#97C459' },
  charging_complete:         { icon: '✓',  text: 'naładowany',          color: '#97C459' },
  idle:                      { icon: '·',  text: 'gotowy',              color: '#5F5E5A' },
};

const ACTIONS = [
  { id: 'start',  label: 'Start',    svc: 'vacuum.start',          col: '#97C459', show: ['docked','idle'] },
  { id: 'pause',  label: 'Pauza',    svc: 'vacuum.pause',          col: '#EF9F27', show: ['cleaning'] },
  { id: 'resume', label: 'Wznów',    svc: 'vacuum.start',          col: '#97C459', show: ['paused'] },
  { id: 'stop',   label: 'Stop',     svc: 'vacuum.stop',           col: '#E24B4A', show: ['cleaning','returning','paused'] },
  { id: 'dock',   label: 'Do bazy',  svc: 'vacuum.return_to_base', col: '#85B7EB', show: ['cleaning','paused','idle'] },
  { id: 'locate', label: 'Znajdź',   svc: 'vacuum.locate',         col: '#888780', show: ['idle','docked','paused'] },
];

const PULSE_ANIM = {
  cleaning:    'vac-pulse-green  2.4s ease-in-out infinite',
  mopping:     'vac-pulse-blue   2.4s ease-in-out infinite',
  combo:       'vac-pulse-green  2.4s ease-in-out infinite',
  returning:   'vac-pulse-blue   2.4s ease-in-out infinite',
  docking:     'vac-pulse-blue   2.4s ease-in-out infinite',
  mop_washing: 'vac-pulse-blue   2.4s ease-in-out infinite',
  mop_drying:  'vac-pulse-orange 2.4s ease-in-out infinite',
};

const ACTIVE_BADGE_GROUPS = new Set(['cleaning','mopping','combo','returning','docking','mop_washing','mop_drying','emptying']);

// ─────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────

function getStatusGroup(status) {
  if (!status) return 'idle';
  for (const [group, statuses] of Object.entries(STATUS_GROUPS)) {
    if (statuses.includes(status)) return group;
  }
  return 'idle';
}

function batteryColor(pct, isCharging) {
  if (isCharging) return '#97C459';
  if (pct > 60) return '#97C459';
  if (pct > 30) return '#EF9F27';
  return '#E24B4A';
}

function fmtHours(h) {
  if (h === null || h === undefined || isNaN(h)) return '—';
  const n = parseFloat(h);
  if (n >= 1) {
    const hh = Math.floor(n);
    const mm = Math.round((n - hh) * 60);
    return mm > 0 ? `${hh}h ${mm}min` : `${hh}h`;
  }
  return `${Math.round(n * 60)}min`;
}

function fmtArea(m2) {
  if (m2 === null || m2 === undefined || m2 === '' || m2 === 'unavailable') return '—';
  const n = parseFloat(m2);
  if (isNaN(n)) return '—';
  return `${n.toFixed(1)} m²`;
}

function fmtTime(minutes) {
  if (minutes === null || minutes === undefined || minutes === '' || minutes === 'unavailable') return '—';
  const n = parseInt(minutes);
  if (isNaN(n)) return '—';
  if (n >= 60) return `${Math.floor(n/60)}h ${n % 60}min`;
  return `${n} min`;
}

function fmtDurationSec(sec) {
  if (!sec || sec <= 0) return null;
  const m = Math.ceil(sec / 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm > 0 ? `~${h}h ${rm}min` : `~${h}h`;
  }
  return `~${m}min`;
}

function fmtLastDate(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return isToday ? `dziś ${hh}:${mm}` : `${d.getDate()}.${d.getMonth()+1} ${hh}:${mm}`;
  } catch(_) { return '—'; }
}

function consumablePct(hoursLeft, maxHours) {
  return Math.max(0, Math.min(100, (parseFloat(hoursLeft) / maxHours) * 100));
}

function consumableColor(pct) {
  if (pct <= 10) return '#E24B4A';
  if (pct <= 30) return '#EF9F27';
  return '#97C459';
}

// ─────────────────────────────────────────────
// SVG icons
// ─────────────────────────────────────────────

function svgCleaning(color) {
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="animation:vac-spin 2s linear infinite;flex-shrink:0;">
    <circle cx="11" cy="11" r="8" stroke="${color}" stroke-width="1.5" stroke-dasharray="3 2.5"/>
    <circle cx="11" cy="11" r="3" fill="${color}"/>
    <line x1="11" y1="3"  x2="11" y2="7"  stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="19" y1="11" x2="15" y2="11" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="11" y1="19" x2="11" y2="15" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="3"  y1="11" x2="7"  y2="11" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`;
}

function svgMopping() {
  const c = '#85B7EB';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="animation:vac-spin 2s linear infinite;flex-shrink:0;">
    <circle cx="11" cy="9" r="6" stroke="${c}" stroke-width="1.5" stroke-dasharray="3 2.5"/>
    <circle cx="11" cy="9" r="2.5" fill="${c}"/>
    <line x1="11" y1="3"  x2="11" y2="6"  stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="17" y1="9"  x2="14" y2="9"  stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="11" y1="15" x2="11" y2="12" stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="5"  y1="9"  x2="8"  y2="9"  stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>
    <circle cx="7"  cy="19" r="1" fill="${c}" opacity="0.6"/>
    <circle cx="11" cy="20" r="1" fill="${c}" opacity="0.6"/>
    <circle cx="15" cy="19" r="1" fill="${c}" opacity="0.6"/>
  </svg>`;
}

function svgReturning() {
  const c = '#85B7EB';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="animation:vac-move 1.5s ease-in-out infinite alternate;flex-shrink:0;">
    <path d="M5 11 L14 11" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M9 7 L5 11 L9 15" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="17" cy="11" r="2.5" fill="${c}"/>
  </svg>`;
}

function svgMopWashing() {
  const c = '#7BAED4';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <path d="M7 4 Q7 2 9 5 Q11 8 9 10 Q7 12 7 10 Q5 7 7 4Z" fill="${c}" opacity="0.8"/>
    <path d="M4 16 Q11 12 18 16" stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>
    <circle cx="7"  cy="17" r="1" fill="${c}" style="animation:vac-water-drop 1.2s 0.0s ease-in-out infinite"/>
    <circle cx="11" cy="18" r="1" fill="${c}" style="animation:vac-water-drop 1.2s 0.4s ease-in-out infinite"/>
    <circle cx="15" cy="17" r="1" fill="${c}" style="animation:vac-water-drop 1.2s 0.8s ease-in-out infinite"/>
  </svg>`;
}

function svgMopDrying() {
  const c = '#C97A50';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <path d="M7 16 Q9 14 11 16 Q13 18 15 16" stroke="${c}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M8 12 Q10 9 12 12" stroke="${c}" stroke-width="1.2" fill="none" stroke-linecap="round"
          style="animation:vac-heat 1.5s 0.0s ease-in-out infinite"/>
    <path d="M8 8  Q10 5 12 8"  stroke="${c}" stroke-width="1.0" fill="none" stroke-linecap="round"
          style="animation:vac-heat 1.5s 0.3s ease-in-out infinite" opacity="0.6"/>
    <path d="M8 4  Q10 1 12 4"  stroke="${c}" stroke-width="0.8" fill="none" stroke-linecap="round"
          style="animation:vac-heat 1.5s 0.6s ease-in-out infinite" opacity="0.3"/>
  </svg>`;
}

function svgDocked(dotColor) {
  const c = '#5F5E5A';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <rect x="6" y="8" width="10" height="9" rx="1.5" stroke="${c}" stroke-width="1.4"/>
    <path d="M9 6 L9 8 M13 6 L13 8" stroke="${c}" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="11" cy="12.5" r="1.8" fill="${dotColor || '#97C459'}"/>
  </svg>`;
}

function svgPaused() {
  const c = '#EF9F27';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <rect x="7" y="5" width="2.5" height="12" rx="1.2" fill="${c}"/>
    <rect x="12.5" y="5" width="2.5" height="12" rx="1.2" fill="${c}"/>
  </svg>`;
}

function svgError() {
  const c = '#E24B4A';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <circle cx="11" cy="11" r="8" stroke="${c}" stroke-width="1.4"/>
    <path d="M11 6.5 L11 12" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="11" cy="15" r="1" fill="${c}"/>
  </svg>`;
}

function svgIdle() {
  const c = '#888780';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <circle cx="11" cy="11" r="7" stroke="${c}" stroke-width="1.4"/>
    <circle cx="11" cy="11" r="2.5" fill="${c}"/>
  </svg>`;
}

function svgEmptying() {
  const c = '#EF9F27';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <path d="M7 4 L15 4 L14 14 L8 14 Z" stroke="${c}" stroke-width="1.3" fill="rgba(239,159,39,0.15)" stroke-linejoin="round"/>
    <path d="M5 4 L17 4" stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M9 4 L9 2 L13 2 L13 4" stroke="${c}" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="11" y1="17" x2="11" y2="20" stroke="${c}" stroke-width="1.3" stroke-linecap="round" style="animation:vac-water-drop 1s ease-in-out infinite"/>
  </svg>`;
}

function svgToggleExpand() {
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.2"/>
    <line x1="5" y1="9" x2="13" y2="9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="9" y1="5" x2="9"  y2="13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`;
}

function svgToggleCollapse() {
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.2"/>
    <line x1="5" y1="9" x2="13" y2="9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`;
}

function getStateIcon(group, dotColor) {
  switch (group) {
    case 'cleaning':    return svgCleaning('#97C459');
    case 'mopping':     return svgMopping();
    case 'combo':       return svgCleaning('#97C459');
    case 'returning':
    case 'docking':     return svgReturning();
    case 'mop_washing': return svgMopWashing();
    case 'mop_drying':  return svgMopDrying();
    case 'emptying':    return svgEmptying();
    case 'charging':    return svgDocked(dotColor || '#97C459');
    case 'error':       return svgError();
    case 'locked':      return svgError();
    default:            return svgIdle();
  }
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const CARD_STYLES = `
  :host { display: block; width: 100%; }
  * { box-sizing: border-box; }

  @keyframes vac-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes vac-pulse-green {
    0%, 100% { box-shadow: 0 0 0 0   rgba(151,196,89,0.0); }
    50%       { box-shadow: 0 0 0 5px rgba(151,196,89,0.18); }
  }
  @keyframes vac-pulse-blue {
    0%, 100% { box-shadow: 0 0 0 0   rgba(133,183,235,0.0); }
    50%       { box-shadow: 0 0 0 5px rgba(133,183,235,0.18); }
  }
  @keyframes vac-pulse-orange {
    0%, 100% { box-shadow: 0 0 0 0   rgba(201,122,80,0.0); }
    50%       { box-shadow: 0 0 0 5px rgba(201,122,80,0.18); }
  }
  @keyframes vac-pulse-error {
    0%, 100% { opacity: 0; }
    50%       { opacity: 1; }
  }
  @keyframes vac-pulse-charging {
    0%, 100% { filter: drop-shadow(0 0 0px rgba(151,196,89,0)); }
    50%       { filter: drop-shadow(0 0 5px rgba(151,196,89,0.55)); }
  }
  @keyframes vac-dot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.2; }
  }
  @keyframes vac-move {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-3px); }
  }
  @keyframes vac-water-drop {
    0%, 100% { opacity: 0.2; transform: translateY(0); }
    50%       { opacity: 1.0; transform: translateY(2px); }
  }
  @keyframes vac-heat {
    0%   { opacity: 0.2; transform: translateY(0); }
    50%  { opacity: 0.8; transform: translateY(-3px); }
    100% { opacity: 0.2; transform: translateY(0); }
  }
  @keyframes vac-mop-sway {
    0%   { transform: translateX(-2px); }
    100% { transform: translateX(2px); }
  }

  .card {
    background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
    border-radius: 16px;
    font-family: -apple-system, system-ui, sans-serif;
    position: relative;
    overflow: hidden;
    transition: border-color 0.4s ease, box-shadow 0.4s ease;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  .card.slim {
    cursor: pointer;
  }
  .card.slim:active {
    transform: scale(0.97);
    transition: transform 0.15s ease;
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    opacity: 0.3;
    cursor: pointer;
    color: #F1EFE8;
    flex-shrink: 0;
    transition: opacity 0.15s ease;
    -webkit-tap-highlight-color: transparent;
    border: none;
    background: none;
    padding: 0;
  }
  .toggle-btn:hover { opacity: 0.65; }
  .toggle-btn:active { transform: scale(0.92); }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 99px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .badge-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .badge-dot.pulse {
    animation: vac-dot 1.8s ease-in-out infinite;
  }

  .sep {
    height: 1px;
    background: rgba(255,255,255,0.05);
    margin: 0;
  }

  .section {
    padding: 12px 14px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 4px;
  }
  .stat-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px;
    background: rgba(255,255,255,0.06);
    border-radius: 10px;
  }
  .stat-value {
    font-size: 16px;
    font-weight: 600;
    color: #F1EFE8;
    line-height: 1.1;
    text-align: center;
  }
  .stat-label {
    font-size: 10px;
    color: #888780;
    text-align: center;
    line-height: 1.2;
  }

  .bar-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .bar-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .bar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .bar-label {
    font-size: 11px;
    color: #888780;
  }
  .bar-value {
    font-size: 11px;
    color: rgba(255,255,255,0.45);
  }
  .bar-track {
    height: 4px;
    border-radius: 99px;
    background: rgba(255,255,255,0.07);
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.6s ease;
  }

  .chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
  }
  .chip {
    padding: 4px 9px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
  }

  .water-alert {
    margin-top: 8px;
    background: rgba(226,75,74,0.12);
    border: 1px solid rgba(226,75,74,0.25);
    border-radius: 8px;
    padding: 8px 12px;
    color: #E24B4A;
    font-size: 11px;
    font-weight: 500;
  }

  .dock-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .dock-title {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.28);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .dock-status-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 6px;
  }
  .dock-status-item {
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* ── Consumables — compact icon row ── */
  .consumables {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .ci {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 9px;
    cursor: default;
    flex-shrink: 0;
  }
  .ci:hover .ct { display: block; }
  .ct {
    display: none;
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    min-width: 130px;
    background: rgba(36,36,38,0.97);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 10px;
    padding: 10px 12px;
    z-index: 30;
    box-shadow: 0 6px 20px rgba(0,0,0,0.55);
    pointer-events: none;
    white-space: nowrap;
  }
  .ct-label {
    font-size: 11px;
    font-weight: 600;
    color: #F5F5F7;
    margin-bottom: 6px;
  }
  .ct-bar-track {
    height: 3px;
    border-radius: 99px;
    background: rgba(255,255,255,0.12);
    overflow: hidden;
    margin-bottom: 5px;
  }
  .ct-bar-fill { height: 100%; border-radius: 99px; }
  .ct-value { font-size: 11px; }

  .lifetime-row {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.05);
    font-size: 10px;
    color: rgba(255,255,255,0.28);
    text-align: center;
  }

  .actions-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .action-btn {
    background: transparent;
    border-radius: 10px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 500;
    font-family: -apple-system, system-ui, sans-serif;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .action-btn:active { transform: scale(0.97); }

  .error-box {
    background: rgba(226,75,74,0.10);
    border: 1px solid rgba(226,75,74,0.25);
    border-radius: 10px;
    padding: 10px 14px;
    color: #E24B4A;
    font-size: 12px;
    font-weight: 500;
    grid-column: 1 / -1;
  }
  .error-box .err-title {
    font-weight: 600;
    margin-bottom: 2px;
  }
  .error-box .err-desc {
    font-size: 11px;
    opacity: 0.75;
  }

  .header-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .header-text {
    flex: 1;
    min-width: 0;
  }
  .header-name {
    font-size: 14px;
    font-weight: 600;
    color: #F1EFE8;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .header-sub {
    font-size: 11px;
    color: #888780;
    margin-top: 1px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// ─────────────────────────────────────────────
// Web Component
// ─────────────────────────────────────────────

class RoboVacuumCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._mode = 'slim';
    this._hass = null;
    this._config = null;
    this._lastState = null;
    this._lastMode = null;
  }

  setConfig(config) {
    if (!config.entity) throw new Error('roborock-vacuum-card: wymagane pole "entity"');
    this._config = {
      entity: config.entity,
      name: config.name || null,
      default_mode: config.default_mode || 'slim',
      sensors: { ...(config.sensors || {}) },
      binary_sensors: { ...(config.binary_sensors || {}) },
      selects: { ...(config.selects || {}) },
      dock_entity: config.dock_entity || null,
      map_image: config.map_image || null,
      show_dock: config.show_dock !== false,   // default: true
      dock_sensors: { ...(config.dock_sensors || {}) },
      dock_binary_sensors: { ...(config.dock_binary_sensors || {}) },
    };
    // Apply default entity IDs if not provided
    const base = 'marty_mccleaner';
    const dock = 'saros_10r_dock';
    const s = this._config.sensors;
    const bs = this._config.binary_sensors;
    const sel = this._config.selects;
    const ds = this._config.dock_sensors;
    const dbs = this._config.dock_binary_sensors;

    if (!s.battery)         s.battery         = `sensor.${base}_battery`;
    if (!s.area)            s.area            = `sensor.${base}_cleaning_area`;
    if (!s.time)            s.time            = `sensor.${base}_cleaning_time`;
    if (!s.progress)        s.progress        = `sensor.${base}_cleaning_progress`;
    if (!s.current_room)    s.current_room    = `sensor.${base}_current_room`;
    if (!s.status)          s.status          = `sensor.${base}_status`;
    if (!s.vacuum_error)    s.vacuum_error    = `sensor.${base}_vacuum_error`;
    if (!s.total_area)      s.total_area      = `sensor.${base}_total_cleaning_area`;
    if (!s.total_time)      s.total_time      = `sensor.${base}_total_cleaning_time`;
    if (!s.total_count)     s.total_count     = `sensor.${base}_total_cleaning_count`;
    if (!s.filter_left)     s.filter_left     = `sensor.${base}_filter_time_left`;
    if (!s.main_brush_left) s.main_brush_left = `sensor.${base}_main_brush_time_left`;
    if (!s.side_brush_left) s.side_brush_left = `sensor.${base}_side_brush_time_left`;
    if (!s.sensor_left)     s.sensor_left     = `sensor.${base}_sensor_time_left`;

    if (!bs.charging)       bs.charging       = `binary_sensor.${base}_charging`;
    if (!bs.mop_attached)   bs.mop_attached   = `binary_sensor.${base}_mop_attached`;
    if (!bs.water_box)      bs.water_box      = `binary_sensor.${base}_water_box_attached`;
    if (!bs.water_shortage) bs.water_shortage = `binary_sensor.${base}_water_shortage`;

    if (!sel.mop_intensity) sel.mop_intensity = `select.${base}_mop_intensity`;
    if (!sel.mop_mode)      sel.mop_mode      = `select.${base}_mop_mode`;
    if (!sel.selected_map)  sel.selected_map  = `select.${base}_selected_map`;

    if (!this._config.map_image) this._config.map_image = `image.${base}_salon`;

    // Dock entity defaults (saros_10r_dock prefix)
    // device_class: problem → on = PROBLEM, off = OK
    if (!dbs.clean_water_box)  dbs.clean_water_box  = `binary_sensor.${dock}_clean_water_box`;
    if (!dbs.dirty_water_box)  dbs.dirty_water_box  = `binary_sensor.${dock}_dirty_water_box`;
    if (!dbs.cleaning_fluid)   dbs.cleaning_fluid   = `binary_sensor.${dock}_cleaning_fluid`;
    if (!dbs.mop_drying)       dbs.mop_drying       = `binary_sensor.${dock}_mop_drying`;
    if (!ds.dock_error)        ds.dock_error        = `sensor.${dock}_dock_error`;
    if (!ds.mop_drying_time)   ds.mop_drying_time   = `sensor.${dock}_mop_drying_remaining_time`;
    if (!ds.strainer_left)     ds.strainer_left     = `sensor.${dock}_strainer_time_left`;

    this._mode = this._config.default_mode;
  }

  set hass(hass) {
    this._hass = hass;
    const e = hass.states[this._config.entity];
    if (!e) return;
    const sig = e.state + '|' + JSON.stringify(e.attributes) + '|' + this._getSensorSig();
    if (sig === this._lastState && this._mode === this._lastMode) return;
    this._lastState = sig;
    this._lastMode = this._mode;
    this._render();
  }

  getCardSize() {
    return this._mode === 'slim' ? 1 : 5;
  }

  _getSensorSig() {
    const s = this._config.sensors || {};
    const bs = this._config.binary_sensors || {};
    const sel = this._config.selects || {};
    return [
      ...Object.values(s),
      ...Object.values(bs),
      ...Object.values(sel),
    ].map(id => this._hass.states[id]?.state ?? '').join('|');
  }

  _toggleMode() {
    this._mode = this._mode === 'slim' ? 'verbose' : 'slim';
    this._lastMode = null;
    this.hass = this._hass;
  }

  _callService(domain, service, serviceData = {}) {
    this._hass.callService(domain, service, {
      entity_id: this._config.entity,
      ...serviceData,
    });
  }

  _getSensor(key) {
    const id = this._config.sensors?.[key];
    if (!id) return null;
    return this._hass.states[id] || null;
  }

  _getSensorState(key) {
    const s = this._getSensor(key);
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return s.state;
  }

  _getSensorNum(key) {
    const v = this._getSensorState(key);
    if (v === null) return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  _getBinarySensor(key) {
    const id = this._config.binary_sensors?.[key];
    if (!id) return null;
    return this._hass.states[id] || null;
  }

  _isBinaryOn(key) {
    const s = this._getBinarySensor(key);
    return s?.state === 'on';
  }

  _getSelect(key) {
    const id = this._config.selects?.[key];
    if (!id) return null;
    return this._hass.states[id] || null;
  }

  _getSelectState(key) {
    const s = this._getSelect(key);
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return s.state;
  }

  // Dock entity helpers (saros_10r_dock prefix)
  _getDockBinary(key) {
    const id = this._config.dock_binary_sensors?.[key];
    return id ? (this._hass.states[id] || null) : null;
  }
  _isDockProblem(key) {
    // device_class: problem → on = PROBLEM
    return this._getDockBinary(key)?.state === 'on';
  }
  _isDockRunning(key) {
    // device_class: running → on = active
    return this._getDockBinary(key)?.state === 'on';
  }
  _getDockSensorState(key) {
    const id = this._config.dock_sensors?.[key];
    if (!id) return null;
    const s = this._hass.states[id];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return s.state;
  }
  _getDockSensorNum(key) {
    const v = this._getDockSensorState(key);
    if (v === null) return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  // Returns fill level 0–100. Uses numeric sensor if configured, else derives from binary.
  // emptyIsBad=true  → empty = problem (clean water, fluid): ok≈88%, problem≈5%
  // emptyIsBad=false → full  = problem (dirty water, dust):  ok≈8%,  problem≈92%
  _getDockLevel(levelKey, binaryKey, emptyIsBad) {
    const n = this._getDockSensorNum(levelKey);
    if (n !== null) return Math.max(0, Math.min(100, n));
    const isProblem = this._isDockProblem(binaryKey);
    return emptyIsBad ? (isProblem ? 5 : 88) : (isProblem ? 92 : 8);
  }

  // Derive the effective group from vacuum state + status sensor
  _getGroup() {
    const entity = this._hass.states[this._config.entity];
    const vacState = entity?.state || 'idle';
    const statusVal = this._getSensorState('status');

    // Dock binary sensors take highest priority (most accurate)
    if (this._isDockRunning('mop_drying'))  return 'mop_drying';

    // If we have a status sensor, prefer it for dock states
    if (statusVal) {
      const sg = getStatusGroup(statusVal);
      // Dock-specific groups take priority
      if (['mop_washing','mop_drying','emptying','returning','docking','charging'].includes(sg)) {
        return sg;
      }
      // For cleaning states, also trust status sensor
      if (['cleaning','mopping','combo'].includes(sg)) {
        return sg;
      }
    }

    // Fall back to vacuum entity state
    switch (vacState) {
      case 'cleaning':  return statusVal ? getStatusGroup(statusVal) : 'cleaning';
      case 'returning': return 'returning';
      case 'docked':    return this._isBinaryOn('charging') ? 'charging' : 'idle';
      case 'paused':    return 'paused';
      case 'error':     return 'error';
      case 'idle':      return 'idle';
      default:          return 'idle';
    }
  }

  _render() {
    const html = this._mode === 'slim' ? this._renderSlim() : this._renderVerbose();
    this.shadowRoot.innerHTML = `<style>${CARD_STYLES}</style>${html}`;
    this._attachEventListeners();
  }

  _attachEventListeners() {
    this.shadowRoot.querySelector('.toggle-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      this._toggleMode();
    });

    this.shadowRoot.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const svc = btn.dataset.service;
        if (!svc) return;
        const dotIdx = svc.indexOf('.');
        const domain = svc.substring(0, dotIdx);
        const service = svc.substring(dotIdx + 1);
        this._callService(domain, service);
      });
      const col = btn.dataset.color || '#888780';
      btn.style.border = `1px solid ${col}44`;
      btn.style.color = col;
      btn.addEventListener('mouseover', () => {
        btn.style.background = `${col}1F`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'transparent';
      });
    });

    // Tap anywhere on card → more-info (both slim and verbose)
    this.shadowRoot.querySelector('.card')?.addEventListener('click', () => {
      const event = new Event('hass-more-info', { bubbles: true, composed: true });
      event.detail = { entityId: this._config.entity };
      this.dispatchEvent(event);
    });
  }

  _renderSlim() {
    const entity  = this._hass.states[this._config.entity];
    const vacState = entity?.state || 'idle';
    const name    = this._config.name || entity?.attributes?.friendly_name || this._config.entity;
    const group   = this._getGroup();
    const accent  = ACCENT[group] || '#888780';
    const badgeLabel = BADGE_LABELS[group] || group;
    const isActive   = ACTIVE_BADGE_GROUPS.has(group);
    const pulseAnim  = PULSE_ANIM[group] || null;

    const battery   = this._getSensorNum('battery') ?? entity?.attributes?.battery_level ?? null;
    const isCharging = this._isBinaryOn('charging');
    const batPct    = battery !== null ? Math.max(0, Math.min(100, battery)) : 0;
    const batCol    = batteryColor(battery, isCharging);

    // ── Right column (same logic as vacuum.yaml) ───────────────────────
    let rightVal   = '—';
    let rightLabel = '';
    let rightCol   = accent;

    const isActiveClean = ['cleaning','mopping','combo'].includes(group);
    if (group === 'mop_washing') {
      rightVal = '🫧'; rightLabel = 'myje mop';
    } else if (group === 'mop_drying') {
      const sec = this._getDockSensorNum('mop_drying_time');
      rightVal = fmtDurationSec(sec) || '🌡';
      rightLabel = 'suszy mop'; rightCol = '#C97A50';
    } else if (group === 'emptying') {
      rightVal = '🌪'; rightLabel = 'opróżnia';
    } else if (isActiveClean) {
      const timeVal = this._getSensorNum('time');
      if (timeVal !== null) {
        const h = Math.floor(timeVal / 60), m = Math.round(timeVal % 60);
        rightVal  = h > 0 ? `${h}h ${m}m` : `${m}m`;
        rightLabel = 'czas sprzątania';
      }
      rightCol = accent;
    } else if (group === 'returning' || group === 'docking') {
      rightVal = battery !== null ? `${battery}%` : '↩';
      rightLabel = 'bateria'; rightCol = batCol;
    } else {
      // docked / idle / error — show battery %
      rightVal  = battery !== null ? `${battery}%` : '—';
      rightLabel = isCharging ? 'ładuje' : 'bateria';
      rightCol  = batCol;
    }

    // ── Progress bar (cleaning progress or battery) ────────────────────
    let barPct   = batPct;
    let barLabel = isCharging ? 'ładuje' : 'bateria';
    let barCol   = batCol;
    let barGrad  = isCharging
      ? `linear-gradient(90deg,#5A6356,${batCol})`
      : batPct > 60 ? `linear-gradient(90deg,#5F8932,#97C459)`
      : batPct > 30 ? `linear-gradient(90deg,#9A5230,#EF9F27)`
      :               `linear-gradient(90deg,#8F2320,#E24B4A)`;

    if (isActiveClean) {
      const prog = this._getSensorNum('progress');
      if (prog !== null) {
        barPct   = Math.max(0, Math.min(100, prog));
        barLabel = 'postęp sprzątania';
        barCol   = accent;
        barGrad  = `linear-gradient(90deg,${accent}88,${accent})`;
      }
    }

    // ── Chips (fan + mop, compact) ─────────────────────────────────────
    const chips = [];
    const fanSpeed = entity?.attributes?.fan_speed || null;
    if (fanSpeed) {
      const fi = FAN_MAP[fanSpeed] || { label: fanSpeed, col: '#888780', bg: 'rgba(136,135,128,0.12)' };
      chips.push(`<span style="font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;
                               background:${fi.bg};color:${fi.col};white-space:nowrap;">${fi.label}</span>`);
    }
    const mopAttached = this._isBinaryOn('mop_attached');
    const mopIntensity = this._getSelectState('mop_intensity');
    if (mopAttached && mopIntensity && mopIntensity !== 'off') {
      const mi = MOP_INTENSITY_MAP[mopIntensity];
      if (mi) chips.push(`<span style="font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;
                                       background:${mi.bg};color:${mi.col};white-space:nowrap;">${mi.label}</span>`);
    } else if (!mopAttached) {
      chips.push(`<span style="font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;
                               background:rgba(95,94,90,0.10);color:#5F5E5A;white-space:nowrap;">bez mopa</span>`);
    }
    // Show area when cleaning
    if (isActiveClean) {
      const area = this._getSensorNum('area');
      if (area) chips.push(`<span style="font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;
                                         background:rgba(151,196,89,0.10);color:#97C459;white-space:nowrap;">
                                         ${fmtArea(area)}</span>`);
    }
    const chipsRow = chips.length
      ? `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">${chips.join('')}</div>`
      : '';

    // ── Badge ──────────────────────────────────────────────────────────
    const badgeBg = isActive
      ? `background:${accent}24;color:${accent};`
      : `background:rgba(136,135,128,0.12);color:${accent};`;

    // ── Card border + pulse ────────────────────────────────────────────
    const borderStyle = pulseAnim
      ? `border:1px solid ${accent}47;animation:${pulseAnim};`
      : 'border:0.5px solid rgba(255,255,255,0.08);';

    const icon = getStateIcon(group, accent);

    return `
      <div class="card slim" style="${borderStyle}">
        <div style="display:grid;grid-template-columns:4px 1fr auto;gap:0 14px;
                    align-items:stretch;padding:14px 16px;
                    font-family:-apple-system,system-ui,sans-serif;">

          <!-- accent bar -->
          <div style="width:4px;border-radius:16px 0 0 16px;background:${accent};align-self:stretch;"></div>

          <!-- body -->
          <div style="display:flex;flex-direction:column;gap:8px;min-width:0;">

            <!-- row 1: icon + name + badge -->
            <div style="display:flex;align-items:center;gap:8px;">
              ${icon}
              <span style="font-size:13px;font-weight:500;color:#F1EFE8;flex:1;min-width:0;
                           overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span>
              <span class="badge" style="${badgeBg}">
                <span style="width:5px;height:5px;border-radius:50%;flex-shrink:0;background:${accent};
                             ${isActive ? 'animation:vac-dot 1.8s ease-in-out infinite;' : ''}"></span>
                ${badgeLabel}
              </span>
            </div>

            <!-- row 2: chips -->
            ${chipsRow}

            <!-- row 3: progress bar — jak w vacuum.yaml -->
            <div style="display:flex;flex-direction:column;gap:4px;">
              <div style="height:3px;border-radius:99px;background:rgba(255,255,255,0.07);overflow:hidden;">
                <div style="height:100%;width:${barPct.toFixed(1)}%;border-radius:99px;
                            background:${barGrad};transition:width 1s ease;"></div>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="font-size:10px;color:rgba(255,255,255,0.28);">${barLabel}</span>
                <span style="font-size:10px;color:rgba(255,255,255,0.28);">${barPct.toFixed(0)}%</span>
              </div>
            </div>

          </div>

          <!-- right column + toggle — zawsze przy prawej krawędzi -->
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:center;
                        gap:2px;min-width:52px;">
              <span style="font-size:20px;font-weight:600;letter-spacing:-0.5px;line-height:1;
                           color:${rightCol};">${rightVal}</span>
              <span style="font-size:10px;color:rgba(255,255,255,0.28);white-space:nowrap;">${rightLabel}</span>
            </div>
            <button class="toggle-btn" title="Rozwiń">${svgToggleExpand()}</button>
          </div>

        </div>
      </div>`;
  }

  _renderVerbose() {
    const entity = this._hass.states[this._config.entity];
    const vacState = entity?.state || 'idle';
    const name = this._config.name || entity?.attributes?.friendly_name || this._config.entity;

    const group = this._getGroup();
    const accent = ACCENT[group] || '#888780';
    const badgeLabel = BADGE_LABELS[group] || group;
    const isActive = ACTIVE_BADGE_GROUPS.has(group);
    const pulseAnim = PULSE_ANIM[group] || null;

    const battery = this._getSensorNum('battery') ?? entity?.attributes?.battery_level ?? null;
    const isCharging = this._isBinaryOn('charging');
    const batCol = batteryColor(battery, isCharging);
    const batPct = battery !== null ? Math.max(0, Math.min(100, battery)) : 0;

    const currentRoom = this._getSensorState('current_room');
    const area = this._getSensorNum('area');
    const progress = this._getSensorNum('progress');
    const mopAttached = this._isBinaryOn('mop_attached');
    const waterShortage = this._isBinaryOn('water_shortage');

    const icon = getStateIcon(group, isCharging ? '#97C459' : (battery > 20 ? '#97C459' : '#E24B4A'));

    const borderStyle = pulseAnim
      ? `border: 1px solid ${accent}47; animation: ${pulseAnim};`
      : 'border: 0.5px solid rgba(255,255,255,0.08);';

    const badgeBg = isActive
      ? `background: ${accent}24; color: ${accent};`
      : `background: rgba(136,135,128,0.12); color: ${accent};`;

    // Sub-title: current room + area
    let subTitle = '';
    if (currentRoom && currentRoom !== 'unknown' && currentRoom !== 'none') {
      subTitle = currentRoom;
    }
    if (area !== null && ['cleaning','mopping','combo','paused'].includes(group)) {
      subTitle += subTitle ? ` · ${fmtArea(area)}` : fmtArea(area);
    }

    // Show dock section?
    const showDock = this._config.show_dock && (
      this._config.dock_entity ||
      ['mop_washing','mop_drying','emptying','charging'].includes(group)
    );

    const sections = [];

    // ── Section 1: Header ──
    sections.push(`
      <div class="section">
        <div class="header-row">
          <div style="flex-shrink:0;display:flex;align-items:center;">${icon}</div>
          <div class="header-text">
            <div class="header-name">${name}</div>
            ${subTitle ? `<div class="header-sub">${subTitle}</div>` : ''}
          </div>
          <span class="badge" style="${badgeBg}">
            <span class="badge-dot ${isActive ? 'pulse' : ''}" style="background:${accent};"></span>
            ${badgeLabel}
          </span>
          <button class="toggle-btn" title="Zwiń">${svgToggleCollapse()}</button>
        </div>
      </div>
    `);

    // ── Section 2: Contextual stats ──
    sections.push('<div class="sep"></div>');
    sections.push('<div class="section">' + this._renderStats(group, entity, accent) + '</div>');

    // ── Section 3: Battery + progress bars ──
    sections.push('<div class="sep"></div>');
    sections.push(`
      <div class="section">
        <div class="bar-row">
          <div class="bar-item">
            <div class="bar-header">
              <span class="bar-label">Bateria${isCharging ? ' ⚡' : ''}</span>
              <span class="bar-value">${battery !== null ? battery + '%' : '—'}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${batPct}%;background:${batCol};"></div>
            </div>
          </div>
          ${['cleaning','mopping','combo','paused'].includes(group) && progress !== null ? `
          <div class="bar-item">
            <div class="bar-header">
              <span class="bar-label">Postęp</span>
              <span class="bar-value">${Math.round(progress)}%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${Math.round(progress)}%;background:${accent};"></div>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `);

    // ── Section 4: Chips + water shortage ──
    sections.push('<div class="sep"></div>');
    sections.push('<div class="section">' + this._renderChips(group, mopAttached, waterShortage) + '</div>');

    // ── Section 5: Dok + Konsumable (combined) ──
    sections.push('<div class="sep"></div>');
    sections.push('<div class="section">' + this._renderDockAndConsumables(group, showDock) + '</div>');

    return `
      <div class="card verbose" style="${borderStyle}">
        ${sections.join('')}
      </div>
    `;
  }

  _renderStats(group, entity, accent) {
    const area       = this._getSensorNum('area');
    const timeVal    = this._getSensorNum('time');
    const progress   = this._getSensorNum('progress');
    const mopMode    = this._getSelectState('mop_mode');
    const mopIntens  = this._getSelectState('mop_intensity');
    const vacError   = this._getSensorState('vacuum_error');

    if (group === 'error') {
      const errMsg = vacError ? (ERROR_MAP[vacError] || vacError) : 'Nieznany błąd';
      return `
        <div class="error-box">
          <div class="err-title">⚠ Błąd</div>
          <div class="err-desc">${errMsg}</div>
        </div>
      `;
    }

    if (group === 'mop_washing') {
      const mopModeLabel = mopMode ? (MOP_MODE_MAP[mopMode]?.label || mopMode) : '—';
      return `
        <div class="stats-grid">
          <div class="stat-cell">
            <span class="stat-value" style="color:#7BAED4;font-size:20px;">
              <span style="animation:vac-water-drop 1.2s 0.0s ease-in-out infinite;display:inline-block;">🫧</span>
            </span>
            <span class="stat-label">myje mop<br>w doku</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value" style="font-size:12px;color:#7BAED4;">${mopModeLabel}</span>
            <span class="stat-label">tryb mopa</span>
          </div>
        </div>
      `;
    }

    if (group === 'mop_drying') {
      const dryingSec = this._getDockSensorNum('mop_drying_time');
      const dryingStr = fmtDurationSec(dryingSec) || '—';
      return `
        <div class="stats-grid">
          <div class="stat-cell">
            <span class="stat-value" style="color:#C97A50;font-size:20px;">
              <span style="animation:vac-heat 1.5s ease-in-out infinite;display:inline-block;">🌡</span>
            </span>
            <span class="stat-label">suszy mop<br>w doku</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value" style="color:#C97A50;">${dryingStr}</span>
            <span class="stat-label">pozostało</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value" style="font-size:11px;color:#C97A50;">gorące</span>
            <span class="stat-label">powietrze</span>
          </div>
        </div>
      `;
    }

    if (group === 'emptying') {
      return `
        <div class="stats-grid">
          <div class="stat-cell">
            <span class="stat-value" style="color:#EF9F27;font-size:20px;">🌪</span>
            <span class="stat-label">opróżnianie<br>pojemnika</span>
          </div>
        </div>
      `;
    }

    if (['cleaning','mopping','combo','paused'].includes(group)) {
      const areaStr     = area !== null ? fmtArea(area) : '—';
      const timeStr     = timeVal !== null ? fmtTime(timeVal) : '—';
      const progressStr = progress !== null ? `${Math.round(progress)}%` : '—';
      return `
        <div class="stats-grid">
          <div class="stat-cell">
            <span class="stat-value" style="color:${accent};">${areaStr}</span>
            <span class="stat-label">posprzątano</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value" style="color:${accent};">${timeStr}</span>
            <span class="stat-label">czas sesji</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value" style="color:${accent};">${progressStr}</span>
            <span class="stat-label">postęp</span>
          </div>
        </div>
      `;
    }

    // docked / idle / returning / charging — show last session stats
    const attrs = entity?.attributes || {};
    const lastArea     = attrs.last_clean_area     ?? null;
    const lastDuration = attrs.last_clean_duration ?? null;
    const lastStart    = attrs.last_clean_start    ?? null;

    const lastAreaStr     = lastArea     !== null ? fmtArea(lastArea)     : '—';
    const lastDurationStr = lastDuration !== null ? fmtTime(lastDuration) : '—';
    const lastStartStr    = lastStart    !== null ? fmtLastDate(lastStart) : '—';

    return `
      <div class="stats-grid">
        <div class="stat-cell">
          <span class="stat-value">${lastAreaStr}</span>
          <span class="stat-label">ostatnia<br>sesja</span>
        </div>
        <div class="stat-cell">
          <span class="stat-value">${lastDurationStr}</span>
          <span class="stat-label">ostatnia<br>sesja</span>
        </div>
        <div class="stat-cell">
          <span class="stat-value" style="font-size:12px;">${lastStartStr}</span>
          <span class="stat-label">ostatnie<br>sprzątanie</span>
        </div>
      </div>
    `;
  }

  _renderChips(group, mopAttached, waterShortage) {
    const chips = [];

    // Fan speed chip
    const entity = this._hass.states[this._config.entity];
    const fanSpeed = entity?.attributes?.fan_speed || null;
    if (fanSpeed) {
      const fi = FAN_MAP[fanSpeed] || { label: fanSpeed, col: '#888780', bg: 'rgba(136,135,128,0.12)' };
      chips.push(`<span class="chip" style="background:${fi.bg};color:${fi.col};">${fi.label}</span>`);
    }

    // Mop intensity chip (only when mop attached and not 'off')
    const mopIntensity = this._getSelectState('mop_intensity');
    if (mopAttached && mopIntensity && mopIntensity !== 'off') {
      const mi = MOP_INTENSITY_MAP[mopIntensity];
      if (mi) {
        chips.push(`<span class="chip" style="background:${mi.bg};color:${mi.col};">${mi.label}</span>`);
      }
    }

    // Mop mode chip (only when mop attached)
    const mopMode = this._getSelectState('mop_mode');
    if (mopAttached && mopMode) {
      const mm = MOP_MODE_MAP[mopMode] || { label: mopMode, col: '#85B7EB', bg: 'rgba(133,183,235,0.12)' };
      chips.push(`<span class="chip" style="background:${mm.bg};color:${mm.col};">${mm.label}</span>`);
    }

    // Selected map chip
    const selMap = this._getSelectState('selected_map');
    if (selMap && selMap !== 'unknown' && selMap !== 'none') {
      chips.push(`<span class="chip" style="background:rgba(136,135,128,0.12);color:#888780;">${selMap}</span>`);
    }

    let html = `<div class="chips-row">${chips.join('')}</div>`;

    if (waterShortage) {
      html += `<div class="water-alert">⚠ Brak płynu czyszczącego — uzupełnij zanim wróci</div>`;
    }

    return html;
  }

  _renderDockDiagram(group) {
    const isMopWashing  = group === 'mop_washing';
    const isMopDrying   = group === 'mop_drying';
    const isEmptying    = group === 'emptying';
    const isCharging    = this._isBinaryOn('charging');
    const mopAttached   = this._isBinaryOn('mop_attached');
    const statusVal     = this._getSensorState('status') || '';
    const vacError      = this._getSensorState('vacuum_error') || 'none';
    const hasVacError   = vacError !== 'none' && vacError !== 'unknown';

    // Dock sensors (saros_10r_dock) — device_class:problem → on = PROBLEM
    const dirtyBoxProblem  = this._isDockProblem('dirty_water_box');   // brudna woda (lewo góra)
    const cleanBoxProblem  = this._isDockProblem('clean_water_box');   // czysta woda (prawo góra)
    const fluidProblem     = this._isDockProblem('cleaning_fluid');    // płyn czyszczący (lewo dół)
    const dockMopDrying    = this._isDockRunning('mop_drying');        // dok suszy mop
    const dockError        = this._getDockSensorState('dock_error');   // ok / error code
    const hasDockError     = dockError && dockError !== 'ok' && dockError !== 'unknown';
    const mopDryingTimeSec = this._getDockSensorNum('mop_drying_time');// sekundy pozostałe
    const hasError         = hasDockError;                             // dla SVG overlay

    // ── Isometric 30° projection ─────────────────────────────────────────
    // Saros 10R dock: wide rect box, roughly 1:0.7:1.15 (W:D:H)
    // We exaggerate depth slightly for readability
    const W = 72, D = 54, BH = 75, PH = 38; // BH=body height, PH=platform/podest height
    const cos30 = 0.866, sin30 = 0.5;
    const dx  = W * cos30;
    const dy  = W * sin30;
    const ddx = D * cos30;
    const ddy = D * sin30;
    const pl  = 8;
    const pt  = ddy + 10;

    // Parametric helpers — coordinates on each face
    // Front face (u=0..1 left→right, v=0..1 top→bottom) — dock BODY only (height BH)
    const fp = (u, v) => [pl + u * dx,       pt + u * dy + v * BH];
    // Top face  (u=0..1 left→right, d=0..1 front→back)
    const tp = (u, d) => [pl + u * dx + d * ddx, pt + u * dy - d * ddy];
    // Right face (d=0..1 front→back, v=0..1 top→bottom) — dock BODY only (height BH)
    const rp = (d, v) => [pl + dx + d * ddx, pt + dy - d * ddy + v * BH];
    // Platform (podest) face helpers — below dock body (height PH)
    const pFp = (u, v) => [pl + u * dx,       pt + u * dy + BH + v * PH];
    const pRp = (d, v) => [pl + dx + d * ddx, pt + dy - d * ddy + BH + v * PH];

    const poly = pts => pts.map(p => p.join(',')).join(' ');

    // ── Geometry — new layout matching actual Saros 10R dock ────────────
    const frontPts      = poly([fp(0,0), fp(1,0), fp(1,1), fp(0,1)]);
    const rightPts      = poly([rp(0,0), rp(1,0), rp(1,1), rp(0,1)]);
    const topPts        = poly([tp(0,0), tp(1,0), tp(1,1), tp(0,1)]);
    const topDirtyPts   = poly([tp(0,0), tp(0.5,0), tp(0.5,1), tp(0,1)]);
    const topCleanPts   = poly([tp(0.5,0), tp(1,0), tp(1,1), tp(0.5,1)]);
    const topDivLine    = [tp(0.5,0), tp(0.5,1)];

    // Front face — upper: two large tank panels
    const leftTankPts   = poly([fp(0,0.03), fp(0.5,0.03), fp(0.5,0.57), fp(0,0.57)]);
    const rightTankPts  = poly([fp(0.5,0.03), fp(1,0.03), fp(1,0.57), fp(0.5,0.57)]);
    const tankDivLine   = [fp(0.5,0.03), fp(0.5,0.57)];

    // Front face — lower: fluid (left), mop band (right narrow), dock slot (right)
    const fluidPts      = poly([fp(0.02,0.59), fp(0.38,0.59), fp(0.38,0.95), fp(0.02,0.95)]);
    const mopBayPts     = poly([fp(0.40,0.59), fp(0.97,0.59), fp(0.97,0.70), fp(0.40,0.70)]);
    const dockSlotPts   = poly([fp(0.40,0.71), fp(0.97,0.71), fp(0.97,0.97), fp(0.40,0.97)]);

    // Platform (podest) polygons — below dock body
    const platLeftPts  = poly([pFp(0,0), pFp(0.40,0), pFp(0.40,1), pFp(0,1)]);
    const platSlotPts  = poly([pFp(0.40,0), pFp(1,0), pFp(1,1), pFp(0.40,1)]);
    const platRightPts = poly([pRp(0,0), pRp(1,0), pRp(1,1), pRp(0,1)]);

    // Robot docked — floor at BH + PH
    const isRobotDocked = isCharging || ['mop_washing','mop_drying','emptying','charging'].includes(group);
    const Xr_l = 0.685 * W, Zr_l = 0;
    const robotCX = pl + cos30 * (Xr_l + Zr_l);
    const robotRX = 26 * cos30 * Math.SQRT2;
    const robotRY = 26 * sin30 * Math.SQRT2;
    const robotCY = pt + sin30 * (Xr_l - Zr_l) + BH + PH + robotRY * 0.3;

    // ── Colors ───────────────────────────────────────────────────────────
    const activeDrying  = isMopDrying || dockMopDrying;
    const dirtyCol      = dirtyBoxProblem ? '#EF9F27' : '#5F5E5A';
    const dirtyCBg      = dirtyBoxProblem ? 'rgba(239,159,39,0.10)' : 'rgba(95,94,90,0.06)';
    const cleanCol      = cleanBoxProblem ? '#EF9F27' : '#5F5E5A';
    const cleanBg       = cleanBoxProblem ? 'rgba(239,159,39,0.10)' : 'rgba(95,94,90,0.06)';
    const fluidCol      = fluidProblem    ? '#EF9F27' : '#5F5E5A';
    const fluidBg       = fluidProblem    ? 'rgba(239,159,39,0.10)' : 'rgba(95,94,90,0.06)';
    const mopBayCol     = isMopWashing ? '#7BAED4' : activeDrying ? '#C97A50' : 'rgba(255,255,255,0.05)';
    const mopBayBg      = isMopWashing ? 'rgba(123,174,212,0.12)' : activeDrying ? 'rgba(201,122,80,0.10)' : 'rgba(255,255,255,0.02)';
    const robotCol      = isCharging ? '#97C459' : hasError ? '#E24B4A' : '#5F5E5A';
    const robotBg       = isCharging ? 'rgba(151,196,89,0.14)' : hasError ? 'rgba(226,75,74,0.12)' : 'rgba(95,94,90,0.10)';
    const robotSideBg   = isCharging ? 'rgba(151,196,89,0.38)' : hasError ? 'rgba(226,75,74,0.32)' : 'rgba(80,80,78,0.55)';
    const robotH        = 8;

    // ── Fill levels (front-face vertical fills, rising from bottom) ──────
    const dirtyLvl      = this._getDockLevel('dirty_water_level', 'dirty_water_box', false) / 100;
    const cleanLvl      = this._getDockLevel('clean_water_level', 'clean_water_box', true)  / 100;
    const fluidLvl      = this._getDockLevel('fluid_level', 'cleaning_fluid', true)         / 100;

    const dirtyFillTopV = 0.57 - 0.54 * dirtyLvl;
    const cleanFillTopV = 0.57 - 0.54 * cleanLvl;
    const fluidFillTopV = 0.95 - 0.36 * fluidLvl;
    const dirtyFillPts  = poly([fp(0,dirtyFillTopV), fp(0.5,dirtyFillTopV), fp(0.5,0.57), fp(0,0.57)]);
    const cleanFillPts  = poly([fp(0.5,cleanFillTopV), fp(1,cleanFillTopV), fp(1,0.57), fp(0.5,0.57)]);
    const fluidFillPts  = poly([fp(0.02,fluidFillTopV), fp(0.38,fluidFillTopV), fp(0.38,0.95), fp(0.02,0.95)]);
    const dirtyFillCol  = dirtyBoxProblem ? 'rgba(239,159,39,0.38)' : 'rgba(95,94,90,0.18)';
    const cleanFillCol  = cleanBoxProblem ? 'rgba(239,159,39,0.38)' : 'rgba(95,94,90,0.18)';
    const fluidFillCol  = fluidProblem    ? 'rgba(239,159,39,0.38)' : 'rgba(95,94,90,0.18)';

    const [dirtyDropX, dirtyDropY] = fp(0.25, 0.30);
    const [cleanDropX, cleanDropY] = fp(0.75, 0.30);
    const [fluidDropX, fluidDropY] = fp(0.20, 0.72);

    const dropIcon = (cx, cy, r, col) => {
      const t = n => n.toFixed(1);
      return `<path d="M${t(cx)},${t(cy-r)} C${t(cx+r*0.6)},${t(cy-r*0.15)} ${t(cx+r)},${t(cy+r*0.4)} ${t(cx)},${t(cy+r)} C${t(cx-r)},${t(cy+r*0.4)} ${t(cx-r*0.6)},${t(cy-r*0.15)} ${t(cx)},${t(cy-r)}" fill="${col}" opacity="0.65"/>`;
    };

    // ── Animations in mop band ────────────────────────────────────────────
    const makeMopLine = (frac, delay, col) => {
      const v = 0.59 + 0.11 * frac;
      const [x1, y1] = fp(0.42, v), [x2, y2] = fp(0.95, v);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
                    stroke="${col}" stroke-width="1.2" stroke-linecap="round"
                    style="animation:vac-water-drop 1.2s ${delay}s ease-in-out infinite"/>`;
    };
    const makeHeatArc = (uf, vf, delay) => {
      const [xs, ys] = fp(0.42+0.53*uf-0.07, 0.59+0.11*vf+0.02);
      const [xe, ye] = fp(0.42+0.53*uf+0.07, 0.59+0.11*vf+0.02);
      const [xc, yc] = fp(0.42+0.53*uf,      0.59+0.11*vf-0.03);
      return `<path d="M ${xs.toFixed(1)} ${ys.toFixed(1)} Q ${xc.toFixed(1)} ${yc.toFixed(1)} ${xe.toFixed(1)} ${ye.toFixed(1)}"
                    stroke="#C97A50" stroke-width="1.3" fill="none" stroke-linecap="round"
                    style="animation:vac-heat 1.5s ${delay}s ease-in-out infinite"/>`;
    };
    const makeDustParticle = (uf, r, delay) => {
      const [cx2, cy2] = fp(0.50 + 0.40*uf, 0.64);
      return `<circle cx="${cx2.toFixed(1)}" cy="${cy2.toFixed(1)}" r="${r}"
                      fill="#EF9F27" style="animation:vac-water-drop 0.9s ${delay}s ease-in-out infinite"/>`;
    };

    let activeAnim = '';
    if (isMopWashing) {
      activeAnim = makeMopLine(0.2,0.0,'#7BAED4') + makeMopLine(0.55,0.35,'#7BAED4') + makeMopLine(0.9,0.7,'#7BAED4');
    } else if (activeDrying) {
      activeAnim = makeHeatArc(0.15,0.5,0.0) + makeHeatArc(0.5,0.5,0.3) + makeHeatArc(0.85,0.5,0.6)
                 + makeHeatArc(0.3,0.1,0.15) + makeHeatArc(0.7,0.1,0.45);
    } else if (isEmptying) {
      activeAnim = makeDustParticle(0,1.5,0.0) + makeDustParticle(0.5,1.8,0.25) + makeDustParticle(1,1.5,0.5);
    }

    const errorOverlay = hasError
      ? `<polygon points="${frontPts}" fill="rgba(226,75,74,0.07)" style="animation:vac-pulse-error 2s ease-in-out infinite"/>`
      : '';

    const vbW = Math.ceil(pl + dx + ddx + 10);
    const vbH = isRobotDocked
      ? Math.ceil(robotCY + robotRY + robotH + 4)
      : Math.ceil(pt + dy + BH + PH + 6);

    const svg = `
      <svg viewBox="0 0 ${vbW} ${vbH}" width="${vbW}" height="${vbH}"
           fill="none" style="display:block;overflow:visible;font-family:-apple-system,sans-serif;">

        <!-- ── Robot (drawn first — dock overlays upper half) ── -->
        ${isRobotDocked ? `
        <ellipse cx="${robotCX.toFixed(1)}" cy="${(robotCY+robotH).toFixed(1)}"
                 rx="${robotRX.toFixed(1)}" ry="${robotRY.toFixed(1)}"
                 fill="${robotSideBg}" stroke="${robotCol}" stroke-width="1.4"/>
        <ellipse cx="${robotCX.toFixed(1)}" cy="${robotCY.toFixed(1)}"
                 rx="${robotRX.toFixed(1)}" ry="${robotRY.toFixed(1)}"
                 fill="${robotBg}" stroke="${robotCol}" stroke-width="1.8"
                 ${isCharging ? 'style="animation:vac-pulse-charging 2.5s ease-in-out infinite"' : ''}/>
        <path d="M ${(robotCX-robotRX*0.78).toFixed(1)} ${(robotCY+robotRY*0.15).toFixed(1)}
                 A ${(robotRX*0.78).toFixed(1)} ${(robotRY*0.78).toFixed(1)} 0 0 1
                   ${(robotCX+robotRX*0.78).toFixed(1)} ${(robotCY+robotRY*0.15).toFixed(1)}"
              stroke="${robotCol}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.55"/>
        <ellipse cx="${robotCX.toFixed(1)}" cy="${(robotCY-robotRY*0.10).toFixed(1)}"
                 rx="5" ry="3" fill="${robotBg}" stroke="${robotCol}" stroke-width="1.0" opacity="0.9"/>
        ${isCharging ? `<text x="${robotCX.toFixed(1)}" y="${(robotCY+robotRY*0.12+6).toFixed(1)}"
              text-anchor="middle" font-size="12" fill="#97C459"
              style="animation:vac-dot 1.8s ease-in-out infinite">⚡</text>` : ''}
        ` : ''}

        <!-- Right face -->
        <polygon points="${rightPts}" fill="#161618" stroke="rgba(255,255,255,0.07)" stroke-width="0.8"/>

        <!-- Front face base -->
        <polygon points="${frontPts}" fill="#1C1C1E" stroke="rgba(255,255,255,0.09)" stroke-width="0.8"/>
        ${errorOverlay}

        <!-- ── Upper: Dirty water (left) ── -->
        <polygon points="${leftTankPts}" fill="${dirtyCBg}" stroke="${dirtyCol}" stroke-width="0.9"
                 ${dirtyBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        <polygon points="${dirtyFillPts}" fill="${dirtyFillCol}" stroke="none"
                 ${dirtyBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        ${dropIcon(dirtyDropX, dirtyDropY, 5, dirtyCol)}

        <!-- ── Upper: Clean water (right) ── -->
        <polygon points="${rightTankPts}" fill="${cleanBg}" stroke="${cleanCol}" stroke-width="0.9"
                 ${cleanBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        <polygon points="${cleanFillPts}" fill="${cleanFillCol}" stroke="none"
                 ${cleanBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        ${dropIcon(cleanDropX, cleanDropY, 5, cleanCol)}

        <!-- Tank divider -->
        <line x1="${tankDivLine[0][0].toFixed(1)}" y1="${tankDivLine[0][1].toFixed(1)}"
              x2="${tankDivLine[1][0].toFixed(1)}" y2="${tankDivLine[1][1].toFixed(1)}"
              stroke="rgba(255,255,255,0.12)" stroke-width="0.8"/>

        <!-- ── Lower: Fluid (left) ── -->
        <polygon points="${fluidPts}" fill="${fluidBg}" stroke="${fluidCol}" stroke-width="0.9"
                 ${fluidProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        <polygon points="${fluidFillPts}" fill="${fluidFillCol}" stroke="none"/>
        ${dropIcon(fluidDropX, fluidDropY, 3.5, fluidCol)}

        <!-- ── Lower: Mop band (right) ── -->
        <polygon points="${mopBayPts}" fill="${mopBayBg}" stroke="${mopBayCol}" stroke-width="0.8"/>
        ${activeAnim}

        <!-- ── Lower: Dock slot ── -->
        <polygon points="${dockSlotPts}" fill="rgba(0,0,0,0.32)"
                 stroke="rgba(255,255,255,0.06)" stroke-width="0.7"/>

        <!-- ── Top face ── -->
        <polygon points="${topPts}" fill="#212123" stroke="rgba(255,255,255,0.09)" stroke-width="0.8"/>
        <polygon points="${topDirtyPts}" fill="${dirtyBoxProblem ? 'rgba(239,159,39,0.12)' : 'rgba(255,255,255,0.04)'}" stroke="none" opacity="0.9"/>
        <polygon points="${topCleanPts}" fill="${cleanBoxProblem ? 'rgba(239,159,39,0.12)' : 'rgba(255,255,255,0.04)'}" stroke="none" opacity="0.9"/>
        <line x1="${topDivLine[0][0].toFixed(1)}" y1="${topDivLine[0][1].toFixed(1)}"
              x2="${topDivLine[1][0].toFixed(1)}" y2="${topDivLine[1][1].toFixed(1)}"
              stroke="rgba(255,255,255,0.10)" stroke-width="0.8"/>
        <line x1="${tp(0,0)[0].toFixed(1)}" y1="${tp(0,0)[1].toFixed(1)}"
              x2="${tp(1,0)[0].toFixed(1)}" y2="${tp(1,0)[1].toFixed(1)}"
              stroke="rgba(255,255,255,0.16)" stroke-width="0.7"/>

        <!-- ── Platform (podest) — below dock body ── -->
        <polygon points="${platRightPts}" fill="#111113" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/>
        <polygon points="${platLeftPts}"  fill="#181819" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
        <polygon points="${platSlotPts}"  fill="rgba(8,8,10,0.75)"
                 stroke="rgba(255,255,255,0.05)" stroke-width="0.7"/>
      </svg>`;

    // ── Legend — compact ─────────────────────────────────────────────────
    // OK items: tiny muted dot in a row; problem items: full chip

    // Helper: small status dot (OK — muted, problem — colored + label)
    const okDot  = (label) =>
      `<span title="${label}" style="display:inline-block;width:7px;height:7px;
              border-radius:50%;background:rgba(151,196,89,0.30);flex-shrink:0;"></span>`;
    const problemChip = (label, value, col) =>
      `<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;
                   border-radius:8px;background:rgba(226,75,74,0.10);
                   border:1px solid rgba(226,75,74,0.22);">
         <span style="width:6px;height:6px;border-radius:50%;background:${col};flex-shrink:0;
                      animation:vac-dot 1.8s ease-in-out infinite;"></span>
         <span style="font-size:10px;color:rgba(255,255,255,0.55);">${label}</span>
         <span style="font-size:10px;font-weight:600;color:${col};margin-left:auto;">${value}</span>
       </div>`;
    const activeChip = (label, value, col) =>
      `<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;
                   border-radius:8px;background:rgba(${col==='#C97A50'?'201,122,80':'133,183,235'},0.10);
                   border:1px solid rgba(${col==='#C97A50'?'201,122,80':'133,183,235'},0.20);">
         <span style="width:6px;height:6px;border-radius:50%;background:${col};flex-shrink:0;
                      animation:vac-dot 1.8s ease-in-out infinite;"></span>
         <span style="font-size:10px;color:${col};font-weight:500;">${label}</span>
         ${value ? `<span style="font-size:10px;color:rgba(255,255,255,0.40);margin-left:2px;">${value}</span>` : ''}
       </div>`;

    // Row 1: quiet OK dots for all-ok items + problem chips
    const statusDots = [];   // tiny dots for OK items
    const problemRows = [];  // full chips for problems

    const dockItems = [
      { key: 'dirty', label: 'Brudna woda', problem: dirtyBoxProblem, value: '⚠ pełna' },
      { key: 'clean', label: 'Czysta woda', problem: cleanBoxProblem, value: '⚠ pusta' },
      { key: 'fluid', label: 'Płyn czyszczący', problem: fluidProblem, value: '⚠ uzupełnij' },
    ];

    dockItems.forEach(item => {
      if (item.problem) {
        problemRows.push(problemChip(item.label, item.value, '#E24B4A'));
      } else {
        statusDots.push(okDot(item.label + ' · ok'));
      }
    });

    // Mop state
    if (mopAttached) {
      statusDots.push(`<span title="Mop założony" style="display:inline-block;width:7px;height:7px;
        border-radius:50%;background:rgba(133,183,235,0.35);flex-shrink:0;"></span>`);
    }

    // Active dock operations
    if (activeDrying) {
      let timeStr = '';
      timeStr = fmtDurationSec(mopDryingTimeSec) || '';
      problemRows.push(activeChip('suszy mop', timeStr, '#C97A50'));
    }

    // Dock error
    if (hasDockError) {
      const DOCK_ERROR_MAP = {
        duct_blockage:                 'Zatkany przewód',
        water_empty:                   'Brak wody',
        waste_water_tank_full:         'Pełna brudna woda',
        maintenance_brush_jammed:      'Szczotka zablokowana',
        dirty_tank_latch_open:         'Otwarty zatrzask',
        no_dustbin:                    'Brak pojemnika',
        cleaning_tank_full_or_blocked: 'Zbiornik czyszczący',
      };
      problemRows.push(problemChip('Błąd doku', DOCK_ERROR_MAP[dockError] || dockError, '#E24B4A'));
    }

    // Vacuum robot error — very muted, single dot
    if (hasVacError) {
      const errLabel = ERROR_MAP[vacError] || vacError;
      problemRows.push(problemChip('Robot', errLabel, '#EF9F27'));
    }

    const dotsRow = statusDots.length
      ? `<div style="display:flex;align-items:center;gap:5px;">${statusDots.join('')}</div>`
      : '';
    const rows = problemRows;

    const legendHtml = `
      <div style="display:flex;flex-direction:column;gap:6px;padding-top:4px;flex:1;min-width:0;">
        ${dotsRow}
        ${rows.join('')}
      </div>`;

    return `
      <div class="dock-section">
        <div class="dock-title">Dok · Saros 10R</div>
        <div style="display:flex;align-items:flex-start;gap:14px;">
          <div style="flex-shrink:0;">${svg}</div>
          ${legendHtml}
        </div>
      </div>`;
  }

  // ── Combined: compact dock SVG (left) + status + consumables (right) ──
  _renderDockAndConsumables(group, showDock) {
    const dockSvg = showDock ? this._buildCompactDockSvg(group) : null;
    const legendHtml = showDock ? this._buildDockLegend(group) : null;
    const consumablesHtml = this._buildConsumableIcons();

    if (!dockSvg) {
      // No dock — just consumables row
      return consumablesHtml;
    }

    return `
      <div style="display:flex;align-items:flex-start;gap:12px;">

        <!-- Left: compact dock SVG -->
        <div style="flex-shrink:0;">
          <div class="dock-title" style="margin-bottom:6px;">Dok</div>
          ${dockSvg}
        </div>

        <!-- Right: dock status + consumables -->
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;">

          ${legendHtml}

          <div style="height:1px;background:rgba(255,255,255,0.05);"></div>

          <!-- Consumable icons + lifetime -->
          ${consumablesHtml}

        </div>
      </div>`;
  }

  // Compact SVG — same geometry but W/D/H scaled down ~30%
  _buildCompactDockSvg(group) {
    const isMopWashing  = group === 'mop_washing';
    const isEmptying    = group === 'emptying';
    const isCharging    = this._isBinaryOn('charging');
    const dirtyBoxProblem = this._isDockProblem('dirty_water_box');
    const cleanBoxProblem = this._isDockProblem('clean_water_box');
    const fluidProblem    = this._isDockProblem('cleaning_fluid');
    const dockMopDrying   = this._isDockRunning('mop_drying');
    const activeDrying    = group === 'mop_drying' || dockMopDrying;
    const vacError        = this._getSensorState('vacuum_error') || 'none';
    const hasDockError    = (() => { const e = this._getDockSensorState('dock_error'); return e && e !== 'ok' && e !== 'unknown'; })();
    const hasError        = hasDockError;

    // ── Smaller proportions ──────────────────────────────────────────
    const W = 52, D = 38, BH = 53, PH = 26; // BH=body, PH=platform
    const cos30 = 0.866, sin30 = 0.5;
    const dx  = W * cos30, dy  = W * sin30;
    const ddx = D * cos30, ddy = D * sin30;
    const pl = 6, pt = ddy + 7;

    const fp  = (u, v) => [pl + u*dx,         pt + u*dy + v*BH];
    const tp  = (u, d) => [pl + u*dx + d*ddx,  pt + u*dy - d*ddy];
    const rp  = (d, v) => [pl + dx + d*ddx,    pt + dy - d*ddy + v*BH];
    const pFp = (u, v) => [pl + u*dx,          pt + u*dy + BH + v*PH];
    const pRp = (d, v) => [pl + dx + d*ddx,    pt + dy - d*ddy + BH + v*PH];
    const poly = pts => pts.map(p => p.join(',')).join(' ');

    // ── Geometry — new layout matching actual Saros 10R dock ────────────
    // Structural faces
    const frontPts  = poly([fp(0,0), fp(1,0), fp(1,1), fp(0,1)]);
    const rightPts  = poly([rp(0,0), rp(1,0), rp(1,1), rp(0,1)]);
    const topPts    = poly([tp(0,0), tp(1,0), tp(1,1), tp(0,1)]);
    const topDirtyPts = poly([tp(0,0), tp(0.5,0), tp(0.5,1), tp(0,1)]);
    const topCleanPts = poly([tp(0.5,0), tp(1,0), tp(1,1), tp(0.5,1)]);
    const topDivLine  = [tp(0.5,0), tp(0.5,1)];

    // Front face — upper half: two large tank panels
    const leftTankPts  = poly([fp(0,0.03), fp(0.5,0.03), fp(0.5,0.57), fp(0,0.57)]);
    const rightTankPts = poly([fp(0.5,0.03), fp(1,0.03), fp(1,0.57), fp(0.5,0.57)]);
    const tankDivLine  = [fp(0.5,0.03), fp(0.5,0.57)];

    // Front face — lower half: fluid (left), mop band (right narrow), dock slot (right)
    const fluidPts    = poly([fp(0.02,0.59), fp(0.38,0.59), fp(0.38,0.95), fp(0.02,0.95)]);
    const mopBayPts   = poly([fp(0.40,0.59), fp(0.97,0.59), fp(0.97,0.70), fp(0.40,0.70)]);
    const dockSlotPts = poly([fp(0.40,0.71), fp(0.97,0.71), fp(0.97,0.97), fp(0.40,0.97)]);

    // Platform (podest) polygons
    const platLeftPts_s  = poly([pFp(0,0), pFp(0.40,0), pFp(0.40,1), pFp(0,1)]);
    const platSlotPts_s  = poly([pFp(0.40,0), pFp(1,0), pFp(1,1), pFp(0.40,1)]);
    const platRightPts_s = poly([pRp(0,0), pRp(1,0), pRp(1,1), pRp(0,1)]);

    // Robot docked — floor at BH + PH
    const isRobotDocked = isCharging || ['mop_washing','mop_drying','emptying','charging'].includes(group);
    const Xr_s = 0.685 * W, Zr_s = 0;
    const robotCX = pl + cos30 * (Xr_s + Zr_s);
    const robotRX  = 18 * cos30 * Math.SQRT2;
    const robotRY  = 18 * sin30 * Math.SQRT2;
    const robotCY = pt + sin30 * (Xr_s - Zr_s) + BH + PH + robotRY * 0.3;

    // ── Colors ───────────────────────────────────────────────────────────
    const dirtyCol   = dirtyBoxProblem ? '#EF9F27' : '#5F5E5A';
    const dirtyCBg   = dirtyBoxProblem ? 'rgba(239,159,39,0.10)' : 'rgba(95,94,90,0.06)';
    const cleanCol   = cleanBoxProblem ? '#EF9F27' : '#5F5E5A';
    const cleanBg    = cleanBoxProblem ? 'rgba(239,159,39,0.10)' : 'rgba(95,94,90,0.06)';
    const fluidCol   = fluidProblem    ? '#EF9F27' : '#5F5E5A';
    const fluidBg    = fluidProblem    ? 'rgba(239,159,39,0.10)' : 'rgba(95,94,90,0.06)';
    const mopBayCol  = isMopWashing ? '#7BAED4' : activeDrying ? '#C97A50' : 'rgba(255,255,255,0.05)';
    const mopBayBg   = isMopWashing ? 'rgba(123,174,212,0.12)' : activeDrying ? 'rgba(201,122,80,0.10)' : 'rgba(255,255,255,0.02)';
    const robotCol     = isCharging ? '#97C459' : hasError ? '#E24B4A' : '#5F5E5A';
    const robotBg      = isCharging ? 'rgba(151,196,89,0.14)' : hasError ? 'rgba(226,75,74,0.12)' : 'rgba(95,94,90,0.10)';
    const robotSideBg  = isCharging ? 'rgba(151,196,89,0.38)' : hasError ? 'rgba(226,75,74,0.32)' : 'rgba(80,80,78,0.55)';
    const robotH       = 6;

    // ── Fill levels (front-face vertical fills rising from bottom) ───────
    const dirtyLvl = this._getDockLevel('dirty_water_level', 'dirty_water_box', false) / 100;
    const cleanLvl = this._getDockLevel('clean_water_level', 'clean_water_box', true)  / 100;
    const fluidLvl = this._getDockLevel('fluid_level', 'cleaning_fluid', true)         / 100;

    const dirtyFillTopV = 0.57 - 0.54 * dirtyLvl;
    const cleanFillTopV = 0.57 - 0.54 * cleanLvl;
    const fluidFillTopV = 0.95 - 0.36 * fluidLvl;
    const dirtyFillPts  = poly([fp(0,dirtyFillTopV), fp(0.5,dirtyFillTopV), fp(0.5,0.57), fp(0,0.57)]);
    const cleanFillPts  = poly([fp(0.5,cleanFillTopV), fp(1,cleanFillTopV), fp(1,0.57), fp(0.5,0.57)]);
    const fluidFillPts  = poly([fp(0.02,fluidFillTopV), fp(0.38,fluidFillTopV), fp(0.38,0.95), fp(0.02,0.95)]);
    const dirtyFillCol  = dirtyBoxProblem ? 'rgba(239,159,39,0.38)' : 'rgba(95,94,90,0.18)';
    const cleanFillCol  = cleanBoxProblem ? 'rgba(239,159,39,0.38)' : 'rgba(95,94,90,0.18)';
    const fluidFillCol  = fluidProblem    ? 'rgba(239,159,39,0.38)' : 'rgba(95,94,90,0.18)';

    // Water drop icon helper
    const dropIcon = (cx, cy, r, col) => {
      const t = n => n.toFixed(1);
      return `<path d="M${t(cx)},${t(cy-r)} C${t(cx+r*0.6)},${t(cy-r*0.15)} ${t(cx+r)},${t(cy+r*0.4)} ${t(cx)},${t(cy+r)} C${t(cx-r)},${t(cy+r*0.4)} ${t(cx-r*0.6)},${t(cy-r*0.15)} ${t(cx)},${t(cy-r)}" fill="${col}" opacity="0.65"/>`;
    };
    const [dirtyDropX, dirtyDropY] = fp(0.25, 0.30);
    const [cleanDropX, cleanDropY] = fp(0.75, 0.30);
    const [fluidDropX, fluidDropY] = fp(0.20, 0.72);

    // ── Animations inside mop band ────────────────────────────────────────
    const makeMopLine = (frac, delay, col) => {
      const v = 0.59 + 0.11 * frac;
      const [x1, y1] = fp(0.42, v), [x2, y2] = fp(0.95, v);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
                    stroke="${col}" stroke-width="1" stroke-linecap="round"
                    style="animation:vac-water-drop 1.2s ${delay}s ease-in-out infinite"/>`;
    };
    const makeHeatArc = (uf, vf, delay) => {
      const [xs, ys] = fp(0.42+0.53*uf-0.06, 0.59+0.11*vf+0.02);
      const [xe, ye] = fp(0.42+0.53*uf+0.06, 0.59+0.11*vf+0.02);
      const [xc, yc] = fp(0.42+0.53*uf,      0.59+0.11*vf-0.02);
      return `<path d="M ${xs.toFixed(1)} ${ys.toFixed(1)} Q ${xc.toFixed(1)} ${yc.toFixed(1)} ${xe.toFixed(1)} ${ye.toFixed(1)}"
                    stroke="#C97A50" stroke-width="1" fill="none" stroke-linecap="round"
                    style="animation:vac-heat 1.5s ${delay}s ease-in-out infinite"/>`;
    };
    const makeDustDot = (uf, r, delay) => {
      const [cx2, cy2] = fp(0.50 + 0.40*uf, 0.64);
      return `<circle cx="${cx2.toFixed(1)}" cy="${cy2.toFixed(1)}" r="${r}" fill="#EF9F27"
                      style="animation:vac-water-drop 0.9s ${delay}s ease-in-out infinite"/>`;
    };

    let activeAnim = '';
    if (isMopWashing) {
      activeAnim = makeMopLine(0.2,0.0,'#7BAED4') + makeMopLine(0.55,0.35,'#7BAED4') + makeMopLine(0.9,0.7,'#7BAED4');
    } else if (activeDrying) {
      activeAnim = makeHeatArc(0.15,0.5,0.0) + makeHeatArc(0.5,0.5,0.3) + makeHeatArc(0.85,0.5,0.6)
                 + makeHeatArc(0.3,0.1,0.15) + makeHeatArc(0.7,0.1,0.45);
    } else if (isEmptying) {
      activeAnim = makeDustDot(0,1.0,0.0) + makeDustDot(0.5,1.2,0.25) + makeDustDot(1,1.0,0.5);
    }

    const errorOverlay = hasError
      ? `<polygon points="${frontPts}" fill="rgba(226,75,74,0.07)" style="animation:vac-pulse-error 2s ease-in-out infinite"/>`
      : '';

    const vbW = Math.ceil(pl + dx + ddx + 8);
    const vbH = isRobotDocked
      ? Math.ceil(robotCY + robotRY + robotH + 3)
      : Math.ceil(pt + dy + BH + PH + 5);

    return `
      <svg viewBox="0 0 ${vbW} ${vbH}" width="${vbW}" height="${vbH}"
           fill="none" style="display:block;overflow:visible;font-family:-apple-system,sans-serif;">

        <!-- ── Robot (drawn first — dock overlays upper half) ── -->
        ${isRobotDocked ? `
        <ellipse cx="${robotCX.toFixed(1)}" cy="${(robotCY+robotH).toFixed(1)}"
                 rx="${robotRX.toFixed(1)}" ry="${robotRY.toFixed(1)}"
                 fill="${robotSideBg}" stroke="${robotCol}" stroke-width="1.0"/>
        <ellipse cx="${robotCX.toFixed(1)}" cy="${robotCY.toFixed(1)}"
                 rx="${robotRX.toFixed(1)}" ry="${robotRY.toFixed(1)}"
                 fill="${robotBg}" stroke="${robotCol}" stroke-width="1.4"
                 ${isCharging ? 'style="animation:vac-pulse-charging 2.5s ease-in-out infinite"' : ''}/>
        <path d="M ${(robotCX-robotRX*0.78).toFixed(1)} ${(robotCY+robotRY*0.15).toFixed(1)}
                 A ${(robotRX*0.78).toFixed(1)} ${(robotRY*0.78).toFixed(1)} 0 0 1
                   ${(robotCX+robotRX*0.78).toFixed(1)} ${(robotCY+robotRY*0.15).toFixed(1)}"
              stroke="${robotCol}" stroke-width="0.9" fill="none" stroke-linecap="round" opacity="0.55"/>
        <ellipse cx="${robotCX.toFixed(1)}" cy="${(robotCY-robotRY*0.10).toFixed(1)}"
                 rx="3.5" ry="2.1" fill="${robotBg}" stroke="${robotCol}" stroke-width="0.8" opacity="0.9"/>
        ${isCharging ? `<text x="${robotCX.toFixed(1)}" y="${(robotCY+robotRY*0.12+4).toFixed(1)}"
              text-anchor="middle" font-size="8" fill="#97C459"
              style="animation:vac-dot 1.8s ease-in-out infinite">⚡</text>` : ''}
        ` : ''}

        <!-- Right face -->
        <polygon points="${rightPts}" fill="#161618" stroke="rgba(255,255,255,0.07)" stroke-width="0.7"/>

        <!-- Front face base -->
        <polygon points="${frontPts}" fill="#1C1C1E" stroke="rgba(255,255,255,0.09)" stroke-width="0.7"/>
        ${errorOverlay}

        <!-- ── Upper: Dirty water tank (left) ── -->
        <polygon points="${leftTankPts}" fill="${dirtyCBg}" stroke="${dirtyCol}" stroke-width="0.8"
                 ${dirtyBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        <polygon points="${dirtyFillPts}" fill="${dirtyFillCol}" stroke="none"
                 ${dirtyBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        ${dropIcon(dirtyDropX, dirtyDropY, 3.5, dirtyCol)}

        <!-- ── Upper: Clean water tank (right) ── -->
        <polygon points="${rightTankPts}" fill="${cleanBg}" stroke="${cleanCol}" stroke-width="0.8"
                 ${cleanBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        <polygon points="${cleanFillPts}" fill="${cleanFillCol}" stroke="none"
                 ${cleanBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        ${dropIcon(cleanDropX, cleanDropY, 3.5, cleanCol)}

        <!-- Tank divider -->
        <line x1="${tankDivLine[0][0].toFixed(1)}" y1="${tankDivLine[0][1].toFixed(1)}"
              x2="${tankDivLine[1][0].toFixed(1)}" y2="${tankDivLine[1][1].toFixed(1)}"
              stroke="rgba(255,255,255,0.12)" stroke-width="0.7"/>

        <!-- ── Lower: Fluid compartment (left) ── -->
        <polygon points="${fluidPts}" fill="${fluidBg}" stroke="${fluidCol}" stroke-width="0.8"
                 ${fluidProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        <polygon points="${fluidFillPts}" fill="${fluidFillCol}" stroke="none"/>
        ${dropIcon(fluidDropX, fluidDropY, 2.5, fluidCol)}

        <!-- ── Lower: Mop band (right) ── -->
        <polygon points="${mopBayPts}" fill="${mopBayBg}" stroke="${mopBayCol}" stroke-width="0.7"/>
        ${activeAnim}

        <!-- ── Lower: Dock slot ── -->
        <polygon points="${dockSlotPts}" fill="rgba(0,0,0,0.32)"
                 stroke="rgba(255,255,255,0.06)" stroke-width="0.6"/>

        <!-- ── Top face ── -->
        <polygon points="${topPts}" fill="#212123" stroke="rgba(255,255,255,0.09)" stroke-width="0.7"/>
        <polygon points="${topDirtyPts}" fill="${dirtyBoxProblem ? 'rgba(239,159,39,0.12)' : 'rgba(255,255,255,0.04)'}" stroke="none" opacity="0.9"/>
        <polygon points="${topCleanPts}" fill="${cleanBoxProblem ? 'rgba(239,159,39,0.12)' : 'rgba(255,255,255,0.04)'}" stroke="none" opacity="0.9"/>
        <line x1="${topDivLine[0][0].toFixed(1)}" y1="${topDivLine[0][1].toFixed(1)}"
              x2="${topDivLine[1][0].toFixed(1)}" y2="${topDivLine[1][1].toFixed(1)}"
              stroke="rgba(255,255,255,0.10)" stroke-width="0.7"/>
        <line x1="${tp(0,0)[0].toFixed(1)}" y1="${tp(0,0)[1].toFixed(1)}"
              x2="${tp(1,0)[0].toFixed(1)}" y2="${tp(1,0)[1].toFixed(1)}"
              stroke="rgba(255,255,255,0.16)" stroke-width="0.6"/>

        <!-- ── Platform (podest) — below dock body ── -->
        <polygon points="${platRightPts_s}" fill="#111113" stroke="rgba(255,255,255,0.06)" stroke-width="0.7"/>
        <polygon points="${platLeftPts_s}"  fill="#181819" stroke="rgba(255,255,255,0.08)" stroke-width="0.7"/>
        <polygon points="${platSlotPts_s}"  fill="rgba(8,8,10,0.75)"
                 stroke="rgba(255,255,255,0.05)" stroke-width="0.6"/>
      </svg>`;
  }

  _buildDockLegend(group) {
    const dirtyBoxProblem = this._isDockProblem('dirty_water_box');
    const cleanBoxProblem = this._isDockProblem('clean_water_box');
    const fluidProblem    = this._isDockProblem('cleaning_fluid');
    const dockMopDrying   = this._isDockRunning('mop_drying');
    const activeDrying    = group === 'mop_drying' || dockMopDrying;
    const mopAttached     = this._isBinaryOn('mop_attached');
    const mopDryingTimeSec = this._getDockSensorNum('mop_drying_time');
    const dockError       = this._getDockSensorState('dock_error');
    const hasDockError    = dockError && dockError !== 'ok' && dockError !== 'unknown';
    const vacError        = this._getSensorState('vacuum_error') || 'none';
    const hasVacError     = vacError !== 'none' && vacError !== 'unknown';
    const isMopWashing    = group === 'mop_washing';

    const okDot = (label) =>
      `<span title="${label}: ok" style="display:inline-block;width:6px;height:6px;border-radius:50%;
              background:rgba(151,196,89,0.28);flex-shrink:0;"></span>`;

    const problemChip = (label, value) =>
      `<div style="display:flex;align-items:center;gap:5px;padding:3px 7px;border-radius:7px;
                   background:rgba(226,75,74,0.10);border:1px solid rgba(226,75,74,0.20);">
         <span style="width:5px;height:5px;border-radius:50%;background:#E24B4A;flex-shrink:0;
                      animation:vac-dot 1.8s ease-in-out infinite;"></span>
         <span style="font-size:10px;color:rgba(255,255,255,0.50);">${label}</span>
         <span style="font-size:10px;font-weight:600;color:#E24B4A;margin-left:auto;">${value}</span>
       </div>`;

    const activeChip = (label, value, col) => {
      const rgb = col === '#C97A50' ? '201,122,80' : '123,174,212';
      return `<div style="display:flex;align-items:center;gap:5px;padding:3px 7px;border-radius:7px;
                     background:rgba(${rgb},0.10);border:1px solid rgba(${rgb},0.20);">
         <span style="width:5px;height:5px;border-radius:50%;background:${col};flex-shrink:0;
                      animation:vac-dot 1.8s ease-in-out infinite;"></span>
         <span style="font-size:10px;color:${col};font-weight:500;">${label}</span>
         ${value ? `<span style="font-size:10px;color:rgba(255,255,255,0.35);margin-left:2px;">${value}</span>` : ''}
       </div>`;
    };

    const dots = [];
    const chips = [];

    const items = [
      { label: 'Brudna woda', problem: dirtyBoxProblem, value: '⚠ pełna' },
      { label: 'Czysta woda', problem: cleanBoxProblem, value: '⚠ pusta' },
      { label: 'Płyn',        problem: fluidProblem,    value: '⚠ uzupełnij' },
    ];
    items.forEach(i => {
      if (i.problem) chips.push(problemChip(i.label, i.value));
      else dots.push(okDot(i.label));
    });

    if (mopAttached) dots.push(`<span title="Mop założony" style="display:inline-block;width:6px;height:6px;
      border-radius:50%;background:rgba(133,183,235,0.35);flex-shrink:0;"></span>`);

    if (activeDrying) {
      const m = fmtDurationSec(mopDryingTimeSec) || '';
      chips.push(activeChip('suszy mop', m, '#C97A50'));
    }
    if (isMopWashing) chips.push(activeChip('myje mop', '', '#7BAED4'));

    if (hasDockError) {
      const DOCK_ERR = {
        duct_blockage:'Zatkany przewód', water_empty:'Brak wody',
        waste_water_tank_full:'Pełna brudna woda', maintenance_brush_jammed:'Szczotka zablok.',
        dirty_tank_latch_open:'Otwarty zatrzask', no_dustbin:'Brak pojemnika',
        cleaning_tank_full_or_blocked:'Zbiornik zablok.',
      };
      chips.push(problemChip('Dok', DOCK_ERR[dockError] || dockError));
    }
    if (hasVacError) {
      const lbl = ERROR_MAP[vacError] || vacError;
      chips.push(`<div style="display:flex;align-items:center;gap:5px;padding:3px 7px;border-radius:7px;
                   background:rgba(239,159,39,0.08);border:1px solid rgba(239,159,39,0.15);">
         <span style="width:5px;height:5px;border-radius:50%;background:#EF9F27;flex-shrink:0;"></span>
         <span style="font-size:10px;color:rgba(255,255,255,0.40);">Robot</span>
         <span style="font-size:10px;color:#EF9F27;margin-left:auto;">${lbl}</span>
       </div>`);
    }

    const dotsHtml = dots.length
      ? `<div style="display:flex;align-items:center;gap:4px;">${dots.join('')}</div>` : '';
    const chipsHtml = chips.length
      ? `<div style="display:flex;flex-direction:column;gap:4px;">${chips.join('')}</div>` : '';

    return `<div style="display:flex;flex-direction:column;gap:5px;">${dotsHtml}${chipsHtml}</div>`;
  }

  _buildConsumableIcons() {
    const ICONS = {
      filter_left:     `<path d="M3 4h18l-7 8.5v5.5l-4-2V12.5L3 4z"/>`,
      main_brush_left: `<rect x="2" y="9" width="20" height="5" rx="2.5"/>
                        <line x1="6"  y1="14" x2="5.5" y2="19"/>
                        <line x1="10" y1="14" x2="10"  y2="19"/>
                        <line x1="14" y1="14" x2="14"  y2="19"/>
                        <line x1="18" y1="14" x2="18.5" y2="19"/>`,
      side_brush_left: `<circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/>
                        <line x1="12" y1="9.5" x2="12" y2="4"/>
                        <line x1="10" y1="13.2" x2="4.8" y2="16.3"/>
                        <line x1="14" y1="13.2" x2="19.2" y2="16.3"/>`,
      sensor_left:     `<circle cx="12" cy="12" r="3"/>
                        <path d="M5 12a7 7 0 0 1 14 0" fill="none"/>
                        <path d="M8 12a4 4 0 0 1 8 0" fill="none"/>`,
      _dock_strainer:  `<rect x="3" y="3" width="18" height="18" rx="3" fill="none"/>
                        <line x1="3" y1="8"  x2="21" y2="8"/>
                        <line x1="3" y1="13" x2="21" y2="13"/>
                        <line x1="8"  y1="3" x2="8"  y2="21"/>
                        <line x1="13" y1="3" x2="13" y2="21"/>`,
    };

    const allConsumables = [
      ...CONSUMABLES,
      { key: '_dock_strainer', label: 'Filtr doku', maxHours: 150, warnAt: 30 },
    ];

    const totalArea  = this._getSensorNum('total_area');
    const totalTime  = this._getSensorNum('total_time');
    const totalCount = this._getSensorNum('total_count');

    const icons = allConsumables.map(c => {
      const hoursLeft = c.key === '_dock_strainer'
        ? this._getDockSensorNum('strainer_left')
        : this._getSensorNum(c.key);
      const pct    = hoursLeft !== null ? consumablePct(hoursLeft, c.maxHours) : null;
      const col    = pct !== null ? consumableColor(pct) : '#5F5E5A';
      const warn   = hoursLeft !== null && hoursLeft <= c.warnAt;
      const valStr = hoursLeft !== null ? `${fmtHours(hoursLeft)} · ${Math.round(pct??0)}%` : '—';
      const rgb    = col === '#97C459' ? '151,196,89' : col === '#EF9F27' ? '239,159,39' : '226,75,74';

      return `
        <div class="ci" style="background:rgba(${rgb},0.10);
                               border:1px solid rgba(${rgb},${warn?'0.35':'0.15'});">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="${col}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
               ${warn ? `style="filter:drop-shadow(0 0 4px ${col}88)"` : ''}>${ICONS[c.key]||''}</svg>
          ${warn ? `<span style="position:absolute;top:2px;right:2px;width:6px;height:6px;
                                 border-radius:50%;background:#E24B4A;border:1px solid #1C1C1E;"></span>` : ''}
          <div class="ct">
            <div class="ct-label">${c.label}</div>
            <div class="ct-bar-track"><div class="ct-bar-fill" style="width:${(pct??0).toFixed(1)}%;background:${col};"></div></div>
            <div class="ct-value" style="color:${col};">${valStr}</div>
          </div>
        </div>`;
    });

    const lifetimeParts = [];
    if (totalCount !== null) lifetimeParts.push(`${Math.round(totalCount)}×`);
    if (totalArea  !== null) lifetimeParts.push(fmtArea(parseFloat(totalArea)));
    if (totalTime  !== null) lifetimeParts.push(fmtTime(totalTime));
    const lifetime = lifetimeParts.length
      ? `<span style="font-size:10px;color:rgba(255,255,255,0.18);margin-left:auto;">${lifetimeParts.join(' · ')}</span>`
      : '';

    return `<div class="consumables">${icons.join('')}${lifetime}</div>`;
  }

  _renderConsumables() {
    const totalArea  = this._getSensorNum('total_area');
    const totalTime  = this._getSensorNum('total_time');
    const totalCount = this._getSensorNum('total_count');

    // SVG paths per consumable type
    const ICONS = {
      filter_left:     `<path d="M3 4h18l-7 8.5v5.5l-4-2V12.5L3 4z"/>`,
      main_brush_left: `<rect x="2" y="9" width="20" height="5" rx="2.5"/>
                        <line x1="6"  y1="14" x2="5.5" y2="19"/>
                        <line x1="10" y1="14" x2="10"  y2="19"/>
                        <line x1="14" y1="14" x2="14"  y2="19"/>
                        <line x1="18" y1="14" x2="18.5" y2="19"/>`,
      side_brush_left: `<circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/>
                        <line x1="12" y1="9.5" x2="12" y2="4"/>
                        <line x1="10" y1="13.2" x2="4.8" y2="16.3"/>
                        <line x1="14" y1="13.2" x2="19.2" y2="16.3"/>`,
      sensor_left:     `<circle cx="12" cy="12" r="3"/>
                        <path d="M5 12a7 7 0 0 1 14 0" fill="none"/>
                        <path d="M8 12a4 4 0 0 1 8 0" fill="none"/>`,
      _dock_strainer:  `<rect x="3" y="3" width="18" height="18" rx="3" fill="none"/>
                        <line x1="3" y1="8"  x2="21" y2="8"/>
                        <line x1="3" y1="13" x2="21" y2="13"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                        <line x1="8"  y1="3" x2="8"  y2="21"/>
                        <line x1="13" y1="3" x2="13" y2="21"/>`,
    };

    const allConsumables = [
      ...CONSUMABLES,
      { key: '_dock_strainer', label: 'Filtr doku', maxHours: 150, warnAt: 30 },
    ];

    const icons = allConsumables.map(c => {
      const hoursLeft = c.key === '_dock_strainer'
        ? this._getDockSensorNum('strainer_left')
        : this._getSensorNum(c.key);

      const pct     = hoursLeft !== null ? consumablePct(hoursLeft, c.maxHours) : null;
      const col     = pct !== null ? consumableColor(pct) : '#5F5E5A';
      const warn    = hoursLeft !== null && hoursLeft <= c.warnAt;
      const valStr  = hoursLeft !== null ? `${fmtHours(hoursLeft)} · ${Math.round(pct ?? 0)}%` : '—';
      const svgPath = ICONS[c.key] || '';

      const warnDot = warn
        ? `<span style="position:absolute;top:2px;right:2px;width:6px;height:6px;
                        border-radius:50%;background:#E24B4A;border:1px solid #1C1C1E;"></span>`
        : '';

      return `
        <div class="ci" style="background:rgba(${col==='#97C459'?'151,196,89':col==='#EF9F27'?'239,159,39':'226,75,74'},0.10);
                               border:1px solid rgba(${col==='#97C459'?'151,196,89':col==='#EF9F27'?'239,159,39':'226,75,74'},${warn?'0.35':'0.15'});">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="${col}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
               ${warn ? `style="filter:drop-shadow(0 0 4px ${col}88)"` : ''}>${svgPath}</svg>
          ${warnDot}
          <div class="ct">
            <div class="ct-label">${c.label}</div>
            <div class="ct-bar-track">
              <div class="ct-bar-fill" style="width:${(pct??0).toFixed(1)}%;background:${col};"></div>
            </div>
            <div class="ct-value" style="color:${col};">${valStr}</div>
          </div>
        </div>`;
    });

    // Lifetime stats — compact, right-aligned
    const lifetimeParts = [];
    if (totalCount !== null) lifetimeParts.push(`${Math.round(totalCount)}×`);
    if (totalArea  !== null) lifetimeParts.push(fmtArea(parseFloat(totalArea)));
    if (totalTime  !== null) lifetimeParts.push(fmtTime(totalTime));
    const lifetime = lifetimeParts.length
      ? `<span style="font-size:10px;color:rgba(255,255,255,0.18);margin-left:auto;">${lifetimeParts.join(' · ')}</span>`
      : '';

    return `<div class="consumables">${icons.join('')}${lifetime}</div>`;
  }

  _renderActions(group, vacState) {
    // During mop_washing / mop_drying: show only locate (do not interrupt dock cycle)
    const dockCycleGroups = new Set(['mop_washing','mop_drying']);
    const isDockCycle = dockCycleGroups.has(group);

    let visibleActions;
    if (isDockCycle) {
      visibleActions = ACTIONS.filter(a => a.id === 'locate');
    } else {
      visibleActions = ACTIONS.filter(a => a.show.includes(vacState));
    }

    if (!visibleActions.length) return '';

    const btns = visibleActions.map(a => `
      <button class="action-btn" data-service="${a.svc}" data-color="${a.col}">
        ${a.label}
      </button>
    `).join('');

    return `<div class="actions-row">${btns}</div>`;
  }
}

// ─────────────────────────────────────────────
// Registration
// ─────────────────────────────────────────────

customElements.define('roborock-vacuum-card', RoboVacuumCard);
customElements.define('aha-roborock-vacuum-card', class extends RoboVacuumCard {});

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: 'roborock-vacuum-card',
  name: 'Roborock Vacuum Card',
  preview: false,
  description: 'Roborock Saros 10R — slim + verbose, z dokiem, suszeniem mopa i konsumablami',
});
/**
 * aha-briefing-card  — Daily briefing: greeting, weather summary,
 *                       presence, and upcoming reminders.
 *
 * Config:
 *   weather_entity    weather.forecast_home
 *   temp_entity       sensor.*
 *   feels_entity      sensor.*  (optional)
 *   wind_entity       sensor.*  (optional, km/h)
 *   forecast_entity   sensor.*  (attributes.forecast = hourly JSON)
 *   rain_entity       sensor.*  (optional, daily accumulating mm)
 *   people:
 *     - name: Tomek
 *       entity: device_tracker.iphone_tk
 *       battery_entity: sensor.iphone_tk_battery_level  (optional)
 *   fertilizations:
 *     - date: 'YYYY-MM-DD'
 *       name: 'Nawóz wiosenny'
 *   waste:
 *     - entity: sensor.harmonogram_bio   ← reads date from HA state/attributes
 *       name: Bio
 *       color: '#4CAF50'
 *     - date: '2026-05-22'              ← or hardcoded date
 *       name: Plastik
 *       color: '#FF9800'
 *   days_fertilization: 14   (show fertil reminders up to N days ahead, default 14)
 *   days_waste: 3            (show waste reminders up to N days ahead, default 3)
 *   ai_task:
 *     agent_id: conversation.google_generative_ai  (optional, uses HA default if omitted)
 *     refresh_interval: 3600                        (seconds between auto-refresh, default 3600)
 *     prompt: |
 *       Dzisiaj jest {{day_name}}, {{date}}.
 *       Pogoda: {{weather_label}}, {{temperature}}°C, wiatr {{wind}} km/h.
 *       W domu: {{people_home}}.
 *       ...
 *
 *   Available {{variables}} in prompt: date, day_name, time, weather_condition,
 *   weather_label, temperature, feels_like, wind, people_home, people_away, reminders
 *
 * Registers as: aha-briefing-card  (legacy: briefing-card)
 */
(function () {
  'use strict';

  // ── i18n helpers ─────────────────────────────────────────────────────────────

  const MONTHS_PL = ['stycznia','lutego','marca','kwietnia','maja','czerwca',
    'lipca','sierpnia','września','października','listopada','grudnia'];
  const DAYS_PL = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];

  const WX_LABEL = {
    'sunny':'Słonecznie','clear-night':'Bezchmurnie',
    'partlycloudy':'Zm. zachmurzenie','cloudy':'Zachmurzenie',
    'rainy':'Deszcz','pouring':'Ulewa','snowy':'Śnieg',
    'snowy-rainy':'Deszcz ze śniegiem','hail':'Grad',
    'lightning':'Burza','lightning-rainy':'Burza z deszczem',
    'fog':'Mgła','windy':'Wietrzno','windy-variant':'Wietrzno',
    'exceptional':'Wyjątkowo',
  };

  // ── Small utilities ───────────────────────────────────────────────────────────

  function pad(n) { return String(n).padStart(2, '0'); }

  function escHtml(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function toDateStr(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function daysUntil(dateStr) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    return Math.round((target - today) / 86400000);
  }

  function tempColor(t) {
    if (t === null || t === undefined) return '#aaaaaa';
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
    return '#C0392B';
  }

  function greeting(h) {
    if (h >= 5  && h < 12) return 'Dzień dobry';
    if (h >= 12 && h < 19) return 'Dzień dobry';
    if (h >= 19 && h < 23) return 'Dobry wieczór';
    return 'Dobranoc';
  }

  // Time-of-day gradient accent (subtle overlay tint)
  function todTint(h) {
    if (h >= 5  && h < 9)  return 'rgba(255,180,60,0.06)';   // sunrise — warm
    if (h >= 9  && h < 18) return 'rgba(80,160,255,0.04)';   // day — neutral cool
    if (h >= 18 && h < 22) return 'rgba(160,80,200,0.06)';   // evening — violet
    return 'rgba(30,40,100,0.10)';                             // night — deep
  }

  // ── Weather icon (SVG, scalable) ──────────────────────────────────────────────

  function wxIconSVG(st, px) {
    const s = '#F5A623', cl = '#6a7a9a', r = '#5ab0ff', sn = '#aee4f8', b = '#FFD060', m = '#c8d8f0';
    const rays = [0,60,120,180,240,300].map(d => {
      const a = d * Math.PI / 180;
      return `<line x1="${(Math.cos(a)*5.5).toFixed(1)}" y1="${(Math.sin(a)*5.5).toFixed(1)}" x2="${(Math.cos(a)*7.8).toFixed(1)}" y2="${(Math.sin(a)*7.8).toFixed(1)}" stroke="${s}" stroke-width="1.5" stroke-linecap="round"/>`;
    }).join('');

    let inner;
    if (st === 'sunny')
      inner = `<circle r="4" fill="${s}"/>${rays}`;
    else if (st === 'clear-night')
      inner = `<path d="M0-7.5a7.5 7.5 0 000 15 5.5 5.5 0 010-15z" fill="${m}"/>`;
    else if (st === 'partlycloudy')
      inner = `<circle cx="-2" cy="-2" r="3.5" fill="${s}" opacity=".9"/><path d="M-5.5 4a4.5 4.5 0 019 0H-5.5z" fill="${cl}"/><circle cx="-0.5" cy="1" r="3" fill="${cl}"/>`;
    else if (st === 'rainy' || st === 'pouring')
      inner = `<path d="M-6 0a5 5 0 0110 0H-6z" fill="${cl}"/><circle cx="-1" cy="-2.5" r="3" fill="${cl}"/><line x1="-4" y1="5" x2="-5" y2="9" stroke="${r}" stroke-width="1.5" stroke-linecap="round"/><line x1="0" y1="5" x2="-1" y2="9" stroke="${r}" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="5" x2="3" y2="9" stroke="${r}" stroke-width="1.5" stroke-linecap="round"/>`;
    else if (st === 'snowy' || st === 'snowy-rainy')
      inner = `<circle r="1.8" fill="${sn}"/><line x1="0" y1="-7" x2="0" y2="7" stroke="${sn}" stroke-width="1.4" stroke-linecap="round"/><line x1="-6.1" y1="-3.5" x2="6.1" y2="3.5" stroke="${sn}" stroke-width="1.4" stroke-linecap="round"/><line x1="-6.1" y1="3.5" x2="6.1" y2="-3.5" stroke="${sn}" stroke-width="1.4" stroke-linecap="round"/>`;
    else if (st === 'lightning' || st === 'lightning-rainy')
      inner = `<path d="M-6-1a5 5 0 0110 0H-6z" fill="${cl}"/><polygon points="1,-1 -3,6 0,6 -2,11" fill="${b}"/>`;
    else if (st === 'fog')
      inner = `<line x1="-7" y1="-4" x2="7" y2="-4" stroke="${cl}" stroke-width="2" stroke-linecap="round" opacity=".7"/><line x1="-5" y1="0" x2="5" y2="0" stroke="${cl}" stroke-width="2" stroke-linecap="round" opacity=".55"/><line x1="-7" y1="4" x2="4" y2="4" stroke="${cl}" stroke-width="2" stroke-linecap="round" opacity=".4"/>`;
    else if (st === 'windy' || st === 'windy-variant')
      inner = `<path d="M-7-4 Q0-8 7-4" stroke="${r}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M-7 0 Q0-4 7 0" stroke="${r}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".7"/><path d="M-7 4 Q0 1 5 4" stroke="${r}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".45"/>`;
    else
      inner = `<path d="M-6 3a5 5 0 0110 0H-6z" fill="${cl}"/><circle cx="-1" cy="0" r="3.5" fill="${cl}"/><circle cx="4" cy="1" r="2.5" fill="${cl}"/>`;

    return `<svg width="${px}" height="${px}" viewBox="-12 -12 24 24" style="display:block">${inner}</svg>`;
  }

  // ── Smart forecast summary — returns [{label, text}, ...] per day ────────────

  function buildSummaryParts(fcAll, now) {
    if (!Array.isArray(fcAll) || !fcAll.length) return [];

    const todayStr    = toDateStr(now);
    const tomorrowStr = toDateStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));

    function analyzeSlots(slots) {
      if (!slots.length) return null;
      const temps  = slots.map(f => f.temperature).filter(t => typeof t === 'number');
      const maxT   = temps.length ? Math.max(...temps) : null;
      const minT   = temps.length ? Math.min(...temps) : null;
      const precip = slots.reduce((s, f) => s + (f.precipitation || 0), 0);

      const counts = {};
      for (const f of slots) { const c = f.condition || 'cloudy'; counts[c] = (counts[c] || 0) + 1; }
      const cond = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'cloudy';

      let rainTime = null;
      if (precip >= 0.5) {
        const firstRainy = slots.find(f => (f.precipitation || 0) >= 0.3);
        if (firstRainy) {
          const h = new Date(firstRainy.datetime).getHours();
          rainTime = h < 6 ? 'w nocy' : h < 12 ? 'rano' : h < 17 ? 'po południu' : 'wieczorem';
        }
      }
      return { cond, maxT, minT, precip, rainTime };
    }

    const byDay = {};
    for (const f of fcAll) {
      const ds = toDateStr(new Date(f.datetime));
      (byDay[ds] = byDay[ds] || []).push(f);
    }

    const parts = [];
    for (const [label, ds] of [['Dziś', todayStr], ['Jutro', tomorrowStr]]) {
      const allSlots = byDay[ds] || [];
      const slots = ds === todayStr
        ? allSlots.filter(f => new Date(f.datetime) >= now)
        : allSlots;
      if (!slots.length) continue;
      const a = analyzeSlots(slots);
      if (!a) continue;

      let text = (WX_LABEL[a.cond] || a.cond).toLowerCase();
      if (a.rainTime && a.precip >= 0.5) text += `, deszcz ${a.precip.toFixed(1)} mm ${a.rainTime}`;
      if (a.maxT !== null) text += ` · max ${Math.round(a.maxT)}°`;
      parts.push({ label, text });
    }
    return parts;
  }

  // ── Waste date extraction from HA entity ─────────────────────────────────────

  function wasteEntityDate(haState) {
    if (!haState) return null;
    const attrs = haState.attributes || {};
    // Try common attribute names
    const raw = attrs.next_date || attrs.date || attrs.next_pickup || attrs.next_collection || haState.state;
    if (!raw) return null;
    // If it's a number (days until) → compute date
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 0 && num < 365 && String(raw).trim() === String(Math.round(num))) {
      const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() + Math.round(num));
      return toDateStr(d);
    }
    // If it's ISO date string
    if (/^\d{4}-\d{2}-\d{2}/.test(String(raw))) return String(raw).slice(0, 10);
    return null;
  }

  // ── Card ──────────────────────────────────────────────────────────────────────

  class BriefingCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._hass        = null;
      this._config      = {};
      this._tick        = null;
      this._aiMessage   = null;
      this._aiLoading   = false;
      this._aiError     = null;
      this._aiLastFetch = 0;
    }

    static getStubConfig() {
      return {
        weather_entity:   'weather.forecast_home',
        temp_entity:      'sensor.stacja_pogodowa_outdoor_temperature',
        feels_entity:     'sensor.stacja_pogodowa_feels_like_temperature',
        wind_entity:      'sensor.stacja_pogodowa_wind_speed',
        forecast_entity:  'sensor.forecast_hourly_json',
        rain_entity:      'sensor.stacja_pogodowa_daily_rain_piezo',
        people: [
          { name: 'Tomek',  entity: 'device_tracker.iphone_tk' },
          { name: 'Monika', entity: 'device_tracker.iphone_monika' },
        ],
        fertilizations: [
          { date: '2026-05-20', name: 'Nawóz wiosenny', description: 'Florovit Trawnik, 30g/m²' },
        ],
        waste: [
          { entity: 'sensor.harmonogram_bio',    name: 'Bio',     color: '#4CAF50' },
          { entity: 'sensor.harmonogram_papier',  name: 'Papier',  color: '#2196F3' },
          { entity: 'sensor.harmonogram_plastik', name: 'Plastik', color: '#FF9800' },
          { entity: 'sensor.harmonogram_szklo',   name: 'Szkło',   color: '#9C27B0' },
        ],
        days_fertilization: 14,
        days_waste: 3,
        szambo: { entity: 'sensor.szambo_zuzycie', capacity: 10, warn_pct: 75 },
        ai_task: {
          agent_id: 'conversation.google_ai_conversation',
          refresh_interval: 3600,
          prompt: 'Dzisiaj jest {{day_name}}, {{date}}. Pogoda: {{weather_label}}, {{temperature}}°C. Napisz krótkie poranne podsumowanie po polsku.',
        },
      };
    }

    setConfig(config) {
      this._config = {
        people: [], fertilizations: [], waste: [],
        days_fertilization: 14, days_waste: 3,
        szambo: null,    // { entity, capacity, warn_pct }
        ai_task: null,   // { agent_id, prompt, refresh_interval }
        ...config,
      };
    }

    set hass(hass) {
      const first = !this._hass;
      this._hass = hass;
      this._render();
      if (first) {
        // Re-render every minute so clock/greeting stays fresh; also poll AI refresh
        this._tick = setInterval(() => {
          this._render();
          this._maybeRefreshAI();
        }, 60000);
        this._maybeRefreshAI();
      }
    }

    disconnectedCallback() {
      if (this._tick) { clearInterval(this._tick); this._tick = null; }
    }

    // ── Reminder list ─────────────────────────────────────────────────────────

    _reminders() {
      const items = [];
      const fertDays  = this._config.days_fertilization || 14;
      const wasteDays = this._config.days_waste || 3;

      // Fertilizations (respect done state from weather-card localStorage)
      for (const f of (this._config.fertilizations || [])) {
        const days = daysUntil(f.date);
        if (days < 0 || days > fertDays) continue;
        let done = false;
        try { done = localStorage.getItem('aha-fertil-done:' + f.date) !== null; } catch (_) {}
        if (done) continue;
        items.push({ days, name: f.name, color: '#50C85A', icon: 'leaf' });
      }

      // Waste — supports both entity (read from HA) and hardcoded date
      for (const w of (this._config.waste || [])) {
        let dateStr = w.date || null;
        if (!dateStr && w.entity && this._hass) {
          dateStr = wasteEntityDate(this._hass.states[w.entity]);
        }
        if (!dateStr) continue;
        const days = daysUntil(dateStr);
        if (days < 0 || days > wasteDays) continue;
        items.push({ days, name: w.name, color: w.color || '#FF9800', icon: 'waste' });
      }

      // Szambo — show when fill % exceeds threshold (no date, priority by urgency)
      const sz = this._config.szambo;
      if (sz && sz.entity && this._hass) {
        const szVal  = parseFloat(this._hass.states[sz.entity]?.state);
        const szCap  = sz.capacity || 10;
        const szWarn = sz.warn_pct || 75;
        if (!isNaN(szVal)) {
          const pct = Math.round((szVal / szCap) * 100);
          if (pct >= szWarn) {
            const color = pct >= 90 ? '#FF3B30' : '#FF9500';
            const left  = (szCap - szVal).toFixed(1);
            items.push({
              days: -1,  // not date-based — sort to front when critical, after urgent dates
              pct, name: `Szambo ${pct}%`,
              sub: `zostało ~${left} m³`,
              color, icon: 'szambo',
              urgent: pct >= 90,
            });
          }
        }
      }

      // Sort: date-based by days asc, szambo by urgency at end (or front if critical)
      items.sort((a, b) => {
        if (a.days === -1 && b.days === -1) return b.pct - a.pct;
        if (a.days === -1) return a.urgent ? -1 : 1;
        if (b.days === -1) return b.urgent ? 1 : -1;
        return a.days - b.days;
      });
      return items;
    }

    // ── AI Briefing ───────────────────────────────────────────────────────────

    async _maybeRefreshAI() {
      const cfg = this._config.ai_task;
      if (!cfg?.prompt || this._aiLoading) return;
      const interval = (cfg.refresh_interval || 3600) * 1000;
      if (this._aiMessage && (Date.now() - this._aiLastFetch) < interval) return;

      this._aiLoading = true;
      this._render();

      try {
        const now = new Date();
        const reminders = this._reminders();
        const vars = {
          date:              toDateStr(now),
          day_name:          DAYS_PL[now.getDay()],
          time:              `${pad(now.getHours())}:${pad(now.getMinutes())}`,
          weather_condition: this._hass.states[this._config.weather_entity]?.state || '',
          weather_label:     WX_LABEL[this._hass.states[this._config.weather_entity]?.state] || '',
          temperature:       this._hass.states[this._config.temp_entity]?.state || '',
          feels_like:        this._hass.states[this._config.feels_entity]?.state || '',
          wind:              this._hass.states[this._config.wind_entity]?.state || '',
          people_home:       (this._config.people || [])
            .filter(p => this._hass.states[p.entity]?.state === 'home')
            .map(p => p.name).join(', ') || 'nikt',
          people_away:       (this._config.people || [])
            .filter(p => this._hass.states[p.entity]?.state !== 'home')
            .map(p => p.name).join(', ') || 'nikt',
          reminders:         reminders.length
            ? reminders.map(r => r.name + (r.days >= 0 ? ` (za ${r.days} dni)` : '')).join(', ')
            : 'brak',
        };

        // Substitute {{variable}} placeholders in prompt
        const prompt = cfg.prompt.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');

        const serviceData = { text: prompt };
        if (cfg.agent_id) serviceData.agent_id = cfg.agent_id;

        const resp = await this._hass.callService(
          'conversation', 'process',
          serviceData,
          undefined, false, true
        );

        this._aiMessage = resp?.response?.speech?.plain?.speech
          ?? resp?.response?.response?.speech?.plain?.speech
          ?? '';
        this._aiLastFetch = Date.now();
        this._aiError = null;
      } catch (e) {
        console.error('[briefing-card] AI error:', e);
        this._aiError = e?.message || 'Błąd AI';
      } finally {
        this._aiLoading = false;
        this._render();
      }
    }

    // ── Main render ───────────────────────────────────────────────────────────

    _render() {
      if (!this._hass) return;
      const cfg  = this._config;
      const hass = this._hass;
      const now  = new Date();
      const h    = now.getHours();

      // Time & date
      const greetText = greeting(h);
      const dateText  = `${DAYS_PL[now.getDay()]}, ${now.getDate()} ${MONTHS_PL[now.getMonth()]}`;
      const timeText  = `${pad(h)}:${pad(now.getMinutes())}`;
      const tint      = todTint(h);

      // Weather
      const wxState = hass.states[cfg.weather_entity];
      const wxCond  = wxState?.state || 'cloudy';
      const wxLabel = WX_LABEL[wxCond] || wxCond;

      const tempRaw  = parseFloat(hass.states[cfg.temp_entity]?.state);
      const feelsRaw = parseFloat(hass.states[cfg.feels_entity]?.state);
      const windRaw  = parseFloat(hass.states[cfg.wind_entity]?.state);
      const rainRaw  = parseFloat(hass.states[cfg.rain_entity]?.state);

      const temp  = !isNaN(tempRaw)  ? tempRaw  : null;
      const feels = !isNaN(feelsRaw) ? feelsRaw : null;
      const wind  = !isNaN(windRaw)  ? windRaw  : null;
      const rain  = !isNaN(rainRaw)  ? rainRaw  : null;

      const tempC   = tempColor(temp);
      const tempStr = temp !== null ? Math.round(temp) + '°' : '—';

      // Forecast summary (array of {label, text})
      const fcAll        = hass.states[cfg.forecast_entity]?.attributes?.forecast || [];
      const summaryParts = buildSummaryParts(fcAll, now);

      // Sun: sunset from sun.sun
      const sun = hass.states['sun.sun'];
      let sunsetStr = null;
      if (sun?.attributes?.next_setting) {
        const ss = new Date(sun.attributes.next_setting);
        if (ss > now) sunsetStr = `${pad(ss.getHours())}:${pad(ss.getMinutes())}`;
      }

      // Stats chips
      const chips = [];
      if (feels !== null && temp !== null && Math.abs(feels - temp) >= 1)
        chips.push({ svg: _chipSVG('feels'), label: `odcz. ${Math.round(feels)}°` });
      if (wind !== null)
        chips.push({ svg: _chipSVG('wind'), label: `${Math.round(wind)} km/h` });
      if (rain !== null && rain > 0)
        chips.push({ svg: _chipSVG('rain'), label: `${rain.toFixed(1)} mm` });
      if (sunsetStr)
        chips.push({ svg: _chipSVG('sunset'), label: sunsetStr });

      // People
      const people = (cfg.people || []).map(p => {
        const s      = hass.states[p.entity];
        const isHome = s?.state === 'home';
        let sinceStr = '';
        if (!isHome && s?.last_changed) {
          const mins = Math.round((now - new Date(s.last_changed)) / 60000);
          sinceStr = mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h`;
        }
        const batRaw = p.battery_entity ? parseFloat(hass.states[p.battery_entity]?.state) : NaN;
        const bat    = !isNaN(batRaw) ? Math.round(batRaw) : null;
        // Avatar: try picture_entity → person_entity → auto-find person.* → tracker entity_picture
        let picSrc = null;
        if (p.picture_entity) {
          picSrc = hass.states[p.picture_entity]?.attributes?.entity_picture || null;
        } else if (p.person_entity) {
          picSrc = hass.states[p.person_entity]?.attributes?.entity_picture || null;
        } else {
          // auto-discover: find person.* whose user_id or source_list includes this tracker
          const personEntry = Object.values(hass.states).find(st =>
            st.entity_id.startsWith('person.') &&
            (st.attributes?.source === p.entity ||
             (Array.isArray(st.attributes?.source_list) && st.attributes.source_list.includes(p.entity)))
          );
          picSrc = personEntry?.attributes?.entity_picture
            || s?.attributes?.entity_picture
            || null;
        }
        const initial = (p.name || '?')[0].toUpperCase();
        const isWorking = p.working_entity
          ? hass.states[p.working_entity]?.state === 'on'
          : false;
        return { name: p.name, isHome, sinceStr, bat, img: picSrc, initial, isWorking };
      });

      // Reminders
      const reminders = this._reminders();

      // ── HTML ──────────────────────────────────────────────────────────────────

      const chipsHtml = chips.map(c =>
        `<div class="chip">${c.svg}<span class="chip-lbl">${c.label}</span></div>`
      ).join('');

      const peopleHtml = people.map(p => {
        const homeLabel   = p.isHome ? 'w domu' : (p.sinceStr ? `poza · ${p.sinceStr}` : 'poza');
        const avatarInner = p.img
          ? `<img src="${p.img}" alt="${p.name}">`
          : `<span class="person-initial">${p.initial}</span>`;
        const batHtml = p.bat !== null
          ? `<span class="person-bat" style="color:${p.bat < 20 ? '#FF6B6B' : 'rgba(255,255,255,0.25)'}">${p.bat}%</span>`
          : '';
        return `<div class="person">
          <div class="person-avatar">
            ${avatarInner}
            <div class="person-presence ${p.isHome ? 'dot-home' : 'dot-away'}"></div>
            ${p.isWorking ? `<div class="person-work-dot"></div>` : ''}
          </div>
          <span class="person-name">${p.name}</span>
          <span class="person-status">${homeLabel}</span>
          ${batHtml}
        </div>`;
      }).join('');

      const remindersHtml = reminders.map(r => {
        const isUrgent = r.days <= 1 || r.urgent;
        const urgency  = r.days === -1 ? ''
          : r.days === 0 ? 'dziś!' : r.days === 1 ? 'jutro' : `za ${r.days} dni`;
        const iconHtml = r.icon === 'leaf' ? _remIconLeaf(r.color)
          : r.icon === 'szambo' ? _remIconSzambo(r.color)
          : _remIconWaste(r.color);
        return `<div class="reminder${isUrgent ? ' urgent' : ''}" style="--rc:${r.color}">
          ${iconHtml}
          <div class="rem-body">
            <span class="rem-name">${r.name}</span>
            ${r.sub ? `<span class="rem-sub">${r.sub}</span>` : ''}
          </div>
          ${urgency ? `<span class="rem-when">${urgency}</span>` : ''}
        </div>`;
      }).join('');

      this.shadowRoot.innerHTML = `
        <style>${this._css()}</style>
        <div class="card" style="--tint:${tint}">
          <div class="tint-overlay"></div>

          <!-- Header -->
          <div class="header">
            <div>
              <div class="greeting">${greetText}</div>
              <div class="date">${dateText}</div>
            </div>
            <div class="time">${timeText}</div>
          </div>

          <!-- Weather + People side by side -->
          <div class="wx-people-row">
            <div class="wx-col">
              <div class="wx-left">
                ${wxIconSVG(wxCond, 46)}
                <div class="wx-text">
                  <div class="wx-cond">${wxLabel}</div>
                  <div class="wx-temp" style="color:${tempC}">${tempStr}</div>
                </div>
              </div>
              ${chips.length ? `<div class="chips">${chipsHtml}</div>` : ''}
            </div>
            ${people.length ? `
            <div class="people-col">
              <div class="people">${peopleHtml}</div>
            </div>` : ''}
          </div>

          <!-- Forecast summary (animated carousel when 2 parts) -->
          ${summaryParts.length ? `
          <div class="summary-wrap${summaryParts.length > 1 ? ' animated' : ''}">
            ${summaryParts.map((p, i) =>
              `<div class="sum-slide" style="${summaryParts.length > 1 ? `animation-delay:${i * 5}s` : ''}">
                <span class="sum-label">${p.label}</span> ${p.text}
              </div>`
            ).join('')}
          </div>` : ''}

          <!-- AI Briefing (in weather area, after forecast) -->
          ${cfg.ai_task?.prompt ? `
          <div class="ai-box">
            <div class="ai-box-top">
              <span class="ai-box-label">✦ briefing</span>
              <button class="ai-refresh" title="Odśwież">↻</button>
            </div>
            <div class="ai-text${this._aiLoading ? ' ai-loading' : this._aiError ? ' ai-error' : ''}">
              ${this._aiLoading
                ? 'Generuję…'
                : this._aiError
                  ? escHtml(this._aiError)
                  : this._aiMessage
                    ? escHtml(this._aiMessage)
                    : 'Oczekiwanie…'}
            </div>
          </div>` : ''}


          <!-- Reminders -->
          ${remindersHtml ? `
            <div class="sep"></div>
            <div class="sect-label">Przypomnienia</div>
            <div class="reminders">${remindersHtml}</div>` : ''}
        </div>`;

      // Re-attach refresh button listener (innerHTML replaces DOM each render)
      const refreshBtn = this.shadowRoot.querySelector('.ai-refresh');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          this._aiLastFetch = 0;
          this._aiMessage   = null;
          this._maybeRefreshAI();
        });
      }
    }

    // ── CSS ───────────────────────────────────────────────────────────────────

    _css() {
      return `
      :host { display: block; font-family: -apple-system, system-ui, sans-serif; }

      .card {
        position: relative;
        background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
        border-radius: 24px;
        border: 1px solid rgba(255,255,255,0.08);
        overflow: hidden;
        padding: 18px 18px 16px;
        color: rgba(255,255,255,0.88);
      }
      .tint-overlay {
        position: absolute; inset: 0; pointer-events: none; z-index: 0;
        background: var(--tint, transparent);
      }
      .card > * { position: relative; z-index: 1; }

      /* Header */
      .header {
        display: flex; justify-content: space-between; align-items: flex-start;
        margin-bottom: 16px;
      }
      .greeting {
        font-size: 23px; font-weight: 700; letter-spacing: -.4px;
        line-height: 1; margin-bottom: 5px;
        color: rgba(255,255,255,0.92);
      }
      .date {
        font-size: 11px; font-weight: 500;
        color: rgba(255,255,255,0.32); letter-spacing: .02em;
      }
      .time {
        font-size: 26px; font-weight: 200;
        color: rgba(255,255,255,0.30); letter-spacing: -1px;
        padding-top: 2px;
      }

      /* Weather + People two-column row */
      .wx-people-row {
        display: flex; align-items: stretch; gap: 0;
        margin-bottom: 10px;
      }
      .wx-col {
        flex: 1; min-width: 0;
        display: flex; flex-direction: column; gap: 8px;
      }
      .people-col {
        flex: 1; min-width: 0;
        display: flex; align-items: center; justify-content: center;
        border-left: .5px solid rgba(255,255,255,.07);
        padding-left: 14px;
      }
      .wx-left { display: flex; align-items: center; gap: 10px; }
      .wx-text {}
      .wx-cond {
        font-size: 11px; color: rgba(255,255,255,0.38);
        margin-bottom: 2px; font-weight: 500;
      }
      .wx-temp {
        font-size: 30px; font-weight: 700; letter-spacing: -.8px; line-height: 1;
      }

      /* Chips (below temp in wx-col) */
      .chips { display: flex; flex-wrap: wrap; gap: 4px; align-items: flex-start; }
      .chip {
        display: flex; align-items: center; gap: 5px;
        background: rgba(255,255,255,0.06);
        border-radius: 9px; padding: 4px 9px 4px 6px;
      }
      .chip svg { flex-shrink: 0; }
      .chip-lbl { font-size: 10.5px; color: rgba(255,255,255,0.52); font-weight: 500; }

      /* Forecast summary — animated carousel */
      @keyframes sum-cycle {
        /* Seamless: each slide covers its half, 0.2s crossfade overlap */
        0%   { opacity: 0; }
        2%   { opacity: 1; }
        50%  { opacity: 1; }
        52%  { opacity: 0; }
        100% { opacity: 0; }
      }
      @keyframes sum-fadein {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      .summary-wrap {
        font-size: 11.5px; color: rgba(255,255,255,0.42);
        background: rgba(255,255,255,0.045);
        border-radius: 11px; padding: 8px 11px;
        line-height: 1.5; letter-spacing: .01em;
      }
      /* Static (1 part): simple fade-in */
      .summary-wrap:not(.animated) .sum-slide {
        animation: sum-fadein .4s ease both;
      }
      /* Animated (2 parts): cross-fade carousel, fixed height, centered text */
      .summary-wrap.animated {
        position: relative;
        height: 36px;   /* fixed px — no box-model surprises */
        overflow: hidden;
        padding: 0;     /* slides handle their own padding */
      }
      .summary-wrap.animated .sum-slide {
        position: absolute; inset: 0;
        display: flex; align-items: center;
        padding: 0 11px;
        opacity: 0;
        animation: sum-cycle 10s linear infinite;
      }
      .sum-label {
        font-weight: 600; color: rgba(255,255,255,0.60);
        margin-right: 3px;
      }

      /* Separator */
      .sep { height: 1px; background: rgba(255,255,255,0.07); margin: 12px 0 10px; }

      /* Section label */
      .sect-label {
        font-size: 9px; font-weight: 700; letter-spacing: .10em;
        color: rgba(255,255,255,0.20); text-transform: uppercase;
        margin-bottom: 7px;
      }

      /* People — grid w prawej kolumnie */
      .people { display: flex; flex-direction: row; flex-wrap: wrap; gap: 14px; justify-content: center; }
      .person {
        display: flex; flex-direction: column; align-items: center; gap: 3px;
      }
      /* Avatar */
      .person-avatar {
        width: 36px; height: 36px; border-radius: 50%;
        position: relative; flex-shrink: 0;
        background: rgba(255,255,255,0.10);
        overflow: visible;
        display: flex; align-items: center; justify-content: center;
      }
      .person-avatar img {
        width: 36px; height: 36px; border-radius: 50%;
        object-fit: cover; display: block;
      }
      .person-initial {
        font-size: 14px; font-weight: 700;
        color: rgba(255,255,255,0.65);
      }
      /* Presence dot — bottom-right of avatar */
      .person-presence {
        position: absolute; bottom: 0; right: 0;
        width: 10px; height: 10px; border-radius: 50%;
        border: 2px solid #0d1828;
      }
      .dot-home {
        background: #30D158;
        box-shadow: 0 0 6px rgba(48,209,88,0.60);
      }
      .dot-away { background: rgba(255,255,255,0.22); }
      .person-name {
        font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.72);
        text-align: center;
      }
      .person-status {
        font-size: 10px; color: rgba(255,255,255,0.30);
        text-align: center;
      }
      .person-bat { font-size: 9.5px; font-weight: 600; }
      .person-work-dot {
        position: absolute; bottom: 0; left: 0;
        width: 10px; height: 10px; border-radius: 50%;
        border: 2px solid #0d1828;
        background: #ffd65a;
        box-shadow: 0 0 6px rgba(255,214,90,0.70);
      }

      /* Reminders */
      .reminders { display: flex; flex-direction: column; gap: 5px; }
      .reminder {
        display: flex; align-items: center; gap: 9px;
        border-left: 2.5px solid var(--rc);
        border-radius: 0 10px 10px 0;
        background: rgba(255,255,255,0.04);
        padding: 6px 10px 6px 9px;
        transition: background .12s;
      }
      .reminder.urgent {
        background: rgba(255,255,255,0.07);
      }
      .rem-icon { flex-shrink: 0; }
      .rem-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
      .rem-name {
        font-size: 11.5px; font-weight: 500;
        color: rgba(255,255,255,0.72);
      }
      .rem-sub {
        font-size: 10px; color: rgba(255,255,255,0.32);
      }
      .rem-when {
        font-size: 10.5px; font-weight: 700;
        color: var(--rc); opacity: .90; flex-shrink: 0;
      }

      /* AI Briefing box — styled like summary-wrap */
      .ai-box {
        background: rgba(255,255,255,0.045);
        border-radius: 11px;
        padding: 8px 11px 10px;
        margin-top: 8px;
      }
      .ai-box-top {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 5px;
      }
      .ai-box-label {
        font-size: 9px; font-weight: 700; letter-spacing: .10em;
        color: rgba(255,255,255,0.22); text-transform: uppercase;
      }
      .ai-refresh {
        background: none; border: none; cursor: pointer;
        color: rgba(255,255,255,0.20); font-size: 13px;
        padding: 0; line-height: 1;
        transition: color .2s;
      }
      .ai-refresh:hover { color: rgba(255,255,255,0.50); }
      .ai-refresh:active { transform: scale(0.88) rotate(-30deg); }
      .ai-text {
        font-size: 12px; line-height: 1.6;
        color: rgba(255,255,255,0.60);
        white-space: pre-wrap;
      }
      .ai-text.ai-loading {
        color: rgba(255,255,255,0.22);
        font-style: italic;
        animation: ai-blink 1.4s ease-in-out infinite;
      }
      .ai-text.ai-error { color: #FF6B6B; font-size: 11px; }
      @keyframes ai-blink {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.4; }
      }
      `;
    }

    getCardSize() { return 5; }
  }

  // ── Chip SVG icons ────────────────────────────────────────────────────────────

  function _chipSVG(type) {
    const col = 'rgba(255,255,255,0.45)';
    const s   = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">`;
    if (type === 'feels')
      return s + `<circle cx="6.5" cy="5" r="2" stroke="${col}" stroke-width="1.2"/><line x1="6.5" y1="7" x2="6.5" y2="11" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/><circle cx="6.5" cy="11" r="1.8" fill="${col}"/></svg>`;
    if (type === 'wind')
      return s + `<path d="M2 5h7a2 2 0 000-4" stroke="${col}" stroke-width="1.2" stroke-linecap="round" fill="none"/><path d="M2 8h5a2 2 0 010 4" stroke="${col}" stroke-width="1.2" stroke-linecap="round" fill="none"/></svg>`;
    if (type === 'rain')
      return s + `<path d="M3 7a3.5 3.5 0 017 0H3z" fill="${col}" opacity=".7"/><circle cx="5.5" cy="5" r="2" fill="${col}" opacity=".7"/><line x1="3.5" y1="10" x2="3" y2="12" stroke="${col}" stroke-width="1.3" stroke-linecap="round"/><line x1="6.5" y1="10" x2="6" y2="12" stroke="${col}" stroke-width="1.3" stroke-linecap="round"/><line x1="9.5" y1="10" x2="9" y2="12" stroke="${col}" stroke-width="1.3" stroke-linecap="round"/></svg>`;
    if (type === 'sunset')
      return s + `<circle cx="6.5" cy="5.5" r="2.5" fill="${col}" opacity=".75"/><line x1="6.5" y1="1" x2="6.5" y2="0" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/><line x1="6.5" y1="11" x2="6.5" y2="10" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/><line x1="11" y1="5.5" x2="10" y2="5.5" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/><line x1="3" y1="5.5" x2="2" y2="5.5" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/><line x1="9.5" y1="2" x2="9" y2="3" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/><line x1="4" y1="8" x2="3.5" y2="9" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/><path d="M2 9h9" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/></svg>`;
    return '';
  }

  // ── Reminder icons ────────────────────────────────────────────────────────────

  function _remIconLeaf(col) {
    return `<svg class="rem-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 13c1-3 3-6 9-9-3 6-5 8-9 9z" fill="${col}" opacity=".85"/>
      <path d="M3 13c0-2 1-4 3-5" stroke="${col}" stroke-width="1" stroke-linecap="round" fill="none" opacity=".6"/>
    </svg>`;
  }

  function _remIconWaste(col) {
    return `<svg class="rem-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="4" y="5" width="8" height="9" rx="1.5" stroke="${col}" stroke-width="1.2" opacity=".85"/>
      <path d="M2 5h12M6 5V3h4v2" stroke="${col}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>
      <line x1="6.5" y1="7" x2="6.5" y2="12" stroke="${col}" stroke-width="1" stroke-linecap="round" opacity=".6"/>
      <line x1="9.5" y1="7" x2="9.5" y2="12" stroke="${col}" stroke-width="1" stroke-linecap="round" opacity=".6"/>
    </svg>`;
  }

  function _remIconSzambo(col) {
    // Stylised underground tank with fill level indicator
    return `<svg class="rem-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="5" width="12" height="8" rx="2" stroke="${col}" stroke-width="1.2" opacity=".85"/>
      <rect x="2" y="9" width="12" height="4" rx="0" fill="${col}" opacity=".22"
        style="clip-path:inset(0 0 0 0 round 0 0 2px 2px)"/>
      <path d="M6 5V3.5a2 2 0 014 0V5" stroke="${col}" stroke-width="1.2" stroke-linecap="round" opacity=".70"/>
      <line x1="5" y1="9" x2="11" y2="9" stroke="${col}" stroke-width="1" stroke-linecap="round" opacity=".55"/>
    </svg>`;
  }

  // ── Register ───────────────────────────────────────────────────────────────────

  if (!customElements.get('aha-briefing-card')) {
    customElements.define('aha-briefing-card', BriefingCard);
  }
  if (!customElements.get('briefing-card')) {
    customElements.define('briefing-card', class extends BriefingCard {});
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.find(c => c.type === 'aha-briefing-card')) {
    window.customCards.push({
      type: 'aha-briefing-card',
      name: 'AHA Briefing Card',
      description: 'Daily briefing: weather summary, smart forecast, presence & reminders',
    });
  }
})();
/**
 * aha-garden-calendar-card  — Garden diary: fertilizations + rain history
 *
 * Config:
 *   title:          string   (default 'Ogród · Dziennik')
 *   fertilizations: [{date:'YYYY-MM-DD', name:'...', description:'...'}]
 *   rain_entity:    sensor entity with daily accumulating rain (e.g. sensor.stacja_pogodowa_daily_rain_piezo)
 *   rain_threshold: number   (mm, default 3)
 *   months_count:   number   (months to show, default 3)
 *
 * Registers as: aha-garden-calendar-card  (legacy: garden-calendar-card)
 */
(function () {
  'use strict';

  const MONTHS_PL = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec',
    'Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
  const DAYS_PL = ['Pn','Wt','Śr','Cz','Pt','So','Nd'];

  function pad(n) { return String(n).padStart(2, '0'); }
  function toDateStr(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  // Monday-first weekday index (0=Mon … 6=Sun)
  function dowMon(d) { return (d.getDay() + 6) % 7; }

  // ── Tooltip (light-DOM, fixed position — works across shadow DOM) ────────────
  let _tipEl = null;
  function _hideTip() {
    if (_tipEl) { _tipEl.remove(); _tipEl = null; }
  }
  function _showTip(anchorEl, html) {
    _hideTip();
    const rect = anchorEl.getBoundingClientRect();
    _tipEl = document.createElement('div');
    _tipEl.innerHTML = html;
    // ensure it doesn't go off left/right edge
    const w = 160;
    let left = rect.left + rect.width / 2;
    left = Math.max(w / 2 + 8, Math.min(window.innerWidth - w / 2 - 8, left));
    _tipEl.style.cssText = [
      'position:fixed',
      'z-index:9999',
      'pointer-events:none',
      `left:${Math.round(left)}px`,
      `top:${Math.round(rect.top - 8)}px`,
      'transform:translate(-50%,-100%)',
      'background:rgba(8,14,30,0.97)',
      'border:1px solid rgba(255,255,255,0.15)',
      'border-radius:11px',
      'padding:9px 12px',
      'font-size:11px',
      'line-height:1.55',
      'font-family:-apple-system,system-ui,sans-serif',
      'color:rgba(255,255,255,0.82)',
      'white-space:nowrap',
      'box-shadow:0 6px 20px rgba(0,0,0,0.55)',
    ].join(';');
    document.body.appendChild(_tipEl);
  }

  // ── Card ────────────────────────────────────────────────────────────────────

  class GardenCalendarCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._hass       = null;
      this._config     = {};
      this._offset     = 0;  // month window offset from default
      this._rainMap    = new Map(); // YYYY-MM-DD → mm (max daily)
      this._rainLoaded = false;
    }

    static getStubConfig() {
      return {
        title:          'Ogród · Dziennik',
        fertilizations: [
          { date: '2026-05-20', name: 'Nawóz wiosenny', description: 'Florovit Trawnik, 30g/m²' },
          { date: '2026-07-01', name: 'Nawóz letni',    description: 'N-P-K 12-6-18, 25g/m²' },
        ],
        rain_entity:    'sensor.stacja_pogodowa_daily_rain_piezo',
        rain_threshold: 3,
        months_count:   3,
      };
    }

    setConfig(config) {
      this._config = {
        title: 'Ogród · Dziennik',
        fertilizations: [],
        rain_entity: null,
        rain_threshold: 3,
        months_count: 2,
        log_slots: 50,
        show_watering: true,
        ...config,
      };
      this._rainLoaded = false; // re-fetch if config changes
    }

    set hass(hass) {
      const first = !this._hass;
      this._hass = hass;
      if (first || !this._rainLoaded) this._loadRain();
      this._render();
    }

    // ── Watering map from log_push input_text entities ────────────────────────

    _buildWateringMap() {
      const map = new Map(); // YYYY-MM-DD → liters (sum)
      if (!this._config.show_watering || !this._hass) return map;
      const slots = this._config.log_slots || 50;
      for (let i = 1; i <= slots; i++) {
        const raw = this._hass.states[`input_text.log_h${i}`]?.state ?? '';
        if (!raw || raw === 'unknown' || raw === 'unavailable' || !raw.startsWith('{')) continue;
        try {
          const e = JSON.parse(raw);
          if (e.typ !== 'nawodnienie_ogrod2' || !e.ts || typeof e.delta !== 'number') continue;
          const day = e.ts.slice(0, 10);
          map.set(day, (map.get(day) || 0) + e.delta);
        } catch (_) {}
      }
      return map;
    }

    disconnectedCallback() { _hideTip(); }

    // ── Rain history via HA REST ───────────────────────────────────────────────

    async _loadRain() {
      if (!this._config.rain_entity) { this._rainLoaded = true; return; }
      if (this._rainLoaded) return;
      this._rainLoaded = true;

      const monthsBack = (this._config.months_count || 2) + 1;
      const start = new Date();
      start.setMonth(start.getMonth() - monthsBack);
      start.setDate(1);
      // ISO without encodeURIComponent — colons in URL path are valid and HA requires them unencoded
      const startIso = start.getFullYear() + '-'
        + pad(start.getMonth() + 1) + '-'
        + pad(start.getDate()) + 'T00:00:00';

      try {
        const resp = await this._hass.callApi('GET',
          `history/period/${startIso}` +
          `?filter_entity_id=${this._config.rain_entity}` +
          `&minimal_response=true&significant_changes_only=false&no_attributes=true`
        );
        if (Array.isArray(resp) && Array.isArray(resp[0])) {
          this._processRain(resp[0]);
          this._render();
        }
      } catch (e) {
        console.warn('[garden-calendar] rain load failed:', e);
      }
    }

    _processRain(states) {
      // Sensor accumulates rain during the day, resets at midnight.
      // Strategy: max value per calendar day = daily total.
      // Exception: when value drops (midnight reset), the pre-drop value is the day's total
      // and the new day starts from 0 — so max-per-day handles this correctly.
      const byDay = new Map();
      for (const s of states) {
        const v = parseFloat(s.state);
        if (isNaN(v) || v < 0) continue;
        const dt = new Date(s.last_changed || s.last_updated);
        if (isNaN(dt.getTime())) continue;
        const key = toDateStr(dt);
        if (!byDay.has(key) || v > byDay.get(key)) byDay.set(key, v);
      }
      this._rainMap = byDay;
    }

    // Patch today's rain from live hass state (history can lag behind)
    _patchTodayRain() {
      if (!this._config.rain_entity || !this._hass) return;
      const state = this._hass.states[this._config.rain_entity];
      if (!state) return;
      const v = parseFloat(state.state);
      if (isNaN(v) || v < 0) return;
      const today = toDateStr(new Date());
      if (!this._rainMap.has(today) || v > this._rainMap.get(today)) {
        this._rainMap.set(today, v);
      }
    }

    // ── Fertilization state from localStorage ────────────────────────────────

    _doneMap() {
      // Map<actualDoneDate, [fertilization objects]>
      const m = new Map();
      try {
        for (const f of (this._config.fertilizations || [])) {
          const v = localStorage.getItem('aha-fertil-done:' + f.date);
          if (v && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
            if (!m.has(v)) m.set(v, []);
            m.get(v).push(f);
          }
        }
      } catch (_) {}
      return m;
    }

    _plannedMap() {
      // Map<scheduledDate, [fertilization objects]>
      const m = new Map();
      for (const f of (this._config.fertilizations || [])) {
        if (!m.has(f.date)) m.set(f.date, []);
        m.get(f.date).push(f);
      }
      return m;
    }

    // ── Watering prediction for next 10 days ─────────────────────────────────

    _buildWateringPredMap(wateringMap) {
      // Look at all available history (no cutoff — slots are limited anyway)
      const byDow = new Map(); // 0=Mon…6=Sun → [liters]
      for (const [dateStr, m3] of wateringMap) {
        const dow = (new Date(dateStr).getDay() + 6) % 7;
        if (!byDow.has(dow)) byDow.set(dow, []);
        byDow.get(dow).push(Math.round(m3 * 1000));
      }

      // Active day: ≥ 1 occurrence is enough (slots are limited, 1 entry per dow is valid signal)
      const activeDow = new Map(); // dow → avg liters (rounded)
      for (const [dow, amounts] of byDow) {
        activeDow.set(dow, Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length));
      }

      if (activeDow.size === 0) return new Map();

      // Project next 10 days (skip today, skip days with confirmed watering)
      const today   = new Date();
      const predMap = new Map();
      for (let i = 1; i <= 10; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const ds  = toDateStr(d);
        const dow = (d.getDay() + 6) % 7;
        if (activeDow.has(dow) && !wateringMap.has(ds)) {
          predMap.set(ds, activeDow.get(dow));
        }
      }
      return predMap;
    }

    // ── Month grid HTML ───────────────────────────────────────────────────────

    _monthHtml(year, month, doneMap, plannedMap, wateringMap, wateringPredMap) {
      const today    = toDateStr(new Date());
      const nDays    = new Date(year, month + 1, 0).getDate();
      const startDow = dowMon(new Date(year, month, 1));
      const thresh   = this._config.rain_threshold || 3;

      // Day headers
      let html = '<div class="mg">';
      for (const d of DAYS_PL) html += `<div class="dh">${d}</div>`;

      // Empty cells before day 1
      for (let i = 0; i < startDow; i++) html += '<div class="dc"></div>';

      for (let d = 1; d <= nDays; d++) {
        const ds = `${year}-${pad(month + 1)}-${pad(d)}`;
        const isToday   = ds === today;
        const doneFerts = doneMap.get(ds) || [];

        // Planned: only if NOT already done AND (future OR today)
        // Past unconfirmed plans are hidden — only completed ones appear via doneFerts
        const planned   = (plannedMap.get(ds) || []).filter(f => {
          try {
            if (localStorage.getItem('aha-fertil-done:' + f.date) !== null) return false; // already in doneFerts
            if (ds < today) return false; // past + unconfirmed = hide
            return true;
          } catch (_) { return ds >= today; }
        });

        const rainMm    = this._rainMap.get(ds) || 0;
        const hasRain   = rainMm >= thresh;
        const waterM3   = wateringMap.get(ds) || 0;
        const hasWater  = waterM3 > 0;
        const predL     = wateringPredMap.get(ds) || 0;
        const hasPred   = predL > 0 && !hasWater;
        const hasEvent  = doneFerts.length > 0 || planned.length > 0 || hasRain || hasWater || hasPred;

        // Build dots
        let dots = '';
        for (let i = 0; i < Math.min(doneFerts.length, 2); i++)
          dots += '<div class="dot dn"></div>';
        for (let i = 0; i < Math.min(planned.length, 2); i++)
          dots += '<div class="dot pl"></div>';
        if (hasRain) {
          const op = Math.min(0.95, 0.35 + (rainMm / 25) * 0.60).toFixed(2);
          dots += `<div class="dot rn" style="opacity:${op}"></div>`;
        }

        // Tooltip data (encoded in data attr, built on demand)
        const tipParts = [];
        if (doneFerts.length) tipParts.push('D:' + doneFerts.map(f => f.name + (f.description ? ' — ' + f.description : '')).join(';;'));
        if (planned.length)   tipParts.push('P:' + planned.map(f => f.name + (f.description ? ' — ' + f.description : '')).join(';;'));
        if (hasRain)          tipParts.push('R:' + rainMm.toFixed(1));
        if (hasWater)         tipParts.push('W:' + Math.round(waterM3 * 1000));
        if (hasPred)          tipParts.push('WP:' + predL);

        const isPast = ds < today;
        const cls = ['dc', isToday ? 'today' : '', isPast ? 'ps' : '', hasEvent ? 'ev' : '', hasWater ? 'wt' : '', hasPred ? 'wt-pred' : ''].filter(Boolean).join(' ');
        const tip = tipParts.length ? ` data-t="${tipParts.join('|').replace(/"/g, '&quot;')}"` : '';

        html += `<div class="${cls}"${tip}>`
          + `<span class="dn-num">${d}</span>`
          + `<div class="dots">${dots}</div>`
          + '</div>';
      }

      html += '</div>'; // .mg

      return `<div class="month">
        <div class="mhdr">${MONTHS_PL[month]} ${year}</div>
        ${html}
      </div>`;
    }

    // ── Tooltip HTML ─────────────────────────────────────────────────────────

    _tipHtml(encoded) {
      // Tooltip lives in light DOM — inline styles only, no shadow-DOM classes.
      const row = (icon, text) =>
        `<div style="display:flex;align-items:center;gap:7px;margin:3px 0;line-height:1.4">${icon}<span>${text}</span></div>`;

      const iconDone = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
        <circle cx="12" cy="12" r="9" fill="rgba(80,200,90,0.85)"/>
        <path d="M8 12.5l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
      const iconPlan = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
        <circle cx="12" cy="12" r="9" stroke="rgba(80,200,90,0.80)" stroke-width="2"/>
        <path d="M12 8v4l2.5 2.5" stroke="rgba(80,200,90,0.80)" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`;
      const iconRain = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
        <path d="M6 16a4 4 0 010-8 6 6 0 1112 0 4 4 0 010 8" stroke="rgba(77,168,255,0.90)" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M8 19v2M12 18v3M16 19v2" stroke="rgba(77,168,255,0.80)" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`;
      const iconWater = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
        <path d="M12 3C12 3 6 11 6 15a6 6 0 0012 0C18 11 12 3 12 3z" fill="rgba(48,176,255,0.85)"/>
        <path d="M10 16.5Q9.5 14.5 11 13.5" stroke="rgba(255,255,255,0.35)" stroke-width="1.2" stroke-linecap="round"/>
      </svg>`;
      const iconWaterPred = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
        <path d="M12 3C12 3 6 11 6 15a6 6 0 0012 0C18 11 12 3 12 3z" stroke="rgba(48,176,255,0.70)" stroke-width="1.8" stroke-linejoin="round" stroke-dasharray="3 2"/>
      </svg>`;

      let html = '';
      for (const part of encoded.split('|')) {
        if (part.startsWith('D:')) {
          for (const name of part.slice(2).split(';;'))
            html += row(iconDone, name);
        } else if (part.startsWith('P:')) {
          for (const name of part.slice(2).split(';;'))
            html += row(iconPlan, name);
        } else if (part.startsWith('R:')) {
          html += row(iconRain, `Deszcz: ${part.slice(2)} mm`);
        } else if (part.startsWith('WP:')) {
          html += row(iconWaterPred, `Szacowane podlanie: ~${part.slice(3)} L`);
        } else if (part.startsWith('W:')) {
          html += row(iconWater, `Podlano: ${part.slice(2)} L`);
        }
      }
      return html;
    }

    // ── Main render ───────────────────────────────────────────────────────────

    _render() {
      if (!this._hass) return;

      const now    = new Date();
      const count  = this._config.months_count || 2;
      const thresh = this._config.rain_threshold || 3;
      // Default window: current month is the last shown (so past is visible)
      const firstMonth = count - 1; // months before current

      this._patchTodayRain();
      const doneMap    = this._doneMap();
      const plannedMap = this._plannedMap();
      const wateringMap     = this._buildWateringMap();
      const wateringPredMap = this._buildWateringPredMap(wateringMap);

      let monthsHtml = '';
      for (let i = 0; i < count; i++) {
        const dt = new Date(now.getFullYear(), now.getMonth() - firstMonth + i + this._offset, 1);
        monthsHtml += this._monthHtml(dt.getFullYear(), dt.getMonth(), doneMap, plannedMap, wateringMap, wateringPredMap);
      }

      // Legend
      const hasDone    = doneMap.size > 0 || (this._config.fertilizations || []).some(f => {
        try { return localStorage.getItem('aha-fertil-done:' + f.date) !== null; } catch (_) { return false; }
      });
      const hasPlanned = (this._config.fertilizations || []).length > 0;
      const hasRain     = !!this._config.rain_entity;
      const hasWatLegend = this._config.show_watering;

      let legend = '';
      if (hasDone)      legend += `<div class="li"><div class="dot dn"></div><span>Nawożenie wykonane</span></div>`;
      if (hasPlanned)   legend += `<div class="li"><div class="dot pl"></div><span>Nawożenie planowane</span></div>`;
      if (hasRain)      legend += `<div class="li"><div class="dot rn" style="opacity:.80"></div><span>Deszcz (≥${thresh} mm)</span></div>`;
      if (hasWatLegend) legend += `<div class="li"><div class="li-wt"></div><span>Podlewanie</span></div>`;
      if (hasWatLegend) legend += `<div class="li"><div class="li-wt-pred"></div><span>Prognoza podlewania</span></div>`;

      this.shadowRoot.innerHTML = `
        <style>${this._css()}</style>
        <div class="card">
          <div class="hdr">
            <div class="title">${this._config.title}</div>
            <div class="navs">
              <button class="nb" id="prev">&#8249;</button>
              <button class="nb" id="next">&#8250;</button>
            </div>
          </div>
          <div class="months">${monthsHtml}</div>
          ${legend ? `<div class="legend">${legend}</div>` : ''}
        </div>`;

      this.shadowRoot.getElementById('prev').addEventListener('click', () => { this._offset--; this._render(); });
      this.shadowRoot.getElementById('next').addEventListener('click', () => { this._offset++; this._render(); });

      this._bindTooltips();
    }

    _bindTooltips() {
      this.shadowRoot.querySelectorAll('.dc.ev[data-t]').forEach(cell => {
        const encoded = cell.dataset.t;
        const html    = this._tipHtml(encoded);

        cell.addEventListener('mouseenter', () => _showTip(cell, html));
        cell.addEventListener('mouseleave', _hideTip);
        cell.addEventListener('click', () => {
          if (_tipEl) _hideTip();
          else _showTip(cell, html);
        });
      });

      // Hide tip when scrolling or clicking elsewhere
      this.shadowRoot.host.addEventListener('mouseleave', _hideTip, { once: false });
    }

    // ── CSS ───────────────────────────────────────────────────────────────────

    _css() {
      return `
      :host { display: block; font-family: -apple-system, system-ui, sans-serif; }
      .card {
        background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
        border-radius: 22px;
        border: 1px solid rgba(255,255,255,0.07);
        overflow: hidden;
      }
      /* Header */
      .hdr {
        display: flex; align-items: center; justify-content: space-between;
        padding: 13px 16px 10px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .title {
        font-size: 11px; font-weight: 600;
        color: rgba(255,255,255,0.35);
        text-transform: uppercase; letter-spacing: .08em;
      }
      .navs { display: flex; gap: 5px; }
      .nb {
        background: rgba(255,255,255,0.07); border: none;
        border-radius: 8px; width: 28px; height: 28px;
        cursor: pointer; color: rgba(255,255,255,0.50);
        font-size: 18px; line-height: 1; padding: 0;
        display: flex; align-items: center; justify-content: center;
        transition: background .12s;
      }
      .nb:active { background: rgba(255,255,255,0.15); }
      /* Months container — side by side */
      .months {
        padding: 8px 10px 4px;
        display: flex; gap: 8px; align-items: flex-start;
      }
      .month { flex: 1; min-width: 0; }
      .mhdr {
        font-size: 11px; font-weight: 600;
        color: rgba(255,255,255,0.50);
        margin-bottom: 5px; padding-left: 1px;
        letter-spacing: .01em;
      }
      /* Grid */
      .mg {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0;
      }
      .dh {
        font-size: 7.5px; font-weight: 600;
        color: rgba(255,255,255,0.20);
        text-align: center; padding-bottom: 4px;
        letter-spacing: .02em;
      }
      /* Day cell */
      .dc {
        display: flex; flex-direction: column; align-items: center;
        padding: 3px 0 2px;
        border-radius: 6px;
        min-height: 28px;
        cursor: default;
        transition: background .10s;
      }
      .dc.today {
        background: rgba(255,255,255,0.05);
        box-shadow: inset 0 0 0 1.5px rgba(255,255,255,0.40);
      }
      .dc.today .dn-num { color: #fff; font-weight: 700; }
      .dc.ps { opacity: 0.28; }
      .dc.ps.ev { opacity: 0.38; }
      .dc.ev { cursor: pointer; }
      .dc.ev:hover, .dc.ev:active { background: rgba(255,255,255,0.08); }
      .dc.wt {
        outline: 1.5px solid rgba(48,176,255,0.55);
        outline-offset: -1px;
      }
      .dc.wt-pred {
        outline: 1.5px dashed rgba(48,176,255,0.38);
        outline-offset: -1px;
      }
      .dn-num {
        font-size: 10px; font-weight: 500;
        color: rgba(255,255,255,0.55);
        line-height: 1;
        user-select: none;
      }
      /* Vertical divider between months */
      .month + .month {
        border-left: 1px solid rgba(255,255,255,0.06);
        padding-left: 8px;
      }
      /* Dots row */
      .dots {
        display: flex; gap: 2px; margin-top: 2px;
        flex-wrap: wrap; justify-content: center;
      }
      .dot {
        width: 4px; height: 4px; border-radius: 50%;
        flex-shrink: 0;
      }
      .dot.dn { background: #50C85A; }
      .dot.pl {
        background: transparent;
        border: 1.5px solid rgba(80,200,90,0.65);
        width: 3px; height: 3px;
      }
      .dot.rn { background: #4da8ff; }
      /* Legend watering indicators */
      .li-wt {
        width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0;
        outline: 1.5px solid rgba(48,176,255,0.55);
        outline-offset: -1px;
      }
      .li-wt-pred {
        width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0;
        outline: 1.5px dashed rgba(48,176,255,0.38);
        outline-offset: -1px;
      }
      /* Legend */
      .legend {
        display: flex; flex-wrap: wrap; gap: 8px;
        padding: 6px 12px 12px;
        border-top: 1px solid rgba(255,255,255,0.05);
      }
      .li { display: flex; align-items: center; gap: 4px; }
      .li span { font-size: 9.5px; color: rgba(255,255,255,0.25); }
      /* Tooltip (light DOM, styled inline) */
      .tr { display: flex; align-items: center; gap: 6px; }
      .td { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
      .td.dn { background: #50C85A; }
      .td.pl { background: transparent; border: 1.5px solid rgba(80,200,90,0.80); width: 5px; height: 5px; }
      .td.rn { background: #4da8ff; }
      .td.wt { background: transparent; outline: 1.5px solid rgba(48,176,255,0.70); outline-offset: -1px; border-radius: 2px; }
      `;
    }

    getCardSize() { return 5; }
  }

  // ── Register ───────────────────────────────────────────────────────────────

  if (!customElements.get('aha-garden-calendar-card')) {
    customElements.define('aha-garden-calendar-card', GardenCalendarCard);
  }
  if (!customElements.get('garden-calendar-card')) {
    customElements.define('garden-calendar-card', class extends GardenCalendarCard {});
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.find(c => c.type === 'aha-garden-calendar-card')) {
    window.customCards.push({
      type: 'aha-garden-calendar-card',
      name: 'AHA Garden Calendar Card',
      description: 'Garden diary: fertilization tracking + rain history, 3 months',
    });
  }
})();
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
// weather-card.js  v1.0
// Karta pogodowa — konwersja current_weather.yaml do natywnego JS custom element.
//
// Config:
//   entity:           (required) weather.*
//   temp_entity:      sensor.*
//   feels_entity:     sensor.*
//   humidity_entity:  sensor.*
//   pressure_entity:  sensor.*
//   wind_entity:      sensor.*
//   gust_entity:      sensor.*
//   wind_dir_entity:  sensor.*
//   rain_rate_entity: sensor.*
//   rain_day_entity:  sensor.*
//   uv_entity:        sensor.*
//   battery_entity:   sensor.*
//   forecast_entity:  sensor.*  (attributes.forecast = hourly JSON)
//   station_label:    string    (default 'Ogród · Stacja główna')
//   fertilizations:   [{date:'YYYY-MM-DD', name:'...', description:'...'}]
//
// Rejestracja: aha-weather-card (alias: weather-card)

// ── helpers ──────────────────────────────────────────────────────────────────

function _wcPad(n) { return String(n).padStart(2, '0'); }

function _wcRand(seed) {
  // Simple seeded LCG for stable particles across renders
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 4294967296);
  };
}

function _daysUntil(dateStr) {
  const target = new Date(dateStr); target.setHours(0,0,0,0);
  const today  = new Date();        today.setHours(0,0,0,0);
  return Math.round((target - today) / 86400000);
}

function _degToCompass(raw) {
  const n = parseFloat(raw); if (isNaN(n)) return '—';
  return ['N','NE','E','SE','S','SW','W','NW'][Math.round(n/45)%8];
}
const _WIND_PL = {N:'Płn',NE:'Płn-Wsch',E:'Wsch',SE:'Płd-Wsch',S:'Płd',SW:'Płd-Zach',W:'Zach',NW:'Płn-Zach'};

// ── moon ─────────────────────────────────────────────────────────────────────

function _getMoonPhase() {
  const ref   = new Date('2000-01-06T18:14:00Z').getTime();
  const cycle = 29.53059 * 86400000;
  const p     = ((Date.now() - ref) % cycle) / cycle;
  return p < 0 ? p + 1 : p;
}

function _moonSVG(phase) {
  const p = ((phase % 1) + 1) % 1;
  const cx=44,cy=44,r=22,ty=cy-r,by=cy+r;
  if (p < 0.03 || p > 0.97)
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0D1426"/>
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#2A3A5A" stroke-width="1"/>`;
  if (p > 0.47 && p < 0.53)
    return `<circle cx="${cx}" cy="${cy}" r="${r+5}" fill="#C8D8F0" opacity=".10"/>
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="#C8D8F0"/>
            <circle cx="${cx}" cy="${cy}" r="${(r*0.74).toFixed(0)}" fill="#DDE8F8"/>`;
  const waxing = p < 0.5;
  const hp = waxing ? p*2 : (p-0.5)*2;
  const ex = Math.cos(hp*Math.PI)*r, aex=Math.abs(ex).toFixed(2), ts=ex>0?0:1;
  let d;
  if (waxing) {
    d = Math.abs(ex)<0.5
      ? `M ${cx} ${ty} A ${r} ${r} 0 0 1 ${cx} ${by} L ${cx} ${ty} Z`
      : `M ${cx} ${ty} A ${r} ${r} 0 0 1 ${cx} ${by} A ${aex} ${r} 0 0 ${ts} ${cx} ${ty} Z`;
  } else {
    d = Math.abs(ex)<0.5
      ? `M ${cx} ${ty} A ${r} ${r} 0 0 0 ${cx} ${by} L ${cx} ${ty} Z`
      : `M ${cx} ${ty} A ${r} ${r} 0 0 0 ${cx} ${by} A ${aex} ${r} 0 0 ${ts} ${cx} ${ty} Z`;
  }
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0D1426"/><path d="${d}" fill="#C8D8F0"/>`;
}

// ── weather logic ─────────────────────────────────────────────────────────────

function _tempDayBg(t) {
  if (t===null) return '#181818';
  if (t>=40) return '#2E0505'; if (t>=35) return '#280808'; if (t>=30) return '#231205';
  if (t>=25) return '#1E1808'; if (t>=20) return '#171A12'; if (t>=15) return '#131618';
  if (t>=8)  return '#101418'; if (t>=0)  return '#0C1A2A'; return '#0A1425';
}

function _tempAccent(t) {
  if (t===null) return '#888';
  if (t>=40) return '#FF2020'; if (t>=35) return '#FF3B30'; if (t>=30) return '#FF6820';
  if (t>=25) return '#FF9F0A'; if (t>=20) return '#FFD60A'; if (t>=15) return '#34C759';
  if (t>=8)  return '#30D158'; if (t>=0)  return '#5AC8FA'; if (t>=-8) return '#4DA6FF';
  if (t>=-18) return '#748FFF'; return '#BF5AF2';
}

function _tempColor(t) {
  if (t===null) return '#fff';
  if (t>=35) return '#FFB3AA'; if (t>=28) return '#FFD4A0'; if (t>=20) return '#FFF0C0';
  if (t>=8)  return '#FFFFFF'; if (t>=0)  return '#C8E8FF'; if (t>=-8) return '#A8D4FF';
  return '#C8AAFF';
}

function _getDayPhase(sunElev, sunAz) {
  if (sunElev < -6)   return 'night';
  if (sunElev < -0.5) return sunAz < 180 ? 'astro-dawn' : 'astro-dusk';
  if (sunElev < 6)    return sunAz < 180 ? 'dawn'        : 'dusk';
  if (sunElev < 18)   return sunAz < 180 ? 'morning'     : 'golden';
  return 'day';
}

function _resolveType(haState, dayPhase, temp, rainRateNum, gustNum) {
  const isNight  = ['night','astro-dawn','astro-dusk'].includes(dayPhase);
  const isDawn   = ['dawn','astro-dawn','morning'].includes(dayPhase);
  const isGolden = dayPhase === 'golden';
  const isDusk   = ['dusk','astro-dusk'].includes(dayPhase);
  const isDay    = dayPhase === 'day';
  const isRaining = ['rainy','pouring'].includes(haState) || rainRateNum > 0.3;
  const isSunny   = ['sunny','clear-night'].includes(haState);
  const isCloudy  = ['cloudy','partlycloudy'].includes(haState);
  const isBlizzard     = ['snowy','snowy-rainy'].includes(haState) && gustNum >= 35;
  const isFreezingRain = isRaining && temp !== null && temp <= 1;
  const isExtremeHeat  = temp !== null && temp >= 38;
  const isAurora       = isNight && temp !== null && temp <= -5 && isSunny;

  if (isBlizzard)  return 'blizzard';
  if (['hail'].includes(haState)) return 'hail';
  if (['lightning','lightning-rainy','exceptional'].includes(haState)) {
    if (isDawn)   return 'storm-dawn';
    if (isGolden||isDusk) return 'storm-golden';
    return isNight ? 'storm-night' : 'storm';
  }
  if (isFreezingRain) return 'freezing-rain';
  if (isExtremeHeat && isDay) return 'extreme-heat';
  if (isAurora) return 'aurora';
  if (isRaining) {
    if (isDawn)   return 'rain-dawn';
    if (isGolden) return 'rain-golden';
    if (isDusk)   return 'rain-dusk';
    if (isNight)  return 'rain-night';
    return 'rain';
  }
  if (['snowy','snowy-rainy'].includes(haState)) return isNight ? 'snow-night' : 'snow';
  if (['fog'].includes(haState)) return isNight ? 'fog-night' : 'fog';
  if (['windy','windy-variant'].includes(haState) || gustNum >= 50) return isNight ? 'windy-night' : 'windy';
  if (isSunny) {
    if (dayPhase==='astro-dawn') return 'night-clear';
    if (dayPhase==='dawn')       return 'dawn-clear';
    if (dayPhase==='morning')    return 'morning-clear';
    if (dayPhase==='golden')     return 'golden-clear';
    if (dayPhase==='dusk')       return 'dusk-clear';
    if (dayPhase==='astro-dusk') return 'astro-dusk-clear';
    if (isNight)                 return 'night-clear';
    return 'sun';
  }
  if (isCloudy || haState==='partlycloudy') {
    if (isDawn || dayPhase==='astro-dawn') return 'cloud-dawn';
    if (isGolden)                          return 'cloud-golden';
    if (isDusk || dayPhase==='astro-dusk') return 'cloud-dusk';
    if (isNight)                           return 'cloud-night';
    return haState==='partlycloudy' ? 'partlycloudy' : 'cloud';
  }
  return isNight ? 'cloud-night' : 'cloud';
}

// ── SVG icons ─────────────────────────────────────────────────────────────────

function _sunSVG(rays, coreR, glowR, rayLen, col) {
  col = col || '#F5A623';
  const cx=44, cy=44;
  const rl = rays.map(deg => {
    const r2 = deg*Math.PI/180;
    const x1=(cx+Math.cos(r2)*(coreR+3)).toFixed(1), y1=(cy+Math.sin(r2)*(coreR+3)).toFixed(1);
    const x2=(cx+Math.cos(r2)*(coreR+3+rayLen)).toFixed(1), y2=(cy+Math.sin(r2)*(coreR+3+rayLen)).toFixed(1);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="2.5" stroke-linecap="round"/>`;
  }).join('');
  const lc = col==='#F5A623' ? '#FFD060' : '#FFE0A0';
  return `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
    ${glowR ? `<circle cx="44" cy="44" r="${glowR}" fill="${col}" opacity=".12"/>` : ''}
    ${rl}<circle cx="44" cy="44" r="${coreR}" fill="${col}"/>
    <circle cx="44" cy="44" r="${(coreR*0.72).toFixed(0)}" fill="${lc}"/></svg>`;
}

function _cloudSVG(col1, col2) {
  const oc1=col1||'#4A5068', oc2=col2||oc1;
  return `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
    <circle cx="26" cy="52" r="14" fill="${oc1}"/><circle cx="44" cy="44" r="18" fill="${oc1}"/>
    <circle cx="62" cy="52" r="12" fill="${oc2}"/><rect x="12" y="52" width="62" height="16" fill="${oc2}"/>
    <rect x="12" y="62" width="62" height="6" rx="3" fill="${oc2}"/></svg>`;
}

function _rainCloudSVG(cloudCol, dropCol) {
  cloudCol = cloudCol||'#3A7EC4'; dropCol = dropCol||'#5AC8FA';
  return `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
    <circle cx="28" cy="38" r="14" fill="${cloudCol}"/><circle cx="46" cy="30" r="18" fill="${cloudCol}"/>
    <circle cx="62" cy="38" r="12" fill="${cloudCol}"/><rect x="14" y="38" width="60" height="14" fill="${cloudCol}"/>
    <rect x="14" y="46" width="60" height="6" rx="3" fill="${cloudCol}"/>
    <line x1="26" y1="56" x2="23" y2="67" stroke="${dropCol}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="38" y1="54" x2="35" y2="65" stroke="${dropCol}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="50" y1="56" x2="47" y2="67" stroke="${dropCol}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="62" y1="54" x2="59" y2="65" stroke="${dropCol}" stroke-width="2.5" stroke-linecap="round"/></svg>`;
}

function _sunCloudSVG(sunCol) {
  sunCol = sunCol||'#F5A623';
  return `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
    <circle cx="30" cy="32" r="14" fill="${sunCol}" opacity=".9"/>
    <line x1="30" y1="13" x2="30" y2="17" stroke="${sunCol}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="42" y1="17" x2="40" y2="20" stroke="${sunCol}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="48" y1="28" x2="44" y2="29" stroke="${sunCol}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="18" y1="17" x2="20" y2="20" stroke="${sunCol}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="12" y1="32" x2="16" y2="32" stroke="${sunCol}" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="38" cy="55" r="12" fill="#4A5068"/><circle cx="53" cy="49" r="14" fill="#4A5068"/>
    <circle cx="66" cy="55" r="10" fill="#4A5068"/><rect x="26" y="55" width="51" height="12" fill="#4A5068"/>
    <rect x="26" y="62" width="51" height="5" rx="3" fill="#4A5068"/></svg>`;
}

function _stormSVG(cloudCol, boltCol) {
  return `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
    <circle cx="28" cy="34" r="14" fill="${cloudCol}"/><circle cx="46" cy="26" r="18" fill="${cloudCol}"/>
    <circle cx="62" cy="34" r="12" fill="${cloudCol}"/><rect x="14" y="34" width="60" height="14" fill="${cloudCol}"/>
    <rect x="14" y="44" width="60" height="6" rx="3" fill="${cloudCol}"/>
    <polygon points="50,52 41,70 49,70 43,86 59,62 51,62 57,52" fill="${boltCol}"/></svg>`;
}

function _snowSVG(crystals, col) {
  col = col||'#55C0E8';
  const cx=44, cy=44, arm=32, br=11;
  const arms = [0,45,90,135,180,225,270,315].map(deg => {
    const r=deg*Math.PI/180;
    const ex=(cx+Math.cos(r)*arm).toFixed(1), ey=(cy+Math.sin(r)*arm).toFixed(1);
    const mx=(cx+Math.cos(r)*(arm*0.6)).toFixed(1), my=(cy+Math.sin(r)*(arm*0.6)).toFixed(1);
    const p=r+Math.PI/2;
    const br2=crystals
      ? `<line x1="${mx}" y1="${my}" x2="${(parseFloat(mx)+Math.cos(p)*br).toFixed(1)}" y2="${(parseFloat(my)+Math.sin(p)*br).toFixed(1)}" stroke="${col}" stroke-width="1.5" stroke-linecap="round"/>
         <line x1="${mx}" y1="${my}" x2="${(parseFloat(mx)-Math.cos(p)*br).toFixed(1)}" y2="${(parseFloat(my)-Math.sin(p)*br).toFixed(1)}" stroke="${col}" stroke-width="1.5" stroke-linecap="round"/>` : '';
    const dot = crystals ? `<circle cx="${ex}" cy="${ey}" r="2.5" fill="${col}"/>` : '';
    return `<line x1="44" y1="44" x2="${ex}" y2="${ey}" stroke="${col}" stroke-width="${crystals?2.5:2}" stroke-linecap="round"/>${br2}${dot}`;
  }).join('');
  return `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
    ${crystals?`<circle cx="44" cy="44" r="40" fill="${col}" opacity=".07"/>`:''}
    ${arms}<circle cx="44" cy="44" r="${crystals?5:4}" fill="#0A1430" stroke="${col}" stroke-width="2.5"/></svg>`;
}

// ── fertilization banner icon ─────────────────────────────────────────────────

function _fertilIconSVG(size, acR, acG, acB) {
  const ac = `rgba(${acR},${acG},${acB},1)`;
  const acL = `rgba(${acR},${acG},${acB},0.55)`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
    <path d="M${size*.50} ${size*.82} C${size*.50} ${size*.82} ${size*.50} ${size*.45} ${size*.50} ${size*.35}"
      stroke="${ac}" stroke-width="${size*.09}" stroke-linecap="round"/>
    <path d="M${size*.50} ${size*.50} C${size*.30} ${size*.30} ${size*.15} ${size*.38} ${size*.20} ${size*.55}"
      stroke="${acL}" stroke-width="${size*.07}" stroke-linecap="round" fill="none"/>
    <path d="M${size*.50} ${size*.42} C${size*.70} ${size*.22} ${size*.85} ${size*.30} ${size*.80} ${size*.48}"
      stroke="${ac}" stroke-width="${size*.08}" stroke-linecap="round" fill="none"/>
    <circle cx="${size*.50}" cy="${size*.28}" r="${size*.13}" fill="${ac}" opacity=".85"/>
  </svg>`;
}

// ── THE CARD ──────────────────────────────────────────────────────────────────

class AhaWeatherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass          = null;
    this._config        = {};
    this._tickInterval  = null;
    this._particles     = null; // cached particle strings
    this._lastType      = null;
  }

  setConfig(config) {
    if (!config.entity) throw new Error('weather-card: wymagane pole "entity"');
    this._config = config;
    this._fertilizations = Array.isArray(config.fertilizations) ? config.fertilizations : [];
    this._particles = null; // reset cache when config changes
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._tickInterval) {
      this._render();
      this._tickInterval = setInterval(() => this._render(), 60000);
    } else {
      this._render();
    }
  }

  disconnectedCallback() {
    if (this._tickInterval) { clearInterval(this._tickInterval); this._tickInterval = null; }
  }

  // ── compute weather state ───────────────────────────────────────────────────
  _compute() {
    const hass   = this._hass;
    const cfg    = this._config;
    const states = hass?.states || {};
    const g   = id => id ? (states[id]?.state ?? '—') : '—';
    const gfn = id => { const v=parseFloat(g(id)); return isNaN(v)?null:v; };
    const gf  = (id,dec=1) => { const v=gfn(id); return v===null?'—':v.toFixed(dec); };

    const haState    = states[cfg.entity]?.state || 'unknown';
    const sunAttr    = states['sun.sun']?.attributes ?? {};
    const sunElev    = parseFloat(sunAttr.elevation ?? 999);
    const sunAz      = parseFloat(sunAttr.azimuth ?? 180);
    const dayPhase   = _getDayPhase(sunElev, sunAz);
    const isNight    = ['night','astro-dawn','astro-dusk'].includes(dayPhase);
    const isGolden   = dayPhase === 'golden';
    const isDusk     = ['dusk','astro-dusk'].includes(dayPhase);
    const isDawn     = ['dawn','astro-dawn','morning'].includes(dayPhase);

    const temp       = gfn(cfg.temp_entity);
    const tempStr    = temp!==null ? temp.toFixed(1) : '—';
    const feels      = gf(cfg.feels_entity);
    const feelsNum   = gfn(cfg.feels_entity);
    const humOut     = g(cfg.humidity_entity);
    const pres       = gf(cfg.pressure_entity, 0);
    const wind       = gf(cfg.wind_entity, 1);
    const windNum    = parseFloat(wind)||0;
    const gust       = gf(cfg.gust_entity, 1);
    const gustNum    = parseFloat(gust)||0;
    const windDeg    = g(cfg.wind_dir_entity);
    const windDir    = _degToCompass(windDeg);
    const windDirPl  = _WIND_PL[windDir]||windDir;
    const rainRate   = gf(cfg.rain_rate_entity, 1);
    const rainRateNum= parseFloat(rainRate)||0;
    const rainDay    = gf(cfg.rain_day_entity, 1);
    const uv         = g(cfg.uv_entity);
    const uvNum      = parseFloat(uv)||0;
    const batV       = gf(cfg.battery_entity, 2);

    // temperature trend
    let trendStr='', trendCol='rgba(255,255,255,0.28)';
    try {
      const fcAttr = states[cfg.forecast_entity]?.attributes?.forecast;
      const fc = typeof fcAttr==='string' ? JSON.parse(fcAttr) : fcAttr;
      if (Array.isArray(fc) && fc.length>=2 && temp!==null) {
        const next  = parseFloat(fc[1]?.temperature ?? fc[1]?.temperature_high);
        const delta = next - temp;
        if (!isNaN(delta)) {
          if (Math.abs(delta)<0.4)  { trendStr='→ stała'; trendCol='rgba(255,255,255,0.25)'; }
          else if (delta>0) { trendStr=`↑ +${delta.toFixed(1)}° za godz.`; trendCol=delta>3?'#FF9F0A':'#FFD060'; }
          else              { trendStr=`↓ ${delta.toFixed(1)}° za godz.`; trendCol=delta<-3?'#5AC8FA':'#A0CCFF'; }
        }
      }
    } catch(e){}

    const rainClass = rainRateNum<0.5?'drizzle':rainRateNum<2.5?'light':rainRateNum<7.5?'moderate':rainRateNum<50?'heavy':'violent';
    const type      = _resolveType(haState, dayPhase, temp, rainRateNum, gustNum);

    // temperature color
    let tColor;
    if (['dawn-clear','cloud-dawn','rain-dawn','storm-dawn'].includes(type))      tColor='#FFD09A';
    else if (['golden-clear','cloud-golden','rain-golden','storm-golden'].includes(type)) tColor='#FFC070';
    else if (['dusk-clear','astro-dusk-clear','cloud-dusk','rain-dusk'].includes(type))   tColor='#C8D0FF';
    else if (isNight) tColor='#C8D8F0';
    else              tColor=_tempColor(temp);

    const moonPhase = _getMoonPhase();
    const ms        = _moonSVG(moonPhase);

    return {
      haState, dayPhase, isNight, isGolden, isDusk, isDawn,
      temp, tempStr, feels, feelsNum, humOut, pres,
      wind, windNum, gust, gustNum, windDeg, windDir, windDirPl,
      rainRate, rainRateNum, rainDay, rainClass,
      uv, uvNum, batV, trendStr, trendCol, type, tColor,
      moonPhase, ms,
    };
  }

  // ── icon map ────────────────────────────────────────────────────────────────
  _buildIcon(type, temp, ms) {
    const R8=[0,45,90,135,180,225,270,315];
    const R12=[0,30,60,90,120,150,180,210,240,270,300,330];
    const ICON_MAP = {
      'sun':             temp!==null&&temp>=35 ? _sunSVG(R12,20,28,10) : _sunSVG(R8,14,0,8),
      'extreme-heat':    _sunSVG(R12,22,32,12,'#FF6030'),
      'dawn-clear':      _sunSVG([60,90,120],10,14,7,'#FF9040'),
      'morning-clear':   _sunSVG(R8,12,18,7,'#F5C060'),
      'golden-clear':    _sunSVG([200,240,280,320],10,16,8,'#FF7020'),
      'dusk-clear':      `<svg viewBox="0 0 88 88" fill="none" width="48" height="48"><circle cx="44" cy="70" r="22" fill="#3050A8" opacity=".25"/><circle cx="44" cy="70" r="14" fill="#4060C0" opacity=".4"/>${ms}</svg>`,
      'astro-dusk-clear':`<svg viewBox="0 0 88 88" fill="none" width="48" height="48">${ms}</svg>`,
      'night-clear':     `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">${ms}</svg>`,
      'partlycloudy':    _sunCloudSVG('#F5A623'),
      'cloud':           _cloudSVG('#4A5068','#4A5068'),
      'cloud-dawn':      _cloudSVG('#7A6050','#604030'),
      'cloud-golden':    _cloudSVG('#785040','#604030'),
      'cloud-dusk':      _cloudSVG('#3A4068','#2A3058'),
      'cloud-night':     _cloudSVG('#2A3040','#2A3040'),
      'rain':            _rainCloudSVG('#3A7EC4','#5AC8FA'),
      'rain-dawn':       _rainCloudSVG('#5A5A80','#A0B8E0'),
      'rain-golden':     _rainCloudSVG('#6A5040','#C0A070'),
      'rain-dusk':       _rainCloudSVG('#3A4080','#7090D0'),
      'rain-night':      _rainCloudSVG('#253045','#4870A0'),
      'snow':            temp!==null&&temp<=-10 ? _snowSVG(true) : _snowSVG(false),
      'snow-night':      _snowSVG(false,'#8899CC'),
      'blizzard':        _snowSVG(true,'#AEE4F8'),
      'freezing-rain':   `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
        <circle cx="26" cy="36" r="13" fill="#3A6A9A"/><circle cx="44" cy="28" r="17" fill="#3A6A9A"/>
        <circle cx="60" cy="36" r="11" fill="#3A6A9A"/><rect x="13" y="36" width="59" height="13" fill="#3A6A9A"/>
        <rect x="13" y="44" width="59" height="5" rx="3" fill="#3A6A9A"/>
        <line x1="28" y1="54" x2="22" y2="68" stroke="#A0D8FF" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="40" y1="52" x2="34" y2="66" stroke="#A0D8FF" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="52" y1="54" x2="46" y2="68" stroke="#A0D8FF" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="22" cy="70" r="3" fill="none" stroke="#A0D8FF" stroke-width="1.5"/>
        <circle cx="34" cy="68" r="3" fill="none" stroke="#A0D8FF" stroke-width="1.5"/>
        <circle cx="46" cy="70" r="3" fill="none" stroke="#A0D8FF" stroke-width="1.5"/></svg>`,
      'storm':           _stormSVG('#282E3A','#FFD060'),
      'storm-dawn':      _stormSVG('#2A2830','#FFA040'),
      'storm-golden':    _stormSVG('#28221A','#FF8030'),
      'storm-night':     _stormSVG('#1A1E28','#C0D0FF'),
      'hail':            `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
        <circle cx="26" cy="36" r="13" fill="#3A5080"/><circle cx="44" cy="28" r="17" fill="#3A5080"/>
        <circle cx="60" cy="36" r="11" fill="#3A5080"/><rect x="13" y="36" width="59" height="13" fill="#3A5080"/>
        <rect x="13" y="44" width="59" height="5" rx="3" fill="#3A5080"/>
        <circle cx="26" cy="58" r="4" fill="#A8D8F0"/><circle cx="42" cy="62" r="4" fill="#A8D8F0"/>
        <circle cx="58" cy="57" r="4" fill="#A8D8F0"/><circle cx="34" cy="70" r="3.5" fill="#A8D8F0"/>
        <circle cx="50" cy="72" r="3.5" fill="#A8D8F0"/></svg>`,
      'fog':             `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
        <line x1="12" y1="26" x2="76" y2="26" stroke="#8899BB" stroke-width="4" stroke-linecap="round" opacity=".6"/>
        <line x1="20" y1="38" x2="72" y2="38" stroke="#8899BB" stroke-width="4" stroke-linecap="round" opacity=".5"/>
        <line x1="12" y1="50" x2="76" y2="50" stroke="#8899BB" stroke-width="4" stroke-linecap="round" opacity=".6"/>
        <line x1="20" y1="62" x2="72" y2="62" stroke="#8899BB" stroke-width="4" stroke-linecap="round" opacity=".4"/>
        <line x1="12" y1="74" x2="58" y2="74" stroke="#8899BB" stroke-width="4" stroke-linecap="round" opacity=".25"/></svg>`,
      'fog-night':       `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
        <line x1="12" y1="26" x2="76" y2="26" stroke="#5566AA" stroke-width="4" stroke-linecap="round" opacity=".5"/>
        <line x1="20" y1="38" x2="72" y2="38" stroke="#5566AA" stroke-width="4" stroke-linecap="round" opacity=".4"/>
        <line x1="12" y1="50" x2="76" y2="50" stroke="#5566AA" stroke-width="4" stroke-linecap="round" opacity=".5"/>
        <line x1="20" y1="62" x2="72" y2="62" stroke="#5566AA" stroke-width="4" stroke-linecap="round" opacity=".3"/>
        <g opacity=".5">${ms}</g></svg>`,
      'windy':           `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
        <path d="M12 26 Q28 18 48 26 Q66 34 72 26" stroke="#7BAED4" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M12 40 Q33 32 58 40 Q70 44 76 38" stroke="#7BAED4" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M12 54 Q26 48 50 54 Q62 58 66 54" stroke="#7BAED4" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M12 66 Q22 62 42 66" stroke="#7BAED4" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
      'windy-night':     `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
        <path d="M12 26 Q28 18 48 26 Q66 34 72 26" stroke="#4466AA" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M12 40 Q33 32 58 40 Q70 44 76 38" stroke="#4466AA" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M12 54 Q26 48 50 54 Q62 58 66 54" stroke="#4466AA" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <g opacity=".6">${ms}</g></svg>`,
      'aurora':          `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
        <ellipse cx="44" cy="38" rx="36" ry="10" fill="rgba(0,200,100,0.30)"/>
        <ellipse cx="44" cy="48" rx="28" ry="8"  fill="rgba(0,160,200,0.22)"/>
        <ellipse cx="44" cy="56" rx="20" ry="6"  fill="rgba(100,0,220,0.18)"/>
        <circle cx="18" cy="18" r="1.5" fill="#C8D8F0" opacity=".7"/>
        <circle cx="32" cy="10" r="1"   fill="#C8D8F0" opacity=".6"/>
        <circle cx="56" cy="14" r="1.2" fill="#C8D8F0" opacity=".8"/>
        <circle cx="70" cy="22" r="1"   fill="#C8D8F0" opacity=".5"/>
        <circle cx="62" cy="8"  r="1.5" fill="#C8D8F0" opacity=".7"/>
        <circle cx="78" cy="35" r="1"   fill="#C8D8F0" opacity=".4"/></svg>`,
    };
    return ICON_MAP[type] ?? _cloudSVG();
  }

  // ── animated icon wrapper ───────────────────────────────────────────────────
  _buildAnimatedIcon(type, temp, ms) {
    const iconHtml = this._buildIcon(type, temp, ms);
    const R8=[0,45,90,135,180,225,270,315];
    function sunburstRays(count, col, duration, length) {
      const rays = [];
      for (let i=0; i<count; i++) {
        const angle = (360/count)*i;
        rays.push(`<div style="position:absolute;top:50%;left:50%;width:2.5px;height:${length};
          background:linear-gradient(to bottom,${col}95,${col}00);
          transform:translate(-50%,-100%) rotate(${angle}deg);transform-origin:center 100%;"></div>`);
      }
      return `<div style="position:absolute;width:48px;height:48px;
        animation:wc-sun-rays ${duration} linear infinite;">${rays.join('')}</div>`;
    }
    if (['sun','extreme-heat'].includes(type)) {
      const rayCount=temp!==null&&temp>=35?12:10, rayCol=temp!==null&&temp>=38?'#FF6030':'#FFD060';
      const duration=temp!==null&&temp>=38?'35s':'50s', rayLength=temp!==null&&temp>=35?'20px':'26px';
      const iconFilter=type==='extreme-heat'?'filter:drop-shadow(0 0 16px rgba(255,80,0,0.85));':'';
      return `<div style="position:relative;width:48px;height:48px;">
        ${sunburstRays(rayCount,rayCol,duration,rayLength)}
        <div style="position:absolute;inset:0;${iconFilter}animation:wc-breathe 4s ease-in-out infinite;transform:scale(1.05);">${iconHtml}</div>
      </div>`;
    }
    if (['dawn-clear','morning-clear','golden-clear'].includes(type)) {
      const rayCol=type==='golden-clear'?'#FF7020':'#FF9040';
      return `<div style="position:relative;width:48px;height:48px;">
        ${sunburstRays(6,rayCol,'80s','22px')}
        <div style="position:absolute;inset:0;animation:wc-breathe 5s ease-in-out infinite;">${iconHtml}</div>
      </div>`;
    }
    if (['night-clear','astro-dusk-clear','dusk-clear'].includes(type)) {
      return `<div style="animation:wc-breathe 5s ease-in-out infinite;">${iconHtml}</div>`;
    }
    return iconHtml;
  }

  // ── pill (context badge) ────────────────────────────────────────────────────
  _buildPill(type, rainClass, gustNum, uvNum, temp, moonPhase, isNight) {
    const mk = (text,bg,border,color) => ({text,bg,border,color});
    const mp = ((moonPhase%1)+1)%1;
    const getMoonPill = () => {
      if(mp<0.03||mp>0.97) return mk('🌑 Nów',          'rgba(60,80,140,0.22)','rgba(120,140,200,0.30)','#8899BB');
      if(mp<0.22)          return mk('🌒 Sierp rośnie', 'rgba(130,160,210,0.18)','rgba(190,210,240,0.25)','#C8D8F0');
      if(mp<0.28)          return mk('🌓 I kwadra',     'rgba(130,160,210,0.18)','rgba(190,210,240,0.25)','#C8D8F0');
      if(mp<0.47)          return mk('🌔 Garb rośnie',  'rgba(160,190,235,0.20)','rgba(190,210,240,0.28)','#C8D8F0');
      if(mp<0.53)          return mk('🌕 Pełnia',       'rgba(190,215,255,0.22)','rgba(215,228,248,0.35)','#DDE8F8');
      if(mp<0.72)          return mk('🌖 Garb maleje',  'rgba(130,160,210,0.18)','rgba(190,210,240,0.25)','#C8D8F0');
      if(mp<0.78)          return mk('🌗 III kwadra',   'rgba(130,160,210,0.18)','rgba(190,210,240,0.25)','#C8D8F0');
      return                      mk('🌘 Sierp maleje', 'rgba(60,80,140,0.22)', 'rgba(120,140,200,0.30)','#8899BB');
    };
    if(type==='aurora')        return mk('✦ Zorza polarna', 'rgba(0,180,100,0.20)','rgba(0,230,140,0.30)','#00E890');
    if(type==='blizzard')      return mk('❄ Zamieć',       'rgba(80,130,220,0.20)','rgba(174,228,248,0.32)','#AEE4F8');
    if(type==='freezing-rain') return mk('🌧 Szadź',        'rgba(50,110,200,0.20)','rgba(100,190,255,0.30)','#78BCFF');
    if(type==='extreme-heat')  return mk('🔥 Ekstr. upał', 'rgba(255,20,10,0.24)','rgba(255,59,48,0.38)','#FF3B30');
    if(type==='dawn-clear'||type==='astro-dawn') return mk('🌅 Świt','rgba(200,90,30,0.22)','rgba(255,140,60,0.38)','#FFA040');
    if(type==='morning-clear') return mk('🌤 Ranek','rgba(245,166,35,0.15)','rgba(245,200,60,0.25)','#F5C042');
    if(['golden-clear','cloud-golden','rain-golden','storm-golden'].includes(type))
      return mk('🌇 Złota godz.','rgba(210,80,20,0.22)','rgba(255,120,40,0.36)','#FF8030');
    if(['dusk-clear','cloud-dusk','rain-dusk','astro-dusk-clear'].includes(type))
      return mk('🌆 Zmierzch','rgba(40,70,180,0.22)','rgba(80,130,255,0.32)','#6090FF');
    if(['storm','storm-dawn','storm-golden','storm-night'].includes(type))
      return mk('⚡ Burza','rgba(255,200,0,0.16)','rgba(255,208,96,0.28)','#FFD060');
    if(type==='hail') return mk('🌨 Grad','rgba(90,130,200,0.18)','rgba(168,216,240,0.28)','#A8D8F0');
    if(temp!==null&&temp>=40) return mk('🔥 Ekstr. upał','rgba(255,30,10,0.22)','rgba(255,59,48,0.32)','#FF3B30');
    if(temp!==null&&temp>=35) return mk('🔥 Silny upał','rgba(255,60,20,0.18)','rgba(255,104,32,0.28)','#FF6820');
    if(temp!==null&&temp>=30) return mk('🌡 Upał','rgba(255,100,20,0.16)','rgba(255,159,10,0.26)','#FF9F0A');
    if(['rain','rain-dawn','rain-golden','rain-dusk','rain-night'].includes(type)){
      if(rainClass==='violent') return mk('🌧 Ulewa','rgba(30,90,200,0.22)','rgba(90,200,250,0.30)','#5AC8FA');
      if(rainClass==='heavy')   return mk('🌧 Silny deszcz','rgba(30,90,200,0.18)','rgba(90,200,250,0.25)','#5AC8FA');
      if(rainClass==='moderate')return mk('🌧 Deszcz','rgba(30,90,200,0.15)','rgba(90,200,250,0.22)','#5AC8FA');
      if(rainClass==='light')   return mk('🌦 Lekki deszcz','rgba(30,90,200,0.12)','rgba(120,170,210,0.22)','#7BAED4');
      return mk('🌦 Mżawka','rgba(30,90,200,0.09)','rgba(120,170,210,0.18)','#7BAED4');
    }
    if(['snow','snow-night'].includes(type)){
      if(temp!==null&&temp<=-15) return mk('❄ Ekstr. mróz','rgba(90,150,255,0.18)','rgba(174,228,248,0.28)','#AEE4F8');
      if(temp!==null&&temp<=-5)  return mk('❄ Silny mróz','rgba(90,150,255,0.15)','rgba(174,228,248,0.24)','#AEE4F8');
      return mk('❄ Mróz / śnieg','rgba(90,150,255,0.13)','rgba(174,228,248,0.22)','#AEE4F8');
    }
    if(['fog','fog-night'].includes(type)) return mk('🌫 Mgła','rgba(130,150,200,0.18)','rgba(136,153,187,0.28)','#8899BB');
    if(gustNum>=75) return mk('🌪 Huragan','rgba(80,140,220,0.22)','rgba(90,200,250,0.30)','#5AC8FA');
    if(gustNum>=60||['windy','windy-night'].includes(type)) return mk('💨 Wichura','rgba(80,140,220,0.16)','rgba(120,170,210,0.26)','#7BAED4');
    if(gustNum>=40) return mk('💨 Silny wiatr','rgba(80,140,220,0.13)','rgba(120,170,210,0.22)','#7BAED4');
    if(uvNum>=11) return mk('☀ UV ekstr.','rgba(180,30,30,0.22)','rgba(255,59,48,0.30)','#FF3B30');
    if(uvNum>=8)  return mk('☀ UV b. wysokie','rgba(255,60,40,0.16)','rgba(255,104,32,0.26)','#FF6820');
    if(uvNum>=6)  return mk('☀ UV wysokie','rgba(255,140,20,0.14)','rgba(255,159,10,0.22)','#FF9F0A');
    if(isNight) return getMoonPill();
    if(temp!==null&&temp<=0) return mk('🌨 Poniżej zera','rgba(90,150,255,0.13)','rgba(90,200,250,0.22)','#5AC8FA');
    if(temp!==null&&temp<=5) return mk('🌡 Zimno','rgba(90,150,255,0.11)','rgba(120,170,210,0.20)','#7BAED4');
    if(['sun','morning-clear'].includes(type)) return mk('☀ Słonecznie','rgba(245,166,35,0.13)','rgba(245,166,35,0.22)','#F5A623');
    return mk('☁ Pochmurno','rgba(110,130,165,0.15)','rgba(130,150,187,0.22)','#8899BB');
  }

  // ── particles (rain / snow / fog / stars) — seeded, cached per type ─────────
  _buildParticles(type, rainClass, windDeg, gustNum) {
    if (this._particles && this._lastType === type) return this._particles;
    this._lastType = type;

    let drops='', ripples='', snowFlakes='', fogStripes='', stars='', bgClouds='', auroraFx='';
    const rand = _wcRand(type.split('').reduce((a,c)=>a+c.charCodeAt(0),0));

    // ── rain drops ────────────────────────────────────────────────────────────
    const isRainType = ['rain','rain-dawn','rain-golden','rain-dusk','rain-night',
                         'storm','storm-dawn','storm-golden','storm-night','hail','freezing-rain'].includes(type);
    if (isRainType) {
      const isStorm=type.startsWith('storm'), isHail=type==='hail', isFR=type==='freezing-rain';
      const windDegNum = parseFloat(windDeg);
      const rainTilt = (!isNaN(windDegNum) && isRainType)
        ? (-Math.sin(windDegNum*Math.PI/180)*16).toFixed(1) : 0;
      const dc  = isStorm?80:isHail?25:rainClass==='violent'?70:rainClass==='heavy'?55:rainClass==='moderate'?40:rainClass==='light'?25:15;
      const wMin= isHail?4:isFR?1:isStorm||rainClass==='violent'?2.2:rainClass==='heavy'?1.8:rainClass==='moderate'?1.5:1.2;
      const hBase=isHail?4:isFR?10:isStorm||rainClass==='violent'?22:rainClass==='heavy'?18:rainClass==='moderate'?14:10;
      const dBase=isHail?0.55:isFR?0.9:isStorm||rainClass==='violent'?0.36:rainClass==='heavy'?0.44:rainClass==='moderate'?0.58:0.72;
      const br  = isHail?'50%':'2px';
      let dropCol, rippleCol;
      if(type==='rain-dawn')   {dropCol='rgba(160,140,200,0.50)';rippleCol='rgba(160,140,200,0.35)';}
      else if(type==='rain-golden'){dropCol='rgba(180,140,80,0.45)';rippleCol='rgba(180,140,80,0.30)';}
      else if(type==='rain-dusk') {dropCol='rgba(80,100,200,0.50)';rippleCol='rgba(80,100,200,0.35)';}
      else if(isFR)            {dropCol='rgba(160,210,255,0.65)';rippleCol='rgba(160,210,255,0.40)';}
      else                     {dropCol=`rgba(120,180,255,${rainClass==='drizzle'?'0.35':'0.52'})`;rippleCol='rgba(120,180,255,0.30)';}
      const dropsHTML = [];
      for(let i=0;i<dc;i++){
        const l=(rand()*112-6).toFixed(1), h=(hBase+rand()*hBase*(isHail?0.3:0.7)).toFixed(0);
        const dur=(dBase+rand()*dBase*0.7).toFixed(2), del=(rand()*2.2).toFixed(2);
        dropsHTML.push(`<div style="position:absolute;left:${l}%;top:-30px;width:${wMin}px;height:${h}px;
          background:${dropCol};border-radius:${br};
          animation:wc-fall ${dur}s ${del}s linear infinite;"></div>`);
      }
      drops = `<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:3;transform:rotate(${rainTilt}deg);transform-origin:top center;">${dropsHTML.join('')}</div>`;
      const rippleCount=isStorm?12:rainClass==='violent'?10:rainClass==='heavy'?8:6;
      const ripplesHTML = [];
      for(let i=0;i<rippleCount;i++){
        const rl=(rand()*90+5).toFixed(1),rdur=(1.2+rand()*0.8).toFixed(2),rdel=(rand()*3).toFixed(2);
        ripplesHTML.push(`<div style="position:absolute;left:${rl}%;bottom:8%;width:3px;height:3px;
          border:1px solid ${rippleCol};border-radius:50%;
          animation:wc-ripple ${rdur}s ${rdel}s ease-out infinite;"></div>`);
      }
      ripples = `<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:3;">${ripplesHTML.join('')}</div>`;
    }

    // ── snow ──────────────────────────────────────────────────────────────────
    if (['snow','snow-night','blizzard'].includes(type)) {
      const fast=type==='blizzard';
      const sfHTML=[];
      [[fast?15:12,1.5,2,0.35,2],[fast?25:18,2.5,2.5,0.70,0.5],[fast?20:12,3.5,3,0.92,0]].forEach(([cnt,sMin,sRange,op,blur])=>{
        for(let i=0;i<cnt;i++){
          const l=(rand()*110-5).toFixed(1),s=(sMin+rand()*sRange).toFixed(1);
          const dur=(fast?(sMin<2?2.5+rand()*1.5:sMin<3?1.5+rand()*1.2:0.8+rand()*0.8):(sMin<2?4+rand()*2.5:sMin<3?3+rand()*2:2+rand()*1.5)).toFixed(2);
          const del=(rand()*(fast?2:5)).toFixed(2),sw=fast?(rand()*60-30).toFixed(0):(rand()*30-15).toFixed(0);
          sfHTML.push(`<div style="position:absolute;left:${l}%;top:-12px;width:${s}px;height:${s}px;
            border-radius:50%;background:rgba(200,232,255,${op});--sw:${sw}px;--op:${op};
            ${blur?`filter:blur(${blur}px);`:''}
            animation:wc-snow ${dur}s ${del}s ease-in-out infinite,wc-bokeh ${2+blur*.5}s ease-in-out infinite;"></div>`);
        }
      });
      if(type==='blizzard'){
        for(let i=0;i<8;i++){
          const top=(5+i*12).toFixed(0);
          sfHTML.push(`<div style="position:absolute;top:${top}%;left:-5%;width:${(50+rand()*50).toFixed(0)}px;height:1px;
            background:rgba(200,225,255,0.28);border-radius:1px;filter:blur(0.5px);
            animation:wc-bliz-streak ${(0.3+rand()*0.25).toFixed(2)}s ${(rand()*0.8).toFixed(2)}s linear infinite;"></div>`);
        }
      }
      snowFlakes = `<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:3;">${sfHTML.join('')}</div>`;
    }

    // ── fog ───────────────────────────────────────────────────────────────────
    if (['fog','fog-night'].includes(type)) {
      const col1=type==='fog-night'?'rgba(80,100,170,0.28)':'rgba(140,170,210,0.32)';
      const col2=type==='fog-night'?'rgba(70,90,160,0.22)':'rgba(130,160,200,0.26)';
      const col3=type==='fog-night'?'rgba(60,80,150,0.18)':'rgba(120,150,190,0.20)';
      const fHTML=[];
      [[12,100,0,col3,12],[28,90,8,col3,12],[44,95,0,col3,12],
       [18,95,5,col2,8],[34,82,12,col2,8],[50,90,2,col2,8],
       [22,88,8,col1,5],[38,76,16,col1,5],[54,85,5,col1,5]].forEach(([top,w,left,col,blur],i)=>{
        const dur=(10-i*0.3).toFixed(1),del=(i*0.8).toFixed(1);
        fHTML.push(`<div style="position:absolute;top:${top}%;left:${left}%;width:${w}%;height:${6+blur/4}px;
          border-radius:8px;background:${col};filter:blur(${blur}px);
          animation:wc-fog ${dur}s ${del}s cubic-bezier(0.4,0,0.2,1) infinite,wc-fog-roll ${dur*.7}s ${del}s ease-in-out infinite;"></div>`);
      });
      fogStripes = `<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:3;">${fHTML.join('')}</div>`;
    }

    // ── stars (night clear / aurora) ──────────────────────────────────────────
    if (['night-clear','astro-dusk-clear','aurora'].includes(type)) {
      const sHTML=['<div style="position:absolute;inset:0;overflow:hidden;border-radius:24px;pointer-events:none;z-index:1;">'];
      [[type==='aurora'?15:12,'#A0B8D8',0.5,1,0.18,0.25,5,4],
       [type==='aurora'?18:15,'#C8D8F0',0.8,1.4,0.28,0.35,3.5,3.5],
       [type==='aurora'?10:8,'#E8F0FF',1.2,1.8,0.45,0.45,2.5,3]].forEach(([cnt,col,sMin,sRange,opMin,opRange,spdMin,spdRange])=>{
        for(let i=0;i<cnt;i++){
          const x=(rand()*88+2).toFixed(1),y=(rand()*65+2).toFixed(1);
          const s=(sMin+rand()*sRange).toFixed(1),op=(opMin+rand()*opRange).toFixed(2);
          const dl=(rand()*6).toFixed(1),spd=(spdMin+rand()*spdRange).toFixed(1);
          sHTML.push(`<div style="position:absolute;left:${x}%;top:${y}%;width:${s}px;height:${s}px;
            border-radius:50%;background:${col};--op:${op};
            animation:wc-twinkle ${spd}s ${dl}s cubic-bezier(0.4,0,0.2,1) infinite;"></div>`);
        }
      });
      const shootCount=type==='aurora'?2:1;
      for(let i=0;i<shootCount;i++){
        const sx=(rand()*60+10).toFixed(1),sy=(rand()*40+5).toFixed(1),sdel=(20+rand()*15).toFixed(1);
        sHTML.push(`<div style="position:absolute;left:${sx}%;top:${sy}%;width:2px;height:2px;
          border-radius:50%;background:#FFF;box-shadow:0 0 4px #C8D8F0;
          animation:wc-shoot 1.2s ${sdel}s ease-out infinite;"></div>`);
        sHTML.push(`<div style="position:absolute;left:${sx}%;top:${sy}%;width:20px;height:1px;
          background:linear-gradient(to right,rgba(255,255,255,0.8),transparent);
          transform-origin:left center;transform:rotate(35deg);
          animation:wc-shoot 1.2s ${sdel}s ease-out infinite;"></div>`);
      }
      sHTML.push('</div>');
      stars = sHTML.join('');
    }

    // ── aurora effect ─────────────────────────────────────────────────────────
    if (type==='aurora') {
      auroraFx = `<div style="position:absolute;inset:0;overflow:hidden;border-radius:24px;pointer-events:none;z-index:2;">
        ${[['rgba(0,200,100,0.28)','-20%','18%','130%','22px','5px','5s','0s'],
           ['rgba(0,160,200,0.20)','10%','28%','120%','18px','7px','6.5s','1.2s'],
           ['rgba(120,0,220,0.16)','40%','38%','90%','14px','9px','8s','0.6s'],
           ['rgba(0,220,120,0.18)','60%','22%','100%','20px','6px','7s','2s']].map(
          ([col,left,top,width,h,blur,dur,del])=>
          `<div style="position:absolute;left:${left};top:${top};width:${width};height:${h};border-radius:60%;
            background:${col};filter:blur(${blur});animation:wc-aurora ${dur} ${del} cubic-bezier(0.4,0,0.2,1) infinite;opacity:.8;"></div>`
        ).join('')}
      </div>`;
    }

    // ── background clouds ─────────────────────────────────────────────────────
    const cloudTypes=['cloud','partlycloudy','rain','rain-dawn','rain-golden','rain-dusk','rain-night',
                       'cloud-dawn','cloud-golden','cloud-dusk','cloud-night',
                       'storm','storm-dawn','storm-golden','storm-night','windy','windy-night','hail',
                       'snow','snow-night','freezing-rain','fog','fog-night'];
    if (cloudTypes.includes(type)) {
      const CC = {
        'cloud':        ['rgba(210,222,240,0.32)','rgba(190,208,232,0.22)','rgba(220,230,245,0.16)'],
        'partlycloudy': ['rgba(200,215,235,0.22)','rgba(180,200,225,0.14)','rgba(210,222,240,0.10)'],
        'cloud-dawn':   ['rgba(200,160,120,0.28)','rgba(180,130,90,0.18)','rgba(220,180,140,0.14)'],
        'cloud-golden': ['rgba(180,120,60,0.32)','rgba(160,100,50,0.22)','rgba(200,140,80,0.16)'],
        'cloud-dusk':   ['rgba(80,100,180,0.32)','rgba(60,80,160,0.22)','rgba(100,120,200,0.16)'],
        'cloud-night':  ['rgba(60,80,120,0.36)','rgba(45,62,100,0.24)','rgba(70,90,130,0.16)'],
        'rain':         ['rgba(80,120,185,0.40)','rgba(60,100,168,0.28)','rgba(90,130,195,0.20)'],
        'rain-dawn':    ['rgba(100,90,130,0.38)','rgba(80,70,110,0.26)','rgba(120,110,150,0.18)'],
        'rain-golden':  ['rgba(120,80,40,0.38)','rgba(100,60,30,0.26)','rgba(140,100,60,0.18)'],
        'rain-dusk':    ['rgba(50,70,160,0.40)','rgba(40,55,140,0.28)','rgba(60,85,175,0.20)'],
        'rain-night':   ['rgba(35,55,100,0.42)','rgba(25,42,85,0.30)','rgba(45,65,115,0.20)'],
        'storm':        ['rgba(30,36,52,0.65)','rgba(22,28,44,0.50)','rgba(40,48,64,0.35)'],
        'storm-dawn':   ['rgba(38,32,48,0.60)','rgba(28,24,38,0.44)','rgba(48,40,58,0.30)'],
        'storm-golden': ['rgba(40,28,18,0.60)','rgba(30,20,12,0.44)','rgba(50,36,24,0.30)'],
        'storm-night':  ['rgba(20,24,38,0.68)','rgba(14,18,30,0.52)','rgba(26,32,48,0.36)'],
        'hail':         ['rgba(72,110,175,0.42)','rgba(55,90,158,0.30)','rgba(82,120,185,0.22)'],
        'windy':        ['rgba(180,205,230,0.20)','rgba(160,188,218,0.14)','rgba(195,215,238,0.10)'],
        'windy-night':  ['rgba(50,70,120,0.30)','rgba(40,55,100,0.20)','rgba(60,80,130,0.14)'],
        'snow':         ['rgba(190,210,240,0.28)','rgba(170,195,228,0.18)','rgba(200,218,245,0.14)'],
        'snow-night':   ['rgba(60,80,130,0.30)','rgba(45,62,110,0.20)','rgba(70,92,140,0.14)'],
        'freezing-rain':['rgba(60,100,170,0.38)','rgba(45,82,150,0.26)','rgba(70,115,185,0.18)'],
        'fog':          ['rgba(160,180,210,0.30)','rgba(140,165,200,0.20)','rgba(170,190,220,0.14)'],
        'fog-night':    ['rgba(50,65,110,0.34)','rgba(40,52,94,0.22)','rgba(58,74,120,0.16)'],
      }[type];
      if (CC) {
        const wNum=parseFloat(gustNum)||8;
        const bDur=Math.max(8,40-wNum*0.35);
        const wdN=parseFloat(windDeg)||270;
        const dkf=((wdN+180)%360)<180?'wc-drift':'wc-drift-rtl';
        const layers=[[240,90,2,2.20,38],[200,75,8,1.85,34],[180,65,15,1.50,30],[220,80,6,1.25,26],
                       [165,60,22,1.00,22],[190,70,12,0.75,18],[150,55,28,0.55,14],[175,65,18,0.40,10]];
        const startX=['-15%','18%','48%','72%','35%','-8%','55%','28%'];
        const cHTML=['<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;">'];
        layers.forEach(([w,h,top,sm,blur],i)=>{
          const col=CC[i%CC.length],dur=(bDur*sm).toFixed(1),del=(-(parseFloat(dur)*(i*0.15+0.05))).toFixed(1);
          cHTML.push(`<div style="position:absolute;top:${top}%;left:${startX[i]};width:${w}px;height:${h}px;
            border-radius:50%;background:${col};filter:blur(${blur}px);
            animation:${dkf} ${dur}s ${del}s linear infinite;"></div>`);
        });
        cHTML.push('</div>');
        bgClouds = cHTML.join('');
      }
    }

    this._particles = { drops, ripples, snowFlakes, fogStripes, stars, bgClouds, auroraFx };
    return this._particles;
  }

  // ── fertilization done state (localStorage) ───────────────────────────────
  _fertilDoneKey(f) { return 'aha-fertil-done:' + f.date; }
  _isFertilDone(f) {
    try { return localStorage.getItem(this._fertilDoneKey(f)) !== null; } catch (e) { return false; }
  }
  _setFertilDone(f, done) {
    try {
      if (done) {
        // Store actual execution date (not just '1'), so garden-calendar can show it
        const today = new Date();
        const ds = today.getFullYear() + '-'
          + String(today.getMonth() + 1).padStart(2, '0') + '-'
          + String(today.getDate()).padStart(2, '0');
        localStorage.setItem(this._fertilDoneKey(f), ds);
      } else {
        localStorage.removeItem(this._fertilDoneKey(f));
      }
    } catch (e) {}
    this._render();
  }

  // ── fertilization banners ─────────────────────────────────────────────────
  _buildFertilBanners() {
    if (!this._fertilizations || !this._fertilizations.length) return '';
    const upcoming = this._fertilizations
      .map(f => ({ f, days: _daysUntil(f.date) }))
      .filter(({ days }) => days >= 0 && days <= 30)
      .sort((a, b) => a.days - b.days)
      .slice(0, 1);
    return upcoming.map(({ f, days }) => this._renderFertilBanner(f, days, this._isFertilDone(f))).join('');
  }

  _renderFertilBanner(f, days, done) {
    const isToday    = days === 0;
    const isTomorrow = days === 1;
    const isUrgent   = days <= 7;

    // accent: lush green
    let acR, acG, acB;
    if      (isToday)    { acR=80;  acG=200; acB=90; }
    else if (isTomorrow) { acR=100; acG=195; acB=80; }
    else if (isUrgent)   { acR=130; acG=200; acB=80; }
    else                 { acR=100; acG=180; acB=70; }

    // ── Done state — muted banner with undo ──────────────────────────────────
    if (done) {
      const doneCheckSVG = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="rgba(${acR},${acG},${acB},.45)" stroke-width="1.2" fill="rgba(${acR},${acG},${acB},.12)"/>
        <path d="M4 7l2 2 4-4" stroke="rgba(${acR},${acG},${acB},.80)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
      return `<div class="banner normal" style="opacity:.45;border-top:1px solid rgba(${acR},${acG},${acB},.20);">
        <div class="banner-inner">
          <div class="banner-icon sm" style="background:rgba(${acR},${acG},${acB},.08);border:1px solid rgba(${acR},${acG},${acB},.22);">
            ${doneCheckSVG}
          </div>
          <div class="banner-text">
            <div style="font-size:10px;font-weight:600;color:rgba(${acR},${acG},${acB},.75);text-transform:uppercase;letter-spacing:.06em;text-decoration:line-through;">${f.name}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.30);margin-top:1px;">Wykonano</div>
          </div>
          <button class="fertil-undo-btn" data-fertil-date="${f.date}"
            style="background:none;border:1px solid rgba(255,255,255,.18);border-radius:8px;
            padding:3px 8px;cursor:pointer;font-size:9px;font-weight:600;
            color:rgba(255,255,255,.35);font-family:-apple-system,system-ui,sans-serif;
            flex-shrink:0;white-space:nowrap;">cofnij</button>
        </div>
      </div>`;
    }

    // ── Check button (shared across all active variants) ────────────────────
    const acB2 = `rgba(${acR},${acG},${acB},0.35)`;
    const acL  = `rgba(${acR},${acG},${acB},0.18)`;
    const pillText = isToday?'dziś!':isTomorrow?'jutro':`${days} dni`;
    const iconSVG  = _fertilIconSVG(isToday?20:18, acR, acG, acB);
    const doneBtn  = `<button class="fertil-done-btn" data-fertil-date="${f.date}"
      title="Oznacz jako wykonane"
      style="background:none;border:1.5px solid rgba(${acR},${acG},${acB},.35);border-radius:50%;
      width:26px;height:26px;cursor:pointer;flex-shrink:0;display:flex;
      align-items:center;justify-content:center;padding:0;">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="rgba(${acR},${acG},${acB},.75)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>`;

    if (isToday) {
      const ac = `rgba(${acR},${acG},${acB},1)`;
      return `<div class="banner today" style="border-top:2px solid ${acB2};">
        <div class="banner-bg" style="background:${acL};"></div>
        <div class="banner-inner">
          <div class="banner-icon pulse" style="background:${acL};border:2px solid ${acB2};">
            ${iconSVG}
            <div class="icon-ring" style="border-color:rgba(${acR},${acG},${acB},0.40);"></div>
          </div>
          <div class="banner-text">
            <div style="font-size:12px;font-weight:600;color:${ac};text-transform:uppercase;letter-spacing:.05em;">🌱 ${f.name} — dziś!</div>
            <div style="font-size:10px;color:rgba(200,240,180,.75);margin-top:2px;">${f.description||''}</div>
          </div>
          <div class="banner-pill pulse" style="color:${ac};background:${acL};border:1.5px solid ${acB2};">${pillText}</div>
          ${doneBtn}
        </div>
      </div>`;
    }
    if (isTomorrow) {
      const ac = `rgba(${acR},${acG},${acB},1)`;
      return `<div class="banner tomorrow" style="border-top:2px solid ${acB2};background:rgba(${acR},${acG},${acB},.08);">
        <div class="banner-inner">
          <div class="banner-icon" style="background:rgba(${acR},${acG},${acB},.15);border:1.5px solid ${acB2};">
            ${iconSVG}
          </div>
          <div class="banner-text">
            <div style="font-size:11px;font-weight:600;color:${ac};text-transform:uppercase;letter-spacing:.05em;">🌱 Jutro: ${f.name}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.40);margin-top:1px;">${f.description||''}</div>
          </div>
          <div class="banner-pill pulse-slow" style="color:${ac};background:rgba(${acR},${acG},${acB},.18);border:1.5px solid ${acB2};">${pillText}</div>
          ${doneBtn}
        </div>
      </div>`;
    }
    if (isUrgent) {
      return `<div class="banner urgent" style="border-top:1px solid rgba(${acR},${acG},${acB},.30);background:rgba(${acR},${acG},${acB},.06);">
        <div class="banner-inner">
          <div class="banner-icon sm" style="background:rgba(${acR},${acG},${acB},.12);border:1px solid rgba(${acR},${acG},${acB},.35);">
            ${iconSVG}
          </div>
          <div class="banner-text">
            <div style="font-size:10px;font-weight:600;color:rgba(${acR},${acG},${acB},.85);text-transform:uppercase;letter-spacing:.06em;">🌱 ${f.name} za ${days} dni</div>
            <div style="font-size:10px;color:rgba(255,255,255,.38);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${f.description||''}</div>
          </div>
          <div class="banner-pill pulse-slow" style="font-size:11px;color:rgba(${acR},${acG},${acB},.85);background:rgba(${acR},${acG},${acB},.14);border:1px solid rgba(${acR},${acG},${acB},.35);">${pillText}</div>
          ${doneBtn}
        </div>
      </div>`;
    }
    return `<div class="banner normal">
      <div class="banner-inner">
        <div class="banner-icon sm" style="background:rgba(${acR},${acG},${acB},.10);border:1px solid rgba(${acR},${acG},${acB},.25);">
          ${iconSVG}
        </div>
        <div class="banner-text">
          <div style="font-size:10px;font-weight:600;color:rgba(${acR},${acG},${acB},.85);text-transform:uppercase;letter-spacing:.06em;">🌱 ${f.name}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${f.description||''}</div>
        </div>
        <div class="banner-pill" style="font-size:11px;color:rgba(${acR},${acG},${acB},.85);background:rgba(${acR},${acG},${acB},.12);border:1px solid rgba(${acR},${acG},${acB},.25);">${pillText}</div>
        ${doneBtn}
      </div>
    </div>`;
  }

  // ── extra effects ────────────────────────────────────────────────────────────
  _buildExtras(type, temp) {
    let godRays='', horizonGlow='', moonGlow='', lightning='', heatHaze='', mirageStrip='', iceCornerGlow='';
    if (['dawn-clear','morning-clear','golden-clear'].includes(type)) {
      const rayCol=type==='golden-clear'?'rgba(255,112,32,0.18)':'rgba(255,148,48,0.18)';
      const rays=[];
      for(let i=0;i<7;i++){
        const angle=-35+(i*12),width=(60+i*8),opacity=(0.12+i*0.014).toFixed(2),delay=(i*0.8).toFixed(1);
        rays.push(`<div style="position:absolute;bottom:-10%;left:50%;width:${width}px;height:140%;
          background:linear-gradient(to top,${rayCol} 0%,transparent 65%);
          transform:translateX(-50%) rotate(${angle}deg);transform-origin:center bottom;
          opacity:${opacity};animation:wc-god-ray 6s ${delay}s ease-in-out infinite;"></div>`);
      }
      godRays=`<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;">${rays.join('')}</div>`;
    }
    if (['dawn-clear','morning-clear'].includes(type)) {
      const col=type==='morning-clear'?'#FFC060':'#FF8030';
      horizonGlow=`<div style="position:absolute;bottom:0;left:-10%;right:-10%;height:45%;pointer-events:none;z-index:1;
        background:radial-gradient(ellipse at 50% 110%,${col}45 0%,${col}22 35%,transparent 70%);
        animation:wc-sun-pulse 4.5s cubic-bezier(0.4,0,0.2,1) infinite;"></div>`;
    }
    if (['golden-clear','cloud-golden','rain-golden','storm-golden'].includes(type)) {
      horizonGlow=`<div style="position:absolute;bottom:0;left:-10%;right:-10%;height:55%;pointer-events:none;z-index:1;
        background:radial-gradient(ellipse at 50% 110%,#FF501842 0%,#FF701820 40%,transparent 70%);
        animation:wc-sun-pulse 4s cubic-bezier(0.4,0,0.2,1) infinite;"></div>`;
    }
    if (['dusk-clear','astro-dusk-clear','cloud-dusk','rain-dusk'].includes(type)) {
      horizonGlow=`<div style="position:absolute;bottom:0;left:-10%;right:-10%;height:40%;pointer-events:none;z-index:1;
        background:radial-gradient(ellipse at 50% 110%,#30409038 0%,transparent 70%);
        animation:wc-moon-pulse 6s cubic-bezier(0.4,0,0.2,1) infinite;"></div>`;
    }
    if (['night-clear','astro-dusk-clear','cloud-night','fog-night','windy-night','snow-night','rain-night','storm-night','aurora'].includes(type)) {
      moonGlow=`<div style="position:absolute;width:64px;height:64px;border-radius:50%;
        background:radial-gradient(circle,rgba(180,210,255,0.22) 0%,transparent 70%);
        top:6px;right:6px;z-index:2;animation:wc-moon-pulse 5s cubic-bezier(0.4,0,0.2,1) infinite;pointer-events:none;"></div>`;
    }
    if (type.startsWith('storm')) {
      const lightCol=type==='storm-night'?'rgba(180,200,255,0.95)':'rgba(255,245,200,0.92)';
      const interval=type==='storm-night'?'10s':'12s';
      lightning=`<div style="position:absolute;inset:0;overflow:hidden;border-radius:24px;pointer-events:none;z-index:4;">
        <div style="position:absolute;top:10%;left:30%;width:180px;height:80px;border-radius:50%;
          background:radial-gradient(circle,${lightCol.replace('0.95','0.20').replace('0.92','0.18')} 0%,transparent 70%);
          filter:blur(20px);animation:wc-charge ${interval} infinite;"></div>
        <svg style="position:absolute;top:0;left:55%;width:3px;height:100%;animation:wc-lightning ${interval} infinite;" viewBox="0 0 3 300" fill="none">
          <path d="M1.5 0 L1.5 40 L2.2 60 L1.2 80 L2.0 100 L0.8 120 L1.5 150" stroke="${lightCol}" stroke-width="0.3" stroke-linecap="round"/>
          <path d="M1.5 60 L2.8 75" stroke="${lightCol}" stroke-width="0.15" stroke-linecap="round"/>
          <path d="M1.2 100 L0.2 115" stroke="${lightCol}" stroke-width="0.15" stroke-linecap="round"/>
        </svg>
        <div style="position:absolute;inset:0;background:${lightCol.replace('0.95','0.08').replace('0.92','0.06')};animation:wc-lightning ${interval} infinite;"></div>
      </div>`;
    }
    if (type==='extreme-heat') {
      const heatCol=_tempAccent(temp);
      heatHaze=`<div style="position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 70% 5%,${heatCol}35 0%,transparent 60%);animation:wc-heatwave 2.5s cubic-bezier(0.4,0,0.2,1) infinite;"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,${heatCol}18 0%,transparent 50%);animation:wc-heatwave 3.2s 0.8s cubic-bezier(0.4,0,0.2,1) infinite;"></div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:40%;background:linear-gradient(to top,${heatCol}48 0%,transparent 100%);animation:wc-heatwave 2.8s 0.4s cubic-bezier(0.4,0,0.2,1) infinite;"></div>
      </div>`;
      mirageStrip=`<div style="position:absolute;left:-6%;right:-6%;top:44%;height:32px;
        pointer-events:none;z-index:2;border-radius:50%;
        background:linear-gradient(transparent,rgba(255,140,40,0.10),transparent);
        animation:wc-mirage-drift 4.5s ease-in-out infinite;"></div>`;
    }
    if (type==='blizzard') {
      iceCornerGlow=`<div style="position:absolute;inset:0;pointer-events:none;z-index:1;border-radius:24px;
        background:radial-gradient(ellipse at 20% 10%,rgba(120,190,255,0.20) 0%,rgba(90,200,250,0.06) 40%,transparent 62%);
        animation:wc-ice-glow 3.0s ease-in-out infinite;"></div>`;
    }
    return { godRays, horizonGlow, moonGlow, lightning, heatHaze, mirageStrip, iceCornerGlow };
  }

  // ── main render ──────────────────────────────────────────────────────────────
  _render() {
    if (!this._hass) return;
    const cfg = this._config;
    const {
      type, temp, tempStr, feels, feelsNum, tColor, trendStr, trendCol,
      humOut, pres, wind, gust, gustNum, windDir, windDirPl, windDeg,
      rainRate, rainRateNum, rainDay, rainClass,
      uv, uvNum, batV, moonPhase, ms,
      isNight, dayPhase,
    } = this._compute();

    const stationLabel = cfg.station_label || 'Ogród · Stacja główna';
    const now  = new Date();
    const time = _wcPad(now.getHours()) + ':' + _wcPad(now.getMinutes());

    // background color
    const BG = {
      'sun':              _tempDayBg(temp),
      'extreme-heat':     'radial-gradient(ellipse at 50% 0%,#2a0500 0%,#1E0303 55%,#120200 100%)',
      'dawn-clear':       '#0C1525',
      'morning-clear':    '#131820',
      'astro-dawn':       '#090E1A',
      'golden-clear':     '#140C05',
      'dusk-clear':       '#0B0E1E',
      'astro-dusk-clear': '#070A14',
      'night-clear':      '#07090F',
      'partlycloudy':     _tempDayBg(temp),
      'cloud':            '#111620',
      'cloud-dawn':       '#0E1320',
      'cloud-golden':     '#12100A',
      'cloud-dusk':       '#0A0E1C',
      'cloud-night':      '#0A0D18',
      'rain':             '#0A1018',
      'rain-dawn':        '#0C1220',
      'rain-golden':      '#10100C',
      'rain-dusk':        '#080C18',
      'rain-night':       '#070A14',
      'snow':             '#0E1624',
      'snow-night':       '#0A1220',
      'blizzard':         'radial-gradient(ellipse at 20% 10%,#0a1a2e 0%,#080E1C 65%)',
      'freezing-rain':    '#070C18',
      'storm':            '#080C10',
      'storm-dawn':       '#0A0E14',
      'storm-golden':     '#0C0A08',
      'storm-night':      '#060810',
      'hail':             '#0C1020',
      'fog':              '#101520',
      'fog-night':        '#0A0E18',
      'windy':            '#101828',
      'windy-night':      '#0A1020',
      'aurora':           '#030508',
    };
    const bg = BG[type] ?? '#0f0f0f';

    const animIcon = this._buildAnimatedIcon(type, temp, ms);
    const pill     = this._buildPill(type, rainClass, gustNum, uvNum, temp, moonPhase, isNight);
    const pillHtml = pill
      ? `<div class="pill" style="background:${pill.bg};border:1px solid ${pill.border};color:${pill.color};">${pill.text}</div>`
      : '';

    const particles = this._buildParticles(type, rainClass, windDeg, gustNum);
    const extras    = this._buildExtras(type, temp);
    const batNum    = parseFloat(batV);
    const batWarn   = !isNaN(batNum) && batNum < 2.4
      ? `<div class="bat-warn">⚡ bateria ${batV}V</div>` : '';

    // stats bar (compact)
    const cVals = {
      'sun':          [humOut+'%', 'UV '+uv, wind+' km/h'],
      'extreme-heat': [humOut+'%', 'UV '+uv, feels+'° odcz.'],
      'dawn-clear':   [humOut+'%', pres+' hPa', wind+' km/h'],
      'morning-clear':[humOut+'%', 'UV '+uv, wind+' km/h'],
      'golden-clear': [humOut+'%', feels+'° odcz.', pres+' hPa'],
      'dusk-clear':   [humOut+'%', pres+' hPa', feels+'° odcz.'],
      'night-clear':  [humOut+'%', feels+'° odcz.', pres+' hPa'],
      'rain':         [humOut+'%', rainDay+' mm dziś', rainRate+' mm/h'],
      'blizzard':     [humOut+'%', gust+' km/h poryw', feels+'° odcz.'],
      'freezing-rain':[humOut+'%', rainRate+' mm/h', feels+'° odcz.'],
      'storm':        [humOut+'%', gust+' km/h poryw', rainDay+' mm'],
      'aurora':       [humOut+'%', feels+'° odcz.', pres+' hPa'],
      'fog':          [humOut+'%', pres+' hPa', feels+'° odcz.'],
      'windy':        [humOut+'%', wind+' km/h', gust+' km/h poryw'],
    };
    const vv = cVals[type] ?? [humOut+'%', pres+' hPa', wind+' km/h'];
    const compactStats = vv.map(v =>
      `<span class="stat-chip">${v}</span>`
    ).join('<span class="stat-sep">·</span>');

    const fertilBanners = this._buildFertilBanners();
    const hasFertilToday = this._fertilizations.some(f => _daysUntil(f.date) === 0);

    const css = `
      :host { display:block; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif; }

      @keyframes wc-fall        {0%{transform:translateY(-20px) translateX(0);opacity:0}8%{opacity:1}92%{opacity:.7}100%{transform:translateY(310px) translateX(-8px);opacity:0}}
      @keyframes wc-ripple      {0%{transform:scale(0);opacity:.6}100%{transform:scale(4);opacity:0}}
      @keyframes wc-sun-rays    {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes wc-sun-pulse   {0%,100%{transform:scale(1);opacity:.35}50%{transform:scale(1.15);opacity:.55}}
      @keyframes wc-heatwave    {0%{transform:translateY(0) scaleY(1)}33%{transform:translateY(-3px) scaleY(1.02)}66%{transform:translateY(2px) scaleY(.98)}100%{transform:translateY(0) scaleY(1)}}
      @keyframes wc-moon-pulse  {0%,100%{transform:scale(1);opacity:.28}50%{transform:scale(1.10);opacity:.42}}
      @keyframes wc-breathe     {0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.03);opacity:.92}}
      @keyframes wc-lightning   {0%,93%{opacity:0}94%{opacity:1}95%{opacity:0}96%{opacity:.8}97%,100%{opacity:0}}
      @keyframes wc-charge      {0%,90%{opacity:.2}92%{opacity:.6}94%,100%{opacity:.2}}
      @keyframes wc-snow        {0%{transform:translateY(-10px) translateX(0);opacity:0}12%{opacity:.88}88%{opacity:.55}100%{transform:translateY(310px) translateX(var(--sw,0px));opacity:0}}
      @keyframes wc-bokeh       {0%,100%{filter:blur(0px);opacity:var(--op,.7)}50%{filter:blur(2px);opacity:calc(var(--op,.7)*1.3)}}
      @keyframes wc-bliz-streak {from{transform:translateX(-10%)}to{transform:translateX(130%)}}
      @keyframes wc-drift       {from{transform:translateX(-180%)}to{transform:translateX(100%)}}
      @keyframes wc-drift-rtl   {from{transform:translateX(100%)}to{transform:translateX(-180%)}}
      @keyframes wc-twinkle     {0%,100%{opacity:var(--op,.4);transform:scale(1)}50%{opacity:calc(var(--op,.4)*2);transform:scale(1.2)}}
      @keyframes wc-shoot       {0%{transform:translateX(0) translateY(0);opacity:1}70%{opacity:.4}100%{transform:translateX(120px) translateY(80px);opacity:0}}
      @keyframes wc-fog         {0%,100%{opacity:.58;transform:translateX(0)}50%{opacity:.30;transform:translateX(15px)}}
      @keyframes wc-fog-roll    {0%{transform:translateY(10px);opacity:.3}50%{transform:translateY(-5px);opacity:.6}100%{transform:translateY(10px);opacity:.3}}
      @keyframes wc-aurora      {0%,100%{opacity:.58;transform:scaleX(1) translateY(0)}50%{opacity:.82;transform:scaleX(1.10) translateY(-6px)}}
      @keyframes wc-god-ray       {0%,100%{opacity:.15}50%{opacity:.35}}
      @keyframes breathe          {0%,100%{opacity:1}50%{opacity:.75}}
      @keyframes breathe-slow     {0%,100%{opacity:1}50%{opacity:.80}}
      @keyframes ring-pulse       {0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(1.3);opacity:0}}
      @keyframes wc-fire-border   {0%,100%{box-shadow:0 0 0 0 rgba(255,80,0,0);}50%{box-shadow:0 0 0 6px rgba(255,80,0,0.24),0 0 28px rgba(255,60,0,0.18);}}
      @keyframes wc-bliz-border   {0%,100%{box-shadow:0 0 0 0 rgba(174,228,248,0);}50%{box-shadow:0 0 0 5px rgba(174,228,248,0.22),0 0 22px rgba(100,180,255,0.14);}}
      @keyframes wc-storm-border  {0%,93%{box-shadow:none;}94%{box-shadow:0 0 0 3px rgba(255,215,50,0.28);}95%{box-shadow:none;}96%{box-shadow:0 0 0 3px rgba(255,215,50,0.16);}97%,100%{box-shadow:none;}}
      @keyframes wc-aurora-border {0%,100%{box-shadow:0 0 0 0 rgba(0,200,100,0);}50%{box-shadow:0 0 0 4px rgba(0,200,100,0.16),0 0 22px rgba(120,0,220,0.12);}}
      @keyframes wc-frz-border    {0%,100%{box-shadow:0 0 0 0 rgba(100,200,255,0);}50%{box-shadow:0 0 0 4px rgba(100,200,255,0.18);}}
      @keyframes wc-heat-hue      {0%,100%{filter:hue-rotate(0deg);}50%{filter:hue-rotate(6deg);}}
      @keyframes wc-mirage-drift  {0%,100%{opacity:0;transform:scaleX(0.85);}45%{opacity:1;transform:scaleX(1.08);}90%{opacity:0;transform:scaleX(1.0);}}
      @keyframes wc-ice-glow      {0%,100%{opacity:.07;}50%{opacity:.19;}}

      .card {
        background: ${bg};
        border-radius: 24px;
        padding: 18px 18px 16px;
        position: relative;
        overflow: hidden;
        min-height: 190px;
        display: flex;
        flex-direction: column;
        ${hasFertilToday ? 'border:1.5px solid rgba(80,200,90,.40);' : ''}
        ${type==='extreme-heat'  ? 'animation:wc-fire-border 2.2s ease-in-out infinite,wc-heat-hue 3.5s ease-in-out infinite;' : ''}
        ${type==='blizzard'      ? 'animation:wc-bliz-border 3.5s ease-in-out infinite;' : ''}
        ${type==='storm-night'   ? 'animation:wc-storm-border 10s ease-out infinite;' : ''}
        ${type==='aurora'        ? 'animation:wc-aurora-border 5.0s ease-in-out infinite;' : ''}
        ${type==='freezing-rain' ? 'animation:wc-frz-border 4.0s ease-in-out infinite;' : ''}
      }
      .content { position:relative; z-index:10; display:flex; flex-direction:column; flex:1; }
      .header  { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
      .station { font-size:11px; font-weight:600; color:rgba(255,255,255,.28); letter-spacing:.02em; }
      .header-right { display:flex; flex-direction:column; align-items:flex-end; gap:4px; }
      .pill { display:inline-flex; align-items:center; padding:3px 9px 3px 8px;
              border-radius:20px; font-size:10px; font-weight:600; letter-spacing:.02em;
              white-space:nowrap; line-height:1.4; }
      .time-label { font-size:10px; font-weight:500; color:rgba(255,255,255,.20); }

      .middle { flex:1; display:flex; align-items:flex-start; justify-content:space-between; padding-bottom:14px; }
      .temp-block { display:flex; flex-direction:column; justify-content:center; gap:0; }
      .temp-val   { font-size:80px; font-weight:700; letter-spacing:-5px; line-height:.90; color:${tColor};
        ${type==='extreme-heat'  ? 'text-shadow:0 0 30px rgba(255,120,0,0.80);' : ''}
        ${type==='blizzard'||type==='freezing-rain' ? 'filter:drop-shadow(0 0 12px rgba(150,220,255,0.80));' : ''}
        ${type==='storm-night'   ? 'text-shadow:0 0 18px rgba(160,200,255,0.60);' : ''} }
      .feels-row  { font-size:12px; font-weight:500; color:rgba(255,255,255,.30); margin-top:6px; letter-spacing:.01em; }
      .trend-row  { font-size:11px; font-weight:600; color:${trendCol}; margin-top:3px; letter-spacing:.01em; }
      .icon-wrap  { width:52px; height:52px; display:flex; align-items:center; justify-content:center; opacity:.88; margin-top:2px; }

      .footer { display:flex; align-items:center; justify-content:center;
                padding-top:8px; border-top:1px solid rgba(255,255,255,0.07); flex-wrap:wrap; gap:2px; }
      .stat-chip { font-size:11px; font-weight:500; color:rgba(255,255,255,.38); white-space:nowrap; }
      .stat-sep  { color:rgba(255,255,255,.13); font-size:10px; margin:0 5px; }

      .bat-warn { position:absolute; bottom:10px; right:14px; font-size:10px;
                  font-weight:600; color:#FF9F0A; z-index:10; letter-spacing:.01em; }

      /* ── banners ────────────────────────────────────────────────────────── */
      .banner {
        margin-left:-18px; margin-right:-18px; margin-bottom:-16px;
        border-radius:0 0 24px 24px; position:relative; overflow:hidden;
      }
      .banner.today    { padding:12px 18px 16px; margin-top:10px; }
      .banner.tomorrow { padding:11px 18px 14px; margin-top:10px; }
      .banner.urgent   { padding:10px 18px 13px; margin-top:10px; }
      .banner.normal   { padding:10px 18px 12px; margin-top:11px; border-top:1px solid rgba(255,255,255,.07); }
      .banner-bg     { position:absolute; inset:0; animation:breathe 1.2s ease-in-out infinite; }
      .banner-inner  { position:relative; z-index:1; display:flex; align-items:center; gap:10px; }
      .banner-text   { flex:1; min-width:0; }
      .banner-icon   { width:34px; height:34px; border-radius:50%; flex-shrink:0;
                       display:flex; align-items:center; justify-content:center; position:relative; }
      .banner-icon.sm { width:28px; height:28px; }
      .banner-pill   { font-size:12px; font-weight:600; padding:4px 10px;
                       border-radius:10px; white-space:nowrap; flex-shrink:0; }
      .icon-ring     { position:absolute; inset:-4px; border-radius:50%; border:2px solid;
                       animation:ring-pulse 1.2s ease-in-out infinite; }
      .pulse         { animation:breathe 1.2s ease-in-out infinite; }
      .pulse-slow    { animation:breathe-slow 1.8s ease-in-out infinite; }
    `;

    this.shadowRoot.innerHTML = `
      <style>${css}</style>
      <div class="card">
        ${particles.bgClouds}
        ${particles.stars}
        ${particles.auroraFx}
        ${extras.godRays}
        ${extras.heatHaze}
        ${extras.mirageStrip}
        ${extras.iceCornerGlow}
        ${extras.moonGlow}
        ${extras.horizonGlow}
        ${extras.lightning}
        ${particles.drops}
        ${particles.ripples}
        ${particles.snowFlakes}
        ${particles.fogStripes}
        ${batWarn}
        <div class="content">
          <div class="header">
            <span class="station">${stationLabel}</span>
            <div class="header-right">
              ${pillHtml}
              <span class="time-label">${time}</span>
            </div>
          </div>
          <div class="middle">
            <div class="temp-block">
              <div class="temp-val">${tempStr}°</div>
              ${feelsNum!==null && temp!==null && Math.abs(feelsNum-temp)>=1
                ? `<div class="feels-row">Odcz. ${feels}°</div>` : ''}
              ${trendStr ? `<div class="trend-row">${trendStr}</div>` : ''}
            </div>
            <div class="icon-wrap">${animIcon}</div>
          </div>
          <div class="footer">${compactStats}</div>
          ${fertilBanners}
        </div>
      </div>`;

    // Attach fertil done/undo buttons (must be after innerHTML set)
    this.shadowRoot.querySelectorAll('.fertil-done-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const f = this._fertilizations.find(x => x.date === btn.dataset.fertilDate);
        if (f) this._setFertilDone(f, true);
      });
    });
    this.shadowRoot.querySelectorAll('.fertil-undo-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const f = this._fertilizations.find(x => x.date === btn.dataset.fertilDate);
        if (f) this._setFertilDone(f, false);
      });
    });
  }

  getCardSize() { return 4; }

  static getConfigElement() {
    return document.createElement('div');
  }

  static getStubConfig() {
    return {
      entity:           'weather.forecast_home',
      temp_entity:      'sensor.stacja_pogodowa_outdoor_temperature',
      feels_entity:     'sensor.stacja_pogodowa_feels_like_temperature',
      humidity_entity:  'sensor.stacja_pogodowa_humidity',
      pressure_entity:  'sensor.stacja_pogodowa_relative_pressure',
      wind_entity:      'sensor.stacja_pogodowa_wind_speed',
      gust_entity:      'sensor.stacja_pogodowa_wind_gust',
      wind_dir_entity:  'sensor.stacja_pogodowa_wind_direction',
      rain_rate_entity: 'sensor.stacja_pogodowa_rain_rate_piezo',
      rain_day_entity:  'sensor.stacja_pogodowa_daily_rain_piezo',
      uv_entity:        'sensor.stacja_pogodowa_uv_index',
      battery_entity:   'sensor.stacja_pogodowa_wh90_battery',
      forecast_entity:  'sensor.forecast_hourly_json',
      station_label:    'Ogród · Stacja główna',
      fertilizations:   [
        { date: '2026-05-20', name: 'Nawóz wiosenny', description: 'Florovit Trawnik, 30g/m²' },
        { date: '2026-07-01', name: 'Nawóz letni',    description: 'N-P-K 12-6-18, 25g/m²' },
      ],
    };
  }
}

customElements.define('aha-weather-card', AhaWeatherCard);
// legacy alias
if (!customElements.get('weather-card')) {
  customElements.define('weather-card', class extends AhaWeatherCard {});
}
/**
 * aha-input-boolean-card.js
 *
 * Kafelek dla input_boolean — ikona góra-lewo, toggle góra-prawo (iOS pill),
 * nazwa + status na dole. Nazwa i ikona z atrybutów encji HA.
 *
 * Config (jeden kafelek):
 *   entity: input_boolean.xxx
 *   color:  "#30B0FF"   (optional, default niebieski)
 *   name:   "override"  (optional)
 *   icon:   "mdi:xxx"   (optional)
 *
 * Config (wiele kafelków w gridzie 2 kolumny):
 *   entities:
 *     - entity: input_boolean.xxx
 *       color: "#34C759"
 *     - entity: input_boolean.yyy
 */

const IB_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :host { display: block; position: relative; }

  .ib-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .ib-tile {
    background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
    border-radius: 16px;
    border: 0.5px solid rgba(255,255,255,0.08);
    padding: 14px;
    display: flex;
    flex-direction: column;
    min-height: 110px;
    cursor: pointer;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    transition: transform 0.15s ease, border-color 0.35s ease, background 0.35s ease;
  }
  .ib-tile:active { transform: scale(0.96); }
  .ib-tile.on {
    border-color: var(--c-border);
    background: var(--c-bg);
  }

  /* ── Górny rząd: ikona + toggle ── */
  .ib-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .ib-icon {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: rgba(255,255,255,0.07);
    transition: background 0.35s ease;
  }
  .ib-tile.on .ib-icon { background: var(--c-icon-bg); }

  ha-icon {
    --mdc-icon-size: 19px;
    color: rgba(255,255,255,0.28);
    transition: color 0.35s ease;
  }
  .ib-tile.on ha-icon { color: var(--c); }

  /* ── iOS pill toggle ── */
  .ib-toggle {
    width: 44px;
    height: 26px;
    border-radius: 13px;
    background: rgba(255,255,255,0.12);
    border: none;
    position: relative;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    transition: background 0.25s ease, box-shadow 0.25s ease;
  }
  .ib-tile.on .ib-toggle {
    background: #34C759;
    box-shadow: 0 0 10px rgba(52,199,89,0.40);
  }
  .ib-dot {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255,255,255,0.50);
    box-shadow: 0 1px 3px rgba(0,0,0,0.25);
    transition: transform 0.25s ease, background 0.25s ease;
  }
  .ib-tile.on .ib-dot {
    transform: translateX(18px);
    background: #fff;
  }

  /* ── Dół: nazwa + status ── */
  .ib-bottom { margin-top: auto; padding-top: 10px; }

  .ib-name {
    font-size: 13px;
    font-weight: 700;
    color: rgba(255,255,255,0.38);
    line-height: 1.25;
    word-break: break-word;
    transition: color 0.35s ease;
  }
  .ib-tile.on .ib-name { color: rgba(255,255,255,0.92); }
  .ib-status {
    font-size: 11px;
    font-weight: 400;
    color: rgba(255,255,255,0.35);
    margin-top: 3px;
    transition: color 0.3s ease;
  }
  .ib-tile.on .ib-status { color: var(--c-status); }

  /* ── Overlay potwierdzenia (otwarte czujniki) ── */
  @keyframes ib-fade-in { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }

  .ib-confirm-overlay {
    position: absolute; inset: 0; z-index: 100;
    background: rgba(0,0,0,0.72);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(6px);
    animation: ib-fade-in 0.15s ease;
  }
  .ib-confirm-modal {
    background: linear-gradient(150deg, #0f1c2e 0%, #0b1420 100%);
    border: 1px solid rgba(255,200,50,0.28);
    border-radius: 14px;
    padding: 15px 16px 14px;
    width: calc(100% - 20px);
    font-family: -apple-system, system-ui, sans-serif;
    box-shadow: 0 0 20px rgba(255,180,0,0.12);
  }
  .ib-confirm-title {
    font-size: 12px; font-weight: 700; letter-spacing: .01em;
    color: rgba(255,205,55,0.95);
    margin-bottom: 9px;
    display: flex; align-items: center; gap: 6px;
  }
  .ib-confirm-sensor {
    font-size: 11px; line-height: 1.6;
    color: rgba(255,255,255,0.55);
    padding-left: 4px;
    display: flex; align-items: center; gap: 5px;
  }
  .ib-confirm-sensor::before { content: "·"; color: rgba(255,205,55,0.55); font-size: 14px; }
  .ib-confirm-list { margin-bottom: 13px; }
  .ib-confirm-btns { display: flex; gap: 8px; }
  .ib-confirm-cancel {
    flex: 1; padding: 8px 0; border-radius: 10px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
    color: rgba(255,255,255,0.45);
    font-size: 12px; font-weight: 600;
    cursor: pointer; font-family: inherit;
    transition: background .15s;
  }
  .ib-confirm-cancel:active { background: rgba(255,255,255,0.11); }
  .ib-confirm-ok {
    flex: 1; padding: 8px 0; border-radius: 10px;
    background: rgba(255,205,55,0.14);
    border: 1px solid rgba(255,205,55,0.35);
    color: rgba(255,210,60,0.95);
    font-size: 12px; font-weight: 700;
    cursor: pointer; font-family: inherit;
    transition: background .15s;
  }
  .ib-confirm-ok:active { background: rgba(255,205,55,0.24); }
`;

class AhaInputBooleanCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._prevStates = {};
  }

  setConfig(config) {
    if (!config.entity && !config.entities) throw new Error('Wymagane: entity lub entities');
    this._config = config;
    this._items = config.entities
      ? config.entities.map(e => (typeof e === 'string' ? { entity: e } : e))
      : [{ entity: config.entity, color: config.color, name: config.name, icon: config.icon }];
  }

  set hass(hass) {
    this._hass = hass;
    const changed = this._items.some(item => {
      const s = hass.states[item.entity];
      return s && s.state !== this._prevStates[item.entity];
    });
    if (changed || !this.shadowRoot.querySelector('.ib-tile')) {
      this._items.forEach(item => {
        const s = hass.states[item.entity];
        if (s) this._prevStates[item.entity] = s.state;
      });
      this._render();
    }
  }

  _hexToRgb(hex) {
    const h = (hex || '#30B0FF').replace('#', '');
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  }

  _buildTile(item) {
    const stateObj = this._hass.states[item.entity];
    if (!stateObj) return null;

    const isOn = stateObj.state === 'on';
    const name = item.name || stateObj.attributes.friendly_name || item.entity;
    const icon = item.icon || stateObj.attributes.icon || 'mdi:toggle-switch';
    const color = item.color || this._config.color || '#30B0FF';
    const [r, g, b] = this._hexToRgb(color);

    const tile = document.createElement('div');
    tile.className = `ib-tile${isOn ? ' on' : ''}`;
    tile.style.cssText = `
      --c: rgb(${r},${g},${b});
      --c-border: rgba(${r},${g},${b},0.30);
      --c-bg: rgba(${r},${g},${b},0.07);
      --c-icon-bg: rgba(${r},${g},${b},0.22);
      --c-status: rgba(${r},${g},${b},0.85);
    `;

    // status_entities: count how many sub-devices are actually on
    let statusText = isOn ? 'Włączony' : 'Wyłączony';
    const subEntities = item.status_entities || [];
    if (subEntities.length > 0) {
      const activeCount = subEntities.filter(id => this._hass.states[id]?.state === 'on').length;
      if (isOn || activeCount > 0) {
        statusText = `${activeCount}/${subEntities.length} aktywne`;
      }
    }

    tile.innerHTML = `
      <div class="ib-top">
        <div class="ib-icon">
          <ha-icon icon="${icon}"></ha-icon>
        </div>
        <button class="ib-toggle" aria-label="Toggle ${name}">
          <span class="ib-dot"></span>
        </button>
      </div>
      <div class="ib-bottom">
        <div class="ib-name">${name}</div>
        <div class="ib-status">${statusText}</div>
      </div>
    `;

    tile.querySelector('.ib-toggle').addEventListener('click', e => {
      e.stopPropagation();
      this._toggle(item.entity, item);
    });
    tile.addEventListener('click', () => this._toggle(item.entity, item));

    return tile;
  }

  _render() {
    if (!this._hass) return;

    const isSingle = this._items.length === 1;
    this.shadowRoot.innerHTML = `<style>${IB_STYLES}</style>`;

    if (isSingle) {
      const tile = this._buildTile(this._items[0]);
      if (tile) this.shadowRoot.appendChild(tile);
    } else {
      const grid = document.createElement('div');
      grid.className = 'ib-grid';
      this._items.forEach(item => {
        const tile = this._buildTile(item);
        if (tile) grid.appendChild(tile);
      });
      this.shadowRoot.appendChild(grid);
    }
  }

  _getOpenSensors(item) {
    // item-level config ma pierwszeństwo nad card-level
    const cfg = {
      confirm_sensors:       item.confirm_sensors       ?? this._config.confirm_sensors,
      confirm_sensor_class:  item.confirm_sensor_class  ?? this._config.confirm_sensor_class,
    };
    const st = this._hass.states;
    if (cfg.confirm_sensors && cfg.confirm_sensors.length) {
      return cfg.confirm_sensors
        .map(id => st[id])
        .filter(s => s && s.state === 'on')
        .map(s => s.attributes.friendly_name || s.entity_id);
    }
    const classes = cfg.confirm_sensor_class;
    if (!classes || !classes.length) return [];
    return Object.values(st)
      .filter(s => s.entity_id.startsWith('binary_sensor.')
                && classes.includes(s.attributes.device_class)
                && s.state === 'on')
      .map(s => s.attributes.friendly_name || s.entity_id);
  }

  _toggle(entityId, item) {
    const stateObj = this._hass.states[entityId];
    const isOn     = stateObj && stateObj.state === 'on';
    // Potwierdzenie tylko przy włączaniu (ON), nie przy wyłączaniu
    if (!isOn) {
      const open = this._getOpenSensors(item || {});
      if (open.length > 0) { this._showConfirm(entityId, open); return; }
    }
    this._hass.callService('input_boolean', 'toggle', { entity_id: entityId });
  }

  _showConfirm(entityId, openSensors) {
    const existing = this.shadowRoot.querySelector('.ib-confirm-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'ib-confirm-overlay';
    overlay.innerHTML = `
      <div class="ib-confirm-modal">
        <div class="ib-confirm-title">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M8 2.5L13.5 13H2.5L8 2.5Z" stroke="rgba(255,205,55,0.90)" stroke-width="1.5" stroke-linejoin="round" fill="rgba(255,205,55,0.10)"/>
            <line x1="8" y1="7" x2="8" y2="10.2" stroke="rgba(255,205,55,0.90)" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="8" cy="12" r="0.75" fill="rgba(255,205,55,0.90)"/>
          </svg>
          Otwarte czujniki (${openSensors.length})
        </div>
        <div class="ib-confirm-list">
          ${openSensors.map(n => `<div class="ib-confirm-sensor">${n}</div>`).join('')}
        </div>
        <div class="ib-confirm-btns">
          <button class="ib-confirm-cancel">Anuluj</button>
          <button class="ib-confirm-ok">Włącz mimo to</button>
        </div>
      </div>`;

    overlay.querySelector('.ib-confirm-cancel').addEventListener('click', e => {
      e.stopPropagation(); overlay.remove();
    });
    overlay.querySelector('.ib-confirm-ok').addEventListener('click', e => {
      e.stopPropagation(); overlay.remove();
      this._hass.callService('input_boolean', 'turn_on', { entity_id: entityId });
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    this.shadowRoot.appendChild(overlay);
  }

  getCardSize() {
    const rows = Math.ceil((this._items ? this._items.length : 1) / 2);
    return rows * 2;
  }

  static getStubConfig() {
    return { entity: 'input_boolean.example' };
  }
}

customElements.define('aha-input-boolean-card', AhaInputBooleanCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'aha-input-boolean-card',
  name: 'AHA Input Boolean Card',
  description: 'Toggle tile card for input_boolean entities',
});
/**
 * aha-ac-slim-card.js — AHA Climate / AC Slim Card
 *
 * Layout: 4px color-bar | ikona + nazwa + badge + chipy + progress | temp w pokoju
 * Stany:  heating (#EF9F27) · cooling (#85B7EB) · fan (#B4B2A9) · dry (#C97A50) · off (muted)
 * Animacje: pulsujący box-shadow gdy aktywne, migający dot w badge, ikona animowana
 *
 * Config:
 *   entity: climate.xxx          (wymagane)
 *   name:   "override"           (opcjonalne)
 */

const AC_COLORS = {
  heating:  { main: '#EF9F27', r: 239, g: 159, b: 39  },
  cooling:  { main: '#85B7EB', r: 133, g: 183, b: 235 },
  fan:      { main: '#B4B2A9', r: 180, g: 178, b: 169 },
  drying:   { main: '#C97A50', r: 201, g: 122, b: 80  },
  idle:     { main: '#5F5E5A', r: 95,  g: 94,  b: 90  },
  off:      { main: '#3D3D3B', r: 61,  g: 61,  b: 59  },
};

const AC_MODE_LABELS = {
  heat:     { label: 'grzanie',    col: '#EF9F27', bg: 'rgba(239,159,39,0.12)'  },
  cool:     { label: 'chłodzenie', col: '#85B7EB', bg: 'rgba(133,183,235,0.12)' },
  fan_only: { label: 'wentylator', col: '#B4B2A9', bg: 'rgba(180,178,169,0.12)' },
  dry:      { label: 'osuszanie',  col: '#C97A50', bg: 'rgba(201,122,80,0.12)'  },
  auto:     { label: 'auto',       col: '#97C459', bg: 'rgba(151,196,89,0.12)'  },
  off:      { label: 'wyłączone',  col: '#5F5E5A', bg: 'rgba(95,94,90,0.12)'   },
};

const AC_FAN_LABELS = {
  auto:   { label: 'auto',    col: '#97C459', bg: 'rgba(151,196,89,0.10)'  },
  low:    { label: 'cicho',   col: '#7BAED4', bg: 'rgba(123,174,212,0.10)' },
  medium: { label: 'średnio', col: '#85B7EB', bg: 'rgba(133,183,235,0.10)' },
  high:   { label: 'mocno',   col: '#EF9F27', bg: 'rgba(239,159,39,0.10)'  },
};

/* ── SVG icons ── */
const AC_SVG = {
  idle: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7" stroke="#3D3D3B" stroke-width="1.4"/>
    <path d="M10 6v4l3 2" stroke="#3D3D3B" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`,

  heating: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="ac-icon-heat">
    <path d="M10 3 Q8 7 8 10 Q8 13 10 16 Q12 13 12 10 Q12 7 10 3Z"
          stroke="#EF9F27" stroke-width="1.3" fill="rgba(239,159,39,0.18)"/>
    <path d="M10 7 Q8.5 9 8.5 11 Q8.5 13 10 14.5 Q11.5 13 11.5 11 Q11.5 9 10 7Z"
          fill="rgba(239,159,39,0.3)"/>
  </svg>`,

  cooling: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="ac-icon-snow">
    <line x1="10" y1="3"  x2="10" y2="17" stroke="#85B7EB" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="3"  y1="10" x2="17" y2="10" stroke="#85B7EB" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="5"  y1="5"  x2="15" y2="15" stroke="#85B7EB" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="15" y1="5"  x2="5"  y2="15" stroke="#85B7EB" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`,

  fan: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="ac-icon-fan">
    <circle cx="10" cy="10" r="2" fill="#B4B2A9"/>
    <path d="M10 2 Q8 6 10 8"  stroke="#B4B2A9" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M18 10 Q14 8 12 10" stroke="#B4B2A9" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M10 18 Q12 14 10 12" stroke="#B4B2A9" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M2 10 Q6 12 8 10"  stroke="#B4B2A9" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  drying: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M6 12 Q6 8 10 4 Q14 8 14 12 Q14 15 10 15 Q6 15 6 12Z"
          stroke="#C97A50" stroke-width="1.2" fill="none"/>
    <circle cx="10" cy="12" r="2" fill="rgba(201,122,80,0.3)"/>
  </svg>`,
};

/* ── Styles ── */
const AC_STYLES = `
  :host { display: block; width: 100%; }

  @keyframes ac-pulse-heat {
    0%,100% { box-shadow: 0 0 0 0   rgba(239,159,39,0); }
    50%     { box-shadow: 0 0 0 5px rgba(239,159,39,0.18); }
  }
  @keyframes ac-pulse-cool {
    0%,100% { box-shadow: 0 0 0 0   rgba(133,183,235,0); }
    50%     { box-shadow: 0 0 0 5px rgba(133,183,235,0.18); }
  }
  @keyframes ac-pulse-fan {
    0%,100% { box-shadow: 0 0 0 0   rgba(180,178,169,0); }
    50%     { box-shadow: 0 0 0 5px rgba(180,178,169,0.14); }
  }
  @keyframes ac-pulse-dry {
    0%,100% { box-shadow: 0 0 0 0   rgba(201,122,80,0); }
    50%     { box-shadow: 0 0 0 5px rgba(201,122,80,0.18); }
  }
  @keyframes ac-dot  { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes ac-heat { 0%,100%{transform:scaleY(1) translateY(0);opacity:1} 50%{transform:scaleY(0.95) translateY(-1px);opacity:0.85} }
  @keyframes ac-snow { to{transform:rotate(360deg)} }
  @keyframes ac-fan  { to{transform:rotate(360deg)} }

  .card {
    display: grid;
    grid-template-columns: 4px 1fr auto;
    gap: 0 14px;
    align-items: stretch;
    padding: 14px 16px;
    background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
    border-radius: 16px;
    border: 0.5px solid rgba(255,255,255,0.08);
    cursor: pointer;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    transition: transform 0.15s ease, border-color 0.4s ease, background 0.4s ease;
    box-sizing: border-box;
  }
  .card:active { transform: scale(0.97); }

  .card.heating {
    border-color: rgba(239,159,39,0.30);
    animation: ac-pulse-heat 2.4s ease-in-out infinite;
  }
  .card.cooling {
    border-color: rgba(133,183,235,0.30);
    animation: ac-pulse-cool 2.4s ease-in-out infinite;
  }
  .card.fan {
    border-color: rgba(180,178,169,0.22);
    animation: ac-pulse-fan 2.8s ease-in-out infinite;
  }
  .card.drying {
    border-color: rgba(201,122,80,0.30);
    animation: ac-pulse-dry 2.4s ease-in-out infinite;
  }

  /* ── Color bar ── */
  .bar {
    border-radius: 99px;
    align-self: stretch;
    transition: background 0.4s ease;
  }

  /* ── Body ── */
  .body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  /* ── Top row: icon + name + badge ── */
  .top {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .icon { flex-shrink: 0; display: flex; align-items: center; }
  .ac-icon-heat { animation: ac-heat 1.5s ease-in-out infinite; }
  .ac-icon-snow { animation: ac-snow 3s linear infinite; }
  .ac-icon-fan  { animation: ac-fan 2s linear infinite; }

  .name {
    font-size: 13px;
    font-weight: 500;
    color: #F1EFE8;
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Badge ── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 99px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background 0.4s ease, color 0.4s ease;
  }
  .badge-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .badge-dot.blink { animation: ac-dot 1.8s ease-in-out infinite; }

  /* ── Chips ── */
  .chips {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .chip {
    font-size: 11px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 6px;
    white-space: nowrap;
  }

  /* ── Progress bar ── */
  .progress-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .progress-track {
    height: 3px;
    border-radius: 99px;
    background: rgba(255,255,255,0.07);
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 1s ease;
  }
  .progress-labels {
    display: flex;
    justify-content: space-between;
  }
  .progress-labels span {
    font-size: 10px;
    color: rgba(255,255,255,0.28);
  }

  /* ── Right column ── */
  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 2px;
    min-width: 52px;
  }
  .temp-val {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.5px;
    line-height: 1;
    transition: color 0.4s ease;
  }
  .temp-label {
    font-size: 10px;
    color: rgba(255,255,255,0.28);
  }
`;

class AhaAcSlimCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built = false;
  }

  setConfig(config) {
    if (!config.entity) throw new Error('aha-ac-slim-card: wymagane pole "entity"');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) { this._build(); this._built = true; }
    this._update();
  }

  _build() {
    const shadow = this.shadowRoot;

    const style = document.createElement('style');
    style.textContent = AC_STYLES;
    shadow.appendChild(style);

    shadow.innerHTML += `
      <div class="card" id="card">
        <div class="bar" id="bar"></div>
        <div class="body">
          <div class="top">
            <div class="icon" id="icon"></div>
            <div class="name" id="name">—</div>
            <div class="badge" id="badge">
              <span class="badge-dot" id="dot"></span>
              <span id="badge-label">—</span>
            </div>
          </div>
          <div class="chips" id="chips"></div>
          <div class="progress-wrap" id="progress" style="display:none;">
            <div class="progress-track">
              <div class="progress-fill" id="progress-fill"></div>
            </div>
            <div class="progress-labels">
              <span id="progress-desc"></span>
              <span id="progress-pct"></span>
            </div>
          </div>
        </div>
        <div class="right">
          <div class="temp-val" id="temp">—°</div>
          <div class="temp-label">w pokoju</div>
        </div>
      </div>
    `;

    shadow.querySelector('#card').addEventListener('click', () => this._moreInfo());

    this._card       = shadow.querySelector('#card');
    this._bar        = shadow.querySelector('#bar');
    this._icon       = shadow.querySelector('#icon');
    this._name       = shadow.querySelector('#name');
    this._badge      = shadow.querySelector('#badge');
    this._dot        = shadow.querySelector('#dot');
    this._badgeLabel = shadow.querySelector('#badge-label');
    this._chips      = shadow.querySelector('#chips');
    this._progress   = shadow.querySelector('#progress');
    this._pFill      = shadow.querySelector('#progress-fill');
    this._pDesc      = shadow.querySelector('#progress-desc');
    this._pPct       = shadow.querySelector('#progress-pct');
    this._temp       = shadow.querySelector('#temp');
    this._built      = true;
  }

  _update() {
    if (!this._hass || !this._config || !this._built) return;
    const stateObj = this._hass.states[this._config.entity];
    if (!stateObj) return;

    const mode   = stateObj.state || 'off';
    const action = stateObj.attributes.hvac_action || mode;
    const currentTemp = stateObj.attributes.current_temperature ?? null;
    const targetTemp  = stateObj.attributes.temperature ?? null;
    const fanMode     = (stateObj.attributes.fan_mode || 'auto').toLowerCase();
    const name = this._config.name || stateObj.attributes.friendly_name || this._config.entity;

    /* ── classify state ──
     * hvac_action: heating | cooling | fan | idle | off
     * hvac_mode (state): heat | cool | fan_only | dry | auto | off
     *
     * Gdy action === 'idle': klimatyzacja JEST włączona, osiągnęła cel i czeka.
     * Nadal pulsuje i świeci w kolorze trybu — użytkownik powinien wiedzieć że jest ON.
     */
    const isHeating   = action === 'heating';
    const isCooling   = action === 'cooling';
    const isFan       = action === 'fan' || mode === 'fan_only';
    const isDrying    = mode === 'dry';
    const isOff       = mode === 'off';
    const isOn        = !isOff && mode !== 'unavailable';
    // idle: włączona ale osiągnęła cel — kolorujemy wg trybu
    const isIdleOn    = isOn && !isHeating && !isCooling && !isFan && !isDrying;
    const isActively  = isHeating || isCooling || isFan || isDrying; // faktycznie pracuje

    // Kolor wyznaczamy wg action, a gdy idle — wg mode
    const stateKey = isHeating      ? 'heating'
                   : isCooling      ? 'cooling'
                   : isFan          ? 'fan'
                   : isDrying       ? 'drying'
                   : isIdleOn && mode === 'cool' ? 'cooling'
                   : isIdleOn && mode === 'heat' ? 'heating'
                   : isIdleOn && mode === 'fan_only' ? 'fan'
                   : isOff          ? 'off' : 'idle';

    const col = AC_COLORS[stateKey];

    /* ── card class — pulsuje gdy AC jest ON ── */
    this._card.className = `card ${isOn ? stateKey : ''}`;

    /* ── color bar ── */
    this._bar.style.background = col.main;

    /* ── icon — gdy idle używa ikony wg trybu ── */
    const iconKey = isHeating                          ? 'heating'
                  : isCooling                          ? 'cooling'
                  : isFan                              ? 'fan'
                  : isDrying                           ? 'drying'
                  : (isIdleOn && mode === 'cool')      ? 'cooling'
                  : (isIdleOn && mode === 'heat')      ? 'heating'
                  : (isIdleOn && mode === 'fan_only')  ? 'fan'
                  : 'idle';
    this._icon.innerHTML = AC_SVG[iconKey] ?? AC_SVG.idle;

    /* ── name ── */
    this._name.textContent = name;

    /* ── badge ── */
    const badgeLabel = isHeating  ? 'grzeje'
                     : isCooling  ? 'chłodzi'
                     : isFan      ? 'wentyluje'
                     : isDrying   ? 'osusza'
                     : isIdleOn   ? 'włączona'
                     : 'wyłączona';

    const badgeBg = isOn
      ? `rgba(${col.r},${col.g},${col.b},0.14)`
      : 'rgba(95,94,90,0.12)';

    this._badge.style.background = badgeBg;
    this._badge.style.color      = isOn ? col.main : '#5F5E5A';
    this._dot.style.background   = isOn ? col.main : '#5F5E5A';
    this._dot.className          = `badge-dot${isOn ? ' blink' : ''}`;
    this._badgeLabel.textContent = badgeLabel;

    /* ── chips ── */
    const modeInfo = AC_MODE_LABELS[mode] ?? AC_MODE_LABELS.off;
    const fanInfo  = AC_FAN_LABELS[fanMode] ?? { label: fanMode, col: '#888780', bg: 'rgba(136,135,128,0.10)' };

    let chipsHtml = `<span class="chip" style="background:${modeInfo.bg};color:${modeInfo.col};">${modeInfo.label}</span>`;

    if (!isOff) {
      chipsHtml += `<span class="chip" style="background:${fanInfo.bg};color:${fanInfo.col};">${fanInfo.label}</span>`;
    }
    if (!isOff && targetTemp !== null) {
      chipsHtml += `<span class="chip" style="background:rgba(151,196,89,0.10);color:#97C459;">▶ ${targetTemp}°C</span>`;
    }
    this._chips.innerHTML = chipsHtml;

    /* ── progress bar — show when heating/cooling (active or idle) ── */
    const showProgress = isOn && (isHeating || isCooling || isIdleOn)
                      && (mode === 'heat' || mode === 'cool')
                      && currentTemp !== null && targetTemp !== null;
    if (showProgress) {
      const diff = Math.abs(targetTemp - currentTemp);
      let pct, desc;
      if (diff < 0.5 || isIdleOn) {
        pct  = 100;
        desc = 'temperatura osiągnięta';
      } else {
        const range = 10;
        pct  = Math.min(100, Math.max(0, Math.round(((range - diff) / range) * 100)));
        desc = (mode === 'heat') ? `dogrzewa +${diff.toFixed(1)}°C` : `schładza −${diff.toFixed(1)}°C`;
      }
      const grad = (mode === 'heat') ? 'linear-gradient(90deg,#9A5230,#EF9F27)'
                                     : 'linear-gradient(90deg,#185FA5,#85B7EB)';
      this._pFill.style.width      = `${pct}%`;
      this._pFill.style.background = grad;
      this._pDesc.textContent      = desc;
      this._pPct.textContent       = `${pct}%`;
      this._progress.style.display = '';
    } else {
      this._progress.style.display = 'none';
    }

    /* ── right: current temp ── */
    const tempCol = isHeating ? '#EF9F27' : isCooling ? '#85B7EB' : '#5F5E5A';
    this._temp.textContent  = currentTemp !== null ? `${currentTemp.toFixed(1)}°` : '—°';
    this._temp.style.color  = tempCol;
  }

  _moreInfo() {
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true, composed: true,
      detail: { entityId: this._config.entity },
    }));
  }

  getCardSize() { return 2; }

  static getStubConfig() {
    return { entity: 'climate.example' };
  }
}

customElements.define('aha-ac-slim-card', AhaAcSlimCard);
if (!customElements.get('ac-slim-card'))
  customElements.define('ac-slim-card', class extends AhaAcSlimCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-ac-slim-card',
  name:        'AHA AC Slim Card',
  description: 'Slim card dla klimatyzacji — grzanie/chłodzenie z animowanym pulse, progress bar, chipy trybu i wentylatora.',
  preview:     true,
});
/**
 * aha-moon-card.js  v1.0
 * Karta fazy Księżyca — tryby: slim (kompaktowa) i full (rozbudowana).
 *
 * Config:
 *   slim: false   (optional) — tryb kompaktowy
 */

class AhaMoonCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._interval = null;
  }

  setConfig(config) {
    this._config = {
      slim: config.slim ?? false,
    };
  }

  connectedCallback() {
    this._render();
    // Odśwież co minutę (faza zmienia się powoli, ale data/godzina musi być aktualna)
    this._interval = setInterval(() => this._render(), 60000);
  }

  disconnectedCallback() {
    clearInterval(this._interval);
  }

  // set hass() wywołuje HA przy każdej zmianie stanu — nie potrzebujemy encji,
  // ale musimy zaimplementować setter żeby karta się załadowała
  set hass(_hass) {
    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }
  }

  // ─── Obliczenia fazy ──────────────────────────────────────────
  _calcPhase() {
    const SYNODIC   = 29.53058867;
    const KNOWN_NEW = new Date('2000-01-06T18:14:00Z').getTime();
    const now       = new Date();
    const elapsed   = (now.getTime() - KNOWN_NEW) / 86400000;
    const phase     = ((elapsed % SYNODIC) + SYNODIC) % SYNODIC / SYNODIC;
    const illum     = Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);
    const age       = (phase * SYNODIC).toFixed(1);
    const toFull    = phase <= 0.5 ? (0.5 - phase) * SYNODIC : (1.5 - phase) * SYNODIC;
    const toNew     = phase < 0.5  ? phase * SYNODIC          : (1 - phase)   * SYNODIC;
    const showFull  = toFull <= toNew;
    const nextVal   = Math.round((showFull ? toFull : toNew) * 10) / 10;
    const nextLbl   = showFull ? 'do pełni' : 'do nowiu';
    const nextLblCap= showFull ? 'Do pełni' : 'Do nowiu';

    let namePL, nameEN;
    if      (phase < 0.03 || phase > 0.97) { namePL = 'Nów';             nameEN = 'New Moon'; }
    else if (phase < 0.22)                  { namePL = 'Sierp rosnący';   nameEN = 'Waxing Crescent'; }
    else if (phase < 0.28)                  { namePL = 'Pierwsza kwadra'; nameEN = 'First Quarter'; }
    else if (phase < 0.47)                  { namePL = 'Garb rosnący';    nameEN = 'Waxing Gibbous'; }
    else if (phase < 0.53)                  { namePL = 'Pełnia';          nameEN = 'Full Moon'; }
    else if (phase < 0.72)                  { namePL = 'Garb malejący';   nameEN = 'Waning Gibbous'; }
    else if (phase < 0.78)                  { namePL = 'Ostatnia kwadra'; nameEN = 'Last Quarter'; }
    else                                    { namePL = 'Sierp malejący';  nameEN = 'Waning Crescent'; }

    const dateStr = now.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

    return { phase, illum, age, nextVal, nextLbl, nextLblCap, namePL, nameEN, dateStr, now };
  }

  // ─── SVG Księżyca ─────────────────────────────────────────────
  _moonSVG(phase, cx, cy, R, svgSize, maskId, clipId, glowRadii, strokeW) {
    const D = '#0E1625', L = '#CCD8EE';
    const isNew  = phase < 0.015 || phase > 0.985;
    const isFull = Math.abs(phase - 0.5) < 0.015;
    const waxing = phase < 0.5;
    const sw     = waxing ? 1 : 0;
    const k      = Math.cos(phase * 2 * Math.PI);
    const ex     = Math.abs(k) * R;

    const halfPath    = `M${cx} ${cy-R} A${R} ${R} 0 0 ${sw} ${cx} ${cy+R} L${cx} ${cy}Z`;
    const gibbousPath = `M${cx} ${cy-R} A${ex} ${R} 0 0 ${waxing?0:1} ${cx} ${cy+R} L${cx} ${cy}Z`;

    // Maska dla jasnych tekstur
    let maskContent = '';
    if (!isNew && !isFull) {
      if (k > 0) {
        maskContent = `<path d="${halfPath}" fill="white"/>
          <ellipse cx="${cx}" cy="${cy}" rx="${ex}" ry="${R}" fill="black"/>`;
      } else {
        maskContent = `<path d="${halfPath}" fill="white"/>
          <path d="${gibbousPath}" fill="white"/>`;
      }
    } else if (isFull) {
      maskContent = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="white"/>`;
    }

    const maskTag = `<mask id="${maskId}">
      <rect width="${svgSize}" height="${svgSize}" fill="black"/>
      ${maskContent}
    </mask>`;

    // Maria i kratery skalowane do R
    const s = R / 88; // skala względem wersji full (R=88)
    const maria = [
      [cx-18*s, cy-32*s, 22*s, 14*s],
      [cx+20*s, cy- 8*s, 18*s, 11*s],
      [cx- 8*s, cy+22*s, 24*s, 16*s],
      [cx+28*s, cy+30*s, 14*s,  9*s],
      [cx-32*s, cy+ 8*s, 16*s, 10*s],
    ];
    const craters = [
      [cx+38*s, cy-42*s,  7*s],
      [cx-42*s, cy-28*s,  5*s],
      [cx+22*s, cy+48*s,  8*s],
      [cx-20*s, cy+50*s,  6*s],
      [cx+52*s, cy+14*s,  4*s],
      [cx-50*s, cy+32*s,  5*s],
      [cx- 5*s, cy-70*s,  6*s],
      [cx+60*s, cy-22*s,  3*s],
    ];

    const mariaDark  = maria.map(([x,y,rx,ry]) =>
      `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="#060B16" opacity="0.55" transform="rotate(-15,${x.toFixed(1)},${y.toFixed(1)})"/>`).join('');
    const mariaLight = maria.map(([x,y,rx,ry]) =>
      `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="#9CB4D8" opacity="0.28" transform="rotate(-15,${x.toFixed(1)},${y.toFixed(1)})"/>`).join('');
    const craterDark  = craters.map(([x,y,r]) =>
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#06090F" opacity="0.6"/>` +
      `<circle cx="${(x-r*.3).toFixed(1)}" cy="${(y-r*.3).toFixed(1)}" r="${(r*.5).toFixed(1)}" fill="#1A2640" opacity="0.4"/>`).join('');
    const craterLight = craters.map(([x,y,r]) =>
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#A0B8D8" opacity="0.22"/>` +
      `<circle cx="${(x+r*.3).toFixed(1)}" cy="${(y+r*.3).toFixed(1)}" r="${(r*.45).toFixed(1)}" fill="#7898C0" opacity="0.3"/>`).join('');

    // Blask pełni
    const isNearFull    = Math.abs(phase - 0.5) < 0.055;
    const fullIntensity = isNearFull ? 1 - Math.abs(phase - 0.5) / 0.055 : 0;
    const glowSVG = isNearFull
      ? glowRadii.map((gex, i) =>
          `<circle cx="${cx}" cy="${cy}" r="${R+gex}" fill="#7A9FC8" opacity="${((0.18-i*0.05)*fullIntensity).toFixed(3)}"/>`)
        .join('') : '';

    // Oświetlona strona
    let litLayers = '';
    if (!isNew) {
      if (isFull) {
        litLayers = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${L}"/>`;
      } else {
        litLayers = `<path d="${halfPath}" fill="${L}"/>`;
        if (k > 0) litLayers += `<ellipse cx="${cx}" cy="${cy}" rx="${ex}" ry="${R}" fill="${D}"/>`;
        else       litLayers += `<path d="${gibbousPath}" fill="${L}"/>`;
      }
    }

    return `<svg viewBox="0 0 ${svgSize} ${svgSize}" width="${svgSize}" height="${svgSize}">
      <defs>
        <clipPath id="${clipId}"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath>
        ${maskTag}
      </defs>
      ${glowSVG}
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="${D}"/>
      <g clip-path="url(#${clipId})">${mariaDark}${craterDark}</g>
      <g clip-path="url(#${clipId})">${litLayers}</g>
      <g mask="url(#${maskId})">${mariaLight}${craterLight}</g>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="rgba(160,195,240,0.12)" stroke-width="${strokeW}"/>
    </svg>`;
  }

  // ─── Mini księżyc do paska cyklu ──────────────────────────────
  _miniMoonSVG(p, uid) {
    const r = 11, mcx = 14, mcy = 14;
    const mD = '#0E1625', mL = '#C8DCEE';
    const isN = p < 0.015 || p > 0.985;
    const isF = Math.abs(p - 0.5) < 0.015;
    let g = `<circle cx="${mcx}" cy="${mcy}" r="${r}" fill="${mD}"/>`;
    if (!isN) {
      if (isF) {
        g = `<circle cx="${mcx}" cy="${mcy}" r="${r}" fill="${mL}"/>`;
      } else {
        const k2  = Math.cos(p * 2 * Math.PI);
        const ex2 = Math.abs(k2) * r;
        const sw2 = p < 0.5 ? 1 : 0;
        g += `<path d="M${mcx} ${mcy-r} A${r} ${r} 0 0 ${sw2} ${mcx} ${mcy+r} L${mcx} ${mcy}Z" fill="${mL}"/>`;
        if (k2 > 0) g += `<ellipse cx="${mcx}" cy="${mcy}" rx="${ex2}" ry="${r}" fill="${mD}"/>`;
        else        g += `<path d="M${mcx} ${mcy-r} A${ex2} ${r} 0 0 ${p<0.5?0:1} ${mcx} ${mcy+r} L${mcx} ${mcy}Z" fill="${mL}"/>`;
      }
    }
    return `<svg viewBox="0 0 28 28" width="28" height="28">
      <defs><clipPath id="${uid}"><circle cx="${mcx}" cy="${mcy}" r="${r}"/></clipPath></defs>
      <g clip-path="url(#${uid})">${g}</g>
      <circle cx="${mcx}" cy="${mcy}" r="${r}" fill="none" stroke="rgba(150,185,230,0.15)" stroke-width="0.8"/>
    </svg>`;
  }

  // ─── Gwiazdy ──────────────────────────────────────────────────
  _stars(count, minSize, sizeStep, minOp, opStep) {
    let s = '';
    for (let i = 0; i < count; i++) {
      const xr = ((i * 137.508 + 43) % 97 + 2).toFixed(1);
      const yr = ((i * 97.312  + 17) % 91 + 3).toFixed(1);
      const sr = (minSize + (i % (sizeStep * 10)) * (sizeStep / 10)).toFixed(1);
      const op = (minOp + (i % 5) * opStep).toFixed(2);
      s += `<div style="position:absolute;left:${xr}%;top:${yr}%;width:${sr}px;height:${sr}px;border-radius:50%;background:#C8D8F0;opacity:${op};pointer-events:none;"></div>`;
    }
    return s;
  }

  // ─── Pasek postępu fazy ───────────────────────────────────────
  _progressBar(pct) {
    return `<div style="height:16px;display:flex;align-items:center;position:relative;">
      <div style="position:absolute;left:0;right:0;height:2px;background:rgba(255,255,255,.08);border-radius:2px;">
        <div style="width:${pct}%;height:100%;border-radius:2px;background:rgba(180,210,240,.55);"></div>
      </div>
      <div style="position:absolute;left:${pct}%;width:12px;height:12px;background:#C8D8F2;border-radius:50%;transform:translateX(-50%);box-shadow:0 0 8px 2px rgba(180,210,240,.4);"></div>
    </div>`;
  }

  // ─── Render SLIM ──────────────────────────────────────────────
  _renderSlim() {
    const { phase, illum, nextVal, nextLbl, namePL } = this._calcPhase();
    const pct   = (phase * 100).toFixed(1);
    const moon  = this._moonSVG(phase, 80, 80, 64, 160, 'sm-lm', 'sm-cc', [10,7,4], 1);
    const stars = this._stars(28, 0.6, 1.2, 0.06, 0.035);

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .card {
          background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
          border-radius: 26px;
          padding: 16px 14px 14px;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, system-ui, sans-serif;
          color: #fff;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          min-height: 200px;
        }
        .stars { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .row   { position: relative; z-index: 1; width: 100%; }
        .moon-wrap { position: relative; z-index: 1; display: flex; justify-content: center; align-items: center; flex: 1; }
      </style>
      <div class="card">
        <div class="stars">${stars}</div>

        <div class="row" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:13px;font-weight:600;color:rgba(255,255,255,.45);">Księżyc</span>
          <span style="font-size:11px;color:rgba(255,255,255,.2);">${illum}% lit</span>
        </div>

        <div class="moon-wrap">${moon}</div>

        <div class="row" style="text-align:center;margin-top:6px;">
          <div style="font-size:14px;font-weight:700;color:#DCE8FF;letter-spacing:-.3px;margin-bottom:1px;">${namePL}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.28);margin-bottom:10px;">${nextVal} d ${nextLbl}</div>
          ${this._progressBar(pct)}
        </div>
      </div>`;
  }

  // ─── Render FULL ──────────────────────────────────────────────
  _renderFull() {
    const { phase, illum, age, nextVal, nextLblCap, namePL, nameEN, dateStr } = this._calcPhase();
    const pct   = (phase * 100).toFixed(1);
    const moon  = this._moonSVG(phase, 110, 110, 88, 220, 'mc-lm', 'mc-cc', [14,10,6], 1.5);
    const stars = this._stars(38, 0.7, 1.4, 0.07, 0.04);

    const stats = [
      [illum + '%', 'Oświetlenie'],
      [age + ' d',  'Wiek'],
      [nextVal + ' d', nextLblCap],
    ];
    const statsHTML = stats.map(([v, l]) =>
      `<div style="flex:1;background:rgba(255,255,255,.06);border-radius:13px;padding:11px 6px;text-align:center;">
        <div style="font-size:16px;font-weight:700;color:#B0C8F0;letter-spacing:-.3px;">${v}</div>
        <div style="font-size:9px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.06em;margin-top:3px;">${l}</div>
      </div>`).join('');

    const STRIP = [
      {p:0.000, lbl:'Nów'},      {p:0.125, lbl:'Sierp r.'},
      {p:0.250, lbl:'I Kw.'},    {p:0.375, lbl:'Garb r.'},
      {p:0.500, lbl:'Pełnia'},   {p:0.625, lbl:'Garb m.'},
      {p:0.750, lbl:'II Kw.'},   {p:0.875, lbl:'Sierp m.'},
    ];
    const stripHTML = STRIP.map(({p, lbl}, i) => {
      const active = Math.abs(p - phase) < 0.065 || (p === 0 && (phase < 0.04 || phase > 0.96));
      const bg     = active ? 'background:rgba(180,210,255,.1);' : '';
      const lblC   = active ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.22)';
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:5px 2px;border-radius:8px;${bg}">
        ${this._miniMoonSVG(p, `mm${i}`)}
        <span style="font-size:7px;color:${lblC};text-align:center;line-height:1.2;">${lbl}</span>
      </div>`;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .card {
          background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
          border-radius: 26px;
          padding: 22px 18px 18px;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, system-ui, sans-serif;
          color: #fff;
          box-sizing: border-box;
        }
        .stars { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .z1 { position: relative; z-index: 1; }
      </style>
      <div class="card">
        <div class="stars">${stars}</div>

        <div class="z1" style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
          <span style="font-size:13px;font-weight:600;color:rgba(255,255,255,.38);">Faza Księżyca</span>
          <span style="font-size:12px;color:rgba(255,255,255,.22);">${dateStr}</span>
        </div>

        <div class="z1" style="display:flex;justify-content:center;align-items:center;margin:6px 0 14px;">${moon}</div>

        <div class="z1" style="font-size:22px;font-weight:700;letter-spacing:-.5px;text-align:center;color:#DCE8FF;margin-bottom:2px;">${namePL}</div>
        <div class="z1" style="font-size:12px;color:rgba(255,255,255,.28);text-align:center;margin-bottom:18px;">${nameEN}</div>

        <div class="z1" style="display:flex;gap:8px;margin-bottom:18px;">${statsHTML}</div>

        <div class="z1" style="font-size:10px;color:rgba(255,255,255,.25);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;">Cykl księżycowy</div>
        <div class="z1" style="display:flex;margin-bottom:10px;">${stripHTML}</div>

        <div class="z1">${this._progressBar(pct)}</div>
      </div>`;
  }

  _render() {
    if (this._config.slim) this._renderSlim();
    else                   this._renderFull();
  }

  getCardSize() { return this._config.slim ? 3 : 6; }

  static getConfigElement() { return document.createElement('div'); }
  static getStubConfig() { return { slim: false }; }
}

customElements.define('aha-moon-card', AhaMoonCard);

// Legacy alias
if (!customElements.get('moon-card'))
  customElements.define('moon-card', class extends AhaMoonCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-moon-card',
  name:        'Moon Card',
  preview:     false,
  description: 'Faza Księżyca z SVG — tryb slim i full.',
});
class TelecoLightCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._rendered = false;
    this._lastBri  = 0;
  }

  setConfig(config) {
    this._config = config;
    this._entity = config.entity || 'light.teleco_shutters';
    this._name   = config.name   || 'Światło';
    this._room   = config.room   || '';
  }

  set hass(hass) {
    this._hass = hass;
    const state = hass.states[this._entity];
    if (!state) return;
    const on  = state.state === 'on';
    // brightness 0-255 -> 0-100 %
    const briRaw = state.attributes.brightness;
    const bri = on ? Math.round(((briRaw ?? 255) / 255) * 100) : 0;
    if (!this._rendered) { this._render(); this._rendered = true; }
    this._update(bri, on, state.state);
  }

  _svc(service, data = {}) {
    this._hass.callService('light', service, { entity_id: this._entity, ...data });
  }

  _label(bri, st) {
    if (st === 'unavailable') return 'Niedostępne';
    if (bri === 0)  return 'Wyłączone';
    if (bri < 30)   return 'Przyciemnione';
    if (bri < 70)   return 'Średnia jasność';
    if (bri < 100)  return 'Jasno';
    return 'Maksymalna jasność';
  }

  // ── ray glyph: bulb whose rays grow with brightness ──
  _drawBulb(bri, color) {
    const cx = 16, cy = 15;
    const on = bri > 0;
    // ray length scales 0..1
    const t   = Math.max(0, Math.min(1, bri / 100));
    const rInner = 8.5;
    const rOuter = 8.5 + 4.5 * t;
    const rays = [];
    const N = 8;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + Math.cos(a) * rInner;
      const y1 = cy + Math.sin(a) * rInner;
      const x2 = cx + Math.cos(a) * rOuter;
      const y2 = cy + Math.sin(a) * rOuter;
      const op = on ? (0.25 + 0.65 * t).toFixed(2) : '0';
      rays.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="1.7" stroke-linecap="round" opacity="${op}"/>`);
    }
    const coreR = 4.2 + 1.4 * t;
    const coreOp = on ? (0.45 + 0.55 * t).toFixed(2) : '1';
    const coreFill = on ? color : 'none';
    const coreStroke = on ? 'none' : color;
    return `
      ${rays.join('')}
      <circle cx="${cx}" cy="${cy}" r="${coreR.toFixed(1)}" fill="${coreFill}" stroke="${coreStroke}" stroke-width="1.7" opacity="${coreOp}"/>
      ${on ? `<circle cx="${cx}" cy="${cy}" r="${(coreR*0.5).toFixed(1)}" fill="rgba(255,255,255,.55)" opacity="${(0.3+0.5*t).toFixed(2)}"/>` : ''}
    `;
  }

  _bindPress(el, pressedClass) {
    const on  = () => el.classList.add(pressedClass);
    const off = () => el.classList.remove(pressedClass);
    el.addEventListener('pointerdown',   on,  { passive: true });
    el.addEventListener('pointerup',     off, { passive: true });
    el.addEventListener('pointercancel', off, { passive: true });
    el.addEventListener('pointerleave',  off, { passive: true });
  }

  _render() {
    const PRESETS = [0, 33, 66, 100];
    const PRESET_LABELS = ['Wył.', 'Słabo', 'Mocno', 'Max'];

    this.shadowRoot.innerHTML = `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      :host{display:block;font-family:-apple-system,'SF Pro Text','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}

      .glow{ border-radius:18px; transition:box-shadow .5s ease; }
      .glow.on{
        box-shadow:
          0 0 0 1px rgba(255,214,90,.22),
          0 0 18px 2px rgba(255,214,90,.16),
          0 0 40px 6px rgba(255,214,90,.08);
      }

      .card{
        background:linear-gradient(150deg,#0b1120 0%,#0d1828 100%);
        border-radius:18px;
        padding:14px 16px 16px;
        position:relative;
        overflow:hidden;
      }
      .card::before{
        content:'';position:absolute;top:0;left:0;right:0;height:1px;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);
        pointer-events:none;
      }

      .main{display:flex;align-items:center;gap:12px;margin-bottom:10px}

      .iconbox{
        width:48px;height:48px;border-radius:13px;
        display:flex;align-items:center;justify-content:center;flex-shrink:0;
        background:rgba(142,142,147,.07);
        border:.5px solid rgba(142,142,147,.15);
        transition:background .35s,border-color .35s,box-shadow .45s;
      }

      .mid{flex:1;min-width:0}
      .name{
        font-size:13px;font-weight:600;
        color:rgba(255,255,255,.90);
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
      }
      .room{font-size:11px;color:#636366;font-weight:400}
      .status{
        font-size:11px;color:#636366;
        margin-top:3px;min-height:14px;
        transition:color .3s;
      }

      .pct-wrap{flex-shrink:0;text-align:right}
      .pct{
        font-size:28px;font-weight:700;letter-spacing:-1px;
        line-height:1;font-variant-numeric:tabular-nums;
        transition:color .3s;
      }
      .pu{font-size:12px;font-weight:400;color:rgba(255,255,255,.28)}

      .track{
        height:3px;background:rgba(255,255,255,.06);
        border-radius:2px;overflow:hidden;margin-bottom:12px;
      }
      .fill{
        height:100%;border-radius:2px;
        transition:width .45s cubic-bezier(.4,0,.2,1),background .35s;
      }

      .pills{display:flex;gap:5px;margin-bottom:12px}
      .pill{
        flex:1;
        min-height:44px;
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
        border-radius:11px;
        color:rgba(255,255,255,.35);
        background:rgba(255,255,255,.04);
        cursor:pointer;
        border:.5px solid transparent;
        touch-action:manipulation;
        -webkit-tap-highlight-color:transparent;
        user-select:none;
        transition:background .15s,border-color .15s,color .15s;
        appearance:none;-webkit-appearance:none;
        font-family:inherit;padding:0;
      }
      .pill-pct{font-size:11px;font-weight:700;line-height:1}
      .pill-lbl{font-size:9px;font-weight:500;opacity:.7;line-height:1}
      .pill.on{
        background:rgba(255,214,90,.16);
        color:#ffd65a;
        border-color:rgba(255,214,90,.34);
      }
      .pill.pressed{
        background:rgba(255,255,255,.12);
        color:rgba(255,255,255,.80);
        transform:scale(.94);
      }
      .pill.on.pressed{
        background:rgba(255,214,90,.28);
        color:#ffd65a;
      }

      .btns{
        display:flex;gap:6px;
        border-top:.5px solid rgba(255,255,255,.07);
        padding-top:10px;
      }
      .btn{
        flex:1;
        min-height:48px;
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;
        background:rgba(255,255,255,.055);
        border-radius:12px;
        font-size:10px;font-weight:600;
        color:rgba(255,255,255,.50);
        cursor:pointer;
        border:.5px solid rgba(255,255,255,.09);
        touch-action:manipulation;
        -webkit-tap-highlight-color:transparent;
        user-select:none;
        transition:background .12s,color .12s,border-color .12s;
        appearance:none;-webkit-appearance:none;
        font-family:inherit;padding:0;
      }
      .btn.pressed{
        background:rgba(255,255,255,.15);
        color:rgba(255,255,255,.95);
        border-color:rgba(255,255,255,.22);
        transform:scale(.96);
      }
      .btn.off.pressed{
        background:rgba(142,142,147,.22);
        color:rgba(255,255,255,.85);
      }
      .btn.on-act.pressed{
        background:rgba(255,214,90,.22);
        color:#ffd65a;
        border-color:rgba(255,214,90,.34);
      }
      @media(hover:hover){
        .btn:hover{color:rgba(255,255,255,.85);background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.14)}
        .btn.on-act:hover{background:rgba(255,214,90,.12);color:#ffd65a;border-color:rgba(255,214,90,.20)}
        .pill:hover:not(.on){background:rgba(255,255,255,.08);color:rgba(255,255,255,.70)}
      }
    </style>

    <div class="glow" id="glow">
      <div class="card">
        <div class="main">
          <div class="iconbox" id="iconbox">
            <svg id="icon" width="32" height="32" viewBox="0 0 32 32" overflow="visible"></svg>
          </div>
          <div class="mid">
            <div class="name">${this._name}${this._room ? `<span class="room"> \u00b7 ${this._room}</span>` : ''}</div>
            <div class="status" id="status">\u2014</div>
          </div>
          <div class="pct-wrap">
            <span class="pct" id="pct">\u2014</span><span class="pu">%</span>
          </div>
        </div>

        <div class="track">
          <div class="fill" id="fill"></div>
        </div>

        <div class="pills" id="pills">
          ${PRESETS.map((b, i) => `<button class="pill" type="button" data-bri="${b}">
            <span class="pill-pct">${b}%</span>
            <span class="pill-lbl">${PRESET_LABELS[i]}</span>
          </button>`).join('')}
        </div>

        <div class="btns">
          <button class="btn off" type="button" id="btn-off">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M3 4.2a5 5 0 1 0 8 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            Wyłącz
          </button>
          <button class="btn on-act" type="button" id="btn-on">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="6" r="3.2" stroke="currentColor" stroke-width="1.5"/><path d="M5.7 11h2.6M6 12.3h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            Włącz
          </button>
        </div>
      </div>
    </div>`;

    const iconEl = this.shadowRoot.getElementById('icon');
    if (iconEl) iconEl.innerHTML = this._drawBulb(0, 'rgba(142,142,147,.65)');

    const btnOff = this.shadowRoot.getElementById('btn-off');
    const btnOn  = this.shadowRoot.getElementById('btn-on');
    this._bindPress(btnOff, 'pressed');
    this._bindPress(btnOn,  'pressed');
    btnOff.addEventListener('click', () => this._svc('turn_off'));
    btnOn.addEventListener('click',  () => this._svc('turn_on'));

    this.shadowRoot.querySelectorAll('.pill').forEach(btn => {
      this._bindPress(btn, 'pressed');
      btn.addEventListener('click', () => {
        const b = parseInt(btn.dataset.bri);
        if (b === 0) this._svc('turn_off');
        else this._svc('turn_on', { brightness_pct: b });
      });
    });
  }

  _update(bri, on, st) {
    this._lastBri = bri;
    const r   = this.shadowRoot;
    const acc = on ? '#ffd65a' : 'rgba(142,142,147,.8)';
    const glyphColor = on ? '#ffd65a' : 'rgba(142,142,147,.65)';

    const pctEl    = r.getElementById('pct');
    const statusEl = r.getElementById('status');
    const fillEl   = r.getElementById('fill');
    const glowEl   = r.getElementById('glow');
    const iconbox  = r.getElementById('iconbox');
    const iconEl   = r.getElementById('icon');

    if (pctEl)    { pctEl.textContent = bri; pctEl.style.color = acc; }
    if (statusEl) { statusEl.textContent = this._label(bri, st); statusEl.style.color = on ? 'rgba(255,214,90,.72)' : '#636366'; }
    if (fillEl)   { fillEl.style.width = bri + '%'; fillEl.style.background = on ? '#ffd65a' : 'rgba(142,142,147,.4)'; }
    if (glowEl)   glowEl.classList.toggle('on', on);
    if (iconbox) {
      const t = bri / 100;
      iconbox.style.background = on ? 'rgba(255,214,90,.10)' : 'rgba(142,142,147,.07)';
      iconbox.style.border     = `.5px solid ${on ? 'rgba(255,214,90,.22)' : 'rgba(142,142,147,.15)'}`;
      iconbox.style.boxShadow  = on
        ? `0 0 ${Math.round(22 * t)}px ${Math.round(5 * t)}px rgba(255,214,90,${(0.50 * t).toFixed(2)})`
        : 'none';
    }
    if (iconEl) iconEl.innerHTML = this._drawBulb(bri, glyphColor);

    r.querySelectorAll('.pill').forEach(b => {
      b.classList.toggle('on', parseInt(b.dataset.bri) === bri);
    });
  }

  getCardSize() { return 3; }
}

customElements.define('aha-teleco-light-card', TelecoLightCard);
if (!customElements.get('teleco-light-card')) customElements.define('teleco-light-card', class extends TelecoLightCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-teleco-light-card',
  name:        'Teleco Light Card',
  preview:     false,
  description: 'Sterowanie oświetleniem pergoli w stylu Apple Home (presety jasności).',
});class PergolaCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._rendered = false;
    this._curDeg = 0;
    this._raf = null;
    this._lastTilt  = 0;
    this._lastBri   = 0;
    this._lastOrbs  = false;
    this._lastSpotG = false;
    this._coverLastChanged = null;
    this._lightLastChanged = null;
    this._ticker = null;
    this._lightTicker = null;
  }

  setConfig(config) {
    this._config = config;
    this._coverEntity = config.cover_entity || config.entity || 'cover.pergola_lamele';
    this._coverName   = config.cover_name   || 'Lamele';
    this._lightEntity = config.light_entity || 'light.pergola_spot';
    this._lightName   = config.light_name   || 'Spot LED';
    this._name        = config.name  || 'Pergola';
    this._room        = config.room  || '';
    this._orbsEntity  = config.orbs_entity  || null;
    this._orbsName    = config.orbs_name    || 'Kule świecące';
    this._spotGEntity = config.spot_entity  || null;
    this._spotGName   = config.spot_name    || 'Spot na drzewa';
    this._lightPowerEntity = config.light_power_entity || null;
    this._orbsPowerEntity  = config.orbs_power_entity  || null;
    this._spotGPowerEntity = config.spot_power_entity  || null;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) { this._render(); this._rendered = true; }

    const cov = hass.states[this._coverEntity];
    if (cov) {
      const tilt = cov.attributes.current_tilt_position ?? 0;
      this._coverLastChanged = cov.last_changed;
      this._updateLouver(tilt, cov.state);
    }
    const lit = hass.states[this._lightEntity];
    if (lit) {
      const on = lit.state === 'on';
      const briRaw = lit.attributes.brightness;
      const bri = on ? Math.round(((briRaw ?? 255) / 255) * 100) : 0;
      this._lightLastChanged = lit.last_changed;
      this._updateLight(bri, on, lit.state);
    }
    if (this._orbsEntity) {
      const orbs = hass.states[this._orbsEntity];
      if (orbs) {
        const orbsPower = this._orbsPowerEntity ? parseFloat(hass.states[this._orbsPowerEntity]?.state) : NaN;
        this._updateOrbs(orbs.state === 'on', isNaN(orbsPower) ? null : orbsPower);
      }
    }
    if (this._spotGEntity) {
      const spotg = hass.states[this._spotGEntity];
      if (spotg) {
        const spotGPower = this._spotGPowerEntity ? parseFloat(hass.states[this._spotGPowerEntity]?.state) : NaN;
        this._updateSpotG(spotg.state === 'on', isNaN(spotGPower) ? null : spotGPower);
      }
    }
    const lightPower = this._lightPowerEntity ? parseFloat(hass.states[this._lightPowerEntity]?.state) : NaN;
    this._lightPower = isNaN(lightPower) ? null : lightPower;
  }

  _svcCover(service, data = {}) {
    this._hass.callService('cover', service, { entity_id: this._coverEntity, ...data });
  }
  _svcLight(service, data = {}) {
    this._hass.callService('light', service, { entity_id: this._lightEntity, ...data });
  }
  _svcOrbs(on) {
    const domain = this._orbsEntity.split('.')[0];
    this._hass.callService(domain, on ? 'turn_on' : 'turn_off', { entity_id: this._orbsEntity });
  }
  _svcSpotG(on) {
    const domain = this._spotGEntity.split('.')[0];
    this._hass.callService(domain, on ? 'turn_on' : 'turn_off', { entity_id: this._spotGEntity });
  }

  // ── louver glyph ──
  _deg(tilt) {
    const kf = [[0,0],[33,52],[66,85],[100,135]];
    for (let i = 0; i < kf.length - 1; i++) {
      const [p0,d0] = kf[i], [p1,d1] = kf[i+1];
      if (tilt >= p0 && tilt <= p1) return d0 + (tilt-p0)/(p1-p0)*(d1-d0);
    }
    return 135;
  }
  _drawSlat(deg, color) {
    const W = 32, H = 32;
    const cx = W/2, cy = H/2, HL = W/2 - 4, TH = Math.max(2, HL * 0.16);
    const r  = deg * Math.PI / 180;
    const ca = Math.cos(r), sa = Math.sin(r);
    const px = -sa * TH, py = ca * TH;
    const x1 = cx - HL*ca, y1 = cy - HL*sa;
    const x2 = cx + HL*ca, y2 = cy + HL*sa;
    const f  = ([x,y]) => `${x.toFixed(1)},${y.toFixed(1)}`;
    const body  = [[x1-px,y1-py],[x2-px,y2-py],[x2+px,y2+py],[x1+px,y1+py]].map(f).join(' ');
    const shine = [[x1-px*.3,y1-py*.3],[x2-px*.3,y2-py*.3],[x2+px*.12,y2+py*.12],[x1+px*.12,y1+py*.12]].map(f).join(' ');
    const c = color || 'rgba(255,159,10,.88)';
    return `<polygon points="${body}" fill="${c}"/>
      <polygon points="${shine}" fill="rgba(255,255,255,.22)"/>
      <circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="2.2" fill="rgba(0,0,0,.55)" stroke="${c}" stroke-width=".9"/>
      <circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="2.2" fill="rgba(0,0,0,.55)" stroke="${c}" stroke-width=".9"/>`;
  }
  _louverLabel(tilt, st) {
    if (st === 'opening') return 'Otwieranie\u2026';
    if (st === 'closing') return 'Zamykanie\u2026';
    if (tilt === 0)  return 'Zamkni\u0119te';
    if (tilt < 30)   return 'Lekko uchylone';
    if (tilt < 70)   return 'Uchylone';
    if (tilt < 100)  return 'Prawie otwarte';
    return 'Otwarte';
  }

  // ── orbs glyph ──
  _drawOrbs(on) {
    const fill  = on ? '#ffb347' : '#1e1e2a';
    const high  = on ? '#fff3d6' : 'rgba(255,255,255,.05)';
    const bs    = on ? 'rgba(255,200,120,.50)' : 'rgba(255,255,255,.08)';
    const ss    = on ? 'rgba(255,200,120,.35)' : 'rgba(255,255,255,.06)';
    const g1    = on ? 'drop-shadow(0 0 5px rgba(255,179,71,.70))' : 'none';
    const g2    = on ? 'drop-shadow(0 0 3px rgba(255,179,71,.55))' : 'none';
    return `
      <circle cx="13" cy="19" r="9"   fill="${fill}" stroke="${bs}" stroke-width=".8" style="filter:${g1}"/>
      <circle cx="11" cy="17" r="4.5" fill="${high}" opacity="${on ? '.62' : '.8'}"/>
      <circle cx="24" cy="23" r="6"   fill="${fill}" stroke="${ss}" stroke-width=".6" style="filter:${g2}"/>
      <circle cx="23" cy="21.5" r="3" fill="${high}" opacity="${on ? '.55' : '.8'}"/>`;
  }

  // ── ground spot glyph ──
  _drawGroundSpot(on) {
    const face  = on ? '#fff2d0' : '#15151c';
    const faceB = on ? 'rgba(255,210,140,.60)' : 'rgba(255,255,255,.12)';
    const glow  = on ? 'drop-shadow(0 0 4px rgba(255,184,77,.85))' : 'none';
    const bOp   = on ? '1' : '0';
    return `
      <g transform="rotate(35, 16, 20)">
        <rect x="15"   y="25"  width="2.5" height="8"  rx="1.2" fill="#14141e"/>
        <rect x="13.5" y="17"  width="5"   height="10" rx="2.5" fill="#1e1e2e"/>
        <rect x="10.5" y="5"   width="11"  height="14" rx="5"   fill="#252535" stroke="rgba(255,255,255,.10)" stroke-width=".7"/>
        <ellipse cx="16" cy="6.5" rx="5" ry="2.8" fill="${face}" stroke="${faceB}" stroke-width=".6" style="filter:${glow}"/>
        <path d="M11 5 L4 -8 L28 -8 L21 5 Z" fill="rgba(255,200,100,.26)" opacity="${bOp}" style="filter:blur(3px)"/>
        <ellipse cx="16" cy="1" rx="7.5" ry="5" fill="rgba(255,210,120,.38)" opacity="${bOp}" style="filter:blur(2.5px)"/>
      </g>`;
  }

  // ── ceiling LED spot glyph ──
  _drawSpot(bri) {
    const t  = Math.max(0, Math.min(1, bri / 100));
    const on = bri > 0;
    const sG = on ? Math.round(200 + 40  * t) : 28;
    const sB = on ? Math.round(80  + 112 * t) : 40;
    const stripFill = on ? `rgb(255,${sG},${sB})` : '#1c1c28';
    const h1 = on ? (0.55 + 0.30 * t).toFixed(2) : '0';
    const h2 = on ? (0.28 + 0.18 * t).toFixed(2) : '0';
    const h3 = on ? (0.12 + 0.10 * t).toFixed(2) : '0';
    const hotOp = on && t > 0.5 ? ((t - 0.5) * 0.9).toFixed(2) : '0';
    const ry1 = (5.5 + 7.0 * t).toFixed(1);
    const ry2 = (8.0 + 9.0 * t).toFixed(1);
    const e1  = on ? (0.45 + 0.27 * t).toFixed(2) : '0';
    const e2  = on ? (0.20 + 0.15 * t).toFixed(2) : '0';
    return `
      <rect x="4"   y="5"   width="24" height="8"   rx="3.5" fill="#1c1c28" stroke="rgba(255,255,255,.10)" stroke-width=".8"/>
      <rect x="5.5" y="6.5" width="21" height="5"   rx="2.5" fill="rgba(255,200,100,${h3})"/>
      <rect x="7"   y="7.5" width="18" height="3"   rx="1.5" fill="rgba(255,200,100,${h2})"/>
      <rect x="8.5" y="8"   width="15" height="2"   rx="1"   fill="rgba(255,200,100,${h1})"/>
      <rect x="9"   y="8.5" width="14" height="1.5" rx=".75" fill="${stripFill}"/>
      <rect x="12"  y="8.5" width="8"  height="1.5" rx=".75" fill="rgba(255,255,255,${hotOp})"/>
      <ellipse cx="16" cy="15" rx="12" ry="${ry2}" fill="rgba(255,200,100,${e2})"/>
      <ellipse cx="16" cy="14" rx="8"  ry="${ry1}" fill="rgba(255,200,100,${e1})"/>`;
  }
  _lightLabel(bri, st) {
    if (st === 'unavailable') return 'Niedost\u0119pne';
    if (bri === 0)  return 'Wy\u0142\u0105czone';
    if (bri < 30)   return 'Przyciemnione';
    if (bri < 70)   return '\u015arednia';
    if (bri < 100)  return 'Jasno';
    return 'Maksymalnie';
  }

  _bindPress(el, cls) {
    const on  = () => el.classList.add(cls);
    const off = () => el.classList.remove(cls);
    el.addEventListener('pointerdown',   on,  { passive: true });
    el.addEventListener('pointerup',     off, { passive: true });
    el.addEventListener('pointercancel', off, { passive: true });
    el.addEventListener('pointerleave',  off, { passive: true });
  }

  _render() {
    const PRESETS = [0, 33, 66, 100];
    const hasGarden = this._orbsEntity || this._spotGEntity;

    this.shadowRoot.innerHTML = `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      :host{display:block;font-family:-apple-system,'SF Pro Text','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}

      .glow{ border-radius:18px; transition:box-shadow .5s ease; }
      .glow.lit{
        box-shadow:
          0 0 0 1px rgba(255,214,90,.20),
          0 0 18px 2px rgba(255,214,90,.13),
          0 0 40px 6px rgba(255,214,90,.06);
      }

      .card{
        background:linear-gradient(150deg,#0b1120 0%,#0d1828 100%);
        border:.5px solid rgba(255,255,255,.08);
        border-radius:18px;
        padding:14px 16px 16px;
        position:relative;
        overflow:hidden;
      }
      .card::before{
        content:'';position:absolute;top:0;left:0;right:0;height:1px;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);
        pointer-events:none;
      }

      /* ── animations ── */
      @keyframes louver-pulse {
        0%,100%{ box-shadow:0 0 0 0px rgba(255,159,10,0) }
        50%    { box-shadow:0 0 0 5px rgba(255,159,10,.18) }
      }
      @keyframes orbs-pulse {
        0%,100%{ box-shadow:0 0 0 0px rgba(255,179,71,0) }
        50%    { box-shadow:0 0 0 5px rgba(255,179,71,.18) }
      }
      @keyframes spotg-pulse {
        0%,100%{ box-shadow:0 0 0 0px rgba(255,184,77,0) }
        50%    { box-shadow:0 0 0 5px rgba(255,184,77,.18) }
      }
      @keyframes light-pulse {
        0%,100%{ box-shadow:0 0 0 0px rgba(255,214,90,0), 0 0 0px 0px rgba(255,214,90,0) }
        50%    { box-shadow:0 0 0 5px rgba(255,214,90,.15), 0 0 var(--lb-spread,0px) var(--lb-spread,0px) rgba(255,214,90,var(--lb-op,0)) }
      }
      .iconbox.louver-active { animation:louver-pulse 2.5s ease-in-out infinite; }
      .iconbox.orbs-active   { animation:orbs-pulse   2.8s ease-in-out infinite; }
      .iconbox.spotg-active  { animation:spotg-pulse  3.2s ease-in-out infinite; }
      .iconbox.light-active  { animation:light-pulse  3.0s ease-in-out infinite; }

      /* ── header ── */
      .hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
      .hdr .title{font-size:15px;font-weight:700;color:rgba(255,255,255,.92);letter-spacing:-.2px}
      .hdr .title .room{font-size:11px;font-weight:400;color:#636366}
      .hdr .badge{font-size:11px;color:#636366;display:flex;align-items:center;gap:6px;transition:color .3s}
      .hdr .badge.active{color:rgba(255,255,255,.55)}
      .hdr .badge .dot{width:7px;height:7px;border-radius:50%;background:rgba(142,142,147,.35);transition:background .3s,box-shadow .3s}
      .hdr .badge .dot.active{background:#30d158;box-shadow:0 0 8px #30d158}

      /* ── pergola group (lamele + spot LED, wiersze z subtelną ramką) ── */
      .perg-group{
        border-radius:13px;
        border:.5px solid rgba(255,255,255,.09);
        background:rgba(255,255,255,.022);
        margin-bottom:${hasGarden ? '10px' : '0'};
        padding:0 12px;
      }

      .iconbox{
        width:44px;height:44px;border-radius:12px;flex-shrink:0;
        display:flex;align-items:center;justify-content:center;
        background:rgba(142,142,147,.07);
        border:.5px solid rgba(142,142,147,.15);
        transition:background .35s,border-color .35s,box-shadow .45s;
      }

      /* ── garden section ── */
      .sect-sep{
        display:flex;align-items:center;gap:8px;
        margin-bottom:4px;
      }
      .sect-sep::before,.sect-sep::after{
        content:'';flex:1;height:.5px;
        background:rgba(255,255,255,.07);
      }
      .sect-sep span{
        font-size:9px;font-weight:700;letter-spacing:.12em;
        text-transform:uppercase;color:rgba(255,255,255,.20);
        white-space:nowrap;
      }

      /* garden rows */
      .row{display:flex;align-items:center;gap:13px;padding:12px 0}
      .row + .row{border-top:.5px solid rgba(255,255,255,.07)}

      .mid{flex:1;min-width:0}
      .name{font-size:14px;font-weight:600;color:rgba(255,255,255,.90);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .status{font-size:12px;color:#636366;margin-top:2px;transition:color .3s}

      .seg{
        display:flex;gap:3px;flex-shrink:0;
        background:rgba(255,255,255,.04);
        border:.5px solid rgba(255,255,255,.07);
        border-radius:11px;padding:3px;
      }
      .seg button{
        min-width:44px;min-height:38px;
        display:flex;align-items:center;justify-content:center;
        border:none;background:none;border-radius:8px;
        font-family:inherit;font-size:11px;font-weight:700;
        color:rgba(255,255,255,.40);
        cursor:pointer;touch-action:manipulation;
        -webkit-tap-highlight-color:transparent;user-select:none;
        appearance:none;-webkit-appearance:none;padding:0;
        transition:background .15s,color .15s,transform .1s;
      }
      .seg button.pressed{transform:scale(.9);background:rgba(255,255,255,.12);color:rgba(255,255,255,.8)}

      .louver .seg button.on      { background:rgba(255,159,10,.18); color:#ff9f0a; box-shadow:0 0 12px rgba(255,159,10,.22) inset; }
      .louver .seg button.on.zero { background:rgba(255,255,255,.08); color:rgba(255,255,255,.75); box-shadow:none; }
      .light  .seg button.on      { background:rgba(255,214,90,.18); color:#ffd65a; box-shadow:0 0 12px rgba(255,214,90,.22) inset; }
      .light  .seg button.on.zero { background:rgba(255,255,255,.08); color:rgba(255,255,255,.75); box-shadow:none; }
      .orbs  .seg button.on      { background:rgba(255,179,71,.18); color:#ffb347; box-shadow:0 0 12px rgba(255,179,71,.22) inset; }
      .orbs  .seg button.on.zero { background:rgba(255,255,255,.08); color:rgba(255,255,255,.75); box-shadow:none; }
      .spotg .seg button.on      { background:rgba(255,184,77,.18); color:#ffb84d; box-shadow:0 0 12px rgba(255,184,77,.22) inset; }
      .spotg .seg button.on.zero { background:rgba(255,255,255,.08); color:rgba(255,255,255,.75); box-shadow:none; }

      @media(hover:hover){
        .seg button:hover:not(.on){background:rgba(255,255,255,.07);color:rgba(255,255,255,.65)}
      }

      /* ── wyłącz wszystkie ── */
      .all-off-row{
        border-top:.5px solid rgba(255,255,255,.07);
        margin-top:4px;padding-top:10px;
        display:flex;justify-content:center;
      }
      .all-off-btn{
        display:inline-flex;align-items:center;gap:5px;
        background:none;border:none;
        font-family:inherit;font-size:11px;font-weight:600;
        color:rgba(255,255,255,.28);
        cursor:pointer;touch-action:manipulation;
        -webkit-tap-highlight-color:transparent;user-select:none;
        padding:6px 12px;border-radius:8px;
        transition:color .15s,background .15s,transform .1s;
      }
      .all-off-btn.pressed{
        transform:scale(.95);
        background:rgba(255,255,255,.07);
        color:rgba(255,255,255,.65);
      }
      @media(hover:hover){
        .all-off-btn:hover{color:rgba(255,255,255,.55);background:rgba(255,255,255,.05)}
      }
    </style>

    <div class="glow" id="glow">
      <div class="card">

        <!-- HEADER -->
        <div class="hdr">
          <div class="title">${this._name}${this._room ? `<span class="room"> \u00b7 ${this._room}</span>` : ''}</div>
          <div class="badge" id="badge"><span class="dot" id="badge-dot"></span><span id="badge-txt"></span></div>
        </div>

        <!-- separator Pergola -->
        <div class="sect-sep"><span>Pergola</span></div>

        <!-- PERGOLA GROUP — lamele + spot LED, zgrupowane -->
        <div class="perg-group">

          <!-- Lamele -->
          <div class="row louver">
            <div class="iconbox" id="l-iconbox">
              <svg id="l-icon" width="30" height="30" viewBox="0 0 32 32" overflow="visible"></svg>
            </div>
            <div class="mid">
              <div class="name">${this._coverName}</div>
              <div class="status" id="l-status">\u2014</div>
            </div>
            <div class="seg" id="l-seg">
              ${PRESETS.map(t => `<button type="button" data-tilt="${t}">${t}%</button>`).join('')}
            </div>
          </div>

          <!-- Spot LED -->
          <div class="row light">
            <div class="iconbox" id="b-iconbox">
              <svg id="b-icon" width="30" height="30" viewBox="0 0 32 32" overflow="visible"></svg>
            </div>
            <div class="mid">
              <div class="name">${this._lightName}</div>
              <div class="status" id="b-status">\u2014</div>
            </div>
            <div class="seg" id="b-seg">
              ${PRESETS.map(b => `<button type="button" data-bri="${b}">${b}%</button>`).join('')}
            </div>
          </div>

        </div>

        ${hasGarden ? `
        <!-- OGRÓD — separator + wiersze -->
        <div class="sect-sep"><span>Ogr\u00f3d</span></div>

        ${this._orbsEntity ? `
        <div class="row orbs">
          <div class="iconbox" id="o-iconbox">
            <svg id="o-icon" width="30" height="30" viewBox="0 0 32 32" overflow="visible"></svg>
          </div>
          <div class="mid">
            <div class="name">${this._orbsName}</div>
            <div class="status" id="o-status">\u2014</div>
          </div>
          <div class="seg" id="o-seg">
            <button type="button" data-val="off">Wy\u0142</button>
            <button type="button" data-val="on">W\u0142</button>
          </div>
        </div>` : ''}

        ${this._spotGEntity ? `
        <div class="row spotg">
          <div class="iconbox" id="g-iconbox">
            <svg id="g-icon" width="30" height="30" viewBox="0 0 32 32" overflow="visible"></svg>
          </div>
          <div class="mid">
            <div class="name">${this._spotGName}</div>
            <div class="status" id="g-status">\u2014</div>
          </div>
          <div class="seg" id="g-seg">
            <button type="button" data-val="off">Wy\u0142</button>
            <button type="button" data-val="on">W\u0142</button>
          </div>
        </div>` : ''}
        ` : ''}

        <!-- Wyłącz wszystkie -->
        <div class="all-off-row">
          <button class="all-off-btn" id="btn-all-off" type="button">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              <path d="M3.5 4a5 5 0 1 0 7 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            Wy\u0142\u0105cz wszystkie lampy
          </button>
        </div>

      </div>
    </div>`;

    // init glyphs
    const lIcon = this.shadowRoot.getElementById('l-icon');
    if (lIcon) lIcon.innerHTML = this._drawSlat(0, 'rgba(142,142,147,.65)');
    const bIcon = this.shadowRoot.getElementById('b-icon');
    if (bIcon) bIcon.innerHTML = this._drawSpot(0);
    const oIcon = this.shadowRoot.getElementById('o-icon');
    if (oIcon) oIcon.innerHTML = this._drawOrbs(false);
    const gIcon = this.shadowRoot.getElementById('g-icon');
    if (gIcon) gIcon.innerHTML = this._drawGroundSpot(false);

    // bind louver seg
    this.shadowRoot.querySelectorAll('#l-seg button').forEach(btn => {
      this._bindPress(btn, 'pressed');
      btn.addEventListener('click', () => {
        this._svcCover('set_cover_tilt_position', { tilt_position: parseInt(btn.dataset.tilt) });
      });
    });
    // bind LED seg
    this.shadowRoot.querySelectorAll('#b-seg button').forEach(btn => {
      this._bindPress(btn, 'pressed');
      btn.addEventListener('click', () => {
        const b = parseInt(btn.dataset.bri);
        if (b === 0) this._svcLight('turn_off');
        else this._svcLight('turn_on', { brightness_pct: b });
      });
    });
    // bind orbs toggle
    if (this._orbsEntity) {
      this.shadowRoot.querySelectorAll('#o-seg button').forEach(btn => {
        this._bindPress(btn, 'pressed');
        btn.addEventListener('click', () => this._svcOrbs(btn.dataset.val === 'on'));
      });
    }
    // bind ground spot toggle
    if (this._spotGEntity) {
      this.shadowRoot.querySelectorAll('#g-seg button').forEach(btn => {
        this._bindPress(btn, 'pressed');
        btn.addEventListener('click', () => this._svcSpotG(btn.dataset.val === 'on'));
      });
    }

    // bind all-off
    const btnAllOff = this.shadowRoot.getElementById('btn-all-off');
    if (btnAllOff) {
      this._bindPress(btnAllOff, 'pressed');
      btnAllOff.addEventListener('click', () => this._allOff());
    }

    this._updateBadge();
  }

  _allOff() {
    this._svcLight('turn_off');
    if (this._orbsEntity)  this._svcOrbs(false);
    if (this._spotGEntity) this._svcSpotG(false);
  }

  _animateTo(target) {
    if (this._raf) cancelAnimationFrame(this._raf);
    const start = this._curDeg, diff = target - start;
    const dur = 420, t0 = performance.now();
    const ease = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
    const tilt  = this._lastTilt ?? 0;
    const color = tilt > 0 ? 'rgba(255,159,10,.88)' : 'rgba(142,142,147,.65)';
    const svg   = this.shadowRoot.getElementById('l-icon');
    const step  = now => {
      const t = Math.min((now - t0) / dur, 1);
      this._curDeg = start + diff * ease(t);
      if (svg) svg.innerHTML = this._drawSlat(this._curDeg, color);
      if (t < 1) this._raf = requestAnimationFrame(step);
      else this._curDeg = target;
    };
    this._raf = requestAnimationFrame(step);
  }

  _elapsedSince(ts, active) {
    if (!ts || !active) return null;
    const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
    if (mins < 1)  return 'przed chwil\u0105';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h} h ${m} min` : `${h} h`;
  }

  _startTicker() {
    if (this._ticker) return;
    this._ticker = setInterval(() => {
      const el = this.shadowRoot && this.shadowRoot.getElementById('l-status');
      if (!el || this._lastTilt === 0) return;
      const t = this._elapsedSince(this._coverLastChanged, this._lastTilt > 0);
      if (t) el.textContent = `${this._louverLabel(this._lastTilt, null)} \u00b7 ${t}`;
    }, 60000);
  }

  _startLightTicker() {
    if (this._lightTicker) return;
    this._lightTicker = setInterval(() => {
      const el = this.shadowRoot && this.shadowRoot.getElementById('b-status');
      if (!el || this._lastBri === 0) return;
      const t = this._elapsedSince(this._lightLastChanged, this._lastBri > 0);
      if (t) el.textContent = `${this._lightLabel(this._lastBri, null)} \u00b7 ${t}`;
    }, 60000);
  }

  disconnectedCallback() {
    if (this._ticker)      { clearInterval(this._ticker);      this._ticker = null; }
    if (this._lightTicker) { clearInterval(this._lightTicker); this._lightTicker = null; }
    if (this._raf)         { cancelAnimationFrame(this._raf);  this._raf = null; }
  }

  _updateBadge() {
    const total  = 2 + (this._orbsEntity  ? 1 : 0) + (this._spotGEntity ? 1 : 0);
    const active = (this._lastTilt  > 0 ? 1 : 0) + (this._lastBri > 0 ? 1 : 0)
                 + (this._lastOrbs  ? 1 : 0) + (this._lastSpotG ? 1 : 0);
    const r = this.shadowRoot;
    const badge = r.getElementById('badge');
    const dot   = r.getElementById('badge-dot');
    const txt   = r.getElementById('badge-txt');
    if (badge) badge.classList.toggle('active', active > 0);
    if (dot)   dot.classList.toggle('active',   active > 0);
    if (txt)   txt.textContent = `${active}/${total} obwody`;
  }

  _updateLouver(tilt, st) {
    this._lastTilt = tilt;
    const r = this.shadowRoot;
    const on = tilt > 0;
    const slatColor = on ? 'rgba(255,159,10,.88)' : 'rgba(142,142,147,.65)';
    const statusEl  = r.getElementById('l-status');
    const iconbox   = r.getElementById('l-iconbox');

    if (statusEl) {
      const elapsed = on ? this._elapsedSince(this._coverLastChanged, on) : null;
      statusEl.textContent = elapsed
        ? `${this._louverLabel(tilt, st)} \u00b7 ${elapsed}`
        : this._louverLabel(tilt, st);
      statusEl.style.color = on ? 'rgba(255,159,10,.70)' : '#636366';
    }
    if (on) this._startTicker();
    else if (this._ticker) { clearInterval(this._ticker); this._ticker = null; }
    if (iconbox) {
      iconbox.style.background = on ? 'rgba(255,159,10,.10)' : 'rgba(142,142,147,.07)';
      iconbox.style.border = `.5px solid ${on ? 'rgba(255,159,10,.20)' : 'rgba(142,142,147,.15)'}`;
      iconbox.classList.toggle('louver-active', on);
    }
    const tiltSnap = [0,33,66,100].reduce((a,b) => Math.abs(b-tilt) < Math.abs(a-tilt) ? b : a);
    r.querySelectorAll('#l-seg button').forEach(b => {
      const v = parseInt(b.dataset.tilt);
      b.classList.toggle('on',   v === tiltSnap);
      b.classList.toggle('zero', v === tiltSnap && v === 0);
    });
    const targetDeg = this._deg(tilt);
    if (Math.abs(targetDeg - this._curDeg) > 0.5) this._animateTo(targetDeg);
    else { const svg = r.getElementById('l-icon'); if (svg) svg.innerHTML = this._drawSlat(this._curDeg, slatColor); }
    this._updateBadge();
  }

  _updateLight(bri, on, st) {
    this._lastBri = bri;
    const r = this.shadowRoot;
    const statusEl = r.getElementById('b-status');
    const glowEl   = r.getElementById('glow');
    const iconbox  = r.getElementById('b-iconbox');
    const iconEl   = r.getElementById('b-icon');

    if (statusEl) {
      const elapsed = on ? this._elapsedSince(this._lightLastChanged, on) : null;
      const pw = (on && this._lightPower !== null && this._lightPower !== undefined)
        ? ` \u00b7 ${Math.round(this._lightPower)} W` : '';
      const base = elapsed ? `${this._lightLabel(bri, st)} \u00b7 ${elapsed}` : this._lightLabel(bri, st);
      statusEl.textContent = base + pw;
      statusEl.style.color = on ? 'rgba(255,214,90,.72)' : '#636366';
    }
    if (on) this._startLightTicker();
    else if (this._lightTicker) { clearInterval(this._lightTicker); this._lightTicker = null; }
    if (glowEl) glowEl.classList.toggle('lit', on);
    if (iconbox) {
      const t = bri / 100;
      iconbox.style.background = on ? 'rgba(255,214,90,.10)' : 'rgba(142,142,147,.07)';
      iconbox.style.border = `.5px solid ${on ? 'rgba(255,214,90,.22)' : 'rgba(142,142,147,.15)'}`;
      iconbox.style.setProperty('--lb-spread', on ? Math.round(18 * t) + 'px' : '0px');
      iconbox.style.setProperty('--lb-op',     on ? (0.45 * t).toFixed(2) : '0');
      iconbox.classList.toggle('light-active', on);
    }
    if (iconEl) iconEl.innerHTML = this._drawSpot(bri);
    const briSnap = on ? [0,33,66,100].reduce((a,b) => Math.abs(b-bri) < Math.abs(a-bri) ? b : a) : 0;
    r.querySelectorAll('#b-seg button').forEach(b => {
      const v = parseInt(b.dataset.bri);
      b.classList.toggle('on',   v === briSnap);
      b.classList.toggle('zero', v === briSnap && v === 0);
    });
    this._updateBadge();
  }

  _updateOrbs(on, watts = null) {
    this._lastOrbs = on;
    const r = this.shadowRoot;
    const iconbox  = r.getElementById('o-iconbox');
    const iconEl   = r.getElementById('o-icon');
    const statusEl = r.getElementById('o-status');
    if (iconEl)   iconEl.innerHTML = this._drawOrbs(on);
    if (statusEl) {
      const pw = (on && watts !== null) ? ` \u00b7 ${Math.round(watts)} W` : '';
      statusEl.textContent = (on ? 'W\u0142\u0105czone' : 'Wy\u0142\u0105czone') + pw;
      statusEl.style.color = on ? 'rgba(255,179,71,.75)' : '#636366';
    }
    if (iconbox) {
      iconbox.style.background = on ? 'rgba(255,179,71,.10)' : 'rgba(142,142,147,.07)';
      iconbox.style.border = `.5px solid ${on ? 'rgba(255,179,71,.22)' : 'rgba(142,142,147,.15)'}`;
      iconbox.classList.toggle('orbs-active', on);
    }
    r.querySelectorAll('#o-seg button').forEach(b => {
      const match = b.dataset.val === (on ? 'on' : 'off');
      b.classList.toggle('on',   match);
      b.classList.toggle('zero', match && !on);
    });
    this._updateBadge();
  }

  _updateSpotG(on, watts = null) {
    this._lastSpotG = on;
    const r = this.shadowRoot;
    const iconbox  = r.getElementById('g-iconbox');
    const iconEl   = r.getElementById('g-icon');
    const statusEl = r.getElementById('g-status');
    if (iconEl)   iconEl.innerHTML = this._drawGroundSpot(on);
    if (statusEl) {
      const pw = (on && watts !== null) ? ` \u00b7 ${Math.round(watts)} W` : '';
      statusEl.textContent = (on ? 'W\u0142\u0105czone' : 'Wy\u0142\u0105czone') + pw;
      statusEl.style.color = on ? 'rgba(255,184,77,.75)' : '#636366';
    }
    if (iconbox) {
      iconbox.style.background = on ? 'rgba(255,184,77,.10)' : 'rgba(142,142,147,.07)';
      iconbox.style.border = `.5px solid ${on ? 'rgba(255,184,77,.22)' : 'rgba(142,142,147,.15)'}`;
      iconbox.classList.toggle('spotg-active', on);
    }
    r.querySelectorAll('#g-seg button').forEach(b => {
      const match = b.dataset.val === (on ? 'on' : 'off');
      b.classList.toggle('on',   match);
      b.classList.toggle('zero', match && !on);
    });
    this._updateBadge();
  }

  getCardSize() { return 2; }
}

customElements.define('aha-pergola-card', PergolaCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-pergola-card',
  name:        'Pergola Card',
  preview:     false,
  description: 'Sterowanie pergol\u0105 i ogr\u00f3dem: lamele + spot LED (razem) + kule + reflektor ogrodowy.',
});
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
