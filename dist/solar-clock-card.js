// solar-clock-card.js
// Place in: /config/www/solar-clock-card.js
// Resource: url: /local/solar-clock-card.js  type: module

const LAT = 52.40, LON = 16.87;
const SHOW_PLANETS = true;

const DAYS   = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];
const MONTHS = ['stycznia','lutego','marca','kwietnia','maja','czerwca',
                'lipca','sierpnia','września','października','listopada','grudnia'];
const pad = n => String(n).padStart(2,'0');

// ─── SUN MATH ────────────────────────────────────────────────────────────────

function dayOfYear(d){ return Math.floor((d - new Date(d.getFullYear(),0,0)) / 86400000); }

function solarElev(date, lat, lon, hour) {
  const d2 = new Date(date);
  d2.setHours(Math.floor(hour), Math.floor((hour%1)*60), Math.floor(((hour*60)%1)*60), 0);
  const doy = dayOfYear(d2);
  const decl = 23.45 * Math.sin(Math.PI/180 * (360/365*(doy-81)));
  const B = (360/365*(doy-81)) * Math.PI/180;
  const eot = 9.87*Math.sin(2*B) - 7.53*Math.cos(B) - 1.5*Math.sin(B);
  const tz = -d2.getTimezoneOffset()/60;
  const noon = 12*60 - 4*(lon - 15*tz) - eot;
  const ha = (hour*60 - noon) / 4;
  const sinE = Math.sin(lat*Math.PI/180)*Math.sin(decl*Math.PI/180)
             + Math.cos(lat*Math.PI/180)*Math.cos(decl*Math.PI/180)*Math.cos(ha*Math.PI/180);
  return Math.asin(Math.max(-1, Math.min(1, sinE))) * 180/Math.PI;
}

function findCross(date, lat, lon, rising) {
  let br = null;
  for (let h = 0; h < 24; h += 1/60) {
    const p = solarElev(date, lat, lon, h-1/60), c = solarElev(date, lat, lon, h);
    if (rising && p<0 && c>=0) { br=[h-1/60,h]; break; }
    if (!rising && p>=0 && c<0) { br=[h-1/60,h]; break; }
  }
  if (!br) return null;
  let lo=br[0], hi=br[1];
  for (let i=0; i<8; i++) {
    const mid=(lo+hi)/2, e=solarElev(date,lat,lon,mid);
    if (rising){ if(e<0)lo=mid; else hi=mid; }
    else        { if(e>=0)lo=mid; else hi=mid; }
  }
  return (lo+hi)/2;
}

function fmtH(h) {
  if (h===null) return '—';
  const hh=Math.floor(h), mm=Math.round((h-hh)*60);
  const m2=mm===60?0:mm, h2=mm===60?hh+1:hh;
  return pad(h2)+':'+pad(m2);
}

// ─── PLANETS ─────────────────────────────────────────────────────────────────

function julianDay(date){ return date.getTime()/86400000 + 2440587.5; }

function planetPosition(name, date, lat, lon) {
  const JD = julianDay(date);
  const T = (JD-2451545.0)/36525;
  const d = JD - 2451543.5;
  const planets = {
    Merkury:{e:0.20563,L0:252.251,Ldot:4.09234,w:77.456},
    Wenus:  {e:0.00677,L0:181.980,Ldot:1.60214,w:131.564},
    Mars:   {e:0.09340,L0:355.433,Ldot:0.52403,w:336.060},
    Jowisz: {e:0.04839,L0:34.396, Ldot:0.08309,w:14.728},
    Saturn: {e:0.05415,L0:49.954, Ldot:0.03346,w:92.432},
  };
  const p = planets[name]; if (!p) return null;
  const L = ((p.L0 + p.Ldot*d)%360+360)%360;
  const M = (L - p.w + 360) % 360;
  const Mr = M*Math.PI/180;
  const C = (2*p.e - p.e**3/4)*Math.sin(Mr) + (5/4)*p.e**2*Math.sin(2*Mr) + (13/12)*p.e**3*Math.sin(3*Mr);
  const lon_ecl = (L + C*180/Math.PI + 360) % 360;
  const eps = 23.4393 - 0.0130*T;
  const er = eps*Math.PI/180, lr = lon_ecl*Math.PI/180;
  const RA = Math.atan2(Math.sin(lr)*Math.cos(er), Math.cos(lr)) * 180/Math.PI;
  const Dec = Math.asin(Math.sin(er)*Math.sin(lr)) * 180/Math.PI;
  const LST0 = 100.4606 + 36000.7701*T + lon/15;
  const nowH2 = date.getHours() + date.getMinutes()/60 + date.getSeconds()/3600;
  const LST = ((LST0 + nowH2*15)%360+360)%360;
  const HA = ((LST - RA)%360+360)%360;
  const HAr=HA*Math.PI/180, latr=lat*Math.PI/180, Decr=Dec*Math.PI/180;
  const sinAlt = Math.sin(latr)*Math.sin(Decr) + Math.cos(latr)*Math.cos(Decr)*Math.cos(HAr);
  const alt = Math.asin(Math.max(-1,Math.min(1,sinAlt))) * 180/Math.PI;
  const cosAlt = Math.cos(alt*Math.PI/180);
  const cosAz = cosAlt>0.0001 ? (Math.sin(Decr) - Math.sin(latr)*sinAlt)/(Math.cos(latr)*cosAlt) : 0;
  const azRaw = Math.acos(Math.max(-1,Math.min(1,cosAz))) * 180/Math.PI;
  const az = Math.sin(HAr)>0 ? 360-azRaw : azRaw;
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  const dir = dirs[Math.round(az/45)%8];
  const magMap = {Merkury:-0.5,Wenus:-4.0,Mars:0.5,Jowisz:-2.5,Saturn:0.8};
  return { alt:Math.round(alt*10)/10, az:Math.round(az), dir, mag:magMap[name], visible:alt>5 };
}

const PLANET_NAMES   = ['Wenus','Jowisz','Mars','Saturn','Merkury'];
const PLANET_SYMBOLS = {Wenus:'♀',Jowisz:'♃',Mars:'♂',Saturn:'♄',Merkury:'☿'};
const PLANET_COLORS  = {Wenus:'255,220,80',Jowisz:'255,195,120',Mars:'255,100,60',Saturn:'215,175,80',Merkury:'150,195,220'};

// ─── EVENTS ──────────────────────────────────────────────────────────────────

