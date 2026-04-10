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
  textSecondary: '#AEAEB2',
  textTertiary:  '#636366',
  urgent:        '#FF453A',
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

customElements.define('aha-waste-schedule-apple-card', WasteScheduleAppleCard);