class PergolaCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._rendered = false;
    this._curDeg = 0;
    this._raf = null;
    this._lastTilt  = 0;
    this._lastBri   = 0;
    this._lastOrbs  = false;
    this._lastSpotG = false;
    this._coverLastChanged = null;
    this._lightLastChanged = null;
    this._ticker = null;
    this._lightTicker = null;
  }

  setConfig(config) {
    this._config = config;
    this._coverEntity = config.cover_entity || config.entity || 'cover.pergola_lamele';
    this._coverName   = config.cover_name   || 'Lamele';
    this._lightEntity = config.light_entity || 'light.pergola_spot';
    this._lightName   = config.light_name   || 'Spot LED';
    this._name        = config.name  || 'Pergola';
    this._room        = config.room  || '';
    this._orbsEntity  = config.orbs_entity || null;
    this._orbsName    = config.orbs_name   || 'Kule świecące';
    this._spotGEntity = config.spot_entity || null;
    this._spotGName   = config.spot_name   || 'Spot na drzewa';
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) { this._render(); this._rendered = true; }

    const cov = hass.states[this._coverEntity];
    if (cov) {
      const tilt = cov.attributes.current_tilt_position ?? 0;
      this._coverLastChanged = cov.last_changed;
      this._updateLouver(tilt, cov.state);
    }
    const lit = hass.states[this._lightEntity];
    if (lit) {
      const on = lit.state === 'on';
      const briRaw = lit.attributes.brightness;
      const bri = on ? Math.round(((briRaw ?? 255) / 255) * 100) : 0;
      this._lightLastChanged = lit.last_changed;
      this._updateLight(bri, on, lit.state);
    }
    if (this._orbsEntity) {
      const orbs = hass.states[this._orbsEntity];
      if (orbs) this._updateOrbs(orbs.state === 'on');
    }
    if (this._spotGEntity) {
      const spotg = hass.states[this._spotGEntity];
      if (spotg) this._updateSpotG(spotg.state === 'on');
    }
  }

  _svcCover(service, data = {}) {
    this._hass.callService('cover', service, { entity_id: this._coverEntity, ...data });
  }
  _svcLight(service, data = {}) {
    this._hass.callService('light', service, { entity_id: this._lightEntity, ...data });
  }
  _svcOrbs(on) {
    this._hass.callService('homeassistant', on ? 'turn_on' : 'turn_off', { entity_id: this._orbsEntity });
  }
  _svcSpotG(on) {
    this._hass.callService('homeassistant', on ? 'turn_on' : 'turn_off', { entity_id: this._spotGEntity });
  }

  // ── louver glyph ──
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

  // ── orbs glyph ──
  _drawOrbs(on) {
    const fill  = on ? '#ffb347' : '#1e1e2a';
    const high  = on ? '#fff3d6' : 'rgba(255,255,255,.05)';
    const bs    = on ? 'rgba(255,200,120,.50)' : 'rgba(255,255,255,.08)';
    const ss    = on ? 'rgba(255,200,120,.35)' : 'rgba(255,255,255,.06)';
    const g1    = on ? 'drop-shadow(0 0 5px rgba(255,179,71,.70))' : 'none';
    const g2    = on ? 'drop-shadow(0 0 3px rgba(255,179,71,.55))' : 'none';
    return `
      <circle cx="13" cy="19" r="9"   fill="${fill}" stroke="${bs}" stroke-width=".8" style="filter:${g1}"/>
      <circle cx="11" cy="17" r="4.5" fill="${high}" opacity="${on ? '.62' : '.8'}"/>
      <circle cx="24" cy="23" r="6"   fill="${fill}" stroke="${ss}" stroke-width=".6" style="filter:${g2}"/>
      <circle cx="23" cy="21.5" r="3" fill="${high}" opacity="${on ? '.55' : '.8'}"/>`;
  }

  // ── ground spot glyph ──
  _drawGroundSpot(on) {
    const face  = on ? '#fff2d0' : '#15151c';
    const faceB = on ? 'rgba(255,210,140,.60)' : 'rgba(255,255,255,.12)';
    const glow  = on ? 'drop-shadow(0 0 4px rgba(255,184,77,.85))' : 'none';
    const bOp   = on ? '1' : '0';
    return `
      <g transform="rotate(35, 16, 20)">
        <rect x="15"   y="25"  width="2.5" height="8"  rx="1.2" fill="#14141e"/>
        <rect x="13.5" y="17"  width="5"   height="10" rx="2.5" fill="#1e1e2e"/>
        <rect x="10.5" y="5"   width="11"  height="14" rx="5"   fill="#252535" stroke="rgba(255,255,255,.10)" stroke-width=".7"/>
        <ellipse cx="16" cy="6.5" rx="5" ry="2.8" fill="${face}" stroke="${faceB}" stroke-width=".6" style="filter:${glow}"/>
        <path d="M11 5 L4 -8 L28 -8 L21 5 Z" fill="rgba(255,200,100,.26)" opacity="${bOp}" style="filter:blur(3px)"/>
        <ellipse cx="16" cy="1" rx="7.5" ry="5" fill="rgba(255,210,120,.38)" opacity="${bOp}" style="filter:blur(2.5px)"/>
      </g>`;
  }

  // ── ceiling LED spot glyph ──
  _drawSpot(bri) {
    const t  = Math.max(0, Math.min(1, bri / 100));
    const on = bri > 0;
    const sG = on ? Math.round(200 + 40  * t) : 28;
    const sB = on ? Math.round(80  + 112 * t) : 40;
    const stripFill = on ? `rgb(255,${sG},${sB})` : '#1c1c28';
    const h1 = on ? (0.55 + 0.30 * t).toFixed(2) : '0';
    const h2 = on ? (0.28 + 0.18 * t).toFixed(2) : '0';
    const h3 = on ? (0.12 + 0.10 * t).toFixed(2) : '0';
    const hotOp = on && t > 0.5 ? ((t - 0.5) * 0.9).toFixed(2) : '0';
    const ry1 = (5.5 + 7.0 * t).toFixed(1);
    const ry2 = (8.0 + 9.0 * t).toFixed(1);
    const e1  = on ? (0.45 + 0.27 * t).toFixed(2) : '0';
    const e2  = on ? (0.20 + 0.15 * t).toFixed(2) : '0';
    return `
      <rect x="4"   y="5"   width="24" height="8"   rx="3.5" fill="#1c1c28" stroke="rgba(255,255,255,.10)" stroke-width=".8"/>
      <rect x="5.5" y="6.5" width="21" height="5"   rx="2.5" fill="rgba(255,200,100,${h3})"/>
      <rect x="7"   y="7.5" width="18" height="3"   rx="1.5" fill="rgba(255,200,100,${h2})"/>
      <rect x="8.5" y="8"   width="15" height="2"   rx="1"   fill="rgba(255,200,100,${h1})"/>
      <rect x="9"   y="8.5" width="14" height="1.5" rx=".75" fill="${stripFill}"/>
      <rect x="12"  y="8.5" width="8"  height="1.5" rx=".75" fill="rgba(255,255,255,${hotOp})"/>
      <ellipse cx="16" cy="15" rx="12" ry="${ry2}" fill="rgba(255,200,100,${e2})"/>
      <ellipse cx="16" cy="14" rx="8"  ry="${ry1}" fill="rgba(255,200,100,${e1})"/>`;
  }
  _lightLabel(bri, st) {
    if (st === 'unavailable') return 'Niedost\u0119pne';
    if (bri === 0)  return 'Wy\u0142\u0105czone';
    if (bri < 30)   return 'Przyciemnione';
    if (bri < 70)   return '\u015arednia';
    if (bri < 100)  return 'Jasno';
    return 'Maksymalnie';
  }

  _bindPress(el, cls) {
    const on  = () => el.classList.add(cls);
    const off = () => el.classList.remove(cls);
    el.addEventListener('pointerdown',   on,  { passive: true });
    el.addEventListener('pointerup',     off, { passive: true });
    el.addEventListener('pointercancel', off, { passive: true });
    el.addEventListener('pointerleave',  off, { passive: true });
  }

  _render() {
    const PRESETS = [0, 33, 66, 100];
    const hasGarden = this._orbsEntity || this._spotGEntity;

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
        padding:14px 16px 16px;
        position:relative;
        overflow:hidden;
      }
      .card::before{
        content:'';position:absolute;top:0;left:0;right:0;height:1px;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);
        pointer-events:none;
      }

      /* ── animations ── */
      @keyframes louver-pulse {
        0%,100%{ box-shadow:0 0 0 0px rgba(255,159,10,0) }
        50%    { box-shadow:0 0 0 5px rgba(255,159,10,.18) }
      }
      @keyframes orbs-pulse {
        0%,100%{ box-shadow:0 0 0 0px rgba(255,179,71,0) }
        50%    { box-shadow:0 0 0 5px rgba(255,179,71,.18) }
      }
      @keyframes spotg-pulse {
        0%,100%{ box-shadow:0 0 0 0px rgba(255,184,77,0) }
        50%    { box-shadow:0 0 0 5px rgba(255,184,77,.18) }
      }
      @keyframes light-pulse {
        0%,100%{ box-shadow:0 0 0 0px rgba(255,214,90,0), 0 0 0px 0px rgba(255,214,90,0) }
        50%    { box-shadow:0 0 0 5px rgba(255,214,90,.15), 0 0 var(--lb-spread,0px) var(--lb-spread,0px) rgba(255,214,90,var(--lb-op,0)) }
      }
      .iconbox.louver-active { animation:louver-pulse 2.5s ease-in-out infinite; }
      .iconbox.orbs-active   { animation:orbs-pulse   2.8s ease-in-out infinite; }
      .iconbox.spotg-active  { animation:spotg-pulse  3.2s ease-in-out infinite; }
      .iconbox.light-active  { animation:light-pulse  3.0s ease-in-out infinite; }

      /* ── header ── */
      .hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
      .hdr .title{font-size:15px;font-weight:700;color:rgba(255,255,255,.92);letter-spacing:-.2px}
      .hdr .title .room{font-size:11px;font-weight:400;color:#636366}
      .hdr .badge{font-size:11px;color:#636366;display:flex;align-items:center;gap:6px;transition:color .3s}
      .hdr .badge.active{color:rgba(255,255,255,.55)}
      .hdr .badge .dot{width:7px;height:7px;border-radius:50%;background:rgba(142,142,147,.35);transition:background .3s,box-shadow .3s}
      .hdr .badge .dot.active{background:#30d158;box-shadow:0 0 8px #30d158}

      /* ── pergola group (lamele + spot LED, wiersze z subtelną ramką) ── */
      .perg-group{
        position:relative;
        border-radius:13px;
        overflow:hidden;
        border:.5px solid rgba(255,255,255,.09);
        background:rgba(255,255,255,.022);
        margin-bottom:${hasGarden ? '10px' : '0'};
        padding:0 12px 0 16px;
      }
      /* lewy pasek gradientu pomarańcz→żółty */
      .perg-group::before{
        content:'';
        position:absolute;left:0;top:0;bottom:0;width:2.5px;
        background:linear-gradient(180deg,rgba(255,159,10,.65) 0%,rgba(255,214,90,.65) 100%);
      }

      .iconbox{
        width:44px;height:44px;border-radius:12px;flex-shrink:0;
        display:flex;align-items:center;justify-content:center;
        background:rgba(142,142,147,.07);
        border:.5px solid rgba(142,142,147,.15);
        transition:background .35s,border-color .35s,box-shadow .45s;
      }

      /* ── garden section ── */
      .sect-sep{
        display:flex;align-items:center;gap:8px;
        margin-bottom:4px;
      }
      .sect-sep::before,.sect-sep::after{
        content:'';flex:1;height:.5px;
        background:rgba(255,255,255,.07);
      }
      .sect-sep span{
        font-size:9px;font-weight:700;letter-spacing:.12em;
        text-transform:uppercase;color:rgba(255,255,255,.20);
        white-space:nowrap;
      }

      /* garden rows */
      .row{display:flex;align-items:center;gap:13px;padding:12px 0}
      .row + .row{border-top:.5px solid rgba(255,255,255,.07)}

      .mid{flex:1;min-width:0}
      .name{font-size:14px;font-weight:600;color:rgba(255,255,255,.90);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .status{font-size:12px;color:#636366;margin-top:2px;transition:color .3s}

      .seg{
        display:flex;gap:3px;flex-shrink:0;
        background:rgba(255,255,255,.04);
        border:.5px solid rgba(255,255,255,.07);
        border-radius:11px;padding:3px;
      }
      .seg button{
        min-width:44px;min-height:38px;
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

      .orbs  .seg button.on      { background:rgba(255,179,71,.18); color:#ffb347; box-shadow:0 0 12px rgba(255,179,71,.22) inset; }
      .orbs  .seg button.on.zero { background:rgba(255,255,255,.08); color:rgba(255,255,255,.75); box-shadow:none; }
      .spotg .seg button.on      { background:rgba(255,184,77,.18); color:#ffb84d; box-shadow:0 0 12px rgba(255,184,77,.22) inset; }
      .spotg .seg button.on.zero { background:rgba(255,255,255,.08); color:rgba(255,255,255,.75); box-shadow:none; }

      @media(hover:hover){
        .seg button:hover:not(.on){background:rgba(255,255,255,.07);color:rgba(255,255,255,.65)}
      }

      /* ── wyłącz wszystkie ── */
      .all-off-row{
        border-top:.5px solid rgba(255,255,255,.07);
        margin-top:4px;padding-top:10px;
        display:flex;justify-content:center;
      }
      .all-off-btn{
        display:inline-flex;align-items:center;gap:5px;
        background:none;border:none;
        font-family:inherit;font-size:11px;font-weight:600;
        color:rgba(255,255,255,.28);
        cursor:pointer;touch-action:manipulation;
        -webkit-tap-highlight-color:transparent;user-select:none;
        padding:6px 12px;border-radius:8px;
        transition:color .15s,background .15s,transform .1s;
      }
      .all-off-btn.pressed{
        transform:scale(.95);
        background:rgba(255,255,255,.07);
        color:rgba(255,255,255,.65);
      }
      @media(hover:hover){
        .all-off-btn:hover{color:rgba(255,255,255,.55);background:rgba(255,255,255,.05)}
      }
    </style>

    <div class="glow" id="glow">
      <div class="card">

        <!-- HEADER -->
        <div class="hdr">
          <div class="title">${this._name}${this._room ? `<span class="room"> \u00b7 ${this._room}</span>` : ''}</div>
          <div class="badge" id="badge"><span class="dot" id="badge-dot"></span><span id="badge-txt"></span></div>
        </div>

        <!-- PERGOLA GROUP — lamele + spot LED, zgrupowane -->
        <div class="perg-group">

          <!-- Lamele -->
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

          <!-- Spot LED -->
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

        ${hasGarden ? `
        <!-- OGRÓD — separator + wiersze -->
        <div class="sect-sep"><span>Ogr\u00f3d</span></div>

        ${this._orbsEntity ? `
        <div class="row orbs">
          <div class="iconbox" id="o-iconbox">
            <svg id="o-icon" width="30" height="30" viewBox="0 0 32 32" overflow="visible"></svg>
          </div>
          <div class="mid">
            <div class="name">${this._orbsName}</div>
            <div class="status" id="o-status">\u2014</div>
          </div>
          <div class="seg" id="o-seg">
            <button type="button" data-val="off">Wy\u0142</button>
            <button type="button" data-val="on">W\u0142</button>
          </div>
        </div>` : ''}

        ${this._spotGEntity ? `
        <div class="row spotg">
          <div class="iconbox" id="g-iconbox">
            <svg id="g-icon" width="30" height="30" viewBox="0 0 32 32" overflow="visible"></svg>
          </div>
          <div class="mid">
            <div class="name">${this._spotGName}</div>
            <div class="status" id="g-status">\u2014</div>
          </div>
          <div class="seg" id="g-seg">
            <button type="button" data-val="off">Wy\u0142</button>
            <button type="button" data-val="on">W\u0142</button>
          </div>
        </div>` : ''}
        ` : ''}

        <!-- Wyłącz wszystkie -->
        <div class="all-off-row">
          <button class="all-off-btn" id="btn-all-off" type="button">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              <path d="M3.5 4a5 5 0 1 0 7 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            Wy\u0142\u0105cz wszystkie lampy
          </button>
        </div>

      </div>
    </div>`;

    // init glyphs
    const lIcon = this.shadowRoot.getElementById('l-icon');
    if (lIcon) lIcon.innerHTML = this._drawSlat(0, 'rgba(142,142,147,.65)');
    const bIcon = this.shadowRoot.getElementById('b-icon');
    if (bIcon) bIcon.innerHTML = this._drawSpot(0);
    const oIcon = this.shadowRoot.getElementById('o-icon');
    if (oIcon) oIcon.innerHTML = this._drawOrbs(false);
    const gIcon = this.shadowRoot.getElementById('g-icon');
    if (gIcon) gIcon.innerHTML = this._drawGroundSpot(false);

    // bind louver seg
    this.shadowRoot.querySelectorAll('#l-seg button').forEach(btn => {
      this._bindPress(btn, 'pressed');
      btn.addEventListener('click', () => {
        this._svcCover('set_cover_tilt_position', { tilt_position: parseInt(btn.dataset.tilt) });
      });
    });
    // bind LED seg
    this.shadowRoot.querySelectorAll('#b-seg button').forEach(btn => {
      this._bindPress(btn, 'pressed');
      btn.addEventListener('click', () => {
        const b = parseInt(btn.dataset.bri);
        if (b === 0) this._svcLight('turn_off');
        else this._svcLight('turn_on', { brightness_pct: b });
      });
    });
    // bind orbs toggle
    if (this._orbsEntity) {
      this.shadowRoot.querySelectorAll('#o-seg button').forEach(btn => {
        this._bindPress(btn, 'pressed');
        btn.addEventListener('click', () => this._svcOrbs(btn.dataset.val === 'on'));
      });
    }
    // bind ground spot toggle
    if (this._spotGEntity) {
      this.shadowRoot.querySelectorAll('#g-seg button').forEach(btn => {
        this._bindPress(btn, 'pressed');
        btn.addEventListener('click', () => this._svcSpotG(btn.dataset.val === 'on'));
      });
    }

    // bind all-off
    const btnAllOff = this.shadowRoot.getElementById('btn-all-off');
    if (btnAllOff) {
      this._bindPress(btnAllOff, 'pressed');
      btnAllOff.addEventListener('click', () => this._allOff());
    }

    this._updateBadge();
  }

  _allOff() {
    this._svcLight('turn_off');
    if (this._orbsEntity)  this._svcOrbs(false);
    if (this._spotGEntity) this._svcSpotG(false);
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

  _elapsedSince(ts, active) {
    if (!ts || !active) return null;
    const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
    if (mins < 1)  return 'przed chwil\u0105';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h} h ${m} min` : `${h} h`;
  }

  _startTicker() {
    if (this._ticker) return;
    this._ticker = setInterval(() => {
      const el = this.shadowRoot && this.shadowRoot.getElementById('l-status');
      if (!el || this._lastTilt === 0) return;
      const t = this._elapsedSince(this._coverLastChanged, this._lastTilt > 0);
      if (t) el.textContent = `${this._louverLabel(this._lastTilt, null)} \u00b7 ${t}`;
    }, 60000);
  }

  _startLightTicker() {
    if (this._lightTicker) return;
    this._lightTicker = setInterval(() => {
      const el = this.shadowRoot && this.shadowRoot.getElementById('b-status');
      if (!el || this._lastBri === 0) return;
      const t = this._elapsedSince(this._lightLastChanged, this._lastBri > 0);
      if (t) el.textContent = `${this._lightLabel(this._lastBri, null)} \u00b7 ${t}`;
    }, 60000);
  }

  disconnectedCallback() {
    if (this._ticker)      { clearInterval(this._ticker);      this._ticker = null; }
    if (this._lightTicker) { clearInterval(this._lightTicker); this._lightTicker = null; }
    if (this._raf)         { cancelAnimationFrame(this._raf);  this._raf = null; }
  }

  _updateBadge() {
    const total  = 2 + (this._orbsEntity  ? 1 : 0) + (this._spotGEntity ? 1 : 0);
    const active = (this._lastTilt  > 0 ? 1 : 0) + (this._lastBri > 0 ? 1 : 0)
                 + (this._lastOrbs  ? 1 : 0) + (this._lastSpotG ? 1 : 0);
    const r = this.shadowRoot;
    const badge = r.getElementById('badge');
    const dot   = r.getElementById('badge-dot');
    const txt   = r.getElementById('badge-txt');
    if (badge) badge.classList.toggle('active', active > 0);
    if (dot)   dot.classList.toggle('active',   active > 0);
    if (txt)   txt.textContent = `${active}/${total} obwody`;
  }

  _updateLouver(tilt, st) {
    this._lastTilt = tilt;
    const r = this.shadowRoot;
    const on = tilt > 0;
    const slatColor = on ? 'rgba(255,159,10,.88)' : 'rgba(142,142,147,.65)';
    const statusEl  = r.getElementById('l-status');
    const iconbox   = r.getElementById('l-iconbox');

    if (statusEl) {
      const elapsed = on ? this._elapsedSince(this._coverLastChanged, on) : null;
      statusEl.textContent = elapsed
        ? `${this._louverLabel(tilt, st)} \u00b7 ${elapsed}`
        : this._louverLabel(tilt, st);
      statusEl.style.color = on ? 'rgba(255,159,10,.70)' : '#636366';
    }
    if (on) this._startTicker();
    else if (this._ticker) { clearInterval(this._ticker); this._ticker = null; }
    if (iconbox) {
      iconbox.style.background = on ? 'rgba(255,159,10,.10)' : 'rgba(142,142,147,.07)';
      iconbox.style.border = `.5px solid ${on ? 'rgba(255,159,10,.20)' : 'rgba(142,142,147,.15)'}`;
      iconbox.classList.toggle('louver-active', on);
    }
    const tiltSnap = [0,33,66,100].reduce((a,b) => Math.abs(b-tilt) < Math.abs(a-tilt) ? b : a);
    r.querySelectorAll('#l-seg button').forEach(b => {
      const v = parseInt(b.dataset.tilt);
      b.classList.toggle('on',   v === tiltSnap);
      b.classList.toggle('zero', v === tiltSnap && v === 0);
    });
    const targetDeg = this._deg(tilt);
    if (Math.abs(targetDeg - this._curDeg) > 0.5) this._animateTo(targetDeg);
    else { const svg = r.getElementById('l-icon'); if (svg) svg.innerHTML = this._drawSlat(this._curDeg, slatColor); }
    this._updateBadge();
  }

  _updateLight(bri, on, st) {
    this._lastBri = bri;
    const r = this.shadowRoot;
    const statusEl = r.getElementById('b-status');
    const glowEl   = r.getElementById('glow');
    const iconbox  = r.getElementById('b-iconbox');
    const iconEl   = r.getElementById('b-icon');

    if (statusEl) {
      const elapsed = on ? this._elapsedSince(this._lightLastChanged, on) : null;
      statusEl.textContent = elapsed
        ? `${this._lightLabel(bri, st)} \u00b7 ${elapsed}`
        : this._lightLabel(bri, st);
      statusEl.style.color = on ? 'rgba(255,214,90,.72)' : '#636366';
    }
    if (on) this._startLightTicker();
    else if (this._lightTicker) { clearInterval(this._lightTicker); this._lightTicker = null; }
    if (glowEl) glowEl.classList.toggle('lit', on);
    if (iconbox) {
      const t = bri / 100;
      iconbox.style.background = on ? 'rgba(255,214,90,.10)' : 'rgba(142,142,147,.07)';
      iconbox.style.border = `.5px solid ${on ? 'rgba(255,214,90,.22)' : 'rgba(142,142,147,.15)'}`;
      iconbox.style.setProperty('--lb-spread', on ? Math.round(18 * t) + 'px' : '0px');
      iconbox.style.setProperty('--lb-op',     on ? (0.45 * t).toFixed(2) : '0');
      iconbox.classList.toggle('light-active', on);
    }
    if (iconEl) iconEl.innerHTML = this._drawSpot(bri);
    const briSnap = on ? [0,33,66,100].reduce((a,b) => Math.abs(b-bri) < Math.abs(a-bri) ? b : a) : 0;
    r.querySelectorAll('#b-seg button').forEach(b => {
      const v = parseInt(b.dataset.bri);
      b.classList.toggle('on',   v === briSnap);
      b.classList.toggle('zero', v === briSnap && v === 0);
    });
    this._updateBadge();
  }

  _updateOrbs(on) {
    this._lastOrbs = on;
    const r = this.shadowRoot;
    const iconbox  = r.getElementById('o-iconbox');
    const iconEl   = r.getElementById('o-icon');
    const statusEl = r.getElementById('o-status');
    if (iconEl)   iconEl.innerHTML = this._drawOrbs(on);
    if (statusEl) {
      statusEl.textContent = on ? 'W\u0142\u0105czone' : 'Wy\u0142\u0105czone';
      statusEl.style.color = on ? 'rgba(255,179,71,.75)' : '#636366';
    }
    if (iconbox) {
      iconbox.style.background = on ? 'rgba(255,179,71,.10)' : 'rgba(142,142,147,.07)';
      iconbox.style.border = `.5px solid ${on ? 'rgba(255,179,71,.22)' : 'rgba(142,142,147,.15)'}`;
      iconbox.classList.toggle('orbs-active', on);
    }
    r.querySelectorAll('#o-seg button').forEach(b => {
      const match = b.dataset.val === (on ? 'on' : 'off');
      b.classList.toggle('on',   match);
      b.classList.toggle('zero', match && !on);
    });
    this._updateBadge();
  }

  _updateSpotG(on) {
    this._lastSpotG = on;
    const r = this.shadowRoot;
    const iconbox  = r.getElementById('g-iconbox');
    const iconEl   = r.getElementById('g-icon');
    const statusEl = r.getElementById('g-status');
    if (iconEl)   iconEl.innerHTML = this._drawGroundSpot(on);
    if (statusEl) {
      statusEl.textContent = on ? 'W\u0142\u0105czone' : 'Wy\u0142\u0105czone';
      statusEl.style.color = on ? 'rgba(255,184,77,.75)' : '#636366';
    }
    if (iconbox) {
      iconbox.style.background = on ? 'rgba(255,184,77,.10)' : 'rgba(142,142,147,.07)';
      iconbox.style.border = `.5px solid ${on ? 'rgba(255,184,77,.22)' : 'rgba(142,142,147,.15)'}`;
      iconbox.classList.toggle('spotg-active', on);
    }
    r.querySelectorAll('#g-seg button').forEach(b => {
      const match = b.dataset.val === (on ? 'on' : 'off');
      b.classList.toggle('on',   match);
      b.classList.toggle('zero', match && !on);
    });
    this._updateBadge();
  }

  getCardSize() { return 2; }
}

customElements.define('aha-pergola-card', PergolaCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-pergola-card',
  name:        'Pergola Card',
  preview:     false,
  description: 'Sterowanie pergol\u0105 i ogr\u00f3dem: lamele + spot LED (razem) + kule + reflektor ogrodowy.',
});
