/**
 * aha-briefing-card  — Daily briefing: greeting, weather summary,
 *                       presence, and upcoming reminders.
 *
 * Config:
 *   weather_entity    weather.forecast_home
 *   temp_entity       sensor.*
 *   feels_entity      sensor.*  (optional)
 *   wind_entity       sensor.*  (optional, km/h)
 *   forecast_entity   sensor.*  (attributes.forecast = hourly JSON)
 *   rain_entity       sensor.*  (optional, daily accumulating mm)
 *   people:
 *     - name: Tomek
 *       entity: device_tracker.iphone_tk
 *       battery_entity: sensor.iphone_tk_battery_level  (optional)
 *   fertilizations:
 *     - date: 'YYYY-MM-DD'
 *       name: 'Nawóz wiosenny'
 *   waste:
 *     - entity: sensor.harmonogram_bio   ← reads date from HA state/attributes
 *       name: Bio
 *       color: '#4CAF50'
 *     - date: '2026-05-22'              ← or hardcoded date
 *       name: Plastik
 *       color: '#FF9800'
 *   days_fertilization: 14   (show fertil reminders up to N days ahead, default 14)
 *   days_waste: 3            (show waste reminders up to N days ahead, default 3)
 *
 * Registers as: aha-briefing-card  (legacy: briefing-card)
 */
