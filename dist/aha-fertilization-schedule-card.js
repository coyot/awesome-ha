/**
 * aha-fertilization-schedule-card — Full fertilization schedule timeline
 *
 * Config:
 *   title:          string   (default 'Harmonogram nawożenia')
 *   fertilizations: [{date:'YYYY-MM-DD', name:'...', description:'...'}]
 *
 * Registers as: aha-fertilization-schedule-card
 */
(function () {
  'use strict';

  const MONTHS_PL  = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec',
                       'Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
  const SHORT_MON  = ['STY','LUT','MAR','KWI','MAJ','CZE','LIP','SIE','WRZ','PAŹ','LIS','GRU'];

  function pad(n)  { return String(n).padStart(2, '0'); }
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  // Classify entry type from name/description
  function entryType(f) {
    const n = (f.name + ' ' + (f.description || '')).toLowerCase();
    if (n.includes('chwastox'))                                          return 'herbicide';
    if (n.includes('oprysk') || n.includes('optysil') ||
        n.includes('dolistny') || n.includes('żelazo') ||
        n.includes('zelazo'))                                            return 'spray';
    return 'granular';
  }

  // ── SVG Icons ─────────────────────────────────────────────────────────────
  const SVG_GRAN = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3.2" fill="currentColor"/>
    <circle cx="6.5" cy="7.5" r="2.2" fill="currentColor" opacity=".65"/>
    <circle cx="17.5" cy="7.5" r="2.2" fill="currentColor" opacity=".65"/>
    <circle cx="6.5" cy="16.5" r="2.2" fill="currentColor" opacity=".65"/>
    <circle cx="17.5" cy="16.5" r="2.2" fill="currentColor" opacity=".65"/>
    <circle cx="12" cy="4.5" r="1.6" fill="currentColor" opacity=".35"/>
    <circle cx="12" cy="19.5" r="1.6" fill="currentColor" opacity=".35"/>
  </svg>`;

  const SVG_SPRAY = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M12 3c-3 0-7 3-7 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M12 3c3 0 7 3 7 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M8 17.5v1.5M12 16.5v2.5M16 17.5v1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M5 12h14" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity=".35"/>
  </svg>`;

  const SVG_HERB = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M12 4v16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M9 8.5l3-3.5 3 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="7.5" cy="15" r="3" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="16.5" cy="15" r="3" stroke="currentColor" stroke-width="1.4"/>
  </svg>`;

  // ── Card ──────────────────────────────────────────────────────────────────
  class FertilizationScheduleCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._config = {};
    }

    static getStubConfig() {
      return {
        title: 'Harmonogram nawożenia',
        fertilizations: [
          { date: '2027-04-10', name: 'YaraMila Complex', description: 'Start sezonu, 25 g/m²' },
        ],
      };
    }

    setConfig(config) {
      this._config = {
        title: 'Harmonogram nawożenia',
        fertilizations: [],
        ...config,
      };
      this._render();
    }

    set hass(h) { this._hass = h; }

    _render() {
      const tod   = todayStr();
      const ferts = [...(this._config.fertilizations || [])]
        .sort((a, b) => a.date < b.date ? -1 : 1);

      // Find first upcoming entry (for "next" badge)
      const nextIdx = ferts.findIndex(f => f.date >= tod);

      // Group: year → monthIndex → entries[]
      const years = new Map();
      ferts.forEach((f, idx) => {
        const [y, m] = f.date.split('-');
        if (!years.has(y)) years.set(y, new Map());
        const mi = parseInt(m) - 1;
        const byM = years.get(y);
        if (!byM.has(mi)) byM.set(mi, []);
        byM.get(mi).push({ f, idx });
      });

      let bodyHtml = '';
      const currentYear = String(new Date().getFullYear());

      for (const [year, byMonth] of years) {
        const isCurYear = year === currentYear;
        bodyHtml += `<div class="year-sep"><span>${year}</span></div>`;

        for (const [mi, entries] of byMonth) {
          bodyHtml += `<div class="month-lbl">${MONTHS_PL[mi]}</div>`;

          for (const { f, idx } of entries) {
            const isPast   = f.date < tod;
            const isToday  = f.date === tod;
            const isNext   = idx === nextIdx && !isToday;
            const type     = entryType(f);
            const day      = parseInt(f.date.split('-')[2]);
            const icon     = type === 'spray' ? SVG_SPRAY : type === 'herbicide' ? SVG_HERB : SVG_GRAN;
            const accentCls= type === 'spray' ? 'a-spray' : type === 'herbicide' ? 'a-herb' : 'a-gran';

            const desc = (f.description || '').trim().replace(/\n/g, ' ');

            let badge = '';
            if (isToday) badge = '<span class="badge b-today">dziś</span>';
            else if (isNext) badge = '<span class="badge b-next">następne</span>';

            const rowCls = ['row',
              isPast  ? 'past'  : '',
              isToday ? 'today' : '',
              isNext  ? 'next'  : '',
            ].filter(Boolean).join(' ');

            bodyHtml += `
              <div class="${rowCls}">
                <div class="dpill">
                  <span class="dnum">${day}</span>
                  <span class="dmon">${SHORT_MON[mi]}</span>
                </div>
                <div class="ico ${accentCls}">${icon}</div>
                <div class="info">
                  <div class="name">${f.name}</div>
                  ${desc ? `<div class="desc">${desc}</div>` : ''}
                </div>
                ${badge}
              </div>`;
          }
        }
      }

      this.shadowRoot.innerHTML = `<style>${this._css()}</style>
        <div class="card">
          <div class="hdr"><span class="title">${this._config.title}</span></div>
          <div class="body">${bodyHtml}</div>
        </div>`;
    }

    _css() {
      return `
      :host { display:block; font-family:-apple-system,system-ui,sans-serif; }
      .card {
        background: linear-gradient(150deg,#0b1120 0%,#0d1828 100%);
        border-radius: 22px;
        border: 1px solid rgba(255,255,255,0.07);
        overflow: hidden;
      }
      .hdr {
        padding: 13px 16px 11px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .title {
        font-size: 11px; font-weight: 600;
        color: rgba(255,255,255,0.35);
        text-transform: uppercase; letter-spacing:.08em;
      }
      .body {
        padding: 6px 10px 14px;
        max-height: 560px;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,0.10) transparent;
      }
      .body::-webkit-scrollbar { width:3px; }
      .body::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.10); border-radius:99px; }

      /* Year separator */
      .year-sep {
        display:flex; align-items:center; gap:8px;
        margin: 12px 0 6px;
      }
      .year-sep::before, .year-sep::after {
        content:''; flex:1;
        height:1px; background:rgba(255,255,255,0.06);
      }
      .year-sep span {
        font-size:9.5px; font-weight:700;
        color:rgba(255,255,255,0.18);
        letter-spacing:.14em; text-transform:uppercase;
      }

      /* Month label */
      .month-lbl {
        font-size:9px; font-weight:700;
        color:rgba(255,255,255,0.22);
        letter-spacing:.10em; text-transform:uppercase;
        padding: 8px 4px 3px;
      }

      /* Row */
      .row {
        display:flex; align-items:flex-start;
        gap:9px; padding:7px 6px;
        border-radius:11px; margin-bottom:2px;
        transition:background .10s;
        position:relative;
      }
      .row:hover { background:rgba(255,255,255,0.04); }
      .row.past  { opacity:0.28; }
      .row.next  { background:rgba(151,196,89,0.05); }
      .row.today {
        background:rgba(151,196,89,0.10);
        border:1px solid rgba(151,196,89,0.28);
      }

      /* Date pill */
      .dpill {
        display:flex; flex-direction:column; align-items:center;
        background:rgba(255,255,255,0.06);
        border-radius:8px; padding:4px 7px;
        min-width:34px; flex-shrink:0;
      }
      .row.today .dpill { background:rgba(151,196,89,0.18); }
      .row.next  .dpill { background:rgba(151,196,89,0.09); }
      .dnum {
        font-size:15px; font-weight:700;
        color:rgba(255,255,255,0.85); line-height:1;
      }
      .dmon {
        font-size:7.5px; font-weight:700;
        color:rgba(255,255,255,0.30); letter-spacing:.04em;
        margin-top:2px;
      }

      /* Icon */
      .ico {
        display:flex; align-items:center; justify-content:center;
        width:26px; height:26px; border-radius:7px;
        flex-shrink:0; margin-top:2px;
      }
      .a-gran { color:#97C459; background:rgba(151,196,89,0.13); }
      .a-spray { color:#4da8ff; background:rgba(77,168,255,0.13); }
      .a-herb  { color:#EF9F27; background:rgba(239,159,39,0.13); }

      /* Content */
      .info { flex:1; min-width:0; }
      .name {
        font-size:12px; font-weight:600;
        color:rgba(255,255,255,0.80); line-height:1.35;
      }
      .row.today .name { color:#fff; }
      .desc {
        font-size:10px; color:rgba(255,255,255,0.34);
        margin-top:2px; line-height:1.50; word-break:break-word;
      }

      /* Badges */
      .badge {
        font-size:8.5px; font-weight:700; letter-spacing:.05em;
        text-transform:uppercase; border-radius:5px;
        padding:2px 6px; flex-shrink:0; align-self:center;
      }
      .b-today {
        color:#97C459; background:rgba(151,196,89,0.14);
        border:1px solid rgba(151,196,89,0.32);
      }
      .b-next  {
        color:rgba(151,196,89,0.70);
        background:rgba(151,196,89,0.07);
        border:1px solid rgba(151,196,89,0.16);
      }
      `;
    }

    getCardSize() { return 9; }
  }

  if (!customElements.get('aha-fertilization-schedule-card')) {
    customElements.define('aha-fertilization-schedule-card', FertilizationScheduleCard);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.find(c => c.type === 'aha-fertilization-schedule-card')) {
    window.customCards.push({
      type: 'aha-fertilization-schedule-card',
      name: 'AHA Fertilization Schedule Card',
      description: 'Full fertilization schedule timeline — all entries grouped by month',
    });
  }
})();
