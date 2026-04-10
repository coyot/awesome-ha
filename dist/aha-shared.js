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

// Apple-style dark theme — surfaces, status, text
window.AHA.THEME = {
  BG1:      '#1C1C1E',   // primary surface
  BG2:      '#2C2C2E',   // secondary surface
  BG3:      '#3A3A3C',   // tertiary surface
  BG4:      '#48484A',   // quaternary / muted element

  SUCCESS:  '#34C759',
  WARNING:  '#FF9500',
  ERROR:    '#FF453A',
  INFO:     '#5AC8FA',

  TEXT1:    'rgba(255,255,255,0.98)',
  TEXT2:    '#AEAEB2',
  TEXT3:    '#8E8E93',
  TEXT4:    '#636366',

  BORDER:   'rgba(255,255,255,0.08)',
};

// SF Pro font stack
window.AHA.FONT = "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif";
