// weather-card.js  v1.0
// Karta pogodowa — konwersja current_weather.yaml do natywnego JS custom element.
//
// Config:
//   entity:           (required) weather.*
//   temp_entity:      sensor.*
//   feels_entity:     sensor.*
//   humidity_entity:  sensor.*
//   pressure_entity:  sensor.*
//   wind_entity:      sensor.*
//   gust_entity:      sensor.*
//   wind_dir_entity:  sensor.*
//   rain_rate_entity: sensor.*
//   rain_day_entity:  sensor.*
//   uv_entity:        sensor.*
//   battery_entity:   sensor.*
//   forecast_entity:  sensor.*  (attributes.forecast = hourly JSON)
//   station_label:    string    (default 'Ogród · Stacja główna')
//   fertilizations:   [{date:'YYYY-MM-DD', name:'...', description:'...'}]
//
// Rejestracja: aha-weather-card (alias: weather-card)

// ── helpers ──────────────────────────────────────────────────────────────────

function _wcPad(n) { return String(n).padStart(2, '0'); }

function _wcRand(seed) {
  // Simple seeded LCG for stable particles across renders
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 4294967296);
  };
}

function _daysUntil(dateStr) {
  const target = new Date(dateStr); target.setHours(0,0,0,0);
  const today  = new Date();        today.setHours(0,0,0,0);
  return Math.round((target - today) / 86400000);
}

function _degToCompass(raw) {
  const n = parseFloat(raw); if (isNaN(n)) return '—';
  return ['N','NE','E','SE','S','SW','W','NW'][Math.round(n/45)%8];
}
const _WIND_PL = {N:'Płn',NE:'Płn-Wsch',E:'Wsch',SE:'Płd-Wsch',S:'Płd',SW:'Płd-Zach',W:'Zach',NW:'Płn-Zach'};

// ── moon ─────────────────────────────────────────────────────────────────────

function _getMoonPhase() {
  const ref   = new Date('2000-01-06T18:14:00Z').getTime();
  const cycle = 29.53059 * 86400000;
  const p     = ((Date.now() - ref) % cycle) / cycle;
  return p < 0 ? p + 1 : p;
}

function _moonSVG(phase) {
  const p = ((phase % 1) + 1) % 1;
  const cx=44,cy=44,r=22,ty=cy-r,by=cy+r;
  if (p < 0.03 || p > 0.97)
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0D1426"/>
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#2A3A5A" stroke-width="1"/>`;
  if (p > 0.47 && p < 0.53)
    return `<circle cx="${cx}" cy="${cy}" r="${r+5}" fill="#C8D8F0" opacity=".10"/>
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="#C8D8F0"/>
            <circle cx="${cx}" cy="${cy}" r="${(r*0.74).toFixed(0)}" fill="#DDE8F8"/>`;
  const waxing = p < 0.5;
  const hp = waxing ? p*2 : (p-0.5)*2;
  const ex = Math.cos(hp*Math.PI)*r, aex=Math.abs(ex).toFixed(2), ts=ex>0?0:1;
  let d;
  if (waxing) {
    d = Math.abs(ex)<0.5
      ? `M ${cx} ${ty} A ${r} ${r} 0 0 1 ${cx} ${by} L ${cx} ${ty} Z`
      : `M ${cx} ${ty} A ${r} ${r} 0 0 1 ${cx} ${by} A ${aex} ${r} 0 0 ${ts} ${cx} ${ty} Z`;
  } else {
    d = Math.abs(ex)<0.5
      ? `M ${cx} ${ty} A ${r} ${r} 0 0 0 ${cx} ${by} L ${cx} ${ty} Z`
      : `M ${cx} ${ty} A ${r} ${r} 0 0 0 ${cx} ${by} A ${aex} ${r} 0 0 ${ts} ${cx} ${ty} Z`;
  }
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0D1426"/><path d="${d}" fill="#C8D8F0"/>`;
}

// ── weather logic ─────────────────────────────────────────────────────────────

function _tempDayBg(t) {
  if (t===null) return '#181818';
  if (t>=40) return '#2E0505'; if (t>=35) return '#280808'; if (t>=30) return '#231205';
  if (t>=25) return '#1E1808'; if (t>=20) return '#171A12'; if (t>=15) return '#131618';
  if (t>=8)  return '#101418'; if (t>=0)  return '#0C1A2A'; return '#0A1425';
}

function _tempAccent(t) {
  if (t===null) return '#888';
  if (t>=40) return '#FF2020'; if (t>=35) return '#FF3B30'; if (t>=30) return '#FF6820';
  if (t>=25) return '#FF9F0A'; if (t>=20) return '#FFD60A'; if (t>=15) return '#34C759';
  if (t>=8)  return '#30D158'; if (t>=0)  return '#5AC8FA'; if (t>=-8) return '#4DA6FF';
  if (t>=-18) return '#748FFF'; return '#BF5AF2';
}

function _tempColor(t) {
  if (t===null) return '#fff';
  if (t>=35) return '#FFB3AA'; if (t>=28) return '#FFD4A0'; if (t>=20) return '#FFF0C0';
  if (t>=8)  return '#FFFFFF'; if (t>=0)  return '#C8E8FF'; if (t>=-8) return '#A8D4FF';
  return '#C8AAFF';
}

function _getDayPhase(sunElev, sunAz) {
  if (sunElev < -6)   return 'night';
  if (sunElev < -0.5) return sunAz < 180 ? 'astro-dawn' : 'astro-dusk';
  if (sunElev < 6)    return sunAz < 180 ? 'dawn'        : 'dusk';
  if (sunElev < 18)   return sunAz < 180 ? 'morning'     : 'golden';
  return 'day';
}

function _resolveType(haState, dayPhase, temp, rainRateNum, gustNum) {
  const isNight  = ['night','astro-dawn','astro-dusk'].includes(dayPhase);
  const isDawn   = ['dawn','astro-dawn','morning'].includes(dayPhase);
  const isGolden = dayPhase === 'golden';
  const isDusk   = ['dusk','astro-dusk'].includes(dayPhase);
  const isDay    = dayPhase === 'day';
  const isRaining = ['rainy','pouring'].includes(haState) || rainRateNum > 0.3;
  const isSunny   = ['sunny','clear-night'].includes(haState);
  const isCloudy  = ['cloudy','partlycloudy'].includes(haState);
  const isBlizzard     = ['snowy','snowy-rainy'].includes(haState) && gustNum >= 35;
  const isFreezingRain = isRaining && temp !== null && temp <= 1;
  const isExtremeHeat  = temp !== null && temp >= 38;
  const isAurora       = isNight && temp !== null && temp <= -5 && isSunny;

  if (isBlizzard)  return 'blizzard';
  if (['hail'].includes(haState)) return 'hail';
  if (['lightning','lightning-rainy','exceptional'].includes(haState)) {
    if (isDawn)   return 'storm-dawn';
    if (isGolden||isDusk) return 'storm-golden';
    return isNight ? 'storm-night' : 'storm';
  }
  if (isFreezingRain) return 'freezing-rain';
  if (isExtremeHeat && isDay) return 'extreme-heat';
  if (isAurora) return 'aurora';
  if (isRaining) {
    if (isDawn)   return 'rain-dawn';
    if (isGolden) return 'rain-golden';
    if (isDusk)   return 'rain-dusk';
    if (isNight)  return 'rain-night';
    return 'rain';
  }
  if (['snowy','snowy-rainy'].includes(haState)) return isNight ? 'snow-night' : 'snow';
  if (['fog'].includes(haState)) return isNight ? 'fog-night' : 'fog';
  if (['windy','windy-variant'].includes(haState) || gustNum >= 50) return isNight ? 'windy-night' : 'windy';
  if (isSunny) {
    if (dayPhase==='astro-dawn') return 'night-clear';
    if (dayPhase==='dawn')       return 'dawn-clear';
    if (dayPhase==='morning')    return 'morning-clear';
    if (dayPhase==='golden')     return 'golden-clear';
    if (dayPhase==='dusk')       return 'dusk-clear';
    if (dayPhase==='astro-dusk') return 'astro-dusk-clear';
    if (isNight)                 return 'night-clear';
    return 'sun';
  }
  if (isCloudy || haState==='partlycloudy') {
    if (isDawn || dayPhase==='astro-dawn') return 'cloud-dawn';
    if (isGolden)                          return 'cloud-golden';
    if (isDusk || dayPhase==='astro-dusk') return 'cloud-dusk';
    if (isNight)                           return 'cloud-night';
    return haState==='partlycloudy' ? 'partlycloudy' : 'cloud';
  }
  return isNight ? 'cloud-night' : 'cloud';
}

// ── SVG icons ─────────────────────────────────────────────────────────────────

