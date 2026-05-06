/**
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
    background: #1c1c1e;
    border-radius: 16px;
    overflow: hidden;
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

  .btns { display: flex; gap: 6px; }
  .btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
    padding: 10px 4px; border-radius: 10px;
    font-size: 10px; font-weight: 500;
    color: rgba(255,255,255,0.45);
    border: 0.5px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.05);
    cursor: pointer; transition: color 0.15s, background 0.15s, transform 0.1s;
    -webkit-tap-highlight-color: transparent;
    font-family: -apple-system, system-ui, sans-serif;
  }
  .btn:active { transform: scale(0.95); }
  .btn.disabled { opacity: 0.3; pointer-events: none; }
  .btn.green  { background: rgba(151,196,89,0.12);  color: #97C459;  border-color: rgba(151,196,89,0.22); }
  .btn.orange { background: rgba(239,159,39,0.10);  color: #EF9F27;  border-color: rgba(239,159,39,0.20); }

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

    // Section 5: Error (optional)
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

    // Section 6: Buttons
    sections.push('<div class="sep"></div>');
    sections.push(`<div class="section">${this._renderButtons(d)}</div>`);

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

  _renderButtons(d) {
    const { isMowing, isDocked, isCharging } = d;
    const isDockable = isDocked || isCharging;

    const btnSvgPlay  = `<svg width="11" height="11" viewBox="0 0 14 14" fill="currentColor"><polygon points="3 1 13 7 3 13"/></svg>`;
    const btnSvgPause = `<svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="2" x2="4" y2="12"/><line x1="10" y1="2" x2="10" y2="12"/></svg>`;
    const btnSvgHome  = `<svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 6L7 1l6 5v6a1 1 0 0 1-1 1H8v-4H6v4H2a1 1 0 0 1-1-1z"/></svg>`;

    return `<div class="btns">
      <button id="btn-start" class="btn ${isMowing ? 'disabled' : 'green'}">${btnSvgPlay} Start</button>
      <button id="btn-pause" class="btn ${!isMowing ? 'disabled' : 'orange'}">${btnSvgPause} Pauza</button>
      <button id="btn-dock"  class="btn ${isDockable ? 'disabled' : ''}">${btnSvgHome} Do bazy</button>
    </div>`;
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
    this.shadowRoot.querySelector('.card')?.addEventListener('click', e => {
      if (!e.target.closest('button')) this._moreInfo();
    });
    this.shadowRoot.querySelector('#btn-start')?.addEventListener('click', e => {
      e.stopPropagation(); this._callService('start_mowing');
    });
    this.shadowRoot.querySelector('#btn-pause')?.addEventListener('click', e => {
      e.stopPropagation(); this._callService('pause');
    });
    this.shadowRoot.querySelector('#btn-dock')?.addEventListener('click', e => {
      e.stopPropagation(); this._callService('dock');
    });
  }

  _callService(service) {
    this._hass.callService('lawn_mower', service, { entity_id: this._config.entity });
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
