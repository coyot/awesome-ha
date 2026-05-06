/**
 * aha-log-history-card.js
 * Log History Card — Timeline · Ikony · Avatary · Paginacja
 *
 * Czyta wpisy JSON z input_text.log_h1 … input_text.log_hN
 * Obsługiwane typy: porecz | szambo | wjazd | kontaktrony_22
 *
 * Config:
 *   slots:     (optional) liczba slotów do odczytu, default: 50
 *   page_size: (optional) wpisy na stronę, default: 10
 *   person_tk: (optional) entity_id osoby TK, default: person.tk
 *   person_mk: (optional) entity_id osoby MK, default: person.mk
 *
 * Usage:
 *   type: custom:aha-log-history-card
 *
 * Registration: aha-log-history-card + alias log-history-card
 */

const LH_STYLES = `
  :host { display: block; width: 100%; }
  * { box-sizing: border-box; }

  .card {
    background: #1c1c1e;
    border-radius: 20px;
    padding: 16px;
    font-family: -apple-system, system-ui, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  /* ── Range tabs ── */
  .range-row {
    display: flex;
    gap: 5px;
    margin-bottom: 14px;
  }
  .range-btn {
    padding: 4px 11px;
    border-radius: 20px;
    cursor: pointer;
    border: 0.5px solid rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.04);
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,0.30);
    transition: background .2s ease, color .2s ease, border-color .2s ease;
  }
  .range-btn.active {
    border-color: rgba(255,255,255,0.22);
    background: rgba(255,255,255,0.11);
    font-weight: 600;
    color: rgba(255,255,255,0.72);
  }

  /* ── Timeline container ── */
  .timeline {
    position: relative;
    padding-left: 36px;
  }
  .timeline-line {
    position: absolute;
    left: 13px;
    top: 6px;
    bottom: 6px;
    width: 1px;
    background: rgba(255,255,255,0.07);
  }

  /* ── Day separator ── */
  .day-sep {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .05em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.18);
    padding: 10px 0 8px;
    margin-left: -36px;
  }
  .day-sep.first { padding-top: 0; }

  /* ── Entry row ── */
  .entry {
    position: relative;
    padding-bottom: 12px;
  }
  .entry-node {
    position: absolute;
    left: -36px;
    top: 0;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: 1px solid transparent;
  }
  .entry-body {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    padding-top: 3px;
  }
  .entry-main { flex: 1; min-width: 0; }
  .entry-title {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .entry-detail {
    font-size: 11px;
    color: rgba(255,255,255,0.30);
    margin-top: 2px;
    line-height: 1.3;
    white-space: normal;
  }
  .entry-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
  }
  .entry-time {
    font-size: 10px;
    color: rgba(255,255,255,0.22);
    font-weight: 500;
    white-space: nowrap;
  }

  /* ── Avatars ── */
  .avatars { display: flex; align-items: center; }
  .avatar {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px solid #1c1c1e;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .avatar span { font-size: 7px; font-weight: 700; }

  /* ── Empty state ── */
  .empty {
    text-align: center;
    padding: 28px 0;
    font-size: 12px;
    color: rgba(255,255,255,0.22);
  }

  /* ── Load more ── */
  .load-more {
    margin-top: 12px;
    width: 100%;
    padding: 8px;
    border-radius: 10px;
    cursor: pointer;
    border: 0.5px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,0.30);
    text-align: center;
    transition: background .15s ease;
  }
  .load-more:active { background: rgba(255,255,255,0.08); }
`;

