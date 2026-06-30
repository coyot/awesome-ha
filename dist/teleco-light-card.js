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
});