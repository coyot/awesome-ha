// astronomical-events-card.js
// Place in: /config/www/astronomical-events-card.js
// Register in Lovelace resources:
//   url: /local/astronomical-events-card.js
//   type: module

// ── REST sensor (wklej do configuration.yaml) ────────────────────────────────
// sensor:
//   - platform: rest
//     name: upcoming_launches
//     resource: https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=10&format=json
//     value_template: "{{ value_json.count }}"
//     json_attributes:
//       - results
//     scan_interval: 3600
//
// Karta:
//   type: custom:aha-astronomical-events-card
//   launches_entity: sensor.upcoming_launches   # opcjonalne, to jest default
// ─────────────────────────────────────────────────────────────────────────────

const TYPES = {
  eclipse:       { label: 'Zaćmienie Słońca',   r: 220, g: 160, b: 30  },
  lunar_eclipse: { label: 'Zaćmienie Księżyca', r: 220, g: 70,  b: 70  },
  meteors:       { label: 'Rój meteorów',       r: 130, g: 90,  b: 230 },
  conjunction:   { label: 'Koniunkcja',         r: 60,  g: 180, b: 240 },
  planet:        { label: 'Planety',            r: 50,  g: 190, b: 150 },
  moon:          { label: 'Księżyc',            r: 200, g: 180, b: 80  },
  launch:        { label: 'Start rakiety',      r: 10,  g: 132, b: 255 },
};

// ── Kolory agencji ────────────────────────────────────────────────────────────
function agencyColor(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('spacex'))    return { r: 10,  g: 132, b: 255 }; // niebieski
  if (n.includes('nasa'))      return { r: 255, g: 107, b: 53  }; // pomarańcz
  if (n.includes('esa') || n.includes('european')) return { r: 52, g: 199, b: 89 }; // zielony
  if (n.includes('roscosmos') || n.includes('russian')) return { r: 255, g: 69, b: 58 }; // czerwony
  if (n.includes('rocket lab')) return { r: 191, g: 90, b: 242 }; // fiolet
  if (n.includes('ula'))       return { r: 255, g: 214, b: 10  }; // żółty
  if (n.includes('isro'))      return { r: 255, g: 149, b: 0   }; // amber
  if (n.includes('jaxa'))      return { r: 100, g: 210, b: 255 }; // błękit
  return { r: 100, g: 210, b: 255 };
}

// ── Status startu → kolor ─────────────────────────────────────────────────────
function statusColor(abbrev) {
  if (abbrev === 'Go')      return { r: 52,  g: 199, b: 89  };
  if (abbrev === 'Success') return { r: 52,  g: 199, b: 89  };
  if (abbrev === 'Hold')    return { r: 255, g: 214, b: 10  };
  if (abbrev === 'Failure') return { r: 255, g: 69,  b: 58  };
  return { r: 99, g: 99, b: 102 }; // TBD / inne
}