// ── IIFE — żeby helper functions nie wyciekały do globalnego scope w bundlu ──
(function () {

// ── SVG ICONS ────────────────────────────────────────────────────────────────

function iconSvg(e) {
  const s = (color, path) =>
    `<svg viewBox="0 0 24 24" fill="none" width="13" height="13">${path(color)}</svg>`;

  if (e.typ === 'porecz') {
    if (e.akcja === 'ON') return s('rgba(255,214,10,0.9)', c => `
      <circle cx="12" cy="12" r="4" fill="${c}"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke="${c.replace('0.9','0.7')}" stroke-width="2" stroke-linecap="round"/>`);
    return s('rgba(150,150,155,0.50)', c => `
      <circle cx="12" cy="12" r="5" stroke="${c}" stroke-width="1.8"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2"
        stroke="${c.replace('0.50','0.25')}" stroke-width="1.5" stroke-linecap="round"/>`);
  }

  if (e.typ === 'szambo') return s('rgba(255,159,10,0.85)', c => `
    <rect x="3" y="11" width="18" height="8" rx="2" fill="${c.replace('0.85','0.45')}"/>
    <path d="M7 11V8a5 5 0 0110 0v3" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="8" cy="15" r="1" fill="${c}"/>
    <circle cx="16" cy="15" r="1" fill="${c}"/>`);

  if (e.typ === 'wjazd') {
    const people = Array.isArray(e.kto) ? e.kto : [e.kto];
    const col = people.length > 1 || people[0] === 'mk'
      ? 'rgba(191,90,242,0.85)' : 'rgba(10,132,255,0.85)';
    return s(col, c => `
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`);
  }

  if (e.typ === 'kontaktrony_22') {
    const col = e.otwarte > 0 ? 'rgba(255,69,58,0.85)' : 'rgba(52,199,89,0.85)';
    return s(col, c => `
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="${c.replace('0.85','0.25')}" stroke="${c}" stroke-width="1.6"/>
      <circle cx="12" cy="9" r="2.5" fill="${c}"/>`);
  }

  return `<svg viewBox="0 0 24 24" fill="none" width="13" height="13">
    <circle cx="12" cy="12" r="5" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
  </svg>`;
}

// ── NODE STYLE ────────────────────────────────────────────────────────────────

function nodeStyle(e) {
  if (e.typ === 'porecz')
    return e.akcja === 'ON'
      ? { bg: 'rgba(255,214,10,0.14)', outline: 'rgba(255,214,10,0.25)' }
      : { bg: 'rgba(99,99,102,0.18)',  outline: 'rgba(99,99,102,0.20)' };
  if (e.typ === 'szambo')
    return { bg: 'rgba(255,159,10,0.14)', outline: 'rgba(255,159,10,0.25)' };
  if (e.typ === 'wjazd') {
    const people = Array.isArray(e.kto) ? e.kto : [e.kto];
    return people.length > 1 || people[0] === 'mk'
      ? { bg: 'rgba(191,90,242,0.14)', outline: 'rgba(191,90,242,0.22)' }
      : { bg: 'rgba(10,132,255,0.14)', outline: 'rgba(10,132,255,0.22)' };
  }
  if (e.typ === 'kontaktrony_22')
    return e.otwarte > 0
      ? { bg: 'rgba(255,69,58,0.14)',  outline: 'rgba(255,69,58,0.25)' }
      : { bg: 'rgba(52,199,89,0.14)',  outline: 'rgba(52,199,89,0.22)' };
  return { bg: 'rgba(255,255,255,0.07)', outline: 'rgba(255,255,255,0.10)' };
}

// ── TITLE + DETAIL ────────────────────────────────────────────────────────────

function titleAndDetail(e, PEOPLE) {
  if (e.typ === 'porecz') {
    const col = e.akcja === 'ON' ? 'rgba(255,214,10,0.90)' : 'rgba(150,150,155,0.55)';
    return {
      titleColor: col,
      titleText: `Poręcz — ${e.akcja === 'ON' ? 'włączono' : 'wyłączono'}`,
      detail: e.info ?? '',
      avatarPeople: null,
    };
  }
  if (e.typ === 'szambo') return {
    titleColor: 'rgba(255,159,10,0.90)',
    titleText: 'Wywóz szamba',
    detail: `Dom1: ${e.d1m}m³ = ${e.d1z}zł · Dom2: ${e.d2m}m³ = ${e.d2z}zł · Razem: ${e.lm}m³`,
    avatarPeople: null,
  };
  if (e.typ === 'wjazd') {
    const people = Array.isArray(e.kto) ? e.kto : [e.kto];
    const names  = people.map(p => PEOPLE[p]?.name ?? p).join(' & ');
    const both   = people.length > 1;
    const col    = both || people[0] === 'mk' ? 'rgba(191,90,242,0.90)' : 'rgba(10,132,255,0.90)';
    return {
      titleColor: col,
      titleText: `Wjazd — ${names}`,
      detail: 'brama otwarta automatycznie',
      avatarPeople: people,
    };
  }
  if (e.typ === 'kontaktrony_22') {
    const n   = e.otwarte ?? 0;
    const col = n > 0 ? 'rgba(255,69,58,0.90)' : 'rgba(52,199,89,0.90)';
    const txt = n > 0 ? `Otwarte czujniki (${n})` : 'Wszystkie czujniki zamknięte';
    const lista = e.lista ? e.lista.split(' | ').join('\n') : '';
    return {
      titleColor: col,
      titleText: txt,
      detail: lista,
      avatarPeople: null,
    };
  }
  return {
    titleColor: 'rgba(255,255,255,0.60)',
    titleText: e.typ ?? '—',
    detail: '',
    avatarPeople: null,
  };
}

// ── DATE HELPERS ──────────────────────────────────────────────────────────────

function lhcFmtTime(ts) {
  return new Date(ts).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(ts) {
  const d     = new Date(ts);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yest  = new Date(today); yest.setDate(yest.getDate() - 1);
  if (d >= today) return 'Dziś';
  if (d >= yest)  return 'Wczoraj';
  return d.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
}

function dateKey(ts) { return new Date(ts).toDateString(); }

// ── CARD ELEMENT ──────────────────────────────────────────────────────────────

class AhaLogHistoryCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass   = null;
    this._config = {};
    this._range  = 'week';
    this._page   = 1;
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  // ── READ ENTRIES ───────────────────────────────────────────────────────────

  _readEntries() {
    const slots = this._config.slots ?? 50;
    const entries = [];
    for (let i = 1; i <= slots; i++) {
      const raw = this._hass?.states[`input_text.log_h${i}`]?.state ?? '';
      if (!raw || raw === 'unknown' || raw === 'unavailable' || !raw.startsWith('{')) continue;
      try {
        const e = JSON.parse(raw);
        if (e.ts) entries.push(e);
      } catch (_) {}
    }
    // sort newest first (slots may not be perfectly ordered)
    entries.sort((a, b) => new Date(b.ts) - new Date(a.ts));
    return entries;
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────

  _render() {
    if (!this._hass) return;

    const PAGE_SIZE = this._config.page_size ?? 10;
    const personTkId = this._config.person_tk ?? 'person.tk';
    const personMkId = this._config.person_mk ?? 'person.mk';

    const imgTK = this._hass.states[personTkId]?.attributes?.entity_picture ?? null;
    const imgMK = this._hass.states[personMkId]?.attributes?.entity_picture ?? null;

    const PEOPLE = {
      tk: { name: 'Tomek',  initials: 'TK', bg: '#1a3a5c', text: '#5ac8fa', img: imgTK },
      mk: { name: 'Monika', initials: 'MK', bg: '#3a1a5c', text: '#bf5af2', img: imgMK },
    };

    const allEntries = this._readEntries();

    const rangeMs = { today: 86400000, week: 7 * 86400000, month: 30 * 86400000 }[this._range] ?? 7 * 86400000;
    const now     = Date.now();
    const visible = allEntries.filter(e => (now - new Date(e.ts).getTime()) <= rangeMs);
    const shown   = visible.slice(0, this._page * PAGE_SIZE);
    const hasMore = visible.length > shown.length;
    const remaining = visible.length - shown.length;

    // ── build DOM ────────────────────────────────────────────────────────────

    const shadow = this.shadowRoot;
    shadow.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = LH_STYLES;
    shadow.appendChild(style);

    const card = document.createElement('div');
    card.className = 'card';

    // Range row
    const rangeRow = document.createElement('div');
    rangeRow.className = 'range-row';
    [['today', 'Dziś'], ['week', 'Tydzień'], ['month', 'Miesiąc']].forEach(([key, label]) => {
      const btn = document.createElement('div');
      btn.className = 'range-btn' + (this._range === key ? ' active' : '');
      btn.textContent = label;
      btn.addEventListener('click', () => {
        this._range = key;
        this._page  = 1;
        this._render();
      });
      rangeRow.appendChild(btn);
    });
    card.appendChild(rangeRow);

    // Timeline
    const timeline = document.createElement('div');
    timeline.className = 'timeline';

    const line = document.createElement('div');
    line.className = 'timeline-line';
    timeline.appendChild(line);

    if (visible.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'Brak zdarzeń w tym zakresie';
      timeline.appendChild(empty);
    } else {
      let lastDate = null;
      let firstSep = true;

      shown.forEach(e => {
        const dk = dateKey(e.ts);
        if (dk !== lastDate) {
          const sep = document.createElement('div');
          sep.className = 'day-sep' + (firstSep ? ' first' : '');
          sep.textContent = fmtDate(e.ts);
          timeline.appendChild(sep);
          lastDate = dk;
          firstSep = false;
        }

        const ns  = nodeStyle(e);
        const td  = titleAndDetail(e, PEOPLE);

        // entry wrapper
        const entry = document.createElement('div');
        entry.className = 'entry';

        // node
        const node = document.createElement('div');
        node.className = 'entry-node';
        node.style.background  = ns.bg;
        node.style.outlineColor = ns.outline;
        node.innerHTML = iconSvg(e);
        entry.appendChild(node);

        // body
        const body = document.createElement('div');
        body.className = 'entry-body';

        // main (title + detail)
        const main = document.createElement('div');
        main.className = 'entry-main';

        const titleEl = document.createElement('div');
        titleEl.className = 'entry-title';
        titleEl.style.color = td.titleColor;
        titleEl.textContent = td.titleText;
        main.appendChild(titleEl);

        if (td.detail) {
          const detailEl = document.createElement('div');
          detailEl.className = 'entry-detail';
          detailEl.style.whiteSpace = 'pre-line';
          detailEl.textContent = td.detail;
          main.appendChild(detailEl);
        }

        body.appendChild(main);

        // right (avatars + time)
        const right = document.createElement('div');
        right.className = 'entry-right';

        if (td.avatarPeople && td.avatarPeople.length > 0) {
          const avatarsEl = document.createElement('div');
          avatarsEl.className = 'avatars';
          td.avatarPeople.forEach((pk, i) => {
            const p = PEOPLE[pk];
            if (!p) return;
            const av = document.createElement('div');
            av.className = 'avatar';
            av.style.background  = p.bg;
            av.style.marginLeft  = i === 0 ? '0' : '-5px';
            if (p.img) {
              const img = document.createElement('img');
              img.src = p.img;
              av.appendChild(img);
            } else {
              const sp = document.createElement('span');
              sp.textContent = p.initials;
              sp.style.color = p.text;
              av.appendChild(sp);
            }
            avatarsEl.appendChild(av);
          });
          right.appendChild(avatarsEl);
        }

        const timeEl = document.createElement('div');
        timeEl.className = 'entry-time';
        timeEl.textContent = lhcFmtTime(e.ts);
        right.appendChild(timeEl);

        body.appendChild(right);
        entry.appendChild(body);
        timeline.appendChild(entry);
      });
    }

    card.appendChild(timeline);

    // Load more
    if (hasMore) {
      const more = document.createElement('div');
      more.className = 'load-more';
      more.textContent = `Pokaż więcej (${remaining})`;
      more.addEventListener('click', () => {
        this._page++;
        this._render();
      });
      card.appendChild(more);
    }

    shadow.appendChild(card);
  }

  getCardSize() { return 4; }
}

customElements.define('aha-log-history-card', AhaLogHistoryCard);
customElements.define('log-history-card', class extends AhaLogHistoryCard {});

})(); // end IIFE
