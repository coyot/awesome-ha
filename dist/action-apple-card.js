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
});