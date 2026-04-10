class TelecoCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._curDeg = 0;
    this._raf = null;
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
    const pos  = state.attributes.current_position ?? 0;
    const st   = state.state;
    if (!this._rendered) { this._render(); this._rendered = true; }
    this._update(tilt, pos, st);
  }

  _svc(service, data = {}) {
    this._hass.callService('cover', service, { entity_id: this._entity, ...data });
  }

  // visual angle from tilt 0-100
  _deg(tilt) {
    const kf = [[0,0],[33,52],[66,85],[100,135]];
    for (let i = 0; i < kf.length - 1; i++) {
      const [p0,d0] = kf[i], [p1,d1] = kf[i+1];
      if (tilt >= p0 && tilt <= p1) return d0 + (tilt-p0)/(p1-p0)*(d1-d0);
    }
    return 135;
  }

  // single-slat SVG content (inner, no wrapper)
  _slatInner(deg, w, h, color) {
    const cx = w/2, cy = h/2, HL = w/2 - 3, TH = 3.5;
    const r = deg * Math.PI / 180, ca = Math.cos(r), sa = Math.sin(r);
    const px = -sa * TH, py = ca * TH;
    const x1 = cx - HL * ca, y1 = cy - HL * sa;
    const x2 = cx + HL * ca, y2 = cy + HL * sa;
    const f = ([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`;
    const body  = [[x1-px,y1-py],[x2-px,y2-py],[x2+px,y2+py],[x1+px,y1+py]].map(f).join(' ');
    const shine = [[x1-px*.3,y1-py*.3],[x2-px*.3,y2-py*.3],[x2+px*.12,y2+py*.12],[x1+px*.12,y1+py*.12]].map(f).join(' ');
    const c = color || 'rgba(10,132,255,.80)';
    return `<polygon points="${body}" fill="${c}"/>
            <polygon points="${shine}" fill="rgba(255,255,255,.22)"/>
            <circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="2.2" fill="rgba(0,0,0,.55)" stroke="${c}" stroke-width="1"/>
            <circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="2.2" fill="rgba(0,0,0,.55)" stroke="${c}" stroke-width="1"/>`;
  }

  _label(tilt, pos, st) {
    if (st==='opening') return 'Otwieranie\u2026';
    if (st==='closing') return 'Zamykanie\u2026';
    if (pos===0) return 'Zamkni\u0119te';
    if (tilt===0)   return 'Lamele poziomo';
    if (tilt<30)    return 'Lekko uchylone';
    if (tilt<70)    return 'Uchylone';
    if (tilt<100)   return 'Prawie otwarte';
    return 'Ca\u0142kowicie otwarte';
  }

  _render() {
    const PRESETS = [0, 33, 66, 100];

    this.shadowRoot.innerHTML = `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      :host{display:block;font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}
      .card{
        background:#1C1C1E;
        border-radius:16px;
        border:.5px solid rgba(255,255,255,.08);
        overflow:hidden;
      }

      /* ── header row ── */
      .hrow{display:grid;grid-template-columns:4px 1fr auto;gap:0 14px;align-items:center;padding:14px 14px 12px}
      .strip{border-radius:99px;background:#0a84ff;align-self:stretch;width:4px}
      .hmid{display:flex;align-items:center;gap:10px;min-width:0}
      .iw{width:32px;height:32px;border-radius:9px;flex-shrink:0;
          background:rgba(10,132,255,.14);border:.5px solid rgba(10,132,255,.28);
          display:flex;align-items:center;justify-content:center}
      .htxt{flex:1;min-width:0}
      .dn{font-size:14px;font-weight:600;color:rgba(255,255,255,.92);letter-spacing:-.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ds{font-size:11px;color:#636366;margin-top:2px}
      .hright{display:flex;flex-direction:column;align-items:flex-end;gap:5px}
      .pct{font-size:22px;font-weight:600;letter-spacing:-.5px;color:rgba(10,132,255,.95);line-height:1;font-variant-numeric:tabular-nums}
      .pu{font-size:13px;font-weight:400;color:rgba(10,132,255,.55)}

      /* ── presets ── */
      .divider{height:.5px;background:rgba(255,255,255,.07);margin:0 14px}
      .pgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;padding:10px 14px;gap:6px}
      .pp{
        border-radius:10px;padding:8px 4px 6px;text-align:center;cursor:pointer;
        background:rgba(255,255,255,.05);border:.5px solid rgba(255,255,255,.07);
        display:flex;flex-direction:column;align-items:center;gap:4px;
        transition:background .14s,border-color .14s,transform .10s;
        -webkit-tap-highlight-color:transparent;user-select:none;
      }
      .pp:active{transform:scale(.93)}
      .pp.on{background:rgba(10,132,255,.16);border-color:rgba(10,132,255,.38)}
      .pl{font-size:11px;font-weight:500;color:rgba(255,255,255,.28);letter-spacing:-.1px}
      .pp.on .pl{color:rgba(10,132,255,.90)}

      /* ── actions ── */
      .arow{display:grid;grid-template-columns:1fr 1fr 1fr;border-top:.5px solid rgba(255,255,255,.07)}
      .ab{
        padding:11px 4px;font-size:12px;font-weight:500;
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
      .pbar-wrap{height:3px;background:rgba(255,255,255,.06)}
      .pbar-fill{height:100%;border-radius:0;background:linear-gradient(90deg,rgba(10,100,220,.6),rgba(10,132,255,.9));transition:width .5s ease}
    </style>

    <div class="card">

      <div class="hrow">
        <div class="strip"></div>
        <div class="hmid">
          <div class="iw">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <rect x="3" y="10" width="16" height="2.5" rx="1.25" fill="#0a84ff"/>
              <circle cx="4.5" cy="11.25" r="1.5" fill="rgba(10,132,255,.2)"/>
              <circle cx="17.5" cy="11.25" r="1.5" fill="rgba(10,132,255,.2)"/>
              <rect x="2" y="4" width="1.5" height="14" rx=".75" fill="#48484A"/>
              <rect x="18.5" y="4" width="1.5" height="14" rx=".75" fill="#48484A"/>
            </svg>
          </div>
          <div class="htxt">
            <div class="dn">${this._name}${this._room ? `<span style="font-weight:400;color:#48484A;"> \u00b7 ${this._room}</span>` : ''}</div>
            <div class="ds" id="ds">&mdash;</div>
          </div>
        </div>
        <div class="hright">
          <div><span class="pct" id="pct">&mdash;</span><span class="pu">%</span></div>
          <svg id="hdr-svg" width="36" height="22" viewBox="0 0 36 22" overflow="visible"></svg>
        </div>
      </div>

      <div class="divider"></div>

      <div class="pgrid">
        ${PRESETS.map(t => {
          const deg = this._deg(t);
          return `<div class="pp" data-tilt="${t}">
            <svg width="36" height="22" viewBox="0 0 36 22" overflow="visible">
              ${this._slatInner(deg, 36, 22, 'rgba(10,132,255,.55)')}
            </svg>
            <div class="pl">${t}%</div>
          </div>`;
        }).join('')}
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

    // init header svg
    const hdrSvg = this.shadowRoot.getElementById('hdr-svg');
    if (hdrSvg) hdrSvg.innerHTML = this._slatInner(0, 36, 22);

    this.shadowRoot.getElementById('btn-open').addEventListener('click',  () => this._svc('open_cover'));
    this.shadowRoot.getElementById('btn-stop').addEventListener('click',  () => this._svc('stop_cover'));
    this.shadowRoot.getElementById('btn-close').addEventListener('click', () => this._svc('close_cover'));
    this.shadowRoot.querySelectorAll('.pp').forEach(btn => {
      btn.addEventListener('click', () => {
        this._svc('set_cover_tilt_position', { tilt_position: parseInt(btn.dataset.tilt) });
      });
    });
  }

  _animateTo(target) {
    if (this._raf) cancelAnimationFrame(this._raf);
    const start = this._curDeg, diff = target - start, dur = 380, t0 = performance.now();
    const ease = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
    const hdrSvg = this.shadowRoot.getElementById('hdr-svg');
    const step = now => {
      const t = Math.min((now - t0) / dur, 1);
      this._curDeg = start + diff * ease(t);
      if (hdrSvg) hdrSvg.innerHTML = this._slatInner(this._curDeg, 36, 22);
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

    r.querySelectorAll('.pp').forEach(b => b.classList.toggle('on', parseInt(b.dataset.tilt) === tilt));

    const target = this._deg(tilt);
    if (Math.abs(target - this._curDeg) > 0.5) this._animateTo(target);
  }

  getCardSize() { return 3; }
}

customElements.define('aha-teleco-card', TelecoCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-teleco-card',
  name:        'Teleco Blind Card',
  preview:     false,
  description: 'Sterowanie żaluzjami z animowanym podglądem lameli.',
});
