class TempSlimCard extends TempHumidityCard {
  static getStubConfig() {
    return { temp_entity: 'sensor.temperature_salon', name: 'Salon' };
  }

  _render() {
    const name = this._config.name || 'Pokój';
    const temp = this._tempVal;
    const st   = this._getTempState(temp);

    const TUBE_TOP = 22, TUBE_H = 72;
    const fillH = Math.min(TUBE_H, (st.fillPct / 100) * TUBE_H);
    const fillY = TUBE_TOP + TUBE_H - fillH;
    const BULB_CY = 108;
    const isOffline = temp === null;
    const tempStr = isOffline ? '--°' : temp.toFixed(1) + '°';

    this.shadowRoot.innerHTML = `
<style>
  :host { display: block; width: 100%; height: 100%; }

  .card {
    position: relative;
    width: 100%;
    aspect-ratio: 1/1;
    border-radius: 18px;
    overflow: hidden;
    background: ${st.bg};
    border: 1px solid ${st.border};
    box-sizing: border-box;
    font-family: -apple-system, system-ui, sans-serif;
    cursor: pointer;
    transition: transform 0.15s ease;
    ${st.pulseAnim}
  }
  .card:active { transform: scale(0.97); }

  .name {
    position: absolute; top: 11px; left: 13px;
    font-size: 11px; font-weight: 500; z-index: 10;
    color: ${isOffline ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.55)'};
    pointer-events: none;
  }
  .pill {
    position: absolute; bottom: 11px; left: 13px;
    padding: 3px 9px; border-radius: 20px;
    font-size: 8px; font-weight: 700; letter-spacing: 0.4px;
    background: ${st.pillBg}; border: 0.5px solid ${st.pillBorder};
    color: ${st.color}; white-space: nowrap; z-index: 10;
    pointer-events: none;
  }
  .main-svg {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%; z-index: 3;
    pointer-events: none;
  }

  /* ── FROST ── */
  .fx { position: absolute; pointer-events: none; z-index: 2; }
  .frost-tl { top:0; left:0; width:75px; height:75px; opacity:0.55; }
  .frost-tr { top:0; right:0; width:50px; height:50px; opacity:0.42; }
  .frost-bl { bottom:0; left:0; width:45px; height:45px; opacity:0.3; }
  .flake {
    position: absolute; font-size: 9px;
    color: rgba(160,220,255,0.72); z-index: 2; pointer-events: none;
    animation: frost-float 3.4s ease-in-out infinite;
  }
  .f1 { top:7px; left:50px; animation-delay:0s; }
  .f2 { top:20px; left:36px; font-size:6px; opacity:0.55; animation-delay:0.7s; }
  .f3 { top:32px; left:56px; font-size:5px; opacity:0.4; animation-delay:1.3s; }

  /* ── WARM ── */
  .sun-glow {
    position:absolute; top:-20px; right:-20px;
    width:80px; height:80px; border-radius:50%; z-index:1; pointer-events:none;
    background: radial-gradient(circle, rgba(255,180,0,0.18) 0%, rgba(255,120,0,0.08) 50%, transparent 70%);
  }
  .sun-rays { top:0; right:0; width:60px; height:60px; opacity:0.42; z-index:2; }
  .warm-haze {
    position:absolute; bottom:0; left:0; right:0; height:55%; z-index:1; pointer-events:none;
    background: linear-gradient(to top, rgba(255,120,0,0.07), transparent);
  }
  .warm-waves {
    position:absolute; right:24px; bottom:28px;
    display:flex; gap:3px; align-items:flex-end; z-index:4; pointer-events:none;
  }
  .ww { width:2px; border-radius:2px;
    background: linear-gradient(to top, rgba(255,159,10,0.55), transparent);
    animation: warm-shimmer 2.4s ease-in-out infinite; }
  .ww1 { height:9px; animation-delay:0s; }
  .ww2 { height:13px; animation-delay:0.4s; }
  .ww3 { height:7px;  animation-delay:0.8s; }
  .ww4 { height:11px; animation-delay:0.2s; }

  /* ── HEAT ── */
  .heat-glow-bg {
    position:absolute; bottom:0; right:0; width:110px; height:100%;
    z-index:1; pointer-events:none;
    background: radial-gradient(ellipse at right bottom, rgba(255,60,0,0.14) 0%, transparent 65%);
  }
  .heat-blob {
    position:absolute; right:18px; bottom:18px;
    width:50px; height:15px; border-radius:50%;
    background: radial-gradient(ellipse, rgba(255,100,0,0.38) 0%, transparent 70%);
    filter: blur(3px); z-index:4; pointer-events:none;
  }
  .heat-embers {
    position:absolute; right:22px; bottom:20px;
    display:flex; gap:2px; align-items:flex-end;
    z-index:5; pointer-events:none;
  }
  .ember { border-radius: 50% 50% 30% 30%; transform-origin: bottom center; }
  .e1 { width:5px;  height:18px; background:linear-gradient(to top,#FF6B00,#FF3A00,rgba(255,100,0,0.25),transparent); animation:flicker1 1.4s ease-in-out infinite 0s; }
  .e2 { width:7px;  height:26px; background:linear-gradient(to top,#FF8C00,#FF4500,#FF2200,rgba(255,80,0,0.15),transparent); animation:flicker2 1.6s ease-in-out infinite 0.15s; }
  .e3 { width:5px;  height:17px; background:linear-gradient(to top,#FF6B00,#FF3A00,rgba(255,80,0,0.2),transparent); animation:flicker3 1.3s ease-in-out infinite 0.3s; }
  .e4 { width:4px;  height:14px; background:linear-gradient(to top,#FF8000,#FF3A00,transparent); animation:flicker1 1.5s ease-in-out infinite 0.45s; }
  .heat-shimmer-wrap {
    position:absolute; right:17px; bottom:46px;
    display:flex; gap:3px; align-items:flex-end;
    z-index:4; pointer-events:none;
  }
  .hs { width:2.5px; border-radius:2px;
    background: linear-gradient(to top, rgba(255,80,40,0.62), transparent);
    animation: shimmer-heat 1.8s ease-in-out infinite; }
  .hs1 { height:12px; animation-delay:0s; }
  .hs2 { height:16px; animation-delay:0.25s; }
  .hs3 { height:9px;  animation-delay:0.5s; }
  .hs4 { height:14px; animation-delay:0.12s; }

  /* ── KEYFRAMES ── */
  @keyframes frost-float {
    0%,100% { opacity:0.65; transform:translateY(0) rotate(0deg); }
    50%      { opacity:1;    transform:translateY(-3px) rotate(10deg); }
  }
  @keyframes frost-pulse {
    0%,100% { box-shadow:0 0 0 0 rgba(10,132,255,0); }
    50%      { box-shadow:0 0 0 8px rgba(10,132,255,0.14); }
  }
  @keyframes warm-pulse {
    0%,100% { box-shadow:0 0 0 0 rgba(255,159,10,0); }
    50%      { box-shadow:0 0 0 6px rgba(255,159,10,0.1); }
  }
  @keyframes heat-pulse {
    0%,100% { box-shadow:0 0 0 0 rgba(255,69,58,0); }
    50%      { box-shadow:0 0 0 8px rgba(255,69,58,0.16); }
  }
  @keyframes warm-shimmer {
    0%,100% { opacity:0.28; transform:scaleX(1) translateY(0); }
    50%      { opacity:0.6;  transform:scaleX(1.15) translateY(-2px); }
  }
  @keyframes flicker1 {
    0%,100% { opacity:0.85; transform:scaleX(1) scaleY(1) translateY(0); }
    25%      { opacity:1;   transform:scaleX(0.85) scaleY(1.12) translateY(-3px); }
    75%      { opacity:0.95; transform:scaleX(0.9) scaleY(1.08) translateY(-4px); }
  }
  @keyframes flicker2 {
    0%,100% { opacity:0.7; transform:scaleX(1) scaleY(1) translateY(0); }
    30%      { opacity:1;  transform:scaleX(1.15) scaleY(1.15) translateY(-5px); }
  }
  @keyframes flicker3 {
    0%,100% { opacity:0.6;  transform:scaleX(1) scaleY(1) translateY(0); }
    40%      { opacity:0.95; transform:scaleX(1.2) scaleY(1.2) translateY(-6px); }
  }
  @keyframes shimmer-heat {
    0%,100% { opacity:0.4; transform:scaleX(1) translateY(0); }
    33%      { opacity:0.8; transform:scaleX(1.2) translateY(-3px); }
  }
</style>

<div class="card">
  ${st.effect === 'frost' ? this._frostHTML() : ''}
  ${st.effect === 'warm'  ? this._warmHTML()  : ''}
  ${st.effect === 'heat'  ? this._heatHTML()  : ''}

  <div class="name">${name}</div>

  <svg class="main-svg" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${st.gradStops[0]}"/>
        <stop offset="100%" stop-color="${st.gradStops[1]}"/>
      </linearGradient>
      <clipPath id="tube-clip">
        <rect x="104" y="${TUBE_TOP}" width="10" height="${TUBE_H}" rx="5"/>
      </clipPath>
    </defs>

    <!-- temp value -->
    <text x="12" y="62"
      fill="${isOffline ? 'rgba(255,255,255,0.15)' : 'white'}"
      font-size="36" font-weight="700"
      font-family="-apple-system,system-ui"
      letter-spacing="-1.5">${tempStr}</text>

    <!-- tube background -->
    <rect x="104" y="${TUBE_TOP}" width="10" height="${TUBE_H}" rx="5"
      fill="rgba(255,255,255,0.04)"
      stroke="${isOffline ? 'rgba(255,255,255,0.07)' : st.border}"
      stroke-width="1"/>

    <!-- tube fill -->
    ${!isOffline && fillH > 0 ? `
    <rect x="104" y="${fillY}" width="10" height="${fillH}"
      fill="url(#grad)" clip-path="url(#tube-clip)"/>
    ` : ''}

    <!-- tick marks -->
    <line x1="114" y1="${TUBE_TOP + 10}" x2="119" y2="${TUBE_TOP + 10}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <line x1="114" y1="${TUBE_TOP + 24}" x2="119" y2="${TUBE_TOP + 24}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <line x1="114" y1="${TUBE_TOP + 38}" x2="119" y2="${TUBE_TOP + 38}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <line x1="114" y1="${TUBE_TOP + 52}" x2="119" y2="${TUBE_TOP + 52}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

    <!-- bulb glow -->
    ${!isOffline ? `<circle cx="109" cy="${BULB_CY}" r="12" fill="${st.glowColor}"/>` : ''}
    <circle cx="109" cy="${BULB_CY}" r="11"
      fill="none"
      stroke="${isOffline ? 'rgba(255,255,255,0)' : st.glowColor}"
      stroke-width="${st.glowWidth}"/>
    <!-- bulb body -->
    <circle cx="109" cy="${BULB_CY}" r="10"
      fill="${isOffline ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.15)'}"
      stroke="${isOffline ? 'rgba(255,255,255,0.1)' : st.bulbColor}"
      stroke-width="1.4"/>
    <!-- bulb fill -->
    <circle cx="109" cy="${BULB_CY}" r="6.5"
      fill="${isOffline ? 'rgba(255,255,255,0.08)' : st.bulbColor}"/>
  </svg>

  <div class="pill">${st.label}</div>
</div>`;

    this.shadowRoot.querySelector('.card')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._config.temp_entity },
      }));
    });
  }

  getCardSize() { return 2; }
}

customElements.define('aha-temp-slim-card', TempSlimCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-temp-slim-card',
  name:        'Temp Slim Card',
  preview:     false,
  description: 'Kompaktowy kwadratowy kafelek temperatury z termometrem i efektami wizualnymi.',
});
