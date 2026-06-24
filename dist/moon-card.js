/**
 * aha-moon-card.js  v1.0
 * Karta fazy Księżyca — tryby: slim (kompaktowa) i full (rozbudowana).
 *
 * Config:
 *   slim: false   (optional) — tryb kompaktowy
 */

class AhaMoonCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._interval = null;
  }

  setConfig(config) {
    this._config = {
      slim: config.slim ?? false,
    };
  }

  connectedCallback() {
    this._render();
    // Odśwież co minutę (faza zmienia się powoli, ale data/godzina musi być aktualna)
    this._interval = setInterval(() => this._render(), 60000);
  }

  disconnectedCallback() {
    clearInterval(this._interval);
  }

  // set hass() wywołuje HA przy każdej zmianie stanu — nie potrzebujemy encji,
  // ale musimy zaimplementować setter żeby karta się załadowała
  set hass(_hass) {
    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }
  }

  // ─── Obliczenia fazy ──────────────────────────────────────────
  _calcPhase() {
    const SYNODIC   = 29.53058867;
    const KNOWN_NEW = new Date('2000-01-06T18:14:00Z').getTime();
    const now       = new Date();
    const elapsed   = (now.getTime() - KNOWN_NEW) / 86400000;
    const phase     = ((elapsed % SYNODIC) + SYNODIC) % SYNODIC / SYNODIC;
    const illum     = Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);
    const age       = (phase * SYNODIC).toFixed(1);
    const toFull    = phase <= 0.5 ? (0.5 - phase) * SYNODIC : (1.5 - phase) * SYNODIC;
    const toNew     = phase < 0.5  ? phase * SYNODIC          : (1 - phase)   * SYNODIC;
    const showFull  = toFull <= toNew;
    const nextVal   = Math.round((showFull ? toFull : toNew) * 10) / 10;
    const nextLbl   = showFull ? 'do pełni' : 'do nowiu';
    const nextLblCap= showFull ? 'Do pełni' : 'Do nowiu';

    let namePL, nameEN;
    if      (phase < 0.03 || phase > 0.97) { namePL = 'Nów';             nameEN = 'New Moon'; }
    else if (phase < 0.22)                  { namePL = 'Sierp rosnący';   nameEN = 'Waxing Crescent'; }
    else if (phase < 0.28)                  { namePL = 'Pierwsza kwadra'; nameEN = 'First Quarter'; }
    else if (phase < 0.47)                  { namePL = 'Garb rosnący';    nameEN = 'Waxing Gibbous'; }
    else if (phase < 0.53)                  { namePL = 'Pełnia';          nameEN = 'Full Moon'; }
    else if (phase < 0.72)                  { namePL = 'Garb malejący';   nameEN = 'Waning Gibbous'; }
    else if (phase < 0.78)                  { namePL = 'Ostatnia kwadra'; nameEN = 'Last Quarter'; }
    else                                    { namePL = 'Sierp malejący';  nameEN = 'Waning Crescent'; }

    const dateStr = now.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

    return { phase, illum, age, nextVal, nextLbl, nextLblCap, namePL, nameEN, dateStr, now };
  }

  // ─── SVG Księżyca ─────────────────────────────────────────────
  _moonSVG(phase, cx, cy, R, svgSize, maskId, clipId, glowRadii, strokeW) {
    const D = '#0E1625', L = '#CCD8EE';
    const isNew  = phase < 0.015 || phase > 0.985;
    const isFull = Math.abs(phase - 0.5) < 0.015;
    const waxing = phase < 0.5;
    const sw     = waxing ? 1 : 0;
    const k      = Math.cos(phase * 2 * Math.PI);
    const ex     = Math.abs(k) * R;

    const halfPath    = `M${cx} ${cy-R} A${R} ${R} 0 0 ${sw} ${cx} ${cy+R} L${cx} ${cy}Z`;
    const gibbousPath = `M${cx} ${cy-R} A${ex} ${R} 0 0 ${waxing?0:1} ${cx} ${cy+R} L${cx} ${cy}Z`;

    // Maska dla jasnych tekstur
    let maskContent = '';
    if (!isNew && !isFull) {
      if (k > 0) {
        maskContent = `<path d="${halfPath}" fill="white"/>
          <ellipse cx="${cx}" cy="${cy}" rx="${ex}" ry="${R}" fill="black"/>`;
      } else {
        maskContent = `<path d="${halfPath}" fill="white"/>
          <path d="${gibbousPath}" fill="white"/>`;
      }
    } else if (isFull) {
      maskContent = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="white"/>`;
    }

    const maskTag = `<mask id="${maskId}">
      <rect width="${svgSize}" height="${svgSize}" fill="black"/>
      ${maskContent}
    </mask>`;

    // Maria i kratery skalowane do R
    const s = R / 88; // skala względem wersji full (R=88)
    const maria = [
      [cx-18*s, cy-32*s, 22*s, 14*s],
      [cx+20*s, cy- 8*s, 18*s, 11*s],
      [cx- 8*s, cy+22*s, 24*s, 16*s],
      [cx+28*s, cy+30*s, 14*s,  9*s],
      [cx-32*s, cy+ 8*s, 16*s, 10*s],
    ];
    const craters = [
      [cx+38*s, cy-42*s,  7*s],
      [cx-42*s, cy-28*s,  5*s],
      [cx+22*s, cy+48*s,  8*s],
      [cx-20*s, cy+50*s,  6*s],
      [cx+52*s, cy+14*s,  4*s],
      [cx-50*s, cy+32*s,  5*s],
      [cx- 5*s, cy-70*s,  6*s],
      [cx+60*s, cy-22*s,  3*s],
    ];

    const mariaDark  = maria.map(([x,y,rx,ry]) =>
      `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="#060B16" opacity="0.55" transform="rotate(-15,${x.toFixed(1)},${y.toFixed(1)})"/>`).join('');
    const mariaLight = maria.map(([x,y,rx,ry]) =>
      `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="#9CB4D8" opacity="0.28" transform="rotate(-15,${x.toFixed(1)},${y.toFixed(1)})"/>`).join('');
    const craterDark  = craters.map(([x,y,r]) =>
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#06090F" opacity="0.6"/>` +
      `<circle cx="${(x-r*.3).toFixed(1)}" cy="${(y-r*.3).toFixed(1)}" r="${(r*.5).toFixed(1)}" fill="#1A2640" opacity="0.4"/>`).join('');
    const craterLight = craters.map(([x,y,r]) =>
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#A0B8D8" opacity="0.22"/>` +
      `<circle cx="${(x+r*.3).toFixed(1)}" cy="${(y+r*.3).toFixed(1)}" r="${(r*.45).toFixed(1)}" fill="#7898C0" opacity="0.3"/>`).join('');

    // Blask pełni
    const isNearFull    = Math.abs(phase - 0.5) < 0.055;
    const fullIntensity = isNearFull ? 1 - Math.abs(phase - 0.5) / 0.055 : 0;
    const glowSVG = isNearFull
      ? glowRadii.map((gex, i) =>
          `<circle cx="${cx}" cy="${cy}" r="${R+gex}" fill="#7A9FC8" opacity="${((0.18-i*0.05)*fullIntensity).toFixed(3)}"/>`)
        .join('') : '';

    // Oświetlona strona
    let litLayers = '';
    if (!isNew) {
      if (isFull) {
        litLayers = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${L}"/>`;
      } else {
        litLayers = `<path d="${halfPath}" fill="${L}"/>`;
        if (k > 0) litLayers += `<ellipse cx="${cx}" cy="${cy}" rx="${ex}" ry="${R}" fill="${D}"/>`;
        else       litLayers += `<path d="${gibbousPath}" fill="${L}"/>`;
      }
    }

    return `<svg viewBox="0 0 ${svgSize} ${svgSize}" width="${svgSize}" height="${svgSize}">
      <defs>
        <clipPath id="${clipId}"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath>
        ${maskTag}
      </defs>
      ${glowSVG}
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="${D}"/>
      <g clip-path="url(#${clipId})">${mariaDark}${craterDark}</g>
      <g clip-path="url(#${clipId})">${litLayers}</g>
      <g mask="url(#${maskId})">${mariaLight}${craterLight}</g>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="rgba(160,195,240,0.12)" stroke-width="${strokeW}"/>
    </svg>`;
  }

  // ─── Mini księżyc do paska cyklu ──────────────────────────────
  _miniMoonSVG(p, uid) {
    const r = 11, mcx = 14, mcy = 14;
    const mD = '#0E1625', mL = '#C8DCEE';
    const isN = p < 0.015 || p > 0.985;
    const isF = Math.abs(p - 0.5) < 0.015;
    let g = `<circle cx="${mcx}" cy="${mcy}" r="${r}" fill="${mD}"/>`;
    if (!isN) {
      if (isF) {
        g = `<circle cx="${mcx}" cy="${mcy}" r="${r}" fill="${mL}"/>`;
      } else {
        const k2  = Math.cos(p * 2 * Math.PI);
        const ex2 = Math.abs(k2) * r;
        const sw2 = p < 0.5 ? 1 : 0;
        g += `<path d="M${mcx} ${mcy-r} A${r} ${r} 0 0 ${sw2} ${mcx} ${mcy+r} L${mcx} ${mcy}Z" fill="${mL}"/>`;
        if (k2 > 0) g += `<ellipse cx="${mcx}" cy="${mcy}" rx="${ex2}" ry="${r}" fill="${mD}"/>`;
        else        g += `<path d="M${mcx} ${mcy-r} A${ex2} ${r} 0 0 ${p<0.5?0:1} ${mcx} ${mcy+r} L${mcx} ${mcy}Z" fill="${mL}"/>`;
      }
    }
    return `<svg viewBox="0 0 28 28" width="28" height="28">
      <defs><clipPath id="${uid}"><circle cx="${mcx}" cy="${mcy}" r="${r}"/></clipPath></defs>
      <g clip-path="url(#${uid})">${g}</g>
      <circle cx="${mcx}" cy="${mcy}" r="${r}" fill="none" stroke="rgba(150,185,230,0.15)" stroke-width="0.8"/>
    </svg>`;
  }

  // ─── Gwiazdy ──────────────────────────────────────────────────
  _stars(count, minSize, sizeStep, minOp, opStep) {
    let s = '';
    for (let i = 0; i < count; i++) {
      const xr = ((i * 137.508 + 43) % 97 + 2).toFixed(1);
      const yr = ((i * 97.312  + 17) % 91 + 3).toFixed(1);
      const sr = (minSize + (i % (sizeStep * 10)) * (sizeStep / 10)).toFixed(1);
      const op = (minOp + (i % 5) * opStep).toFixed(2);
      s += `<div style="position:absolute;left:${xr}%;top:${yr}%;width:${sr}px;height:${sr}px;border-radius:50%;background:#C8D8F0;opacity:${op};pointer-events:none;"></div>`;
    }
    return s;
  }

  // ─── Pasek postępu fazy ───────────────────────────────────────
  _progressBar(pct) {
    return `<div style="height:16px;display:flex;align-items:center;position:relative;">
      <div style="position:absolute;left:0;right:0;height:2px;background:rgba(255,255,255,.08);border-radius:2px;">
        <div style="width:${pct}%;height:100%;border-radius:2px;background:rgba(180,210,240,.55);"></div>
      </div>
      <div style="position:absolute;left:${pct}%;width:12px;height:12px;background:#C8D8F2;border-radius:50%;transform:translateX(-50%);box-shadow:0 0 8px 2px rgba(180,210,240,.4);"></div>
    </div>`;
  }

  // ─── Render SLIM ──────────────────────────────────────────────
  _renderSlim() {
    const { phase, illum, nextVal, nextLbl, namePL } = this._calcPhase();
    const pct   = (phase * 100).toFixed(1);
    const moon  = this._moonSVG(phase, 80, 80, 64, 160, 'sm-lm', 'sm-cc', [10,7,4], 1);
    const stars = this._stars(28, 0.6, 1.2, 0.06, 0.035);

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .card {
          background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
          border-radius: 26px;
          padding: 16px 14px 14px;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, system-ui, sans-serif;
          color: #fff;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          min-height: 200px;
        }
        .stars { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .row   { position: relative; z-index: 1; width: 100%; }
        .moon-wrap { position: relative; z-index: 1; display: flex; justify-content: center; align-items: center; flex: 1; }
      </style>
      <div class="card">
        <div class="stars">${stars}</div>

        <div class="row" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:13px;font-weight:600;color:rgba(255,255,255,.45);">Księżyc</span>
          <span style="font-size:11px;color:rgba(255,255,255,.2);">${illum}% lit</span>
        </div>

        <div class="moon-wrap">${moon}</div>

        <div class="row" style="text-align:center;margin-top:6px;">
          <div style="font-size:14px;font-weight:700;color:#DCE8FF;letter-spacing:-.3px;margin-bottom:1px;">${namePL}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.28);margin-bottom:10px;">${nextVal} d ${nextLbl}</div>
          ${this._progressBar(pct)}
        </div>
      </div>`;
  }

  // ─── Render FULL ──────────────────────────────────────────────
  _renderFull() {
    const { phase, illum, age, nextVal, nextLblCap, namePL, nameEN, dateStr } = this._calcPhase();
    const pct   = (phase * 100).toFixed(1);
    const moon  = this._moonSVG(phase, 110, 110, 88, 220, 'mc-lm', 'mc-cc', [14,10,6], 1.5);
    const stars = this._stars(38, 0.7, 1.4, 0.07, 0.04);

    const stats = [
      [illum + '%', 'Oświetlenie'],
      [age + ' d',  'Wiek'],
      [nextVal + ' d', nextLblCap],
    ];
    const statsHTML = stats.map(([v, l]) =>
      `<div style="flex:1;background:rgba(255,255,255,.06);border-radius:13px;padding:11px 6px;text-align:center;">
        <div style="font-size:16px;font-weight:700;color:#B0C8F0;letter-spacing:-.3px;">${v}</div>
        <div style="font-size:9px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.06em;margin-top:3px;">${l}</div>
      </div>`).join('');

    const STRIP = [
      {p:0.000, lbl:'Nów'},      {p:0.125, lbl:'Sierp r.'},
      {p:0.250, lbl:'I Kw.'},    {p:0.375, lbl:'Garb r.'},
      {p:0.500, lbl:'Pełnia'},   {p:0.625, lbl:'Garb m.'},
      {p:0.750, lbl:'II Kw.'},   {p:0.875, lbl:'Sierp m.'},
    ];
    const stripHTML = STRIP.map(({p, lbl}, i) => {
      const active = Math.abs(p - phase) < 0.065 || (p === 0 && (phase < 0.04 || phase > 0.96));
      const bg     = active ? 'background:rgba(180,210,255,.1);' : '';
      const lblC   = active ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.22)';
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:5px 2px;border-radius:8px;${bg}">
        ${this._miniMoonSVG(p, `mm${i}`)}
        <span style="font-size:7px;color:${lblC};text-align:center;line-height:1.2;">${lbl}</span>
      </div>`;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .card {
          background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
          border-radius: 26px;
          padding: 22px 18px 18px;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, system-ui, sans-serif;
          color: #fff;
          box-sizing: border-box;
        }
        .stars { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .z1 { position: relative; z-index: 1; }
      </style>
      <div class="card">
        <div class="stars">${stars}</div>

        <div class="z1" style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
          <span style="font-size:13px;font-weight:600;color:rgba(255,255,255,.38);">Faza Księżyca</span>
          <span style="font-size:12px;color:rgba(255,255,255,.22);">${dateStr}</span>
        </div>

        <div class="z1" style="display:flex;justify-content:center;align-items:center;margin:6px 0 14px;">${moon}</div>

        <div class="z1" style="font-size:22px;font-weight:700;letter-spacing:-.5px;text-align:center;color:#DCE8FF;margin-bottom:2px;">${namePL}</div>
        <div class="z1" style="font-size:12px;color:rgba(255,255,255,.28);text-align:center;margin-bottom:18px;">${nameEN}</div>

        <div class="z1" style="display:flex;gap:8px;margin-bottom:18px;">${statsHTML}</div>

        <div class="z1" style="font-size:10px;color:rgba(255,255,255,.25);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;">Cykl księżycowy</div>
        <div class="z1" style="display:flex;margin-bottom:10px;">${stripHTML}</div>

        <div class="z1">${this._progressBar(pct)}</div>
      </div>`;
  }

  _render() {
    if (this._config.slim) this._renderSlim();
    else                   this._renderFull();
  }

  getCardSize() { return this._config.slim ? 3 : 6; }

  static getConfigElement() { return document.createElement('div'); }
  static getStubConfig() { return { slim: false }; }
}

customElements.define('aha-moon-card', AhaMoonCard);

// Legacy alias
if (!customElements.get('moon-card'))
  customElements.define('moon-card', class extends AhaMoonCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-moon-card',
  name:        'Moon Card',
  preview:     false,
  description: 'Faza Księżyca z SVG — tryb slim i full.',
});
