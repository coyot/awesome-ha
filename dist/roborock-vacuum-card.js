/**
 * roborock-vacuum-card.js
 * Custom Lovelace card for Roborock Saros 10R (vacuum.marty_mccleaner)
 *
 * Two display modes toggled by icon in top-right corner:
 *   slim    — compact 64px bar
 *   verbose — full card with stats, dock diagram, consumables, actions
 *
 * Config: type: custom:roborock-vacuum-card
 * Registration: roborock-vacuum-card + alias aha-roborock-vacuum-card
 */

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const STATUS_GROUPS = {
  cleaning:    ['cleaning', 'segment_cleaning', 'zoned_cleaning', 'spot_cleaning', 'manual_mode'],
  mopping:     ['robot_status_mopping', 'segment_mopping', 'zoned_mopping'],
  combo:       ['clean_mop_cleaning', 'clean_mop_mopping',
                'segment_clean_mop_cleaning', 'segment_clean_mop_mopping',
                'zoned_clean_mop_cleaning', 'zoned_clean_mop_mopping'],
  returning:   ['returning_home', 'going_to_target', 'going_to_wash_the_mop', 'back_to_dock_washing_duster'],
  docking:     ['docking'],
  mop_washing: ['washing_the_mop', 'washing_the_mop_2'],
  mop_drying:  ['air_drying_stopping'],
  emptying:    ['emptying_the_bin'],
  charging:    ['charging', 'charging_complete'],
  idle:        ['idle', 'charger_disconnected', 'starting'],
  error:       ['error', 'charging_problem', 'low_battery', 'battery_error'],
  locked:      ['locked'],
  updating:    ['updating', 'shutting_down'],
  offline:     ['device_offline'],
};

const ACCENT = {
  cleaning:    '#97C459',
  mopping:     '#85B7EB',
  combo:       '#97C459',
  returning:   '#85B7EB',
  docking:     '#85B7EB',
  mop_washing: '#7BAED4',
  mop_drying:  '#C97A50',
  emptying:    '#EF9F27',
  charging:    '#5F5E5A',
  idle:        '#888780',
  error:       '#E24B4A',
  locked:      '#E24B4A',
  updating:    '#888780',
  offline:     '#E24B4A',
};

const BADGE_LABELS = {
  cleaning:    'sprząta',
  mopping:     'mopuje',
  combo:       'sprząta+mop',
  returning:   'wraca',
  docking:     'dokuje',
  mop_washing: 'myje mop',
  mop_drying:  'suszy mop',
  emptying:    'opróżnia',
  charging:    'w bazie',
  idle:        'czeka',
  error:       'błąd',
  locked:      'zablokowany',
  updating:    'aktualizuje',
  offline:     'offline',
};

const FAN_MAP = {
  quiet:                { label: 'cichy',        col: '#7BAED4', bg: 'rgba(123,174,212,0.12)' },
  balanced:             { label: 'zbalansowany', col: '#85B7EB', bg: 'rgba(133,183,235,0.12)' },
  turbo:                { label: 'turbo',        col: '#E8724A', bg: 'rgba(232,114,74,0.12)'  },
  max:                  { label: 'max',           col: '#E24B4A', bg: 'rgba(226,75,74,0.12)'   },
  max_plus:             { label: 'max+',          col: '#E24B4A', bg: 'rgba(226,75,74,0.12)'   },
  off_raise_main_brush: { label: 'szczotka',      col: '#888780', bg: 'rgba(136,135,128,0.12)' },
  smart_mode:           { label: 'smart',         col: '#5E9CF5', bg: 'rgba(94,156,245,0.12)'  },
  custom:               { label: 'własny',        col: '#888780', bg: 'rgba(136,135,128,0.12)' },
};

const MOP_INTENSITY_MAP = {
  off:      null,
  slight:   { label: 'mop: mini',    col: '#7BAED4', bg: 'rgba(123,174,212,0.12)' },
  low:      { label: 'mop: lekko',   col: '#7BAED4', bg: 'rgba(123,174,212,0.12)' },
  medium:   { label: 'mop: średnio', col: '#85B7EB', bg: 'rgba(133,183,235,0.12)' },
  moderate: { label: 'mop: mocno',   col: '#C97A50', bg: 'rgba(201,122,80,0.12)'  },
  high:     { label: 'mop: bardzo',  col: '#C97A50', bg: 'rgba(201,122,80,0.12)'  },
  extreme:  { label: 'mop: max',     col: '#E8724A', bg: 'rgba(232,114,74,0.12)'  },
};

const MOP_MODE_MAP = {
  standard:   { label: 'standard',  col: '#85B7EB', bg: 'rgba(133,183,235,0.12)' },
  deep:       { label: 'głęboko',   col: '#7BAED4', bg: 'rgba(123,174,212,0.12)' },
  deep_plus:  { label: 'głęboko+',  col: '#7BAED4', bg: 'rgba(123,174,212,0.12)' },
  fast:       { label: 'szybko',    col: '#EF9F27', bg: 'rgba(239,159,39,0.12)'  },
  smart_mode: { label: 'smart',     col: '#5E9CF5', bg: 'rgba(94,156,245,0.12)'  },
  custom:     { label: 'własny',    col: '#888780', bg: 'rgba(136,135,128,0.12)' },
};

const CONSUMABLES = [
  { key: 'filter_left',     label: 'Filtr',          maxHours: 150, warnAt: 30  },
  { key: 'main_brush_left', label: 'Szczotka gł.',   maxHours: 300, warnAt: 60  },
  { key: 'side_brush_left', label: 'Szczotka bocz.', maxHours: 200, warnAt: 40  },
  { key: 'sensor_left',     label: 'Czujnik',        maxHours: 30,  warnAt: 8   },
];

const ERROR_MAP = {
  none:                    null,
  lidar_blocked:           'LiDAR zasłonięty — wyczyść czujnik',
  bumper_stuck:            'Zderzak zablokowany',
  wheels_suspended:        'Koła w powietrzu — sprawdź podłogę',
  cliff_sensor_error:      'Błąd czujnika krawędzi',
  main_brush_jammed:       'Szczotka główna zablokowana',
  side_brush_jammed:       'Szczotka boczna zablokowana',
  wheels_jammed:           'Koła zablokowane',
  robot_trapped:           'Robot utknął — pomóż mu',
  no_dustbin:              'Brak pojemnika na pył',
  strainer_error:          'Błąd filtra',
  compass_error:           'Błąd kompasu',
  low_battery:             'Niski poziom baterii',
  charging_error:          'Błąd ładowania',
  wall_sensor_dirty:       'Brudny czujnik ściany',
  robot_tilted:            'Robot przechylony',
  side_brush_error:        'Błąd szczotki bocznej',
  fan_error:               'Błąd wentylatora',
  dock:                    'Problem z dokiem',
  optical_flow_sensor_dirt:'Brudny czujnik optyczny',
  robot_on_carpet:         'Robot na dywanie (mop)',
  filter_blocked:          'Filtr zatkany — wyczyść',
  invisible_wall_detected: 'Wykryto wirtualną ścianę',
  cannot_cross_carpet:     'Nie może przejechać po dywanie',
  mopping_roller_1:        'Problem z wałkiem mopa',
  mopping_roller_error_2:  'Problem z wałkiem mopa (2)',
  clear_water_box_hoare:   'Brudny pojemnik czystej wody',
  dirty_water_box_hoare:   'Brudny pojemnik brudnej wody',
  water_carriage_drop:     'Upadł pojemnik z wodą',
  up_water_exception:      'Problem z pompą wody (nalewanie)',
  drain_water_exception:   'Problem z pompą wody (odprowadzanie)',
  temperature_protection:  'Ochrona temperatury aktywna',
  audio_error:             'Błąd głośnika',
};

