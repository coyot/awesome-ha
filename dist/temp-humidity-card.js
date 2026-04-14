function _hexToRgb(hex) {
  if (!hex || hex[0] !== '#') return '142,142,147';
  const h = hex.replace('#', '');
  return `${parseInt(h.substring(0,2),16)},${parseInt(h.substring(2,4),16)},${parseInt(h.substring(4,6),16)}`;
}

class AhaTempHumidityCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getStubConfig() {
    return {
      name: 'Salon',
      temp_entity: 'sensor.salon_temperature',
      humidity_entity: 'sensor.salon_humidity',
      battery_entity: '',
      icon: '🛋️',
    };
  }

  setConfig(config) {
    if (!config.temp_entity) throw new Error('temp_entity jest wymagane');
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  /* ── value helpers ── */
  _val(entity) {
    if (!this._hass || !entity) return null;
    const s = this._hass.states[entity];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return parseFloat(s.state);
  }

  /* ── temperature state → full design token set ── */
  _tempState(t) {
    if (t === null) return {
      key: 'offline',
      cardBg: '#1c1c1e',
      cardBorder: 'rgba(255,255,255,0.07)',
      glowCss: '',
      tempColor: '#3a3a3c',
      humColor: '#3a3a3c',
      iconBg: 'rgba(255,255,255,0.06)',
      namColor: '#3a3a3c',
      dotColor: '#3a3a3c',
      dotGlow: 'none',
      dotPct: 0,
      label: 'offline',
    };
    if (t < 5) return {
      key: 'frost',
      cardBg: '#0b1420',
      cardBorder: 'rgba(90,200,250,0.32)',
      glowCss: 'radial-gradient(ellipse at 0% 0%, rgba(90,200,250,0.16) 0%, transparent 60%)',
      tempColor: '#5AC8FA',
      humColor: '#5AC8FA',
      iconBg: 'rgba(90,200,250,0.14)',
      nameColor: 'rgba(90,200,250,0.4)',
      dotColor: '#5AC8FA',
      dotGlow: '0 0 6px rgba(90,200,250,0.7)',
      dotPct: Math.max(2, ((t + 10) / 50) * 100),
      label: 'mróz',
    };
    if (t < 17) return {
      key: 'cold',
      cardBg: '#101820',
      cardBorder: 'rgba(90,200,250,0.15)',
      glowCss: 'radial-gradient(ellipse at 10% 10%, rgba(90,200,250,0.09) 0%, transparent 55%)',
      tempColor: '#7dd4f8',
      humColor: '#5AC8FA',
      iconBg: 'rgba(90,200,250,0.10)',
      nameColor: '#3a3a3c',
      dotColor: '#7dd4f8',
      dotGlow: '0 0 5px rgba(90,200,250,0.5)',
      dotPct: ((t + 10) / 50) * 100,
      label: 'zimno',
    };
    if (t < 26) return {
      key: 'comfort',
      cardBg: '#1c1c1e',
      cardBorder: 'rgba(255,255,255,0.08)',
      glowCss: '',
      tempColor: '#ffffff',
      humColor: '#30D158',
      iconBg: 'rgba(255,255,255,0.07)',
      nameColor: '#3a3a3c',
      dotColor: '#ffffff',
      dotGlow: '0 0 5px rgba(255,255,255,0.55)',
      dotPct: ((t + 10) / 50) * 100,
      label: 'komfort',
    };
    if (t < 31) return {
      key: 'warm',
      cardBg: '#1e1508',
      cardBorder: 'rgba(255,159,10,0.22)',
      glowCss: 'radial-gradient(ellipse at 100% 0%, rgba(255,159,10,0.13) 0%, transparent 55%)',
      tempColor: '#FF9F0A',
      humColor: '#FF9F0A',
      iconBg: 'rgba(255,159,10,0.12)',
      nameColor: 'rgba(255,159,10,0.35)',
      dotColor: '#FF9F0A',
      dotGlow: '0 0 6px rgba(255,159,10,0.65)',
      dotPct: ((t + 10) / 50) * 100,
      label: 'za ciepło',
    };
    return {
      key: 'fire',
      cardBg: '#1a0800',
      cardBorder: 'rgba(255,69,58,0.42)',
      glowCss: 'radial-gradient(ellipse at 50% 110%, rgba(255,80,0,0.32) 0%, rgba(180,20,0,0.12) 45%, transparent 68%)',
      tempColor: '#FF453A',
      humColor: '#FF453A',
      iconBg: 'rgba(255,69,58,0.15)',
      nameColor: 'rgba(255,69,58,0.35)',
      dotColor: '#FF453A',
      dotGlow: '0 0 7px rgba(255,69,58,0.8)',
      dotPct: Math.min(98, ((t + 10) / 50) * 100),
      label: 'upał',
    };
  }

  /* ── humidity color ── */
  _humColor(h, st) {
    if (h === null) return st.humColor;
    if (h < 35)  return '#FF9F0A';
    if (h < 66)  return '#30D158';
    if (h < 81)  return '#0A84FF';
    return '#FF453A';
  }

  /* ── battery HTML ── */
  _batteryHTML(pct) {
    if (pct === null || pct >= 25) return '';
    const col = pct < 20 ? '#FF453A' : 'rgba(255,255,255,0.45)';
    const fillW = Math.round((Math.max(0, Math.min(100, pct)) / 100) * 13);
    return `
      <div class="bat">
        <span class="bat-pct">${Math.round(pct)}%</span>
        <svg width="20" height="10" viewBox="0 0 22 11">
          <rect x="0.5" y="0.5" width="17" height="10" rx="2.5" fill="none" stroke="${col}" stroke-width="1.1"/>
          <rect x="18" y="3.5" width="2.5" height="4" rx="1" fill="${col}" opacity="0.7"/>
          ${fillW > 0 ? `<rect x="2" y="2" width="${fillW}" height="6" rx="1.5" fill="${col}"/>` : ''}
        </svg>
      </div>`;
  }

  /* ── frost crystals overlay ── */
  _frostHTML() {
    return `
      <svg class="overlay-svg frost-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,0 Q14,22 0,44" stroke="rgba(140,210,255,0.35)" stroke-width="1.1" fill="none"/>
        <path d="M0,0 Q26,10 52,0" stroke="rgba(140,210,255,0.35)" stroke-width="1.1" fill="none"/>
        <path d="M0,0 Q22,22 34,34" stroke="rgba(140,210,255,0.22)" stroke-width="0.9" fill="none"/>
        <line x1="18" y1="18" x2="18" y2="32" stroke="rgba(160,225,255,0.6)" stroke-width="1"/>
        <line x1="11" y1="25" x2="25" y2="25" stroke="rgba(160,225,255,0.6)" stroke-width="1"/>
        <line x1="13" y1="20" x2="23" y2="30" stroke="rgba(160,225,255,0.32)" stroke-width="0.8"/>
        <line x1="23" y1="20" x2="13" y2="30" stroke="rgba(160,225,255,0.32)" stroke-width="0.8"/>
        <line x1="38" y1="10" x2="38" y2="20" stroke="rgba(160,225,255,0.4)" stroke-width="0.8"/>
        <line x1="33" y1="15" x2="43" y2="15" stroke="rgba(160,225,255,0.4)" stroke-width="0.8"/>
        <circle cx="7"  cy="7"  r="1.5" fill="rgba(180,235,255,0.65)"/>
        <circle cx="24" cy="5"  r="1"   fill="rgba(180,235,255,0.5)"/>
        <circle cx="5"  cy="26" r="1.2" fill="rgba(180,235,255,0.5)"/>
        <circle cx="34" cy="6"  r="0.9" fill="rgba(180,235,255,0.4)"/>
        <circle cx="10" cy="38" r="1"   fill="rgba(180,235,255,0.35)"/>
        <circle cx="48" cy="8"  r="0.8" fill="rgba(180,235,255,0.3)"/>
      </svg>`;
  }

  /* ── fire flames overlay ── */
  _fireHTML() {
    return `
      <div class="flames">
        <div class="flame fl1"></div>
        <div class="flame fl2"></div>
        <div class="flame fl3"></div>
        <div class="flame fl4"></div>
      </div>`;
  }

  /* ── main render ── */
  _render() {
    const cfg  = this._config;
    const name = cfg.name  || 'Pokój';
    const icon = cfg.icon  || '🏠';
    const temp = this._val(cfg.temp_entity);
    const hum  = this._val(cfg.humidity_entity);
    const bat  = this._val(cfg.battery_entity);
    const st   = this._tempState(temp);
    const hCol = this._humColor(hum, st);

    const tempStr = temp === null ? '--°' : temp.toFixed(1) + '°';
    const humStr  = hum  === null ? '--'  : hum.toFixed(0)  + '%';

    const isOffline = temp === null;

    this.shadowRoot.innerHTML = `
<style>
  :host { display: block; width: 100%; height: 100%; }

  .card {
    width: 100%; height: 100%;
    border-radius: 16px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    cursor: default;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    background: ${st.cardBg};
    border: 1px solid ${st.cardBorder};
    transition: transform 0.15s ease, border-color 0.5s ease, background 0.5s ease;
  }
  .card:active { transform: scale(0.97); }

  /* bg glow layer */
  .bg-glow {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background: ${st.glowCss || 'none'};
    transition: background 0.5s ease;
  }

  /* frost / fire overlays */
  .overlay-svg {
    position: absolute; pointer-events: none; z-index: 1;
  }
  .frost-svg { top: 0; left: 0; width: 100px; height: 100px; opacity: 0.6; }

  /* flames */
  .flames {
    position: absolute; bottom: 10px; right: 10px;
    display: flex; gap: 2px; align-items: flex-end;
    z-index: 1; pointer-events: none;
  }
  .flame {
    border-radius: 50% 50% 30% 30%;
    transform-origin: bottom center;
    animation: flicker 1.8s ease-in-out infinite;
  }
  .fl1 { width: 5px;  height: 18px; background: linear-gradient(to top, #FF6B00, #FF3A00, rgba(255,80,0,0.06));  animation-duration: 1.5s; animation-delay: 0s;    }
  .fl2 { width: 8px;  height: 28px; background: linear-gradient(to top, #FF8C00, #FF4500, rgba(255,60,0,0.05));  animation-duration: 1.9s; animation-delay: 0.18s; }
  .fl3 { width: 6px;  height: 20px; background: linear-gradient(to top, #FF6B00, #FF3A00, rgba(255,70,0,0.06));  animation-duration: 1.4s; animation-delay: 0.35s; }
  .fl4 { width: 5px;  height: 14px; background: linear-gradient(to top, #FF5500, #FF2200, rgba(255,50,0,0.05));  animation-duration: 1.6s; animation-delay: 0.55s; }

  /* battery */
  .bat {
    position: absolute; top: 9px; right: 10px; z-index: 10;
    display: flex; align-items: center; gap: 5px;
  }
  .bat-pct {
    font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.8);
    background: rgba(28,28,30,0.92); border: 0.5px solid rgba(255,255,255,0.14);
    border-radius: 5px; padding: 2px 5px;
    opacity: 0; pointer-events: none; transition: opacity 0.15s;
    backdrop-filter: blur(8px);
  }
  .bat:hover .bat-pct { opacity: 1; }

  /* top section */
  .top {
    display: flex; flex-direction: column;
    align-items: flex-start; gap: 4px;
    position: relative; z-index: 2;
  }
  .icon-wrap {
    width: 30px; height: 30px; border-radius: 9px;
    background: ${st.iconBg};
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; flex-shrink: 0;
    transition: background 0.5s ease;
  }
  .room-name {
    font-size: 10px;
    color: ${st.nameColor || '#3a3a3c'};
    text-transform: uppercase;
    letter-spacing: 0.07em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 96px;
    transition: color 0.5s ease;
  }

  /* bottom section */
  .bottom { position: relative; z-index: 2; }

  .temp-val {
    font-size: 28px; font-weight: 700;
    letter-spacing: -1.5px; line-height: 1;
    color: ${st.tempColor};
    transition: color 0.5s ease;
    cursor: pointer;
  }

  .hum-val {
    font-size: 12px; font-weight: 500;
    color: ${hCol};
    margin-top: 4px;
    transition: color 0.4s ease;
    cursor: ${cfg.humidity_entity ? 'pointer' : 'default'};
  }

  /* gradient range bar */
  .range {
    position: relative; height: 3px;
    background: rgba(255,255,255,0.07);
    border-radius: 2px; margin-top: 7px;
    overflow: visible;
  }
  .range-track {
    position: absolute; inset: 0; border-radius: 2px;
    background: linear-gradient(90deg,
      #0A84FF  0%,
      #5AC8FA  20%,
      #30D158  42%,
      #30D158  58%,
      #FF9F0A  80%,
      #FF453A  100%
    );
    opacity: 0.3;
  }
  .range-dot {
    position: absolute; top: 50%;
    transform: translate(-50%, -50%);
    width: 7px; height: 7px; border-radius: 50%;
    background: ${st.dotColor};
    box-shadow: ${st.dotGlow};
    left: ${st.dotPct.toFixed(1)}%;
    transition: left 0.6s ease, background 0.5s ease, box-shadow 0.5s ease;
  }

  /* ── keyframes ── */
  @keyframes flicker {
    0%,100% { transform: scaleX(1)    scaleY(1)    translateY(0);   opacity: 0.9; }
    25%      { transform: scaleX(0.85) scaleY(1.12) translateY(-3px); opacity: 1;   }
    50%      { transform: scaleX(1.1)  scaleY(0.95) translateY(-1px); opacity: 0.85; }
    75%      { transform: scaleX(0.9)  scaleY(1.08) translateY(-4px); opacity: 0.95; }
  }
</style>

<div class="card" id="card">
  <div class="bg-glow"></div>

  ${st.key === 'frost' ? this._frostHTML() : ''}
  ${st.key === 'fire'  ? this._fireHTML()  : ''}

  ${this._batteryHTML(bat)}

  <div class="top">
    <div class="icon-wrap">${icon}</div>
    <div class="room-name">${name}</div>
  </div>

  <div class="bottom">
    <div class="temp-val" id="temp-hit">${tempStr}</div>
    <div class="hum-val"  id="hum-hit">💧 ${humStr}</div>
    <div class="range">
      <div class="range-track"></div>
      <div class="range-dot"></div>
    </div>
  </div>
</div>`;

    /* click → more-info */
    this.shadowRoot.getElementById('temp-hit')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._config.temp_entity },
      }));
    });

    if (cfg.humidity_entity) {
      this.shadowRoot.getElementById('hum-hit')?.addEventListener('click', e => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true,
          detail: { entityId: this._config.humidity_entity },
        }));
      });
    }
  }

  getCardSize() { return 3; }
}

customElements.define('aha-temp-humidity-card', AhaTempHumidityCard);
if (!customElements.get('temp-humidity-card'))
  customElements.define('temp-humidity-card', class extends AhaTempHumidityCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-temp-humidity-card',
  name:        'AHA Temp & Humidity Card',
  preview:     false,
  description: 'Kafelek temperatury i wilgotności — Apple Home dark style. Reaktywne tło (mróz/komfort/upał), gradient range-bar, ikona jako parametr.',
});