// ── Statyczne zjawiska astronomiczne ─────────────────────────────────────────
const RAW = [
  { date:'2026-04-22', type:'meteors',       name:'Liridy 2026',                     desc:'Jeden z najstarszych rojów — okruchy komety Thatcher (1861). Meteory szybkie (49 km/s), często zostawiają smugi. Aktywne 16–25 kwietnia.',       how:'Wyjdź po 01:00, z dala od świateł. Patrz na całe niebo. 20 min adaptacji oka.',                                tip:'Pora: 01:00–04:00 · Bez sprzętu' },
  { date:'2026-06-09', type:'conjunction',   name:'Wenus + Jowisz',                  desc:'Dwie najjaśniejsze planety zbliżają się na 1.6°. Lornetka ujawni 4 księżyce galileuszowe Jowisza.',                                             how:'Patrz na zachód–NW 30–60 min po zachodzie Słońca.',                                                                tip:'Pora: 20:30–22:00 · Kierunek: zachód-NW · Lornetka' },
  { date:'2026-08-12', type:'eclipse',       name:'Zaćmienie Słońca + Perseidy',     desc:'Zaćmienie częściowe ~80% po południu, a nocą Perseidy przy nowiu — czarne niebo. Takie połączenie raz na dekady.',                             how:'Zaćmienie 19:15–20:04 — OKULARY ISO 12312-2 obowiązkowe. Perseidy: od 23:00 kierunek NE.',                          tip:'Okulary ISO 12312-2 obowiązkowe · Perseidy: po 23:00' },
  { date:'2026-08-28', type:'lunar_eclipse', name:'Zaćmienie Księżyca 96%',          desc:'Ziemia zakryje 96% tarczy. Księżyc nabierze głębokiego czerwono-pomarańczowego koloru. Widoczne z Polski.',                                     how:'Wyjdź rano — Księżyc nisko na zachodzie. Lornetka podkreśli barwy.',                                               tip:'Pora: 04:12–05:52 · Kierunek: zachód · Lornetka' },
  { date:'2026-10-04', type:'planet',        name:'Saturn w opozycji 2026',          desc:'Saturn wschodzi o zachodzie Słońca i widoczny jest całą noc. Pierścienie wyraźnie lepsze niż w 2025.',                                          how:'Lornetka pokaże owalny kształt. Teleskop 60mm+ ujawni pierścienie. Szukaj w Rybach.',                              tip:'Pora: cała noc · Lornetka lub mały teleskop' },
  { date:'2026-10-21', type:'meteors',       name:'Orionidy 2026',                   desc:'Okruchy słynnej komety Halleya wpadające z 66 km/s. Księżyc (72%) zachodzi po północy — potem lepiej.',                                        how:'Obserwuj po 02:00. Radiant blisko Betelgezy.',                                                                     tip:'Pora: 02:00–05:00 · Bez sprzętu' },
  { date:'2026-11-12', type:'meteors',       name:'Taurydy Północne 2026',           desc:'Wolne, ale spektakularne bolidy rozświetlające całe niebo. W 2026 jedne z lepszych warunków w dekadzie (księżyc 7%).',                          how:'Obserwuj całą noc. Warto nagrywać kamerą szerokokątną.',                                                           tip:'Pora: od 21:00 · Gołe oko lub kamera' },
  { date:'2026-11-15', type:'conjunction',   name:'Mars + Jowisz 2026',              desc:'Rdzawy Mars i kremowy Jowisz zbliżają się do 1°. Kontrast barw efektowny nawet gołym okiem.',                                                  how:'Wstań 1.5h przed wschodem Słońca. Lornetka pokaże 4 księżyce Jowisza.',                                           tip:'Pora: 04:00–06:00 · Kierunek: południe · Lornetka' },
  { date:'2026-11-17', type:'meteors',       name:'Leonidy 2026',                    desc:'Najszybsze meteory roku (71 km/s) — długie świetliste smugi. Księżyc (45%) zachodzi po północy.',                                              how:'Obserwuj po 01:00. Radiant w gwiazdozbiorze Lwa.',                                                                 tip:'Pora: 01:00–05:00 · Bez sprzętu' },
  { date:'2026-12-13', type:'meteors',       name:'Geminidy 2026',                   desc:'NAJLEPSZY rój roku — liczne, kolorowe, od wczesnego wieczoru. Asteroida 3200 Phaethon. W 2026 prawie bez księżyca (21%).',                     how:'Wyjdź po 21:00. Radiant w Bliźniętach. Koc i ciepłe ubranie!',                                                   tip:'Pora: 21:00–04:00 · Bez sprzętu' },
  { date:'2026-12-23', type:'moon',          name:'Superksiężyc — rekord 2026',      desc:'Najbliższy Księżyc od 7 lat (221 668 km). Tarcza wyraźnie większa i jaśniejsza. Kolejny tak bliski dopiero w 2028.',                           how:'Obserwuj przy wschodzie — iluzja horyzontu. Zdjęcie z punktem odniesienia.',                                      tip:'Pora: wschód Księżyca · Aparat' },
  { date:'2027-01-03', type:'meteors',       name:'Kwadrantydy 2027',                desc:'Ostry szczyt trwający kilka godzin — timing kluczowy. W 2027 lepsze warunki niż rok wcześniej (księżyc 20%).',                                 how:'Szczyt ok. 03:00 w nocy z 2 na 3 stycznia. Krótkie okno!',                                                        tip:'Pora: 01:00–05:00 · Kierunek: NE · Bez sprzętu' },
  { date:'2027-02-10', type:'planet',        name:'Jowisz w opozycji 2027',          desc:'Najlepszy dzień roku do obserwacji Jowisza. Wschodzi o zachodzie Słońca, widoczny całą noc.',                                                  how:'Lornetka: dostrzeż Io, Europę, Ganimedes, Kallisto.',                                                              tip:'Pora: cała noc · Lornetka' },
  { date:'2027-05-06', type:'meteors',       name:'Eta Akwarydy 2027',               desc:'Okruchy komety Halley, szybkie (66 km/s). W 2027 nów tuż przed szczytem — prawie idealne ciemne niebo.',                                      how:'Obserwuj 03:00–05:00. Radiant w Akwariuszu.',                                                                      tip:'Pora: 03:00–05:00 · Kierunek: SE · Bez sprzętu' },
  { date:'2027-08-02', type:'eclipse',       name:'Zaćmienie Słońca 2027',           desc:'Najdłuższe całkowite zaćmienie XXI wieku. Pas: S.Hiszpania, Maroko, Egipt (Luksor 6 min 23 s). Z Polski częściowe wieczorem.',                 how:'Z Polski: okulary ISO 12312-2. Warto pojechać do Málagas lub Luksoru.',                                            tip:'Okulary ISO 12312-2 · Całkowite: Egipt / S.Hiszpania' },
  { date:'2027-08-12', type:'meteors',       name:'Perseidy 2027',                   desc:'Ciepłe sierpniowe noce, jasne meteory ze smugami. Okruchy komety Swift-Tuttle.',                                                               how:'Wyjdź po 23:00. Kierunek NE na Perseusza. 1h bez telefonu.',                                                       tip:'Pora: 23:00–04:00 · Kierunek: NE · Bez sprzętu' },
  { date:'2027-12-14', type:'meteors',       name:'Geminidy 2027',                   desc:'Coroczny król rojów. Kolorowe, liczne, od wczesnego wieczoru. Asteroida 3200 Phaethon.',                                                      how:'Wyjdź po 21:00. Radiant w Bliźniętach. Grudzień — ciepłe ubranie.',                                               tip:'Pora: 21:00–04:00 · Bez sprzętu' },
  { date:'2028-01-12', type:'lunar_eclipse', name:'Zaćmienie Księżyca 2028',         desc:'Pełnia wilka 2028 to superksiężyc i zaćmienie częściowe. Księżyc wychodzi nad horyzont już częściowo w cieniu.',                               how:'Obserwuj wschód Księżyca — wychodzi już częściowo zaćmiony.',                                                      tip:'Pora: wschód Księżyca · Lornetka' },
  { date:'2028-02-10', type:'moon',          name:'Superksiężyc 2028 — ekstremalny', desc:'Pobija grudniowy rekord z 2026. Jeden z najbliższych pełni XXI wieku.',                                                                        how:'Obserwuj wschód. Zdjęcie obok budynku. Lornetka ujawni kratery.',                                                  tip:'Pora: wschód Księżyca · Aparat' },
  { date:'2028-07-22', type:'eclipse',       name:'Całkowite zaćmienie Słońca 2028', desc:'Australia i południowa Azja — Sydney i wybrzeże wschodnie. Z Europy niewidoczne.',                                                            how:'Z Polski: brak. Australia: planuj podróż z wyprzedzeniem!',                                                        tip:'Całkowite: Australia, Indie · Z Polski: brak' },
  { date:'2028-08-12', type:'meteors',       name:'Perseidy 2028',                   desc:'Niezmiennie jeden z najpewniejszych rojów. Ciepłe noce, jasne meteory ze smugami.',                                                           how:'Wyjdź po 23:00. Kierunek NE. 1h na ciemnym niebie.',                                                               tip:'Pora: 23:00–04:00 · Bez sprzętu' },
  { date:'2028-12-14', type:'meteors',       name:'Geminidy 2028',                   desc:'Kolorowe, liczne, od wczesnego wieczoru. Sprawdź fazę księżyca — decyduje o warunkach.',                                                      how:'Wyjdź po 21:00. Radiant w Bliźniętach. Ciepłe ubranie.',                                                          tip:'Pora: 21:00–04:00 · Bez sprzętu' },
  { date:'2028-12-31', type:'lunar_eclipse', name:'Zaćmienie Księżyca — Sylwester!', desc:'Całkowite zaćmienie w ostatnią noc 2028. Czerwony Księżyc przez ponad godzinę — atrakcja sylwestrowa!',                                       how:'Obserwuj wieczorem 31 grudnia. Gołym okiem.',                                                                      tip:'Pora: wieczór 31 gru · Bez sprzętu' },
  { date:'2029-03-30', type:'moon',          name:'Superksiężyc 2029 — ekstremalny', desc:'Marcowa pełnia może być jedną z najbliższych całego XXI wieku.',                                                                               how:'Obserwuj wschód. Porównaj ze zwykłymi pełniami.',                                                                  tip:'Pora: wschód Księżyca · Aparat' },
  { date:'2029-05-06', type:'meteors',       name:'Eta Akwarydy 2029',               desc:'Szybkie meteory ze smugami. Lepiej widoczne z południa Europy, ale jasne bolidy widać wszędzie.',                                             how:'Obserwuj 03:00–05:00. Radiant w Akwariuszu.',                                                                      tip:'Pora: 03:00–05:00 · Kierunek: SE · Bez sprzętu' },
  { date:'2029-08-12', type:'meteors',       name:'Perseidy 2029',                   desc:'Ciepłe noce, komfortowe warunki, wiele jasnych meteorów ze smugami.',                                                                         how:'Wyjdź po 23:00. Kierunek NE. Godzina bez telefonu.',                                                               tip:'Pora: 23:00–04:00 · Bez sprzętu' },
  { date:'2029-11-17', type:'meteors',       name:'Leonidy 2029 — uwaga!',           desc:'Kometa Tempel-Tuttle powraca w 2031. Aktywność może rosnąć w latach poprzedzających peryhelia.',                                              how:'Obserwuj po 01:00. Radiant w Lwie.',                                                                               tip:'Pora: 01:00–05:00 · Bez sprzętu' },
  { date:'2029-12-14', type:'meteors',       name:'Geminidy 2029',                   desc:'Asteroida 3200 Phaethon — zawsze warto wychodzić bez względu na rok.',                                                                        how:'Wyjdź po 21:00. Ciepłe ubranie! Cały nieboskłon.',                                                                 tip:'Pora: 21:00–04:00 · Bez sprzętu' },
  { date:'2030-06-01', type:'eclipse',       name:'Obrączkowe zaćmienie 2030',       desc:'"Ring of fire" — Algieria, Tunezja, Grecja, Turcja. Z Polski zaćmienie częściowe.',                                                          how:'Z Polski: okulary ISO 12312-2. Grecja/Turcja: efekt pierścienia ognia.',                                           tip:'Okulary ISO 12312-2 · Ring of fire: Grecja/Turcja' },
  { date:'2030-06-15', type:'lunar_eclipse', name:'Zaćmienie Księżyca 2030',         desc:'Częściowe zaćmienie w czerwcu. Ciemna część tarczy nabiera brunatno-czerwonego odcienia.',                                                    how:'Wyjdź wieczorem. Lornetka podkreśli barwy. Aparat na statywie.',                                                   tip:'Pora: wieczór 15 czerwca · Lornetka' },
  { date:'2030-08-12', type:'meteors',       name:'Perseidy 2030',                   desc:'Niezawodny sierpniowy spektakl. Sprawdź fazę księżyca przed wyjściem.',                                                                       how:'Wyjdź po 23:00. Kierunek NE.',                                                                                      tip:'Pora: 23:00–04:00 · Bez sprzętu' },
  { date:'2030-11-25', type:'eclipse',       name:'Całkowite zaćmienie Słońca 2030', desc:'Namibia, Botswana, Australia. Z Europy niewidoczne — szansa dla globtroterów.',                                                               how:'Namibia i Australia: totality. Z Europy: brak.',                                                                   tip:'Całkowite: Namibia, Australia · Z Polski: brak' },
  { date:'2030-12-14', type:'meteors',       name:'Geminidy 2030',                   desc:'Domykają rok astronomiczny. Najlepszy rój roku, niezawodny od dekad.',                                                                        how:'Wyjdź po 21:00. Radiant w Bliźniętach. Termos z herbatą.',                                                         tip:'Pora: 21:00–04:00 · Bez sprzętu' },
  { date:'2031-05-07', type:'meteors',       name:'Eta Akwarydy 2031',               desc:'Kometa Halley zbliża się. Strumień pyłu może być gęstszy — Eta Akwarydy mogą zaskoczyć.',                                                    how:'Obserwuj przed świtem. Radiant w Akwariuszu.',                                                                      tip:'Pora: 03:00–05:00 · Kierunek: SE · Bez sprzętu' },
  { date:'2031-08-12', type:'meteors',       name:'Perseidy 2031',                   desc:'Kometa Swift-Tuttle daleko, ale strumień stabilny przez dziesiątki lat.',                                                                     how:'Wyjdź po 23:00. NE na Perseusza. Bez telefonu!',                                                                   tip:'Pora: 23:00–04:00 · Bez sprzętu' },
  { date:'2031-11-17', type:'meteors',       name:'Leonidy 2031 — HISTORYCZNE!',     desc:'Kometa Tempel-Tuttle w peryhelium! W 1966, 1999, 2001 notowano tysiące meteorów/h. Możliwy deszcz stulecia — MUST SEE!',                     how:'Śledź prognozy. Obserwuj całą noc 16–18 listopada.',                                                                tip:'Pora: cała noc 16–18 lis · PRIORYTET' },
  { date:'2031-12-14', type:'meteors',       name:'Geminidy 2031',                   desc:'Zamykają dekadę 2026–2031. Asteroida 3200 Phaethon — unikat wśród rojów.',                                                                    how:'Wyjdź po 21:00. Radiant Bliźnięta. Termos, ciepłe ubranie.',                                                      tip:'Pora: 21:00–04:00 · Bez sprzętu' },
];

