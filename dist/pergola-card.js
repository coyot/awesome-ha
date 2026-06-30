class PergolaCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._rendered = false;
    this._curDeg = 0;
    this._raf = null;
    this._lastTilt = 0;
    this._lastBri = 0;
  }

  setConfig(config) {
    this._config = config;
    this._coverEntity = config.cover_entity || config.entity || 'cover.pergola_lamele';
    this._coverName   = config.cover_name   || 'Lamele';
    this._lightEntity = config.light_entity || 'light.pergola_spot';
    this._lightName   = config.light_name   || 'Spot LED w pergoli';
    this._name = config.name || 'Pergola';
    this._room = config.room || '';
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) { this._render(); this._rendered = true; }
    const cov = hass.states[this._coverEntity];
    if (cov) {
      const tilt = cov.attributes.current_tilt_position ?? 0;
      this._updateLouver(tilt, cov.state);
    }
    const lit = hass.states[this._lightEntity];
    if (lit) {
      const on = lit.state === 'on';
      const briRaw = lit.attributes.brightness;
      const bri = on ? Math.round(((briRaw ?? 255) / 255) * 100) : 0;
      this._updateLight(bri, on, lit.state);
    }
  }

  _svcCover(service, data = {}) {
    this._hass.callService('cover', service, { entity_id: this._coverEntity, ...data });
  }
  _svcLight(service, data = {}) {
    this._hass.callService('light', service, { entity_id: this._lightEntity, ...data });
  }

  // ── louver glyph (slat) — from teleco-card, unchanged geometry ──
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
  _louverLabel(tilt, st) {
    if (st === 'opening') return 'Otwieranie\u2026';
    if (st === 'closing') return 'Zamykanie\u2026';
    if (tilt === 0)  return 'Zamkni\u0119te';
    if (tilt < 30)   return 'Lekko uchylone';
    if (tilt < 70)   return 'Uchylone';
    if (tilt < 100)  return 'Prawie otwarte';
    return 'Otwarte';
  }

  // ── light glyph (rays) — from teleco-light-card, unchanged ──
  _drawBulb(bri, color) {
    const cx = 16, cy = 15;
    const on = bri > 0;
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
    return `${rays.join('')}
      <circle cx="${cx}" cy="${cy}" r="${coreR.toFixed(1)}" fill="${coreFill}" stroke="${coreStroke}" stroke-width="1.7" opacity="${coreOp}"/>
      ${on ? `<circle cx="${cx}" cy="${cy}" r="${(coreR*0.5).toFixed(1)}" fill="rgba(255,255,255,.55)" opacity="${(0.3+0.5*t).toFixed(2)}"/>` : ''}`;
  }
  _lightLabel(bri, st) {
    if (st === 'unavailable') return 'Niedost\u0119pne';
    if (bri === 0)  return 'Wy\u0142\u0105czone';
    if (bri < 30)   return 'Przyciemnione';
    if (bri < 70)   return '\u015arednia jasno\u015b\u0107';
    if (bri < 100)  return 'Jasno';
    return 'Maksymalna jasno\u015b\u0107';
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

    this.shadowRoot.innerHTML = `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      :host{display:block;font-family:-apple-system,'SF Pro Text','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}

      .glow{ border-radius:18px; transition:box-shadow .5s ease; }
      .glow.lit{
        box-shadow:
          0 0 0 1px rgba(255,214,90,.20),
          0 0 18px 2px rgba(255,214,90,.13),
          0 0 40px 6px rgba(255,214,90,.06);
      }

      .card{
        background:linear-gradient(150deg,#0b1120 0%,#0d1828 100%);
        border:.5px solid rgba(255,255,255,.08);
        border-radius:18px;
        padding:14px 16px;
        position:relative;
        overflow:hidden;
      }
      .card::before{
        content:'';position:absolute;top:0;left:0;right:0;height:1px;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);
        pointer-events:none;
      }

      @keyframes louver-pulse {
        0%,100%{ box-shadow:0 0 0 0px rgba(255,159,10,0) }
        50%    { box-shadow:0 0 0 5px rgba(255,159,10,.18) }
      }
      @keyframes light-pulse {
        0%,100%{ box-shadow:0 0 0 0px rgba(255,214,90,0),       0 0 0px  0px rgba(255,214,90,0) }
        50%    { box-shadow:0 0 0 5px rgba(255,214,90,.15), 0 0 var(--lb-spread,0px) var(--lb-spread,0px) rgba(255,214,90,var(--lb-op,0)) }
      }
      .iconbox.louver-active{ animation:louver-pulse 2.5s ease-in-out infinite; }
      .iconbox.light-active { animation:light-pulse  3.0s ease-in-out infinite; }

      .hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
      .hdr .title{font-size:15px;font-weight:700;color:rgba(255,255,255,.92);letter-spacing:-.2px}
      .hdr .title .room{font-size:11px;font-weight:400;color:#636366}
      .hdr .badge{font-size:11px;color:#636366;display:flex;align-items:center;gap:6px}
      .hdr .badge .dot{width:7px;height:7px;border-radius:50%;background:#30d158;box-shadow:0 0 8px #30d158}

      /* compact row */
      .row{display:flex;align-items:center;gap:13px;padding:14px 0}
      .row + .row{border-top:.5px solid rgba(255,255,255,.07)}

      .iconbox{
        width:44px;height:44px;border-radius:12px;flex-shrink:0;
        display:flex;align-items:center;justify-content:center;
        background:rgba(142,142,147,.07);
        border:.5px solid rgba(142,142,147,.15);
        transition:background .35s,border-color .35s,box-shadow .45s;
      }
      .mid{flex:1;min-width:0}
      .name{font-size:14px;font-weight:600;color:rgba(255,255,255,.90);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .status{font-size:12px;color:#636366;margin-top:2px;transition:color .3s}

      /* segmented control */
      .seg{
        display:flex;gap:3px;flex-shrink:0;
        background:rgba(255,255,255,.04);
        border:.5px solid rgba(255,255,255,.07);
        border-radius:11px;padding:3px;
      }
      .seg button{
        min-width:38px;min-height:38px;
        display:flex;align-items:center;justify-content:center;
        border:none;background:none;border-radius:8px;
        font-family:inherit;font-size:11px;font-weight:700;
        color:rgba(255,255,255,.40);
        cursor:pointer;touch-action:manipulation;
        -webkit-tap-highlight-color:transparent;user-select:none;
        appearance:none;-webkit-appearance:none;padding:0;
        transition:background .15s,color .15s,transform .1s;
      }
      .seg button.pressed{transform:scale(.9);background:rgba(255,255,255,.12);color:rgba(255,255,255,.8)}

      /* louver accent (orange) */
      .louver .seg button.on{ background:rgba(255,159,10,.18); color:#ff9f0a; box-shadow:0 0 12px rgba(255,159,10,.22) inset; }
      .louver .seg button.on.zero{ background:rgba(255,255,255,.08); color:rgba(255,255,255,.75); box-shadow:none; }
      /* light accent (yellow) */
      .light .seg button.on{ background:rgba(255,214,90,.18); color:#ffd65a; box-shadow:0 0 12px rgba(255,214,90,.22) inset; }
      .light .seg button.on.zero{ background:rgba(255,255,255,.08); color:rgba(255,255,255,.75); box-shadow:none; }

      @media(hover:hover){
        .seg button:hover:not(.on){background:rgba(255,255,255,.07);color:rgba(255,255,255,.65)}
      }
    </style>

    <div class="glow" id="glow">
      <div class="card">
        <div class="hdr">
          <div class="title">${this._name}${this._room ? `<span class="room"> \u00b7 ${this._room}</span>` : ''}</div>
          <div class="badge"><span class="dot"></span>2 obwody</div>
        </div>

        <!-- LAMELE -->
        <div class="row louver">
          <div class="iconbox" id="l-iconbox">
            <svg id="l-icon" width="30" height="30" viewBox="0 0 32 32" overflow="visible"></svg>
          </div>
          <div class="mid">
            <div class="name">${this._coverName}</div>
            <div class="status" id="l-status">\u2014</div>
          </div>
          <div class="seg" id="l-seg">
            ${PRESETS.map(t => `<button type="button" data-tilt="${t}">${t}%</button>`).join('')}
          </div>
        </div>

        <!-- SPOT LED -->
        <div class="row light">
          <div class="iconbox" id="b-iconbox">
            <svg id="b-icon" width="30" height="30" viewBox="0 0 32 32" overflow="visible"></svg>
          </div>
          <div class="mid">
            <div class="name">${this._lightName}</div>
            <div class="status" id="b-status">\u2014</div>
          </div>
          <div class="seg" id="b-seg">
            ${PRESETS.map(b => `<button type="button" data-bri="${b}">${b}%</button>`).join('')}
          </div>
        </div>
      </div>
    </div>`;

    const lIcon = this.shadowRoot.getElementById('l-icon');
    if (lIcon) lIcon.innerHTML = this._drawSlat(0, 'rgba(142,142,147,.65)');
    const bIcon = this.shadowRoot.getElementById('b-icon');
    if (bIcon) bIcon.innerHTML = this._drawBulb(0, 'rgba(142,142,147,.65)');

    this.shadowRoot.querySelectorAll('#l-seg button').forEach(btn => {
      this._bindPress(btn, 'pressed');
      btn.addEventListener('click', () => {
        this._svcCover('set_cover_tilt_position', { tilt_position: parseInt(btn.dataset.tilt) });
      });
    });
    this.shadowRoot.querySelectorAll('#b-seg button').forEach(btn => {
      this._bindPress(btn, 'pressed');
      btn.addEventListener('click', () => {
        const b = parseInt(btn.dataset.bri);
        if (b === 0) this._svcLight('turn_off');
        else this._svcLight('turn_on', { brightness_pct: b });
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
    const svg   = this.shadowRoot.getElementById('l-icon');
    const step  = now => {
      const t = Math.min((now - t0) / dur, 1);
      this._curDeg = start + diff * ease(t);
      if (svg) svg.innerHTML = this._drawSlat(this._curDeg, color);
      if (t < 1) this._raf = requestAnimationFrame(step);
      else this._curDeg = target;
    };
    this._raf = requestAnimationFrame(step);
  }

  _updateLouver(tilt, st) {
    this._lastTilt = tilt;
    const r = this.shadowRoot;
    const on  = tilt > 0;
    const slatColor = on ? 'rgba(255,159,10,.88)' : 'rgba(142,142,147,.65)';
    const statusEl = r.getElementById('l-status');
    const iconbox = r.getElementById('l-iconbox');

    if (statusEl){ statusEl.textContent = this._louverLabel(tilt, st); statusEl.style.color = on ? 'rgba(255,159,10,.70)' : '#636366'; }
    if (iconbox){
      iconbox.style.background = on ? 'rgba(255,159,10,.10)' : 'rgba(142,142,147,.07)';
      iconbox.style.border = `.5px solid ${on ? 'rgba(255,159,10,.20)' : 'rgba(142,142,147,.15)'}`;
      iconbox.classList.toggle('louver-active', on);
    }
    r.querySelectorAll('#l-seg button').forEach(b => {
      const v = parseInt(b.dataset.tilt);
      const active = v === tilt;
      b.classList.toggle('on', active);
      b.classList.toggle('zero', active && v === 0);
    });

    const targetDeg = this._deg(tilt);
    if (Math.abs(targetDeg - this._curDeg) > 0.5) this._animateTo(targetDeg);
    else { const svg = r.getElementById('l-icon'); if (svg) svg.innerHTML = this._drawSlat(this._curDeg, slatColor); }
  }

  _updateLight(bri, on, st) {
    this._lastBri = bri;
    const r = this.shadowRoot;
    const glyphColor = on ? '#ffd65a' : 'rgba(142,142,147,.65)';
    const statusEl = r.getElementById('b-status');
    const glowEl = r.getElementById('glow');
    const iconbox = r.getElementById('b-iconbox');
    const iconEl = r.getElementById('b-icon');

    if (statusEl){ statusEl.textContent = this._lightLabel(bri, st); statusEl.style.color = on ? 'rgba(255,214,90,.72)' : '#636366'; }
    if (glowEl) glowEl.classList.toggle('lit', on);
    if (iconbox){
      const t = bri / 100;
      iconbox.style.background = on ? 'rgba(255,214,90,.10)' : 'rgba(142,142,147,.07)';
      iconbox.style.border = `.5px solid ${on ? 'rgba(255,214,90,.22)' : 'rgba(142,142,147,.15)'}`;
      iconbox.style.setProperty('--lb-spread', on ? Math.round(18 * t) + 'px' : '0px');
      iconbox.style.setProperty('--lb-op',     on ? (0.45 * t).toFixed(2) : '0');
      iconbox.classList.toggle('light-active', on);
    }
    if (iconEl) iconEl.innerHTML = this._drawBulb(bri, glyphColor);
    r.querySelectorAll('#b-seg button').forEach(b => {
      const v = parseInt(b.dataset.bri);
      const active = v === bri;
      b.classList.toggle('on', active);
      b.classList.toggle('zero', active && v === 0);
    });
  }

  getCardSize() { return 2; }
}

customElements.define('aha-pergola-card', PergolaCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-pergola-card',
  name:        'Pergola Card',
  preview:     false,
  description: 'Sterowanie pergol\u0105 w stylu Apple Home: lamele + spot LED, kompaktowy uk\u0142ad wierszowy.',
});