const EVENTS = [
  { date:'2026-04-22', type:'meteors',     label:'Liridy',                    sublabel:'Do 20 meteorów/h · korzystne warunki (księżyc 27%)', sublabelToday:'Maksimum Lirydów tej nocy · ok. 20 meteorów/h · księżyc umiarkowany', sublabelTomorrow:'Jutro noc: Liridy · 20 meteorów/h · wyjdź po północy', hasMeteors:false },
  { date:'2026-06-09', type:'conjunction', label:'Koniunkcja Wenus i Jowisza', sublabel:'Dwie najjaśniejsze planety ~1.6° od siebie · wieczór na zachodzie', sublabelToday:'Wenus i Jowisz dziś wieczór ~1.6° od siebie — spektakularny widok!', sublabelTomorrow:'Jutro wieczór: Wenus + Jowisz razem na niebie — najjaśniejsza para!', hasMeteors:false },
  { date:'2026-08-12', type:'eclipse',     label:'Zaćmienie Słońca',          sublabel:'~80% tarczy w Polsce · godz. 19:15 · całkowite w Hiszpanii', sublabelToday:'Start 19:15 · max 19:56 (~80%) · nie patrz bez okularów ISO 12312-2', sublabelTomorrow:'Jutro godz. 19:15 · ~80% tarczy · kup okulary ISO 12312-2', hasMeteors:true },
  { date:'2026-08-12', type:'meteors',     label:'Perseidy 2026',             sublabel:'Do 60 meteorów/h · bezksiężycowa noc — idealne warunki!', sublabelToday:'Perseidy + zaćmienie tej samej nocy! 60/h · nów — czarne niebo', sublabelTomorrow:'Jutro noc: Perseidy 60/h + zaćmienie Słońca — wyjątkowa noc!', hasMeteors:false },
  { date:'2026-08-28', type:'lunar_eclipse', label:'Zaćmienie Księżyca',      sublabel:'Częściowe ~96% · widoczne z Polski · godz. 04:12', sublabelToday:'Częściowe zaćmienie 96% — wschodzi czerwonawy Księżyc · godz. 04:12', sublabelTomorrow:'Jutro rano godz. 04:12 · częściowe zaćmienie 96% · bez sprzętu', hasMeteors:false },
  { date:'2026-10-04', type:'planet',      label:'Saturn w opozycji',         sublabel:'Pierścienie pod kątem 10° · najlepszy czas na obserwację', sublabelToday:'Saturn dziś w opozycji — najjaśniejszy w roku · pierścienie coraz lepiej widoczne', sublabelTomorrow:'Jutro Saturn w opozycji — szukaj go przez lornetkę', hasMeteors:false },
  { date:'2026-10-21', type:'meteors',     label:'Orionidy',                  sublabel:'Do 20 meteorów/h · księżyc 72% — obserwuj po 2:00', sublabelToday:'Maksimum Orionidów · 20/h · najlepiej po godz. 02:00 gdy księżyc zajdzie', sublabelTomorrow:'Jutro noc: Orionidy 20/h · wyjdź po godz. 02:00', hasMeteors:false },
  { date:'2026-11-12', type:'meteors',     label:'Taurydy Północne',          sublabel:'Wolne, jasne bolidy · księżyc 7% — prawie idealne warunki', sublabelToday:'Taurydy Północne — wolne efektowne bolidy · ciemne niebo', sublabelTomorrow:'Jutro noc: Taurydy — jasne powolne bolidy, warto wyglądać', hasMeteors:false },
  { date:'2026-11-15', type:'conjunction', label:'Koniunkcja Marsa i Jowisza',sublabel:'Tuż przed świtem · południe nieba · łatwa do obserwacji', sublabelToday:'Mars i Jowisz blisko siebie dziś przed świtem · patrz na południe', sublabelTomorrow:'Jutro przed świtem: Mars + Jowisz w bliskiej koniunkcji', hasMeteors:false },
  { date:'2026-11-17', type:'meteors',     label:'Leonidy',                   sublabel:'Do 15 meteorów/h · księżyc 45% · obserwuj po 01:00', sublabelToday:'Maksimum Leonidów · szybkie meteory z Lwa · wyjdź po 01:00', sublabelTomorrow:'Jutro noc: Leonidy · 15/h · wyjdź po godz. 01:00', hasMeteors:false },
  { date:'2026-11-24', type:'moon',        label:'Superksiężyc — listopad',   sublabel:'Drugi superksiężyc 2026 · wyraźnie większy i jaśniejszy', sublabelToday:'Dziś superksiężyc! Księżyc wyjątkowo blisko Ziemi — obserwuj wschód', sublabelTomorrow:'Jutro superksiężyc listopadowy · wyjdź na wschód księżyca', hasMeteors:false },
  { date:'2026-12-13', type:'meteors',     label:'Geminidy 2026',             sublabel:'Do 120 meteorów/h · księżyc 21% — doskonałe warunki!', sublabelToday:'Geminidy — NAJLEPSZY rój roku! 120/h · prawie ciemne niebo · WYJDŹ!', sublabelTomorrow:'Jutro noc: Geminidy 120/h · księżyc nie przeszkadza — nie przegap!', hasMeteors:false },
  { date:'2026-12-23', type:'moon',        label:'Superksiężyc — rekord 2026',sublabel:'Najbliższy księżyc od 2019 r. · 221 668 km od Ziemi', sublabelToday:'Rekordowy superksiężyc! Największy i najjaśniejszy od 2019 r. — wyjdź na zewnątrz!', sublabelTomorrow:'Jutro rekordowy superksiężyc 2026 · najbliższy od 7 lat!', hasMeteors:false },
  { date:'2027-01-03', type:'meteors',     label:'Kwadrantydy 2027',          sublabel:'Do 80 meteorów/h · księżyc 20% — dobre warunki', sublabelToday:'Kwadrantydy — ostry szczyt kilka godzin! 80/h · obserwuj ok. 03:00', sublabelTomorrow:'Jutro 3 stycznia: Kwadrantydy 80/h · szczyt trwa tylko kilka godzin', hasMeteors:false },
  { date:'2027-08-02', type:'eclipse',     label:'Zaćmienie Słońca 2027',     sublabel:'Najdłuższe w XXI w. · 6 min 23 s · Egipt, S. Hiszpania', sublabelToday:'Całkowite zaćmienie — najdłuższe w XXI w. · nie patrz bez okularów', sublabelTomorrow:'Jutro zaćmienie 2027 · całkowite w Egipcie 6 min 23 s', hasMeteors:false },
  { date:'2027-08-12', type:'meteors',     label:'Perseidy 2027',             sublabel:'Do 100 meteorów/h · sprawdź fazę księżyca', sublabelToday:'Perseidy 2027 · do 100 meteorów/h · klasyczna letnia noc', sublabelTomorrow:'Jutro noc: Perseidy 2027 · do 100/h', hasMeteors:false },
  { date:'2031-11-17', type:'meteors',     label:'Leonidy 2031 — HISTORYCZNE!',sublabel:'Możliwy deszcz meteorów · Tempel-Tuttle w peryhelium!', sublabelToday:'Leonidy 2031 — możliwe tysiące meteorów/h! Obserwuj całą noc!', sublabelTomorrow:'Jutro Leonidy 2031 — możliwy deszcz stulecia!', hasMeteors:false },
];

function daysUntil(dateStr) {
  const target = new Date(dateStr); target.setHours(0,0,0,0);
  const today  = new Date();         today.setHours(0,0,0,0);
  return Math.round((target - today) / 86400000);
}

// ─── ICON GENERATORS ─────────────────────────────────────────────────────────

function typeTheme(type) {
  switch(type) {
    case 'eclipse':       return {r:255,g:190,b:50};
    case 'lunar_eclipse': return {r:255,g:80, b:80};
    case 'meteors':       return {r:160,g:100,b:255};
    case 'conjunction':   return {r:80, g:200,b:255};
    case 'planet':        return {r:60, g:200,b:160};
    case 'moon':          return {r:220,g:200,b:100};
    default:              return {r:160,g:160,b:160};
  }
}

function eventIcon(type, size, ac) {
  const r = size/2, c = ac;
  switch(type) {
    case 'eclipse':
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
        <circle cx="${r*0.78}" cy="${r}" r="${r*0.62}" fill="${c.replace('1)','0.28)')}" stroke="${c}" stroke-width="${r*0.14}"/>
        <circle cx="${r*1.5}" cy="${r}" r="${r*0.62}" fill="rgba(8,12,28,0.92)"/></svg>`;
    case 'lunar_eclipse':
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
        <circle cx="${r}" cy="${r}" r="${r*0.72}" fill="${c.replace('1)','0.22)')}" stroke="${c}" stroke-width="${r*0.13}"/>
        <circle cx="${r*0.72}" cy="${r*0.68}" r="${r*0.16}" fill="${c.replace('1)','0.45)')}"/></svg>`;
    case 'meteors':
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
        <line x1="${size*.75}" y1="${size*.08}" x2="${size*.18}" y2="${size*.65}" stroke="rgba(180,130,255,.95)" stroke-width="${size*.10}" stroke-linecap="round"/>
        <line x1="${size*.50}" y1="${size*.20}" x2="${size*.05}" y2="${size*.75}" stroke="rgba(160,110,255,.75)" stroke-width="${size*.08}" stroke-linecap="round"/>
        <circle cx="${size*.82}" cy="${size*.16}" r="${size*.10}" fill="rgba(230,200,255,.95)"/>
        <circle cx="${size*.55}" cy="${size*.26}" r="${size*.07}" fill="rgba(210,175,255,.80)"/></svg>`;
    case 'conjunction':
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
        <circle cx="${r*.6}" cy="${r}" r="${r*.42}" fill="${c.replace('1)','0.25)')}" stroke="${c}" stroke-width="${r*.12}"/>
        <circle cx="${r*1.45}" cy="${r}" r="${r*.30}" fill="${c.replace('1)','0.18)')}" stroke="${c.replace('1)','0.72)')}" stroke-width="${r*.10}"/></svg>`;
    case 'planet':
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
        <circle cx="${r}" cy="${r}" r="${r*.52}" fill="${c.replace('1)','0.22)')}" stroke="${c}" stroke-width="${r*.12}"/>
        <ellipse cx="${r}" cy="${r}" rx="${r*.90}" ry="${r*.22}" fill="none" stroke="${c.replace('1)','0.55)')}" stroke-width="${r*.09}"/></svg>`;
    case 'moon':
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
        <circle cx="${r}" cy="${r}" r="${r*.75}" fill="${c.replace('1)','0.20)')}" stroke="${c}" stroke-width="${r*.13}"/>
        <circle cx="${r*.72}" cy="${r*.68}" r="${r*.15}" fill="${c.replace('1)','0.38)')}"/>
        <circle cx="${r*1.25}" cy="${r*1.22}" r="${r*.10}" fill="${c.replace('1)','0.25)')}"/></svg>`;
    default:
      return '';
  }
}