// ── Pomocnicze ────────────────────────────────────────────────────────────────

function fmtDate(d) {
  const x = new Date(d + 'T00:00:00');
  return x.getDate() + ' ' + window.AHA.MONTHS[x.getMonth()] + ' ' + x.getFullYear();
}

function fmtDatetime(iso) {
  const x = new Date(iso);
  const months = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
  const d = x.getDate() + ' ' + months[x.getMonth()] + ' ' + x.getFullYear();
  const t = x.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
  return d + ' · ' + t;
}

// ── Ikony SVG ─────────────────────────────────────────────────────────────────

function makeIcon(type, r, g, b) {
  const c = `rgba(${r},${g},${b},`;
  if (type === 'eclipse')
    return `<svg width="22" height="22" viewBox="0 0 22 22"><circle cx="9" cy="11" r="7" fill="${c}.18)" stroke="${c}.85)" stroke-width="1.5"/><circle cx="17" cy="11" r="7" fill="#111"/></svg>`;
  if (type === 'lunar_eclipse')
    return `<svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="8" fill="${c}.18)" stroke="${c}.85)" stroke-width="1.5"/><circle cx="7" cy="8" r="2.5" fill="${c}.4)"/></svg>`;
  if (type === 'meteors')
    return `<svg width="22" height="22" viewBox="0 0 22 22"><line x1="16" y1="2" x2="4" y2="14" stroke="${c}.9)" stroke-width="2" stroke-linecap="round"/><line x1="11" y1="4" x2="2" y2="16" stroke="${c}.45)" stroke-width="1.5" stroke-linecap="round"/><circle cx="17" cy="3" r="2" fill="${c}.9)"/></svg>`;
  if (type === 'conjunction')
    return `<svg width="22" height="22" viewBox="0 0 22 22"><circle cx="7.5" cy="11" r="5" fill="${c}.18)" stroke="${c}.85)" stroke-width="1.5"/><circle cx="16" cy="11" r="3.5" fill="${c}.12)" stroke="${c}.7)" stroke-width="1.2"/></svg>`;
  if (type === 'planet')
    return `<svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="6" fill="${c}.18)" stroke="${c}.85)" stroke-width="1.5"/><ellipse cx="11" cy="11" rx="10" ry="3.2" fill="none" stroke="${c}.5)" stroke-width="1.2"/></svg>`;
  if (type === 'moon')
    return `<svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="8" fill="${c}.18)" stroke="${c}.85)" stroke-width="1.5"/><circle cx="8" cy="8" r="1.8" fill="${c}.4)"/><circle cx="13" cy="13" r="1.2" fill="${c}.3)"/></svg>`;
  if (type === 'launch')
    return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2C11 2 7 7 7 13h8c0-6-4-11-4-11z" fill="${c}.20)" stroke="${c}.85)" stroke-width="1.4" stroke-linejoin="round"/>
      <rect x="9" y="13" width="4" height="3" rx="1" fill="${c}.30)"/>
      <path d="M7 13c-1.5 0-2.5 1-2.5 2.5L7 16" stroke="${c}.60)" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M15 13c1.5 0 2.5 1 2.5 2.5L15 16" stroke="${c}.60)" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="11" cy="9" r="1.5" fill="${c}.90)"/>
    </svg>`;
  return '';
}

const PAGE = 3;

// ── Karta ─────────────────────────────────────────────────────────────────────

class AstronomicalEventsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._offset = 0;
    this._expanded = new Set();
    this._hass = null;
    this._config = {};
  }

  setConfig(config) {
    this._config = config;
    this._page = config.page_size || PAGE;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  // ── Parsuj starty z REST sensor ─────────────────────────────────────────────
  _getLaunches() {
    if (!this._hass) return [];
    const entityId = this._config.launches_entity || 'sensor.upcoming_launches';
    const entity = this._hass.states[entityId];
    if (!entity) return [];

    const results = entity.attributes.results;
    if (!Array.isArray(results)) return [];

    const now = new Date(); now.setHours(0, 0, 0, 0);

    return results
      .filter(l => l.net && new Date(l.net) >= now)
      .map(l => {
        const net    = new Date(l.net);
        const days   = Math.round((net - now) / 86400000);
        const agency = l.launch_service_provider?.name ?? 'Nieznana';
        const rocket = l.rocket?.configuration?.name ?? '';
        const col    = agencyColor(agency);
        const sc     = statusColor(l.status?.abbrev ?? '');
        return {
          // pola wspólne z astronomicznymi
          date:  net.toISOString().slice(0, 10),
          type:  'launch',
          name:  l.mission?.name ?? l.name,
          desc:  l.mission?.description ?? '',
          how:   `${rocket}${l.pad?.location?.name ? ' · ' + l.pad.location.name : ''}`,
          tip:   `NET: ${fmtDatetime(l.net)}`,
          days,
          // pola specyficzne dla startu
          _net:          net,
          _agency:       agency,
          _rocket:       rocket,
          _missionType:  l.mission?.type ?? '',
          _orbit:        l.mission?.orbit?.abbrev ?? '',
          _statusName:   l.status?.name ?? '',
          _statusAbbrev: l.status?.abbrev ?? '',
          _statusColor:  sc,
          _agencyColor:  col,
          // nadpisz kolory TYPES dla tego konkretnego startu
          _r: col.r, _g: col.g, _b: col.b,
        };
      });
  }

  // ── Połącz i posortuj zdarzenia ─────────────────────────────────────────────
  _getEvents() {
    const now = new Date(); now.setHours(0, 0, 0, 0);

    const astro = RAW
      .map(e => {
        const t    = new Date(e.date + 'T00:00:00');
        const days = Math.round((t - now) / 86400000);
        return { ...e, days };
      })
      .filter(e => e.days >= 0);

    const launches = this._getLaunches();

    return [...astro, ...launches].sort((a, b) => {
      // najpierw według dni, potem launches mają precyzyjny _net
      if (a.days !== b.days) return a.days - b.days;
      const ta = a._net ?? new Date(a.date + 'T12:00:00');
      const tb = b._net ?? new Date(b.date + 'T12:00:00');
      return ta - tb;
    });
  }

  _toggle(idx) {
    if (this._expanded.has(idx)) this._expanded.delete(idx);
    else this._expanded.add(idx);
    this._render();
  }

  _prev() {
    this._offset = Math.max(0, this._offset - this._page);
    this._expanded.clear();
    this._render();
  }

  _next() {
    const all = this._getEvents();
    this._offset = Math.min(this._offset + this._page, all.length - this._page);
    this._expanded.clear();
    this._render();
  }

  _render() {
    const all   = this._getEvents();
    const page  = this._page;
    const off   = this._offset;
    const slice = all.slice(off, off + page);
    const canPrev = off > 0;
    const canNext = off + page < all.length;

    // Liczniki typów do nagłówka
    const launchCount = all.filter(e => e.type === 'launch').length;

    const css = `
      :host { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
      .card {
        background: linear-gradient(160deg, #06090f 0%, #0c1020 100%);
        border-radius: 16px;
        overflow: hidden;
        padding: 14px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .header-title {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: .10em;
        text-transform: uppercase;
        color: rgba(255,255,255,.28);
      }
      .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .launch-pill {
        font-size: 9px;
        font-weight: 600;
        padding: 2px 7px;
        border-radius: 20px;
        background: rgba(10,132,255,0.15);
        color: rgba(10,132,255,0.90);
        border: 1px solid rgba(10,132,255,0.30);
        letter-spacing: .04em;
      }
      .header-count {
        font-size: 10px;
        color: rgba(255,255,255,.20);
      }
      .event {
        border-radius: 12px;
        margin-bottom: 8px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.08);
        background: rgba(255,255,255,.03);
        transition: border-color .2s;
      }
      .event.expanded { border-color: rgba(255,255,255,.13); }
      .event.is-launch { background: rgba(10,132,255,0.04); }
      .event-row {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 11px 13px;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }
      .event-row:active { background: rgba(255,255,255,.04); }
      .icon-wrap {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .event-meta { flex: 1; min-width: 0; text-align: left; }
      .event-name {
        font-size: 13px;
        font-weight: 600;
        color: rgba(255,255,255,.90);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .event-date {
        font-size: 11px;
        color: rgba(255,255,255,.30);
        margin-top: 2px;
      }
      .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 5px;
      }
      .badge {
        display: inline-block;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: .04em;
        padding: 2px 7px;
        border-radius: 20px;
      }
      .event-right {
        display: flex;
        align-items: center;
        gap: 7px;
        flex-shrink: 0;
      }
      .countdown { text-align: right; }
      .countdown-num {
        font-weight: 200;
        line-height: 1;
        letter-spacing: -1px;
      }
      .countdown-label {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: .08em;
        color: rgba(255,255,255,.28);
        margin-top: 2px;
      }
      .chevron {
        flex-shrink: 0;
        transition: transform .22s ease;
        opacity: .35;
      }
      .chevron.open { transform: rotate(180deg); opacity: .6; }
      .details {
        display: none;
        padding: 10px 13px 14px;
        border-top: 1px solid rgba(255,255,255,.06);
        text-align: left;
        animation: fadeIn .18s ease;
      }
      .details.open { display: block; }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .desc {
        font-size: 12px;
        line-height: 1.65;
        color: rgba(255,255,255,.50);
        margin: 0 0 8px;
      }
      .how {
        font-size: 11.5px;
        line-height: 1.55;
        color: rgba(255,255,255,.35);
        margin: 0 0 10px;
      }
      .tip-box {
        font-size: 11px;
        font-weight: 600;
        padding: 7px 11px;
        border-radius: 9px;
        display: inline-block;
      }
      .launch-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-bottom: 10px;
      }
      .launch-meta-chip {
        font-size: 10px;
        padding: 3px 9px;
        border-radius: 8px;
        background: rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.45);
        border: 1px solid rgba(255,255,255,0.08);
      }
      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid rgba(255,255,255,.06);
      }
      .footer-info { font-size: 10px; color: rgba(255,255,255,.22); }
      .nav-btn {
        font-size: 11px;
        padding: 5px 14px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(255,255,255,.05);
        color: rgba(255,255,255,.50);
        cursor: pointer;
        font-family: inherit;
        transition: background .15s, color .15s;
      }
      .nav-btn:active { background: rgba(255,255,255,.10); color: rgba(255,255,255,.80); }
      .nav-btn:disabled {
        border-color: rgba(255,255,255,.04);
        background: transparent;
        color: rgba(255,255,255,.16);
        cursor: default;
      }
      .urgent-bar {
        width: 3px;
        border-radius: 2px;
        align-self: stretch;
        flex-shrink: 0;
        margin-left: -13px;
        margin-right: 2px;
      }
      .no-launches {
        font-size: 10px;
        color: rgba(255,255,255,0.18);
        text-align: center;
        padding: 6px 0 2px;
      }
    `;

    const eventsHtml = slice.map((ev, localIdx) => {
      const globalIdx = off + localIdx;
      const isLaunch  = ev.type === 'launch';
      const r = ev._r ?? TYPES[ev.type]?.r ?? 100;
      const g = ev._g ?? TYPES[ev.type]?.g ?? 200;
      const b = ev._b ?? TYPES[ev.type]?.b ?? 255;
      const T = TYPES[ev.type] || TYPES.meteors;
      const c = `rgba(${r},${g},${b},`;
      const isOpen   = this._expanded.has(globalIdx);
      const isUrgent = ev.days <= 3;

      const dLabel = ev.days === 0 ? 'dziś!' : ev.days === 1 ? 'jutro' : ev.days;
      const dUnit  = ev.days <= 1 ? '' : 'dni';
      const dSize  = ev.days <= 1 ? '15px' : '26px';

      const urgentBarHtml = isUrgent
        ? `<div class="urgent-bar" style="background:linear-gradient(to bottom,${c}.7),${c}.2));"></div>`
        : '';

      // Badge / label
      let badgesHtml = '';
      if (isLaunch) {
        const sc = ev._statusColor;
        const sc_ = `rgba(${sc.r},${sc.g},${sc.b},`;
        badgesHtml = `
          <div class="badges">
            <span class="badge" style="background:${c}.13);color:${c}.90);border:1px solid ${c}.25);">${ev._agency}</span>
            <span class="badge" style="background:${sc_}.13);color:${sc_}.90);border:1px solid ${sc_}.25);">${ev._statusName}</span>
          </div>`;
      } else {
        badgesHtml = `
          <div class="badges">
            <span class="badge" style="background:${c}.13);color:${c}.90);border:1px solid ${c}.25);">${T.label}</span>
          </div>`;
      }

      // Detail dla startu
      let detailsContent = '';
      if (isLaunch) {
        const chips = [
          ev._rocket       && `🚀 ${ev._rocket}`,
          ev._missionType  && `📡 ${ev._missionType}`,
          ev._orbit        && `🛸 ${ev._orbit}`,
        ].filter(Boolean).map(t => `<span class="launch-meta-chip">${t}</span>`).join('');

        detailsContent = `
          ${ev.how ? `<div class="launch-meta">${chips}</div>` : ''}
          ${ev.desc ? `<p class="desc">${ev.desc}</p>` : '<p class="desc" style="color:rgba(255,255,255,.25);">Brak opisu misji.</p>'}
          <div class="tip-box" style="background:${c}.10);color:${c}.90);border:1px solid ${c}.22);">⏰ ${ev.tip}</div>`;
      } else {
        detailsContent = `
          <p class="desc">${ev.desc}</p>
          <p class="how">🔭 ${ev.how}</p>
          <div class="tip-box" style="background:${c}.10);color:${c}.90);border:1px solid ${c}.22);">⏰ ${ev.tip}</div>`;
      }

      // Data: dla startu pokaż datetime, dla astro tylko datę
      const dateLabel = isLaunch
        ? fmtDatetime(ev._net.toISOString())
        : fmtDate(ev.date);

      return `
        <div class="event${isOpen ? ' expanded' : ''}${isLaunch ? ' is-launch' : ''}" data-idx="${globalIdx}">
          <div class="event-row" data-action="toggle" data-idx="${globalIdx}">
            ${urgentBarHtml}
            <div class="icon-wrap" style="background:${c}.12);border:1px solid ${c}.25);">
              ${makeIcon(ev.type, r, g, b)}
            </div>
            <div class="event-meta">
              <div class="event-name">${ev.name}</div>
              <div class="event-date">${dateLabel}</div>
              ${badgesHtml}
            </div>
            <div class="event-right">
              <div class="countdown">
                <div class="countdown-num" style="font-size:${dSize};color:${c}1);">${dLabel}</div>
                <div class="countdown-label">${dUnit}</div>
              </div>
              <svg class="chevron${isOpen ? ' open' : ''}" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4,6 8,10 12,6"/>
              </svg>
            </div>
          </div>
          <div class="details${isOpen ? ' open' : ''}">
            ${detailsContent}
          </div>
        </div>`;
    }).join('');

    const launchInfo = launchCount > 0
      ? `<span class="launch-pill">🚀 ${launchCount} start${launchCount > 1 ? 'ów' : ''}</span>`
      : `<span class="no-launches" title="Dodaj sensor.upcoming_launches">brak danych o startach</span>`;

    const html = `
      <style>${css}</style>
      <div class="card">
        <div class="header">
          <span class="header-title">Nadchodzące zjawiska</span>
          <div class="header-right">
            ${launchInfo}
            <span class="header-count">${all.length} w kalendarzu</span>
          </div>
        </div>
        <div class="events-list">
          ${eventsHtml}
        </div>
        <div class="footer">
          <button class="nav-btn" id="btn-prev" ${canPrev ? '' : 'disabled'}>← wcześniej</button>
          <span class="footer-info">${off + 1}–${Math.min(off + page, all.length)} z ${all.length}</span>
          <button class="nav-btn" id="btn-next" ${canNext ? '' : 'disabled'}>dalej →</button>
        </div>
      </div>`;

    this.shadowRoot.innerHTML = html;

    this.shadowRoot.querySelectorAll('[data-action="toggle"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggle(parseInt(el.getAttribute('data-idx')));
      });
    });

    const btnPrev = this.shadowRoot.getElementById('btn-prev');
    const btnNext = this.shadowRoot.getElementById('btn-next');
    if (btnPrev && !btnPrev.disabled) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); this._prev(); });
    if (btnNext && !btnNext.disabled) btnNext.addEventListener('click', (e) => { e.stopPropagation(); this._next(); });
  }

  getCardSize() { return 4; }
}

customElements.define('aha-astronomical-events-card', AstronomicalEventsCard);