const DOCK_STATUS_LABELS = {
  washing_the_mop:           { icon: '🫧', text: 'myje mop',           color: '#7BAED4' },
  washing_the_mop_2:         { icon: '🫧', text: 'myje mop (2)',        color: '#7BAED4' },
  going_to_wash_the_mop:     { icon: '↩',  text: 'jedzie myć mop',      color: '#85B7EB' },
  air_drying_stopping:       { icon: '🌡', text: 'suszy mop',           color: '#C97A50' },
  emptying_the_bin:          { icon: '🌪', text: 'opróżnia pył',        color: '#EF9F27' },
  back_to_dock_washing_duster:{ icon: '↩', text: 'wraca myć szczotkę', color: '#85B7EB' },
  charging:                  { icon: '⚡', text: 'ładuje',             color: '#97C459' },
  charging_complete:         { icon: '✓',  text: 'naładowany',          color: '#97C459' },
  idle:                      { icon: '·',  text: 'gotowy',              color: '#5F5E5A' },
};

const ACTIONS = [
  { id: 'start',  label: 'Start',    svc: 'vacuum.start',          col: '#97C459', show: ['docked','idle'] },
  { id: 'pause',  label: 'Pauza',    svc: 'vacuum.pause',          col: '#EF9F27', show: ['cleaning'] },
  { id: 'resume', label: 'Wznów',    svc: 'vacuum.start',          col: '#97C459', show: ['paused'] },
  { id: 'stop',   label: 'Stop',     svc: 'vacuum.stop',           col: '#E24B4A', show: ['cleaning','returning','paused'] },
  { id: 'dock',   label: 'Do bazy',  svc: 'vacuum.return_to_base', col: '#85B7EB', show: ['cleaning','paused','idle'] },
  { id: 'locate', label: 'Znajdź',   svc: 'vacuum.locate',         col: '#888780', show: ['idle','docked','paused'] },
];

const PULSE_ANIM = {
  cleaning:    'vac-pulse-green  2.4s ease-in-out infinite',
  mopping:     'vac-pulse-blue   2.4s ease-in-out infinite',
  combo:       'vac-pulse-green  2.4s ease-in-out infinite',
  returning:   'vac-pulse-blue   2.4s ease-in-out infinite',
  docking:     'vac-pulse-blue   2.4s ease-in-out infinite',
  mop_washing: 'vac-pulse-blue   2.4s ease-in-out infinite',
  mop_drying:  'vac-pulse-orange 2.4s ease-in-out infinite',
};

const ACTIVE_BADGE_GROUPS = new Set(['cleaning','mopping','combo','returning','docking','mop_washing','mop_drying','emptying']);

// ─────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────

function getStatusGroup(status) {
  if (!status) return 'idle';
  for (const [group, statuses] of Object.entries(STATUS_GROUPS)) {
    if (statuses.includes(status)) return group;
  }
  return 'idle';
}

function batteryColor(pct, isCharging) {
  if (isCharging) return '#97C459';
  if (pct > 60) return '#97C459';
  if (pct > 30) return '#EF9F27';
  return '#E24B4A';
}

function fmtHours(h) {
  if (h === null || h === undefined || isNaN(h)) return '—';
  const n = parseFloat(h);
  if (n >= 1) return `${Math.round(n)}h`;
  return `${Math.round(n * 60)}min`;
}

function fmtArea(m2) {
  if (m2 === null || m2 === undefined || m2 === '' || m2 === 'unavailable') return '—';
  const n = parseFloat(m2);
  if (isNaN(n)) return '—';
  return `${n.toFixed(1)} m²`;
}

function fmtTime(minutes) {
  if (minutes === null || minutes === undefined || minutes === '' || minutes === 'unavailable') return '—';
  const n = parseInt(minutes);
  if (isNaN(n)) return '—';
  if (n >= 60) return `${Math.floor(n/60)}h ${n % 60}min`;
  return `${n} min`;
}

function fmtLastDate(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return isToday ? `dziś ${hh}:${mm}` : `${d.getDate()}.${d.getMonth()+1} ${hh}:${mm}`;
  } catch(_) { return '—'; }
}

function consumablePct(hoursLeft, maxHours) {
  return Math.max(0, Math.min(100, (parseFloat(hoursLeft) / maxHours) * 100));
}

function consumableColor(pct) {
  if (pct <= 10) return '#E24B4A';
  if (pct <= 30) return '#EF9F27';
  return '#97C459';
}

// ─────────────────────────────────────────────
// SVG icons
// ─────────────────────────────────────────────

function svgCleaning(color) {
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="animation:vac-spin 2s linear infinite;flex-shrink:0;">
    <circle cx="11" cy="11" r="8" stroke="${color}" stroke-width="1.5" stroke-dasharray="3 2.5"/>
    <circle cx="11" cy="11" r="3" fill="${color}"/>
    <line x1="11" y1="3"  x2="11" y2="7"  stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="19" y1="11" x2="15" y2="11" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="11" y1="19" x2="11" y2="15" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="3"  y1="11" x2="7"  y2="11" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`;
}

function svgMopping() {
  const c = '#85B7EB';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="animation:vac-spin 2s linear infinite;flex-shrink:0;">
    <circle cx="11" cy="9" r="6" stroke="${c}" stroke-width="1.5" stroke-dasharray="3 2.5"/>
    <circle cx="11" cy="9" r="2.5" fill="${c}"/>
    <line x1="11" y1="3"  x2="11" y2="6"  stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="17" y1="9"  x2="14" y2="9"  stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="11" y1="15" x2="11" y2="12" stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>
    <line x1="5"  y1="9"  x2="8"  y2="9"  stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>
    <circle cx="7"  cy="19" r="1" fill="${c}" opacity="0.6"/>
    <circle cx="11" cy="20" r="1" fill="${c}" opacity="0.6"/>
    <circle cx="15" cy="19" r="1" fill="${c}" opacity="0.6"/>
  </svg>`;
}

