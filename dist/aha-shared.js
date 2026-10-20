/**
 * aha-shared.js — wspólne stałe dla wszystkich kart awesome-ha
 * Musi być załadowany przed pozostałymi kartami.
 */
window.AHA = window.AHA || {};

window.AHA.MONTHS = [
  'stycznia','lutego','marca','kwietnia','maja','czerwca',
  'lipca','sierpnia','września','października','listopada','grudnia'
];

window.AHA.SZAMBO = {
  CLR_D1:      '#E8C468',
  CLR_D2:      '#5AC8FA',
  CLR_D1_OBS:  '#FFB347',
  CLR_D2_OBS:  '#FF9B85',
  CLR_D1_PLAN: '#FF6B6B',
  CLR_D2_PLAN: '#FF3B30',
};

// ── Paleta akcentów (design system z claude.md) — jedno źródło prawdy ──
window.AHA.ACCENT = {
  WORK:  '#97C459',   // praca: koszenie, sprzątanie, OK, komfort
  INFO:  '#85B7EB',   // powrót, chłodzenie, informacja, zimno
  HEAT:  '#EF9F27',   // grzanie, ostrzeżenie, ciepło
  ERROR: '#E24B4A',   // błąd, alarm, upał
  IDLE:  '#5F5E5A',   // bezczynność
  LIGHT: '#FFD60A',   // światło / gniazdko włączone
};
window.AHA.ACCENT_RGB = {
  WORK: '151,196,89', INFO: '133,183,235', HEAT: '239,159,39',
  ERROR: '226,75,74', IDLE: '95,94,90', LIGHT: '255,214,10',
};

// Kolory przełączników trybów (nie stany!) — bez czerwieni, która znaczy "błąd"
window.AHA.MODE = ['#30B0FF', '#A86AC2', '#5DCAA5', '#FFB347', '#4CAF50'];

// Dark theme — powierzchnie, statusy, tekst (navy wg claude.md)
window.AHA.THEME = {
  SURFACE:       'linear-gradient(150deg, #0b1120 0%, #0d1828 100%)', // tło każdej karty
  SURFACE_SOLID: '#0c1424',                 // tam, gdzie gradient nie działa (apexcharts, windy)
  TILE:          'rgba(255,255,255,0.05)',  // kafelki wewnątrz karty
  TILE2:         'rgba(255,255,255,0.08)',

  // @deprecated — szarości iOS; zostawione jako aliasy dla starych kart
  BG1:      '#0c1424',
  BG2:      'rgba(255,255,255,0.06)',
  BG3:      'rgba(255,255,255,0.10)',
  BG4:      'rgba(255,255,255,0.16)',

  SUCCESS:  window.AHA.ACCENT.WORK,
  WARNING:  window.AHA.ACCENT.HEAT,
  ERROR:    window.AHA.ACCENT.ERROR,
  INFO:     window.AHA.ACCENT.INFO,

  // Tekst na navy — wszystkie poziomy >= 4.5:1 (WCAG AA) na #0d1828
  TEXT1:    'rgba(255,255,255,0.94)',
  TEXT2:    'rgba(255,255,255,0.62)',   // 7.4:1  podtytuły
  TEXT3:    'rgba(255,255,255,0.50)',   // 5.2:1  etykiety, jednostki
  TEXT4:    'rgba(255,255,255,0.48)',   // 4.9:1  najniższy poziom tekstu

  BORDER:      'rgba(255,255,255,0.08)',
  BORDER_SLIM: '0.5px solid rgba(255,255,255,0.08)',
  BORDER_FULL: '1px solid rgba(255,255,255,0.08)',
};

// Skala zaokrągleń
window.AHA.RADIUS = { CHIP: 6, TILE: 12, SLIM: 16, CARD: 20, PILL: 99 };

// Profile temperatur dla gauge'ów: jedna skala na profil, progi stanów
//   cold < cold, warm >= warm, hot >= hot; alarm (pulsowanie) tylko dla stanów z listy alarm
window.AHA.TEMP_PROFILES = {
  indoor:  { min: 14,  max: 30, frost: 10, cold: 18, warm: 26, hot: 29 },
  outdoor: { min: -20, max: 40, frost: 0,  cold: 5,  warm: 28, hot: 35 },
};

// Zmienne CSS do wstrzyknięcia w :host — karty bez JS-owego THEME też z nich korzystają
window.AHA.cssVars = function () {
  const A = window.AHA.ACCENT, T = window.AHA.THEME;
  return `--aha-work:${A.WORK};--aha-info:${A.INFO};--aha-heat:${A.HEAT};--aha-error:${A.ERROR};--aha-idle:${A.IDLE};` +
         `--aha-surface:${T.SURFACE};--aha-tile:${T.TILE};` +
         `--aha-text1:${T.TEXT1};--aha-text2:${T.TEXT2};--aha-text3:${T.TEXT3};--aha-text4:${T.TEXT4};` +
         `--aha-font:${window.AHA.FONT};`;
};

// Standardowy puls aktywnego stanu: 5px / 0.18 przy 50%
window.AHA.pulse = function (name, rgb, px = 5, alpha = 0.18) {
  return `@keyframes ${name}{0%,100%{box-shadow:0 0 0 0 rgba(${rgb},0)}50%{box-shadow:0 0 0 ${px}px rgba(${rgb},${alpha})}}`;
};

// SF Pro font stack
window.AHA.FONT = "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif";
