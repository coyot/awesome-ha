class KontaktronCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._interval  = null;
    this._lastState = null;
    this._wasAlarm  = false;
  }

  static getStubConfig() {
    return {
      entity:          'binary_sensor.kontaktron_drzwi',
      battery_entity:  '',
      name:            'Drzwi',
      alarm_after:     10,
    };
  }

  setConfig(config) {
    if (!config.entity) throw new Error('entity jest wymagane');
    this._config = config;
  }

  connectedCallback() {
    this._interval = setInterval(() => this._tick(), 1000);
  }

  disconnectedCallback() {
    clearInterval(this._interval);
    this._interval = null;
  }

  set hass(hass) {
    this._hass = hass;
    const cur = hass.states[this._config.entity]?.state ?? null;
    if (cur !== this._lastState) {
      this._lastState = cur;
      this._wasAlarm  = false;
      this._render();
    }
  }

  /* ── helpers ── */

  _openSecs() {
    const s = this._hass?.states[this._config.entity];
    if (!s || s.state !== 'on') return null;
    return Math.max(0, Math.floor((Date.now() - new Date(s.last_changed)) / 1000));
  }

  _fmt(secs) {
    if (secs < 60) return `${secs}s`;
    const m = Math.floor(secs / 60), s = secs % 60;
    if (m < 60) return `${m}:${String(s).padStart(2, '0')}`;
    const h = Math.floor(m / 60), rm = m % 60;
    return `${h}h ${String(rm).padStart(2, '0')}m`;
  }

  _tick() {
    const dur = this._openSecs();
    const el  = this.shadowRoot?.getElementById('timer');
    if (!el) return;

    if (dur === null) { el.textContent = ''; return; }

    const alarmSec = (this._config.alarm_after ?? 10) * 60;
    const isAlarm  = dur >= alarmSec;

    if (isAlarm !== this._wasAlarm) {
      this._wasAlarm = isAlarm;
      this._render();
      return;
    }
    el.textContent = this._fmt(dur);
  }

  _batHTML(pct) {
    if (pct === null) return '';
    const low     = pct < 20;
    const col     = low ? '#FF453A' : 'rgba(255,255,255,0.45)';
    const fillCol = low ? '#FF453A' : 'rgba(255,255,255,0.50)';
    const fillW   = Math.round((Math.max(0, Math.min(100, pct)) / 100) * 13);
    return `
    <div class="bat-wrap">
      <div class="bat-tip">${Math.round(pct)}%</div>
      <svg width="18" height="9" viewBox="0 0 22 11">
        <rect x="0.5" y="0.5" width="17" height="10" rx="2.5"
              fill="none" stroke="${col}" stroke-width="1.1"/>
        <rect x="18" y="3.5" width="2.5" height="4" rx="1" fill="${col}" opacity="0.7"/>
        ${fillW > 0 ? `<rect x="2" y="2" width="${fillW}" height="6" rx="1.5" fill="${fillCol}"/>` : ''}
      </svg>
    </div>`;
  }

  _doorSVG(isOpen, accent) {
    const c = accent;
    // shared: floor threshold
    const floor = `<line x1="37" y1="95" x2="93" y2="95" stroke="${c}" stroke-width="1.2" opacity="0.3"/>`;

    if (!isOpen) {
      return `
      <!-- frame -->
      <rect x="41" y="20" width="48" height="75" rx="4"
            fill="none" stroke="${c}" stroke-width="1.5" opacity="0.55"/>
      <!-- panel -->
      <rect x="43" y="22" width="44" height="71" rx="2.5"
            fill="${c}" fill-opacity="0.17" stroke="${c}" stroke-width="1" opacity="0.75"/>
      <!-- hinges -->
      <rect x="43" y="31" width="3.5" height="9" rx="1.5" fill="${c}" opacity="0.45"/>
      <rect x="43" y="57" width="3.5" height="9" rx="1.5" fill="${c}" opacity="0.45"/>
      <!-- knob -->
      <circle cx="80" cy="58" r="3.4" fill="${c}" opacity="0.8"/>
      <circle cx="80" cy="58" r="1.6" fill="rgba(0,0,0,0.45)"/>
      ${floor}`;
    } else {
      return `
      <!-- frame -->
      <rect x="41" y="20" width="48" height="75" rx="4"
            fill="none" stroke="${c}" stroke-width="1.5" opacity="0.55"/>
      <!-- open door panel (perspective edge on hinge side) -->
      <polygon points="43,22 57,27 57,88 43,93"
               fill="${c}" fill-opacity="0.28" stroke="${c}" stroke-width="1" opacity="0.85"/>
      <!-- swing arc (dashed) -->
      <path d="M 43,22 A 48,48 0 0,1 91,22"
            fill="none" stroke="${c}" stroke-width="1.2"
            stroke-dasharray="3,5" opacity="0.38"/>
      <!-- hinges (on frame) -->
      <rect x="41" y="31" width="3.5" height="9" rx="1.5" fill="${c}" opacity="0.45"/>
      <rect x="41" y="57" width="3.5" height="9" rx="1.5" fill="${c}" opacity="0.45"/>
      <!-- subtle interior glow -->
      <rect x="59" y="22" width="28" height="71"
            fill="${c}" fill-opacity="0.04"/>
      ${floor}`;
    }
  }

  _render() {
    const cfg          = this._config;
    const name         = cfg.name || 'Czujnik';
    const alarmAfterSec = (cfg.alarm_after ?? 10) * 60;

    const state    = this._hass?.states[cfg.entity];
    const isOnline = !!(state && state.state !== 'unavailable' && state.state !== 'unknown');
    const isOpen   = isOnline && state.state === 'on';
    const dur      = this._openSecs();
    const isAlarm  = dur !== null && dur >= alarmAfterSec;
    this._wasAlarm = isAlarm;

    const batVal = (() => {
      if (!cfg.battery_entity) return null;
      const s = this._hass?.states[cfg.battery_entity];
      if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
      return parseFloat(s.state);
    })();

    /* ── colour scheme ── */
    let bg, border, accent, pillBg, pillBorder, pillLabel, pulseAnim;

    if (!isOnline) {
      bg         = '#1C1C1E';
      border     = 'rgba(255,255,255,0.08)';
      accent     = 'rgba(255,255,255,0.25)';
      pillBg     = 'rgba(255,255,255,0.05)';
      pillBorder = 'rgba(255,255,255,0.10)';
      pillLabel  = 'OFFLINE';
      pulseAnim  = '';
    } else if (isAlarm) {
      bg         = 'linear-gradient(150deg,#1a0404,#220a0a,#1C1C1E)';
      border     = 'rgba(255,69,58,0.55)';
      accent     = '#FF453A';
      pillBg     = 'rgba(255,69,58,0.22)';
      pillBorder = 'rgba(255,69,58,0.55)';
      pillLabel  = '\u26a0 ALARM';
      pulseAnim  = 'animation: alarm-pulse 1.5s ease-in-out infinite;';
    } else if (isOpen) {
      bg         = 'linear-gradient(150deg,#1e1000,#231408,#1C1C1E)';
      border     = 'rgba(255,159,10,0.32)';
      accent     = '#FF9F0A';
      pillBg     = 'rgba(255,159,10,0.14)';
      pillBorder = 'rgba(255,159,10,0.38)';
      pillLabel  = 'OTWARTE';
      pulseAnim  = '';
    } else {
      bg         = 'linear-gradient(150deg,#0a1e0e,#1C1C1E)';
      border     = 'rgba(48,209,88,0.22)';
      accent     = '#30D158';
      pillBg     = 'rgba(48,209,88,0.12)';
      pillBorder = 'rgba(48,209,88,0.30)';
      pillLabel  = 'ZAMKNI\u0118TE';
      pulseAnim  = '';
    }

    const doorAccent = isOnline ? accent : 'rgba(255,255,255,0.15)';

    this.shadowRoot.innerHTML = `
<style>
  :host { display: block; width: 100%; height: 100%; }

  .card {
    position: relative;
    width: 100%;
    aspect-ratio: 1/1;
    border-radius: 18px;
    overflow: hidden;
    background: ${bg};
    border: 1px solid ${border};
    box-sizing: border-box;
    font-family: -apple-system, system-ui, sans-serif;
    ${pulseAnim}
  }

  .name {
    position: absolute; top: 11px; left: 13px;
    font-size: 11px; font-weight: 500; z-index: 10;
    color: ${isOnline ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)'};
    pointer-events: none;
  }

  .pill {
    position: absolute; bottom: 11px; left: 13px;
    padding: 3px 9px; border-radius: 20px;
    font-size: 8px; font-weight: 700; letter-spacing: 0.4px;
    background: ${pillBg}; border: 0.5px solid ${pillBorder};
    color: ${accent}; white-space: nowrap; z-index: 10;
    pointer-events: none;
  }

  .timer {
    position: absolute; bottom: 27px; left: 13px;
    font-size: 9px; font-weight: 600; z-index: 10;
    color: ${isAlarm ? '#FF453A' : accent};
    font-variant-numeric: tabular-nums; letter-spacing: 0.3px;
    pointer-events: none;
  }

  .main-svg {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%; z-index: 3;
    pointer-events: none;
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
    white-space: nowrap;
    opacity: 0; pointer-events: none;
    transition: opacity .15s;
    backdrop-filter: blur(8px);
  }
  .bat-wrap:hover .bat-tip { opacity: 1; }
  @media (max-width: 400px) { .bat-wrap { display: none; } }

  /* ── alarm flash overlay ── */
  .alarm-flash {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    border-radius: 18px;
    background: radial-gradient(ellipse at center, rgba(255,69,58,0.14) 0%, transparent 70%);
    ${isAlarm ? 'animation: alarm-flash-anim 1.5s ease-in-out infinite;' : 'display: none;'}
  }

  @keyframes alarm-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(255,69,58,0);    border-color: rgba(255,69,58,0.40); }
    50%      { box-shadow: 0 0 0 9px rgba(255,69,58,0.15); border-color: rgba(255,69,58,0.80); }
  }
  @keyframes alarm-flash-anim {
    0%,100% { opacity: 0.4; }
    50%      { opacity: 1; }
  }
</style>

<div class="card">
  <div class="alarm-flash"></div>
  <div class="name">${name}</div>
  ${this._batHTML(batVal)}

  <svg class="main-svg" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
    ${this._doorSVG(isOpen && isOnline, doorAccent)}
  </svg>

  <div class="timer" id="timer">${dur !== null ? this._fmt(dur) : ''}</div>
  <div class="pill">${pillLabel}</div>
</div>`;
  }

  getCardSize() { return 2; }
}

customElements.define('aha-kontaktron-card', KontaktronCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-kontaktron-card',
  name:        'Kontaktron Card',
  preview:     false,
  description: 'Kwadratowy kafelek czujnika drzwi/okna z alarmem czasowym i poziomem baterii.',
});