function svgReturning() {
  const c = '#85B7EB';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="animation:vac-move 1.5s ease-in-out infinite alternate;flex-shrink:0;">
    <path d="M5 11 L14 11" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M9 7 L5 11 L9 15" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="17" cy="11" r="2.5" fill="${c}"/>
  </svg>`;
}

function svgMopWashing() {
  const c = '#7BAED4';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <path d="M7 4 Q7 2 9 5 Q11 8 9 10 Q7 12 7 10 Q5 7 7 4Z" fill="${c}" opacity="0.8"/>
    <path d="M4 16 Q11 12 18 16" stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>
    <circle cx="7"  cy="17" r="1" fill="${c}" style="animation:vac-water-drop 1.2s 0.0s ease-in-out infinite"/>
    <circle cx="11" cy="18" r="1" fill="${c}" style="animation:vac-water-drop 1.2s 0.4s ease-in-out infinite"/>
    <circle cx="15" cy="17" r="1" fill="${c}" style="animation:vac-water-drop 1.2s 0.8s ease-in-out infinite"/>
  </svg>`;
}

function svgMopDrying() {
  const c = '#C97A50';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <path d="M7 16 Q9 14 11 16 Q13 18 15 16" stroke="${c}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M8 12 Q10 9 12 12" stroke="${c}" stroke-width="1.2" fill="none" stroke-linecap="round"
          style="animation:vac-heat 1.5s 0.0s ease-in-out infinite"/>
    <path d="M8 8  Q10 5 12 8"  stroke="${c}" stroke-width="1.0" fill="none" stroke-linecap="round"
          style="animation:vac-heat 1.5s 0.3s ease-in-out infinite" opacity="0.6"/>
    <path d="M8 4  Q10 1 12 4"  stroke="${c}" stroke-width="0.8" fill="none" stroke-linecap="round"
          style="animation:vac-heat 1.5s 0.6s ease-in-out infinite" opacity="0.3"/>
  </svg>`;
}

function svgDocked(dotColor) {
  const c = '#5F5E5A';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <rect x="6" y="8" width="10" height="9" rx="1.5" stroke="${c}" stroke-width="1.4"/>
    <path d="M9 6 L9 8 M13 6 L13 8" stroke="${c}" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="11" cy="12.5" r="1.8" fill="${dotColor || '#97C459'}"/>
  </svg>`;
}

function svgPaused() {
  const c = '#EF9F27';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <rect x="7" y="5" width="2.5" height="12" rx="1.2" fill="${c}"/>
    <rect x="12.5" y="5" width="2.5" height="12" rx="1.2" fill="${c}"/>
  </svg>`;
}

function svgError() {
  const c = '#E24B4A';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <circle cx="11" cy="11" r="8" stroke="${c}" stroke-width="1.4"/>
    <path d="M11 6.5 L11 12" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="11" cy="15" r="1" fill="${c}"/>
  </svg>`;
}

function svgIdle() {
  const c = '#888780';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <circle cx="11" cy="11" r="7" stroke="${c}" stroke-width="1.4"/>
    <circle cx="11" cy="11" r="2.5" fill="${c}"/>
  </svg>`;
}

function svgEmptying() {
  const c = '#EF9F27';
  return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="flex-shrink:0;">
    <path d="M7 4 L15 4 L14 14 L8 14 Z" stroke="${c}" stroke-width="1.3" fill="rgba(239,159,39,0.15)" stroke-linejoin="round"/>
    <path d="M5 4 L17 4" stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M9 4 L9 2 L13 2 L13 4" stroke="${c}" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="11" y1="17" x2="11" y2="20" stroke="${c}" stroke-width="1.3" stroke-linecap="round" style="animation:vac-water-drop 1s ease-in-out infinite"/>
  </svg>`;
}

function svgToggleExpand() {
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.2"/>
    <line x1="5" y1="9" x2="13" y2="9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="9" y1="5" x2="9"  y2="13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`;
}

function svgToggleCollapse() {
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.2"/>
    <line x1="5" y1="9" x2="13" y2="9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`;
}