(function () {
  'use strict';

  // ── i18n helpers ─────────────────────────────────────────────────────────────

  const MONTHS_PL = ['stycznia','lutego','marca','kwietnia','maja','czerwca',
    'lipca','sierpnia','września','października','listopada','grudnia'];
  const DAYS_PL = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];

  const WX_LABEL = {
    'sunny':'Słonecznie','clear-night':'Bezchmurnie',
    'partlycloudy':'Zm. zachmurzenie','cloudy':'Zachmurzenie',
    'rainy':'Deszcz','pouring':'Ulewa','snowy':'Śnieg',
    'snowy-rainy':'Deszcz ze śniegiem','hail':'Grad',
    'lightning':'Burza','lightning-rainy':'Burza z deszczem',
    'fog':'Mgła','windy':'Wietrzno','windy-variant':'Wietrzno',
    'exceptional':'Wyjątkowo',
  };

  // ── Small utilities ───────────────────────────────────────────────────────────

  function pad(n) { return String(n).padStart(2, '0'); }

  function toDateStr(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function daysUntil(dateStr) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    return Math.round((target - today) / 86400000);
  }

  function tempColor(t) {
    if (t === null || t === undefined) return '#aaaaaa';
    if (t <= -10) return '#6C5CE7';
    if (t <=   0) return '#4A90D9';
    if (t <=   5) return '#5DADE2';
    if (t <=  10) return '#48C9B0';
    if (t <=  15) return '#52BE80';
    if (t <=  18) return '#A9DFBF';
    if (t <=  22) return '#F9E79F';
    if (t <=  25) return '#F5CBA7';
    if (t <=  28) return '#F0A500';
    if (t <=  32) return '#E74C3C';
    return '#C0392B';
  }

  function greeting(h) {
    if (h >= 5  && h < 12) return 'Dzień dobry';
    if (h >= 12 && h < 19) return 'Dzień dobry';
    if (h >= 19 && h < 23) return 'Dobry wieczór';
    return 'Dobranoc';
  }

  // Time-of-day gradient accent (subtle overlay tint)
  function todTint(h) {
    if (h >= 5  && h < 9)  return 'rgba(255,180,60,0.06)';   // sunrise — warm
    if (h >= 9  && h < 18) return 'rgba(80,160,255,0.04)';   // day — neutral cool
    if (h >= 18 && h < 22) return 'rgba(160,80,200,0.06)';   // evening — violet
    return 'rgba(30,40,100,0.10)';                             // night — deep
  }

  // ── Weather icon (SVG, scalable) ──────────────────────────────────────────────

  function wxIconSVG(st, px) {
    const s = '#F5A623', cl = '#6a7a9a', r = '#5ab0ff', sn = '#aee4f8', b = '#FFD060', m = '#c8d8f0';
    const rays = [0,60,120,180,240,300].map(d => {
      const a = d * Math.PI / 180;
      return `<line x1="${(Math.cos(a)*5.5).toFixed(1)}" y1="${(Math.sin(a)*5.5).toFixed(1)}" x2="${(Math.cos(a)*7.8).toFixed(1)}" y2="${(Math.sin(a)*7.8).toFixed(1)}" stroke="${s}" stroke-width="1.5" stroke-linecap="round"/>`;
    }).join('');

    let inner;
    if (st === 'sunny')
      inner = `<circle r="4" fill="${s}"/>${rays}`;
    else if (st === 'clear-night')
      inner = `<path d="M0-7.5a7.5 7.5 0 000 15 5.5 5.5 0 010-15z" fill="${m}"/>`;
    else if (st === 'partlycloudy')
      inner = `<circle cx="-2" cy="-2" r="3.5" fill="${s}" opacity=".9"/><path d="M-5.5 4a4.5 4.5 0 019 0H-5.5z" fill="${cl}"/><circle cx="-0.5" cy="1" r="3" fill="${cl}"/>`;
    else if (st === 'rainy' || st === 'pouring')
      inner = `<path d="M-6 0a5 5 0 0110 0H-6z" fill="${cl}"/><circle cx="-1" cy="-2.5" r="3" fill="${cl}"/><line x1="-4" y1="5" x2="-5" y2="9" stroke="${r}" stroke-width="1.5" stroke-linecap="round"/><line x1="0" y1="5" x2="-1" y2="9" stroke="${r}" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="5" x2="3" y2="9" stroke="${r}" stroke-width="1.5" stroke-linecap="round"/>`;
    else if (st === 'snowy' || st === 'snowy-rainy')
      inner = `<circle r="1.8" fill="${sn}"/><line x1="0" y1="-7" x2="0" y2="7" stroke="${sn}" stroke-width="1.4" stroke-linecap="round"/><line x1="-6.1" y1="-3.5" x2="6.1" y2="3.5" stroke="${sn}" stroke-width="1.4" stroke-linecap="round"/><line x1="-6.1" y1="3.5" x2="6.1" y2="-3.5" stroke="${sn}" stroke-width="1.4" stroke-linecap="round"/>`;
    else if (st === 'lightning' || st === 'lightning-rainy')
      inner = `<path d="M-6-1a5 5 0 0110 0H-6z" fill="${cl}"/><polygon points="1,-1 -3,6 0,6 -2,11" fill="${b}"/>`;
    else if (st === 'fog')
      inner = `<line x1="-7" y1="-4" x2="7" y2="-4" stroke="${cl}" stroke-width="2" stroke-linecap="round" opacity=".7"/><line x1="-5" y1="0" x2="5" y2="0" stroke="${cl}" stroke-width="2" stroke-linecap="round" opacity=".55"/><line x1="-7" y1="4" x2="4" y2="4" stroke="${cl}" stroke-width="2" stroke-linecap="round" opacity=".4"/>`;
    else if (st === 'windy' || st === 'windy-variant')
      inner = `<path d="M-7-4 Q0-8 7-4" stroke="${r}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M-7 0 Q0-4 7 0" stroke="${r}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".7"/><path d="M-7 4 Q0 1 5 4" stroke="${r}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".45"/>`;
    else
      inner = `<path d="M-6 3a5 5 0 0110 0H-6z" fill="${cl}"/><circle cx="-1" cy="0" r="3.5" fill="${cl}"/><circle cx="4" cy="1" r="2.5" fill="${cl}"/>`;

    return `<svg width="${px}" height="${px}" viewBox="-12 -12 24 24" style="display:block">${inner}</svg>`;
  }

  // ── Smart forecast summary — returns [{label, text}, ...] per day ────────────

  function buildSummaryParts(fcAll, now) {
    if (!Array.isArray(fcAll) || !fcAll.length) return [];

    const todayStr    = toDateStr(now);
    const tomorrowStr = toDateStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));

    function analyzeSlots(slots) {
      if (!slots.length) return null;
      const temps  = slots.map(f => f.temperature).filter(t => typeof t === 'number');
      const maxT   = temps.length ? Math.max(...temps) : null;
      const minT   = temps.length ? Math.min(...temps) : null;
      const precip = slots.reduce((s, f) => s + (f.precipitation || 0), 0);

      const counts = {};
      for (const f of slots) { const c = f.condition || 'cloudy'; counts[c] = (counts[c] || 0) + 1; }
      const cond = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'cloudy';

      let rainTime = null;
      if (precip >= 0.5) {
        const firstRainy = slots.find(f => (f.precipitation || 0) >= 0.3);
        if (firstRainy) {
          const h = new Date(firstRainy.datetime).getHours();
          rainTime = h < 6 ? 'w nocy' : h < 12 ? 'rano' : h < 17 ? 'po południu' : 'wieczorem';
        }
      }
      return { cond, maxT, minT, precip, rainTime };
    }

    const byDay = {};
    for (const f of fcAll) {
      const ds = toDateStr(new Date(f.datetime));
      (byDay[ds] = byDay[ds] || []).push(f);
    }

    const parts = [];
    for (const [label, ds] of [['Dziś', todayStr], ['Jutro', tomorrowStr]]) {
      const allSlots = byDay[ds] || [];
      const slots = ds === todayStr
        ? allSlots.filter(f => new Date(f.datetime) >= now)
        : allSlots;
      if (!slots.length) continue;
      const a = analyzeSlots(slots);
      if (!a) continue;

      let text = (WX_LABEL[a.cond] || a.cond).toLowerCase();
      if (a.rainTime && a.precip >= 0.5) text += `, deszcz ${a.precip.toFixed(1)} mm ${a.rainTime}`;
      if (a.maxT !== null) text += ` · max ${Math.round(a.maxT)}°`;
      parts.push({ label, text });
    }
    return parts;
  }

  // ── Waste date extraction from HA entity ─────────────────────────────────────

  function wasteEntityDate(haState) {
    if (!haState) return null;
    const attrs = haState.attributes || {};
    // Try common attribute names
    const raw = attrs.next_date || attrs.date || attrs.next_pickup || attrs.next_collection || haState.state;
    if (!raw) return null;
    // If it's a number (days until) → compute date
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 0 && num < 365 && String(raw).trim() === String(Math.round(num))) {
      const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() + Math.round(num));
      return toDateStr(d);
    }
    // If it's ISO date string
    if (/^\d{4}-\d{2}-\d{2}/.test(String(raw))) return String(raw).slice(0, 10);
    return null;
  }

  // ── Card ──────────────────────────────────────────────────────────────────────

  class BriefingCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._hass   = null;
      this._config = {};
      this._tick   = null;
    }

    static getStubConfig() {
      return {
        weather_entity:   'weather.forecast_home',
        temp_entity:      'sensor.stacja_pogodowa_outdoor_temperature',
        feels_entity:     'sensor.stacja_pogodowa_feels_like_temperature',
        wind_entity:      'sensor.stacja_pogodowa_wind_speed',
        forecast_entity:  'sensor.forecast_hourly_json',
        rain_entity:      'sensor.stacja_pogodowa_daily_rain_piezo',
        people: [
          { name: 'Tomek',  entity: 'device_tracker.iphone_tk' },
          { name: 'Monika', entity: 'device_tracker.iphone_monika' },
        ],
        fertilizations: [
          { date: '2026-05-20', name: 'Nawóz wiosenny', description: 'Florovit Trawnik, 30g/m²' },
        ],
        waste: [
          { entity: 'sensor.harmonogram_bio',    name: 'Bio',     color: '#4CAF50' },
          { entity: 'sensor.harmonogram_papier',  name: 'Papier',  color: '#2196F3' },
          { entity: 'sensor.harmonogram_plastik', name: 'Plastik', color: '#FF9800' },
          { entity: 'sensor.harmonogram_szklo',   name: 'Szkło',   color: '#9C27B0' },
        ],
        days_fertilization: 14,
        days_waste: 3,
        szambo: { entity: 'sensor.szambo_zuzycie', capacity: 10, warn_pct: 75 },
      };
    }

    setConfig(config) {
      this._config = {
        people: [], fertilizations: [], waste: [],
        days_fertilization: 14, days_waste: 3,
        szambo: null,   // { entity, capacity, warn_pct }
        ...config,
      };
    }

    set hass(hass) {
      const first = !this._hass;
      this._hass = hass;
      this._render();
      if (first) {
        // Re-render every minute so clock/greeting stays fresh
        this._tick = setInterval(() => this._render(), 60000);
      }
    }

    disconnectedCallback() {
      if (this._tick) { clearInterval(this._tick); this._tick = null; }
    }

    // ── Reminder list ─────────────────────────────────────────────────────────

    _reminders() {
      const items = [];
      const fertDays  = this._config.days_fertilization || 14;
      const wasteDays = this._config.days_waste || 3;

      // Fertilizations (respect done state from weather-card localStorage)
      for (const f of (this._config.fertilizations || [])) {
        const days = daysUntil(f.date);
        if (days < 0 || days > fertDays) continue;
        let done = false;
        try { done = localStorage.getItem('aha-fertil-done:' + f.date) !== null; } catch (_) {}
        if (done) continue;
        items.push({ days, name: f.name, color: '#50C85A', icon: 'leaf' });
      }

      // Waste — supports both entity (read from HA) and hardcoded date
      for (const w of (this._config.waste || [])) {
        let dateStr = w.date || null;
        if (!dateStr && w.entity && this._hass) {
          dateStr = wasteEntityDate(this._hass.states[w.entity]);
        }
        if (!dateStr) continue;
        const days = daysUntil(dateStr);
        if (days < 0 || days > wasteDays) continue;
        items.push({ days, name: w.name, color: w.color || '#FF9800', icon: 'waste' });
      }

      // Szambo — show when fill % exceeds threshold (no date, priority by urgency)
      const sz = this._config.szambo;
      if (sz && sz.entity && this._hass) {
        const szVal  = parseFloat(this._hass.states[sz.entity]?.state);
        const szCap  = sz.capacity || 10;
        const szWarn = sz.warn_pct || 75;
        if (!isNaN(szVal)) {
          const pct = Math.round((szVal / szCap) * 100);
          if (pct >= szWarn) {
            const color = pct >= 90 ? '#FF3B30' : '#FF9500';
            const left  = (szCap - szVal).toFixed(1);
            items.push({
              days: -1,  // not date-based — sort to front when critical, after urgent dates
              pct, name: `Szambo ${pct}%`,
              sub: `zostało ~${left} m³`,
              color, icon: 'szambo',
              urgent: pct >= 90,
            });
          }
        }
      }

      // Sort: date-based by days asc, szambo by urgency at end (or front if critical)
      items.sort((a, b) => {
        if (a.days === -1 && b.days === -1) return b.pct - a.pct;
        if (a.days === -1) return a.urgent ? -1 : 1;
        if (b.days === -1) return b.urgent ? 1 : -1;
        return a.days - b.days;
      });
      return items;
    }

    // ── Main render ───────────────────────────────────────────────────────────

    _render() {
      if (!this._hass) return;
      const cfg  = this._config;
      const hass = this._hass;
      const now  = new Date();
      const h    = now.getHours();

      // Time & date
      const greetText = greeting(h);
      const dateText  = `${DAYS_PL[now.getDay()]}, ${now.getDate()} ${MONTHS_PL[now.getMonth()]}`;
      const timeText  = `${pad(h)}:${pad(now.getMinutes())}`;
      const tint      = todTint(h);

      // Weather
      const wxState = hass.states[cfg.weather_entity];
      const wxCond  = wxState?.state || 'cloudy';
      const wxLabel = WX_LABEL[wxCond] || wxCond;

      const tempRaw  = parseFloat(hass.states[cfg.temp_entity]?.state);
      const feelsRaw = parseFloat(hass.states[cfg.feels_entity]?.state);
      const windRaw  = parseFloat(hass.states[cfg.wind_entity]?.state);
      const rainRaw  = parseFloat(hass.states[cfg.rain_entity]?.state);

      const temp  = !isNaN(tempRaw)  ? tempRaw  : null;
      const feels = !isNaN(feelsRaw) ? feelsRaw : null;
      const wind  = !isNaN(windRaw)  ? windRaw  : null;
      const rain  = !isNaN(rainRaw)  ? rainRaw  : null;

      const tempC   = tempColor(temp);
      const tempStr = temp !== null ? Math.round(temp) + '°' : '—';

      // Forecast summary (array of {label, text})
      const fcAll        = hass.states[cfg.forecast_entity]?.attributes?.forecast || [];
      const summaryParts = buildSummaryParts(fcAll, now);

      // Sun: sunset from sun.sun
      const sun = hass.states['sun.sun'];
      let sunsetStr = null;
      if (sun?.attributes?.next_setting) {
        const ss = new Date(sun.attributes.next_setting);
        if (ss > now) sunsetStr = `${pad(ss.getHours())}:${pad(ss.getMinutes())}`;
      }

      // Stats chips
      const chips = [];
      if (feels !== null && temp !== null && Math.abs(feels - temp) >= 1)
        chips.push({ svg: _chipSVG('feels'), label: `odcz. ${Math.round(feels)}°` });
      if (wind !== null)
        chips.push({ svg: _chipSVG('wind'), label: `${Math.round(wind)} km/h` });
      if (rain !== null && rain > 0)
        chips.push({ svg: _chipSVG('rain'), label: `${rain.toFixed(1)} mm` });
      if (sunsetStr)
        chips.push({ svg: _chipSVG('sunset'), label: sunsetStr });

      // People
      const people = (cfg.people || []).map(p => {
        const s      = hass.states[p.entity];
        const isHome = s?.state === 'home';
        let sinceStr = '';
        if (!isHome && s?.last_changed) {
          const mins = Math.round((now - new Date(s.last_changed)) / 60000);
          sinceStr = mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h`;
        }
        const batRaw = p.battery_entity ? parseFloat(hass.states[p.battery_entity]?.state) : NaN;
        const bat    = !isNaN(batRaw) ? Math.round(batRaw) : null;
        // Avatar: try picture_entity, then tracker entity_picture
        const picSrc = p.picture_entity
          ? (hass.states[p.picture_entity]?.attributes?.entity_picture || null)
          : (s?.attributes?.entity_picture || null);
        const initial = (p.name || '?')[0].toUpperCase();
        return { name: p.name, isHome, sinceStr, bat, img: picSrc, initial };
      });

      // Reminders
      const reminders = this._reminders();

      // ── HTML ──────────────────────────────────────────────────────────────────

      const chipsHtml = chips.map(c =>
        `<div class="chip">${c.svg}<span class="chip-lbl">${c.label}</span></div>`
      ).join('');

      const peopleHtml = people.map(p => {
        const homeLabel = p.isHome ? 'w domu' : (p.sinceStr ? `poza · ${p.sinceStr}` : 'poza');
        const batHtml   = p.bat !== null
          ? `<span class="bat" style="color:${p.bat < 20 ? '#FF6B6B' : 'rgba(255,255,255,0.28)'}">${p.bat}%</span>`
          : '';
        const avatarInner = p.img
          ? `<img src="${p.img}" alt="${p.name}">`
          : `<span class="person-initial">${p.initial}</span>`;
        return `<div class="person">
          <div class="person-avatar">
            ${avatarInner}
            <div class="person-presence ${p.isHome ? 'dot-home' : 'dot-away'}"></div>
          </div>
          <div class="person-info">
            <span class="person-name">${p.name}</span>
            <span class="person-status">${homeLabel}</span>
          </div>
          ${batHtml}
        </div>`;
      }).join('');

      const remindersHtml = reminders.map(r => {
        const isUrgent = r.days <= 1 || r.urgent;
        const urgency  = r.days === -1 ? ''
          : r.days === 0 ? 'dziś!' : r.days === 1 ? 'jutro' : `za ${r.days} dni`;
        const iconHtml = r.icon === 'leaf' ? _remIconLeaf(r.color)
          : r.icon === 'szambo' ? _remIconSzambo(r.color)
          : _remIconWaste(r.color);
        return `<div class="reminder${isUrgent ? ' urgent' : ''}" style="--rc:${r.color}">
          ${iconHtml}
          <div class="rem-body">
            <span class="rem-name">${r.name}</span>
            ${r.sub ? `<span class="rem-sub">${r.sub}</span>` : ''}
          </div>
          ${urgency ? `<span class="rem-when">${urgency}</span>` : ''}
        </div>`;
      }).join('');

      this.shadowRoot.innerHTML = `
        <style>${this._css()}</style>
        <div class="card" style="--tint:${tint}">
          <div class="tint-overlay"></div>

          <!-- Header -->
          <div class="header">
            <div>
              <div class="greeting">${greetText}</div>
              <div class="date">${dateText}</div>
            </div>
            <div class="time">${timeText}</div>
          </div>

          <!-- Weather -->
          <div class="wx-row">
            <div class="wx-left">
              ${wxIconSVG(wxCond, 52)}
              <div class="wx-text">
                <div class="wx-cond">${wxLabel}</div>
                <div class="wx-temp" style="color:${tempC}">${tempStr}</div>
              </div>
            </div>
            ${chips.length ? `<div class="chips">${chipsHtml}</div>` : ''}
          </div>

          <!-- Forecast summary (animated carousel when 2 parts) -->
          ${summaryParts.length ? `
          <div class="summary-wrap${summaryParts.length > 1 ? ' animated' : ''}">
            ${summaryParts.map((p, i) =>
              `<div class="sum-slide" style="${summaryParts.length > 1 ? `animation-delay:${i * 5}s` : ''}">
                <span class="sum-label">${p.label}</span> ${p.text}
              </div>`
            ).join('')}
          </div>` : ''}

          <!-- People -->
          ${people.length ? `
            <div class="sep"></div>
            <div class="sect-label">Obecność</div>
            <div class="people">${peopleHtml}</div>` : ''}

          <!-- Reminders -->
          ${remindersHtml ? `
            <div class="sep"></div>
            <div class="sect-label">Przypomnienia</div>
            <div class="reminders">${remindersHtml}</div>` : ''}
        </div>`;
    }

    // ── CSS ───────────────────────────────────────────────────────────────────

    _css() {
      return `
      :host { display: block; font-family: -apple-system, system-ui, sans-serif; }

      .card {
        position: relative;
        background: linear-gradient(150deg, #0b1120 0%, #0d1828 100%);
        border-radius: 24px;
        border: 1px solid rgba(255,255,255,0.08);
        overflow: hidden;
        padding: 18px 18px 16px;
        color: rgba(255,255,255,0.88);
      }
      .tint-overlay {
        position: absolute; inset: 0; pointer-events: none; z-index: 0;
        background: var(--tint, transparent);
      }
      .card > * { position: relative; z-index: 1; }

      /* Header */
      .header {
        display: flex; justify-content: space-between; align-items: flex-start;
        margin-bottom: 16px;
      }
      .greeting {
        font-size: 23px; font-weight: 700; letter-spacing: -.4px;
        line-height: 1; margin-bottom: 5px;
        color: rgba(255,255,255,0.92);
      }
      .date {
        font-size: 11px; font-weight: 500;
        color: rgba(255,255,255,0.32); letter-spacing: .02em;
      }
      .time {
        font-size: 26px; font-weight: 200;
        color: rgba(255,255,255,0.30); letter-spacing: -1px;
        padding-top: 2px;
      }

      /* Weather row */
      .wx-row {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 10px;
      }
      .wx-left { display: flex; align-items: center; gap: 12px; }
      .wx-text {}
      .wx-cond {
        font-size: 12px; color: rgba(255,255,255,0.38);
        margin-bottom: 2px; font-weight: 500;
      }
      .wx-temp {
        font-size: 34px; font-weight: 700; letter-spacing: -.8px; line-height: 1;
      }

      /* Chips (right side of wx row) */
      .chips { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
      .chip {
        display: flex; align-items: center; gap: 5px;
        background: rgba(255,255,255,0.06);
        border-radius: 9px; padding: 4px 9px 4px 6px;
      }
      .chip svg { flex-shrink: 0; }
      .chip-lbl { font-size: 10.5px; color: rgba(255,255,255,0.52); font-weight: 500; }

      /* Forecast summary — animated carousel */
      @keyframes sum-cycle {
        /* Seamless: each slide covers its half, 0.2s crossfade overlap */
        0%   { opacity: 0; }
        2%   { opacity: 1; }
        50%  { opacity: 1; }
        52%  { opacity: 0; }
        100% { opacity: 0; }
      }
      @keyframes sum-fadein {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      .summary-wrap {
        font-size: 11.5px; color: rgba(255,255,255,0.42);
        background: rgba(255,255,255,0.045);
        border-radius: 11px; padding: 8px 11px;
        line-height: 1.5; letter-spacing: .01em;
      }
      /* Static (1 part): simple fade-in */
      .summary-wrap:not(.animated) .sum-slide {
        animation: sum-fadein .4s ease both;
      }
      /* Animated (2 parts): cross-fade carousel, fixed height, centered text */
      .summary-wrap.animated {
        position: relative;
        height: 36px;   /* fixed px — no box-model surprises */
        overflow: hidden;
        padding: 0;     /* slides handle their own padding */
      }
      .summary-wrap.animated .sum-slide {
        position: absolute; inset: 0;
        display: flex; align-items: center;
        padding: 0 11px;
        opacity: 0;
        animation: sum-cycle 10s linear infinite;
      }
      .sum-label {
        font-weight: 600; color: rgba(255,255,255,0.60);
        margin-right: 3px;
      }

      /* Separator */
      .sep { height: 1px; background: rgba(255,255,255,0.07); margin: 12px 0 10px; }

      /* Section label */
      .sect-label {
        font-size: 9px; font-weight: 700; letter-spacing: .10em;
        color: rgba(255,255,255,0.20); text-transform: uppercase;
        margin-bottom: 7px;
      }

      /* People */
      .people { display: flex; flex-direction: column; gap: 8px; }
      .person { display: flex; align-items: center; gap: 10px; }
      /* Avatar */
      .person-avatar {
        width: 34px; height: 34px; border-radius: 50%;
        position: relative; flex-shrink: 0;
        background: rgba(255,255,255,0.10);
        overflow: visible;
        display: flex; align-items: center; justify-content: center;
      }
      .person-avatar img {
        width: 34px; height: 34px; border-radius: 50%;
        object-fit: cover; display: block;
      }
      .person-initial {
        font-size: 14px; font-weight: 700;
        color: rgba(255,255,255,0.65);
      }
      /* Presence dot — bottom-right of avatar */
      .person-presence {
        position: absolute; bottom: 0; right: 0;
        width: 10px; height: 10px; border-radius: 50%;
        border: 2px solid #0d1828;
      }
      .dot-home {
        background: #30D158;
        box-shadow: 0 0 6px rgba(48,209,88,0.60);
      }
      .dot-away { background: rgba(255,255,255,0.22); }
      .person-info { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
      .person-name {
        font-size: 12.5px; font-weight: 600; color: rgba(255,255,255,0.78);
      }
      .person-status {
        font-size: 11px; color: rgba(255,255,255,0.35);
      }
      .bat { font-size: 10px; font-weight: 600; flex-shrink: 0; }

      /* Reminders */
      .reminders { display: flex; flex-direction: column; gap: 5px; }
      .reminder {
        display: flex; align-items: center; gap: 9px;
        border-left: 2.5px solid var(--rc);
        border-radius: 0 10px 10px 0;
        background: rgba(255,255,255,0.04);
        padding: 6px 10px 6px 9px;
        transition: background .12s;
      }
      .reminder.urgent {
        background: rgba(255,255,255,0.07);
      }
      .rem-icon { flex-shrink: 0; }
      .rem-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
      .rem-name {
        font-size: 11.5px; font-weight: 500;
        color: rgba(255,255,255,0.72);
      }
      .rem-sub {
        font-size: 10px; color: rgba(255,255,255,0.32);
      }
      .rem-when {
        font-size: 10.5px; font-weight: 700;
        color: var(--rc); opacity: .90; flex-shrink: 0;
      }
      `;
    }

    getCardSize() { return 5; }
  }

  // ── Chip SVG icons ────────────────────────────────────────────────────────────

  function _chipSVG(type) {
    const col = 'rgba(255,255,255,0.45)';
    const s   = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">`;
    if (type === 'feels')
      return s + `<circle cx="6.5" cy="5" r="2" stroke="${col}" stroke-width="1.2"/><line x1="6.5" y1="7" x2="6.5" y2="11" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/><circle cx="6.5" cy="11" r="1.8" fill="${col}"/></svg>`;
    if (type === 'wind')
      return s + `<path d="M2 5h7a2 2 0 000-4" stroke="${col}" stroke-width="1.2" stroke-linecap="round" fill="none"/><path d="M2 8h5a2 2 0 010 4" stroke="${col}" stroke-width="1.2" stroke-linecap="round" fill="none"/></svg>`;
    if (type === 'rain')
      return s + `<path d="M3 7a3.5 3.5 0 017 0H3z" fill="${col}" opacity=".7"/><circle cx="5.5" cy="5" r="2" fill="${col}" opacity=".7"/><line x1="3.5" y1="10" x2="3" y2="12" stroke="${col}" stroke-width="1.3" stroke-linecap="round"/><line x1="6.5" y1="10" x2="6" y2="12" stroke="${col}" stroke-width="1.3" stroke-linecap="round"/><line x1="9.5" y1="10" x2="9" y2="12" stroke="${col}" stroke-width="1.3" stroke-linecap="round"/></svg>`;
    if (type === 'sunset')
      return s + `<circle cx="6.5" cy="5.5" r="2.5" fill="${col}" opacity=".75"/><line x1="6.5" y1="1" x2="6.5" y2="0" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/><line x1="6.5" y1="11" x2="6.5" y2="10" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/><line x1="11" y1="5.5" x2="10" y2="5.5" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/><line x1="3" y1="5.5" x2="2" y2="5.5" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/><line x1="9.5" y1="2" x2="9" y2="3" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/><line x1="4" y1="8" x2="3.5" y2="9" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/><path d="M2 9h9" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/></svg>`;
    return '';
  }

  // ── Reminder icons ────────────────────────────────────────────────────────────

  function _remIconLeaf(col) {
    return `<svg class="rem-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 13c1-3 3-6 9-9-3 6-5 8-9 9z" fill="${col}" opacity=".85"/>
      <path d="M3 13c0-2 1-4 3-5" stroke="${col}" stroke-width="1" stroke-linecap="round" fill="none" opacity=".6"/>
    </svg>`;
  }

  function _remIconWaste(col) {
    return `<svg class="rem-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="4" y="5" width="8" height="9" rx="1.5" stroke="${col}" stroke-width="1.2" opacity=".85"/>
      <path d="M2 5h12M6 5V3h4v2" stroke="${col}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>
      <line x1="6.5" y1="7" x2="6.5" y2="12" stroke="${col}" stroke-width="1" stroke-linecap="round" opacity=".6"/>
      <line x1="9.5" y1="7" x2="9.5" y2="12" stroke="${col}" stroke-width="1" stroke-linecap="round" opacity=".6"/>
    </svg>`;
  }

  function _remIconSzambo(col) {
    // Stylised underground tank with fill level indicator
    return `<svg class="rem-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="5" width="12" height="8" rx="2" stroke="${col}" stroke-width="1.2" opacity=".85"/>
      <rect x="2" y="9" width="12" height="4" rx="0" fill="${col}" opacity=".22"
        style="clip-path:inset(0 0 0 0 round 0 0 2px 2px)"/>
      <path d="M6 5V3.5a2 2 0 014 0V5" stroke="${col}" stroke-width="1.2" stroke-linecap="round" opacity=".70"/>
      <line x1="5" y1="9" x2="11" y2="9" stroke="${col}" stroke-width="1" stroke-linecap="round" opacity=".55"/>
    </svg>`;
  }

  // ── Register ───────────────────────────────────────────────────────────────────

  if (!customElements.get('aha-briefing-card')) {
    customElements.define('aha-briefing-card', BriefingCard);
  }
  if (!customElements.get('briefing-card')) {
    customElements.define('briefing-card', class extends BriefingCard {});
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.find(c => c.type === 'aha-briefing-card')) {
    window.customCards.push({
      type: 'aha-briefing-card',
      name: 'AHA Briefing Card',
      description: 'Daily briefing: weather summary, smart forecast, presence & reminders',
    });
  }
})();
