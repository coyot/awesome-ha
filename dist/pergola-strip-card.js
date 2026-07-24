/**
 * aha-pergola-strip-card
 * Poziomy pasek statusu lamp pergoli — ten sam styl co aha-kosiarka-card (slim).
 * Ikony z pergola-card, sekcje: Pergola | Ogród | Front domu.
 *
 * Config:
 *   cover_entity        (required) cover.*
 *   light_entity        (required) light.*
 *   orbs_entity         (optional) switch.*
 *   spot_entity         (optional) switch.*
 *   entry_lamp_entity   (optional) switch.*
 *   post_lamp_entity    (optional) switch.*
 *   cover_name          (optional) default "Lamele"
 *   light_name          (optional) default "Spot LED"
 *   orbs_name           (optional) default "Kule"
 *   spot_name           (optional) default "Drzewa"
 *   entry_lamp_name     (optional) default "Wejście"
 *   post_lamp_name      (optional) default "Słupek"
 */

class PergolaStripCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config          = config;
    this._coverEntity     = config.cover_entity  || 'cover.pergola_lamele';
    this._lightEntity     = config.light_entity  || 'light.pergola_spot';
    this._orbsEntity      = config.orbs_entity   || null;
    this._spotGEntity     = config.spot_entity   || null;
    this._entryLampEntity = config.entry_lamp_entity || null;
    this._postLampEntity  = config.post_lamp_entity  || null;
    this._coverName     = config.cover_name     || 'Lamele';
    this._lightName     = config.light_name     || 'Spot LED';
    this._orbsName      = config.orbs_name      || 'Kule';
    this._spotGName     = config.spot_name      || 'Drzewa';
    this._entryLampName = config.entry_lamp_name || 'Wejście';
    this._postLampName  = config.post_lamp_name  || 'Słupek';
  }

  set hass(hass) {
    this._hass = hass;

    const cov   = hass.states[this._coverEntity];
    const tilt  = cov ? (cov.attributes.current_tilt_position ?? 0) : 0;
    const louverOn = tilt > 0;

    const lit  = hass.states[this._lightEntity];
    const litOn = lit ? lit.state === 'on' : false;
    const briRaw = lit?.attributes.brightness;
    const bri    = litOn ? Math.round(((briRaw ?? 255) / 255) * 100) : 0;

    const orbsOn  = this._orbsEntity  ? hass.states[this._orbsEntity]?.state  === 'on' : null;
    const spotGOn = this._spotGEntity ? hass.states[this._spotGEntity]?.state === 'on' : null;
    const entryOn = this._entryLampEntity ? hass.states[this._entryLampEntity]?.state === 'on' : null;
    const postOn  = this._postLampEntity  ? hass.states[this._postLampEntity]?.state  === 'on' : null;

    this._render({ tilt, louverOn, bri, litOn, orbsOn, spotGOn, entryOn, postOn });
  }

  // ── SVG glyphs (z pergola-card) ───────────────────────────────────────────

  _deg(tilt) {
    const kf = [[0,0],[33,52],[66,85],[100,135]];
    for (let i = 0; i < kf.length - 1; i++) {
      const [p0,d0] = kf[i], [p1,d1] = kf[i+1];
      if (tilt >= p0 && tilt <= p1) return d0 + (tilt-p0)/(p1-p0)*(d1-d0);
    }
    return 135;
  }
  _drawSlat(tilt, on) {
    const deg = this._deg(tilt);
    const W = 28, H = 28, cx = W/2, cy = H/2, HL = W/2-4, TH = Math.max(1.8, HL*0.16);
    const r = deg * Math.PI / 180;
    const ca = Math.cos(r), sa = Math.sin(r);
    const px = -sa*TH, py = ca*TH;
    const x1 = cx-HL*ca, y1 = cy-HL*sa, x2 = cx+HL*ca, y2 = cy+HL*sa;
    const f = ([x,y]) => `${x.toFixed(1)},${y.toFixed(1)}`;
    const body  = [[x1-px,y1-py],[x2-px,y2-py],[x2+px,y2+py],[x1+px,y1+py]].map(f).join(' ');
    const shine = [[x1-px*.3,y1-py*.3],[x2-px*.3,y2-py*.3],[x2+px*.12,y2+py*.12],[x1+px*.12,y1+py*.12]].map(f).join(' ');
    const c = on ? 'rgba(255,159,10,.88)' : 'rgba(142,142,147,.50)';
    return `<svg width="24" height="24" viewBox="0 0 28 28" overflow="visible">
      <polygon points="${body}" fill="${c}"/>
      <polygon points="${shine}" fill="rgba(255,255,255,.20)"/>
      <circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="2" fill="rgba(0,0,0,.55)" stroke="${c}" stroke-width=".8"/>
      <circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="2" fill="rgba(0,0,0,.55)" stroke="${c}" stroke-width=".8"/>
    </svg>`;
  }

  _drawSpot(bri) {
    const t  = Math.max(0, Math.min(1, bri / 100));
    const on = bri > 0;
    const sG = on ? Math.round(200+40*t) : 28, sB = on ? Math.round(80+112*t) : 40;
    const stripFill = on ? `rgb(255,${sG},${sB})` : '#1c1c28';
    const h1 = on ? (0.55+0.30*t).toFixed(2) : '0';
    const h2 = on ? (0.28+0.18*t).toFixed(2) : '0';
    const h3 = on ? (0.12+0.10*t).toFixed(2) : '0';
    const hotOp = on && t>0.5 ? ((t-0.5)*0.9).toFixed(2) : '0';
    const ry1 = (4+6*t).toFixed(1), ry2 = (6+8*t).toFixed(1);
    const e1 = on ? (0.45+0.27*t).toFixed(2) : '0';
    const e2 = on ? (0.20+0.15*t).toFixed(2) : '0';
    return `<svg width="24" height="24" viewBox="0 0 32 32" overflow="visible">
      <rect x="4" y="5" width="24" height="8" rx="3.5" fill="#1c1c28" stroke="rgba(255,255,255,.10)" stroke-width=".8"/>
      <rect x="5.5" y="6.5" width="21" height="5" rx="2.5" fill="rgba(255,200,100,${h3})"/>
      <rect x="7" y="7.5" width="18" height="3" rx="1.5" fill="rgba(255,200,100,${h2})"/>
      <rect x="8.5" y="8" width="15" height="2" rx="1" fill="rgba(255,200,100,${h1})"/>
      <rect x="9" y="8.5" width="14" height="1.5" rx=".75" fill="${stripFill}"/>
      <rect x="12" y="8.5" width="8" height="1.5" rx=".75" fill="rgba(255,255,255,${hotOp})"/>
      <ellipse cx="16" cy="15" rx="12" ry="${ry2}" fill="rgba(255,200,100,${e2})"/>
      <ellipse cx="16" cy="14" rx="8" ry="${ry1}" fill="rgba(255,200,100,${e1})"/>
    </svg>`;
  }

  _drawOrbs(on) {
    const fill = on ? '#ffb347' : '#1e1e2a';
    const high = on ? '#fff3d6' : 'rgba(255,255,255,.05)';
    const bs   = on ? 'rgba(255,200,120,.50)' : 'rgba(255,255,255,.08)';
    const ss   = on ? 'rgba(255,200,120,.35)' : 'rgba(255,255,255,.06)';
    const g1   = on ? 'drop-shadow(0 0 4px rgba(255,179,71,.70))' : 'none';
    const g2   = on ? 'drop-shadow(0 0 3px rgba(255,179,71,.55))' : 'none';
    return `<svg width="24" height="24" viewBox="0 0 32 32" overflow="visible">
      <circle cx="13" cy="19" r="9" fill="${fill}" stroke="${bs}" stroke-width=".8" style="filter:${g1}"/>
      <circle cx="11" cy="17" r="4.5" fill="${high}" opacity="${on ? '.62' : '.8'}"/>
      <circle cx="24" cy="23" r="6" fill="${fill}" stroke="${ss}" stroke-width=".6" style="filter:${g2}"/>
      <circle cx="23" cy="21.5" r="3" fill="${high}" opacity="${on ? '.55' : '.8'}"/>
    </svg>`;
  }

  _drawGroundSpot(on) {
    const face  = on ? '#fff2d0' : '#15151c';
    const faceB = on ? 'rgba(255,210,140,.60)' : 'rgba(255,255,255,.12)';
    const glow  = on ? 'drop-shadow(0 0 4px rgba(255,184,77,.85))' : 'none';
    const bOp   = on ? '1' : '0';
    return `<svg width="24" height="24" viewBox="0 0 32 32" overflow="visible">
      <g transform="rotate(35, 16, 20)">
        <rect x="15" y="25" width="2.5" height="8" rx="1.2" fill="#14141e"/>
        <rect x="13.5" y="17" width="5" height="10" rx="2.5" fill="#1e1e2e"/>
        <rect x="10.5" y="5" width="11" height="14" rx="5" fill="#252535" stroke="rgba(255,255,255,.10)" stroke-width=".7"/>
        <ellipse cx="16" cy="6.5" rx="5" ry="2.8" fill="${face}" stroke="${faceB}" stroke-width=".6" style="filter:${glow}"/>
        <path d="M11 5 L4 -8 L28 -8 L21 5 Z" fill="rgba(255,200,100,.26)" opacity="${bOp}" style="filter:blur(3px)"/>
        <ellipse cx="16" cy="1" rx="7.5" ry="5" fill="rgba(255,210,120,.38)" opacity="${bOp}" style="filter:blur(2.5px)"/>
      </g>
    </svg>`;
  }

  _drawEntryLamp(on) {
    const face  = on ? '#fff4d8' : '#15151c';
    const faceB = on ? 'rgba(255,200,120,.65)' : 'rgba(255,255,255,.12)';
    const glow  = on ? 'drop-shadow(0 0 4px rgba(255,160,80,.90))' : 'none';
    const bOp   = on ? '1' : '0';
    return `<svg width="24" height="24" viewBox="0 0 32 32" overflow="visible">
      <rect x="13" y="3" width="6" height="3.5" rx="1.8" fill="#1e1e2e" stroke="rgba(255,255,255,.10)" stroke-width=".6"/>
      <rect x="14.5" y="6" width="3" height="5" rx="1.5" fill="#252535"/>
      <path d="M10 11 L11 22 L21 22 L22 11 Q16 9 10 11Z" fill="#252535" stroke="rgba(255,255,255,.09)" stroke-width=".7"/>
      <ellipse cx="16" cy="22" rx="5.5" ry="2.2" fill="${face}" stroke="${faceB}" stroke-width=".6" style="filter:${glow}"/>
      <path d="M10.5 22 L7 31 L25 31 L21.5 22 Z" fill="rgba(255,175,90,.22)" opacity="${bOp}" style="filter:blur(3.5px)"/>
      <ellipse cx="16" cy="31" rx="7" ry="2.5" fill="rgba(255,175,90,.35)" opacity="${bOp}" style="filter:blur(2.5px)"/>
    </svg>`;
  }

  _drawPostLamp(on) {
    const fill  = on ? '#fff6e0' : '#15151c';
    const fillB = on ? 'rgba(255,230,160,.55)' : 'rgba(255,255,255,.10)';
    const glow  = on ? 'drop-shadow(0 0 5px rgba(255,220,130,.80))' : 'none';
    const bOp   = on ? '1' : '0';
    return `<svg width="24" height="24" viewBox="0 0 32 32" overflow="visible">
      <ellipse cx="16" cy="29" rx="5" ry="1.8" fill="#1c1c28" stroke="rgba(255,255,255,.08)" stroke-width=".5"/>
      <rect x="14.5" y="16" width="3" height="14" rx="1.5" fill="#1e1e2e"/>
      <rect x="10" y="8" width="12" height="9" rx="3.5" fill="#252535" stroke="rgba(255,255,255,.09)" stroke-width=".7"/>
      <rect x="10" y="6.5" width="12" height="3" rx="2" fill="#1e1e2e" stroke="rgba(255,255,255,.08)" stroke-width=".5"/>
      <rect x="11.5" y="9" width="9" height="7" rx="2.5" fill="${fill}" stroke="${fillB}" stroke-width=".5" style="filter:${glow}"/>
      <ellipse cx="16" cy="12.5" rx="9" ry="6" fill="rgba(255,220,130,.18)" opacity="${bOp}" style="filter:blur(4px)"/>
      <ellipse cx="16" cy="29.5" rx="5.5" ry="2" fill="rgba(255,220,130,.28)" opacity="${bOp}" style="filter:blur(2px)"/>
    </svg>`;
  }

  // ── render ────────────────────────────────────────────────────────────────

  _render({ tilt, louverOn, bri, litOn, orbsOn, spotGOn, entryOn, postOn }) {
    const hasFront  = this._entryLampEntity || this._postLampEntity;
    const hasGarden = this._orbsEntity || this._spotGEntity;

    // ikona + label + stan aktywności + encja do popup
    const items = [
      // --- Pergola ---
      { section: 'Pergola', svg: this._drawSlat(tilt, louverOn), label: this._coverName,  on: louverOn, entity: this._coverEntity,
        pulse: 'louver', col: 'rgba(255,159,10,.18)', border: 'rgba(255,159,10,.22)', bg: 'rgba(255,159,10,.10)' },
      { section: null,     svg: this._drawSpot(bri),             label: this._lightName,  on: litOn,   entity: this._lightEntity,
        pulse: 'light',  col: 'rgba(255,214,90,.18)', border: 'rgba(255,214,90,.22)', bg: 'rgba(255,214,90,.10)' },
      // --- Ogród ---
      ...(hasGarden ? [
        ...(this._orbsEntity  ? [{ section: 'Ogród', svg: this._drawOrbs(orbsOn),      label: this._orbsName,  on: orbsOn,  entity: this._orbsEntity,
          pulse: 'orbs',  col: 'rgba(255,179,71,.18)', border: 'rgba(255,179,71,.22)', bg: 'rgba(255,179,71,.10)' }] : []),
        ...(this._spotGEntity ? [{ section: this._orbsEntity ? null : 'Ogród',
          svg: this._drawGroundSpot(spotGOn), label: this._spotGName, on: spotGOn, entity: this._spotGEntity,
          pulse: 'spotg', col: 'rgba(255,184,77,.18)', border: 'rgba(255,184,77,.22)', bg: 'rgba(255,184,77,.10)' }] : []),
      ] : []),
      // --- Front domu ---
      ...(hasFront ? [
        ...(this._entryLampEntity ? [{ section: 'Front domu', svg: this._drawEntryLamp(entryOn), label: this._entryLampName, on: entryOn, entity: this._entryLampEntity,
          pulse: 'entry', col: 'rgba(255,160,80,.18)', border: 'rgba(255,160,80,.22)', bg: 'rgba(255,160,80,.10)' }] : []),
        ...(this._postLampEntity  ? [{ section: this._entryLampEntity ? null : 'Front domu',
          svg: this._drawPostLamp(postOn), label: this._postLampName, on: postOn, entity: this._postLampEntity,
          pulse: 'post',  col: 'rgba(255,220,130,.18)', border: 'rgba(255,220,130,.22)', bg: 'rgba(255,220,130,.10)' }] : []),
      ] : []),
    ];

    this.shadowRoot.innerHTML = `
    <style>
      *{ box-sizing:border-box; margin:0; padding:0 }
      :host{ display:block; font-family:-apple-system,'SF Pro Text','Helvetica Neue',sans-serif; -webkit-font-smoothing:antialiased }

      .card{
        background: linear-gradient(150deg,#0b1120 0%,#0d1828 100%);
        border: 0.5px solid rgba(255,255,255,.08);
        border-radius: 16px;
        padding: 9px 12px 10px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        overflow: hidden;
        position: relative;
      }
      .card::before{
        content:'';position:absolute;top:0;left:0;right:0;height:1px;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);
        pointer-events:none;
      }

      /* rząd etykiet sekcji — flex proporcjonalny do liczby ikon */
      .sect-row{
        display: flex;
        width: 100%;
      }
      .sect-label{
        font-size: 8px;
        font-weight: 700;
        letter-spacing: .11em;
        text-transform: uppercase;
        color: rgba(255,255,255,.18);
        text-align: center;
        line-height: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .sect-label + .sect-label{
        border-left: 0.5px solid rgba(255,255,255,.07);
      }

      /* płaski rząd wszystkich ikon */
      .icons-row{
        display: flex;
        gap: 5px;
        width: 100%;
      }

      /* pojedyncza ikona z etykietą — flex:1 wypełnia szerokość */
      .icon-wrap{
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        min-width: 0;
      }
      /* ikona kwadratowa, wypełnia dostępną szerokość */
      .iconbox{
        width: 100%;
        aspect-ratio: 1;
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        background: rgba(142,142,147,.07);
        border: 0.5px solid rgba(142,142,147,.15);
        transition: background .35s, border-color .35s, box-shadow .45s, transform .15s;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        overflow: hidden;
      }
      .iconbox:active{ transform: scale(0.90); }
      .icon-label{
        font-size: 9px;
        font-weight: 500;
        color: rgba(255,255,255,.28);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        transition: color .3s;
      }
      .icon-label.on{ color: rgba(255,255,255,.62); }

      /* separatory sekcji na ikonach */
      .icon-wrap.sep-left{ margin-left: 3px; border-left: 0.5px solid rgba(255,255,255,.07); padding-left: 3px; }

      /* pulse animations */
      @keyframes louver-pulse { 0%,100%{ box-shadow:0 0 0 0px rgba(255,159,10,0) } 50%{ box-shadow:0 0 0 5px rgba(255,159,10,.18) } }
      @keyframes light-pulse  { 0%,100%{ box-shadow:0 0 0 0px rgba(255,214,90,0) } 50%{ box-shadow:0 0 0 5px rgba(255,214,90,.15) } }
      @keyframes orbs-pulse   { 0%,100%{ box-shadow:0 0 0 0px rgba(255,179,71,0) } 50%{ box-shadow:0 0 0 5px rgba(255,179,71,.18) } }
      @keyframes spotg-pulse  { 0%,100%{ box-shadow:0 0 0 0px rgba(255,184,77,0) } 50%{ box-shadow:0 0 0 5px rgba(255,184,77,.18) } }
      @keyframes entry-pulse  { 0%,100%{ box-shadow:0 0 0 0px rgba(255,160,80,0) } 50%{ box-shadow:0 0 0 5px rgba(255,160,80,.18) } }
      @keyframes post-pulse   { 0%,100%{ box-shadow:0 0 0 0px rgba(255,220,130,0) } 50%{ box-shadow:0 0 0 5px rgba(255,220,130,.18) } }
      .iconbox.louver-active { animation: louver-pulse 2.5s ease-in-out infinite; }
      .iconbox.light-active  { animation: light-pulse  3.0s ease-in-out infinite; }
      .iconbox.orbs-active   { animation: orbs-pulse   2.8s ease-in-out infinite; }
      .iconbox.spotg-active  { animation: spotg-pulse  3.2s ease-in-out infinite; }
      .iconbox.entry-active  { animation: entry-pulse  2.6s ease-in-out infinite; }
      .iconbox.post-active   { animation: post-pulse   3.0s ease-in-out infinite; }
    </style>

    <div class="card">
      ${this._buildHTML(items)}
    </div>`;

    this.shadowRoot.querySelectorAll('.iconbox[data-entity]').forEach(el => {
      el.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true,
          detail: { entityId: el.dataset.entity },
        }));
      });
    });
  }

  _buildHTML(items) {
    // Zbierz sekcje z liczbą ikon (dla flex proporcji w sect-row)
    const sections = [];
    let cur = null;
    for (const item of items) {
      if (item.section !== null) {
        cur = { label: item.section, count: 0 };
        sections.push(cur);
      }
      cur.count++;
    }

    // Rząd etykiet sekcji — każda ma flex = liczba swoich ikon
    const sectRow = `<div class="sect-row">${
      sections.map(s => `<div class="sect-label" style="flex:${s.count}">${s.label}</div>`).join('')
    }</div>`;

    // Płaski rząd ikon — wszystkie flex:1, pierwsza ikona nowej sekcji dostaje sep-left
    let sectionIdx = -1;
    const iconsRow = `<div class="icons-row">${
      items.map((item, i) => {
        const isNewSection = item.section !== null;
        if (isNewSection) sectionIdx++;
        const sepClass = isNewSection && sectionIdx > 0 ? 'sep-left' : '';
        const boxStyle = item.on ? `background:${item.bg};border:0.5px solid ${item.border};` : '';
        const activeClass = item.on ? `${item.pulse}-active` : '';
        return `
          <div class="icon-wrap ${sepClass}">
            <div class="iconbox ${activeClass}" style="${boxStyle}" data-entity="${item.entity}">${item.svg}</div>
            <div class="icon-label ${item.on ? 'on' : ''}">${item.label}</div>
          </div>`;
      }).join('')
    }</div>`;

    return sectRow + iconsRow;
  }

  getCardSize() { return 1; }
}

customElements.define('aha-pergola-strip-card', PergolaStripCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-pergola-strip-card',
  name:        'Pergola Strip Card',
  preview:     false,
  description: 'Poziomy pasek statusu lamp pergoli — ikony on/off z pulsem, sekcje Pergola / Ogród / Front domu.',
});
