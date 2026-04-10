class TelecoCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._curDeg = 0;
    this._raf = null;
    this._rendered = false;
    this._tilt = 0;
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

  _deg(tilt) {
    const kf = [[0,0],[25,45],[75,94],[100,135]];
    for (let i = 0; i < kf.length - 1; i++) {
      const [p0,d0] = kf[i], [p1,d1] = kf[i+1];
      if (tilt >= p0 && tilt <= p1) return d0 + (tilt-p0)/(p1-p0)*(d1-d0);
    }
    return 135;
  }

  _slatPoly(cx, cy, hl, th, deg) {
    const r = deg * Math.PI / 180, ca = Math.cos(r), sa = Math.sin(r);
    const px = -sa * th, py = ca * th;
    const x1 = cx - hl * ca, y1 = cy - hl * sa;
    const x2 = cx + hl * ca, y2 = cy + hl * sa;
    const f = ([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`;
    const body  = [[x1-px,y1-py],[x2-px,y2-py],[x2+px,y2+py],[x1+px,y1+py]].map(f).join(' ');
    const shine = [[x1-px*.3,y1-py*.3],[x2-px*.3,y2-py*.3],[x2+px*.12,y2+py*.12],[x1+px*.12,y1+py*.12]].map(f).join(' ');
    return { body, shine, lx: x1, ly: y1, rx: x2, ry: y2 };
  }

  // Static SVG content — rendered once
  _staticViz() {
    const W = 300, H = 74, cx = W/2, cy = H/2, HL = 118;
    const g0 = this._slatPoly(cx, cy, HL, 2, 0);

    // gauge arc: spans 0°→135° of slat range, SA=-118° (10 o'clock), sweep=135°
    const arcR = 17, arcCx = 20, arcCy = cy;
    const SA = -118, SWEEP = 135, EA = SA + SWEEP;
    const toR = d => d * Math.PI / 180;
    const arcSx = (arcCx + arcR * Math.cos(toR(SA))).toFixed(2);
    const arcSy = (arcCy + arcR * Math.sin(toR(SA))).toFixed(2);
    const arcEx = (arcCx + arcR * Math.cos(toR(EA))).toFixed(2);
    const arcEy = (arcCy + arcR * Math.sin(toR(EA))).toFixed(2);

    return `
      <defs>
        <filter id="sg" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id="vc"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>
      </defs>
      <g clip-path="url(#vc)">
        <line x1="${cx-HL}" y1="${cy}" x2="${cx+HL}" y2="${cy}"
          stroke="rgba(255,255,255,.08)" stroke-width=".6" stroke-dasharray="3 7"/>
        <polygon points="${g0.body}" fill="rgba(255,255,255,.07)"/>
      </g>
      <path d="M ${arcSx} ${arcSy} A ${arcR} ${arcR} 0 0 1 ${arcEx} ${arcEy}"
        fill="none" stroke="rgba(255,255,255,.13)" stroke-width="2" stroke-linecap="round"/>
      <text x="${cx-HL+2}" y="${H-2}" font-size="7.5" fill="rgba(255,255,255,.20)"
        font-family="-apple-system,sans-serif" text-anchor="middle">0%</text>
      <text x="${cx+HL-2}" y="${H-2}" font-size="7.5" fill="rgba(255,255,255,.20)"
        font-family="-apple-system,sans-serif" text-anchor="middle">100%</text>
    `;
  }

  // Dynamic SVG content — updated on each animation frame
  _dynViz(deg, tilt) {
    const W = 300, H = 74, cx = W/2, cy = H/2, HL = 118;
    const m = this._slatPoly(cx, cy, HL, 7, deg);

    const arcR = 17, arcCx = 20, arcCy = cy;
    const SA = -118, SWEEP = 135;
    const toR = d => d * Math.PI / 180;
    const arcSx = (arcCx + arcR * Math.cos(toR(SA))).toFixed(2);
    const arcSy = (arcCy + arcR * Math.sin(toR(SA))).toFixed(2);
    const filledSweep = (deg / 135) * SWEEP;
    const currAngle = SA + filledSweep;
    const dotX = (arcCx + arcR * Math.cos(toR(currAngle))).toFixed(2);
    const dotY = (arcCy + arcR * Math.sin(toR(currAngle))).toFixed(2);
    const largeArc = filledSweep > 180 ? 1 : 0;

    const slatOp = (0.50 + (tilt / 100) * 0.35).toFixed(2);

    return `
      <g clip-path="url(#vc)">
        <ellipse cx="${cx}" cy="${cy}" rx="155" ry="38"
          fill="rgba(10,132,255,${(tilt / 100 * 0.13).toFixed(3)})"/>
        <polygon points="${m.body}" fill="rgba(10,132,255,.28)" filter="url(#sg)"/>
        <polygon points="${m.body}" fill="rgba(10,132,255,${slatOp})"/>
        <polygon points="${m.shine}" fill="rgba(255,255,255,.22)"/>
        <circle cx="${m.lx.toFixed(1)}" cy="${m.ly.toFixed(1)}" r="3.5"
          fill="rgba(4,4,10,.85)" stroke="rgba(10,132,255,.50)" stroke-width="1.5"/>
        <circle cx="${m.rx.toFixed(1)}" cy="${m.ry.toFixed(1)}" r="3.5"
          fill="rgba(4,4,10,.85)" stroke="rgba(10,132,255,.50)" stroke-width="1.5"/>
      </g>
      ${filledSweep > 0.5 ? `<path d="M ${arcSx} ${arcSy} A ${arcR} ${arcR} 0 ${largeArc} 1 ${dotX} ${dotY}"
        fill="none" stroke="rgba(10,132,255,.88)" stroke-width="2.5" stroke-linecap="round"/>` : ''}
      <circle cx="${dotX}" cy="${dotY}" r="4" fill="rgba(10,132,255,1)"/>
      <circle cx="${dotX}" cy="${dotY}" r="7" fill="rgba(10,132,255,.22)"/>
    `;
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

  _bgStyle(tilt) {
    const g = (0.06 + tilt / 100 * 0.12).toFixed(3);
    return `radial-gradient(ellipse at 50% -10%, rgba(10,132,255,${g}) 0%, #0b0b12 62%)`;
  }

  _render() {
    this.shadowRoot.innerHTML = `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      :host{display:block;font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}

      @keyframes breathe      { 0%,100%{opacity:1} 50%{opacity:.72} }
      @keyframes glow-pulse   { 0%,100%{opacity:.22;transform:scale(1)} 50%{opacity:.40;transform:scale(1.10)} }
      @keyframes dot-ring     { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.5);opacity:0} }

      .card {
        border-radius: 24px;
        padding: 20px 20px 0;
        position: relative;
        overflow: hidden;
        transition: background .6s ease;
      }
      .card::before {
        content:''; position:absolute; top:-60px; left:50%; transform:translateX(-50%);
        width:260px; height:200px;
        background: radial-gradient(ellipse, rgba(10,132,255,.16) 0%, transparent 70%);
        pointer-events:none;
        animation: glow-pulse 4s cubic-bezier(.4,0,.2,1) infinite;
      }
      .card::after {
        content:''; position:absolute; inset:0;
        background: radial-gradient(ellipse at 50% 0%, rgba(10,132,255,.07) 0%, transparent 60%);
        pointer-events:none;
      }

      /* header */
      .top { display:flex; align-items:center; gap:12px; position:relative; z-index:1; margin-bottom:14px; }
      .iw {
        width:36px; height:36px; border-radius:10px; flex-shrink:0;
        background:rgba(10,132,255,.15); border:.5px solid rgba(10,132,255,.30);
        display:flex; align-items:center; justify-content:center;
      }
      .htxt { flex:1; min-width:0; }
      .dn { font-size:15px; font-weight:600; color:rgba(255,255,255,.92); letter-spacing:-.2px; }
      .ds { font-size:11px; color:#8E8E93; margin-top:2px; }
      .pct-wrap { flex-shrink:0; text-align:right; }
      .pct { font-size:36px; font-weight:200; letter-spacing:-2px; color:rgba(10,132,255,.95); line-height:1; font-variant-numeric:tabular-nums; }
      .pu  { font-size:17px; font-weight:300; color:rgba(10,132,255,.55); }

      /* viz */
      .viz { position:relative; z-index:1; margin: 0 -4px; }

      /* stats */
      .stats {
        display:flex; justify-content:space-between; align-items:flex-start;
        position:relative; z-index:1; margin-top:10px; padding-bottom:12px;
        border-bottom: .5px solid rgba(255,255,255,.07);
      }
      .stat { display:flex; flex-direction:column; }
      .stat.c { align-items:center; }
      .stat.r { align-items:flex-end; }
      .sv { font-size:13px; font-weight:600; color:rgba(255,255,255,.75); letter-spacing:-.2px; }
      .sv.acc { color:rgba(10,132,255,.95); animation:breathe 3s ease-in-out infinite; }
      .sl { font-size:9px; font-weight:500; color:rgba(255,255,255,.26); text-transform:uppercase; letter-spacing:.07em; margin-top:2px; }

      /* presets */
      .presets {
        display:grid; grid-template-columns:repeat(4,1fr); gap:6px;
        padding: 10px 0;
        border-bottom: .5px solid rgba(255,255,255,.07);
        position:relative; z-index:1;
      }
      .pp {
        border-radius:8px; padding:7px 4px;
        font-size:12px; font-weight:500; text-align:center; cursor:pointer;
        color:rgba(255,255,255,.28); background:rgba(255,255,255,.05);
        border:.5px solid rgba(255,255,255,.07);
        transition:background .15s,color .15s,border-color .15s,transform .1s;
        -webkit-tap-highlight-color:transparent; user-select:none;
        letter-spacing:-.2px;
      }
      .pp:active { transform:scale(.93); }
      .pp.on { background:rgba(10,132,255,.18); border-color:rgba(10,132,255,.40); color:rgba(10,132,255,.95); }

      /* action strip */
      .arow {
        display:grid; grid-template-columns:1fr 1fr 1fr; gap:0;
        margin: 0 -20px;
        border-top: .5px solid rgba(255,255,255,.07);
        border-radius: 0 0 24px 24px;
        overflow:hidden;
        position:relative; z-index:1;
      }
      .ab {
        padding:13px 6px; font-size:12px; font-weight:500;
        cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px;
        transition:background .15s, transform .1s;
        -webkit-tap-highlight-color:transparent; user-select:none;
      }
      .ab:not(:last-child) { border-right:.5px solid rgba(255,255,255,.07); }
      .ab:active { transform:scale(.96); }
      .ab-o { color:#30d158; }
      .ab-o:active { background:rgba(48,209,88,.08); }
      .ab-s { color:#ff9f0a; }
      .ab-s:active { background:rgba(255,159,10,.08); }
      .ab-c { color:#ff453a; }
      .ab-c:active { background:rgba(255,69,58,.08); }
    </style>

    <div class="card" id="card" style="background:${this._bgStyle(0)}">

      <div class="top">
        <div class="iw">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <rect x="3" y="10" width="16" height="2.5" rx="1.25" fill="#0a84ff"/>
            <circle cx="4.5" cy="11.25" r="1.5" fill="rgba(10,132,255,.15)"/>
            <circle cx="17.5" cy="11.25" r="1.5" fill="rgba(10,132,255,.15)"/>
            <rect x="2" y="4" width="1.5" height="14" rx=".75" fill="#48484A"/>
            <rect x="18.5" y="4" width="1.5" height="14" rx=".75" fill="#48484A"/>
          </svg>
        </div>
        <div class="htxt">
          <div class="dn">${this._name}${this._room ? ' <span style="font-weight:400;color:#636366;font-size:13px;">&middot; ' + this._room + '</span>' : ''}</div>
          <div class="ds" id="ds">\u2014</div>
        </div>
        <div class="pct-wrap">
          <span class="pct" id="pct">\u2014</span><span class="pu">%</span>
        </div>
      </div>

      <div class="viz">
        <svg id="viz-svg" viewBox="0 0 300 74" width="100%" style="display:block;overflow:visible">
          ${this._staticViz()}
          <g id="viz-dyn">${this._dynViz(0, 0)}</g>
        </svg>
      </div>

      <div class="stats">
        <div class="stat">
          <span class="sv">0%</span>
          <span class="sl">Poziomo</span>
        </div>
        <div class="stat c">
          <span class="sv acc" id="sv-mid">\u2014</span>
          <span class="sl">Uchylenie</span>
        </div>
        <div class="stat r">
          <span class="sv">100%</span>
          <span class="sl">Otwarte</span>
        </div>
      </div>

      <div class="presets">
        ${[0,25,75,100].map(t=>`<div class="pp" data-tilt="${t}">${t}%</div>`).join('')}
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

    </div>`;

    this.shadowRoot.getElementById('btn-open').addEventListener('click',  ()=>this._svc('open_cover'));
    this.shadowRoot.getElementById('btn-stop').addEventListener('click',  ()=>this._svc('stop_cover'));
    this.shadowRoot.getElementById('btn-close').addEventListener('click', ()=>this._svc('close_cover'));
    this.shadowRoot.querySelectorAll('.pp').forEach(btn => {
      btn.addEventListener('click', () => {
        this._svc('set_cover_tilt_position', { tilt_position: parseInt(btn.dataset.tilt) });
      });
    });
  }

  _animateTo(target, tilt) {
    if (this._raf) cancelAnimationFrame(this._raf);
    const start = this._curDeg, diff = target - start, dur = 420, t0 = performance.now();
    const ease = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
    const dynG = this.shadowRoot.getElementById('viz-dyn');
    const step = now => {
      const t = Math.min((now - t0) / dur, 1);
      this._curDeg = start + diff * ease(t);
      if (dynG) dynG.innerHTML = this._dynViz(this._curDeg, tilt);
      if (t < 1) this._raf = requestAnimationFrame(step);
      else this._curDeg = target;
    };
    this._raf = requestAnimationFrame(step);
  }

  _update(tilt, pos, st) {
    const r = this.shadowRoot;
    this._tilt = tilt;

    const pctEl  = r.getElementById('pct');
    const dsEl   = r.getElementById('ds');
    const midEl  = r.getElementById('sv-mid');
    const cardEl = r.getElementById('card');

    if (pctEl)  pctEl.textContent  = tilt;
    if (midEl)  midEl.textContent  = tilt + '%';
    if (dsEl)   dsEl.textContent   = this._label(tilt, pos, st);
    if (cardEl) cardEl.style.background = this._bgStyle(tilt);

    r.querySelectorAll('.pp').forEach(b => b.classList.toggle('on', parseInt(b.dataset.tilt) === tilt));

    const target = this._deg(tilt);
    if (Math.abs(target - this._curDeg) > 0.5) this._animateTo(target, tilt);
    else {
      // still update the glow ellipse opacity without animating the slat
      const dynG = r.getElementById('viz-dyn');
      if (dynG) dynG.innerHTML = this._dynViz(this._curDeg, tilt);
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
  description: 'Sterowanie żaluzjami z animowanym podglądem lameli.',
});