function getStateIcon(group, dotColor) {
  switch (group) {
    case 'cleaning':    return svgCleaning('#97C459');
    case 'mopping':     return svgMopping();
    case 'combo':       return svgCleaning('#97C459');
    case 'returning':
    case 'docking':     return svgReturning();
    case 'mop_washing': return svgMopWashing();
    case 'mop_drying':  return svgMopDrying();
    case 'emptying':    return svgEmptying();
    case 'charging':    return svgDocked(dotColor || '#97C459');
    case 'error':       return svgError();
    case 'locked':      return svgError();
    default:            return svgIdle();
  }
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const CARD_STYLES = `
  :host { display: block; width: 100%; }
  * { box-sizing: border-box; }

  @keyframes vac-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes vac-pulse-green {
    0%, 100% { box-shadow: 0 0 0 0   rgba(151,196,89,0.0); }
    50%       { box-shadow: 0 0 0 5px rgba(151,196,89,0.18); }
  }
  @keyframes vac-pulse-blue {
    0%, 100% { box-shadow: 0 0 0 0   rgba(133,183,235,0.0); }
    50%       { box-shadow: 0 0 0 5px rgba(133,183,235,0.18); }
  }
  @keyframes vac-pulse-orange {
    0%, 100% { box-shadow: 0 0 0 0   rgba(201,122,80,0.0); }
    50%       { box-shadow: 0 0 0 5px rgba(201,122,80,0.18); }
  }
  @keyframes vac-dot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.2; }
  }
  @keyframes vac-move {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-3px); }
  }
  @keyframes vac-water-drop {
    0%, 100% { opacity: 0.2; transform: translateY(0); }
    50%       { opacity: 1.0; transform: translateY(2px); }
  }
  @keyframes vac-heat {
    0%   { opacity: 0.2; transform: translateY(0); }
    50%  { opacity: 0.8; transform: translateY(-3px); }
    100% { opacity: 0.2; transform: translateY(0); }
  }
  @keyframes vac-mop-sway {
    0%   { transform: translateX(-2px); }
    100% { transform: translateX(2px); }
  }

  .card {
    background: #1C1C1E;
    border-radius: 16px;
    font-family: -apple-system, system-ui, sans-serif;
    position: relative;
    overflow: hidden;
    transition: border-color 0.4s ease, box-shadow 0.4s ease;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  .card.slim {
    cursor: pointer;
  }
  .card.slim:active {
    transform: scale(0.97);
    transition: transform 0.15s ease;
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    opacity: 0.3;
    cursor: pointer;
    color: #F1EFE8;
    flex-shrink: 0;
    transition: opacity 0.15s ease;
    -webkit-tap-highlight-color: transparent;
    border: none;
    background: none;
    padding: 0;
  }
  .toggle-btn:hover { opacity: 0.65; }
  .toggle-btn:active { transform: scale(0.92); }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 99px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .badge-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .badge-dot.pulse {
    animation: vac-dot 1.8s ease-in-out infinite;
  }

  .sep {
    height: 1px;
    background: rgba(255,255,255,0.05);
    margin: 0;
  }

  .section {
    padding: 12px 14px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 4px;
  }
  .stat-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px;
    background: #242426;
    border-radius: 10px;
  }
  .stat-value {
    font-size: 16px;
    font-weight: 600;
    color: #F1EFE8;
    line-height: 1.1;
    text-align: center;
  }
  .stat-label {
    font-size: 10px;
    color: #888780;
    text-align: center;
    line-height: 1.2;
  }

  .bar-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .bar-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .bar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .bar-label {
    font-size: 11px;
    color: #888780;
  }
  .bar-value {
    font-size: 11px;
    color: rgba(255,255,255,0.45);
  }
  .bar-track {
    height: 4px;
    border-radius: 99px;
    background: rgba(255,255,255,0.07);
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.6s ease;
  }

  .chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
  }
  .chip {
    padding: 4px 9px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
  }

  .water-alert {
    margin-top: 8px;
    background: rgba(226,75,74,0.12);
    border: 1px solid rgba(226,75,74,0.25);
    border-radius: 8px;
    padding: 8px 12px;
    color: #E24B4A;
    font-size: 11px;
    font-weight: 500;
  }

  .dock-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .dock-title {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.28);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .dock-status-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 6px;
  }
  .dock-status-item {
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .consumables {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .consumable-row {
    display: grid;
    grid-template-columns: 90px 1fr 60px 16px;
    gap: 6px;
    align-items: center;
  }
  .consumable-label {
    font-size: 11px;
    color: #888780;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .consumable-track {
    height: 3px;
    border-radius: 99px;
    background: rgba(255,255,255,0.07);
    overflow: hidden;
  }
  .consumable-fill {
    height: 100%;
    border-radius: 99px;
  }
  .consumable-value {
    font-size: 10px;
    color: rgba(255,255,255,0.35);
    text-align: right;
    white-space: nowrap;
  }
  .consumable-warn {
    font-size: 11px;
  }

  .lifetime-row {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.05);
    font-size: 10px;
    color: rgba(255,255,255,0.28);
    text-align: center;
  }

  .actions-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .action-btn {
    background: transparent;
    border-radius: 10px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 500;
    font-family: -apple-system, system-ui, sans-serif;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .action-btn:active { transform: scale(0.97); }

  .error-box {
    background: rgba(226,75,74,0.10);
    border: 1px solid rgba(226,75,74,0.25);
    border-radius: 10px;
    padding: 10px 14px;
    color: #E24B4A;
    font-size: 12px;
    font-weight: 500;
    grid-column: 1 / -1;
  }
  .error-box .err-title {
    font-weight: 600;
    margin-bottom: 2px;
  }
  .error-box .err-desc {
    font-size: 11px;
    opacity: 0.75;
  }

  .header-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .header-text {
    flex: 1;
    min-width: 0;
  }
  .header-name {
    font-size: 14px;
    font-weight: 600;
    color: #F1EFE8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .header-sub {
    font-size: 11px;
    color: #888780;
    margin-top: 1px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// ─────────────────────────────────────────────
// Web Component
// ─────────────────────────────────────────────

class RoboVacuumCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._mode = 'slim';
    this._hass = null;
    this._config = null;
    this._lastState = null;
    this._lastMode = null;
  }

  setConfig(config) {
    if (!config.entity) throw new Error('roborock-vacuum-card: wymagane pole "entity"');
    this._config = {
      entity: config.entity,
      name: config.name || null,
      default_mode: config.default_mode || 'slim',
      sensors: config.sensors || {},
      binary_sensors: config.binary_sensors || {},
      selects: config.selects || {},
      dock_entity: config.dock_entity || null,
      map_image: config.map_image || null,
    };
    // Apply default entity IDs if not provided
    const base = 'marty_mccleaner';
    const s = this._config.sensors;
    const bs = this._config.binary_sensors;
    const sel = this._config.selects;

    if (!s.battery)         s.battery         = `sensor.${base}_battery`;
    if (!s.area)            s.area            = `sensor.${base}_cleaning_area`;
    if (!s.time)            s.time            = `sensor.${base}_cleaning_time`;
    if (!s.progress)        s.progress        = `sensor.${base}_cleaning_progress`;
    if (!s.current_room)    s.current_room    = `sensor.${base}_current_room`;
    if (!s.status)          s.status          = `sensor.${base}_status`;
    if (!s.vacuum_error)    s.vacuum_error    = `sensor.${base}_vacuum_error`;
    if (!s.total_area)      s.total_area      = `sensor.${base}_total_cleaning_area`;
    if (!s.total_time)      s.total_time      = `sensor.${base}_total_cleaning_time`;
    if (!s.total_count)     s.total_count     = `sensor.${base}_total_cleaning_count`;
    if (!s.filter_left)     s.filter_left     = `sensor.${base}_filter_time_left`;
    if (!s.main_brush_left) s.main_brush_left = `sensor.${base}_main_brush_time_left`;
    if (!s.side_brush_left) s.side_brush_left = `sensor.${base}_side_brush_time_left`;
    if (!s.sensor_left)     s.sensor_left     = `sensor.${base}_sensor_time_left`;

    if (!bs.charging)       bs.charging       = `binary_sensor.${base}_charging`;
    if (!bs.mop_attached)   bs.mop_attached   = `binary_sensor.${base}_mop_attached`;
    if (!bs.water_box)      bs.water_box      = `binary_sensor.${base}_water_box_attached`;
    if (!bs.water_shortage) bs.water_shortage = `binary_sensor.${base}_water_shortage`;

    if (!sel.mop_intensity) sel.mop_intensity = `select.${base}_mop_intensity`;
    if (!sel.mop_mode)      sel.mop_mode      = `select.${base}_mop_mode`;
    if (!sel.selected_map)  sel.selected_map  = `select.${base}_selected_map`;

    if (!this._config.map_image) this._config.map_image = `image.${base}_salon`;

    this._mode = this._config.default_mode;
  }

  set hass(hass) {
    this._hass = hass;
    const e = hass.states[this._config.entity];
    if (!e) return;
    const sig = e.state + '|' + JSON.stringify(e.attributes) + '|' + this._getSensorSig();
    if (sig === this._lastState && this._mode === this._lastMode) return;
    this._lastState = sig;
    this._lastMode = this._mode;
    this._render();
  }

  getCardSize() {
    return this._mode === 'slim' ? 1 : 5;
  }

  _getSensorSig() {
    const s = this._config.sensors || {};
    const bs = this._config.binary_sensors || {};
    const sel = this._config.selects || {};
    return [
      ...Object.values(s),
      ...Object.values(bs),
      ...Object.values(sel),
    ].map(id => this._hass.states[id]?.state ?? '').join('|');
  }

  _toggleMode() {
    this._mode = this._mode === 'slim' ? 'verbose' : 'slim';
    this._lastMode = null;
    this.hass = this._hass;
  }

  _callService(domain, service, serviceData = {}) {
    this._hass.callService(domain, service, {
      entity_id: this._config.entity,
      ...serviceData,
    });
  }

  _getSensor(key) {
    const id = this._config.sensors?.[key];
    if (!id) return null;
    return this._hass.states[id] || null;
  }

  _getSensorState(key) {
    const s = this._getSensor(key);
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return s.state;
  }

  _getSensorNum(key) {
    const v = this._getSensorState(key);
    if (v === null) return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  _getBinarySensor(key) {
    const id = this._config.binary_sensors?.[key];
    if (!id) return null;
    return this._hass.states[id] || null;
  }

  _isBinaryOn(key) {
    const s = this._getBinarySensor(key);
    return s?.state === 'on';
  }

  _getSelect(key) {
    const id = this._config.selects?.[key];
    if (!id) return null;
    return this._hass.states[id] || null;
  }

  _getSelectState(key) {
    const s = this._getSelect(key);
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return s.state;
  }

  // Derive the effective group from vacuum state + status sensor
  _getGroup() {
    const entity = this._hass.states[this._config.entity];
    const vacState = entity?.state || 'idle';
    const statusVal = this._getSensorState('status');

    // If we have a status sensor, prefer it for dock states
    if (statusVal) {
      const sg = getStatusGroup(statusVal);
      // Dock-specific groups take priority
      if (['mop_washing','mop_drying','emptying','returning','docking','charging'].includes(sg)) {
        return sg;
      }
      // For cleaning states, also trust status sensor
      if (['cleaning','mopping','combo'].includes(sg)) {
        return sg;
      }
    }

    // Fall back to vacuum entity state
    switch (vacState) {
      case 'cleaning':  return statusVal ? getStatusGroup(statusVal) : 'cleaning';
      case 'returning': return 'returning';
      case 'docked':    return this._isBinaryOn('charging') ? 'charging' : 'idle';
      case 'paused':    return 'paused';
      case 'error':     return 'error';
      case 'idle':      return 'idle';
      default:          return 'idle';
    }
  }

  _render() {
    const html = this._mode === 'slim' ? this._renderSlim() : this._renderVerbose();
    this.shadowRoot.innerHTML = `<style>${CARD_STYLES}</style>${html}`;
    this._attachEventListeners();
  }

  _attachEventListeners() {
    this.shadowRoot.querySelector('.toggle-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      this._toggleMode();
    });

    this.shadowRoot.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const svc = btn.dataset.service;
        if (!svc) return;
        const dotIdx = svc.indexOf('.');
        const domain = svc.substring(0, dotIdx);
        const service = svc.substring(dotIdx + 1);
        this._callService(domain, service);
      });
      const col = btn.dataset.color || '#888780';
      btn.style.border = `1px solid ${col}44`;
      btn.style.color = col;
      btn.addEventListener('mouseover', () => {
        btn.style.background = `${col}1F`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'transparent';
      });
    });

    // Slim card tap → more-info
    if (this._mode === 'slim') {
      this.shadowRoot.querySelector('.card')?.addEventListener('click', () => {
        const event = new Event('hass-more-info', { bubbles: true, composed: true });
        event.detail = { entityId: this._config.entity };
        this.dispatchEvent(event);
      });
    }
  }

  _renderSlim() {
    const entity = this._hass.states[this._config.entity];
    const vacState = entity?.state || 'idle';
    const name = this._config.name || entity?.attributes?.friendly_name || this._config.entity;

    const group = this._getGroup();
    const accent = ACCENT[group] || '#888780';
    const badgeLabel = BADGE_LABELS[group] || group;
    const isActive = ACTIVE_BADGE_GROUPS.has(group);
    const pulseAnim = PULSE_ANIM[group] || null;

    const battery = this._getSensorNum('battery') ?? entity?.attributes?.battery_level ?? null;
    const isCharging = this._isBinaryOn('charging');

    // Right column value
    let rightVal = '';
    let rightLabel = '';
    if (group === 'mop_washing') {
      rightVal = '🫧';
      rightLabel = 'myje mop';
    } else if (group === 'mop_drying') {
      rightVal = '🌡';
      rightLabel = 'suszy mop';
    } else if (group === 'emptying') {
      rightVal = '🌪';
      rightLabel = 'opróżnia';
    } else if (['cleaning','mopping','combo'].includes(group)) {
      const progress = this._getSensorNum('progress');
      const timeVal = this._getSensorNum('time');
      if (progress !== null) {
        rightVal = `${Math.round(progress)}%`;
        rightLabel = 'postęp';
      } else if (timeVal !== null) {
        rightVal = fmtTime(timeVal);
        rightLabel = 'czas';
      } else {
        rightVal = 'sprząta';
        rightLabel = '';
      }
    } else if (group === 'returning' || group === 'docking') {
      rightVal = '↩';
      rightLabel = 'wraca';
    } else if (isCharging) {
      rightVal = battery !== null ? `⚡${battery}%` : '⚡';
      rightLabel = 'ładuje';
    } else if (battery !== null) {
      rightVal = `${battery}%`;
      rightLabel = 'bateria';
    }

    const batPct = battery !== null ? Math.max(0, Math.min(100, battery)) : 0;
    const batCol = batteryColor(battery, isCharging);

    const icon = getStateIcon(group, isCharging ? '#97C459' : (battery > 20 ? '#97C459' : '#E24B4A'));

    const borderStyle = pulseAnim
      ? `border: 1px solid ${accent}47; animation: ${pulseAnim};`
      : 'border: 0.5px solid rgba(255,255,255,0.08);';

    const badgeBg = isActive
      ? `background: ${accent}24; color: ${accent};`
      : `background: rgba(136,135,128,0.12); color: ${accent};`;

    return `
      <div class="card slim" style="${borderStyle}">
        <div style="display:grid;grid-template-columns:4px 26px 1fr auto 28px;gap:0 10px;
                    align-items:center;padding:14px 14px 16px 0;min-height:64px;">
          <!-- accent bar -->
          <div style="width:4px;height:100%;background:${accent};border-radius:16px 0 0 16px;align-self:stretch;
                      min-height:36px;"></div>

          <!-- icon -->
          <div style="display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${icon}
          </div>

          <!-- center: name + badge -->
          <div style="min-width:0;display:flex;flex-direction:column;gap:3px;overflow:hidden;">
            <div style="display:flex;align-items:center;gap:6px;overflow:hidden;">
              <span style="font-size:13px;font-weight:500;color:#F1EFE8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                ${name}
              </span>
              <span class="badge" style="${badgeBg}">
                <span class="badge-dot ${isActive ? 'pulse' : ''}" style="background:${accent};"></span>
                ${badgeLabel}
              </span>
            </div>
          </div>

          <!-- right value -->
          <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:0px;">
            <span style="font-size:18px;font-weight:600;letter-spacing:-0.5px;line-height:1.1;
                         color:${group==='error'?'#E24B4A':accent};">${rightVal}</span>
            <span style="font-size:10px;color:rgba(255,255,255,0.28);white-space:nowrap;">${rightLabel}</span>
          </div>

          <!-- toggle -->
          <button class="toggle-btn" title="Rozwiń">${svgToggleExpand()}</button>
        </div>

        <!-- battery bar — absolutely positioned, 2px, full width -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:2px;
                    background:rgba(255,255,255,0.06);border-radius:0 0 16px 16px;overflow:hidden;">
          <div style="height:100%;width:${batPct}%;background:${batCol};
                      border-radius:0 0 16px 16px;transition:width 0.8s ease;"></div>
        </div>
      </div>
    `;
  }

  _renderVerbose() {
    const entity = this._hass.states[this._config.entity];
    const vacState = entity?.state || 'idle';
    const name = this._config.name || entity?.attributes?.friendly_name || this._config.entity;

    const group = this._getGroup();
    const accent = ACCENT[group] || '#888780';
    const badgeLabel = BADGE_LABELS[group] || group;
    const isActive = ACTIVE_BADGE_GROUPS.has(group);
    const pulseAnim = PULSE_ANIM[group] || null;

    const battery = this._getSensorNum('battery') ?? entity?.attributes?.battery_level ?? null;
    const isCharging = this._isBinaryOn('charging');
    const batCol = batteryColor(battery, isCharging);
    const batPct = battery !== null ? Math.max(0, Math.min(100, battery)) : 0;

    const currentRoom = this._getSensorState('current_room');
    const area = this._getSensorNum('area');
    const progress = this._getSensorNum('progress');
    const mopAttached = this._isBinaryOn('mop_attached');
    const waterShortage = this._isBinaryOn('water_shortage');

    const icon = getStateIcon(group, isCharging ? '#97C459' : (battery > 20 ? '#97C459' : '#E24B4A'));

    const borderStyle = pulseAnim
      ? `border: 1px solid ${accent}47; animation: ${pulseAnim};`
      : 'border: 0.5px solid rgba(255,255,255,0.08);';

    const badgeBg = isActive
      ? `background: ${accent}24; color: ${accent};`
      : `background: rgba(136,135,128,0.12); color: ${accent};`;

    // Sub-title: current room + area
    let subTitle = '';
    if (currentRoom && currentRoom !== 'unknown' && currentRoom !== 'none') {
      subTitle = currentRoom;
    }
    if (area !== null && ['cleaning','mopping','combo','paused'].includes(group)) {
      subTitle += subTitle ? ` · ${fmtArea(area)}` : fmtArea(area);
    }

    // Show dock section?
    const showDock = this._config.dock_entity ||
      ['mop_washing','mop_drying','emptying','charging'].includes(group);

    const sections = [];

    // ── Section 1: Header ──
    sections.push(`
      <div class="section">
        <div class="header-row">
          <div style="flex-shrink:0;display:flex;align-items:center;">${icon}</div>
          <div class="header-text">
            <div class="header-name">${name}</div>
            ${subTitle ? `<div class="header-sub">${subTitle}</div>` : ''}
          </div>
          <span class="badge" style="${badgeBg}">
            <span class="badge-dot ${isActive ? 'pulse' : ''}" style="background:${accent};"></span>
            ${badgeLabel}
          </span>
          <button class="toggle-btn" title="Zwiń">${svgToggleCollapse()}</button>
        </div>
      </div>
    `);

    // ── Section 2: Contextual stats ──
    sections.push('<div class="sep"></div>');
    sections.push('<div class="section">' + this._renderStats(group, entity, accent) + '</div>');

    // ── Section 3: Battery + progress bars ──
    sections.push('<div class="sep"></div>');
    sections.push(`
      <div class="section">
        <div class="bar-row">
          <div class="bar-item">
            <div class="bar-header">
              <span class="bar-label">Bateria${isCharging ? ' ⚡' : ''}</span>
              <span class="bar-value">${battery !== null ? battery + '%' : '—'}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${batPct}%;background:${batCol};"></div>
            </div>
          </div>
          ${['cleaning','mopping','combo','paused'].includes(group) && progress !== null ? `
          <div class="bar-item">
            <div class="bar-header">
              <span class="bar-label">Postęp</span>
              <span class="bar-value">${Math.round(progress)}%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${Math.round(progress)}%;background:${accent};"></div>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `);

    // ── Section 4: Chips + water shortage ──
    sections.push('<div class="sep"></div>');
    sections.push('<div class="section">' + this._renderChips(group, mopAttached, waterShortage) + '</div>');

    // ── Section 5: Dock ──
    if (showDock) {
      sections.push('<div class="sep"></div>');
      sections.push('<div class="section">' + this._renderDockDiagram(group) + '</div>');
    }

    // ── Section 6: Consumables ──
    sections.push('<div class="sep"></div>');
    sections.push('<div class="section">' + this._renderConsumables() + '</div>');

    // ── Section 7: Actions ──
    const actionsHtml = this._renderActions(group, vacState);
    if (actionsHtml) {
      sections.push('<div class="sep"></div>');
      sections.push('<div class="section">' + actionsHtml + '</div>');
    }

    return `
      <div class="card verbose" style="${borderStyle}">
        ${sections.join('')}
      </div>
    `;
  }

  _renderStats(group, entity, accent) {
    const area       = this._getSensorNum('area');
    const timeVal    = this._getSensorNum('time');
    const progress   = this._getSensorNum('progress');
    const mopMode    = this._getSelectState('mop_mode');
    const mopIntens  = this._getSelectState('mop_intensity');
    const vacError   = this._getSensorState('vacuum_error');

    if (group === 'error') {
      const errMsg = vacError ? (ERROR_MAP[vacError] || vacError) : 'Nieznany błąd';
      return `
        <div class="error-box">
          <div class="err-title">⚠ Błąd</div>
          <div class="err-desc">${errMsg}</div>
        </div>
      `;
    }

    if (group === 'mop_washing') {
      const mopModeLabel = mopMode ? (MOP_MODE_MAP[mopMode]?.label || mopMode) : '—';
      return `
        <div class="stats-grid">
          <div class="stat-cell">
            <span class="stat-value" style="color:#7BAED4;font-size:20px;">
              <span style="animation:vac-water-drop 1.2s 0.0s ease-in-out infinite;display:inline-block;">🫧</span>
            </span>
            <span class="stat-label">myje mop<br>w doku</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value" style="color:#7BAED4;">~8 min</span>
            <span class="stat-label">szac. czas</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value" style="font-size:12px;color:#7BAED4;">${mopModeLabel}</span>
            <span class="stat-label">tryb mopa</span>
          </div>
        </div>
      `;
    }

    if (group === 'mop_drying') {
      return `
        <div class="stats-grid">
          <div class="stat-cell">
            <span class="stat-value" style="color:#C97A50;font-size:20px;">
              <span style="animation:vac-heat 1.5s ease-in-out infinite;display:inline-block;">🌡</span>
            </span>
            <span class="stat-label">suszy mop<br>w doku</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value" style="color:#C97A50;">~20 min</span>
            <span class="stat-label">szac. czas</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value" style="font-size:11px;color:#C97A50;">gorące</span>
            <span class="stat-label">powietrze</span>
          </div>
        </div>
      `;
    }

    if (group === 'emptying') {
      return `
        <div class="stats-grid">
          <div class="stat-cell">
            <span class="stat-value" style="color:#EF9F27;font-size:20px;">🌪</span>
            <span class="stat-label">opróżnianie<br>pojemnika</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value" style="color:#EF9F27;">~3 min</span>
            <span class="stat-label">szac. czas</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value" style="font-size:11px;color:#EF9F27;">ostatni</span>
            <span class="stat-label">pojemnik</span>
          </div>
        </div>
      `;
    }

    if (['cleaning','mopping','combo','paused'].includes(group)) {
      const areaStr     = area !== null ? fmtArea(area) : '—';
      const timeStr     = timeVal !== null ? fmtTime(timeVal) : '—';
      const progressStr = progress !== null ? `${Math.round(progress)}%` : '—';
      return `
        <div class="stats-grid">
          <div class="stat-cell">
            <span class="stat-value" style="color:${accent};">${areaStr}</span>
            <span class="stat-label">posprzątano</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value" style="color:${accent};">${timeStr}</span>
            <span class="stat-label">czas sesji</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value" style="color:${accent};">${progressStr}</span>
            <span class="stat-label">postęp</span>
          </div>
        </div>
      `;
    }

    // docked / idle / returning / charging — show last session stats
    const attrs = entity?.attributes || {};
    const lastArea     = attrs.last_clean_area     ?? null;
    const lastDuration = attrs.last_clean_duration ?? null;
    const lastStart    = attrs.last_clean_start    ?? null;

    const lastAreaStr     = lastArea     !== null ? fmtArea(lastArea)     : '—';
    const lastDurationStr = lastDuration !== null ? fmtTime(lastDuration) : '—';
    const lastStartStr    = lastStart    !== null ? fmtLastDate(lastStart) : '—';

    return `
      <div class="stats-grid">
        <div class="stat-cell">
          <span class="stat-value">${lastAreaStr}</span>
          <span class="stat-label">ostatnia<br>sesja</span>
        </div>
        <div class="stat-cell">
          <span class="stat-value">${lastDurationStr}</span>
          <span class="stat-label">ostatnia<br>sesja</span>
        </div>
        <div class="stat-cell">
          <span class="stat-value" style="font-size:12px;">${lastStartStr}</span>
          <span class="stat-label">ostatnie<br>sprzątanie</span>
        </div>
      </div>
    `;
  }

  _renderChips(group, mopAttached, waterShortage) {
    const chips = [];

    // Fan speed chip
    const entity = this._hass.states[this._config.entity];
    const fanSpeed = entity?.attributes?.fan_speed || null;
    if (fanSpeed) {
      const fi = FAN_MAP[fanSpeed] || { label: fanSpeed, col: '#888780', bg: 'rgba(136,135,128,0.12)' };
      chips.push(`<span class="chip" style="background:${fi.bg};color:${fi.col};">${fi.label}</span>`);
    }

    // Mop intensity chip (only when mop attached and not 'off')
    const mopIntensity = this._getSelectState('mop_intensity');
    if (mopAttached && mopIntensity && mopIntensity !== 'off') {
      const mi = MOP_INTENSITY_MAP[mopIntensity];
      if (mi) {
        chips.push(`<span class="chip" style="background:${mi.bg};color:${mi.col};">${mi.label}</span>`);
      }
    }

    // Mop mode chip (only when mop attached)
    const mopMode = this._getSelectState('mop_mode');
    if (mopAttached && mopMode) {
      const mm = MOP_MODE_MAP[mopMode] || { label: mopMode, col: '#85B7EB', bg: 'rgba(133,183,235,0.12)' };
      chips.push(`<span class="chip" style="background:${mm.bg};color:${mm.col};">${mm.label}</span>`);
    }

    // Selected map chip
    const selMap = this._getSelectState('selected_map');
    if (selMap && selMap !== 'unknown' && selMap !== 'none') {
      chips.push(`<span class="chip" style="background:rgba(136,135,128,0.12);color:#888780;">${selMap}</span>`);
    }

    let html = `<div class="chips-row">${chips.join('')}</div>`;

    if (waterShortage) {
      html += `<div class="water-alert">⚠ Brak wody w pojemniku — uzupełnij zanim wróci</div>`;
    }

    return html;
  }

  _renderDockDiagram(group) {
    const isMopWashing = group === 'mop_washing';
    const isMopDrying  = group === 'mop_drying';
    const isEmptying   = group === 'emptying';
    const isCharging   = group === 'charging';

    const statusVal = this._getSensorState('status') || '';
    const dockInfo = DOCK_STATUS_LABELS[statusVal] || null;
    const mopAttached = this._isBinaryOn('mop_attached');
    const waterBox    = this._isBinaryOn('water_box');
    const waterShortage = this._isBinaryOn('water_shortage');
    const isCharging2  = this._isBinaryOn('charging');

    // Robot circle color
    const robotCol = isCharging2 ? '#97C459' : (isEmptying ? '#EF9F27' : '#5F5E5A');

    // Dock interior animations
    let dockAnim = '';
    if (isMopWashing) {
      dockAnim = `
        <line x1="30" y1="38" x2="70" y2="38" stroke="#7BAED4" stroke-width="1.5" stroke-linecap="round"
              style="animation:vac-water-drop 1.2s 0.0s ease-in-out infinite"/>
        <line x1="30" y1="44" x2="70" y2="44" stroke="#7BAED4" stroke-width="1.5" stroke-linecap="round"
              style="animation:vac-water-drop 1.2s 0.3s ease-in-out infinite"/>
        <line x1="30" y1="50" x2="70" y2="50" stroke="#7BAED4" stroke-width="1.5" stroke-linecap="round"
              style="animation:vac-water-drop 1.2s 0.6s ease-in-out infinite"/>
      `;
    } else if (isMopDrying) {
      dockAnim = `
        <path d="M36 52 Q41 46 46 52" stroke="#C97A50" stroke-width="1.3" fill="none" stroke-linecap="round"
              style="animation:vac-heat 1.5s 0.0s ease-in-out infinite"/>
        <path d="M46 52 Q51 46 56 52" stroke="#C97A50" stroke-width="1.3" fill="none" stroke-linecap="round"
              style="animation:vac-heat 1.5s 0.2s ease-in-out infinite"/>
        <path d="M56 52 Q61 46 66 52" stroke="#C97A50" stroke-width="1.3" fill="none" stroke-linecap="round"
              style="animation:vac-heat 1.5s 0.4s ease-in-out infinite"/>
        <path d="M36 44 Q41 38 46 44" stroke="#C97A50" stroke-width="1.1" fill="none" stroke-linecap="round"
              opacity="0.6" style="animation:vac-heat 1.5s 0.3s ease-in-out infinite"/>
        <path d="M46 44 Q51 38 56 44" stroke="#C97A50" stroke-width="1.1" fill="none" stroke-linecap="round"
              opacity="0.6" style="animation:vac-heat 1.5s 0.5s ease-in-out infinite"/>
        <path d="M56 44 Q61 38 66 44" stroke="#C97A50" stroke-width="1.1" fill="none" stroke-linecap="round"
              opacity="0.6" style="animation:vac-heat 1.5s 0.7s ease-in-out infinite"/>
      `;
    } else if (isEmptying) {
      dockAnim = `
        <line x1="50" y1="36" x2="50" y2="54" stroke="#EF9F27" stroke-width="2" stroke-linecap="round"
              style="animation:vac-water-drop 0.8s ease-in-out infinite"/>
        <line x1="43" y1="40" x2="43" y2="50" stroke="#EF9F27" stroke-width="1.5" stroke-linecap="round"
              style="animation:vac-water-drop 0.8s 0.2s ease-in-out infinite"/>
        <line x1="57" y1="40" x2="57" y2="50" stroke="#EF9F27" stroke-width="1.5" stroke-linecap="round"
              style="animation:vac-water-drop 0.8s 0.4s ease-in-out infinite"/>
      `;
    }

    // Charging bolt
    const chargeBolt = isCharging2
      ? `<text x="50" y="30" text-anchor="middle" font-size="10" fill="#97C459">⚡</text>`
      : '';

    const svgDiagram = `
      <svg width="100" height="80" viewBox="0 0 100 80" fill="none"
           style="display:block;margin:0 auto;">
        <!-- Dock outline -->
        <rect x="18" y="14" width="64" height="52" rx="5"
              stroke="rgba(255,255,255,0.12)" stroke-width="1.5" fill="#1A1A1C"/>
        <!-- Dock interior -->
        <rect x="24" y="20" width="52" height="40" rx="3"
              fill="rgba(255,255,255,0.03)"/>
        <!-- Dock animations -->
        ${dockAnim}
        <!-- Robot circle -->
        <circle cx="50" cy="64" r="6" stroke="${robotCol}" stroke-width="1.5"
                fill="rgba(${robotCol==='#97C459'?'151,196,89':'95,94,90'},0.15)"/>
        <!-- Robot detail lines -->
        <line x1="47" y1="64" x2="53" y2="64" stroke="${robotCol}" stroke-width="1" stroke-linecap="round"/>
        ${chargeBolt}
      </svg>
    `;

    // Status items below diagram
    const statusItems = [];

    if (dockInfo) {
      statusItems.push(`
        <div class="dock-status-item">
          <span>${dockInfo.icon}</span>
          <span style="color:${dockInfo.color};font-weight:500;">${dockInfo.text}</span>
        </div>
      `);
    }

    if (mopAttached !== null) {
      statusItems.push(`
        <div class="dock-status-item">
          <span style="color:rgba(255,255,255,0.28);">Mop:</span>
          <span style="color:${mopAttached ? '#85B7EB' : '#5F5E5A'};">
            ${mopAttached ? 'zamontowany' : 'brak'}
          </span>
        </div>
      `);
    }

    if (waterBox !== null) {
      statusItems.push(`
        <div class="dock-status-item">
          <span style="color:rgba(255,255,255,0.28);">Woda:</span>
          <span style="color:${waterShortage ? '#E24B4A' : '#97C459'};">
            ${waterShortage ? '⚠ brak' : 'ok'}
          </span>
        </div>
      `);
    }

    return `
      <div class="dock-section">
        <div class="dock-title">Dok · Saros 10R</div>
        ${svgDiagram}
        ${statusItems.length ? `<div class="dock-status-row">${statusItems.join('')}</div>` : ''}
      </div>
    `;
  }

  _renderConsumables() {
    const totalArea  = this._getSensorNum('total_area');
    const totalTime  = this._getSensorNum('total_time');
    const totalCount = this._getSensorNum('total_count');

    const rows = CONSUMABLES.map(c => {
      const hoursLeft = this._getSensorNum(c.key);
      if (hoursLeft === null) {
        return `
          <div class="consumable-row">
            <span class="consumable-label">${c.label}</span>
            <div class="consumable-track"><div class="consumable-fill" style="width:0%;background:#5F5E5A;"></div></div>
            <span class="consumable-value">—</span>
            <span class="consumable-warn"></span>
          </div>
        `;
      }
      const pct = consumablePct(hoursLeft, c.maxHours);
      const col = consumableColor(pct);
      const warn = hoursLeft <= c.warnAt;
      return `
        <div class="consumable-row">
          <span class="consumable-label">${c.label}</span>
          <div class="consumable-track">
            <div class="consumable-fill" style="width:${pct.toFixed(1)}%;background:${col};"></div>
          </div>
          <span class="consumable-value">${fmtHours(hoursLeft)}</span>
          <span class="consumable-warn" title="${warn ? 'Wymień wkrótce' : 'OK'}">
            ${warn ? '⚠' : ''}
          </span>
        </div>
      `;
    });

    let lifetimeHtml = '';
    if (totalCount !== null || totalArea !== null || totalTime !== null) {
      const parts = [];
      if (totalCount !== null) parts.push(`${Math.round(totalCount)} sesji`);
      if (totalArea  !== null) parts.push(`${parseFloat(totalArea).toFixed(1)} m² łącznie`);
      if (totalTime  !== null) parts.push(`${fmtTime(totalTime)} łącznie`);
      lifetimeHtml = `<div class="lifetime-row">${parts.join(' · ')}</div>`;
    }

    return `
      <div class="consumables">
        ${rows.join('')}
        ${lifetimeHtml}
      </div>
    `;
  }

  _renderActions(group, vacState) {
    // During mop_washing / mop_drying: show only locate (do not interrupt dock cycle)
    const dockCycleGroups = new Set(['mop_washing','mop_drying']);
    const isDockCycle = dockCycleGroups.has(group);

    let visibleActions;
    if (isDockCycle) {
      visibleActions = ACTIONS.filter(a => a.id === 'locate');
    } else {
      visibleActions = ACTIONS.filter(a => a.show.includes(vacState));
    }

    if (!visibleActions.length) return '';

    const btns = visibleActions.map(a => `
      <button class="action-btn" data-service="${a.svc}" data-color="${a.col}">
        ${a.label}
      </button>
    `).join('');

    return `<div class="actions-row">${btns}</div>`;
  }
}

// ─────────────────────────────────────────────
// Registration
// ─────────────────────────────────────────────

customElements.define('roborock-vacuum-card', RoboVacuumCard);
customElements.define('aha-roborock-vacuum-card', class extends RoboVacuumCard {});

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: 'roborock-vacuum-card',
  name: 'Roborock Vacuum Card',
  preview: false,
  description: 'Roborock Saros 10R — slim + verbose, z dokiem, suszeniem mopa i konsumablami',
});
