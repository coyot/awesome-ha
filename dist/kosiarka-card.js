class KosiarkaCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = null;
    this._animFrame = null;
  }

  setConfig(config) {
    if (!config.entity) throw new Error('Podaj entity kosiarski');
    this._config = {
      entity: config.entity,
      name: config.name || 'Kosiarka',
      capacity_m2: config.capacity_m2 || 400,
      battery_entity:    config.battery_entity    || null,
      party_mode_entity: config.party_mode_entity || null,
      error_entity:      config.error_entity      || null,
    };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._updateState();
  }

  _getState() {
    if (!this._hass || !this._config) return null;
    const e = this._hass.states[this._config.entity];
    if (!e) return null;
    const a = e.attributes || {};
    const cfg = this._config;

    // Battery: dedicated sensor → attribute fallback
    let battery = a.battery_level ?? a.battery ?? null;
    if (cfg.battery_entity) {
      const bs = this._hass.states[cfg.battery_entity];
      if (bs && bs.state !== 'unavailable' && bs.state !== 'unknown') {
        const v = parseFloat(bs.state);
        if (!isNaN(v)) battery = v;
      }
    }

    // Error: dedicated sensor → attribute fallback
    let error = a.error ?? a.error_description ?? null;
    if (cfg.error_entity) {
      const es = this._hass.states[cfg.error_entity];
      if (es && es.state !== 'unavailable' && es.state !== 'unknown' && es.state !== '0' && es.state !== 'none') {
        error = es.attributes?.friendly_name
              ? `${es.attributes.friendly_name}: ${es.state}`
              : es.state;
      }
    }

    // Party mode: dedicated switch entity
    let partyMode = false;
    if (cfg.party_mode_entity) {
      const ps = this._hass.states[cfg.party_mode_entity];
      if (ps) partyMode = ps.state === 'on';
    }

    return {
      state: e.state,
      battery,
      activity: a.activity ?? a.status_description ?? null,
      zone: a.zone ?? a.current_zone ?? null,
      area_today: a.work_time_today ?? null,
      distance_today: a.distance ?? null,
      error,
      partyMode,
      next_schedule: a.next_schedule ?? null,
      pitch: a.pitch ?? null,
      rssi: a.rssi ?? null,
    };
  }

  _stateLabel(state) {
    const map = {
      mowing: 'Kosi',
      docking: 'Wraca do bazy',
      docked: 'W bazie',
      charging: 'Ładuje się',
      paused: 'Zatrzymana',
      returning: 'Wraca',
      idle: 'Bezczynna',
      error: 'Błąd',
      unknown: 'Nieznany',
      unavailable: 'Niedostępna',
    };
    return map[state] || state;
  }

  _stateColor(state) {
    const map = {
      mowing: '#30d158',
      docked: '#0a84ff',
      charging: '#ff9f0a',
      docking: '#ff9f0a',
      returning: '#ff9f0a',
      paused: '#636366',
      error: '#ff453a',
      idle: '#636366',
    };
    return map[state] || '#636366';
  }

  _render() {
    if (!this._config) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .card {
          background: #1c1c1e;
          border-radius: 20px;
          overflow: hidden;
          border: 0.5px solid rgba(255,255,255,0.08);
          position: relative;
          user-select: none;
        }

        /* ── glow behind card based on state ── */
        .card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }
        .card.mowing::before { background: radial-gradient(ellipse at 50% 0%, rgba(48,209,88,0.07) 0%, transparent 70%); opacity: 1; }
        .card.charging::before { background: radial-gradient(ellipse at 50% 0%, rgba(255,159,10,0.07) 0%, transparent 70%); opacity: 1; }
        .card.docked::before { background: radial-gradient(ellipse at 50% 0%, rgba(10,132,255,0.06) 0%, transparent 70%); opacity: 1; }
        .card.error::before { background: radial-gradient(ellipse at 50% 0%, rgba(255,69,58,0.08) 0%, transparent 70%); opacity: 1; }

        /* ── header ── */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 18px 0;
        }
        .header-left { display: flex; align-items: center; gap: 12px; }

        .icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.4s ease;
          flex-shrink: 0;
        }

        .icon-wrap svg {
          width: 24px;
          height: 24px;
          transition: stroke 0.4s ease;
        }

        .name { font-size: 15px; font-weight: 600; color: #fff; letter-spacing: -0.2px; }
        .status-pill {
          font-size: 11px;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 20px;
          margin-top: 3px;
          display: inline-block;
          transition: background 0.4s, color 0.4s;
          letter-spacing: 0.01em;
        }

        /* ── battery ── */
        .battery {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .bat-shell {
          position: relative;
          width: 28px;
          height: 13px;
          border: 1.5px solid rgba(255,255,255,0.25);
          border-radius: 3px;
        }
        .bat-shell::after {
          content: '';
          position: absolute;
          right: -4px;
          top: 50%;
          transform: translateY(-50%);
          width: 2.5px;
          height: 6px;
          background: rgba(255,255,255,0.25);
          border-radius: 0 1.5px 1.5px 0;
        }
        .bat-fill {
          position: absolute;
          left: 2px;
          top: 2px;
          bottom: 2px;
          border-radius: 1.5px;
          transition: width 0.6s ease, background 0.4s;
        }
        .bat-pct { font-size: 12px; color: #a1a1a6; font-weight: 500; }

        /* ── animated mower SVG area ── */
        .mower-area {
          padding: 20px 18px 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100px;
          position: relative;
        }

        /* grass strips */
        .grass-row {
          display: flex;
          gap: 3px;
          position: absolute;
          bottom: 8px;
          left: 18px;
          right: 18px;
          height: 6px;
        }
        .grass-strip {
          flex: 1;
          border-radius: 3px;
          background: rgba(48,209,88,0.12);
          transition: background 0.3s;
        }
        .grass-strip.cut { background: rgba(48,209,88,0.35); }

        .mower-svg {
          position: relative;
          z-index: 2;
        }
        .mower-svg svg { width: 64px; height: 64px; }

        /* mowing animation */
        @keyframes mow-float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-3px) rotate(1deg); }
        }
        @keyframes mow-drive {
          0% { left: 15%; }
          50% { left: 65%; }
          100% { left: 15%; }
        }
        .mowing-wrap {
          position: absolute;
          animation: mow-float 2s ease-in-out infinite, mow-drive 8s ease-in-out infinite;
        }
        @keyframes dock-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        .docked-wrap { animation: dock-float 3s ease-in-out infinite; }

        /* returning/docking — szybszy, kierunkowy ruch */
        @keyframes return-drive {
          0%   { transform: translateY(0px) translateX(4px) rotate(1deg); }
          50%  { transform: translateY(-3px) translateX(-4px) rotate(-1deg); }
          100% { transform: translateY(0px) translateX(4px) rotate(1deg); }
        }
        .returning-wrap {
          animation: return-drive 1.4s ease-in-out infinite;
        }

        /* ── divider ── */
        .divider { height: 0.5px; background: rgba(255,255,255,0.07); margin: 12px 18px; }

        /* ── metrics row ── */
        .metrics {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          padding: 0 18px;
        }
        .metric {
          background: #2c2c2e;
          border-radius: 12px;
          padding: 11px 10px 10px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .metric-icon { margin-bottom: 2px; }
        .metric-icon svg { width: 14px; height: 14px; stroke: #636366; }
        .metric-val { font-size: 14px; font-weight: 600; color: #fff; letter-spacing: -0.3px; }
        .metric-label { font-size: 10px; color: #636366; font-weight: 500; letter-spacing: 0.02em; text-transform: uppercase; }

        /* ── progress bar ── */
        .progress-wrap { padding: 10px 18px 0; }
        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #636366;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .progress-track {
          height: 3px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.8s ease, background 0.4s;
        }

        /* ── actions ── */
        .actions {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          padding: 14px 18px 18px;
        }
        .action-btn {
          border: none;
          cursor: pointer;
          border-radius: 12px;
          padding: 11px 6px 9px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.01em;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          transition: opacity 0.15s, transform 0.12s;
          -webkit-tap-highlight-color: transparent;
        }
        .action-btn:active { opacity: 0.7; transform: scale(0.96); }
        .action-btn svg { width: 18px; height: 18px; }

        .btn-start { background: #0a84ff; color: #fff; }
        .btn-pause { background: rgba(255,159,10,0.18); color: #ff9f0a; }
        .btn-home  { background: #2c2c2e; color: #a1a1a6; }
        .btn-disabled { opacity: 0.35; pointer-events: none; }

        /* ── error bar ── */
        .error-bar {
          margin: 0 18px 0;
          background: rgba(255,69,58,0.12);
          border: 0.5px solid rgba(255,69,58,0.25);
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 12px;
          color: #ff453a;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .error-bar svg { width: 14px; height: 14px; flex-shrink: 0; }

        /* ── unavailable overlay ── */
        .unavail {
          padding: 40px 18px;
          text-align: center;
          color: #636366;
          font-size: 13px;
        }
      </style>

      <div class="card" id="card">
        <div id="content"></div>
      </div>
    `;
    this._updateState();
  }

  _updateState() {
    const root = this.shadowRoot;
    if (!root) return;
    const content = root.getElementById('content');
    const card = root.getElementById('card');
    if (!content || !card) return;

    const s = this._getState();
    const cfg = this._config;

    if (!s) {
      card.className = 'card';
      content.innerHTML = `<div class="unavail">Encja nie znaleziona:<br><code>${cfg.entity}</code></div>`;
      return;
    }

    const state = s.state || 'unknown';
    const color = this._stateColor(state);
    const label = this._stateLabel(state);
    const battery = s.battery;
    const batColor = battery === null ? '#636366' : battery > 50 ? '#30d158' : battery > 20 ? '#ff9f0a' : '#ff453a';
    const batWidth = battery === null ? 50 : Math.max(4, battery);

    card.className = `card ${state}`;

    // mower animation wrapper class
    let moverClass = 'docked-wrap';
    if (state === 'mowing') moverClass = 'mowing-wrap';
    if (state === 'docking' || state === 'returning') moverClass = 'returning-wrap';

    // grass strips — fill based on fake progress
    const grassCount = 12;
    const progress = this._getProgress(s);
    const cutCount = Math.round((progress / 100) * grassCount);
    const grassHtml = Array.from({ length: grassCount }, (_, i) =>
      `<div class="grass-strip${i < cutCount ? ' cut' : ''}"></div>`
    ).join('');

    const mowerSvg = `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="22" width="48" height="24" rx="7" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="1.5"/>
        <rect x="14" y="28" width="36" height="12" rx="4" fill="${color}" fill-opacity="0.12"/>
        <circle cx="17" cy="48" r="6" fill="#2c2c2e" stroke="${color}" stroke-width="1.5"/>
        <circle cx="17" cy="48" r="2.5" fill="${color}"/>
        <circle cx="47" cy="48" r="6" fill="#2c2c2e" stroke="${color}" stroke-width="1.5"/>
        <circle cx="47" cy="48" r="2.5" fill="${color}"/>
        <rect x="28" y="14" width="8" height="10" rx="2" fill="${color}" fill-opacity="0.6"/>
        <line x1="32" y1="14" x2="32" y2="22" stroke="${color}" stroke-width="1.5"/>
        ${state === 'mowing' ? `
        <path d="M6 54 Q12 50 18 54 Q24 58 30 54" stroke="${color}" stroke-width="1" stroke-opacity="0.4" fill="none"/>
        ` : ''}
      </svg>`;

    const fmtTime = (mins) => {
      const v = parseInt(mins);
      if (isNaN(v) || v <= 0) return '—';
      if (v < 60) return `${v}min`;
      const h = Math.floor(v / 60), m = v % 60;
      return m === 0 ? `${h}h` : `${h}h ${m}m`;
    };
    const metricTime = fmtTime(s.area_today);
    const metricDist = s.distance_today ? `${(s.distance_today / 1000).toFixed(1)}km` : '—';
    const metricArea = `${cfg.capacity_m2}m²`;

    const isMowing = state === 'mowing';
    const isDocked = ['docked', 'charging'].includes(state);
    const isError = state === 'error';

    content.innerHTML = `
      <div class="header">
        <div class="header-left">
          <div class="icon-wrap" style="background: ${color}1a;">
            <svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="8" width="20" height="10" rx="4"/>
              <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>
              <circle cx="7" cy="18" r="2" fill="${color}" stroke="none"/>
              <circle cx="17" cy="18" r="2" fill="${color}" stroke="none"/>
            </svg>
          </div>
          <div>
            <div class="name">${cfg.name}</div>
            <div class="status-pill" style="background:${color}1a; color:${color};">${label}${s.zone !== null ? ` · strefa ${s.zone}` : ''}${s.partyMode ? ' · party' : ''}</div>
          </div>
        </div>
        <div class="battery">
          <div class="bat-shell">
            <div class="bat-fill" style="width:${batWidth}%; background:${batColor};"></div>
          </div>
          <div class="bat-pct">${battery !== null ? battery + '%' : '—'}</div>
        </div>
      </div>

      <div class="mower-area">
        <div class="${moverClass} mower-svg">${mowerSvg}</div>
        <div class="grass-row">${grassHtml}</div>
      </div>

      ${isError && s.error ? `
      <div class="error-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ff453a" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        ${s.error}
      </div>` : ''}

      <div class="divider"></div>

      <div class="metrics">
        <div class="metric">
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
          </div>
          <div class="metric-val">${metricTime}</div>
          <div class="metric-label">Czas dziś</div>
        </div>
        <div class="metric">
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          </div>
          <div class="metric-val">${metricDist}</div>
          <div class="metric-label">Dystans</div>
        </div>
        <div class="metric">
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          </div>
          <div class="metric-val">${metricArea}</div>
          <div class="metric-label">Ogród</div>
        </div>
      </div>

      ${progress > 0 ? `
      <div class="progress-wrap">
        <div class="progress-label">
          <span>${state === 'docked' || state === 'charging' ? 'Naładowana' : 'Postęp koszenia'}</span>
          <span>${progress}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${progress}%; background:${color};"></div>
        </div>
      </div>` : ''}

      <div class="actions">
        <button class="action-btn btn-start${isMowing ? ' btn-disabled' : ''}" id="btn-start">
          <svg viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Start
        </button>
        <button class="action-btn btn-pause${!isMowing ? ' btn-disabled' : ''}" id="btn-pause">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ff9f0a" stroke-width="2.5"><rect x="6" y="4" width="4" height="16" rx="1" fill="#ff9f0a" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" fill="#ff9f0a" stroke="none"/></svg>
          Pauza
        </button>
        <button class="action-btn btn-home${isDocked ? ' btn-disabled' : ''}" id="btn-home">
          <svg viewBox="0 0 24 24" fill="none" stroke="#a1a1a6" stroke-width="1.5" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Baza
        </button>
      </div>
    `;

    // bind actions
    this._bindActions(state);
  }

  _getProgress(s) {
    if (s.state === 'docked' || s.state === 'charging') return 100;
    // Brak wiarygodnego źródła procentu — ukryjemy pasek gdy 0
    return 0;
  }

  _bindActions(state) {
    const root = this.shadowRoot;
    const hass = this._hass;
    const entity = this._config.entity;

    const call = (service) => {
      hass.callService('lawn_mower', service, { entity_id: entity });
    };

    const s = root.getElementById('btn-start');
    const p = root.getElementById('btn-pause');
    const h = root.getElementById('btn-home');

    if (s) s.addEventListener('click', () => call('start_mowing'));
    if (p) p.addEventListener('click', () => call('pause'));
    if (h) h.addEventListener('click', () => call('dock'));
  }

  static getConfigElement() {
    return document.createElement('div');
  }

  static getStubConfig() {
    return {
      entity:            'lawn_mower.kosiarka',
      name:              'Kosiarka',
      capacity_m2:       400,
      battery_entity:    'sensor.kosiarka_battery',
      party_mode_entity: 'switch.s_party_mode',
      error_entity:      'sensor.kosiarka_errory',
    };
  }

  getCardSize() { return 5; }
}

customElements.define('aha-kosiarka-card', KosiarkaCard);
if (!customElements.get('kosiarka-card'))
  customElements.define('kosiarka-card', class extends KosiarkaCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-kosiarka-card',
  name:        'Kosiarka Card',
  description: 'Apple-style karta dla kosiark Worx Landroid / lawn_mower',
  preview:     true,
});