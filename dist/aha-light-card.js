/**
 * aha-light-card — kafelek światła (Govee / dowolne light.*) w stylu awesome-ha
 *
 * Tap na kafelek        → toggle (gdy "Pora dnia" aktywna — włącza od razu z jasnością/barwą wg pory dnia)
 * Hold (500 ms)         → more-info
 * Suwak na dole         → jasność (ręczna zmiana wyłącza tryb "Pora dnia")
 * Przycisk ☀            → włącza/wyłącza śledzenie pory dnia (input_boolean)
 * Przycisk paleta       → panel kolorów: biele (K) + kolory RGB (wybór wyłącza tryb "Pora dnia")
 *
 * Config:
 *   type: custom:aha-light-card
 *   entity: light.jarzeniowka
 *   name: Jarzeniówka ściana          (opcjonalnie, domyślnie friendly_name)
 *   model / room / brand              (opcjonalnie, chipy)
 *   adaptive_entity: input_boolean.jarzeniowka_pora_dnia   (opcjonalnie — przycisk ☀)
 *   adaptive_sensor: sensor.swiatlo_pora_dnia              (opcjonalnie — cel: state = jasność %, attr color_temp_kelvin)
 *   icon: bulb | ceiling              (opcjonalnie, domyślnie bulb)
 *   colors: false                     (opcjonalnie — ukrywa przycisk palety)
 */
const AHA_LIGHT_WHITES = [
  { k: 2700, n: 'Ciepła', rgb: [255, 196, 137] },
  { k: 4000, n: 'Neutralna', rgb: [255, 228, 206] },
  { k: 6000, n: 'Zimna', rgb: [235, 238, 255] },
];
const AHA_LIGHT_COLORS = [
  { n: 'Czerwony', rgb: [255, 40, 30] },
  { n: 'Pomarańczowy', rgb: [255, 140, 0] },
  { n: 'Żółty', rgb: [255, 220, 0] },
  { n: 'Zielony', rgb: [40, 220, 70] },
  { n: 'Turkus', rgb: [0, 220, 200] },
  { n: 'Niebieski', rgb: [30, 90, 255] },
  { n: 'Fioletowy', rgb: [150, 60, 255] },
  { n: 'Różowy', rgb: [255, 70, 170] },
];

class AhaLightCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built = false;
    this._drag = null;
    this._holdT = null;
    this._held = false;
    this._panel = false;
  }

  static getStubConfig() { return { entity: 'light.example' }; }

  setConfig(config) {
    if (!config || !config.entity) throw new Error('aha-light-card: wymagane "entity"');
    this._config = config;
    this._built = false;
    if (this._hass) this.hass = this._hass;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    if (!this._built) { this._build(); this._built = true; }
    this._update();
  }

  getCardSize() { return 3; }

  // ── helpers ──────────────────────────────────────────────
  _st(id) { return id && this._hass ? this._hass.states[id] : undefined; }

  _modes() {
    const st = this._st(this._config.entity);
    return (st && st.attributes.supported_color_modes) || [];
  }
  _hasColor() { return this._modes().some(m => ['rgb', 'rgbw', 'rgbww', 'hs', 'xy'].includes(m)); }
  _hasCT() { return this._modes().includes('color_temp'); }

  _adaptiveOn() {
    const s = this._st(this._config.adaptive_entity);
    return !!s && s.state === 'on';
  }

  _target() {
    const s = this._st(this._config.adaptive_sensor);
    if (!s) return null;
    const bri = parseInt(s.state, 10);
    const k = parseInt(s.attributes.color_temp_kelvin, 10);
    if (isNaN(bri) || isNaN(k)) return null;
    return { bri, k };
  }

  _call(domain, service, data) { return this._hass.callService(domain, service, data); }

  _setAdaptive(on) {
    const id = this._config.adaptive_entity;
    if (!id) return;
    this._call('input_boolean', on ? 'turn_on' : 'turn_off', { entity_id: id });
  }

  _toggle() {
    const st = this._st(this._config.entity);
    if (!st) return;
    if (st.state === 'on') {
      this._call('light', 'turn_off', { entity_id: this._config.entity });
      return;
    }
    const t = this._adaptiveOn() ? this._target() : null;
    const data = { entity_id: this._config.entity };
    if (t) { data.brightness_pct = t.bri; if (this._hasCT()) data.color_temp_kelvin = t.k; }
    this._call('light', 'turn_on', data);
  }

  _pickColor(i, kind) {
    if (this._adaptiveOn()) this._setAdaptive(false);   // ręczny wybór = wyjście z trybu
    const data = { entity_id: this._config.entity };
    if (kind === 'w') {
      const w = AHA_LIGHT_WHITES[i];
      if (this._hasCT()) data.color_temp_kelvin = w.k; else data.rgb_color = w.rgb;
    } else {
      data.rgb_color = AHA_LIGHT_COLORS[i].rgb;
    }
    this._call('light', 'turn_on', data);
    this._showPanel(false);
  }

  _moreInfo() {
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      detail: { entityId: this._config.entity }, bubbles: true, composed: true,
    }));
  }

  _rgb(st) {
    const on = st && st.state === 'on';
    const rgb = st && st.attributes.rgb_color;
    if (on && rgb) return rgb;
    return on ? [255, 214, 140] : [95, 94, 90];
  }

  _colorName(r, g, b) {
    const C = [
      ['czerwony', 255, 0, 0], ['zielony', 0, 255, 0], ['niebieski', 0, 0, 255],
      ['żółty', 255, 255, 0], ['turkus', 0, 255, 255], ['magenta', 255, 0, 255],
      ['pomarańczowy', 255, 165, 0], ['fioletowy', 128, 0, 128], ['różowy', 255, 105, 180],
      ['biały', 255, 255, 255], ['ciepły biały', 255, 220, 150],
    ];
    let best = null, bd = 1e9;
    C.forEach(c => {
      const d = Math.hypot(r - c[1], g - c[2], b - c[3]);
      if (d < bd) { bd = d; best = c[0]; }
    });
    return bd < 65 ? best : null;
  }

  _icon() {
    if (this._config.icon === 'ceiling') {
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="9" width="16" height="4.5" rx="2.2" stroke="currentColor" stroke-width="1.7"/>
        <path d="M7.5 13.5v4M16.5 13.5v4M12 6.5V9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        <rect class="ifill" x="4" y="9" width="16" height="4.5" rx="2.2"/></svg>`;
    }
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M9 21h6M12 3a6 6 0 00-3 11.2V17a1 1 0 001 1h4a1 1 0 001-1v-2.8A6 6 0 0012 3z"
        stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle class="ifill" cx="12" cy="10" r="3"/></svg>`;
  }

  _showPanel(on) {
    this._panel = on;
    const p = this.shadowRoot.getElementById('panel');
    if (p) p.classList.toggle('open', on);
    this._update();
  }

  // ── build ────────────────────────────────────────────────
  _build() {
    const c = this._config;
    const sw = (rgb) => `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    this.shadowRoot.innerHTML = `
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :host{display:block;height:100%;font-family:-apple-system,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .card{
    --r:95;--g:94;--b:90;
    position:relative;overflow:hidden;cursor:pointer;user-select:none;-webkit-user-select:none;
    -webkit-tap-highlight-color:transparent;height:100%;
    border-radius:20px;padding:14px 14px 12px;min-height:148px;
    display:flex;flex-direction:column;justify-content:space-between;
    background:linear-gradient(150deg,#0b1120 0%,#0d1828 100%);
    border:1px solid rgba(255,255,255,0.08);
    transition:border-color .4s ease,transform .15s ease;
  }
  .card::before{
    content:'';position:absolute;inset:0;pointer-events:none;opacity:0;
    background:radial-gradient(120% 90% at 0% 0%,rgba(var(--r),var(--g),var(--b),0.22) 0%,rgba(var(--r),var(--g),var(--b),0) 65%);
    transition:opacity .4s ease;
  }
  .card.on::before{opacity:var(--glow,1)}
  .card.on{border-color:rgba(var(--r),var(--g),var(--b),0.30);animation:aha-light-pulse-on 3s ease-in-out infinite}
  .card:active:not(.pnl){transform:scale(0.97)}
  @keyframes aha-light-pulse-on{
    0%,100%{box-shadow:0 0 0 0 rgba(var(--r),var(--g),var(--b),0)}
    50%{box-shadow:0 0 0 5px rgba(var(--r),var(--g),var(--b),0.18)}
  }
  .top{position:relative;display:flex;align-items:flex-start;justify-content:space-between;gap:6px}
  .ibox{
    width:38px;height:38px;border-radius:12px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    background:#1c2230;color:#5F5E5A;
    transition:background .4s ease,color .4s ease,box-shadow .4s ease;
  }
  .ibox .ifill{fill:transparent;transition:fill .4s ease}
  .card.on .ibox{background:rgb(var(--r),var(--g),var(--b));box-shadow:0 0 14px rgba(var(--r),var(--g),var(--b),0.5)}
  .card.on .ibox .ifill{fill:rgba(255,255,255,0.25)}

  .acts{display:flex;gap:6px;flex-shrink:0}
  .rb{
    width:30px;height:30px;border-radius:50%;flex-shrink:0;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    color:rgba(255,255,255,0.45);background:rgba(255,255,255,0.05);
    border:0.5px solid rgba(255,255,255,0.10);
    -webkit-tap-highlight-color:transparent;font:inherit;
    transition:background .4s ease,color .4s ease,border-color .4s ease,transform .15s ease;
  }
  .rb:active{transform:scale(0.96)}
  .rb.hide{display:none}
  .rb.act{color:#EF9F27;background:rgba(239,159,39,0.14);border-color:rgba(239,159,39,0.40)}
  .rb.pal .ring{width:16px;height:16px;border-radius:50%;
    background:conic-gradient(#ff3b30,#ff9500,#ffcc00,#34c759,#00c7be,#007aff,#af52de,#ff2d55,#ff3b30);
    -webkit-mask:radial-gradient(circle,transparent 4px,#000 4.5px);mask:radial-gradient(circle,transparent 4px,#000 4.5px);opacity:.85}

  .mid{position:relative;display:flex;flex-direction:column;gap:3px;margin-top:10px;min-width:0}
  .name{font-size:13px;font-weight:600;letter-spacing:-0.02em;color:rgba(255,255,255,0.65);
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .4s ease}
  .card.on .name{color:#fff}
  .state{display:flex;align-items:center;gap:5px;font-size:10px;font-weight:600;letter-spacing:0.04em;
    color:#5F5E5A;white-space:nowrap;overflow:hidden;transition:color .4s ease}
  .state #stxt{overflow:hidden;text-overflow:ellipsis}
  .card.on .state{color:rgb(var(--r),var(--g),var(--b))}
  .dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;background:#3a3a3c}
  .card.on .dot{background:rgb(var(--r),var(--g),var(--b));box-shadow:0 0 5px rgba(var(--r),var(--g),var(--b),0.5);
    animation:aha-light-blink 2.2s ease-in-out infinite}
  @keyframes aha-light-blink{0%,100%{opacity:1}50%{opacity:0.25}}
  .chips{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}
  .chips:empty{display:none}
  .chip{font-size:9px;font-weight:500;padding:2px 7px;border-radius:6px;white-space:nowrap;
    background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.35);border:0.5px solid rgba(255,255,255,0.08)}
  .chip.sun{color:#EF9F27;background:rgba(239,159,39,0.10);border-color:rgba(239,159,39,0.25)}

  .sl{position:relative;height:22px;margin:6px -2px -6px;touch-action:none;cursor:ew-resize}
  .trk{position:absolute;left:2px;right:2px;top:9px;height:4px;border-radius:99px;background:rgba(255,255,255,0.08);overflow:hidden}
  .fil{height:100%;width:0;border-radius:99px;background:#5F5E5A;transition:width .4s ease,background .4s ease}
  .sl.drag .fil{transition:none}
  .card.on .fil{background:linear-gradient(90deg,rgba(var(--r),var(--g),var(--b),0.55),rgb(var(--r),var(--g),var(--b)))}
  .knob{position:absolute;top:5px;width:12px;height:12px;margin-left:-6px;border-radius:50%;
    background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.5);opacity:0;transition:opacity .2s ease,left .4s ease}
  .sl.drag .knob{transition:opacity .2s ease}
  .card.on .knob,.sl.drag .knob{opacity:1}

  /* panel kolorów — nakładka wewnątrz kafelka, nie przesuwa treści */
  .panel{
    position:absolute;inset:0;z-index:2;padding:12px;border-radius:19px;
    display:flex;flex-direction:column;justify-content:center;gap:8px;
    background:rgba(11,17,32,0.94);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    opacity:0;pointer-events:none;transform:scale(0.98);
    transition:opacity .2s ease,transform .2s ease;cursor:default;
  }
  .panel.open{opacity:1;pointer-events:auto;transform:none}
  .prow{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;justify-items:center}
  .sw{
    width:28px;height:28px;border-radius:50%;cursor:pointer;padding:0;
    border:1.5px solid rgba(255,255,255,0.12);
    box-shadow:inset 0 0 0 2px rgba(11,17,32,0.9);
    -webkit-tap-highlight-color:transparent;transition:transform .15s ease,border-color .2s ease;
  }
  .sw:active{transform:scale(0.92)}
  .sw.sel{border-color:#fff}
  .sw.x{display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);box-shadow:none}
  .plabel{font-size:9px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.35);text-align:center}
</style>
<div class="card" id="card">
  <div class="top">
    <div class="ibox" id="ibox">${this._icon()}</div>
    <div class="acts">
      <button class="rb pal" id="pal" type="button" title="Kolor"><span class="ring"></span></button>
      <button class="rb${c.adaptive_entity ? '' : ' hide'}" id="auto" type="button" title="Śledzenie pory dnia">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
        </svg>
      </button>
    </div>
  </div>
  <div class="mid">
    <div class="name" id="name"></div>
    <div class="state"><span class="dot"></span><span id="stxt"></span></div>
    <div class="chips" id="chips"></div>
  </div>
  <div class="sl" id="sl"><div class="trk"><div class="fil" id="fil"></div></div><div class="knob" id="knob"></div></div>
  <div class="panel" id="panel">
    <div class="plabel">Barwa i kolor</div>
    <div class="prow" id="pw">
      ${AHA_LIGHT_WHITES.map((w, i) => `<button class="sw" type="button" data-k="w" data-i="${i}" title="${w.n} ${w.k}K" style="background:${sw(w.rgb)}"></button>`).join('')}
      <button class="sw x" type="button" id="pclose" title="Zamknij">
        <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 2l8 8M10 2l-8 8"/></svg>
      </button>
    </div>
    <div class="prow">
      ${AHA_LIGHT_COLORS.map((col, i) => `<button class="sw" type="button" data-k="c" data-i="${i}" title="${col.n}" style="background:${sw(col.rgb)}"></button>`).join('')}
    </div>
  </div>
</div>`;

    const $ = id => this.shadowRoot.getElementById(id);
    const card = $('card'), auto = $('auto'), pal = $('pal'), sl = $('sl'), panel = $('panel');
    const isCtl = e => e.composedPath().some(n => n === sl || n === auto || n === pal || n === panel);

    // tap / hold na kafelku
    card.addEventListener('pointerdown', e => {
      if (isCtl(e)) return;
      this._held = false;
      clearTimeout(this._holdT);
      this._holdT = setTimeout(() => { this._held = true; this._moreInfo(); }, 500);
    });
    const cancelHold = () => clearTimeout(this._holdT);
    card.addEventListener('pointerup', cancelHold);
    card.addEventListener('pointercancel', cancelHold);
    card.addEventListener('pointerleave', cancelHold);
    card.addEventListener('click', e => {
      if (isCtl(e)) return;
      if (this._held) { this._held = false; return; }
      this._toggle();
    });

    // przyciski
    auto.addEventListener('click', e => { e.stopPropagation(); this._setAdaptive(!this._adaptiveOn()); });
    pal.addEventListener('click', e => { e.stopPropagation(); this._showPanel(!this._panel); });

    // panel kolorów
    panel.addEventListener('click', e => {
      e.stopPropagation();
      const b = e.composedPath().find(n => n.classList && n.classList.contains('sw'));
      if (!b) { this._showPanel(false); return; }          // tap w tło panelu = zamknij
      if (b.id === 'pclose') { this._showPanel(false); return; }
      this._pickColor(parseInt(b.dataset.i, 10), b.dataset.k);
    });
    panel.addEventListener('pointerdown', e => e.stopPropagation());

    // suwak jasności
    const pctAt = x => {
      const r = sl.getBoundingClientRect();
      return Math.max(1, Math.min(100, Math.round(((x - r.left) / r.width) * 100)));
    };
    const show = p => { $('fil').style.width = p + '%'; $('knob').style.left = p + '%'; $('stxt').textContent = 'Jasność · ' + p + '%'; };
    sl.addEventListener('pointerdown', e => {
      e.stopPropagation();
      sl.setPointerCapture(e.pointerId);
      sl.classList.add('drag');
      this._drag = { p: pctAt(e.clientX) };
      show(this._drag.p);
    });
    sl.addEventListener('pointermove', e => {
      if (!this._drag) return;
      this._drag.p = pctAt(e.clientX);
      show(this._drag.p);
    });
    sl.addEventListener('pointerup', e => {
      if (!this._drag) return;
      const p = this._drag.p;
      this._drag = null;
      sl.classList.remove('drag');
      if (this._adaptiveOn()) this._setAdaptive(false);   // ręczna zmiana = wyjście z trybu
      this._call('light', 'turn_on', { entity_id: this._config.entity, brightness_pct: p });
      e.stopPropagation();
    });
    sl.addEventListener('pointercancel', () => { this._drag = null; sl.classList.remove('drag'); this._update(); });
    sl.addEventListener('click', e => e.stopPropagation());
  }

  // ── update ───────────────────────────────────────────────
  _update() {
    const c = this._config;
    const st = this._st(c.entity);
    const $ = id => this.shadowRoot.getElementById(id);
    const card = $('card');
    if (!card) return;

    const unavailable = !st || st.state === 'unavailable';
    const on = !!st && st.state === 'on';
    const [r, g, b] = this._rgb(st);
    card.style.setProperty('--r', r);
    card.style.setProperty('--g', g);
    card.style.setProperty('--b', b);
    card.classList.toggle('on', on);
    card.classList.toggle('pnl', this._panel);

    const briPct = on ? Math.max(1, Math.round(((st.attributes.brightness ?? 255) / 255) * 100)) : 0;
    card.style.setProperty('--glow', on ? (0.45 + 0.55 * briPct / 100).toFixed(2) : 0);

    $('name').textContent = c.name || (st && st.attributes.friendly_name) || c.entity;

    const adaptive = this._adaptiveOn();
    $('auto').classList.toggle('act', adaptive);
    $('pal').classList.toggle('hide', c.colors === false || !(this._hasColor() || this._hasCT()));

    const ctK = on && st.attributes.color_mode === 'color_temp' ? st.attributes.color_temp_kelvin : null;

    if (!this._drag) {
      let txt;
      if (unavailable) txt = 'Niedostępna';
      else if (!on) txt = adaptive ? 'Wyłączona · pora dnia' : 'Wyłączona';
      else {
        const parts = [briPct + '%'];
        if (ctK) parts.push(Math.round(ctK / 50) * 50 + 'K');
        else if (st.attributes.effect) parts.push(st.attributes.effect);
        else { const cn = this._colorName(r, g, b); if (cn) parts.push(cn); }
        txt = parts.join(' · ');
      }
      $('stxt').textContent = txt;
      $('fil').style.width = briPct + '%';
      $('knob').style.left = briPct + '%';
    }

    // zaznaczenie aktywnego koloru w panelu
    if (this._panel) {
      const near = (a, bb) => Math.hypot(a[0] - bb[0], a[1] - bb[1], a[2] - bb[2]) < 40;
      this.shadowRoot.querySelectorAll('.sw[data-k]').forEach(el => {
        const i = parseInt(el.dataset.i, 10);
        let sel = false;
        if (on && el.dataset.k === 'w') sel = ctK ? Math.abs(ctK - AHA_LIGHT_WHITES[i].k) < 300 : false;
        if (on && el.dataset.k === 'c' && !ctK) sel = near([r, g, b], AHA_LIGHT_COLORS[i].rgb);
        el.classList.toggle('sel', sel);
      });
    }

    const t = adaptive ? this._target() : null;
    const chips = [c.model, c.room, c.brand].filter(Boolean).map(x => `<span class="chip">${x}</span>`);
    if (t) chips.unshift(`<span class="chip sun">☀ ${t.bri}% · ${t.k}K</span>`);
    const html = chips.join('');
    if (this._chipsHtml !== html) { this._chipsHtml = html; $('chips').innerHTML = html; }
  }
}

customElements.define('aha-light-card', AhaLightCard);
if (!customElements.get('light-apple-card')) customElements.define('light-apple-card', class extends AhaLightCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'aha-light-card',
  name: 'AHA Light Card',
  preview: false,
  description: 'Kafelek światła: toggle, suwak jasności, paleta kolorów, tryb "Pora dnia".',
});
