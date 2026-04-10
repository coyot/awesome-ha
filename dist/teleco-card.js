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

  _deg(tilt) {
    const kf = [[0,0],[25,45],[75,94],[100,135]];
    for (let i = 0; i < kf.length - 1; i++) {
      const [p0,d0] = kf[i], [p1,d1] = kf[i+1];
      if (tilt >= p0 && tilt <= p1) return d0 + (tilt-p0)/(p1-p0)*(d1-d0);
    }
    return 135;
  }

  _slatHTML(cx, cy, hl, th, deg, color) {
    const r=deg*Math.PI/180, ca=Math.cos(r), sa=Math.sin(r);
    const px=-sa*th, py=ca*th;
    const x1=cx-hl*ca, y1=cy-hl*sa, x2=cx+hl*ca, y2=cy+hl*sa;
    const f=([x,y])=>`${x.toFixed(2)},${y.toFixed(2)}`;
    const body  =[[x1-px,y1-py],[x2-px,y2-py],[x2+px,y2+py],[x1+px,y1+py]].map(f).join(' ');
    const shine =[[x1-px*.3,y1-py*.3],[x2-px*.3,y2-py*.3],[x2+px*.12,y2+py*.12],[x1+px*.12,y1+py*.12]].map(f).join(' ');
    const c = color || '#0a84ff';
    return `<polygon points="${body}" fill="${c}"/>
            <polygon points="${shine}" fill="rgba(255,255,255,.18)"/>
            <circle cx="${x1.toFixed(2)}" cy="${y1.toFixed(2)}" r="2" fill="rgba(0,0,0,.5)"/>
            <circle cx="${x2.toFixed(2)}" cy="${y2.toFixed(2)}" r="2" fill="rgba(0,0,0,.5)"/>`;
  }

  _buildSVG(deg, count, hl, th, gap, vw, cy, color) {
    const totalW = count*(hl*2)+(count-1)*gap;
    const startX = (vw-totalW)/2+hl;
    let s='';
    for(let i=0;i<count;i++) s+=this._slatHTML(startX+i*(hl*2+gap), cy, hl, th, deg, color);
    return s;
  }

  _label(tilt, pos, st) {
    if (st==='opening') return 'Otwieranie...';
    if (st==='closing') return 'Zamykanie...';
    if (pos===0) return 'Zamknięte';
    if (tilt===0)   return 'Lamele poziomo';
    if (tilt<30)    return 'Lekko uchylone';
    if (tilt<70)    return 'Uchylone';
    if (tilt<100)   return 'Prawie otwarte';
    return 'Całkowicie otwarte';
  }

  _render() {
    this.shadowRoot.innerHTML = `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      :host{display:block;font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}
      .card{
        background:#2C2C2E;
        border-radius:18px;
        padding:16px 16px 14px;
        position:relative;overflow:hidden;
      }
      .card::before{
        content:'';position:absolute;top:0;left:0;right:0;height:1px;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.10),transparent);
        pointer-events:none;z-index:1;
      }

      /* ── header ── */
      .hrow{display:flex;align-items:center;gap:12px;margin-bottom:14px}
      .iw{
        width:36px;height:36px;border-radius:10px;flex-shrink:0;
        background:rgba(10,132,255,.15);border:.5px solid rgba(10,132,255,.28);
        display:flex;align-items:center;justify-content:center;
      }
      .htxt{flex:1;min-width:0}
      .dn{font-size:15px;font-weight:600;color:#fff;letter-spacing:-.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ds{font-size:12px;color:#8E8E93;margin-top:2px}
      .thumb{flex-shrink:0;opacity:.9}

      /* ── presets ── */
      .pgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px}
      .pb{
        background:#3A3A3C;border-radius:10px;
        border:.5px solid rgba(255,255,255,.06);
        padding:8px 4px 7px;text-align:center;cursor:pointer;
        position:relative;overflow:hidden;
        transition:transform .1s,background .15s,border-color .15s;
        -webkit-tap-highlight-color:transparent;user-select:none;
      }
      .pb:active{transform:scale(.94)}
      .pb.on{background:rgba(10,132,255,.18);border-color:rgba(10,132,255,.40)}
      .pl{font-size:11px;font-weight:500;color:#636366;margin-top:5px;letter-spacing:.02em}
      .pb.on .pl{color:#0a84ff}

      /* ── actions ── */
      .arow{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
      .ab{
        border-radius:10px;padding:9px 4px;font-size:12px;font-weight:500;
        cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;
        position:relative;overflow:hidden;
        transition:background .15s,transform .1s;
        border:.5px solid transparent;
        -webkit-tap-highlight-color:transparent;user-select:none;
      }
      .ab:active{transform:scale(.96)}
      .ab-o{background:#3A3A3C;border-color:rgba(48,209,88,.30);color:#30d158}
      .ab-o:active{background:rgba(48,209,88,.10)}
      .ab-s{background:#3A3A3C;border-color:rgba(255,159,10,.30);color:#ff9f0a}
      .ab-s:active{background:rgba(255,159,10,.10)}
      .ab-c{background:#3A3A3C;border-color:rgba(255,69,58,.30);color:#ff453a}
      .ab-c:active{background:rgba(255,69,58,.10)}
    </style>

    <div class="card">

      <div class="hrow">
        <div class="iw">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <rect x="3" y="10" width="16" height="2.5" rx="1.25" fill="#0a84ff"/>
            <circle cx="4.5" cy="11.25" r="1.5" fill="#2C2C2E"/>
            <circle cx="17.5" cy="11.25" r="1.5" fill="#2C2C2E"/>
            <rect x="2" y="4" width="1.5" height="14" rx=".75" fill="#48484A"/>
            <rect x="18.5" y="4" width="1.5" height="14" rx=".75" fill="#48484A"/>
          </svg>
        </div>
        <div class="htxt">
          <div class="dn">${this._name}</div>
          <div class="ds" id="ds">—</div>
        </div>
        <div class="thumb">
          <svg width="72" height="44" viewBox="0 0 72 44" id="main-svg"></svg>
        </div>
      </div>

      <div class="pgrid">
        ${[[0,0],[25,45],[75,94],[100,135]].map(([tilt])=>`
          <div class="pb" data-tilt="${tilt}">
            <svg width="36" height="20" viewBox="0 0 36 20" id="psv-${tilt}"></svg>
            <div class="pl">${tilt}%</div>
          </div>`).join('')}
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

    // init main thumb SVG
    const svgMain = this.shadowRoot.getElementById('main-svg');
    if (svgMain) svgMain.innerHTML = this._buildSVG(this._curDeg, 5, 10, 4, 4, 72, 22);

    // init preset static SVGs
    [[0,0],[25,45],[75,94],[100,135]].forEach(([tilt, deg]) => {
      const el = this.shadowRoot.getElementById(`psv-${tilt}`);
      if (el) el.innerHTML = this._buildSVG(deg, 3, 8, 3, 3, 36, 10, 'rgba(10,132,255,.65)');
    });

    this.shadowRoot.getElementById('btn-open').addEventListener('click', ()=>this._svc('open_cover'));
    this.shadowRoot.getElementById('btn-stop').addEventListener('click', ()=>this._svc('stop_cover'));
    this.shadowRoot.getElementById('btn-close').addEventListener('click',()=>this._svc('close_cover'));
    this.shadowRoot.querySelectorAll('.pb').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const tilt = parseInt(btn.dataset.tilt);
        this._svc('set_cover_tilt_position', { tilt_position: tilt });
      });
    });
  }

  _animateTo(target) {
    if (this._raf) cancelAnimationFrame(this._raf);
    const start=this._curDeg, diff=target-start, dur=400, t0=performance.now();
    const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    const svg=this.shadowRoot.getElementById('main-svg');
    const step=now=>{
      const t=Math.min((now-t0)/dur,1);
      this._curDeg=start+diff*ease(t);
      if(svg) svg.innerHTML=this._buildSVG(this._curDeg, 5, 10, 4, 4, 72, 22);
      if(t<1) this._raf=requestAnimationFrame(step); else this._curDeg=target;
    };
    this._raf=requestAnimationFrame(step);
  }

  _update(tilt, pos, st) {
    const r=this.shadowRoot;
    const dsEl=r.getElementById('ds');
    const label = this._label(tilt, pos, st);
    const room  = this._room ? ' · ' + this._room : '';
    if (dsEl) dsEl.textContent = label + room + ' · ' + tilt + '%';
    r.querySelectorAll('.pb').forEach(b=>b.classList.toggle('on', parseInt(b.dataset.tilt)===tilt));
    const target=this._deg(tilt);
    if(Math.abs(target-this._curDeg)>0.5) this._animateTo(target);
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
