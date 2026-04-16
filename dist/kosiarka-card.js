/**
 * kosiarka-card.js
 * Pełna karta dla lawn_mower — styl zbliżony do teleco-card / Lamele.
 * Kompaktowa: ikonka w boxie, bateria jako duża liczba, pasek, przyciski.
 *
 * Config:
 *   entity:            (required) lawn_mower.*
 *   name:              (optional) override nazwy
 *   capacity_m2:       (optional) powierzchnia ogrodu w m², default 400
 *   battery_entity:    (optional) sensor.* — poziom baterii
 *   party_mode_entity: (optional) switch.* — tryb party
 *   error_entity:      (optional) sensor.* — komunikat błędu
 */

class KosiarkaCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._rendered = false;
  }

  setConfig(config) {
    if (!config.entity) throw new Error('Podaj entity kosiarski');
    this._config = {
      entity:            config.entity,
      name:              config.name              || 'Kosiarka',
      capacity_m2:       config.capacity_m2       || 400,
      battery_entity:    config.battery_entity    || null,
      party_mode_entity: config.party_mode_entity || null,
      error_entity:      config.error_entity      || null,
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) { this._render(); this._rendered = true; }
    this._update();
  }

  /* ─── helpers ─────────────────────────────────────────── */

  _stateColor(state) {
    return {
      mowing:    '#97C459',
      docking:   '#85B7EB',
      returning: '#85B7EB',
      charging:  '#FF9F0A',
      paused:    '#FF9F0A',
      docked:    '#636366',
      error:     '#FF453A',
      idle:      '#636366',
    }[state] || '#636366';
  }

  _stateLabel(state) {
    return {
      mowing:      'Kosi',
      docking:     'Wraca do bazy',
      returning:   'Wraca',
      charging:    'Ładuje się',
      paused:      'Pauza',
      docked:      'W bazie',
      error:       'Błąd',
      idle:        'Bezczynna',
      unknown:     'Nieznany',
      unavailable: 'Niedostępna',
    }[state] || state;
  }

  _getData() {
    const hass = this._hass;
    const cfg  = this._config;
    const e    = hass.states[cfg.entity];
    if (!e) return null;
    const a = e.attributes || {};

    let battery = a.battery_level ?? a.battery ?? null;
    if (cfg.battery_entity) {
      const bs = hass.states[cfg.battery_entity];
      if (bs && bs.state !== 'unavailable' && bs.state !== 'unknown') {
        const v = parseFloat(bs.state);
        if (!isNaN(v)) battery = v;
      }
    }

    let error = a.error ?? a.error_description ?? null;
    if (cfg.error_entity) {
      const es = hass.states[cfg.error_entity];
      if (es && es.state !== 'unavailable' && es.state !== 'unknown'
             && es.state !== '0' && es.state !== 'none') {
        error = es.state;
      }
    }

    let partyMode = false;
    if (cfg.party_mode_entity) {
      const ps = hass.states[cfg.party_mode_entity];
      if (ps) partyMode = ps.state === 'on';
    }

    return {
      state:    e.state || 'unknown',
      battery,
      zone:     a.zone ?? a.current_zone ?? null,
      workTime: a.work_time_today ?? null,
      error,
      partyMode,
    };
  }

  /* ─── SVG icons ───────────────────────────────────────── */

  _svgMowing(col) {
    return `<svg width="26" height="26" viewBox="0 0 26 26" fill="none"
        style="animation:kos-mow 1.8s ease-in-out infinite;">
      <rect x="3" y="9" width="20" height="11" rx="4" stroke="${col}" stroke-width="1.4"/>
      <circle cx="8" cy="20" r="2.5" fill="none" stroke="${col}" stroke-width="1.2"/>
      <circle cx="18" cy="20" r="2.5" fill="none" stroke="${col}" stroke-width="1.2"/>
      <path d="M10 9V7a3 3 0 0 1 6 0v2" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M3 15 Q6 14 9 15" stroke="${col}" stroke-width="0.9" stroke-opacity="0.5" fill="none"/>
    </svg>`;
  }

  _svgReturning(col) {
    return `<svg width="26" height="26" viewBox="0 0 26 26" fill="none"
        style="animation:kos-ret 1.3s ease-in-out infinite alternate;">
      <rect x="3" y="9" width="20" height="11" rx="4" stroke="${col}" stroke-width="1.4"/>
      <circle cx="8" cy="20" r="2.5" fill="none" stroke="${col}" stroke-width="1.2"/>
      <circle cx="18" cy="20" r="2.5" fill="none" stroke="${col}" stroke-width="1.2"/>
      <path d="M15 5 L11 9 L15 13" stroke="${col}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  _svgCharging(col) {
    return `<svg width="26" height="26" viewBox="0 0 26 26" fill="none"
        style="animation:kos-charge 1.6s ease-in-out infinite;">
      <rect x="3" y="9" width="20" height="11" rx="4" stroke="${col}" stroke-width="1.4"/>
      <circle cx="8" cy="20" r="2.5" fill="none" stroke="${col}" stroke-width="1.2"/>
      <circle cx="18" cy="20" r="2.5" fill="none" stroke="${col}" stroke-width="1.2"/>
      <path d="M14 9.5 L11 14 L13.5 14 L12 17" stroke="${col}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  _svgDocked(col) {
    return `<svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect x="3" y="9" width="20" height="11" rx="4" stroke="${col}" stroke-width="1.4"/>
      <circle cx="8" cy="20" r="2.5" fill="none" stroke="${col}" stroke-width="1.2"/>
      <circle cx="18" cy="20" r="2.5" fill="none" stroke="${col}" stroke-width="1.2"/>
      <circle cx="13" cy="14.5" r="2" fill="#97C459"/>
    </svg>`;
  }

  _svgPaused(col) {
    return `<svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect x="3" y="9" width="20" height="11" rx="4" stroke="${col}" stroke-width="1.4"/>
      <circle cx="8" cy="20" r="2.5" fill="none" stroke="${col}" stroke-width="1.2"/>
      <circle cx="18" cy="20" r="2.5" fill="none" stroke="${col}" stroke-width="1.2"/>
      <rect x="11" y="12" width="2" height="5" rx="0.8" fill="${col}"/>
      <rect x="14" y="12" width="2" height="5" rx="0.8" fill="${col}"/>
    </svg>`;
  }

  _svgError() {
    return `<svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="9" stroke="#FF453A" stroke-width="1.4"/>
      <path d="M13 8.5 L13 14" stroke="#FF453A" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="13" cy="17" r="1" fill="#FF453A"/>
    </svg>`;
  }

  _svgParty() {
    return `<svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect x="3" y="9" width="20" height="11" rx="4" stroke="#FF9F0A" stroke-width="1.4"/>
      <circle cx="8" cy="20" r="2.5" fill="none" stroke="#FF9F0A" stroke-width="1.2"/>
      <circle cx="18" cy="20" r="2.5" fill="none" stroke="#FF9F0A" stroke-width="1.2"/>
      <path d="M13 5 L14 8 L12 8 Z" fill="#FF453A"/>
      <circle cx="13" cy="4.5" r="0.8" fill="#FF9F0A"/>
      <path d="M9 7 L10.5 9.5" stroke="#97C459" stroke-width="1" stroke-linecap="round"/>
      <path d="M17 7 L15.5 9.5" stroke="#85B7EB" stroke-width="1" stroke-linecap="round"/>
    </svg>`;
  }

  /* ─── Render DOM skeleton (once) ─────────────────────── */

  _render() {
    this.shadowRoot.innerHTML = `
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :host { display: block; font-family: -apple-system, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

  .glow {
    border-radius: 18px;
    transition: box-shadow .5s ease;
  }
  .glow.mowing {
    box-shadow: 0 0 0 1px rgba(151,196,89,.25),
                0 0 20px 2px rgba(151,196,89,.14),
                0 0 44px 8px rgba(151,196,89,.07);
  }
  .glow.returning, .glow.docking {
    box-shadow: 0 0 0 1px rgba(133,183,235,.22),
                0 0 18px 2px rgba(133,183,235,.12),
                0 0 38px 6px rgba(133,183,235,.06);
  }
  .glow.party {
    box-shadow: 0 0 0 1px rgba(255,159,10,.30),
                0 0 22px 4px rgba(255,159,10,.16),
                0 0 50px 10px rgba(255,159,10,.08);
  }

  .card {
    background: #1c1c1e;
    border-radius: 18px;
    padding: 14px 16px 16px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    transition: background .4s ease;
  }
  .card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent);
    pointer-events: none;
  }
  .card.party-bg { background: #1c1600; }
  .card:active { transform: scale(0.97); transition: transform .12s ease; }

  /* ── main row ── */
  .main { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }

  .iconbox {
    width: 48px; height: 48px; border-radius: 13px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    background: rgba(142,142,147,.07);
    border: .5px solid rgba(142,142,147,.15);
    transition: background .35s, border-color .35s;
  }

  .mid { flex: 1; min-width: 0; }
  .name {
    font-size: 13px; font-weight: 600; color: rgba(255,255,255,.90);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .status { font-size: 11px; color: #636366; margin-top: 3px; transition: color .3s; }

  .bat-wrap { flex-shrink: 0; text-align: right; }
  .bat-val {
    font-size: 28px; font-weight: 700; letter-spacing: -1px;
    line-height: 1; font-variant-numeric: tabular-nums;
    transition: color .3s;
  }
  .bat-unit { font-size: 12px; font-weight: 400; color: rgba(255,255,255,.28); }

  /* ── party banner ── */
  .party-bar {
    display: none;
    align-items: center; gap: 6px;
    background: rgba(255,159,10,.10);
    border: .5px solid rgba(255,159,10,.22);
    border-radius: 9px;
    padding: 5px 10px;
    margin-bottom: 10px;
    font-size: 11px; font-weight: 600; color: #FF9F0A;
  }
  .party-bar.visible { display: flex; }

  /* ── progress bar ── */
  .track {
    height: 3px; background: rgba(255,255,255,.06);
    border-radius: 2px; overflow: hidden; margin-bottom: 10px;
  }
  .fill { height: 100%; border-radius: 2px; transition: width .45s cubic-bezier(.4,0,.2,1), background .35s; }

  /* ── error bar ── */
  .error-bar {
    display: none;
    align-items: center; gap: 7px;
    background: rgba(255,69,58,.10);
    border: .5px solid rgba(255,69,58,.22);
    border-radius: 9px;
    padding: 6px 10px; margin-bottom: 10px;
    font-size: 11px; color: #FF453A;
  }
  .error-bar.visible { display: flex; }

  /* ── zone chip ── */
  .zone-row { display: flex; gap: 6px; margin-bottom: 10px; }
  .zone-chip {
    font-size: 10px; font-weight: 600; padding: 3px 9px;
    border-radius: 7px;
    background: rgba(133,183,235,.12); color: #85B7EB;
  }

  /* ── action buttons ── */
  .btns {
    display: flex; gap: 6px;
    border-top: .5px solid rgba(255,255,255,.07);
    padding-top: 10px;
  }
  .btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
    padding: 9px 4px;
    background: rgba(255,255,255,.05); border-radius: 10px;
    font-size: 10px; font-weight: 500; color: rgba(255,255,255,.45);
    cursor: pointer; border: .5px solid rgba(255,255,255,.08);
    transition: color .15s, background .15s, transform .1s;
    -webkit-tap-highlight-color: transparent;
  }
  .btn:active { transform: scale(.95); background: rgba(255,255,255,.09); }
  .btn.btn-start { background: rgba(10,132,255,.12); color: #0A84FF; border-color: rgba(10,132,255,.20); }
  .btn.btn-pause { background: rgba(255,159,10,.10); color: #FF9F0A; border-color: rgba(255,159,10,.18); }
  .btn.btn-home  { background: rgba(255,255,255,.05); color: rgba(255,255,255,.40); }
  .btn.btn-disabled { opacity: .30; pointer-events: none; }

  @keyframes kos-mow {
    0%,100% { transform: translateX(0) rotate(-1deg); }
    50%     { transform: translateX(2px) rotate(1deg); }
  }
  @keyframes kos-ret {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-3px); }
  }
  @keyframes kos-charge {
    0%,100% { opacity: 1; }
    50%     { opacity: .55; }
  }
</style>

<div class="glow" id="glow">
  <div class="card" id="card">

    <div class="main">
      <div class="iconbox" id="iconbox"><div id="icon"></div></div>
      <div class="mid">
        <div class="name" id="name">—</div>
        <div class="status" id="status">—</div>
      </div>
      <div class="bat-wrap">
        <span class="bat-val" id="bat-val">—</span><span class="bat-unit">%</span>
      </div>
    </div>

    <div class="party-bar" id="party-bar">
      <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
        <path d="M5 15 L9 5 L12 12 L14 8 L17 15 Z" fill="#FF9F0A" fill-opacity=".7"/>
        <circle cx="5" cy="5" r="1.5" fill="#97C459"/>
        <circle cx="15" cy="4" r="1.5" fill="#85B7EB"/>
        <circle cx="17" cy="11" r="1" fill="#FF453A"/>
      </svg>
      Tryb party aktywny
    </div>

    <div class="error-bar" id="error-bar">
      <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="#FF453A" stroke-width="1.5"/>
        <path d="M10 6 L10 11" stroke="#FF453A" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="10" cy="14" r="1" fill="#FF453A"/>
      </svg>
      <span id="error-text"></span>
    </div>

    <div class="zone-row" id="zone-row" style="display:none;"></div>

    <div class="track"><div class="fill" id="fill"></div></div>

    <div class="btns">
      <button class="btn btn-start" id="btn-start">
        <svg width="11" height="11" viewBox="0 0 14 14" fill="currentColor"><polygon points="3 1 13 7 3 13"/></svg>
        Start
      </button>
      <button class="btn btn-pause" id="btn-pause">
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="2" x2="4" y2="12"/><line x1="10" y1="2" x2="10" y2="12"/></svg>
        Pauza
      </button>
      <button class="btn btn-home" id="btn-home">
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 6L7 1l6 5v6a1 1 0 0 1-1 1H8v-4H6v4H2a1 1 0 0 1-1-1z"/></svg>
        Baza
      </button>
    </div>
  </div>
</div>`;

    this.shadowRoot.getElementById('card').addEventListener('click', e => {
      if (!e.target.closest('button')) this._moreInfo();
    });
    this.shadowRoot.getElementById('btn-start').addEventListener('click', e => {
      e.stopPropagation();
      this._svc('start_mowing');
    });
    this.shadowRoot.getElementById('btn-pause').addEventListener('click', e => {
      e.stopPropagation();
      this._svc('pause');
    });
    this.shadowRoot.getElementById('btn-home').addEventListener('click', e => {
      e.stopPropagation();
      this._svc('dock');
    });
  }

  /* ─── Update on state change ─────────────────────────── */

  _update() {
    if (!this._hass || !this._config) return;
    const r   = this.shadowRoot;
    const cfg = this._config;
    const d   = this._getData();

    if (!d) {
      r.getElementById('name').textContent   = cfg.entity;
      r.getElementById('status').textContent = 'Encja nie znaleziona';
      return;
    }

    const state    = d.state;
    const color    = this._stateColor(state);
    const label    = this._stateLabel(state);
    const battery  = d.battery;
    const isMowing    = state === 'mowing';
    const isReturning = state === 'docking' || state === 'returning';
    const isCharging  = state === 'charging';
    const isDocked    = state === 'docked' || isCharging;
    const isPaused    = state === 'paused';
    const isError     = state === 'error';

    const batPct   = battery !== null ? Math.round(battery) : null;
    const batColor = batPct === null ? '#636366'
                   : batPct > 50    ? '#97C459'
                   : batPct > 20    ? '#FF9F0A'
                   :                  '#FF453A';
    const barGrad  = batPct === null ? 'rgba(255,255,255,0.08)'
                   : batPct > 50    ? 'linear-gradient(90deg,#5F8932,#97C459)'
                   : batPct > 20    ? 'linear-gradient(90deg,#9A5230,#EF9F27)'
                   :                  'linear-gradient(90deg,#8F2320,#E24B4A)';

    // glow class
    const glowEl = r.getElementById('glow');
    glowEl.className = 'glow' + (d.partyMode ? ' party' : isMowing ? ' mowing' : isReturning ? ' returning docking' : '');

    // card bg
    r.getElementById('card').className = 'card' + (d.partyMode ? ' party-bg' : '');

    // name + status
    r.getElementById('name').textContent   = cfg.name;
    const statusEl = r.getElementById('status');
    statusEl.textContent = label + (d.zone !== null && (isMowing || isReturning) ? ` · strefa ${d.zone}` : '');
    statusEl.style.color = (isMowing || isReturning || isCharging) ? color + 'cc' : '#636366';

    // battery
    const batEl = r.getElementById('bat-val');
    batEl.textContent  = batPct !== null ? batPct : '—';
    batEl.style.color  = batPct !== null ? batColor : '#636366';

    // iconbox
    const iconbox = r.getElementById('iconbox');
    iconbox.style.background   = `${color}1a`;
    iconbox.style.borderColor  = `${color}33`;

    // SVG icon
    const iconEl = r.getElementById('icon');
    iconEl.innerHTML = d.partyMode && isDocked ? this._svgParty()
                     : isMowing               ? this._svgMowing(color)
                     : isReturning            ? this._svgReturning(color)
                     : isCharging             ? this._svgCharging(color)
                     : isPaused               ? this._svgPaused(color)
                     : isError                ? this._svgError()
                     :                          this._svgDocked(color);

    // fill bar
    r.getElementById('fill').style.width      = (batPct !== null ? batPct : 0) + '%';
    r.getElementById('fill').style.background = barGrad;

    // party banner
    r.getElementById('party-bar').className = 'party-bar' + (d.partyMode ? ' visible' : '');

    // error bar
    const errBar  = r.getElementById('error-bar');
    const errText = r.getElementById('error-text');
    if (isError && d.error) {
      errBar.className  = 'error-bar visible';
      errText.textContent = d.error;
    } else {
      errBar.className  = 'error-bar';
    }

    // zone chip (only when mowing/returning)
    const zoneRow = r.getElementById('zone-row');
    if (d.zone !== null && (isMowing || isReturning)) {
      zoneRow.style.display = 'flex';
      zoneRow.innerHTML = `<span class="zone-chip" style="background:${color}1a;color:${color};">strefa ${d.zone}</span>`;
    } else {
      zoneRow.style.display = 'none';
    }

    // buttons
    r.getElementById('btn-start').className = 'btn btn-start' + (isMowing ? ' btn-disabled' : '');
    r.getElementById('btn-pause').className = 'btn btn-pause' + (!isMowing ? ' btn-disabled' : '');
    r.getElementById('btn-home').className  = 'btn btn-home'  + (isDocked  ? ' btn-disabled' : '');
  }

  _svc(service) {
    this._hass.callService('lawn_mower', service, { entity_id: this._config.entity });
  }

  _moreInfo() {
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true, composed: true,
      detail: { entityId: this._config.entity },
    }));
  }

  getCardSize() { return 3; }

  static getConfigElement() { return document.createElement('div'); }

  static getStubConfig() {
    return {
      entity:            'lawn_mower.kosiarka',
      name:              'Kosiarka',
      capacity_m2:       400,
      battery_entity:    'sensor.kosiarka_battery',
      party_mode_entity: 'switch.s_party_mode',
      error_entity:      'sensor.kosiarka_error',
    };
  }
}

customElements.define('aha-kosiarka-card', KosiarkaCard);
if (!customElements.get('kosiarka-card'))
  customElements.define('kosiarka-card', class extends KosiarkaCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-kosiarka-card',
  name:        'Kosiarka Card',
  description: 'Kompaktowa karta kosiarka w stylu teleco — ikonka, bateria, przyciski, party mode',
  preview:     true,
});