// ─── BACKGROUND ──────────────────────────────────────────────────────────────

function generateDynamicBg(elev, temp, weather, phase) {
  let c1, c2, c3;
  if (elev < -18) { c1='#010204'; c2='#020408'; c3='#030610'; }
  else if (elev < -12) {
    const t=(elev+18)/6;
    if (phase.includes('R')) {
      c1=`rgb(${2+Math.floor(t*4)},${4+Math.floor(t*6)},${14+Math.floor(t*12)})`;
      c2=`rgb(${5+Math.floor(t*8)},${8+Math.floor(t*12)},${24+Math.floor(t*20)})`;
      c3=`rgb(${3+Math.floor(t*5)},${6+Math.floor(t*8)},${16+Math.floor(t*14)})`;
    } else { c1='#030410'; c2='#060618'; c3='#040512'; }
  }
  else if (elev < -6) {
    const t=(elev+12)/6;
    if (phase.includes('R')) {
      c1=`rgb(${6+Math.floor(t*20)},${10+Math.floor(t*15)},${26+Math.floor(t*30)})`;
      c2=`rgb(${7+Math.floor(t*35)},${12+Math.floor(t*20)},${44+Math.floor(t*40)})`;
      c3=`rgb(${5+Math.floor(t*18)},${8+Math.floor(t*12)},${24+Math.floor(t*28)})`;
    } else {
      c1=`rgb(${26-Math.floor(t*20)},${16-Math.floor(t*10)},${24-Math.floor(t*14)})`;
      c2=`rgb(${44-Math.floor(t*32)},${28-Math.floor(t*18)},${30-Math.floor(t*20)})`;
      c3=`rgb(${22-Math.floor(t*16)},${18-Math.floor(t*12)},${22-Math.floor(t*14)})`;
    }
  }
  else if (elev < 0) {
    const t=(elev+6)/6;
    if (phase.includes('R')) {
      c1=`rgb(${Math.floor(6+t*18)},${Math.floor(7+t*18)},${Math.floor(24+t*14)})`;
      c2=`rgb(${Math.floor(20+t*34)},${Math.floor(10+t*30)},${Math.floor(38+t*8)})`;
      c3=`rgb(${Math.floor(30+t*24)},${Math.floor(12+t*18)},${Math.floor(8+t*10)})`;
    } else {
      c1=`rgb(${Math.floor(28-t*8)},${Math.floor(6+t*6)},${Math.floor(6+t*2)})`;
      c2=`rgb(${Math.floor(60-t*20)},${Math.floor(14-t*4)},${Math.floor(8+t*2)})`;
      c3=`rgb(${Math.floor(24-t*6)},${Math.floor(6+t*4)},${Math.floor(6+t*10)})`;
    }
  }
  else if (elev < 4) {
    const t=elev/4;
    if (phase.includes('R')) {
      c1=`rgb(${Math.floor(24+t*30)},${Math.floor(25+t*20)},${Math.floor(38-t*18)})`;
      c2=`rgb(${Math.floor(54+t*50)},${Math.floor(40+t*30)},${Math.floor(46-t*26)})`;
      c3=`rgb(${Math.floor(54+t*40)},${Math.floor(30+t*25)},${Math.floor(18-t*8)})`;
    } else {
      c1=`rgb(${Math.floor(28-t*8)},${Math.floor(12-t*6)},${Math.floor(8-t*2)})`;
      c2=`rgb(${Math.floor(60-t*20)},${Math.floor(14-t*8)},${Math.floor(10-t*4)})`;
      c3=`rgb(${Math.floor(24-t*6)},${Math.floor(10-t*4)},${Math.floor(16+t*4)})`;
    }
  }
  else {
    let r1=4,g1=12,b1=32,r2=7,g2=18,b2=48;
    if (temp !== null) {
      if (temp>=30){ r1+=Math.floor((temp-30)*.8); g1+=Math.floor((temp-30)*.4); r2+=Math.floor((temp-30)*1.2); g2+=Math.floor((temp-30)*.6); }
      else if (temp<=5){ b1+=Math.floor((5-temp)*.6); b2+=Math.floor((5-temp)*1.0); }
    }
    c1=`rgb(${r1},${g1},${b1})`; c2=`rgb(${r2},${g2},${b2})`;
    c3=`rgb(${Math.floor(r1*.8)},${Math.floor(g1*.9)},${Math.floor(b1*1.1)})`;
  }
  if (['rainy','pouring','lightning','lightning-rainy'].includes(weather)) {
    const dim = s => s.replace(/rgb\((\d+),(\d+),(\d+)\)/,(m,r,g,b)=>`rgb(${Math.floor(r*.7)},${Math.floor(g*.7)},${Math.floor(b*.8)})`);
    c1=dim(c1); c2=dim(c2);
  } else if (weather==='cloudy') {
    const dim = s => s.replace(/rgb\((\d+),(\d+),(\d+)\)/,(m,r,g,b)=>`rgb(${Math.floor(r*.85)},${Math.floor(g*.85)},${Math.floor(b*.90)})`);
    c1=dim(c1);
  }
  return `linear-gradient(158deg,${c1} 0%,${c2} 50%,${c3} 100%)`;
}

// ─── SUN GLOW STYLE ──────────────────────────────────────────────────────────

function sunStyle(e, r) {
  if (e<-18) return {col:'rgba(120,148,220,.90)',rad:3.2,rings:[{rx:9,op:.18,c:'rgba(100,130,210,1)'}]};
  if (e<-12) return {col:r?'rgba(55,70,155,.70)':'rgba(50,50,140,.70)',rad:2.8,rings:[{rx:8,op:.18,c:r?'rgba(65,85,195,1)':'rgba(58,58,175,1)'}]};
  if (e<-6)  return {col:r?'rgba(68,105,210,.88)':'rgba(138,62,210,.88)',rad:3.5,rings:[{rx:13,op:.12,c:r?'rgba(68,105,230,1)':'rgba(155,55,230,1)'},{rx:7,op:.28,c:r?'rgba(78,118,240,1)':'rgba(168,62,240,1)'}]};
  if (e<0)   return {col:r?'rgba(255,145,45,.95)':'rgba(255,72,32,.95)',rad:4.8,rings:[{rx:24,op:.04,c:r?'rgba(255,148,42,1)':'rgba(255,75,28,1)'},{rx:15,op:.10,c:r?'rgba(255,158,55,1)':'rgba(255,88,38,1)'},{rx:9,op:.24,c:r?'rgba(255,172,72,1)':'rgba(255,105,52,1)'}]};
  if (e<4)   return {col:r?'rgba(255,215,90,1)':'rgba(255,128,42,1)',rad:6.8,rings:[{rx:44,op:.025,c:r?'rgba(255,205,55,1)':'rgba(255,105,25,1)'},{rx:30,op:.06,c:r?'rgba(255,212,68,1)':'rgba(255,118,35,1)'},{rx:20,op:.135,c:r?'rgba(255,220,88,1)':'rgba(255,135,50,1)'},{rx:12,op:.26,c:r?'rgba(255,228,112,1)':'rgba(255,155,68,1)'}]};
  if (e<13)  return {col:'rgba(255,235,108,1)',rad:5.5,rings:[{rx:32,op:.035,c:'rgba(255,225,55,1)'},{rx:22,op:.082,c:'rgba(255,230,75,1)'},{rx:14,op:.185,c:'rgba(255,238,105,1)'},{rx:8,op:.355,c:'rgba(255,244,145,1)'}]};
  if (e<40)  return {col:'rgba(255,248,175,1)',rad:5.0,rings:[{rx:26,op:.038,c:'rgba(255,240,88,1)'},{rx:17,op:.09,c:'rgba(255,244,110,1)'},{rx:11,op:.20,c:'rgba(255,248,148,1)'},{rx:6.5,op:.385,c:'rgba(255,252,195,1)'}]};
  return {col:'rgba(255,254,225,1)',rad:5.8,rings:[{rx:30,op:.04,c:'rgba(255,250,168,1)'},{rx:20,op:.092,c:'rgba(255,252,185,1)'},{rx:13,op:.20,c:'rgba(255,253,205,1)'},{rx:8,op:.395,c:'rgba(255,255,228,1)'}]};
}

