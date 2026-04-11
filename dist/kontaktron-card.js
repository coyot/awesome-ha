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
      entity:         'binary_sensor.kontaktron_drzwi',
      battery_entity: '',
      name:           'Drzwi',
      alarm_after:    10,
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
    return `${h}h\u00a0${String(rm).padStart(2, '0')}m`;
  }

  _tick() {
    const dur     = this._openSecs();
    const timerEl = this.shadowRoot?.getElementById('timer');
    const fillEl  = this.shadowRoot?.getElementById('bar-fill');
    if (!timerEl) return;

    if (dur === null) {
      timerEl.textContent = '';
      if (fillEl) fillEl.style.width = '0%';
      return;
    }

    const alarmSec = (this._config.alarm_after ?? 10) * 60;
    const isAlarm  = dur >= alarmSec;

    if (isAlarm !== this._wasAlarm) {
      this._wasAlarm = isAlarm;
      this._render();
      return;
    }

    timerEl.textContent = this._fmt(dur);
    if (fillEl) fillEl.style.width = Math.min(100, (dur / alarmSec) * 100).toFixed(1) + '%';
  }

  _batHTML(pct) {
    if (pct === null) return '';
    const low     = pct < 20;
    const col     = low ? '#FF453A' : 'rgba(255,255,255,0.40)';
    const fillCol = low ? '#FF453A' : 'rgba(255,255,255,0.48)';
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

  /* Padlock SVG inside a 130×130 viewBox.
     Body: x=42–88 (w=46) y=62–93 (h=31), center x=65.
     Shackle arc: apex y≈36, enters body at y=63 on both sides.
     Open: right arm raised to y=40 (above body). */
  _lockSVG(isOpen, color) {
    const c     = color;
    const body  = `
      <rect x="42" y="62" width="46" height="31" rx="6"
            fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-width="1.5"/>`;
    const hole  = `
      <circle cx="65" cy="76" r="4.5" fill="${c}" opacity="0.60"/>
      <rect   x="62.8" y="76" width="4.4" height="7" rx="1.2" fill="${c}" opacity="0.60"/>`;

    if (!isOpen) {
      return `
      <path d="M 50,63 L 50,50 Q 50,36 65,36 Q 80,36 80,50 L 80,63"
            fill="none" stroke="${c}" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round"/>
      ${body}${hole}`;
    } else {
      // right arm raised — shackle open
      return `
      <path d="M 50,63 L 50,50 Q 50,36 65,36 Q 80,36 80,50 L 80,40"
            fill="none" stroke="${c}" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round"/>
      ${body}${hole}`;
    }
  }

  _render() {
    const cfg           = this._config;
    const name          = cfg.name || 'Czujnik';
    const alarmAfterSec = (cfg.alarm_after ?? 10) * 60;

    const state    = this._hass?.states[cfg.entity];
    const isOnline = !!(state && state.state !== 'unavailable' && state.state !== 'unknown');
    const isOpen   = isOnline && state.state === 'on';
    const dur      = this._openSecs();
    const isAlarm  = dur !== null && dur >= alarmAfterSec;
    this._wasAlarm = isAlarm;

    const barPct = dur !== null ? Math.min(100, (dur / alarmAfterSec) * 100) : 0;

    const batVal = (() => {
      if (!cfg.battery_entity) return null;
      const s = this._hass?.states[cfg.battery_entity];
      if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
      return parseFloat(s.state);
    })();

    /* ── colour scheme ── */
    let bg, border, accent, lockColor, pillBg, pillBorder, pillLabel, pulseAnim;

    if (!isOnline) {
      bg         = '#1C1C1E';
      border     = 'rgba(255,255,255,0.06)';
      accent     = 'rgba(142,142,147,0.45)';
      lockColor  = 'rgba(142,142,147,0.30)';
      pillBg     = 'rgba(255,255,255,0.04)';
      pillBorder = 'rgba(255,255,255,0.07)';
      pillLabel  = 'OFFLINE';
      pulseAnim  = '';
    } else if (isAlarm) {
      bg         = 'linear-gradient(150deg,#1a0404,#220a0a,#1C1C1E)';
      border     = 'rgba(255,69,58,0.55)';
      accent     = '#FF453A';
      lockColor  = '#FF453A';
      pillBg     = 'rgba(255,69,58,0.22)';
      pillBorder = 'rgba(255,69,58,0.55)';
      pillLabel  = '\u26a0\ufe0f ALARM';
      pulseAnim  = 'animation: alarm-pulse 1.5s ease-in-out infinite;';
    } else if (isOpen) {
      bg         = 'linear-gradient(150deg,#1c1800,#1e1a00,#1C1C1E)';
      border     = 'rgba(255,214,10,0.30)';
      accent     = '#FFD60A';
      lockColor  = '#FFD60A';
      pillBg     = 'rgba(255,214,10,0.14)';
      pillBorder = 'rgba(255,214,10,0.35)';
      pillLabel  = 'OTWARTE';
      pulseAnim  = '';
    } else {
      /* closed — subtle grey, nearly invisible like other inactive tiles */
      bg         = '#1C1C1E';
      border     = 'rgba(255,255,255,0.07)';
      accent     = 'rgba(142,142,147,0.55)';
      lockColor  = 'rgba(142,142,147,0.45)';
      pillBg     = 'rgba(255,255,255,0.04)';
      pillBorder = 'rgba(255,255,255,0.08)';
      pillLabel  = 'ZAMKNI\u0118TE';
      pulseAnim  = '';
    }

    const showBar   = isOpen || isAlarm;
    const showTimer = isOpen || isAlarm;

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
    color: ${isOnline ? 'rgba(255,255,255,0.50)' : 'rgba(255,255,255,0.20)'};
    pointer-events: none;
  }

  /* pill + timer share the bottom strip */
  .pill {
    position: absolute; bottom: 11px; left: 13px;
    padding: 3px 9px; border-radius: 20px;
    font-size: 8px; font-weight: 700; letter-spacing: 0.4px;
    background: ${pillBg}; border: 0.5px solid ${pillBorder};
    color: ${accent}; white-space: nowrap; z-index: 10;
    pointer-events: none;
  }
  .timer {
    position: absolute; bottom: 12px; right: 13px;
    font-size: 9px; font-weight: 600; z-index: 10;
    color: ${isAlarm ? '#FF453A' : accent};
    font-variant-numeric: tabular-nums; letter-spacing: 0.3px;
    pointer-events: none;
    display: ${showTimer ? 'block' : 'none'};
  }

  /* progress bar — just above pill row */
  .bar-wrap {
    position: absolute; left: 13px; right: 13px; bottom: 30px;
    height: 2px; border-radius: 2px;
    background: rgba(255,255,255,0.07);
    z-index: 10;
    display: ${showBar ? 'block' : 'none'};
  }
  .bar-fill {
    height: 100%; border-radius: 2px;
    width: ${barPct.toFixed(1)}%;
    background: linear-gradient(to right, #FFD60A 0%, #FF9F0A 60%, #FF453A 100%);
    transition: width 0.9s linear;
  }

  .main-svg {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%; z-index: 3;
    pointer-events: none;
  }

  /* alarm exclamation — overlaid on lock body (~60% from top) */
  .exclaim {
    position: absolute; left: 50%; top: 60%;
    transform: translate(-50%, -50%);
    font-size: 36px; font-weight: 900; line-height: 1;
    color: #FF453A; z-index: 8; pointer-events: none;
    animation: exclaim-shake 2.2s ease-in-out infinite,
               exclaim-glow  2.2s ease-in-out infinite;
  }

  /* alarm bg glow */
  .alarm-bg {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background: radial-gradient(ellipse at 50% 62%, rgba(255,69,58,0.13) 0%, transparent 65%);
    animation: alarm-bg-pulse 1.5s ease-in-out infinite;
  }

  /* battery */
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

  /* ── keyframes ── */
  @keyframes alarm-pulse {
    0%,100% { box-shadow: 0 0 0 0    rgba(255,69,58,0);    border-color: rgba(255,69,58,0.42); }
    50%      { box-shadow: 0 0 0 10px rgba(255,69,58,0.18); border-color: rgba(255,69,58,0.88); }
  }
  @keyframes alarm-bg-pulse {
    0%,100% { opacity: 0.45; }
    50%      { opacity: 1; }
  }
  @keyframes exclaim-shake {
    0%,40%,100% { transform: translate(-50%,-50%) rotate(  0deg); }
    43%          { transform: translate(-56%,-52%) rotate( -9deg); }
    46%          { transform: translate(-44%,-50%) rotate(  9deg); }
    49%          { transform: translate(-55%,-51%) rotate( -7deg); }
    52%          { transform: translate(-45%,-50%) rotate(  6deg); }
    55%          { transform: translate(-52%,-51%) rotate( -3deg); }
    58%          { transform: translate(-50%,-50%) rotate(  0deg); }
  }
  @keyframes exclaim-glow {
    0%,100% { text-shadow: 0 0  6px rgba(255,69,58,0.35); }
    50%      { text-shadow: 0 0 22px rgba(255,69,58,0.95), 0 0 42px rgba(255,69,58,0.30); }
  }
</style>

<div class="card">
  ${isAlarm ? '<div class="alarm-bg"></div>' : ''}
  <div class="name">${name}</div>
  ${this._batHTML(batVal)}
  ${isAlarm ? '<div class="exclaim">!</div>' : ''}

  <svg class="main-svg" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
    ${this._lockSVG(isOpen && isOnline, lockColor)}
  </svg>

  <div class="bar-wrap">
    <div class="bar-fill" id="bar-fill"></div>
  </div>
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
  description: 'Kwadratowy kafelek czujnika drzwi/okna: k\u0142\u00f3dka, minutnik, pasek progresu, alarm z pulsuj\u0105cym wykrzyknikiem.',
});
