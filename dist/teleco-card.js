class TelecoCard extends HTMLElement {
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
