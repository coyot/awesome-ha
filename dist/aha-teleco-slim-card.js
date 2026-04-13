class TelecoSlimCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._curDeg  = 0;
    this._raf     = null;
    this._built   = false;
  }

  setConfig(config) {
    this._config = config;
    this._entity = config.entity || 'cover.teleco';
    this._name   = config.name   || 'Żaluzje';
  }

  set hass(hass) {
    this._hass = hass;
    const state = hass.states[this._entity];
    if (!state) return;
    const tilt = state.attributes.current_tilt_position ?? 0;
    const pos  = state.attributes.current_position     ?? 0;
    const st   = state.state;
    if (!this._built) { this._build(); this._built = true; }
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
    const W = 24, H = 24;
    const cx = W/2, cy = H/2, HL = W/2 - 3, TH = Math.max(1.5, HL * 0.16);
    const r  = deg * Math.PI / 180;
    const ca = Math.cos(r), sa = Math.sin(r);
    const px = -sa * TH, py = ca * TH;
    const x1 = cx - HL*ca, y1 = cy - HL*sa;
    const x2 = cx + HL*ca, y2 = cy + HL*sa;
    const f  = ([x,y]) => `${x.toFixed(1)},${y.toFixed(1)}`;
    const body  = [[x1-px,y1-py],[x2-px,y2-py],[x2+px,y2+py],[x1+px,y1+py]].map(f).join(' ');
    const shine = [[x1-px*.3,y1-py*.3],[x2-px*.3,y2-py*.3],[x2+px*.12,y2+py*.12],[x1+px*.12,y1+py*.12]].map(f).join(' ');
    const c = color || 'rgba(142,142,147,.65)';
    return `<polygon points="${body}" fill="${c}"/>
      <polygon points="${shine}" fill="rgba(255,255,255,.22)"/>
      <circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="1.6" fill="rgba(0,0,0,.55)" stroke="${c}" stroke-width=".8"/>
      <circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="1.6" fill="rgba(0,0,0,.55)" stroke="${c}" stroke-width=".8"/>`;
  }

  _label(tilt, st) {
    if (st === 'opening') return 'Otwieranie\u2026';
    if (st === 'closing') return 'Zamykanie\u2026';
    if (tilt === 0)   return 'Zamkni\u0119te';
    if (tilt < 30)    return 'Lekko uchylone';
    if (tilt < 70)    return 'Uchylone';
    if (tilt < 100)   return 'Prawie otwarte';
    return 'Otwarte';
  }

  _build() {
    this.shadowRoot.innerHTML = `
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :host{display:block;font-family:-apple-system,'SF Pro Text','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}

  .glow{border-radius:14px;transition:box-shadow .5s ease}
  .glow.on{
    box-shadow:
      0 0 0 1px rgba(255,159,10,.18),
      0 0 14px 2px rgba(255,159,10,.10),
      0 0 32px 4px rgba(255,159,10,.05);
  }

  .card{
    background:#1c1c1e;border-radius:14px;
    padding:11px 12px 9px;
    position:relative;overflow:hidden;
  }
  .card::before{
    content:'';position:absolute;top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);
    pointer-events:none;
  }

  .row{display:flex;align-items:center;gap:9px;margin-bottom:7px}

  .iconbox{
    width:34px;height:34px;border-radius:9px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    background:rgba(142,142,147,.07);border:.5px solid rgba(142,142,147,.14);
    transition:background .35s,border-color .35s;
  }

  .mid{flex:1;min-width:0}
  .name{
    font-size:13px;font-weight:600;color:rgba(255,255,255,.90);
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  }
  .status{font-size:10px;color:#636366;margin-top:1px;transition:color .3s}

  .pct{
    font-size:19px;font-weight:700;letter-spacing:-.5px;
    font-variant-numeric:tabular-nums;flex-shrink:0;transition:color .3s;
  }
  .pu{font-size:10px;font-weight:400;color:rgba(255,255,255,.28);margin-left:1px}

  .acts{display:flex;gap:4px;flex-shrink:0}
  .act{
    width:28px;height:28px;border-radius:8px;
    display:flex;align-items:center;justify-content:center;
    background:rgba(255,255,255,.05);border:.5px solid rgba(255,255,255,.08);
    cursor:pointer;color:rgba(255,255,255,.40);
    transition:color .15s,background .15s,transform .1s;
    -webkit-tap-highlight-color:transparent;user-select:none;
  }
  .act:active{transform:scale(.90)}
  .act:hover{color:rgba(255,255,255,.80);background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.14)}
  .act.stop:hover{background:rgba(255,69,58,.12);color:#ff453a;border-color:rgba(255,69,58,.22)}

  .track{height:2px;background:rgba(255,255,255,.05);border-radius:2px;overflow:hidden}
  .fill{height:100%;border-radius:2px;transition:width .45s cubic-bezier(.4,0,.2,1),background .35s}
</style>

<div class="glow" id="glow">
  <div class="card">
    <div class="row">
      <div class="iconbox" id="iconbox">
        <svg id="icon" width="24" height="24" viewBox="0 0 24 24" overflow="visible"></svg>
      </div>
      <div class="mid">
        <div class="name" id="name"></div>
        <div class="status" id="status">\u2014</div>
      </div>
      <span class="pct" id="pct">\u2014</span><span class="pu">%</span>
      <div class="acts">
        <div class="act" id="act-close" title="Zamknij">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M3.5 8L7 11.5 10.5 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="act stop" id="act-stop" title="Stop">
          <svg width="9" height="9" viewBox="0 0 14 14" fill="none"><rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor"/></svg>
        </div>
        <div class="act" id="act-open" title="Otwórz">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 12V2M3.5 6L7 2.5 10.5 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
    </div>
    <div class="track"><div class="fill" id="fill"></div></div>
  </div>
</div>`;

    this.shadowRoot.getElementById('name').textContent = this._name;
    this.shadowRoot.getElementById('icon').innerHTML   = this._drawSlat(0, 'rgba(142,142,147,.65)');

    this.shadowRoot.getElementById('act-open').addEventListener('click',  () => this._svc('open_cover'));
    this.shadowRoot.getElementById('act-stop').addEventListener('click',  () => this._svc('stop_cover'));
    this.shadowRoot.getElementById('act-close').addEventListener('click', () => this._svc('close_cover'));
  }

  _animateTo(target) {
    if (this._raf) cancelAnimationFrame(this._raf);
    const start = this._curDeg, diff = target - start;
    const dur = 380, t0 = performance.now();
    const ease = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
    const color = (this._lastTilt ?? 0) > 0 ? 'rgba(255,159,10,.88)' : 'rgba(142,142,147,.65)';
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
    const acc = on ? '#ff9f0a' : 'rgba(142,142,147,.75)';

    r.getElementById('pct').textContent    = tilt;
    r.getElementById('pct').style.color    = acc;
    r.getElementById('status').textContent = this._label(tilt, st);
    r.getElementById('status').style.color = on ? 'rgba(255,159,10,.65)' : '#636366';

    const fill = r.getElementById('fill');
    fill.style.width      = tilt + '%';
    fill.style.background = on ? '#ff9f0a' : 'rgba(142,142,147,.35)';

    r.getElementById('glow').classList.toggle('on', on);
    const ib = r.getElementById('iconbox');
    ib.style.background  = on ? 'rgba(255,159,10,.10)' : 'rgba(142,142,147,.07)';
    ib.style.borderColor = on ? 'rgba(255,159,10,.20)'  : 'rgba(142,142,147,.14)';

    const targetDeg = this._deg(tilt);
    if (Math.abs(targetDeg - this._curDeg) > 0.5) {
      this._animateTo(targetDeg);
    } else {
      const svg = r.getElementById('icon');
      if (svg) svg.innerHTML = this._drawSlat(this._curDeg, on ? 'rgba(255,159,10,.88)' : 'rgba(142,142,147,.65)');
    }
  }

  getCardSize() { return 1; }

  static getStubConfig() {
    return { entity: 'cover.teleco', name: 'Żaluzje' };
  }
}

customElements.define('aha-teleco-card-slim', TelecoSlimCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-teleco-card-slim',
  name:        'Teleco Blind Card — Slim',
  preview:     false,
  description: 'Sterowanie żaluzjami — wersja slim (jeden rząd z przyciskami ikonkowymi).',
});
