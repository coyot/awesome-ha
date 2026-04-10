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

  _slatInner(deg, w, h, color) {
    const cx = w/2, cy = h/2, HL = w/2 - 2.5, TH = Math.max(1.2, HL * 0.14);
    const r = deg * Math.PI / 180, ca = Math.cos(r), sa = Math.sin(r);
    const px = -sa * TH, py = ca * TH;
    const x1 = cx - HL*ca, y1 = cy - HL*sa;
    const x2 = cx + HL*ca, y2 = cy + HL*sa;
    const f = ([x,y]) => `${x.toFixed(2)},${y.toFixed(2)}`;
    const body  = [[x1-px,y1-py],[x2-px,y2-py],[x2+px,y2+py],[x1+px,y1+py]].map(f).join(' ');
    const shine = [[x1-px*.3,y1-py*.3],[x2-px*.3,y2-py*.3],[x2+px*.12,y2+py*.12],[x1+px*.12,y1+py*.12]].map(f).join(' ');
    const c = color || 'rgba(10,132,255,.82)';
    return `<polygon points="${body}" fill="${c}"/>
            <polygon points="${shine}" fill="rgba(255,255,255,.20)"/>
            <circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="1.8" fill="rgba(0,0,0,.50)" stroke="${c}" stroke-width=".8"/>
            <circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="1.8" fill="rgba(0,0,0,.50)" stroke="${c}" stroke-width=".8"/>`;
  }

  _label(tilt, pos, st) {
    if (st==='opening') return 'Otwieranie\u2026';
    if (st==='closing') return 'Zamykanie\u2026';
    if (pos===0) return 'Zamkni\u0119te';
    if (tilt===0)   return 'Poziomo';
    if (tilt<30)    return 'Lekko uchylone';
    if (tilt<70)    return 'Uchylone';
    if (tilt<100)   return 'Prawie otwarte';
    return 'Otwarte';
  }

  _render() {
    // color per preset — grey→sky→blue→green
    const PC = {
      0:   { bg:'rgba(72,72,74,.22)',    bd:'rgba(142,142,147,.28)', tx:'#8E8E93',  ic:'rgba(142,142,147,.75)', pg:'rgba(142,142,147,.20)' },
      33:  { bg:'rgba(90,200,250,.15)',  bd:'rgba(90,200,250,.32)',  tx:'#5AC8FA',  ic:'rgba(90,200,250,.82)',  pg:'rgba(90,200,250,.28)'  },
      66:  { bg:'rgba(10,132,255,.15)',  bd:'rgba(10,132,255,.32)',  tx:'#0A84FF',  ic:'rgba(10,132,255,.85)',  pg:'rgba(10,132,255,.30)'  },
      100: { bg:'rgba(52,199,89,.14)',   bd:'rgba(52,199,89,.32)',   tx:'#34C759',  ic:'rgba(52,199,89,.82)',   pg:'rgba(52,199,89,.28)'   },
    };
    const PRESETS = [0, 33, 66, 100];

    this.shadowRoot.innerHTML = `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      :host{display:block;font-family:-apple-system,'SF Pro Text','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}

      @keyframes pill-glow {
        0%,100% { box-shadow: 0 0 0 0 var(--pg, rgba(10,132,255,0)); }
        50%      { box-shadow: 0 0 0 4px var(--pg, rgba(10,132,255,.22)); }
      }

      .card{
        background:#2C2C2E;
        border-radius:18px;
        padding:14px 14px 0;
        position:relative;
        overflow:hidden;
      }
      .card::before{
        content:'';position:absolute;top:0;left:0;right:0;height:1px;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.10),transparent);
        pointer-events:none;
      }

      /* ── header ── */
      .hrow{display:flex;align-items:center;gap:11px;margin-bottom:10px}
      .iw{
        width:38px;height:38px;border-radius:11px;flex-shrink:0;
        background:rgba(10,132,255,.12);border:.5px solid rgba(10,132,255,.25);
        display:flex;align-items:center;justify-content:center;overflow:visible;
      }
      .htxt{flex:1;min-width:0}
      .dn{
        font-size:14px;font-weight:600;color:rgba(255,255,255,.92);
        letter-spacing:-.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        margin-bottom:6px;
      }
      .ds-row{display:flex;align-items:center;gap:6px;flex-wrap:nowrap}
      .ds{font-size:11px;color:#8E8E93;white-space:nowrap;flex-shrink:0}
      .pills{display:flex;gap:4px;flex:1;justify-content:flex-end}
      .pill{
        display:inline-flex;align-items:center;gap:3px;
        padding:3px 7px 3px 4px;border-radius:99px;
        border:.5px solid transparent;cursor:pointer;
        transition:background .15s,border-color .15s,transform .10s,opacity .15s;
        -webkit-tap-highlight-color:transparent;user-select:none;
        opacity:.65;
      }
      .pill:active{transform:scale(.90)}
      .pill.on{opacity:1;animation:pill-glow 2s ease-in-out infinite;}
      .pill-lbl{font-size:10px;font-weight:600;letter-spacing:-.1px}

      .pct-wrap{flex-shrink:0;text-align:right}
      .pct{font-size:30px;font-weight:700;letter-spacing:-1.5px;line-height:1;font-variant-numeric:tabular-nums;color:rgba(10,132,255,.95)}
      .pu{font-size:15px;font-weight:400;color:rgba(10,132,255,.45)}

      /* ── actions ── */
      .arow{
        display:grid;grid-template-columns:1fr 1fr 1fr;
        border-top:.5px solid rgba(255,255,255,.07);
        margin:0 -14px;
      }
      .ab{
        padding:12px 4px;font-size:12px;font-weight:500;
        cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;
        transition:background .14s,transform .10s;
        -webkit-tap-highlight-color:transparent;user-select:none;
      }
      .ab:not(:last-child){border-right:.5px solid rgba(255,255,255,.07)}
      .ab:active{transform:scale(.95)}
      .ab-o{color:#30d158}.ab-o:active{background:rgba(48,209,88,.08)}
      .ab-s{color:#ff9f0a}.ab-s:active{background:rgba(255,159,10,.08)}
      .ab-c{color:#ff453a}.ab-c:active{background:rgba(255,69,58,.08)}

      /* ── progress bar ── */
      .pbar-wrap{height:3px;background:rgba(255,255,255,.06);margin:0 -14px}
      .pbar-fill{height:100%;background:linear-gradient(90deg,rgba(10,100,220,.55),rgba(10,132,255,.90));transition:width .5s ease}
    </style>

    <div class="card">

      <div class="hrow">
        <div class="iw">
          <svg id="hdr-svg" width="34" height="34" viewBox="0 0 34 34" overflow="visible"></svg>
        </div>
        <div class="htxt">
          <div class="dn">${this._name}${this._room ? `<span style="font-weight:400;color:#636366;"> \u00b7 ${this._room}</span>` : ''}</div>
          <div class="ds-row">
            <span class="ds" id="ds">—</span>
            <div class="pills">
              ${PRESETS.map(t => {
                const c = PC[t];
                const deg = this._deg(t);
                return `<div class="pill" data-tilt="${t}"
                  style="background:${c.bg};border-color:${c.bd};--pg:${c.pg};">
                  <svg width="14" height="10" viewBox="0 0 14 10" overflow="visible">
                    ${this._slatInner(deg, 14, 10, c.ic)}
                  </svg>
                  <span class="pill-lbl" style="color:${c.tx};">${t}%</span>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>
        <div class="pct-wrap">
          <span class="pct" id="pct">—</span><span class="pu">%</span>
        </div>
      </div>

      <div class="arow">
        <div class="ab ab-o" id="btn-open">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 11V3M3.5 6.5L7 3l3.5 3.5" stroke="#30d158" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Otwórz
        </div>
        <div class="ab ab-s" id="btn-stop">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="#ff9f0a"/></svg>
          Stop
        </div>
        <div class="ab ab-c" id="btn-close">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 3v8M3.5 7.5L7 11l3.5-3.5" stroke="#ff453a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Zamknij
        </div>
      </div>

      <div class="pbar-wrap">
        <div class="pbar-fill" id="pbar" style="width:0%"></div>
      </div>

    </div>`;

    const hdrSvg = this.shadowRoot.getElementById('hdr-svg');
    if (hdrSvg) hdrSvg.innerHTML = this._slatInner(0, 34, 34);

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
    const start = this._curDeg, diff = target - start, dur = 380, t0 = performance.now();
    const ease  = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
    const svg   = this.shadowRoot.getElementById('hdr-svg');
    const step  = now => {
      const t = Math.min((now - t0) / dur, 1);
      this._curDeg = start + diff * ease(t);
      if (svg) svg.innerHTML = this._slatInner(this._curDeg, 34, 34);
      if (t < 1) this._raf = requestAnimationFrame(step);
      else this._curDeg = target;
    };
    this._raf = requestAnimationFrame(step);
  }

  _update(tilt, pos, st) {
    const r = this.shadowRoot;
    const pctEl = r.getElementById('pct');
    const dsEl  = r.getElementById('ds');
    const pbar  = r.getElementById('pbar');

    if (pctEl) pctEl.textContent = tilt;
    if (dsEl)  dsEl.textContent  = this._label(tilt, pos, st);
    if (pbar)  pbar.style.width  = tilt + '%';

    // highlight nearest preset pill
    const PRESETS = [0, 33, 66, 100];
    r.querySelectorAll('.pill').forEach(b => {
      b.classList.toggle('on', parseInt(b.dataset.tilt) === tilt);
    });

    const target = this._deg(tilt);
    if (Math.abs(target - this._curDeg) > 0.5) this._animateTo(target);
  }

  getCardSize() { return 2; }
}

customElements.define('aha-teleco-card', TelecoCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-teleco-card',
  name:        'Teleco Blind Card',
  preview:     false,
  description: 'Sterowanie żaluzjami z animowanym podglądem lameli.',
});
