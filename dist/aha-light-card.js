/**
 * aha-light-card — kafelek światła (Govee / dowolne light.*) w stylu awesome-ha
 *
 * Tap na kafelek       → toggle (gdy "Pora dnia" aktywna — włącza od razu z jasnością/barwą wg pory dnia)
 * Hold (500 ms)        → more-info
 * Suwak na dole        → jasność (ręczna zmiana wyłącza tryb "Pora dnia")
 * Przycisk ☀ Pora dnia → włącza/wyłącza śledzenie pory dnia (input_boolean)
 *
 * Config:
 *   type: custom:aha-light-card
 *   entity: light.jarzeniowka
 *   name: Jarzeniówka ściana          (opcjonalnie, domyślnie friendly_name)
 *   model: H6062                      (opcjonalnie, chip)
 *   room: Piętro                      (opcjonalnie, chip)
 *   brand: Govee                      (opcjonalnie, chip)
 *   adaptive_entity: input_boolean.jarzeniowka_pora_dnia   (opcjonalnie — przycisk "Pora dnia")
 *   adaptive_sensor: sensor.swiatlo_pora_dnia              (opcjonalnie — cel: state = jasność %, attr color_temp_kelvin)
 *   icon: bulb | ceiling              (opcjonalnie, domyślnie bulb)
 */
class AhaLightCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built = false;
    this._drag = null;
    this._holdT = null;
    this._held = false;
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
    return { bri, k, phase: s.attributes.faza || '' };
  }

  _call(domain, service, data) {
    return this._hass.callService(domain, service, data);
  }

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
    if (t) { data.brightness_pct = t.bri; data.color_temp_kelvin = t.k; }
    this._call('light', 'turn_on', data);
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
      ['żółty', 255, 255, 0], ['cyjan', 0, 255, 255], ['magenta', 255, 0, 255],
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

  // ── build ────────────────────────────────────────────────
  _build() {
    const c = this._config;
    const hasAdaptive = !!c.adaptive_entity;
    this.shadowRoot.innerHTML = `
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :host{display:block;font-family:-apple-system,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .card{
    --r:95;--g:94;--b:90;
    position:relative;overflow:hidden;cursor:pointer;user-select:none;-webkit-user-select:none;
    -webkit-tap-highlight-color:transparent;
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
  .card:active{transform:scale(0.97)}
  @keyframes aha-light-pulse-on{
    0%,100%{box-shadow:0 0 0 0 rgba(var(--r),var(--g),var(--b),0)}
    50%{box-shadow:0 0 0 5px rgba(var(--r),var(--g),var(--b),0.18)}
  }
  .top{position:relative;display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
  .ibox{
    width:38px;height:38px;border-radius:12px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    background:#1c2230;color:#5F5E5A;
    transition:background .4s ease,color .4s ease,box-shadow .4s ease;
  }
  .ibox .ifill{fill:transparent;transition:fill .4s ease}
  .card.on .ibox{background:rgb(var(--r),var(--g),var(--b));box-shadow:0 0 14px rgba(var(--r),var(--g),var(--b),0.5)}
  .card.on .ibox .ifill{fill:rgba(255,255,255,0.25)}

  .auto{
    display:${hasAdaptive ? 'inline-flex' : 'none'};align-items:center;gap:4px;
    height:26px;padding:0 9px 0 7px;border-radius:13px;flex-shrink:0;
    font:600 10px/1 -apple-system,system-ui,sans-serif;letter-spacing:0.02em;
    color:rgba(255,255,255,0.40);background:rgba(255,255,255,0.05);
    border:0.5px solid rgba(255,255,255,0.10);
    transition:background .4s ease,color .4s ease,border-color .4s ease,transform .15s ease;
  }
  .auto:active{transform:scale(0.96)}
  .auto.act{color:#EF9F27;background:rgba(239,159,39,0.14);border-color:rgba(239,159,39,0.40)}
  .auto svg{flex-shrink:0}

  .mid{position:relative;display:flex;flex-direction:column;gap:3px;margin-top:10px}
  .name{font-size:13px;font-weight:600;letter-spacing:-0.02em;color:rgba(255,255,255,0.65);
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .4s ease}
  .card.on .name{color:#fff}
  .state{display:flex;align-items:center;gap:5px;font-size:10px;font-weight:600;letter-spacing:0.04em;
    color:#5F5E5A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .4s ease}
  .card.on .state{color:rgb(var(--r),var(--g),var(--b))}
  .dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;background:#3a3a3c}
  .card.on .dot{background:rgb(var(--r),var(--g),var(--b));box-shadow:0 0 5px rgba(var(--r),var(--g),var(--b),0.5);
    animation:aha-light-blink 2.2s ease-in-out infinite}
  @keyframes aha-light-blink{0%,100%{opacity:1}50%{opacity:0.25}}
  .chips{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}
  .chip{font-size:9px;font-weight:500;padding:2px 7px;border-radius:6px;
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
</style>
<div class="card" id="card">
  <div class="top">
    <div class="ibox" id="ibox">${this._icon()}</div>
    <button class="auto" id="auto" type="button" title="Śledzenie pory dnia" style="border-style:solid;cursor:pointer">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
      </svg><span>Pora dnia</span>
    </button>
  </div>
  <div class="mid">
    <div class="name" id="name"></div>
    <div class="state"><span class="dot"></span><span id="stxt"></span></div>
    <div class="chips" id="chips"></div>
  </div>
  <div class="sl" id="sl"><div class="trk"><div class="fil" id="fil"></div></div><div class="knob" id="knob"></div></div>
</div>`;

    const $ = id => this.shadowRoot.getElementById(id);
    const card = $('card'), auto = $('auto'), sl = $('sl');

    // tap / hold na kafelku
    card.addEventListener('pointerdown', e => {
      if (e.composedPath().some(n => n === sl || n === auto)) return;
      this._held = false;
      clearTimeout(this._holdT);
      this._holdT = setTimeout(() => { this._held = true; this._moreInfo(); }, 500);
    });
    const cancelHold = () => clearTimeout(this._holdT);
    card.addEventListener('pointerup', cancelHold);
    card.addEventListener('pointercancel', cancelHold);
    card.addEventListener('pointerleave', cancelHold);
    card.addEventListener('click', e => {
      if (e.composedPath().some(n => n === sl || n === auto)) return;
      if (this._held) { this._held = false; return; }
      this._toggle();
    });

    // przycisk "Pora dnia"
    auto.addEventListener('click', e => {
      e.stopPropagation();
      this._setAdaptive(!this._adaptiveOn());
    });

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
      this._drag = { x0: e.clientX, p: pctAt(e.clientX) };
      show(this._drag.p);
    });
    sl.addEventListener('pointermove', e => {
      if (!this._drag) return;
      this._drag.p = pctAt(e.clientX);
      show(this._drag.p);
    });
    const end = e => {
      if (!this._drag) return;
      const p = this._drag.p;
      this._drag = null;
      sl.classList.remove('drag');
      if (this._adaptiveOn()) this._setAdaptive(false);   // ręczna zmiana = wyjście z trybu
      this._call('light', 'turn_on', { entity_id: this._config.entity, brightness_pct: p });
      e && e.stopPropagation();
    };
    sl.addEventListener('pointerup', end);
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

    const briPct = on ? Math.max(1, Math.round(((st.attributes.brightness ?? 255) / 255) * 100)) : 0;
    card.style.setProperty('--glow', on ? (0.45 + 0.55 * briPct / 100).toFixed(2) : 0);

    $('name').textContent = c.name || (st && st.attributes.friendly_name) || c.entity;

    const adaptive = this._adaptiveOn();
    $('auto').classList.toggle('act', adaptive);

    if (!this._drag) {
      let txt;
      if (unavailable) txt = 'Niedostępna';
      else if (!on) txt = adaptive ? 'Wyłączona · pora dnia' : 'Wyłączona';
      else {
        const parts = ['Włączona', briPct + '%'];
        const k = st.attributes.color_temp_kelvin;
        if (st.attributes.color_mode === 'color_temp' && k) parts.push(Math.round(k / 50) * 50 + 'K');
        else if (st.attributes.effect) parts.push(st.attributes.effect);
        else { const cn = this._colorName(r, g, b); if (cn) parts.push(cn); }
        txt = parts.join(' · ');
      }
      $('stxt').textContent = txt;
      $('fil').style.width = briPct + '%';
      $('knob').style.left = briPct + '%';
    }

    const t = adaptive ? this._target() : null;
    const chips = [c.model, c.room, c.brand].filter(Boolean).map(x => `<span class="chip">${x}</span>`);
    if (t) chips.unshift(`<span class="chip sun">☀ ${t.bri}% · ${t.k}K</span>`);
    const html = chips.join('');
    if ($('chips').innerHTML !== html) $('chips').innerHTML = html;
  }
}

customElements.define('aha-light-card', AhaLightCard);
if (!customElements.get('light-apple-card')) customElements.define('light-apple-card', class extends AhaLightCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'aha-light-card',
  name: 'AHA Light Card',
  preview: false,
  description: 'Kafelek światła: toggle, suwak jasności, tryb "Pora dnia" (śledzenie pory dnia).',
});
