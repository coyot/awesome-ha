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
          background: linear-gradient(145deg, rgba(28,28,30,0.97), rgba(18,18,20,0.99));
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

const TYPES = {
  eclipse:       { label:'Zaćmienie Słońca',   r:220, g:160, b:30  },
  lunar_eclipse: { label:'Zaćmienie Księżyca', r:220, g:70,  b:70  },
  meteors:       { label:'Rój meteorów',       r:130, g:90,  b:230 },
  conjunction:   { label:'Koniunkcja',         r:60,  g:180, b:240 },
  planet:        { label:'Planety',            r:50,  g:190, b:150 },
  moon:          { label:'Księżyc',            r:200, g:180, b:80  },
};

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
  { date:'2028-12-14', type:'meteors',       name:'Geminidy 2028',                   desc:'Kolorowe, liczne, od wczesnego wieczoru. Sprawdź fazę księżyca — decyduje o warunkach.',                                                      how:'Wyjdź po 21:00. Radiant w Bliźniętach. Ciepłe ubranie!',                                                          tip:'Pora: 21:00–04:00 · Bez sprzętu' },
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

function fmtDate(d) {
  const x = new Date(d + 'T00:00:00');
  return x.getDate() + ' ' + window.AHA.MONTHS[x.getMonth()] + ' ' + x.getFullYear();
}

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
  return '';
}

const PAGE = 3;

class AstronomicalEventsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._offset = 0;
    this._expanded = new Set();
  }

  setConfig(config) {
    this._config = config;
    this._page = config.page_size || PAGE;
    this._render();
  }

  set hass(hass) {
    // no live entities needed, but required by HA
    this._hass = hass;
  }

  _getEvents() {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return RAW
      .map(e => {
        const t = new Date(e.date + 'T00:00:00');
        const days = Math.round((t - now) / 86400000);
        return { ...e, days };
      })
      .filter(e => e.days >= 0)
      .sort((a, b) => a.days - b.days);
  }

  _toggle(idx) {
    if (this._expanded.has(idx)) {
      this._expanded.delete(idx);
    } else {
      this._expanded.add(idx);
    }
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
    const all = this._getEvents();
    const page = this._page;
    const off = this._offset;
    const slice = all.slice(off, off + page);
    const canPrev = off > 0;
    const canNext = off + page < all.length;

    const css = `
      :host { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
      .card {
        background: linear-gradient(160deg, #06090f 0%, #0c1020 100%);
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
      .event.expanded {
        border-color: rgba(255,255,255,.13);
      }
      .event-row {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 11px 13px;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }
      .event-row:active {
        background: rgba(255,255,255,.04);
      }
      .icon-wrap {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .event-meta {
        flex: 1;
        min-width: 0;
        text-align: left;
      }
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
      .event-badge {
        display: inline-block;
        margin-top: 5px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: .04em;
        padding: 2px 8px;
        border-radius: 20px;
      }
      .event-right {
        display: flex;
        align-items: center;
        gap: 7px;
        flex-shrink: 0;
      }
      .countdown {
        text-align: right;
      }
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
      .chevron.open {
        transform: rotate(180deg);
        opacity: .6;
      }
      .details {
        display: none;
        padding: 10px 13px 14px;
        border-top: 1px solid rgba(255,255,255,.06);
        text-align: left;
        animation: fadeIn .18s ease;
      }
      .details.open {
        display: block;
      }
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
      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid rgba(255,255,255,.06);
      }
      .footer-info {
        font-size: 10px;
        color: rgba(255,255,255,.22);
      }
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
      .nav-btn:active {
        background: rgba(255,255,255,.10);
        color: rgba(255,255,255,.80);
      }
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
    `;

    const eventsHtml = slice.map((ev, localIdx) => {
      const globalIdx = off + localIdx;
      const T = TYPES[ev.type] || TYPES.meteors;
      const { r, g, b } = T;
      const c = `rgba(${r},${g},${b},`;
      const isOpen = this._expanded.has(globalIdx);
      const isUrgent = ev.days <= 7;

      const dLabel = ev.days === 0 ? 'dziś!' : ev.days === 1 ? 'jutro' : ev.days;
      const dUnit = ev.days <= 1 ? '' : 'dni';
      const dSize = ev.days <= 1 ? '15px' : '26px';

      const urgentBarHtml = isUrgent
        ? `<div class="urgent-bar" style="background:linear-gradient(to bottom,${c}.7),${c}.2));"></div>`
        : '';

      return `
        <div class="event${isOpen ? ' expanded' : ''}" data-idx="${globalIdx}">
          <div class="event-row" data-action="toggle" data-idx="${globalIdx}">
            ${urgentBarHtml}
            <div class="icon-wrap" style="background:${c}.12);border:1px solid ${c}.25);">
              ${makeIcon(ev.type, r, g, b)}
            </div>
            <div class="event-meta">
              <div class="event-name">${ev.name}</div>
              <div class="event-date">${fmtDate(ev.date)}</div>
              <span class="event-badge" style="background:${c}.13);color:${c}.90);border:1px solid ${c}.25);">${T.label}</span>
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
            <p class="desc">${ev.desc}</p>
            <p class="how">🔭 ${ev.how}</p>
            <div class="tip-box" style="background:${c}.10);color:${c}.90);border:1px solid ${c}.22);">⏰ ${ev.tip}</div>
          </div>
        </div>`;
    }).join('');

    const html = `
      <style>${css}</style>
      <div class="card">
        <div class="header">
          <span class="header-title">Nadchodzące zjawiska</span>
          <span class="header-count">${all.length} w kalendarzu</span>
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

    // Bind toggle clicks
    this.shadowRoot.querySelectorAll('[data-action="toggle"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(el.getAttribute('data-idx'));
        this._toggle(idx);
      });
    });

    // Bind nav
    const btnPrev = this.shadowRoot.getElementById('btn-prev');
    const btnNext = this.shadowRoot.getElementById('btn-next');
    if (btnPrev && !btnPrev.disabled) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); this._prev(); });
    if (btnNext && !btnNext.disabled) btnNext.addEventListener('click', (e) => { e.stopPropagation(); this._next(); });
  }

  getCardSize() {
    return 4;
  }
}

customElements.define('aha-astronomical-events-card', AstronomicalEventsCard);/**
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

  _render() {
    const PRESETS = [0, 33, 66, 100];

    this.shadowRoot.innerHTML = `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      :host{display:block;font-family:-apple-system,'SF Pro Text','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}

      /* ── glow wrapper ── */
      .glow{
        border-radius:18px;
        transition:box-shadow .5s ease;
      }
      .glow.on{
        box-shadow:
          0 0 0 1px rgba(255,159,10,.22),
          0 0 18px 2px rgba(255,159,10,.14),
          0 0 40px 6px rgba(255,159,10,.07);
      }

      /* ── card ── */
      .card{
        background:#1c1c1e;
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
        border-radius:2px;overflow:hidden;margin-bottom:10px;
      }
      .fill{
        height:100%;border-radius:2px;
        transition:width .45s cubic-bezier(.4,0,.2,1),background .35s;
      }

      /* ── preset pills ── */
      .pills{display:flex;gap:5px;margin-bottom:10px}
      .pill{
        flex:1;padding:5px 4px;text-align:center;
        border-radius:9px;font-size:10px;font-weight:600;
        color:rgba(255,255,255,.35);background:rgba(255,255,255,.04);
        cursor:pointer;border:.5px solid transparent;
        transition:background .2s,border-color .2s,color .2s,transform .1s;
        -webkit-tap-highlight-color:transparent;user-select:none;
      }
      .pill.on{
        background:rgba(255,159,10,.14);
        color:#ff9f0a;
        border-color:rgba(255,159,10,.28);
      }
      .pill:active{transform:scale(.92)}

      /* ── action buttons ── */
      .btns{
        display:flex;gap:6px;
        border-top:.5px solid rgba(255,255,255,.07);
        padding-top:10px;
      }
      .btn{
        flex:1;display:flex;align-items:center;justify-content:center;gap:5px;
        padding:9px 4px;
        background:rgba(255,255,255,.05);border-radius:10px;
        font-size:10px;font-weight:500;color:rgba(255,255,255,.45);
        cursor:pointer;border:.5px solid rgba(255,255,255,.08);
        transition:color .15s,background .15s,transform .1s;
        -webkit-tap-highlight-color:transparent;user-select:none;
      }
      .btn:active{transform:scale(.95);background:rgba(255,255,255,.09)}
      .btn:hover{color:rgba(255,255,255,.85);background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.14)}
      .btn.stop:hover{background:rgba(255,69,58,.12);color:#ff453a;border-color:rgba(255,69,58,.20)}
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
          ${PRESETS.map(t => `<div class="pill" data-tilt="${t}">${t}%</div>`).join('')}
        </div>

        <div class="btns">
          <div class="btn" id="btn-close">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 3v8M3.5 7.5L7 11l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Zamknij
          </div>
          <div class="btn stop" id="btn-stop">
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="currentColor"/></svg>
            Stop
          </div>
          <div class="btn" id="btn-open">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 11V3M3.5 6.5L7 3l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Otwórz
          </div>
        </div>
      </div>
    </div>`;

    // draw initial slat (grey, tilt=0) so icon is never empty
    const iconEl = this.shadowRoot.getElementById('icon');
    if (iconEl) iconEl.innerHTML = this._drawSlat(0, 'rgba(142,142,147,.65)');

    this.shadowRoot.getElementById('btn-open').addEventListener('click',  () => this._svc('open_cover'));
    this.shadowRoot.getElementById('btn-stop').addEventListener('click',  () => this._svc('stop_cover'));
    this.shadowRoot.getElementById('btn-close').addEventListener('click', () => this._svc('close_cover'));
    this.shadowRoot.querySelectorAll('.pill').forEach(btn => {
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

    // text & fill
    const pctEl    = r.getElementById('pct');
    const statusEl = r.getElementById('status');
    const fillEl   = r.getElementById('fill');
    const glowEl   = r.getElementById('glow');
    const iconbox  = r.getElementById('iconbox');

    if (pctEl)    { pctEl.textContent = tilt; pctEl.style.color = acc; }
    if (statusEl) { statusEl.textContent = this._label(tilt, pos, st); statusEl.style.color = on ? 'rgba(255,159,10,.70)' : '#636366'; }
    if (fillEl)   { fillEl.style.width = tilt + '%'; fillEl.style.background = on ? '#ff9f0a' : 'rgba(142,142,147,.4)'; }

    // glow
    if (glowEl) glowEl.classList.toggle('on', on);

    // icon box tint
    if (iconbox) {
      iconbox.style.background   = on ? 'rgba(255,159,10,.10)' : 'rgba(142,142,147,.07)';
      iconbox.style.border       = `.5px solid ${on ? 'rgba(255,159,10,.20)' : 'rgba(142,142,147,.15)'}`;
    }

    // preset pills
    r.querySelectorAll('.pill').forEach(b => {
      b.classList.toggle('on', parseInt(b.dataset.tilt) === tilt);
    });

    // slat animation
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
});class TelecoSlimCard extends HTMLElement {
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
    background:#1c1c1e;border-radius:14px;
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
 *   gauge    — dual-arc (temp outer, hum inner); room icon embedded inside
 *   pills    — absolute overlay top-right, only non-normal states
 *   bottom   — room name HTML, muted
 *
 * Hover focus mode:
 *   arc hovered  → brightens, tooltip appears
 *   opposite arc → dims to 20%
 *   chrome       → dims to 30%
 *
 * Room icons (room_type config key):
 *   salon | sypialnia | biuro | lazienka | pokoj_dzieciecy | pergola | ogrod
 *   Falls back to cfg.icon emoji if room_type not set.
 */

/* ─── macOS-style white room icons (SVG paths, coordinate origin = icon center) ─── */
const S = `fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"`;
const ROOM_ICONS = {

  salon: `
    <rect ${S} x="-6" y="-8.5" width="12" height="7.5" rx="1.5"/>
    <rect ${S} x="-8.5" y="-1" width="17" height="5" rx="1.5"/>
    <rect ${S} x="-11" y="-3" width="2.5" height="7.5" rx="1.5"/>
    <rect ${S} x="8.5" y="-3" width="2.5" height="7.5" rx="1.5"/>
    <line ${S} x1="-7" y1="4" x2="-7" y2="7"/>
    <line ${S} x1="7" y1="4" x2="7" y2="7"/>`,

  sypialnia: `
    <rect ${S} x="-8.5" y="-8.5" width="17" height="4" rx="1.5"/>
    <rect ${S} x="-8.5" y="-4.5" width="17" height="10" rx="1.5"/>
    <rect ${S} x="-7" y="-3.5" width="5" height="3.5" rx="1" stroke-opacity="0.55"/>
    <rect ${S} x="2" y="-3.5" width="5" height="3.5" rx="1" stroke-opacity="0.55"/>
    <line ${S} x1="-8.5" y1="0.5" x2="8.5" y2="0.5" stroke-opacity="0.30"/>
    <line ${S} x1="-6.5" y1="5.5" x2="-6.5" y2="8.5"/>
    <line ${S} x1="6.5" y1="5.5" x2="6.5" y2="8.5"/>`,

  biuro: `
    <rect ${S} x="-6.5" y="-9" width="13" height="9.5" rx="1.5"/>
    <line ${S} x1="-4.5" y1="-6.5" x2="4.5" y2="-6.5" stroke-opacity="0.42"/>
    <line ${S} x1="-4.5" y1="-4.5" x2="1.5" y2="-4.5" stroke-opacity="0.42"/>
    <line ${S} x1="0" y1="0.5" x2="0" y2="3.5"/>
    <line ${S} x1="-4" y1="3.5" x2="4" y2="3.5"/>
    <rect ${S} x="-7" y="5.5" width="14" height="2.5" rx="1"/>`,

  lazienka: `
    <path ${S} d="M-9,8 L-9,-0.5 Q-9,-5 -5.5,-5 L-4.5,-5 Q-3,-5 -3,-3 L-3,1 L9,1 L9,8 Z"/>
    <line ${S} x1="-5.5" y1="-5" x2="-5.5" y2="-8"/>
    <line ${S} x1="-7.5" y1="-8" x2="-3.5" y2="-8"/>
    <circle ${S} cx="1" cy="5.5" r="1.3" stroke-opacity="0.58"/>`,

  pokoj_dzieciecy: `
    <path fill="rgba(255,255,255,0.78)" stroke="rgba(255,255,255,0.92)" stroke-width="0.8" stroke-linejoin="round"
      d="M0,-8.5 L2.2,-3 L8,-2.7 L3.5,1.2 L5,7 L0,3.8 L-5,7 L-3.5,1.2 L-8,-2.7 L-2.2,-3 Z"/>`,

  pergola: `
    <line ${S} x1="-8" y1="8" x2="-8" y2="-4"/>
    <line ${S} x1="8" y1="8" x2="8" y2="-4"/>
    <line ${S} x1="-9.5" y1="-4" x2="9.5" y2="-4"/>
    <line ${S} x1="-6.5" y1="-4" x2="-6.5" y2="-8.5"/>
    <line ${S} x1="-2.5" y1="-4" x2="-2.5" y2="-8.5"/>
    <line ${S} x1="2.5" y1="-4" x2="2.5" y2="-8.5"/>
    <line ${S} x1="6.5" y1="-4" x2="6.5" y2="-8.5"/>
    <line ${S} x1="-10" y1="8" x2="10" y2="8"/>`,

  ogrod: `
    <path ${S} d="M-3.5,8.5 L-5,4.5 L5,4.5 L3.5,8.5 Z"/>
    <line ${S} x1="-7" y1="4.5" x2="7" y2="4.5"/>
    <line ${S} x1="0" y1="4.5" x2="0" y2="0"/>
    <path ${S} d="M0,0 Q-8,0.5 -6.5,-6.5 Q-1,-9.5 0,-8 Q1,-9.5 6.5,-6.5 Q8,0.5 0,0 Z"
      fill="rgba(255,255,255,0.08)"/>
    <line ${S} x1="0" y1="0" x2="0" y2="-8" stroke-opacity="0.35"/>
    <line ${S} x1="0" y1="-2.5" x2="-3.5" y2="-5" stroke-opacity="0.35"/>
    <line ${S} x1="0" y1="-5" x2="3.5" y2="-7" stroke-opacity="0.35"/>`,

  garaz: `
    <path ${S} d="M-9,-3.5 L0,-8.5 L9,-3.5"/>
    <rect ${S} x="-7.5" y="-3.5" width="15" height="11.5" rx="1"/>
    <line ${S} x1="-7.5" y1="0.2" x2="7.5" y2="0.2" stroke-opacity="0.55"/>
    <line ${S} x1="-7.5" y1="3.8" x2="7.5" y2="3.8" stroke-opacity="0.55"/>
    <circle ${S} cx="0" cy="6.5" r="1.1" stroke-opacity="0.72"/>`,
};

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
      room_type: 'salon',   // salon|sypialnia|biuro|lazienka|pokoj_dzieciecy|pergola|ogrod
      icon: '🛋️',           // emoji fallback when room_type not set
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

  _val(entity) {
    if (!this._hass || !entity) return null;
    const s = this._hass.states[entity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return parseFloat(s.state);
  }

  _tempState(t) {
    if (t === null) return {
      key: 'offline', cardBg: '#1c1c1e', cardBorder: 'rgba(255,255,255,0.07)',
      glowCss: '', tempColor: '#3a3a3c', iconBg: 'rgba(255,255,255,0.06)',
      arcG0: 'rgba(255,255,255,0.18)', arcG1: 'rgba(255,255,255,0.06)', label: 'offline',
    };
    if (t < 5) return {
      key: 'frost', cardBg: '#0b1420', cardBorder: 'rgba(90,200,250,0.35)',
      glowCss: 'radial-gradient(ellipse at 30% 25%, rgba(90,200,250,0.2) 0%, transparent 58%)',
      tempColor: '#5AC8FA', iconBg: 'rgba(90,200,250,0.15)',
      arcG0: '#8FDDFF', arcG1: '#1f7fd8', label: '❄️ mróz',
    };
    if (t < 17) return {
      key: 'cold', cardBg: '#101820', cardBorder: 'rgba(90,200,250,0.15)',
      glowCss: 'radial-gradient(ellipse at 30% 25%, rgba(90,200,250,0.10) 0%, transparent 55%)',
      tempColor: '#7dd4f8', iconBg: 'rgba(90,200,250,0.11)',
      arcG0: '#c0ecff', arcG1: '#5ab8ee', label: 'zimno',
    };
    if (t < 26) return {
      key: 'comfort', cardBg: '#1c1c1e', cardBorder: 'rgba(255,255,255,0.08)',
      glowCss: '',
      tempColor: '#ffffff', iconBg: 'rgba(255,255,255,0.08)',
      arcG0: '#5cf087', arcG1: '#1c9e40', label: 'komfort',
    };
    if (t < 31) return {
      key: 'warm', cardBg: '#1e1508', cardBorder: 'rgba(255,159,10,0.22)',
      glowCss: 'radial-gradient(ellipse at 70% 20%, rgba(255,159,10,0.15) 0%, transparent 55%)',
      tempColor: '#FF9F0A', iconBg: 'rgba(255,159,10,0.14)',
      arcG0: '#FFE066', arcG1: '#e87800', label: 'za ciepło',
    };
    return {
      key: 'fire', cardBg: '#1a0800', cardBorder: 'rgba(255,69,58,0.45)',
      glowCss: 'radial-gradient(ellipse at 50% 80%, rgba(255,80,0,0.30) 0%, transparent 62%)',
      tempColor: '#FF453A', iconBg: 'rgba(255,69,58,0.17)',
      arcG0: '#FF6B6B', arcG1: '#cc1500', label: '🔥 upał',
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
    const emojiIcon = cfg.icon || '🏠';
    const roomType  = cfg.room_type || null;
    const svgIcon   = roomType && ROOM_ICONS[roomType] ? ROOM_ICONS[roomType] : null;
    const uid  = this._uid;

    const temp = this._val(cfg.temp_entity);
    const hum  = this._val(cfg.humidity_entity);
    const bat  = this._val(cfg.battery_entity);

    const st      = this._tempState(temp);
    const humCol  = this._humArcColor(hum);
    const isOffline = temp === null;

    const minT = parseFloat(cfg.min_temp ?? -10);
    const maxT = parseFloat(cfg.max_temp ?? 40);

    const tempStr = isOffline ? '—' : temp.toFixed(1) + '°';
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
    const useGlow = st.key === 'frost' || st.key === 'fire' || st.key === 'warm';

    // Humidity zone label
    const humZone = hum === null ? '' : hum < 35 ? 'sucho' : hum < 66 ? 'komfort' : hum < 81 ? 'wilgotno' : 'b. wilgotno';

    /* ── SVG tooltip helper ── */
    const TT = { x: 61, y: 63, w: 78, h: 54, rx: 11 };
    const _tooltip = (label, valStr, valColor, extraClass) => `
      <g class="arc-tooltip ${extraClass}" pointer-events="none">
        <rect x="${TT.x}" y="${TT.y}" width="${TT.w}" height="${TT.h}" rx="${TT.rx}"
          fill="rgba(12,12,16,0.94)" stroke="rgba(255,255,255,0.10)" stroke-width="0.8"/>
        <text x="${CX}" y="${CY - 9}"
          text-anchor="middle" dominant-baseline="central"
          font-family="-apple-system,system-ui,sans-serif"
          font-size="8.5" font-weight="500" fill="rgba(255,255,255,0.38)">${label}</text>
        <text x="${CX}" y="${CY + 13}"
          text-anchor="middle" dominant-baseline="central"
          font-family="-apple-system,system-ui,sans-serif"
          font-size="22" font-weight="700" letter-spacing="-1"
          fill="${valColor}">${valStr}</text>
      </g>`;

    /* ── Pills — only for non-normal states (nie komfort/offline) ── */
    const pillDefs = {
      frost: { bg: 'rgba(90,200,250,0.14)',  border: 'rgba(90,200,250,0.35)',  color: '#5AC8FA' },
      cold:  { bg: 'rgba(90,200,250,0.09)',  border: 'rgba(90,200,250,0.22)',  color: '#7dd4f8' },
      warm:  { bg: 'rgba(255,159,10,0.12)',  border: 'rgba(255,159,10,0.30)',  color: '#FF9F0A' },
      fire:  { bg: 'rgba(255,69,58,0.14)',   border: 'rgba(255,69,58,0.35)',   color: '#FF453A' },
    };
    const pills = [];
    // temperature pill — only when NOT comfort and NOT offline
    const showTempPill = temp !== null && st.key !== 'comfort';
    if (showTempPill) {
      const p = pillDefs[st.key];
      if (p) pills.push({ label: st.label, ...p });
    }
    // humidity pill — only when out of healthy range
    if (hum !== null) {
      if      (hum < 35)  pills.push({ label: '🏜️ sucho',    bg: 'rgba(255,159,10,0.12)', border: 'rgba(255,159,10,0.30)', color: '#FF9F0A' });
      else if (hum >= 81) pills.push({ label: '💦 wilgotno', bg: 'rgba(10,132,255,0.12)', border: 'rgba(10,132,255,0.28)', color: '#0A84FF' });
    }
    const pillsHTML = pills.map(p =>
      `<span class="pill" style="background:${p.bg};border-color:${p.border};color:${p.color}">${p.label}</span>`
    ).join('');

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
  :host { display: block; width: 100%; height: 100%; }

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
    transition: background .5s ease, border-color .5s ease, transform .15s ease;
  }
  .card:active { transform: scale(0.97); }

  .bg-glow {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background: ${st.glowCss || 'none'}; transition: background .5s ease;
  }

  /* ── frost card + arc ── */
  @keyframes frost-pulse  { 0%,100%{opacity:.5}  50%{opacity:.95} }
  @keyframes frost-card   { 0%,100%{box-shadow:0 0 0 0 rgba(90,200,250,0)}   50%{box-shadow:0 0 22px 4px rgba(90,200,250,.20)} }
  @keyframes frost-arc    { 0%,100%{filter:brightness(1)}  50%{filter:brightness(1.28) saturate(1.3)} }

  /* ── frost icon: shiver + icy glow ── */
  @keyframes icon-frost {
    0%   { transform: scale(1) translateX(0);        box-shadow: 0 0 5px 1px rgba(90,200,250,0.35), inset 0 0 6px rgba(90,200,250,0.15); }
    18%  { transform: scale(1.05) translateX(-1.5px); box-shadow: 0 0 12px 3px rgba(90,200,250,0.65), inset 0 0 8px rgba(90,200,250,0.25); }
    36%  { transform: scale(0.97) translateX(1.5px);  box-shadow: 0 0 7px 2px rgba(90,200,250,0.45), inset 0 0 6px rgba(90,200,250,0.18); }
    54%  { transform: scale(1.04) translateX(-1px);   box-shadow: 0 0 16px 5px rgba(90,200,250,0.75), inset 0 0 10px rgba(140,220,255,0.3); }
    72%  { transform: scale(0.98) translateX(1px);    box-shadow: 0 0 9px 2px rgba(90,200,250,0.50), inset 0 0 7px rgba(90,200,250,0.2); }
    100% { transform: scale(1) translateX(0);        box-shadow: 0 0 5px 1px rgba(90,200,250,0.35), inset 0 0 6px rgba(90,200,250,0.15); }
  }

  /* ── fire card + arc ── */
  @keyframes fire-card    { 0%,100%{box-shadow:0 0 0 0 rgba(255,69,58,0)}    50%{box-shadow:0 0 26px 5px rgba(255,80,20,.25)} }
  @keyframes fire-arc     { 0%,100%{opacity:.9} 25%{opacity:1;filter:brightness(1.32) saturate(1.4)} 75%{opacity:.82;filter:brightness(.88)} }
  @keyframes fire-shimmer { 0%,100%{opacity:.55;transform:scaleY(1)} 50%{opacity:.9;transform:scaleY(1.07)} }

  /* ── fire icon: flicker + rising glow ── */
  @keyframes icon-fire {
    0%   { transform: scale(1)    translateY(0px)   scaleX(1);    box-shadow: 0 -3px 8px  2px rgba(255,80,0,0.50); }
    12%  { transform: scale(1.07) translateY(-2px)  scaleX(0.94); box-shadow: 0 -5px 18px 4px rgba(255,110,0,0.75); }
    28%  { transform: scale(0.96) translateY( 0px)  scaleX(1);    box-shadow: 0 -2px 5px  1px rgba(255,60,0,0.35); }
    45%  { transform: scale(1.09) translateY(-3px)  scaleX(0.91); box-shadow: 0 -6px 22px 5px rgba(255,130,0,0.85); }
    62%  { transform: scale(0.97) translateY(-1px)  scaleX(1.02); box-shadow: 0 -3px 10px 2px rgba(255,80,0,0.55); }
    78%  { transform: scale(1.06) translateY(-2px)  scaleX(0.95); box-shadow: 0 -5px 16px 3px rgba(255,100,0,0.70); }
    90%  { transform: scale(0.98) translateY( 0px)  scaleX(1);    box-shadow: 0 -2px 6px  1px rgba(255,60,0,0.40); }
    100% { transform: scale(1)    translateY(0px)   scaleX(1);    box-shadow: 0 -3px 8px  2px rgba(255,80,0,0.50); }
  }

  /* ── warm icon: gentle warm pulse ── */
  @keyframes icon-warm {
    0%,100% { box-shadow: 0 0 5px 1px rgba(255,159,10,0.35); }
    50%     { box-shadow: 0 0 12px 3px rgba(255,159,10,0.65); transform: scale(1.04); }
  }

  /* ── cold icon: slow cool pulse ── */
  @keyframes icon-cold {
    0%,100% { box-shadow: 0 0 4px 1px rgba(90,200,250,0.22); }
    50%     { box-shadow: 0 0 9px 2px rgba(90,200,250,0.42); }
  }

  .card.frost { animation: frost-card 3.5s ease-in-out infinite; }
  .card.fire  { animation: fire-card  2.5s ease-in-out infinite; }
  .card.frost .arc-temp-fill { animation: frost-arc 3.5s ease-in-out infinite; }
  .card.fire  .arc-temp-fill { animation: fire-arc  2.2s ease-in-out infinite; }

  /* icon animations — SVG text element, use drop-shadow + transform */
  .icon-svg { transform-box: fill-box; transform-origin: center; transition: opacity .2s ease; }
  .card.frost .icon-svg { animation: icon-frost-svg 2.8s ease-in-out infinite; }
  .card.fire  .icon-svg { animation: icon-fire-svg  1.6s ease-in-out infinite; }
  .card.warm  .icon-svg { animation: icon-warm-svg  2.4s ease-in-out infinite; }
  .card.cold  .icon-svg { animation: icon-cold-svg  3.5s ease-in-out infinite; }

  @keyframes icon-frost-svg {
    0%   { transform: scale(1)    translateX(0px);    filter: drop-shadow(0 0 2px rgba(90,200,250,0.40)); }
    18%  { transform: scale(1.08) translateX(-1.5px); filter: drop-shadow(0 0 7px rgba(90,200,250,0.85)); }
    36%  { transform: scale(0.95) translateX(1.5px);  filter: drop-shadow(0 0 3px rgba(90,200,250,0.50)); }
    54%  { transform: scale(1.06) translateX(-1px);   filter: drop-shadow(0 0 11px rgba(90,200,250,1.0)); }
    72%  { transform: scale(0.97) translateX(1px);    filter: drop-shadow(0 0 5px rgba(90,200,250,0.60)); }
    100% { transform: scale(1)    translateX(0px);    filter: drop-shadow(0 0 2px rgba(90,200,250,0.40)); }
  }
  @keyframes icon-fire-svg {
    0%   { transform: scale(1)    translateY(0px)  scaleX(1);    filter: drop-shadow(0 -2px 4px rgba(255,80,0,0.55)); }
    12%  { transform: scale(1.10) translateY(-2px) scaleX(0.91); filter: drop-shadow(0 -4px 10px rgba(255,110,0,0.85)); }
    28%  { transform: scale(0.95) translateY(0px)  scaleX(1);    filter: drop-shadow(0 -1px 2px rgba(255,60,0,0.40)); }
    45%  { transform: scale(1.13) translateY(-3px) scaleX(0.89); filter: drop-shadow(0 -5px 14px rgba(255,140,0,1.0)); }
    62%  { transform: scale(0.97) translateY(-1px) scaleX(1.02); filter: drop-shadow(0 -2px 6px rgba(255,80,0,0.60)); }
    78%  { transform: scale(1.08) translateY(-2px) scaleX(0.93); filter: drop-shadow(0 -4px 9px rgba(255,100,0,0.75)); }
    100% { transform: scale(1)    translateY(0px)  scaleX(1);    filter: drop-shadow(0 -2px 4px rgba(255,80,0,0.55)); }
  }
  @keyframes icon-warm-svg {
    0%,100% { filter: drop-shadow(0 0 2px rgba(255,159,10,0.35)); }
    50%     { transform: scale(1.05); filter: drop-shadow(0 0 7px rgba(255,159,10,0.70)); }
  }
  @keyframes icon-cold-svg {
    0%,100% { filter: drop-shadow(0 0 2px rgba(90,200,250,0.22)); }
    50%     { filter: drop-shadow(0 0 6px rgba(90,200,250,0.50)); }
  }

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

  /* ── pills — absolute overlay top-right ── */
  .pills-wrap {
    position: absolute; top: 8px; right: 8px; z-index: 5;
    display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
    justify-content: flex-end;
  }
  .pill {
    display: inline-flex; align-items: center;
    padding: 2px 7px; border-radius: 99px; border: .5px solid;
    font-size: 8px; font-weight: 600; white-space: nowrap;
    letter-spacing: .01em;
  }

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

  /* ══ HOVER FOCUS MODE ══
     When hovering an arc:
     - the hovered arc brightens (in SVG)
     - opposite arc dims to 20%
     - chrome (top-row, room-name) dims to 30%
     - center-val fades out, tooltip fades in
  */

  /* opposite arc dims */
  #g-temp, #g-hum { transition: opacity .22s ease; }
  .gauge-svg:has(#g-temp:hover) #g-hum { opacity: 0.18; }
  .gauge-svg:has(#g-hum:hover)  #g-temp { opacity: 0.18; }

  /* chrome dims */
  .pills-wrap { transition: opacity .22s ease; }
  .card:has(#g-temp:hover) .pills-wrap,
  .card:has(#g-hum:hover)  .pills-wrap,
  .card:has(#g-temp:hover) .room-name,
  .card:has(#g-hum:hover)  .room-name { opacity: 0.28; }

  /* arc fill brightens */
  .arc-temp-fill, .arc-hum-fill { transition: filter .2s ease; }
  #g-temp:hover .arc-temp-fill { filter: brightness(1.4) saturate(1.15) !important; }
  #g-hum:hover  .arc-hum-fill  { filter: brightness(1.4) saturate(1.15); }

  /* arc track brightens slightly */
  #g-temp:hover .arc-track-temp,
  #g-hum:hover  .arc-track-hum  { filter: brightness(3); transition: filter .2s ease; }

  /* center temp value fades out → tooltip fades in */
  .center-val {
    font-family: -apple-system,system-ui,sans-serif;
    font-size: 34px; font-weight: 700; letter-spacing: -1.5px;
    fill: ${st.tempColor}; transition: opacity .2s ease;
    cursor: pointer;
  }
  .gauge-svg:has(#g-temp:hover) .center-val,
  .gauge-svg:has(#g-hum:hover)  .center-val { opacity: 0; }

  /* tooltip */
  .arc-tooltip { opacity: 0; transition: opacity .2s ease; pointer-events: none; }
  .gauge-svg:has(#g-temp:hover) .arc-tooltip-temp,
  .gauge-svg:has(#g-hum:hover)  .arc-tooltip-hum  { opacity: 1; }

  .range-text {
    font-family: -apple-system,system-ui,sans-serif;
    font-size: 8px; font-weight: 500; fill: rgba(255,255,255,.18);
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

  ${batHTML}

  <!-- PILLS: absolute overlay top-right -->
  <div class="pills-wrap">${pillsHTML}</div>

  <!-- GAUGE -->
  <div class="gauge-wrap">
    <svg class="gauge-svg" viewBox="0 0 200 166" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tg-${uid}" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${st.arcG1}"/>
          <stop offset="100%" stop-color="${st.arcG0}"/>
        </linearGradient>
        <filter id="arc-glow-${uid}" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="dot-glow-${uid}" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="cg-${uid}" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stop-color="${isOffline ? 'transparent' : st.arcG1 + '18'}"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
      </defs>

      <!-- ambient glow in center -->
      <circle cx="${CX}" cy="${CY}" r="${R2 - SW2/2 - 4}" fill="url(#cg-${uid})"/>

      <!-- temperature value — fades when arc hovered -->
      <text id="temp-hit" class="center-val"
        x="${CX}" y="${CY}"
        text-anchor="middle" dominant-baseline="central">${tempStr}</text>

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
          ${useGlow ? `filter="url(#arc-glow-${uid})"` : ''}/>
        ` : ''}

        <!-- hit area -->
        <circle cx="${CX}" cy="${CY}" r="${R1}"
          fill="none" stroke="rgba(255,255,255,0.004)" stroke-width="24"
          stroke-dasharray="${ARC1.toFixed(2)} ${C1.toFixed(2)}"
          stroke-linecap="round" transform="rotate(135,${CX},${CY})"
          pointer-events="stroke"/>

        <!-- tooltip -->
        ${_tooltip('🌡️ Temperatura · ' + st.label, tempStr, st.tempColor, 'arc-tooltip-temp')}
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

        <!-- tooltip -->
        ${_tooltip('💧 Wilgotność · ' + (humZone || '—'), humStr, humCol, 'arc-tooltip-hum')}
      </g>

      <!-- indicator dot -->
      ${!isOffline && tempFillLen > 3 ? `
      <circle class="dot-outer" cx="${dotX.toFixed(2)}" cy="${dotY.toFixed(2)}" r="5"
        fill="${st.arcG0}" opacity="0.85" filter="url(#dot-glow-${uid})"/>
      <circle cx="${dotX.toFixed(2)}" cy="${dotY.toFixed(2)}" r="2.8"
        fill="rgba(255,255,255,0.95)"/>
      ` : ''}

      <!-- range labels — flanking the gap -->
      <text x="${(CX + LR * Math.cos(minA)).toFixed(1)}" y="${(CY + LR * Math.sin(minA) + 3).toFixed(1)}"
        text-anchor="end"   class="range-text">${fmtT(minT)}</text>
      <text x="${(CX + LR * Math.cos(maxA)).toFixed(1)}" y="${(CY + LR * Math.sin(maxA) + 3).toFixed(1)}"
        text-anchor="start" class="range-text">${fmtT(maxT)}</text>

      <!-- icon inside gauge — centered in the arc gap at the bottom -->
      ${svgIcon
        ? `<g transform="translate(${CX},148) scale(1.5)" pointer-events="none">
             <g class="icon-svg">${svgIcon}</g>
           </g>`
        : `<text class="icon-svg"
             x="${CX}" y="148"
             text-anchor="middle" dominant-baseline="central"
             font-size="26">${emojiIcon}</text>`
      }
    </svg>
  </div>

  <!-- ROOM NAME: HTML element at bottom -->
  <div class="room-name">${name}</div>
</div>`;

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
    border-radius: 20px;
    padding: 10px 10px 8px;
    display: flex;
    flex-direction: column;
    aspect-ratio: 1 / 1;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.15s ease, border-color 0.4s ease;
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
    background: #1c1c1e;
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
    transition: background 0.4s ease;
  }

  /* State pill — absolute top-right (jak pills w temp-gauge) */
  .pill-wrap {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 5;
  }

  .state-pill {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    border-radius: 99px;
    border: .5px solid;
    font-size: 8px;
    font-weight: 600;
    white-space: nowrap;
    letter-spacing: .01em;
  }

  .closed .state-pill { display: none; }
  .open   .state-pill {
    background: rgba(255,214,10,0.12);
    border-color: rgba(255,214,10,0.30);
    color: #ffd60a;
  }
  .alarm  .state-pill {
    background: rgba(255,69,58,0.14);
    border-color: rgba(255,69,58,0.35);
    color: #ff453a;
  }

  /* Icon area — wypełnia dostępną przestrzeń, centruje ikonę jak gauge w temp-gauge */
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
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-bg {
    width: 50px;
    height: 50px;
    border-radius: 15px;
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
    width: 50px;
    height: 50px;
    border-radius: 15px;
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

  /* Duration — czas otwarcia, muted, centered */
  .duration {
    text-align: center;
    font-size: 10px;
    font-weight: 500;
    color: #636366;
    position: relative;
    z-index: 2;
    flex-shrink: 0;
    padding-bottom: 4px;
    transition: color 0.4s ease, font-weight 0.3s ease;
  }
  .alarm .duration { color: #ff6b60; font-weight: 600; }
  .closed .duration { display: none; }

  /* Name — identyczny z .room-name w temp-gauge */
  .name {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.65);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    this._config = {
      alarm_minutes: 10,
      icon_closed: 'mdi:lock',
      icon_open:   'mdi:lock-open-variant',
      icon_alarm:  'mdi:bell-alert',
      ...config,
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
      <div class="pill-wrap">
        <span class="state-pill"></span>
      </div>
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
    this._stateEl     = shadow.querySelector('.state-pill');
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
      stateText    = 'ALARM';
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
});