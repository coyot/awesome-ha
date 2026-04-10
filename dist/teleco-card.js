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

customElements.define('aha-teleco-card-slim', TelecoCard);
// backward-compat alias — old dashboards using aha-teleco-card keep working
class _TelecoCardCompat extends TelecoCard {}
customElements.define('aha-teleco-card', _TelecoCardCompat);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-teleco-card-slim',
  name:        'Teleco Blind Card',
  preview:     false,
  description: 'Sterowanie żaluzjami w stylu Apple Home.',
});