// ─── THEME ───────────────────────────────────────────────────────────────────

const TH = {
  night:   {acc:'#38486E',tc:'#8898BE',gr:'38,52,110'},
  astR:    {acc:'#4858A0',tc:'#B0BAE0',gr:'58,68,162'},
  astS:    {acc:'#404898',tc:'#A8B0D8',gr:'50,55,152'},
  navR:    {acc:'#4078C8',tc:'#BCCEF5',gr:'55,105,202'},
  navS:    {acc:'#9055C0',tc:'#D0C0F5',gr:'140,78,195'},
  civR:    {acc:'#AA52F8',tc:'#E8D2FF',gr:'170,78,248'},
  civS:    {acc:'#FF4C4C',tc:'#FFCECE',gr:'255,68,68'},
  sunrise: {acc:'#FF8038',tc:'#FFE0BE',gr:'255,118,44'},
  sunset:  {acc:'#FF4418',tc:'#FFCAA8',gr:'255,62,20'},
  goldenR: {acc:'#FFAA38',tc:'#FFE8BE',gr:'255,162,40'},
  goldenS: {acc:'#FF7E1E',tc:'#FFD4A0',gr:'255,112,26'},
  day:     {acc:'#52C4F8',tc:'#FFFFFF',gr:'82,196,250'},
  noon:    {acc:'#68D5FF',tc:'#FFFFFF',gr:'95,215,255'},
};

// ─── THE CARD ─────────────────────────────────────────────────────────────────

class SolarClockCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._tickInterval = null;
    this._launchInterval = null;
    this._launches = [];        // cached launch data from API
    this._tickerIndex = 0;      // current ticker item
    this._tickerTimer = null;
  }

  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._tickInterval) {
      this._render();
      this._tickInterval = setInterval(() => this._render(), 60000);
      this._fetchLaunches();
      this._launchInterval = setInterval(() => this._fetchLaunches(), 3600000);
    }
  }

  disconnectedCallback() {
    if (this._tickInterval) { clearInterval(this._tickInterval); this._tickInterval = null; }
    if (this._launchInterval) { clearInterval(this._launchInterval); this._launchInterval = null; }
    if (this._tickerTimer) { clearInterval(this._tickerTimer); this._tickerTimer = null; }
  }

  // ── fetch upcoming launches from Launch Library 2 (free, no key) ────────────
  async _fetchLaunches() {
    try {
      const url = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?format=json&limit=10&status=1,2,3&mode=list';
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      // Filter: only notable missions (SpaceX, NASA, ESA, Roscosmos, Blue Origin, Rocket Lab crewed/major)
      const NOTABLE_AGENCIES = ['spacex','nasa','esa','roscosmos','blue origin','rocket lab','jaxa','isro','cnsa','northrop'];
      const NOTABLE_KEYWORDS = ['crew','dragon','artemis','orion','starship','webb','hubble','iss','moon','mars','jupiter','saturn','europa','gateway','axiom','starliner'];
      this._launches = (data.results || [])
        .filter(l => {
          const agency = (l.launch_service_provider?.name || '').toLowerCase();
          const name   = (l.name || '').toLowerCase();
          const mission= (l.mission?.description || '').toLowerCase();
          const isNotableAgency   = NOTABLE_AGENCIES.some(a => agency.includes(a));
          const isNotableMission  = NOTABLE_KEYWORDS.some(k => name.includes(k) || mission.includes(k));
          return isNotableAgency || isNotableMission;
        })
        .slice(0, 8)
        .map(l => ({
          name: l.name,
          agency: l.launch_service_provider?.name || '',
          date: new Date(l.net),
          status: l.status?.abbrev || '',
          pad: l.pad?.location?.country_code || '',
          url: l.url,
        }));
      this._render();
    } catch(e) {
      // silently fail - no internet or API down
    }
  }

  // ── compute all values ──────────────────────────────────────────────────────
  _compute() {
    const hass = this._hass;
    const now  = new Date();
    const nowH = now.getHours() + now.getMinutes()/60 + now.getSeconds()/3600;
    const elev = solarElev(now, LAT, LON, nowH);
    const isR  = elev >= solarElev(now, LAT, LON, nowH - 0.25);

    let noonH=12, noonE=-90;
    for (let h=9; h<=15; h+=1/60) { const e=solarElev(now,LAT,LON,h); if(e>noonE){noonE=e;noonH=h;} }
    const atNoon = elev>=noonE-1.5 && elev>0;

    const riseH = findCross(now, LAT, LON, true);
    const setH  = findCross(now, LAT, LON, false);

    const states = hass?.states || {};
    const rRaw = states['sun.sun']?.attributes?.next_rising || states['sun.sun']?.attributes?.next_dawn;
    const sRaw = states['sun.sun']?.attributes?.next_setting || states['sun.sun']?.attributes?.next_dusk;
    let riseStr, setStr;
    if (rRaw) { const r=new Date(rRaw); riseStr=r.getDate()!==now.getDate()?fmtH(riseH):pad(r.getHours())+':'+pad(r.getMinutes()); }
    else riseStr = fmtH(riseH);
    if (sRaw) { const s=new Date(sRaw); setStr=s.getDate()!==now.getDate()?fmtH(setH):pad(s.getHours())+':'+pad(s.getMinutes()); }
    else setStr = fmtH(setH);

    let phaseKey, phaseName;
    if      (atNoon)       { phaseKey='noon';   phaseName='Południe solarne'; }
    else if (elev>=0) {
      if      (elev<4)     { phaseKey=isR?'sunrise':'sunset';  phaseName=isR?'Wschód słońca':'Zachód słońca'; }
      else if (elev<13)    { phaseKey=isR?'goldenR':'goldenS'; phaseName=isR?'Złota godzina ↑':'Złota godzina ↓'; }
      else                 { phaseKey='day';    phaseName='Dzień'; }
    }
    else if (elev>=-6)     { phaseKey=isR?'civR':'civS';  phaseName=isR?'Świt cywilny':'Zmierzch cywilny'; }
    else if (elev>=-12)    { phaseKey=isR?'navR':'navS';  phaseName=isR?'Świt żeglarski':'Zmierzch żeglarski'; }
    else if (elev>=-18)    { phaseKey=isR?'astR':'astS';  phaseName=isR?'Świt astronomiczny':'Zmierzch astronomiczny'; }
    else                   { phaseKey='night';  phaseName='Noc'; }

    const tempRaw = states['sensor.stacja_pogodowa_outdoor_temperature']?.state;
    const temp = tempRaw ? parseFloat(tempRaw) : null;
    const weatherState = states['weather.forecast_home']?.state || 'unknown';

    const isNight = elev < -6;
    const visiblePlanets = (SHOW_PLANETS && isNight)
      ? PLANET_NAMES
          .map(name => ({name, pos: planetPosition(name, now, LAT, LON)}))
          .filter(p => p.pos && p.pos.visible)
          .sort((a,b) => b.pos.alt - a.pos.alt)
      : [];

    const TM = TH[phaseKey] || TH.day;
    const dynamicBg = generateDynamicBg(elev, temp, weatherState, phaseKey);

    return { now, nowH, elev, isR, noonE, riseStr, setStr, phaseKey, phaseName,
             temp, weatherState, isNight, visiblePlanets, TM, dynamicBg };
  }

  // ── build SVG chart ─────────────────────────────────────────────────────────
  _buildChart(now, nowH, elev, isR, TM) {
    const W=280, H=108, EMIN=-30, EMAX=65, ERANGE=EMAX-EMIN;
    const eToY = e => H-8-((e-EMIN)/ERANGE)*(H-16);
    const hToX = h => (h/24)*W;
    const horizY=eToY(0), y6=eToY(-6), y12=eToY(-12), y18=eToY(-18);

    const pts=[];
    for (let i=0; i<=96; i++) { const h=i/4; pts.push({x:hToX(h).toFixed(2),y:eToY(solarElev(now,LAT,LON,h)).toFixed(2)}); }
    const pathD = pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(' ');
    const fillD = `M${hToX(0).toFixed(2)},${horizY.toFixed(2)} `
                + pts.map(p=>`L${p.x},${Math.min(parseFloat(p.y),horizY).toFixed(2)}`).join(' ')
                + ` L${hToX(24).toFixed(2)},${horizY.toFixed(2)} Z`;

    const dotX=hToX(nowH).toFixed(2), dotY=eToY(elev).toFixed(2);
    const ss=sunStyle(elev,isR);

    const ringsEl=ss.rings.map((g,i)=>`
      <ellipse cx="${dotX}" cy="${dotY}" rx="${g.rx}" ry="${g.rx}" fill="${g.c}" opacity="${g.op}">
        <animate attributeName="rx" values="${g.rx};${(g.rx*1.08).toFixed(1)};${g.rx}" dur="${3+i*.5}s" repeatCount="indefinite"/>
        <animate attributeName="ry" values="${g.rx};${(g.rx*1.08).toFixed(1)};${g.rx}" dur="${3+i*.5}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="${g.op};${(g.op*1.3).toFixed(2)};${g.op}" dur="${3+i*.5}s" repeatCount="indefinite"/>
      </ellipse>`).join('');

    const sunEl=`<circle cx="${dotX}" cy="${dotY}" r="${ss.rad}" fill="${ss.col}">
      <animate attributeName="r" values="${ss.rad};${(ss.rad*1.04).toFixed(1)};${ss.rad}" dur="3.5s" repeatCount="indefinite"/>
    </circle>`;

    const vLine=`<line x1="${dotX}" y1="${(parseFloat(dotY)+ss.rad+1).toFixed(2)}" x2="${dotX}" y2="${horizY.toFixed(2)}"
      stroke="${elev>=0?'rgba(255,245,178,.13)':'rgba(130,130,255,.08)'}"
      stroke-width=".7" stroke-dasharray="2 3.5"/>`;

    const hGlow=(elev>-4&&elev<6)?`<ellipse cx="${dotX}" cy="${horizY.toFixed(2)}" rx="100" ry="14"
      fill="${isR?'rgba(255,165,42,.18)':'rgba(255,68,18,.18)'}">
      <animate attributeName="opacity" values=".6;1;.6" dur="3.5s" repeatCount="indefinite"/></ellipse>`:'';

    const xLbls=[0,6,12,18,24].map(h=>{
      const x=hToX(h).toFixed(1),l=h===24?'24':pad(h);
      return `<text x="${x}" y="${H}" text-anchor="middle" font-size="7" fill="rgba(255,255,255,.18)" font-family="-apple-system,sans-serif">${l}</text>`;
    }).join('');

    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <defs>
        <linearGradient id="sf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="rgba(82,198,250,.20)"/>
          <stop offset="100%" stop-color="rgba(82,198,250,0)"/>
        </linearGradient>
        <clipPath id="abz"><rect x="0" y="0" width="${W}" height="${horizY.toFixed(2)}"/></clipPath>
      </defs>
      <rect x="0" y="${horizY.toFixed(2)}" width="${W}" height="${(y6-horizY).toFixed(2)}"   fill="rgba(100,30,165,.08)"/>
      <rect x="0" y="${y6.toFixed(2)}"     width="${W}" height="${(y12-y6).toFixed(2)}"      fill="rgba(30,50,165,.10)"/>
      <rect x="0" y="${y12.toFixed(2)}"    width="${W}" height="${(y18-y12).toFixed(2)}"     fill="rgba(10,14,58,.14)"/>
      <rect x="0" y="${y18.toFixed(2)}"    width="${W}" height="${(H-y18+4).toFixed(2)}"     fill="rgba(2,3,10,.20)"/>
      <path d="${fillD}" fill="url(#sf)"/>
      <path d="${pathD}" fill="none" stroke="rgba(82,198,250,.16)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="${pathD}" fill="none" stroke="rgba(82,198,250,.88)" stroke-width="1.75" stroke-linejoin="round" clip-path="url(#abz)"/>
      <line x1="0" y1="${horizY.toFixed(2)}" x2="${W}" y2="${horizY.toFixed(2)}" stroke="rgba(255,255,255,.20)" stroke-width=".85" stroke-dasharray="4 6"/>
      <text x="${W-2}" y="${(horizY-2.5).toFixed(2)}" text-anchor="end" font-size="7" fill="rgba(255,255,255,.25)" font-family="-apple-system,sans-serif">0°</text>
      ${xLbls}${hGlow}${vLine}${ringsEl}${sunEl}
    </svg>`;
  }

  // ── build event banners ─────────────────────────────────────────────────────
  _buildBanners() {
    return EVENTS
      .map(ev => ({ev, days: daysUntil(ev.date)}))
      .filter(({days}) => days >= 0 && days <= 30)
      .sort((a,b) => a.days - b.days)
      .slice(0, 2)
      .map(({ev, days}) => this._renderBanner(ev, days))
      .join('');
  }

  _renderBanner(ev, days) {
    const isToday=days===0, isTomorrow=days===1, isUrgent=days<=7;
    let acR, acG, acB;
    if      (isToday)    { acR=255; acG=70;  acB=0; }
    else if (isTomorrow) { acR=255; acG=130; acB=0; }
    else if (isUrgent)   { acR=255; acG=180; acB=30; }
    else { const t=typeTheme(ev.type); acR=t.r; acG=t.g; acB=t.b; }

    const ac  = `rgba(${acR},${acG},${acB},1)`;
    const acM = `rgba(${acR},${acG},${acB},.85)`;
    const acL = `rgba(${acR},${acG},${acB},.18)`;
    const acB2= `rgba(${acR},${acG},${acB},.35)`;
    const pillText = isToday?'dziś!':isTomorrow?'jutro':`${days} dni`;
    const sublabel = isToday?ev.sublabelToday:isTomorrow?ev.sublabelTomorrow:ev.sublabel;

    if (isToday) {
      const meteorExtra = ev.hasMeteors
        ? `<div style="margin-top:5px;display:flex;align-items:center;gap:6px;">
            <div style="font-size:10px;font-weight:600;color:rgba(180,130,255,.92);background:rgba(150,90,255,.15);border:1px solid rgba(150,90,255,.35);padding:2px 8px;border-radius:8px;">+ Perseidy tej nocy</div>
            <div style="font-size:10px;color:rgba(255,255,255,.35);">2 zjawiska jednocześnie</div>
           </div>` : '';
      return `<div class="banner today" style="border-top:2px solid ${acB2};">
        <div class="banner-bg" style="background:${acL};"></div>
        <div class="banner-inner">
          <div class="banner-icon pulse" style="background:rgba(${acR},${acG},${acB},.20);border:2px solid ${acB2};">
            ${eventIcon(ev.type,20,ac)}
            <div class="icon-ring" style="border-color:rgba(${acR},${acG},${acB},.40);"></div>
          </div>
          <div class="banner-text">
            <div style="font-size:12px;font-weight:600;color:${ac};text-transform:uppercase;letter-spacing:.05em;">${ev.label} — dziś!</div>
            <div style="font-size:10px;color:rgba(255,220,150,.75);margin-top:2px;">${sublabel}</div>
            ${meteorExtra}
          </div>
          <div class="banner-pill pulse" style="color:${ac};background:rgba(${acR},${acG},${acB},.18);border:1.5px solid ${acB2};">${pillText}</div>
        </div>
      </div>`;
    }
    if (isTomorrow) {
      return `<div class="banner tomorrow" style="border-top:2px solid ${acB2};background:rgba(${acR},${acG},${acB},.08);">
        <div class="banner-inner">
          <div class="banner-icon" style="background:rgba(${acR},${acG},${acB},.15);border:1.5px solid ${acB2};">
            ${eventIcon(ev.type,18,ac)}
          </div>
          <div class="banner-text">
            <div style="font-size:11px;font-weight:600;color:${ac};text-transform:uppercase;letter-spacing:.05em;">Jutro: ${ev.label}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.40);margin-top:1px;">${sublabel}</div>
          </div>
          <div class="banner-pill pulse-slow" style="color:${ac};background:rgba(${acR},${acG},${acB},.18);border:1.5px solid ${acB2};">${pillText}</div>
        </div>
      </div>`;
    }
    if (isUrgent) {
      return `<div class="banner urgent" style="border-top:1px solid rgba(${acR},${acG},${acB},.30);background:rgba(${acR},${acG},${acB},.06);">
        <div class="banner-inner">
          <div class="banner-icon sm" style="background:rgba(${acR},${acG},${acB},.12);border:1px solid rgba(${acR},${acG},${acB},.35);">
            ${eventIcon(ev.type,14,ac)}
          </div>
          <div class="banner-text">
            <div style="font-size:10px;font-weight:600;color:${acM};text-transform:uppercase;letter-spacing:.06em;">${ev.label} za ${days} dni</div>
            <div style="font-size:10px;color:rgba(255,255,255,.38);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${sublabel}</div>
          </div>
          <div class="banner-pill pulse-slow" style="font-size:11px;color:${acM};background:rgba(${acR},${acG},${acB},.14);border:1px solid rgba(${acR},${acG},${acB},.35);">${pillText}</div>
        </div>
      </div>`;
    }
    return `<div class="banner normal">
      <div class="banner-inner">
        <div class="banner-icon sm" style="background:rgba(${acR},${acG},${acB},.10);border:1px solid rgba(${acR},${acG},${acB},.25);">
          ${eventIcon(ev.type,14,ac)}
        </div>
        <div class="banner-text">
          <div style="font-size:10px;font-weight:600;color:rgba(${acR},${acG},${acB},.85);text-transform:uppercase;letter-spacing:.06em;">${ev.label}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${sublabel}</div>
        </div>
        <div class="banner-pill" style="font-size:11px;color:rgba(${acR},${acG},${acB},.85);background:rgba(${acR},${acG},${acB},.12);border:1px solid rgba(${acR},${acG},${acB},.25);">${pillText}</div>
      </div>
    </div>`;
  }

  // ── main render ─────────────────────────────────────────────────────────────
  _render() {
    if (!this._hass) return;
    const { now, nowH, elev, isR, TM, dynamicBg, phaseName, phaseKey,
            riseStr, setStr, temp, weatherState, isNight, visiblePlanets } = this._compute();

    const elevStr = (elev>=0?'+':'')+elev.toFixed(1)+'°';
    const hasToday = EVENTS.some(ev => daysUntil(ev.date)===0);

    const chartSVG = this._buildChart(now, nowH, elev, isR, TM);
    const banners  = this._buildBanners();

    // random particle seeds (stable per render)
    const rainDrops = ['rainy','pouring','lightning','lightning-rainy'].includes(weatherState)
      ? [...Array(12)].map((_,i)=>`<div class="raindrop" style="left:${((i*137+13)%100)}%;animation-delay:${((i*.17)%2).toFixed(2)}s;animation-duration:${(.8+((i*.23)%0.6)).toFixed(2)}s;"></div>`).join('') : '';
    const snowFlakes = ['snowy','snowy-rainy'].includes(weatherState)||(temp!==null&&temp<0)
      ? [...Array(10)].map((_,i)=>`<div class="snowflake" style="left:${((i*97+7)%100)}%;width:${(2+(i*.3)%2).toFixed(1)}px;height:${(2+(i*.3)%2).toFixed(1)}px;animation-delay:${((i*.31)%3).toFixed(2)}s;animation-duration:${(2+(i*.4)%2).toFixed(2)}s;--drift:${(((i*11)%20)-10)}px;"></div>`).join('') : '';

    const css = `
      :host { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }

      @keyframes glow-pulse  { 0%,100%{opacity:.28;transform:scale(1)} 50%{opacity:.48;transform:scale(1.12)} }
      @keyframes breathe     { 0%,100%{opacity:1} 50%{opacity:.75} }
      @keyframes breathe-slow{ 0%,100%{opacity:1} 50%{opacity:.80} }
      @keyframes shimmer     { 0%,100%{opacity:.65} 50%{opacity:.90} }
      @keyframes bg-shift    { 0%,100%{filter:hue-rotate(0deg) brightness(1)} 50%{filter:hue-rotate(5deg) brightness(1.05)} }
      @keyframes cloud-drift { from{transform:translateX(-50px)} to{transform:translateX(50px)} }
      @keyframes rain-fall   { 0%{transform:translateY(-10px);opacity:0} 10%{opacity:.5} 90%{opacity:.3} 100%{transform:translateY(240px);opacity:0} }
      @keyframes snow-fall   { 0%{transform:translateY(-10px) translateX(0);opacity:0} 10%{opacity:.7} 90%{opacity:.5} 100%{transform:translateY(240px) translateX(var(--drift,10px));opacity:0} }
      @keyframes ring-pulse  { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.3);opacity:0} }
      @keyframes tooltip-in  { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }

      .card {
        background: ${dynamicBg};
        border-radius: 24px;
        padding: 20px 20px 16px;
        position: relative;
        overflow: hidden;
        min-height: 228px;
        animation: bg-shift 30s ease-in-out infinite;
        ${hasToday ? 'border:2px solid rgba(255,70,0,.55);' : ''}
      }
      .card::before {
        content:''; position:absolute; top:-55px; left:50%; transform:translateX(-50%);
        width:270px; height:210px;
        background:radial-gradient(ellipse,rgba(${TM.gr},.18) 0%,transparent 72%);
        pointer-events:none;
        animation: glow-pulse ${elev>=0?'3.5s':'5s'} cubic-bezier(.4,0,.2,1) infinite;
      }
      .card::after {
        content:''; position:absolute; inset:0;
        background:radial-gradient(ellipse at ${(nowH/24*100).toFixed(0)}% 35%,rgba(${TM.gr},.12) 0%,transparent 65%);
        pointer-events:none;
        animation: shimmer 4s cubic-bezier(.4,0,.2,1) infinite;
      }

      /* atmospheric layers */
      .atm { position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:0; opacity:${elev>=0?.15:.08}; }
      .cloud { position:absolute; border-radius:50%; filter:blur(25px); }
      .c1 { top:15%; left:-10%; width:180px; height:60px; background:radial-gradient(ellipse,rgba(255,255,255,.08) 0%,transparent 70%); animation:cloud-drift 45s linear infinite; }
      .c2 { top:40%; left:20%; width:220px; height:70px; background:radial-gradient(ellipse,rgba(255,255,255,.06) 0%,transparent 70%); animation:cloud-drift 60s -10s linear infinite; }
      .c3 { top:65%; left:-5%; width:160px; height:55px; background:radial-gradient(ellipse,rgba(255,255,255,.07) 0%,transparent 70%); animation:cloud-drift 52s -25s linear infinite; }

      .raindrop { position:absolute; top:-10px; width:1.5px; height:14px;
        background:linear-gradient(to bottom,rgba(120,180,255,.4),rgba(120,180,255,0));
        animation:rain-fall linear infinite; }
      .snowflake { position:absolute; top:-10px; border-radius:50%; background:rgba(220,235,255,.6);
        animation:snow-fall ease-in-out infinite; }

      /* content */
      .content { position:relative; z-index:1; }
      .top { display:flex; justify-content:space-between; align-items:flex-start; }
      .day-label { font-size:11px; font-weight:600; color:${TM.acc}; text-transform:uppercase; letter-spacing:.12em; }
      .date-label { font-size:11px; color:${TM.acc}88; letter-spacing:.03em; }
      .phase-badge {
        font-size:9px; font-weight:600; letter-spacing:.08em; text-transform:uppercase;
        white-space:nowrap; color:${TM.acc};
        border:1px solid ${TM.acc}44; padding:2px 8px; border-radius:12px; background:${TM.acc}14;
        animation:breathe 3s ease-in-out infinite;
      }

      /* planets */
      .planets { display:flex; gap:5px; flex-wrap:wrap; justify-content:flex-end; margin-top:5px; position:relative; }
      .planet-pill {
        display:flex; flex-direction:column; align-items:center; gap:1px;
        border-radius:10px; padding:3px 7px; cursor:pointer;
        -webkit-tap-highlight-color: transparent;
        user-select:none; position:relative;
        transition: background .15s, border-color .15s;
      }
      .planet-pill:active { filter:brightness(1.3); }
      .planet-sym  { font-size:13px; line-height:1; }
      .planet-name { font-size:7px; font-weight:600; text-transform:uppercase; letter-spacing:.04em; line-height:1.2; }

      /* planet tooltip */
      .planet-tooltip {
        display:none; position:absolute; bottom:calc(100% + 6px); right:0;
        background:rgba(8,12,30,.97); border-radius:10px;
        padding:8px 12px; white-space:nowrap; z-index:999;
        box-shadow:0 4px 20px rgba(0,0,0,.7);
        animation:tooltip-in .15s ease;
        min-width:140px;
      }
      .planet-tooltip.visible { display:block; }
      .planet-tooltip .tip-title { font-size:11px; font-weight:700; margin-bottom:4px; }
      .planet-tooltip .tip-row   { font-size:10px; color:rgba(255,255,255,.50); line-height:1.8; }
      .planet-tooltip .tip-val   { color:rgba(255,255,255,.88); }

      .time {
        font-size:65px; font-weight:200; letter-spacing:-3px; line-height:1;
        color:${TM.tc}; margin:3px 0 0; font-variant-numeric:tabular-nums;
        text-align:center; width:100%; display:block;
      }

      .chart { margin:10px 0 4px; }
      .stats { display:flex; justify-content:space-between; align-items:flex-start; margin-top:7px; }
      .stat { display:flex; flex-direction:column; }
      .stat-val   { font-size:14px; font-weight:600; color:rgba(255,255,255,.82); letter-spacing:-.2px; }
      .stat-label { font-size:9px; font-weight:500; color:rgba(255,255,255,.28); text-transform:uppercase; letter-spacing:.07em; margin-top:1px; }


      /* ── ticker ─────────────────────────────────────────────────── */
      .ticker {
        margin: 10px -20px -16px;
        border-top: 1px solid rgba(255,255,255,.07);
        border-radius: 0 0 24px 24px;
        overflow: hidden;
        position: relative;
      }
      .ticker-inner {
        display: flex;
        align-items: stretch;
        min-height: 38px;
      }
      .ticker-type-bar {
        width: 3px;
        flex-shrink: 0;
        border-radius: 0;
      }
      .ticker-body {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 14px 7px 10px;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: background .15s;
        position: relative;
        overflow: hidden;
      }
      .ticker-body:active { background: rgba(255,255,255,.04); }
      .ticker-icon {
        font-size: 13px;
        flex-shrink: 0;
        line-height: 1;
      }
      .ticker-text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
      }
      .ticker-label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .07em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ticker-sub {
        font-size: 9.5px;
        color: rgba(255,255,255,.35);
        margin-top: 1px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ticker-pill {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 8px;
        white-space: nowrap;
        flex-shrink: 0;
        letter-spacing: -.2px;
      }
      .ticker-nav {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 2px;
        padding: 0 10px 0 0;
        flex-shrink: 0;
      }
      .ticker-dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: rgba(255,255,255,.18);
        transition: background .2s, transform .2s;
      }
      .ticker-dot.active {
        background: rgba(255,255,255,.55);
        transform: scale(1.3);
      }
      @keyframes ticker-slide-in {
        from { opacity:0; transform:translateY(6px); }
        to   { opacity:1; transform:translateY(0); }
      }
      .ticker-body { animation: ticker-slide-in .25s ease; }

      /* banners */
      .banner { margin-left:-20px; margin-right:-20px; margin-bottom:-16px;
                border-radius:0 0 24px 24px; position:relative; overflow:hidden; }
      .banner.today    { padding:12px 20px 16px; margin-top:10px; }
      .banner.tomorrow { padding:11px 20px 14px; margin-top:10px; }
      .banner.urgent   { padding:10px 20px 13px; margin-top:10px; }
      .banner.normal   { padding:10px 20px 12px; margin-top:11px; border-top:1px solid rgba(255,255,255,.07); }
      .banner-bg { position:absolute; inset:0; animation:breathe 1.2s ease-in-out infinite; }
      .banner-inner { position:relative; z-index:1; display:flex; align-items:center; gap:10px; }
      .banner-text  { flex:1; min-width:0; }
      .banner-icon  {
        width:34px; height:34px; border-radius:50%; flex-shrink:0;
        display:flex; align-items:center; justify-content:center; position:relative;
      }
      .banner-icon.sm { width:28px; height:28px; }
      .banner-pill {
        font-size:12px; font-weight:600; padding:4px 10px;
        border-radius:10px; white-space:nowrap; flex-shrink:0;
      }
      .icon-ring {
        position:absolute; inset:-4px; border-radius:50%; border:2px solid;
        animation:ring-pulse 1.2s ease-in-out infinite;
      }
      .pulse      { animation:breathe 1.2s ease-in-out infinite; }
      .pulse-slow { animation:breathe-slow 1.8s ease-in-out infinite; }
    `;

    const planetsHtml = visiblePlanets.length > 0
      ? `<div class="planets">${visiblePlanets.map(({name,pos}) => {
          const col = PLANET_COLORS[name];
          const sym = PLANET_SYMBOLS[name];
          return `<div class="planet-pill" data-planet="${name}"
            style="background:rgba(${col},.12);border:1px solid rgba(${col},.30);">
            <span class="planet-sym" style="color:rgba(${col},1);">${sym}</span>
            <span class="planet-name" style="color:rgba(${col},.80);">${name.slice(0,3)}</span>
            <div class="planet-tooltip" data-tip="${name}">
              <div class="tip-title" style="color:rgba(${col},1);">${sym} ${name}</div>
              <div class="tip-row">Wysokość:&nbsp;<span class="tip-val">${pos.alt>0?'+':''}${pos.alt}°</span></div>
              <div class="tip-row">Kierunek:&nbsp;<span class="tip-val">${pos.dir}&nbsp;(${pos.az}°)</span></div>
              <div class="tip-row">Jasność:&nbsp;<span class="tip-val">${pos.mag>0?'+':''}${pos.mag}&nbsp;mag</span></div>
            </div>
          </div>`;
        }).join('')}</div>` : '';

    // build ticker
    const tickerItems = this._buildTickerItems();
    const tickerHtml  = this._renderTicker(tickerItems);

    const html = `
      <style>${css}</style>
      <div class="card">
        <div class="atm">
          <div class="cloud c1"></div>
          <div class="cloud c2"></div>
          <div class="cloud c3"></div>
          ${rainDrops}${snowFlakes}
        </div>
        <div class="content">
          <div class="top">
            <div>
              <div class="day-label">${DAYS[now.getDay()]}</div>
              <div class="date-label">${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;">
              <span class="phase-badge">${phaseName}</span>
              ${planetsHtml}
            </div>
          </div>
          <div class="time">${pad(now.getHours())}:${pad(now.getMinutes())}</div>
          <div class="chart">${chartSVG}</div>
          <div class="stats">
            <div class="stat">
              <span class="stat-val">${riseStr}</span>
              <span class="stat-label">Wschód ☀︎</span>
            </div>
            <div class="stat" style="text-align:center">
              <span class="stat-val" style="color:${TM.acc}">${elevStr}</span>
              <span class="stat-label">Wysokość</span>
            </div>
            <div class="stat" style="text-align:right">
              <span class="stat-val">${setStr}</span>
              <span class="stat-label">Zachód ☀︎</span>
            </div>
          </div>
          ${banners}
          ${tickerHtml}
        </div>
      </div>`;

    this.shadowRoot.innerHTML = html;
    this._bindEvents();
    this._startTickerAuto();
  }

  _bindEvents() {
    // Planet tooltips — toggle on tap/click, close on outside click
    const pills = this.shadowRoot.querySelectorAll('.planet-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const tip = pill.querySelector('.planet-tooltip');
        const isOpen = tip.classList.contains('visible');
        this.shadowRoot.querySelectorAll('.planet-tooltip.visible').forEach(t => t.classList.remove('visible'));
        if (!isOpen) tip.classList.add('visible');
      });
    });

    // Close tooltips on click outside
    this.shadowRoot.querySelector('.card').addEventListener('click', () => {
      this.shadowRoot.querySelectorAll('.planet-tooltip.visible').forEach(t => t.classList.remove('visible'));
    });

    // Ticker — tap to advance manually
    const tickerBody = this.shadowRoot.querySelector('[data-ticker-click]');
    if (tickerBody) {
      tickerBody.addEventListener('click', (e) => {
        e.stopPropagation();
        const items = this._buildTickerItems();
        if (!items.length) return;
        this._tickerIndex = (this._tickerIndex + 1) % items.length;
        // re-render just the ticker area without full card redraw
        const ticker = this.shadowRoot.querySelector('.ticker');
        if (ticker) ticker.outerHTML; // force, but easier to just partial-render:
        this._renderTickerOnly();
      });
    }
  }

  _renderTickerOnly() {
    const items = this._buildTickerItems();
    const ticker = this.shadowRoot.querySelector('.ticker');
    if (!ticker || !items.length) return;
    const html = this._renderTicker(items);
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const newTicker = tmp.firstElementChild;
    if (newTicker) {
      ticker.replaceWith(newTicker);
      // re-bind click on new element
      const tb = this.shadowRoot.querySelector('[data-ticker-click]');
      if (tb) tb.addEventListener('click', (e) => {
        e.stopPropagation();
        const items2 = this._buildTickerItems();
        if (!items2.length) return;
        this._tickerIndex = (this._tickerIndex + 1) % items2.length;
        this._renderTickerOnly();
      });
    }
  }

  _startTickerAuto() {
    if (this._tickerTimer) { clearInterval(this._tickerTimer); this._tickerTimer = null; }
    const items = this._buildTickerItems();
    if (items.length <= 1) return;
    this._tickerTimer = setInterval(() => {
      this._tickerIndex = (this._tickerIndex + 1) % items.length;
      this._renderTickerOnly();
    }, 5000);
  }


  // ── build ticker items (astro events + launches) ───────────────────────────
  _buildTickerItems() {
    const items = [];
    const now = new Date(); now.setHours(0,0,0,0);

    // Astronomical events — next 365 days
    EVENTS.forEach(ev => {
      const days = daysUntil(ev.date);
      if (days < 0 || days > 365) return;
      const t = typeTheme(ev.type);
      let countdown, urgency;
      if      (days === 0) { countdown = 'dziś!';   urgency = 'high'; }
      else if (days === 1) { countdown = 'jutro';   urgency = 'mid'; }
      else if (days <= 7)  { countdown = days+'d';  urgency = 'mid'; }
      else                 { countdown = days+'d';  urgency = 'low'; }
      const EMOJI = { eclipse:'🌒', lunar_eclipse:'🌕', meteors:'🌠', conjunction:'🔭', planet:'🪐', moon:'🌙' };
      items.push({ kind:'astro', label:ev.label, sub:ev.sublabel, countdown, urgency,
                   r:t.r, g:t.g, b:t.b, emoji:EMOJI[ev.type]||'✨', days });
    });

    // Rocket launches
    this._launches.forEach(l => {
      const diff = l.date - new Date();
      if (diff < -3600000) return; // skip if more than 1h past
      const AGENCY_COLOR = {
        'spacex':    {r:200,g:200,b:200},
        'nasa':      {r:11, g:103,b:184},
        'esa':       {r:0,  g:125,b:195},
        'roscosmos': {r:180,g:40, b:40},
        'blue origin':{r:0, g:140,b:255},
        'rocket lab':{r:200,g:50, b:50},
      };
      const agencyKey = Object.keys(AGENCY_COLOR).find(k => l.agency.toLowerCase().includes(k));
      const col = AGENCY_COLOR[agencyKey] || {r:160,g:160,b:160};
      let countdown, urgency;
      if (diff < 0)                      { countdown = 'LIVE!'; urgency = 'high'; }
      else if (diff < 3600000)           { countdown = Math.ceil(diff/60000)+'m'; urgency = 'high'; }
      else if (diff < 86400000)          { countdown = Math.ceil(diff/3600000)+'h'; urgency = 'mid'; }
      else {
        const days = Math.ceil(diff/86400000);
        countdown = days+'d';
        urgency = days <= 7 ? 'mid' : 'low';
      }
      const agencyShort = l.agency.replace('National Aeronautics and Space Administration','NASA')
                                  .replace('Space Exploration Technologies Corp.','SpaceX')
                                  .replace('European Space Agency','ESA');
      items.push({ kind:'launch', label:l.name, sub:agencyShort + (l.pad ? ' · '+l.pad : ''),
                   countdown, urgency, r:col.r, g:col.g, b:col.b, emoji:'🚀', days: Math.ceil(diff/86400000) });
    });

    // Sort: today/live first, then by days
    items.sort((a,b) => {
      const uo = {high:0,mid:1,low:2};
      if (uo[a.urgency] !== uo[b.urgency]) return uo[a.urgency] - uo[b.urgency];
      return (a.days||0) - (b.days||0);
    });

    return items;
  }

  _renderTicker(items) {
    if (!items.length) return '';
    const idx = this._tickerIndex % items.length;
    const item = items[idx];
    const { r, g, b, urgency, emoji, label, sub, countdown } = item;

    const barBg = urgency === 'high'
      ? 'linear-gradient(to bottom,rgba(255,70,0,1),rgba(255,140,0,1))'
      : urgency === 'mid'
        ? `linear-gradient(to bottom,rgba(${r},${g},${b},.9),rgba(${r},${g},${b},.4))`
        : `rgba(${r},${g},${b},.35)`;

    const pillBg    = `rgba(${r},${g},${b},.18)`;
    const pillBord  = `rgba(${r},${g},${b},.40)`;
    const pillColor = urgency === 'high' ? 'rgba(255,130,60,1)' : `rgba(${r},${g},${b},1)`;
    const labelColor= `rgba(${r},${g},${b},.92)`;

    const dots = items.slice(0,Math.min(items.length,8)).map((_, i) =>
      `<div class="ticker-dot${i===idx?' active':''}"></div>`).join('');

    return `<div class="ticker">
      <div class="ticker-inner">
        <div class="ticker-type-bar" style="background:${barBg};"></div>
        <div class="ticker-body" data-ticker-click>
          <span class="ticker-icon">${emoji}</span>
          <div class="ticker-text">
            <div class="ticker-label" style="color:${labelColor};">${label}</div>
            <div class="ticker-sub">${sub}</div>
          </div>
          <div class="ticker-pill" style="background:${pillBg};border:1px solid ${pillBord};color:${pillColor};">${countdown}</div>
        </div>
        <div class="ticker-nav">${dots}</div>
      </div>
    </div>`;
  }

  getCardSize() { return 5; }
}

customElements.define('aha-solar-clock-card', SolarClockCard);