function _sunSVG(rays, coreR, glowR, rayLen, col) {
  col = col || '#F5A623';
  const cx=44, cy=44;
  const rl = rays.map(deg => {
    const r2 = deg*Math.PI/180;
    const x1=(cx+Math.cos(r2)*(coreR+3)).toFixed(1), y1=(cy+Math.sin(r2)*(coreR+3)).toFixed(1);
    const x2=(cx+Math.cos(r2)*(coreR+3+rayLen)).toFixed(1), y2=(cy+Math.sin(r2)*(coreR+3+rayLen)).toFixed(1);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="2.5" stroke-linecap="round"/>`;
  }).join('');
  const lc = col==='#F5A623' ? '#FFD060' : '#FFE0A0';
  return `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
    ${glowR ? `<circle cx="44" cy="44" r="${glowR}" fill="${col}" opacity=".12"/>` : ''}
    ${rl}<circle cx="44" cy="44" r="${coreR}" fill="${col}"/>
    <circle cx="44" cy="44" r="${(coreR*0.72).toFixed(0)}" fill="${lc}"/></svg>`;
}

function _cloudSVG(col1, col2) {
  const oc1=col1||'#4A5068', oc2=col2||oc1;
  return `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
    <circle cx="26" cy="52" r="14" fill="${oc1}"/><circle cx="44" cy="44" r="18" fill="${oc1}"/>
    <circle cx="62" cy="52" r="12" fill="${oc2}"/><rect x="12" y="52" width="62" height="16" fill="${oc2}"/>
    <rect x="12" y="62" width="62" height="6" rx="3" fill="${oc2}"/></svg>`;
}

function _rainCloudSVG(cloudCol, dropCol) {
  cloudCol = cloudCol||'#3A7EC4'; dropCol = dropCol||'#5AC8FA';
  return `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
    <circle cx="28" cy="38" r="14" fill="${cloudCol}"/><circle cx="46" cy="30" r="18" fill="${cloudCol}"/>
    <circle cx="62" cy="38" r="12" fill="${cloudCol}"/><rect x="14" y="38" width="60" height="14" fill="${cloudCol}"/>
    <rect x="14" y="46" width="60" height="6" rx="3" fill="${cloudCol}"/>
    <line x1="26" y1="56" x2="23" y2="67" stroke="${dropCol}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="38" y1="54" x2="35" y2="65" stroke="${dropCol}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="50" y1="56" x2="47" y2="67" stroke="${dropCol}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="62" y1="54" x2="59" y2="65" stroke="${dropCol}" stroke-width="2.5" stroke-linecap="round"/></svg>`;
}

function _sunCloudSVG(sunCol) {
  sunCol = sunCol||'#F5A623';
  return `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
    <circle cx="30" cy="32" r="14" fill="${sunCol}" opacity=".9"/>
    <line x1="30" y1="13" x2="30" y2="17" stroke="${sunCol}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="42" y1="17" x2="40" y2="20" stroke="${sunCol}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="48" y1="28" x2="44" y2="29" stroke="${sunCol}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="18" y1="17" x2="20" y2="20" stroke="${sunCol}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="12" y1="32" x2="16" y2="32" stroke="${sunCol}" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="38" cy="55" r="12" fill="#4A5068"/><circle cx="53" cy="49" r="14" fill="#4A5068"/>
    <circle cx="66" cy="55" r="10" fill="#4A5068"/><rect x="26" y="55" width="51" height="12" fill="#4A5068"/>
    <rect x="26" y="62" width="51" height="5" rx="3" fill="#4A5068"/></svg>`;
}

function _stormSVG(cloudCol, boltCol) {
  return `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
    <circle cx="28" cy="34" r="14" fill="${cloudCol}"/><circle cx="46" cy="26" r="18" fill="${cloudCol}"/>
    <circle cx="62" cy="34" r="12" fill="${cloudCol}"/><rect x="14" y="34" width="60" height="14" fill="${cloudCol}"/>
    <rect x="14" y="44" width="60" height="6" rx="3" fill="${cloudCol}"/>
    <polygon points="50,52 41,70 49,70 43,86 59,62 51,62 57,52" fill="${boltCol}"/></svg>`;
}

function _snowSVG(crystals, col) {
  col = col||'#55C0E8';
  const cx=44, cy=44, arm=32, br=11;
  const arms = [0,45,90,135,180,225,270,315].map(deg => {
    const r=deg*Math.PI/180;
    const ex=(cx+Math.cos(r)*arm).toFixed(1), ey=(cy+Math.sin(r)*arm).toFixed(1);
    const mx=(cx+Math.cos(r)*(arm*0.6)).toFixed(1), my=(cy+Math.sin(r)*(arm*0.6)).toFixed(1);
    const p=r+Math.PI/2;
    const br2=crystals
      ? `<line x1="${mx}" y1="${my}" x2="${(parseFloat(mx)+Math.cos(p)*br).toFixed(1)}" y2="${(parseFloat(my)+Math.sin(p)*br).toFixed(1)}" stroke="${col}" stroke-width="1.5" stroke-linecap="round"/>
         <line x1="${mx}" y1="${my}" x2="${(parseFloat(mx)-Math.cos(p)*br).toFixed(1)}" y2="${(parseFloat(my)-Math.sin(p)*br).toFixed(1)}" stroke="${col}" stroke-width="1.5" stroke-linecap="round"/>` : '';
    const dot = crystals ? `<circle cx="${ex}" cy="${ey}" r="2.5" fill="${col}"/>` : '';
    return `<line x1="44" y1="44" x2="${ex}" y2="${ey}" stroke="${col}" stroke-width="${crystals?2.5:2}" stroke-linecap="round"/>${br2}${dot}`;
  }).join('');
  return `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
    ${crystals?`<circle cx="44" cy="44" r="40" fill="${col}" opacity=".07"/>`:''}
    ${arms}<circle cx="44" cy="44" r="${crystals?5:4}" fill="#0A1430" stroke="${col}" stroke-width="2.5"/></svg>`;
}

// ── fertilization banner icon ─────────────────────────────────────────────────

function _fertilIconSVG(size, acR, acG, acB) {
  const ac = `rgba(${acR},${acG},${acB},1)`;
  const acL = `rgba(${acR},${acG},${acB},0.55)`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
    <path d="M${size*.50} ${size*.82} C${size*.50} ${size*.82} ${size*.50} ${size*.45} ${size*.50} ${size*.35}"
      stroke="${ac}" stroke-width="${size*.09}" stroke-linecap="round"/>
    <path d="M${size*.50} ${size*.50} C${size*.30} ${size*.30} ${size*.15} ${size*.38} ${size*.20} ${size*.55}"
      stroke="${acL}" stroke-width="${size*.07}" stroke-linecap="round" fill="none"/>
    <path d="M${size*.50} ${size*.42} C${size*.70} ${size*.22} ${size*.85} ${size*.30} ${size*.80} ${size*.48}"
      stroke="${ac}" stroke-width="${size*.08}" stroke-linecap="round" fill="none"/>
    <circle cx="${size*.50}" cy="${size*.28}" r="${size*.13}" fill="${ac}" opacity=".85"/>
  </svg>`;
}

// ── THE CARD ──────────────────────────────────────────────────────────────────

class AhaWeatherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass          = null;
    this._config        = {};
    this._tickInterval  = null;
    this._particles     = null; // cached particle strings
    this._lastType      = null;
  }

  setConfig(config) {
    if (!config.entity) throw new Error('weather-card: wymagane pole "entity"');
    this._config = config;
    this._fertilizations = Array.isArray(config.fertilizations) ? config.fertilizations : [];
    this._particles = null; // reset cache when config changes
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._tickInterval) {
      this._render();
      this._tickInterval = setInterval(() => this._render(), 60000);
    } else {
      this._render();
    }
  }

  disconnectedCallback() {
    if (this._tickInterval) { clearInterval(this._tickInterval); this._tickInterval = null; }
  }

  // ── compute weather state ───────────────────────────────────────────────────
  _compute() {
    const hass   = this._hass;
    const cfg    = this._config;
    const states = hass?.states || {};
    const g   = id => id ? (states[id]?.state ?? '—') : '—';
    const gfn = id => { const v=parseFloat(g(id)); return isNaN(v)?null:v; };
    const gf  = (id,dec=1) => { const v=gfn(id); return v===null?'—':v.toFixed(dec); };

    const haState    = states[cfg.entity]?.state || 'unknown';
    const sunAttr    = states['sun.sun']?.attributes ?? {};
    const sunElev    = parseFloat(sunAttr.elevation ?? 999);
    const sunAz      = parseFloat(sunAttr.azimuth ?? 180);
    const dayPhase   = _getDayPhase(sunElev, sunAz);
    const isNight    = ['night','astro-dawn','astro-dusk'].includes(dayPhase);
    const isGolden   = dayPhase === 'golden';
    const isDusk     = ['dusk','astro-dusk'].includes(dayPhase);
    const isDawn     = ['dawn','astro-dawn','morning'].includes(dayPhase);

    const temp       = gfn(cfg.temp_entity);
    const tempStr    = temp!==null ? temp.toFixed(1) : '—';
    const feels      = gf(cfg.feels_entity);
    const feelsNum   = gfn(cfg.feels_entity);
    const humOut     = g(cfg.humidity_entity);
    const pres       = gf(cfg.pressure_entity, 0);
    const wind       = gf(cfg.wind_entity, 1);
    const windNum    = parseFloat(wind)||0;
    const gust       = gf(cfg.gust_entity, 1);
    const gustNum    = parseFloat(gust)||0;
    const windDeg    = g(cfg.wind_dir_entity);
    const windDir    = _degToCompass(windDeg);
    const windDirPl  = _WIND_PL[windDir]||windDir;
    const rainRate   = gf(cfg.rain_rate_entity, 1);
    const rainRateNum= parseFloat(rainRate)||0;
    const rainDay    = gf(cfg.rain_day_entity, 1);
    const uv         = g(cfg.uv_entity);
    const uvNum      = parseFloat(uv)||0;
    const batV       = gf(cfg.battery_entity, 2);

    // temperature trend
    let trendStr='', trendCol='rgba(255,255,255,0.28)';
    try {
      const fcAttr = states[cfg.forecast_entity]?.attributes?.forecast;
      const fc = typeof fcAttr==='string' ? JSON.parse(fcAttr) : fcAttr;
      if (Array.isArray(fc) && fc.length>=2 && temp!==null) {
        const next  = parseFloat(fc[1]?.temperature ?? fc[1]?.temperature_high);
        const delta = next - temp;
        if (!isNaN(delta)) {
          if (Math.abs(delta)<0.4)  { trendStr='→ stała'; trendCol='rgba(255,255,255,0.25)'; }
          else if (delta>0) { trendStr=`↑ +${delta.toFixed(1)}° za godz.`; trendCol=delta>3?'#FF9F0A':'#FFD060'; }
          else              { trendStr=`↓ ${delta.toFixed(1)}° za godz.`; trendCol=delta<-3?'#5AC8FA':'#A0CCFF'; }
        }
      }
    } catch(e){}

    const rainClass = rainRateNum<0.5?'drizzle':rainRateNum<2.5?'light':rainRateNum<7.5?'moderate':rainRateNum<50?'heavy':'violent';
    const type      = _resolveType(haState, dayPhase, temp, rainRateNum, gustNum);

    // temperature color
    let tColor;
    if (['dawn-clear','cloud-dawn','rain-dawn','storm-dawn'].includes(type))      tColor='#FFD09A';
    else if (['golden-clear','cloud-golden','rain-golden','storm-golden'].includes(type)) tColor='#FFC070';
    else if (['dusk-clear','astro-dusk-clear','cloud-dusk','rain-dusk'].includes(type))   tColor='#C8D0FF';
    else if (isNight) tColor='#C8D8F0';
    else              tColor=_tempColor(temp);

    const moonPhase = _getMoonPhase();
    const ms        = _moonSVG(moonPhase);

    return {
      haState, dayPhase, isNight, isGolden, isDusk, isDawn,
      temp, tempStr, feels, feelsNum, humOut, pres,
      wind, windNum, gust, gustNum, windDeg, windDir, windDirPl,
      rainRate, rainRateNum, rainDay, rainClass,
      uv, uvNum, batV, trendStr, trendCol, type, tColor,
      moonPhase, ms,
    };
  }

  // ── icon map ────────────────────────────────────────────────────────────────
  _buildIcon(type, temp, ms) {
    const R8=[0,45,90,135,180,225,270,315];
    const R12=[0,30,60,90,120,150,180,210,240,270,300,330];
    const ICON_MAP = {
      'sun':             temp!==null&&temp>=35 ? _sunSVG(R12,20,28,10) : _sunSVG(R8,14,0,8),
      'extreme-heat':    _sunSVG(R12,22,32,12,'#FF6030'),
      'dawn-clear':      _sunSVG([60,90,120],10,14,7,'#FF9040'),
      'morning-clear':   _sunSVG(R8,12,18,7,'#F5C060'),
      'golden-clear':    _sunSVG([200,240,280,320],10,16,8,'#FF7020'),
      'dusk-clear':      `<svg viewBox="0 0 88 88" fill="none" width="48" height="48"><circle cx="44" cy="70" r="22" fill="#3050A8" opacity=".25"/><circle cx="44" cy="70" r="14" fill="#4060C0" opacity=".4"/>${ms}</svg>`,
      'astro-dusk-clear':`<svg viewBox="0 0 88 88" fill="none" width="48" height="48">${ms}</svg>`,
      'night-clear':     `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">${ms}</svg>`,
      'partlycloudy':    _sunCloudSVG('#F5A623'),
      'cloud':           _cloudSVG('#4A5068','#4A5068'),
      'cloud-dawn':      _cloudSVG('#7A6050','#604030'),
      'cloud-golden':    _cloudSVG('#785040','#604030'),
      'cloud-dusk':      _cloudSVG('#3A4068','#2A3058'),
      'cloud-night':     _cloudSVG('#2A3040','#2A3040'),
      'rain':            _rainCloudSVG('#3A7EC4','#5AC8FA'),
      'rain-dawn':       _rainCloudSVG('#5A5A80','#A0B8E0'),
      'rain-golden':     _rainCloudSVG('#6A5040','#C0A070'),
      'rain-dusk':       _rainCloudSVG('#3A4080','#7090D0'),
      'rain-night':      _rainCloudSVG('#253045','#4870A0'),
      'snow':            temp!==null&&temp<=-10 ? _snowSVG(true) : _snowSVG(false),
      'snow-night':      _snowSVG(false,'#8899CC'),
      'blizzard':        _snowSVG(true,'#AEE4F8'),
      'freezing-rain':   `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
        <circle cx="26" cy="36" r="13" fill="#3A6A9A"/><circle cx="44" cy="28" r="17" fill="#3A6A9A"/>
        <circle cx="60" cy="36" r="11" fill="#3A6A9A"/><rect x="13" y="36" width="59" height="13" fill="#3A6A9A"/>
        <rect x="13" y="44" width="59" height="5" rx="3" fill="#3A6A9A"/>
        <line x1="28" y1="54" x2="22" y2="68" stroke="#A0D8FF" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="40" y1="52" x2="34" y2="66" stroke="#A0D8FF" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="52" y1="54" x2="46" y2="68" stroke="#A0D8FF" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="22" cy="70" r="3" fill="none" stroke="#A0D8FF" stroke-width="1.5"/>
        <circle cx="34" cy="68" r="3" fill="none" stroke="#A0D8FF" stroke-width="1.5"/>
        <circle cx="46" cy="70" r="3" fill="none" stroke="#A0D8FF" stroke-width="1.5"/></svg>`,
      'storm':           _stormSVG('#282E3A','#FFD060'),
      'storm-dawn':      _stormSVG('#2A2830','#FFA040'),
      'storm-golden':    _stormSVG('#28221A','#FF8030'),
      'storm-night':     _stormSVG('#1A1E28','#C0D0FF'),
      'hail':            `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
        <circle cx="26" cy="36" r="13" fill="#3A5080"/><circle cx="44" cy="28" r="17" fill="#3A5080"/>
        <circle cx="60" cy="36" r="11" fill="#3A5080"/><rect x="13" y="36" width="59" height="13" fill="#3A5080"/>
        <rect x="13" y="44" width="59" height="5" rx="3" fill="#3A5080"/>
        <circle cx="26" cy="58" r="4" fill="#A8D8F0"/><circle cx="42" cy="62" r="4" fill="#A8D8F0"/>
        <circle cx="58" cy="57" r="4" fill="#A8D8F0"/><circle cx="34" cy="70" r="3.5" fill="#A8D8F0"/>
        <circle cx="50" cy="72" r="3.5" fill="#A8D8F0"/></svg>`,
      'fog':             `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
        <line x1="12" y1="26" x2="76" y2="26" stroke="#8899BB" stroke-width="4" stroke-linecap="round" opacity=".6"/>
        <line x1="20" y1="38" x2="72" y2="38" stroke="#8899BB" stroke-width="4" stroke-linecap="round" opacity=".5"/>
        <line x1="12" y1="50" x2="76" y2="50" stroke="#8899BB" stroke-width="4" stroke-linecap="round" opacity=".6"/>
        <line x1="20" y1="62" x2="72" y2="62" stroke="#8899BB" stroke-width="4" stroke-linecap="round" opacity=".4"/>
        <line x1="12" y1="74" x2="58" y2="74" stroke="#8899BB" stroke-width="4" stroke-linecap="round" opacity=".25"/></svg>`,
      'fog-night':       `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
        <line x1="12" y1="26" x2="76" y2="26" stroke="#5566AA" stroke-width="4" stroke-linecap="round" opacity=".5"/>
        <line x1="20" y1="38" x2="72" y2="38" stroke="#5566AA" stroke-width="4" stroke-linecap="round" opacity=".4"/>
        <line x1="12" y1="50" x2="76" y2="50" stroke="#5566AA" stroke-width="4" stroke-linecap="round" opacity=".5"/>
        <line x1="20" y1="62" x2="72" y2="62" stroke="#5566AA" stroke-width="4" stroke-linecap="round" opacity=".3"/>
        <g opacity=".5">${ms}</g></svg>`,
      'windy':           `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
        <path d="M12 26 Q28 18 48 26 Q66 34 72 26" stroke="#7BAED4" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M12 40 Q33 32 58 40 Q70 44 76 38" stroke="#7BAED4" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M12 54 Q26 48 50 54 Q62 58 66 54" stroke="#7BAED4" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M12 66 Q22 62 42 66" stroke="#7BAED4" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
      'windy-night':     `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
        <path d="M12 26 Q28 18 48 26 Q66 34 72 26" stroke="#4466AA" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M12 40 Q33 32 58 40 Q70 44 76 38" stroke="#4466AA" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M12 54 Q26 48 50 54 Q62 58 66 54" stroke="#4466AA" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <g opacity=".6">${ms}</g></svg>`,
      'aurora':          `<svg viewBox="0 0 88 88" fill="none" width="48" height="48">
        <ellipse cx="44" cy="38" rx="36" ry="10" fill="rgba(0,200,100,0.30)"/>
        <ellipse cx="44" cy="48" rx="28" ry="8"  fill="rgba(0,160,200,0.22)"/>
        <ellipse cx="44" cy="56" rx="20" ry="6"  fill="rgba(100,0,220,0.18)"/>
        <circle cx="18" cy="18" r="1.5" fill="#C8D8F0" opacity=".7"/>
        <circle cx="32" cy="10" r="1"   fill="#C8D8F0" opacity=".6"/>
        <circle cx="56" cy="14" r="1.2" fill="#C8D8F0" opacity=".8"/>
        <circle cx="70" cy="22" r="1"   fill="#C8D8F0" opacity=".5"/>
        <circle cx="62" cy="8"  r="1.5" fill="#C8D8F0" opacity=".7"/>
        <circle cx="78" cy="35" r="1"   fill="#C8D8F0" opacity=".4"/></svg>`,
    };
    return ICON_MAP[type] ?? _cloudSVG();
  }

  // ── animated icon wrapper ───────────────────────────────────────────────────
  _buildAnimatedIcon(type, temp, ms) {
    const iconHtml = this._buildIcon(type, temp, ms);
    const R8=[0,45,90,135,180,225,270,315];
    function sunburstRays(count, col, duration, length) {
      const rays = [];
      for (let i=0; i<count; i++) {
        const angle = (360/count)*i;
        rays.push(`<div style="position:absolute;top:50%;left:50%;width:2.5px;height:${length};
          background:linear-gradient(to bottom,${col}95,${col}00);
          transform:translate(-50%,-100%) rotate(${angle}deg);transform-origin:center 100%;"></div>`);
      }
      return `<div style="position:absolute;width:48px;height:48px;
        animation:wc-sun-rays ${duration} linear infinite;">${rays.join('')}</div>`;
    }
    if (['sun','extreme-heat'].includes(type)) {
      const rayCount=temp!==null&&temp>=35?12:10, rayCol=temp!==null&&temp>=38?'#FF6030':'#FFD060';
      const duration=temp!==null&&temp>=38?'35s':'50s', rayLength=temp!==null&&temp>=35?'20px':'26px';
      return `<div style="position:relative;width:48px;height:48px;">
        ${sunburstRays(rayCount,rayCol,duration,rayLength)}
        <div style="position:absolute;inset:0;animation:wc-breathe 4s ease-in-out infinite;transform:scale(1.05);">${iconHtml}</div>
      </div>`;
    }
    if (['dawn-clear','morning-clear','golden-clear'].includes(type)) {
      const rayCol=type==='golden-clear'?'#FF7020':'#FF9040';
      return `<div style="position:relative;width:48px;height:48px;">
        ${sunburstRays(6,rayCol,'80s','22px')}
        <div style="position:absolute;inset:0;animation:wc-breathe 5s ease-in-out infinite;">${iconHtml}</div>
      </div>`;
    }
    if (['night-clear','astro-dusk-clear','dusk-clear'].includes(type)) {
      return `<div style="animation:wc-breathe 5s ease-in-out infinite;">${iconHtml}</div>`;
    }
    return iconHtml;
  }

  // ── pill (context badge) ────────────────────────────────────────────────────
  _buildPill(type, rainClass, gustNum, uvNum, temp, moonPhase, isNight) {
    const mk = (text,bg,border,color) => ({text,bg,border,color});
    const mp = ((moonPhase%1)+1)%1;
    const getMoonPill = () => {
      if(mp<0.03||mp>0.97) return mk('🌑 Nów',          'rgba(60,80,140,0.22)','rgba(120,140,200,0.30)','#8899BB');
      if(mp<0.22)          return mk('🌒 Sierp rośnie', 'rgba(130,160,210,0.18)','rgba(190,210,240,0.25)','#C8D8F0');
      if(mp<0.28)          return mk('🌓 I kwadra',     'rgba(130,160,210,0.18)','rgba(190,210,240,0.25)','#C8D8F0');
      if(mp<0.47)          return mk('🌔 Garb rośnie',  'rgba(160,190,235,0.20)','rgba(190,210,240,0.28)','#C8D8F0');
      if(mp<0.53)          return mk('🌕 Pełnia',       'rgba(190,215,255,0.22)','rgba(215,228,248,0.35)','#DDE8F8');
      if(mp<0.72)          return mk('🌖 Garb maleje',  'rgba(130,160,210,0.18)','rgba(190,210,240,0.25)','#C8D8F0');
      if(mp<0.78)          return mk('🌗 III kwadra',   'rgba(130,160,210,0.18)','rgba(190,210,240,0.25)','#C8D8F0');
      return                      mk('🌘 Sierp maleje', 'rgba(60,80,140,0.22)', 'rgba(120,140,200,0.30)','#8899BB');
    };
    if(type==='aurora')        return mk('✦ Zorza polarna', 'rgba(0,180,100,0.20)','rgba(0,230,140,0.30)','#00E890');
    if(type==='blizzard')      return mk('❄ Zamieć',       'rgba(80,130,220,0.20)','rgba(174,228,248,0.32)','#AEE4F8');
    if(type==='freezing-rain') return mk('🌧 Szadź',        'rgba(50,110,200,0.20)','rgba(100,190,255,0.30)','#78BCFF');
    if(type==='extreme-heat')  return mk('🔥 Ekstr. upał', 'rgba(255,20,10,0.24)','rgba(255,59,48,0.38)','#FF3B30');
    if(type==='dawn-clear'||type==='astro-dawn') return mk('🌅 Świt','rgba(200,90,30,0.22)','rgba(255,140,60,0.38)','#FFA040');
    if(type==='morning-clear') return mk('🌤 Ranek','rgba(245,166,35,0.15)','rgba(245,200,60,0.25)','#F5C042');
    if(['golden-clear','cloud-golden','rain-golden','storm-golden'].includes(type))
      return mk('🌇 Złota godz.','rgba(210,80,20,0.22)','rgba(255,120,40,0.36)','#FF8030');
    if(['dusk-clear','cloud-dusk','rain-dusk','astro-dusk-clear'].includes(type))
      return mk('🌆 Zmierzch','rgba(40,70,180,0.22)','rgba(80,130,255,0.32)','#6090FF');
    if(['storm','storm-dawn','storm-golden','storm-night'].includes(type))
      return mk('⚡ Burza','rgba(255,200,0,0.16)','rgba(255,208,96,0.28)','#FFD060');
    if(type==='hail') return mk('🌨 Grad','rgba(90,130,200,0.18)','rgba(168,216,240,0.28)','#A8D8F0');
    if(temp!==null&&temp>=40) return mk('🔥 Ekstr. upał','rgba(255,30,10,0.22)','rgba(255,59,48,0.32)','#FF3B30');
    if(temp!==null&&temp>=35) return mk('🔥 Silny upał','rgba(255,60,20,0.18)','rgba(255,104,32,0.28)','#FF6820');
    if(temp!==null&&temp>=30) return mk('🌡 Upał','rgba(255,100,20,0.16)','rgba(255,159,10,0.26)','#FF9F0A');
    if(['rain','rain-dawn','rain-golden','rain-dusk','rain-night'].includes(type)){
      if(rainClass==='violent') return mk('🌧 Ulewa','rgba(30,90,200,0.22)','rgba(90,200,250,0.30)','#5AC8FA');
      if(rainClass==='heavy')   return mk('🌧 Silny deszcz','rgba(30,90,200,0.18)','rgba(90,200,250,0.25)','#5AC8FA');
      if(rainClass==='moderate')return mk('🌧 Deszcz','rgba(30,90,200,0.15)','rgba(90,200,250,0.22)','#5AC8FA');
      if(rainClass==='light')   return mk('🌦 Lekki deszcz','rgba(30,90,200,0.12)','rgba(120,170,210,0.22)','#7BAED4');
      return mk('🌦 Mżawka','rgba(30,90,200,0.09)','rgba(120,170,210,0.18)','#7BAED4');
    }
    if(['snow','snow-night'].includes(type)){
      if(temp!==null&&temp<=-15) return mk('❄ Ekstr. mróz','rgba(90,150,255,0.18)','rgba(174,228,248,0.28)','#AEE4F8');
      if(temp!==null&&temp<=-5)  return mk('❄ Silny mróz','rgba(90,150,255,0.15)','rgba(174,228,248,0.24)','#AEE4F8');
      return mk('❄ Mróz / śnieg','rgba(90,150,255,0.13)','rgba(174,228,248,0.22)','#AEE4F8');
    }
    if(['fog','fog-night'].includes(type)) return mk('🌫 Mgła','rgba(130,150,200,0.18)','rgba(136,153,187,0.28)','#8899BB');
    if(gustNum>=75) return mk('🌪 Huragan','rgba(80,140,220,0.22)','rgba(90,200,250,0.30)','#5AC8FA');
    if(gustNum>=60||['windy','windy-night'].includes(type)) return mk('💨 Wichura','rgba(80,140,220,0.16)','rgba(120,170,210,0.26)','#7BAED4');
    if(gustNum>=40) return mk('💨 Silny wiatr','rgba(80,140,220,0.13)','rgba(120,170,210,0.22)','#7BAED4');
    if(uvNum>=11) return mk('☀ UV ekstr.','rgba(180,30,30,0.22)','rgba(255,59,48,0.30)','#FF3B30');
    if(uvNum>=8)  return mk('☀ UV b. wysokie','rgba(255,60,40,0.16)','rgba(255,104,32,0.26)','#FF6820');
    if(uvNum>=6)  return mk('☀ UV wysokie','rgba(255,140,20,0.14)','rgba(255,159,10,0.22)','#FF9F0A');
    if(isNight) return getMoonPill();
    if(temp!==null&&temp<=0) return mk('🌨 Poniżej zera','rgba(90,150,255,0.13)','rgba(90,200,250,0.22)','#5AC8FA');
    if(temp!==null&&temp<=5) return mk('🌡 Zimno','rgba(90,150,255,0.11)','rgba(120,170,210,0.20)','#7BAED4');
    if(['sun','morning-clear'].includes(type)) return mk('☀ Słonecznie','rgba(245,166,35,0.13)','rgba(245,166,35,0.22)','#F5A623');
    return mk('☁ Pochmurno','rgba(110,130,165,0.15)','rgba(130,150,187,0.22)','#8899BB');
  }

  // ── particles (rain / snow / fog / stars) — seeded, cached per type ─────────
  _buildParticles(type, rainClass, windDeg, gustNum) {
    if (this._particles && this._lastType === type) return this._particles;
    this._lastType = type;

    let drops='', ripples='', snowFlakes='', fogStripes='', stars='', bgClouds='', auroraFx='';
    const rand = _wcRand(type.split('').reduce((a,c)=>a+c.charCodeAt(0),0));

    // ── rain drops ────────────────────────────────────────────────────────────
    const isRainType = ['rain','rain-dawn','rain-golden','rain-dusk','rain-night',
                         'storm','storm-dawn','storm-golden','storm-night','hail','freezing-rain'].includes(type);
    if (isRainType) {
      const isStorm=type.startsWith('storm'), isHail=type==='hail', isFR=type==='freezing-rain';
      const windDegNum = parseFloat(windDeg);
      const rainTilt = (!isNaN(windDegNum) && isRainType)
        ? (-Math.sin(windDegNum*Math.PI/180)*16).toFixed(1) : 0;
      const dc  = isStorm?80:isHail?25:rainClass==='violent'?70:rainClass==='heavy'?55:rainClass==='moderate'?40:rainClass==='light'?25:15;
      const wMin= isHail?4:isFR?1:isStorm||rainClass==='violent'?2.2:rainClass==='heavy'?1.8:rainClass==='moderate'?1.5:1.2;
      const hBase=isHail?4:isFR?10:isStorm||rainClass==='violent'?22:rainClass==='heavy'?18:rainClass==='moderate'?14:10;
      const dBase=isHail?0.55:isFR?0.9:isStorm||rainClass==='violent'?0.36:rainClass==='heavy'?0.44:rainClass==='moderate'?0.58:0.72;
      const br  = isHail?'50%':'2px';
      let dropCol, rippleCol;
      if(type==='rain-dawn')   {dropCol='rgba(160,140,200,0.50)';rippleCol='rgba(160,140,200,0.35)';}
      else if(type==='rain-golden'){dropCol='rgba(180,140,80,0.45)';rippleCol='rgba(180,140,80,0.30)';}
      else if(type==='rain-dusk') {dropCol='rgba(80,100,200,0.50)';rippleCol='rgba(80,100,200,0.35)';}
      else if(isFR)            {dropCol='rgba(160,210,255,0.65)';rippleCol='rgba(160,210,255,0.40)';}
      else                     {dropCol=`rgba(120,180,255,${rainClass==='drizzle'?'0.35':'0.52'})`;rippleCol='rgba(120,180,255,0.30)';}
      const dropsHTML = [];
      for(let i=0;i<dc;i++){
        const l=(rand()*112-6).toFixed(1), h=(hBase+rand()*hBase*(isHail?0.3:0.7)).toFixed(0);
        const dur=(dBase+rand()*dBase*0.7).toFixed(2), del=(rand()*2.2).toFixed(2);
        dropsHTML.push(`<div style="position:absolute;left:${l}%;top:-30px;width:${wMin}px;height:${h}px;
          background:${dropCol};border-radius:${br};
          animation:wc-fall ${dur}s ${del}s linear infinite;"></div>`);
      }
      drops = `<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:3;transform:rotate(${rainTilt}deg);transform-origin:top center;">${dropsHTML.join('')}</div>`;
      const rippleCount=isStorm?12:rainClass==='violent'?10:rainClass==='heavy'?8:6;
      const ripplesHTML = [];
      for(let i=0;i<rippleCount;i++){
        const rl=(rand()*90+5).toFixed(1),rdur=(1.2+rand()*0.8).toFixed(2),rdel=(rand()*3).toFixed(2);
        ripplesHTML.push(`<div style="position:absolute;left:${rl}%;bottom:8%;width:3px;height:3px;
          border:1px solid ${rippleCol};border-radius:50%;
          animation:wc-ripple ${rdur}s ${rdel}s ease-out infinite;"></div>`);
      }
      ripples = `<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:3;">${ripplesHTML.join('')}</div>`;
    }

    // ── snow ──────────────────────────────────────────────────────────────────
    if (['snow','snow-night','blizzard'].includes(type)) {
      const fast=type==='blizzard';
      const sfHTML=[];
      [[fast?15:12,1.5,2,0.35,2],[fast?25:18,2.5,2.5,0.70,0.5],[fast?20:12,3.5,3,0.92,0]].forEach(([cnt,sMin,sRange,op,blur])=>{
        for(let i=0;i<cnt;i++){
          const l=(rand()*110-5).toFixed(1),s=(sMin+rand()*sRange).toFixed(1);
          const dur=(fast?(sMin<2?2.5+rand()*1.5:sMin<3?1.5+rand()*1.2:0.8+rand()*0.8):(sMin<2?4+rand()*2.5:sMin<3?3+rand()*2:2+rand()*1.5)).toFixed(2);
          const del=(rand()*(fast?2:5)).toFixed(2),sw=fast?(rand()*60-30).toFixed(0):(rand()*30-15).toFixed(0);
          sfHTML.push(`<div style="position:absolute;left:${l}%;top:-12px;width:${s}px;height:${s}px;
            border-radius:50%;background:rgba(200,232,255,${op});--sw:${sw}px;--op:${op};
            ${blur?`filter:blur(${blur}px);`:''}
            animation:wc-snow ${dur}s ${del}s ease-in-out infinite,wc-bokeh ${2+blur*.5}s ease-in-out infinite;"></div>`);
        }
      });
      if(type==='blizzard'){
        for(let i=0;i<8;i++){
          const top=(5+i*12).toFixed(0);
          sfHTML.push(`<div style="position:absolute;top:${top}%;left:-5%;width:${(50+rand()*50).toFixed(0)}px;height:1px;
            background:rgba(200,225,255,0.28);border-radius:1px;filter:blur(0.5px);
            animation:wc-bliz-streak ${(0.3+rand()*0.25).toFixed(2)}s ${(rand()*0.8).toFixed(2)}s linear infinite;"></div>`);
        }
      }
      snowFlakes = `<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:3;">${sfHTML.join('')}</div>`;
    }

    // ── fog ───────────────────────────────────────────────────────────────────
    if (['fog','fog-night'].includes(type)) {
      const col1=type==='fog-night'?'rgba(80,100,170,0.28)':'rgba(140,170,210,0.32)';
      const col2=type==='fog-night'?'rgba(70,90,160,0.22)':'rgba(130,160,200,0.26)';
      const col3=type==='fog-night'?'rgba(60,80,150,0.18)':'rgba(120,150,190,0.20)';
      const fHTML=[];
      [[12,100,0,col3,12],[28,90,8,col3,12],[44,95,0,col3,12],
       [18,95,5,col2,8],[34,82,12,col2,8],[50,90,2,col2,8],
       [22,88,8,col1,5],[38,76,16,col1,5],[54,85,5,col1,5]].forEach(([top,w,left,col,blur],i)=>{
        const dur=(10-i*0.3).toFixed(1),del=(i*0.8).toFixed(1);
        fHTML.push(`<div style="position:absolute;top:${top}%;left:${left}%;width:${w}%;height:${6+blur/4}px;
          border-radius:8px;background:${col};filter:blur(${blur}px);
          animation:wc-fog ${dur}s ${del}s cubic-bezier(0.4,0,0.2,1) infinite,wc-fog-roll ${dur*.7}s ${del}s ease-in-out infinite;"></div>`);
      });
      fogStripes = `<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:3;">${fHTML.join('')}</div>`;
    }

    // ── stars (night clear / aurora) ──────────────────────────────────────────
    if (['night-clear','astro-dusk-clear','aurora'].includes(type)) {
      const sHTML=['<div style="position:absolute;inset:0;overflow:hidden;border-radius:24px;pointer-events:none;z-index:1;">'];
      [[type==='aurora'?15:12,'#A0B8D8',0.5,1,0.18,0.25,5,4],
       [type==='aurora'?18:15,'#C8D8F0',0.8,1.4,0.28,0.35,3.5,3.5],
       [type==='aurora'?10:8,'#E8F0FF',1.2,1.8,0.45,0.45,2.5,3]].forEach(([cnt,col,sMin,sRange,opMin,opRange,spdMin,spdRange])=>{
        for(let i=0;i<cnt;i++){
          const x=(rand()*88+2).toFixed(1),y=(rand()*65+2).toFixed(1);
          const s=(sMin+rand()*sRange).toFixed(1),op=(opMin+rand()*opRange).toFixed(2);
          const dl=(rand()*6).toFixed(1),spd=(spdMin+rand()*spdRange).toFixed(1);
          sHTML.push(`<div style="position:absolute;left:${x}%;top:${y}%;width:${s}px;height:${s}px;
            border-radius:50%;background:${col};--op:${op};
            animation:wc-twinkle ${spd}s ${dl}s cubic-bezier(0.4,0,0.2,1) infinite;"></div>`);
        }
      });
      const shootCount=type==='aurora'?2:1;
      for(let i=0;i<shootCount;i++){
        const sx=(rand()*60+10).toFixed(1),sy=(rand()*40+5).toFixed(1),sdel=(20+rand()*15).toFixed(1);
        sHTML.push(`<div style="position:absolute;left:${sx}%;top:${sy}%;width:2px;height:2px;
          border-radius:50%;background:#FFF;box-shadow:0 0 4px #C8D8F0;
          animation:wc-shoot 1.2s ${sdel}s ease-out infinite;"></div>`);
        sHTML.push(`<div style="position:absolute;left:${sx}%;top:${sy}%;width:20px;height:1px;
          background:linear-gradient(to right,rgba(255,255,255,0.8),transparent);
          transform-origin:left center;transform:rotate(35deg);
          animation:wc-shoot 1.2s ${sdel}s ease-out infinite;"></div>`);
      }
      sHTML.push('</div>');
      stars = sHTML.join('');
    }

    // ── aurora effect ─────────────────────────────────────────────────────────
    if (type==='aurora') {
      auroraFx = `<div style="position:absolute;inset:0;overflow:hidden;border-radius:24px;pointer-events:none;z-index:2;">
        ${[['rgba(0,200,100,0.28)','-20%','18%','130%','22px','5px','5s','0s'],
           ['rgba(0,160,200,0.20)','10%','28%','120%','18px','7px','6.5s','1.2s'],
           ['rgba(120,0,220,0.16)','40%','38%','90%','14px','9px','8s','0.6s'],
           ['rgba(0,220,120,0.18)','60%','22%','100%','20px','6px','7s','2s']].map(
          ([col,left,top,width,h,blur,dur,del])=>
          `<div style="position:absolute;left:${left};top:${top};width:${width};height:${h};border-radius:60%;
            background:${col};filter:blur(${blur});animation:wc-aurora ${dur} ${del} cubic-bezier(0.4,0,0.2,1) infinite;opacity:.8;"></div>`
        ).join('')}
      </div>`;
    }

    // ── background clouds ─────────────────────────────────────────────────────
    const cloudTypes=['cloud','partlycloudy','rain','rain-dawn','rain-golden','rain-dusk','rain-night',
                       'cloud-dawn','cloud-golden','cloud-dusk','cloud-night',
                       'storm','storm-dawn','storm-golden','storm-night','windy','windy-night','hail',
                       'snow','snow-night','freezing-rain','fog','fog-night'];
    if (cloudTypes.includes(type)) {
      const CC = {
        'cloud':        ['rgba(210,222,240,0.32)','rgba(190,208,232,0.22)','rgba(220,230,245,0.16)'],
        'partlycloudy': ['rgba(200,215,235,0.22)','rgba(180,200,225,0.14)','rgba(210,222,240,0.10)'],
        'cloud-dawn':   ['rgba(200,160,120,0.28)','rgba(180,130,90,0.18)','rgba(220,180,140,0.14)'],
        'cloud-golden': ['rgba(180,120,60,0.32)','rgba(160,100,50,0.22)','rgba(200,140,80,0.16)'],
        'cloud-dusk':   ['rgba(80,100,180,0.32)','rgba(60,80,160,0.22)','rgba(100,120,200,0.16)'],
        'cloud-night':  ['rgba(60,80,120,0.36)','rgba(45,62,100,0.24)','rgba(70,90,130,0.16)'],
        'rain':         ['rgba(80,120,185,0.40)','rgba(60,100,168,0.28)','rgba(90,130,195,0.20)'],
        'rain-dawn':    ['rgba(100,90,130,0.38)','rgba(80,70,110,0.26)','rgba(120,110,150,0.18)'],
        'rain-golden':  ['rgba(120,80,40,0.38)','rgba(100,60,30,0.26)','rgba(140,100,60,0.18)'],
        'rain-dusk':    ['rgba(50,70,160,0.40)','rgba(40,55,140,0.28)','rgba(60,85,175,0.20)'],
        'rain-night':   ['rgba(35,55,100,0.42)','rgba(25,42,85,0.30)','rgba(45,65,115,0.20)'],
        'storm':        ['rgba(30,36,52,0.65)','rgba(22,28,44,0.50)','rgba(40,48,64,0.35)'],
        'storm-dawn':   ['rgba(38,32,48,0.60)','rgba(28,24,38,0.44)','rgba(48,40,58,0.30)'],
        'storm-golden': ['rgba(40,28,18,0.60)','rgba(30,20,12,0.44)','rgba(50,36,24,0.30)'],
        'storm-night':  ['rgba(20,24,38,0.68)','rgba(14,18,30,0.52)','rgba(26,32,48,0.36)'],
        'hail':         ['rgba(72,110,175,0.42)','rgba(55,90,158,0.30)','rgba(82,120,185,0.22)'],
        'windy':        ['rgba(180,205,230,0.20)','rgba(160,188,218,0.14)','rgba(195,215,238,0.10)'],
        'windy-night':  ['rgba(50,70,120,0.30)','rgba(40,55,100,0.20)','rgba(60,80,130,0.14)'],
        'snow':         ['rgba(190,210,240,0.28)','rgba(170,195,228,0.18)','rgba(200,218,245,0.14)'],
        'snow-night':   ['rgba(60,80,130,0.30)','rgba(45,62,110,0.20)','rgba(70,92,140,0.14)'],
        'freezing-rain':['rgba(60,100,170,0.38)','rgba(45,82,150,0.26)','rgba(70,115,185,0.18)'],
        'fog':          ['rgba(160,180,210,0.30)','rgba(140,165,200,0.20)','rgba(170,190,220,0.14)'],
        'fog-night':    ['rgba(50,65,110,0.34)','rgba(40,52,94,0.22)','rgba(58,74,120,0.16)'],
      }[type];
      if (CC) {
        const wNum=parseFloat(gustNum)||8;
        const bDur=Math.max(8,40-wNum*0.35);
        const wdN=parseFloat(windDeg)||270;
        const dkf=((wdN+180)%360)<180?'wc-drift':'wc-drift-rtl';
        const layers=[[240,90,2,2.20,38],[200,75,8,1.85,34],[180,65,15,1.50,30],[220,80,6,1.25,26],
                       [165,60,22,1.00,22],[190,70,12,0.75,18],[150,55,28,0.55,14],[175,65,18,0.40,10]];
        const startX=['-15%','18%','48%','72%','35%','-8%','55%','28%'];
        const cHTML=['<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;">'];
        layers.forEach(([w,h,top,sm,blur],i)=>{
          const col=CC[i%CC.length],dur=(bDur*sm).toFixed(1),del=(-(parseFloat(dur)*(i*0.15+0.05))).toFixed(1);
          cHTML.push(`<div style="position:absolute;top:${top}%;left:${startX[i]};width:${w}px;height:${h}px;
            border-radius:50%;background:${col};filter:blur(${blur}px);
            animation:${dkf} ${dur}s ${del}s linear infinite;"></div>`);
        });
        cHTML.push('</div>');
        bgClouds = cHTML.join('');
      }
    }

    this._particles = { drops, ripples, snowFlakes, fogStripes, stars, bgClouds, auroraFx };
    return this._particles;
  }

  // ── fertilization done state (localStorage) ───────────────────────────────
  _fertilDoneKey(f) { return 'aha-fertil-done:' + f.date; }
  _isFertilDone(f) {
    try { return localStorage.getItem(this._fertilDoneKey(f)) !== null; } catch (e) { return false; }
  }
  _setFertilDone(f, done) {
    try {
      if (done) {
        // Store actual execution date (not just '1'), so garden-calendar can show it
        const today = new Date();
        const ds = today.getFullYear() + '-'
          + String(today.getMonth() + 1).padStart(2, '0') + '-'
          + String(today.getDate()).padStart(2, '0');
        localStorage.setItem(this._fertilDoneKey(f), ds);
      } else {
        localStorage.removeItem(this._fertilDoneKey(f));
      }
    } catch (e) {}
    this._render();
  }

  // ── fertilization banners ─────────────────────────────────────────────────
  _buildFertilBanners() {
    if (!this._fertilizations || !this._fertilizations.length) return '';
    const upcoming = this._fertilizations
      .map(f => ({ f, days: _daysUntil(f.date) }))
      .filter(({ days }) => days >= 0 && days <= 30)
      .sort((a, b) => a.days - b.days)
      .slice(0, 1);
    return upcoming.map(({ f, days }) => this._renderFertilBanner(f, days, this._isFertilDone(f))).join('');
  }

  _renderFertilBanner(f, days, done) {
    const isToday    = days === 0;
    const isTomorrow = days === 1;
    const isUrgent   = days <= 7;

    // accent: lush green
    let acR, acG, acB;
    if      (isToday)    { acR=80;  acG=200; acB=90; }
    else if (isTomorrow) { acR=100; acG=195; acB=80; }
    else if (isUrgent)   { acR=130; acG=200; acB=80; }
    else                 { acR=100; acG=180; acB=70; }

    // ── Done state — muted banner with undo ──────────────────────────────────
    if (done) {
      const doneCheckSVG = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="rgba(${acR},${acG},${acB},.45)" stroke-width="1.2" fill="rgba(${acR},${acG},${acB},.12)"/>
        <path d="M4 7l2 2 4-4" stroke="rgba(${acR},${acG},${acB},.80)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
      return `<div class="banner normal" style="opacity:.45;border-top:1px solid rgba(${acR},${acG},${acB},.20);">
        <div class="banner-inner">
          <div class="banner-icon sm" style="background:rgba(${acR},${acG},${acB},.08);border:1px solid rgba(${acR},${acG},${acB},.22);">
            ${doneCheckSVG}
          </div>
          <div class="banner-text">
            <div style="font-size:10px;font-weight:600;color:rgba(${acR},${acG},${acB},.75);text-transform:uppercase;letter-spacing:.06em;text-decoration:line-through;">${f.name}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.30);margin-top:1px;">Wykonano</div>
          </div>
          <button class="fertil-undo-btn" data-fertil-date="${f.date}"
            style="background:none;border:1px solid rgba(255,255,255,.18);border-radius:8px;
            padding:3px 8px;cursor:pointer;font-size:9px;font-weight:600;
            color:rgba(255,255,255,.35);font-family:-apple-system,system-ui,sans-serif;
            flex-shrink:0;white-space:nowrap;">cofnij</button>
        </div>
      </div>`;
    }

    // ── Check button (shared across all active variants) ────────────────────
    const acB2 = `rgba(${acR},${acG},${acB},0.35)`;
    const acL  = `rgba(${acR},${acG},${acB},0.18)`;
    const pillText = isToday?'dziś!':isTomorrow?'jutro':`${days} dni`;
    const iconSVG  = _fertilIconSVG(isToday?20:18, acR, acG, acB);
    const doneBtn  = `<button class="fertil-done-btn" data-fertil-date="${f.date}"
      title="Oznacz jako wykonane"
      style="background:none;border:1.5px solid rgba(${acR},${acG},${acB},.35);border-radius:50%;
      width:26px;height:26px;cursor:pointer;flex-shrink:0;display:flex;
      align-items:center;justify-content:center;padding:0;">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="rgba(${acR},${acG},${acB},.75)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>`;

    if (isToday) {
      const ac = `rgba(${acR},${acG},${acB},1)`;
      return `<div class="banner today" style="border-top:2px solid ${acB2};">
        <div class="banner-bg" style="background:${acL};"></div>
        <div class="banner-inner">
          <div class="banner-icon pulse" style="background:${acL};border:2px solid ${acB2};">
            ${iconSVG}
            <div class="icon-ring" style="border-color:rgba(${acR},${acG},${acB},0.40);"></div>
          </div>
          <div class="banner-text">
            <div style="font-size:12px;font-weight:600;color:${ac};text-transform:uppercase;letter-spacing:.05em;">🌱 ${f.name} — dziś!</div>
            <div style="font-size:10px;color:rgba(200,240,180,.75);margin-top:2px;">${f.description||''}</div>
          </div>
          <div class="banner-pill pulse" style="color:${ac};background:${acL};border:1.5px solid ${acB2};">${pillText}</div>
          ${doneBtn}
        </div>
      </div>`;
    }
    if (isTomorrow) {
      const ac = `rgba(${acR},${acG},${acB},1)`;
      return `<div class="banner tomorrow" style="border-top:2px solid ${acB2};background:rgba(${acR},${acG},${acB},.08);">
        <div class="banner-inner">
          <div class="banner-icon" style="background:rgba(${acR},${acG},${acB},.15);border:1.5px solid ${acB2};">
            ${iconSVG}
          </div>
          <div class="banner-text">
            <div style="font-size:11px;font-weight:600;color:${ac};text-transform:uppercase;letter-spacing:.05em;">🌱 Jutro: ${f.name}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.40);margin-top:1px;">${f.description||''}</div>
          </div>
          <div class="banner-pill pulse-slow" style="color:${ac};background:rgba(${acR},${acG},${acB},.18);border:1.5px solid ${acB2};">${pillText}</div>
          ${doneBtn}
        </div>
      </div>`;
    }
    if (isUrgent) {
      return `<div class="banner urgent" style="border-top:1px solid rgba(${acR},${acG},${acB},.30);background:rgba(${acR},${acG},${acB},.06);">
        <div class="banner-inner">
          <div class="banner-icon sm" style="background:rgba(${acR},${acG},${acB},.12);border:1px solid rgba(${acR},${acG},${acB},.35);">
            ${iconSVG}
          </div>
          <div class="banner-text">
            <div style="font-size:10px;font-weight:600;color:rgba(${acR},${acG},${acB},.85);text-transform:uppercase;letter-spacing:.06em;">🌱 ${f.name} za ${days} dni</div>
            <div style="font-size:10px;color:rgba(255,255,255,.38);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${f.description||''}</div>
          </div>
          <div class="banner-pill pulse-slow" style="font-size:11px;color:rgba(${acR},${acG},${acB},.85);background:rgba(${acR},${acG},${acB},.14);border:1px solid rgba(${acR},${acG},${acB},.35);">${pillText}</div>
          ${doneBtn}
        </div>
      </div>`;
    }
    return `<div class="banner normal">
      <div class="banner-inner">
        <div class="banner-icon sm" style="background:rgba(${acR},${acG},${acB},.10);border:1px solid rgba(${acR},${acG},${acB},.25);">
          ${iconSVG}
        </div>
        <div class="banner-text">
          <div style="font-size:10px;font-weight:600;color:rgba(${acR},${acG},${acB},.85);text-transform:uppercase;letter-spacing:.06em;">🌱 ${f.name}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${f.description||''}</div>
        </div>
        <div class="banner-pill" style="font-size:11px;color:rgba(${acR},${acG},${acB},.85);background:rgba(${acR},${acG},${acB},.12);border:1px solid rgba(${acR},${acG},${acB},.25);">${pillText}</div>
        ${doneBtn}
      </div>
    </div>`;
  }

  // ── extra effects ────────────────────────────────────────────────────────────
  _buildExtras(type, temp) {
    let godRays='', horizonGlow='', moonGlow='', lightning='', heatHaze='';
    if (['dawn-clear','morning-clear','golden-clear'].includes(type)) {
      const rayCol=type==='golden-clear'?'rgba(255,112,32,0.18)':'rgba(255,148,48,0.18)';
      const rays=[];
      for(let i=0;i<7;i++){
        const angle=-35+(i*12),width=(60+i*8),opacity=(0.12+i*0.014).toFixed(2),delay=(i*0.8).toFixed(1);
        rays.push(`<div style="position:absolute;bottom:-10%;left:50%;width:${width}px;height:140%;
          background:linear-gradient(to top,${rayCol} 0%,transparent 65%);
          transform:translateX(-50%) rotate(${angle}deg);transform-origin:center bottom;
          opacity:${opacity};animation:wc-god-ray 6s ${delay}s ease-in-out infinite;"></div>`);
      }
      godRays=`<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;">${rays.join('')}</div>`;
    }
    if (['dawn-clear','morning-clear'].includes(type)) {
      const col=type==='morning-clear'?'#FFC060':'#FF8030';
      horizonGlow=`<div style="position:absolute;bottom:0;left:-10%;right:-10%;height:45%;pointer-events:none;z-index:1;
        background:radial-gradient(ellipse at 50% 110%,${col}45 0%,${col}22 35%,transparent 70%);
        animation:wc-sun-pulse 4.5s cubic-bezier(0.4,0,0.2,1) infinite;"></div>`;
    }
    if (['golden-clear','cloud-golden','rain-golden','storm-golden'].includes(type)) {
      horizonGlow=`<div style="position:absolute;bottom:0;left:-10%;right:-10%;height:55%;pointer-events:none;z-index:1;
        background:radial-gradient(ellipse at 50% 110%,#FF501842 0%,#FF701820 40%,transparent 70%);
        animation:wc-sun-pulse 4s cubic-bezier(0.4,0,0.2,1) infinite;"></div>`;
    }
    if (['dusk-clear','astro-dusk-clear','cloud-dusk','rain-dusk'].includes(type)) {
      horizonGlow=`<div style="position:absolute;bottom:0;left:-10%;right:-10%;height:40%;pointer-events:none;z-index:1;
        background:radial-gradient(ellipse at 50% 110%,#30409038 0%,transparent 70%);
        animation:wc-moon-pulse 6s cubic-bezier(0.4,0,0.2,1) infinite;"></div>`;
    }
    if (['night-clear','astro-dusk-clear','cloud-night','fog-night','windy-night','snow-night','rain-night','storm-night','aurora'].includes(type)) {
      moonGlow=`<div style="position:absolute;width:64px;height:64px;border-radius:50%;
        background:radial-gradient(circle,rgba(180,210,255,0.22) 0%,transparent 70%);
        top:6px;right:6px;z-index:2;animation:wc-moon-pulse 5s cubic-bezier(0.4,0,0.2,1) infinite;pointer-events:none;"></div>`;
    }
    if (type.startsWith('storm')) {
      const lightCol=type==='storm-night'?'rgba(180,200,255,0.95)':'rgba(255,245,200,0.92)';
      const interval=type==='storm-night'?'10s':'12s';
      lightning=`<div style="position:absolute;inset:0;overflow:hidden;border-radius:24px;pointer-events:none;z-index:4;">
        <div style="position:absolute;top:10%;left:30%;width:180px;height:80px;border-radius:50%;
          background:radial-gradient(circle,${lightCol.replace('0.95','0.20').replace('0.92','0.18')} 0%,transparent 70%);
          filter:blur(20px);animation:wc-charge ${interval} infinite;"></div>
        <svg style="position:absolute;top:0;left:55%;width:3px;height:100%;animation:wc-lightning ${interval} infinite;" viewBox="0 0 3 300" fill="none">
          <path d="M1.5 0 L1.5 40 L2.2 60 L1.2 80 L2.0 100 L0.8 120 L1.5 150" stroke="${lightCol}" stroke-width="0.3" stroke-linecap="round"/>
          <path d="M1.5 60 L2.8 75" stroke="${lightCol}" stroke-width="0.15" stroke-linecap="round"/>
          <path d="M1.2 100 L0.2 115" stroke="${lightCol}" stroke-width="0.15" stroke-linecap="round"/>
        </svg>
        <div style="position:absolute;inset:0;background:${lightCol.replace('0.95','0.08').replace('0.92','0.06')};animation:wc-lightning ${interval} infinite;"></div>
      </div>`;
    }
    if (type==='extreme-heat') {
      const heatCol=_tempAccent(temp);
      heatHaze=`<div style="position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 70% 5%,${heatCol}35 0%,transparent 60%);animation:wc-heatwave 2.5s cubic-bezier(0.4,0,0.2,1) infinite;"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,${heatCol}18 0%,transparent 50%);animation:wc-heatwave 3.2s 0.8s cubic-bezier(0.4,0,0.2,1) infinite;"></div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:40%;background:linear-gradient(to top,${heatCol}22 0%,transparent 100%);animation:wc-heatwave 2.8s 0.4s cubic-bezier(0.4,0,0.2,1) infinite;"></div>
      </div>`;
    }
    return { godRays, horizonGlow, moonGlow, lightning, heatHaze };
  }

  // ── main render ──────────────────────────────────────────────────────────────
  _render() {
    if (!this._hass) return;
    const cfg = this._config;
    const {
      type, temp, tempStr, feels, feelsNum, tColor, trendStr, trendCol,
      humOut, pres, wind, gust, gustNum, windDir, windDirPl, windDeg,
      rainRate, rainRateNum, rainDay, rainClass,
      uv, uvNum, batV, moonPhase, ms,
      isNight, dayPhase,
    } = this._compute();

    const stationLabel = cfg.station_label || 'Ogród · Stacja główna';
    const now  = new Date();
    const time = _wcPad(now.getHours()) + ':' + _wcPad(now.getMinutes());

    // background color
    const BG = {
      'sun':              _tempDayBg(temp),
      'extreme-heat':     '#1E0303',
      'dawn-clear':       '#0C1525',
      'morning-clear':    '#131820',
      'astro-dawn':       '#090E1A',
      'golden-clear':     '#140C05',
      'dusk-clear':       '#0B0E1E',
      'astro-dusk-clear': '#070A14',
      'night-clear':      '#07090F',
      'partlycloudy':     _tempDayBg(temp),
      'cloud':            '#111620',
      'cloud-dawn':       '#0E1320',
      'cloud-golden':     '#12100A',
      'cloud-dusk':       '#0A0E1C',
      'cloud-night':      '#0A0D18',
      'rain':             '#0A1018',
      'rain-dawn':        '#0C1220',
      'rain-golden':      '#10100C',
      'rain-dusk':        '#080C18',
      'rain-night':       '#070A14',
      'snow':             '#0E1624',
      'snow-night':       '#0A1220',
      'blizzard':         '#080E1C',
      'freezing-rain':    '#070C18',
      'storm':            '#080C10',
      'storm-dawn':       '#0A0E14',
      'storm-golden':     '#0C0A08',
      'storm-night':      '#060810',
      'hail':             '#0C1020',
      'fog':              '#101520',
      'fog-night':        '#0A0E18',
      'windy':            '#101828',
      'windy-night':      '#0A1020',
      'aurora':           '#030508',
    };
    const bg = BG[type] ?? '#0f0f0f';

    const animIcon = this._buildAnimatedIcon(type, temp, ms);
    const pill     = this._buildPill(type, rainClass, gustNum, uvNum, temp, moonPhase, isNight);
    const pillHtml = pill
      ? `<div class="pill" style="background:${pill.bg};border:1px solid ${pill.border};color:${pill.color};">${pill.text}</div>`
      : '';

    const particles = this._buildParticles(type, rainClass, windDeg, gustNum);
    const extras    = this._buildExtras(type, temp);
    const batNum    = parseFloat(batV);
    const batWarn   = !isNaN(batNum) && batNum < 2.4
      ? `<div class="bat-warn">⚡ bateria ${batV}V</div>` : '';

    // stats bar (compact)
    const cVals = {
      'sun':          [humOut+'%', 'UV '+uv, wind+' km/h'],
      'extreme-heat': [humOut+'%', 'UV '+uv, feels+'° odcz.'],
      'dawn-clear':   [humOut+'%', pres+' hPa', wind+' km/h'],
      'morning-clear':[humOut+'%', 'UV '+uv, wind+' km/h'],
      'golden-clear': [humOut+'%', feels+'° odcz.', pres+' hPa'],
      'dusk-clear':   [humOut+'%', pres+' hPa', feels+'° odcz.'],
      'night-clear':  [humOut+'%', feels+'° odcz.', pres+' hPa'],
      'rain':         [humOut+'%', rainDay+' mm dziś', rainRate+' mm/h'],
      'blizzard':     [humOut+'%', gust+' km/h poryw', feels+'° odcz.'],
      'freezing-rain':[humOut+'%', rainRate+' mm/h', feels+'° odcz.'],
      'storm':        [humOut+'%', gust+' km/h poryw', rainDay+' mm'],
      'aurora':       [humOut+'%', feels+'° odcz.', pres+' hPa'],
      'fog':          [humOut+'%', pres+' hPa', feels+'° odcz.'],
      'windy':        [humOut+'%', wind+' km/h', gust+' km/h poryw'],
    };
    const vv = cVals[type] ?? [humOut+'%', pres+' hPa', wind+' km/h'];
    const compactStats = vv.map(v =>
      `<span class="stat-chip">${v}</span>`
    ).join('<span class="stat-sep">·</span>');

    const fertilBanners = this._buildFertilBanners();
    const hasFertilToday = this._fertilizations.some(f => _daysUntil(f.date) === 0);

    const css = `
      :host { display:block; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif; }

      @keyframes wc-fall        {0%{transform:translateY(-20px) translateX(0);opacity:0}8%{opacity:1}92%{opacity:.7}100%{transform:translateY(310px) translateX(-8px);opacity:0}}
      @keyframes wc-ripple      {0%{transform:scale(0);opacity:.6}100%{transform:scale(4);opacity:0}}
      @keyframes wc-sun-rays    {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes wc-sun-pulse   {0%,100%{transform:scale(1);opacity:.35}50%{transform:scale(1.15);opacity:.55}}
      @keyframes wc-heatwave    {0%{transform:translateY(0) scaleY(1)}33%{transform:translateY(-3px) scaleY(1.02)}66%{transform:translateY(2px) scaleY(.98)}100%{transform:translateY(0) scaleY(1)}}
      @keyframes wc-moon-pulse  {0%,100%{transform:scale(1);opacity:.28}50%{transform:scale(1.10);opacity:.42}}
      @keyframes wc-breathe     {0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.03);opacity:.92}}
      @keyframes wc-lightning   {0%,93%{opacity:0}94%{opacity:1}95%{opacity:0}96%{opacity:.8}97%,100%{opacity:0}}
      @keyframes wc-charge      {0%,90%{opacity:.2}92%{opacity:.6}94%,100%{opacity:.2}}
      @keyframes wc-snow        {0%{transform:translateY(-10px) translateX(0);opacity:0}12%{opacity:.88}88%{opacity:.55}100%{transform:translateY(310px) translateX(var(--sw,0px));opacity:0}}
      @keyframes wc-bokeh       {0%,100%{filter:blur(0px);opacity:var(--op,.7)}50%{filter:blur(2px);opacity:calc(var(--op,.7)*1.3)}}
      @keyframes wc-bliz-streak {from{transform:translateX(-10%)}to{transform:translateX(130%)}}
      @keyframes wc-drift       {from{transform:translateX(-180%)}to{transform:translateX(100%)}}
      @keyframes wc-drift-rtl   {from{transform:translateX(100%)}to{transform:translateX(-180%)}}
      @keyframes wc-twinkle     {0%,100%{opacity:var(--op,.4);transform:scale(1)}50%{opacity:calc(var(--op,.4)*2);transform:scale(1.2)}}
      @keyframes wc-shoot       {0%{transform:translateX(0) translateY(0);opacity:1}70%{opacity:.4}100%{transform:translateX(120px) translateY(80px);opacity:0}}
      @keyframes wc-fog         {0%,100%{opacity:.58;transform:translateX(0)}50%{opacity:.30;transform:translateX(15px)}}
      @keyframes wc-fog-roll    {0%{transform:translateY(10px);opacity:.3}50%{transform:translateY(-5px);opacity:.6}100%{transform:translateY(10px);opacity:.3}}
      @keyframes wc-aurora      {0%,100%{opacity:.58;transform:scaleX(1) translateY(0)}50%{opacity:.82;transform:scaleX(1.10) translateY(-6px)}}
      @keyframes wc-god-ray     {0%,100%{opacity:.15}50%{opacity:.35}}
      @keyframes breathe        {0%,100%{opacity:1}50%{opacity:.75}}
      @keyframes breathe-slow   {0%,100%{opacity:1}50%{opacity:.80}}
      @keyframes ring-pulse     {0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(1.3);opacity:0}}

      .card {
        background: ${bg};
        border-radius: 24px;
        padding: 18px 18px 16px;
        position: relative;
        overflow: hidden;
        min-height: 190px;
        display: flex;
        flex-direction: column;
        ${hasFertilToday ? 'border:1.5px solid rgba(80,200,90,.40);' : ''}
      }
      .content { position:relative; z-index:10; display:flex; flex-direction:column; flex:1; }
      .header  { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
      .station { font-size:11px; font-weight:600; color:rgba(255,255,255,.28); letter-spacing:.02em; }
      .header-right { display:flex; flex-direction:column; align-items:flex-end; gap:4px; }
      .pill { display:inline-flex; align-items:center; padding:3px 9px 3px 8px;
              border-radius:20px; font-size:10px; font-weight:600; letter-spacing:.02em;
              white-space:nowrap; line-height:1.4; }
      .time-label { font-size:10px; font-weight:500; color:rgba(255,255,255,.20); }

      .middle { flex:1; display:flex; align-items:flex-start; justify-content:space-between; padding-bottom:14px; }
      .temp-block { display:flex; flex-direction:column; justify-content:center; gap:0; }
      .temp-val   { font-size:80px; font-weight:700; letter-spacing:-5px; line-height:.90; color:${tColor}; }
      .feels-row  { font-size:12px; font-weight:500; color:rgba(255,255,255,.30); margin-top:6px; letter-spacing:.01em; }
      .trend-row  { font-size:11px; font-weight:600; color:${trendCol}; margin-top:3px; letter-spacing:.01em; }
      .icon-wrap  { width:52px; height:52px; display:flex; align-items:center; justify-content:center; opacity:.88; margin-top:2px; }

      .footer { display:flex; align-items:center; justify-content:center;
                padding-top:8px; border-top:1px solid rgba(255,255,255,0.07); flex-wrap:wrap; gap:2px; }
      .stat-chip { font-size:11px; font-weight:500; color:rgba(255,255,255,.38); white-space:nowrap; }
      .stat-sep  { color:rgba(255,255,255,.13); font-size:10px; margin:0 5px; }

      .bat-warn { position:absolute; bottom:10px; right:14px; font-size:10px;
                  font-weight:600; color:#FF9F0A; z-index:10; letter-spacing:.01em; }

      /* ── banners ────────────────────────────────────────────────────────── */
      .banner {
        margin-left:-18px; margin-right:-18px; margin-bottom:-16px;
        border-radius:0 0 24px 24px; position:relative; overflow:hidden;
      }
      .banner.today    { padding:12px 18px 16px; margin-top:10px; }
      .banner.tomorrow { padding:11px 18px 14px; margin-top:10px; }
      .banner.urgent   { padding:10px 18px 13px; margin-top:10px; }
      .banner.normal   { padding:10px 18px 12px; margin-top:11px; border-top:1px solid rgba(255,255,255,.07); }
      .banner-bg     { position:absolute; inset:0; animation:breathe 1.2s ease-in-out infinite; }
      .banner-inner  { position:relative; z-index:1; display:flex; align-items:center; gap:10px; }
      .banner-text   { flex:1; min-width:0; }
      .banner-icon   { width:34px; height:34px; border-radius:50%; flex-shrink:0;
                       display:flex; align-items:center; justify-content:center; position:relative; }
      .banner-icon.sm { width:28px; height:28px; }
      .banner-pill   { font-size:12px; font-weight:600; padding:4px 10px;
                       border-radius:10px; white-space:nowrap; flex-shrink:0; }
      .icon-ring     { position:absolute; inset:-4px; border-radius:50%; border:2px solid;
                       animation:ring-pulse 1.2s ease-in-out infinite; }
      .pulse         { animation:breathe 1.2s ease-in-out infinite; }
      .pulse-slow    { animation:breathe-slow 1.8s ease-in-out infinite; }
    `;

    this.shadowRoot.innerHTML = `
      <style>${css}</style>
      <div class="card">
        ${particles.bgClouds}
        ${particles.stars}
        ${particles.auroraFx}
        ${extras.godRays}
        ${extras.heatHaze}
        ${extras.moonGlow}
        ${extras.horizonGlow}
        ${extras.lightning}
        ${particles.drops}
        ${particles.ripples}
        ${particles.snowFlakes}
        ${particles.fogStripes}
        ${batWarn}
        <div class="content">
          <div class="header">
            <span class="station">${stationLabel}</span>
            <div class="header-right">
              ${pillHtml}
              <span class="time-label">${time}</span>
            </div>
          </div>
          <div class="middle">
            <div class="temp-block">
              <div class="temp-val">${tempStr}°</div>
              ${feelsNum!==null && temp!==null && Math.abs(feelsNum-temp)>=1
                ? `<div class="feels-row">Odcz. ${feels}°</div>` : ''}
              ${trendStr ? `<div class="trend-row">${trendStr}</div>` : ''}
            </div>
            <div class="icon-wrap">${animIcon}</div>
          </div>
          <div class="footer">${compactStats}</div>
          ${fertilBanners}
        </div>
      </div>`;

    // Attach fertil done/undo buttons (must be after innerHTML set)
    this.shadowRoot.querySelectorAll('.fertil-done-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const f = this._fertilizations.find(x => x.date === btn.dataset.fertilDate);
        if (f) this._setFertilDone(f, true);
      });
    });
    this.shadowRoot.querySelectorAll('.fertil-undo-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const f = this._fertilizations.find(x => x.date === btn.dataset.fertilDate);
        if (f) this._setFertilDone(f, false);
      });
    });
  }

  getCardSize() { return 4; }

  static getConfigElement() {
    return document.createElement('div');
  }

  static getStubConfig() {
    return {
      entity:           'weather.forecast_home',
      temp_entity:      'sensor.stacja_pogodowa_outdoor_temperature',
      feels_entity:     'sensor.stacja_pogodowa_feels_like_temperature',
      humidity_entity:  'sensor.stacja_pogodowa_humidity',
      pressure_entity:  'sensor.stacja_pogodowa_relative_pressure',
      wind_entity:      'sensor.stacja_pogodowa_wind_speed',
      gust_entity:      'sensor.stacja_pogodowa_wind_gust',
      wind_dir_entity:  'sensor.stacja_pogodowa_wind_direction',
      rain_rate_entity: 'sensor.stacja_pogodowa_rain_rate_piezo',
      rain_day_entity:  'sensor.stacja_pogodowa_daily_rain_piezo',
      uv_entity:        'sensor.stacja_pogodowa_uv_index',
      battery_entity:   'sensor.stacja_pogodowa_wh90_battery',
      forecast_entity:  'sensor.forecast_hourly_json',
      station_label:    'Ogród · Stacja główna',
      fertilizations:   [
        { date: '2026-05-20', name: 'Nawóz wiosenny', description: 'Florovit Trawnik, 30g/m²' },
        { date: '2026-07-01', name: 'Nawóz letni',    description: 'N-P-K 12-6-18, 25g/m²' },
      ],
    };
  }
}

customElements.define('aha-weather-card', AhaWeatherCard);
// legacy alias
if (!customElements.get('weather-card')) {
  customElements.define('weather-card', class extends AhaWeatherCard {});
}
