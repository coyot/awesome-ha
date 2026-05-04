/**
 * roborock-vacuum-card.js
 * Custom Lovelace card for Roborock Saros 10R (vacuum.marty_mccleaner)
 *
 * Two display modes toggled by icon in top-right corner:
 *   slim    — compact 64px bar
 *   verbose — full card with stats, dock diagram, consumables, actions
 *
 * Registration: roborock-vacuum-card + alias aha-roborock-vacuum-card
 *
 * ─────────────────────────────────────────────────────────────────────
 * PEŁNA KONFIGURACJA YAML
 * ─────────────────────────────────────────────────────────────────────
 *
 * type: custom:roborock-vacuum-card
 *
 * # Wymagane
 * entity: vacuum.marty_mccleaner
 *
 * # Opcjonalne — nazwa wyświetlana (fallback: friendly_name encji)
 * name: Marty McCleaner
 *
 * # Tryb startowy: 'slim' (default) lub 'verbose'
 * default_mode: slim
 *
 * # Encja dokstacji (opcjonalne) — jeśli dok ma osobną encję w HA
 * dock_entity: vacuum.marty_mccleaner_dock
 *
 * # Pokaż/ukryj sekcję doku w trybie verbose (default: true)
 * # false = sekcja doku nigdy nie jest wyświetlana
 * # true  = sekcja doku widoczna gdy dock_entity podany LUB gdy
 * #         robot myje/suszy mop, opróżnia pojemnik lub ładuje się
 * show_dock: true
 *
 * # Podgląd mapy (opcjonalne) — image entity z Roborock integration
 * map_image: image.marty_mccleaner_salon
 *
 * sensors:
 *   # Poziom baterii robota (unit: %)
 *   battery:          sensor.marty_mccleaner_battery
 *
 *   # Powierzchnia sprzątana w bieżącej sesji (unit: m²)
 *   area:             sensor.marty_mccleaner_cleaning_area
 *
 *   # Czas trwania bieżącej sesji (unit: min)
 *   time:             sensor.marty_mccleaner_cleaning_time
 *
 *   # Postęp sprzątania bieżącej sesji (unit: %)
 *   progress:         sensor.marty_mccleaner_cleaning_progress
 *
 *   # Aktualnie sprzątany pokój
 *   current_room:     sensor.marty_mccleaner_current_room
 *
 *   # Szczegółowy status (washing_the_mop, air_drying_stopping, itp.)
 *   status:           sensor.marty_mccleaner_status
 *
 *   # Kod aktywnego błędu (none gdy brak)
 *   vacuum_error:     sensor.marty_mccleaner_vacuum_error
 *
 *   # Statystyki łączne (życiowe)
 *   total_area:       sensor.marty_mccleaner_total_cleaning_area
 *   total_time:       sensor.marty_mccleaner_total_cleaning_time
 *   total_count:      sensor.marty_mccleaner_total_cleaning_count
 *
 *   # Konsumables — czas pozostały do wymiany (unit: h)
 *   filter_left:      sensor.marty_mccleaner_filter_time_left
 *   main_brush_left:  sensor.marty_mccleaner_main_brush_time_left
 *   side_brush_left:  sensor.marty_mccleaner_side_brush_time_left
 *   sensor_left:      sensor.marty_mccleaner_sensor_time_left
 *
 * binary_sensors:
 *   # Czy robot aktualnie się ładuje
 *   charging:         binary_sensor.marty_mccleaner_charging
 *
 *   # Czy mop jest założony
 *   mop_attached:     binary_sensor.marty_mccleaner_mop_attached
 *
 *   # Czy pojemnik na wodę jest założony
 *   water_box:        binary_sensor.marty_mccleaner_water_box_attached
 *
 *   # Alarm braku wody — pokazuje czerwony alert
 *   water_shortage:   binary_sensor.marty_mccleaner_water_shortage
 *
 * selects:
 *   # Intensywność mopowania: off, slight, low, medium, moderate, high, extreme
 *   mop_intensity:    select.marty_mccleaner_mop_intensity
 *
 *   # Tryb mopowania: standard, deep, deep_plus, fast, smart_mode, custom
 *   mop_mode:         select.marty_mccleaner_mop_mode
 *
 *   # Wybrana mapa
 *   selected_map:     select.marty_mccleaner_selected_map
 *
 * ─────────────────────────────────────────────────────────────────────
 * MINIMALNA KONFIGURACJA (tylko encja główna)
 * ─────────────────────────────────────────────────────────────────────
 *
 * type: custom:roborock-vacuum-card
 * entity: vacuum.marty_mccleaner
 *
 * ─────────────────────────────────────────────────────────────────────
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
  @keyframes vac-pulse-error {
    0%, 100% { opacity: 0; }
    50%       { opacity: 1; }
  }
  @keyframes vac-pulse-charging {
    0%, 100% { filter: drop-shadow(0 0 0px rgba(151,196,89,0)); }
    50%       { filter: drop-shadow(0 0 5px rgba(151,196,89,0.55)); }
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

  /* ── Consumables — compact icon row ── */
  .consumables {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .ci {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 9px;
    cursor: default;
    flex-shrink: 0;
  }
  .ci:hover .ct { display: block; }
  .ct {
    display: none;
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    min-width: 130px;
    background: rgba(36,36,38,0.97);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 10px;
    padding: 10px 12px;
    z-index: 30;
    box-shadow: 0 6px 20px rgba(0,0,0,0.55);
    pointer-events: none;
    white-space: nowrap;
  }
  .ct-label {
    font-size: 11px;
    font-weight: 600;
    color: #F5F5F7;
    margin-bottom: 6px;
  }
  .ct-bar-track {
    height: 3px;
    border-radius: 99px;
    background: rgba(255,255,255,0.12);
    overflow: hidden;
    margin-bottom: 5px;
  }
  .ct-bar-fill { height: 100%; border-radius: 99px; }
  .ct-value { font-size: 11px; }

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
    text-align: center;
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
      show_dock: config.show_dock !== false,   // default: true
      dock_sensors: config.dock_sensors || {},
      dock_binary_sensors: config.dock_binary_sensors || {},
    };
    // Apply default entity IDs if not provided
    const base = 'marty_mccleaner';
    const dock = 'saros_10r_dock';
    const s = this._config.sensors;
    const bs = this._config.binary_sensors;
    const sel = this._config.selects;
    const ds = this._config.dock_sensors;
    const dbs = this._config.dock_binary_sensors;

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

    // Dock entity defaults (saros_10r_dock prefix)
    // device_class: problem → on = PROBLEM, off = OK
    if (!dbs.clean_water_box)  dbs.clean_water_box  = `binary_sensor.${dock}_clean_water_box`;
    if (!dbs.dirty_water_box)  dbs.dirty_water_box  = `binary_sensor.${dock}_dirty_water_box`;
    if (!dbs.cleaning_fluid)   dbs.cleaning_fluid   = `binary_sensor.${dock}_cleaning_fluid`;
    if (!dbs.mop_drying)       dbs.mop_drying       = `binary_sensor.${dock}_mop_drying`;
    if (!ds.dock_error)        ds.dock_error        = `sensor.${dock}_dock_error`;
    if (!ds.mop_drying_time)   ds.mop_drying_time   = `sensor.${dock}_mop_drying_remaining_time`;
    if (!ds.strainer_left)     ds.strainer_left     = `sensor.${dock}_strainer_time_left`;

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

  // Dock entity helpers (saros_10r_dock prefix)
  _getDockBinary(key) {
    const id = this._config.dock_binary_sensors?.[key];
    return id ? (this._hass.states[id] || null) : null;
  }
  _isDockProblem(key) {
    // device_class: problem → on = PROBLEM
    return this._getDockBinary(key)?.state === 'on';
  }
  _isDockRunning(key) {
    // device_class: running → on = active
    return this._getDockBinary(key)?.state === 'on';
  }
  _getDockSensorState(key) {
    const id = this._config.dock_sensors?.[key];
    if (!id) return null;
    const s = this._hass.states[id];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return s.state;
  }
  _getDockSensorNum(key) {
    const v = this._getDockSensorState(key);
    if (v === null) return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  // Returns fill level 0–100. Uses numeric sensor if configured, else derives from binary.
  // emptyIsBad=true  → empty = problem (clean water, fluid): ok≈88%, problem≈5%
  // emptyIsBad=false → full  = problem (dirty water, dust):  ok≈8%,  problem≈92%
  _getDockLevel(levelKey, binaryKey, emptyIsBad) {
    const n = this._getDockSensorNum(levelKey);
    if (n !== null) return Math.max(0, Math.min(100, n));
    const isProblem = this._isDockProblem(binaryKey);
    return emptyIsBad ? (isProblem ? 5 : 88) : (isProblem ? 92 : 8);
  }

  // Derive the effective group from vacuum state + status sensor
  _getGroup() {
    const entity = this._hass.states[this._config.entity];
    const vacState = entity?.state || 'idle';
    const statusVal = this._getSensorState('status');

    // Dock binary sensors take highest priority (most accurate)
    if (this._isDockRunning('mop_drying'))  return 'mop_drying';

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

    // Tap anywhere on card → more-info (both slim and verbose)
    this.shadowRoot.querySelector('.card')?.addEventListener('click', () => {
      const event = new Event('hass-more-info', { bubbles: true, composed: true });
      event.detail = { entityId: this._config.entity };
      this.dispatchEvent(event);
    });
  }

  _renderSlim() {
    const entity  = this._hass.states[this._config.entity];
    const vacState = entity?.state || 'idle';
    const name    = this._config.name || entity?.attributes?.friendly_name || this._config.entity;
    const group   = this._getGroup();
    const accent  = ACCENT[group] || '#888780';
    const badgeLabel = BADGE_LABELS[group] || group;
    const isActive   = ACTIVE_BADGE_GROUPS.has(group);
    const pulseAnim  = PULSE_ANIM[group] || null;

    const battery   = this._getSensorNum('battery') ?? entity?.attributes?.battery_level ?? null;
    const isCharging = this._isBinaryOn('charging');
    const batPct    = battery !== null ? Math.max(0, Math.min(100, battery)) : 0;
    const batCol    = batteryColor(battery, isCharging);

    // ── Right column (same logic as vacuum.yaml) ───────────────────────
    let rightVal   = '—';
    let rightLabel = '';
    let rightCol   = accent;

    const isActiveClean = ['cleaning','mopping','combo'].includes(group);
    if (group === 'mop_washing') {
      rightVal = '🫧'; rightLabel = 'myje mop';
    } else if (group === 'mop_drying') {
      const sec = this._getDockSensorNum('mop_drying_time');
      rightVal = sec && sec > 0 ? `~${Math.ceil(sec/60)}m` : '🌡';
      rightLabel = 'suszy mop'; rightCol = '#C97A50';
    } else if (group === 'emptying') {
      rightVal = '🌪'; rightLabel = 'opróżnia';
    } else if (isActiveClean) {
      const timeVal = this._getSensorNum('time');
      if (timeVal !== null) {
        const h = Math.floor(timeVal / 60), m = Math.round(timeVal % 60);
        rightVal  = h > 0 ? `${h}h ${m}m` : `${m}m`;
        rightLabel = 'czas sprzątania';
      }
      rightCol = accent;
    } else if (group === 'returning' || group === 'docking') {
      rightVal = battery !== null ? `${battery}%` : '↩';
      rightLabel = 'bateria'; rightCol = batCol;
    } else {
      // docked / idle / error — show battery %
      rightVal  = battery !== null ? `${battery}%` : '—';
      rightLabel = isCharging ? 'ładuje' : 'bateria';
      rightCol  = batCol;
    }

    // ── Progress bar (cleaning progress or battery) ────────────────────
    let barPct   = batPct;
    let barLabel = isCharging ? 'ładuje' : 'bateria';
    let barCol   = batCol;
    let barGrad  = isCharging
      ? `linear-gradient(90deg,#5A6356,${batCol})`
      : batPct > 60 ? `linear-gradient(90deg,#5F8932,#97C459)`
      : batPct > 30 ? `linear-gradient(90deg,#9A5230,#EF9F27)`
      :               `linear-gradient(90deg,#8F2320,#E24B4A)`;

    if (isActiveClean) {
      const prog = this._getSensorNum('progress');
      if (prog !== null) {
        barPct   = Math.max(0, Math.min(100, prog));
        barLabel = 'postęp sprzątania';
        barCol   = accent;
        barGrad  = `linear-gradient(90deg,${accent}88,${accent})`;
      }
    }

    // ── Chips (fan + mop, compact) ─────────────────────────────────────
    const chips = [];
    const fanSpeed = entity?.attributes?.fan_speed || null;
    if (fanSpeed) {
      const fi = FAN_MAP[fanSpeed] || { label: fanSpeed, col: '#888780', bg: 'rgba(136,135,128,0.12)' };
      chips.push(`<span style="font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;
                               background:${fi.bg};color:${fi.col};white-space:nowrap;">${fi.label}</span>`);
    }
    const mopAttached = this._isBinaryOn('mop_attached');
    const mopIntensity = this._getSelectState('mop_intensity');
    if (mopAttached && mopIntensity && mopIntensity !== 'off') {
      const mi = MOP_INTENSITY_MAP[mopIntensity];
      if (mi) chips.push(`<span style="font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;
                                       background:${mi.bg};color:${mi.col};white-space:nowrap;">${mi.label}</span>`);
    } else if (!mopAttached) {
      chips.push(`<span style="font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;
                               background:rgba(95,94,90,0.10);color:#5F5E5A;white-space:nowrap;">bez mopa</span>`);
    }
    // Show area when cleaning
    if (isActiveClean) {
      const area = this._getSensorNum('area');
      if (area) chips.push(`<span style="font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;
                                         background:rgba(151,196,89,0.10);color:#97C459;white-space:nowrap;">
                                         ${fmtArea(area)}</span>`);
    }
    const chipsRow = chips.length
      ? `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">${chips.join('')}</div>`
      : '';

    // ── Badge ──────────────────────────────────────────────────────────
    const badgeBg = isActive
      ? `background:${accent}24;color:${accent};`
      : `background:rgba(136,135,128,0.12);color:${accent};`;

    // ── Card border + pulse ────────────────────────────────────────────
    const borderStyle = pulseAnim
      ? `border:1px solid ${accent}47;animation:${pulseAnim};`
      : 'border:0.5px solid rgba(255,255,255,0.08);';

    const icon = getStateIcon(group, accent);

    return `
      <div class="card slim" style="${borderStyle}">
        <div style="display:grid;grid-template-columns:4px 1fr auto;gap:0 14px;
                    align-items:stretch;padding:14px 16px;
                    font-family:-apple-system,system-ui,sans-serif;">

          <!-- accent bar -->
          <div style="width:4px;border-radius:16px 0 0 16px;background:${accent};align-self:stretch;"></div>

          <!-- body -->
          <div style="display:flex;flex-direction:column;gap:8px;min-width:0;">

            <!-- row 1: icon + name + badge + toggle -->
            <div style="display:flex;align-items:center;gap:8px;">
              ${icon}
              <span style="font-size:13px;font-weight:500;color:#F1EFE8;flex:1;min-width:0;
                           overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span>
              <span class="badge" style="${badgeBg}">
                <span style="width:5px;height:5px;border-radius:50%;flex-shrink:0;background:${accent};
                             ${isActive ? 'animation:vac-dot 1.8s ease-in-out infinite;' : ''}"></span>
                ${badgeLabel}
              </span>
              <button class="toggle-btn" title="Rozwiń" style="margin-left:2px;">${svgToggleExpand()}</button>
            </div>

            <!-- row 2: chips -->
            ${chipsRow}

            <!-- row 3: progress bar — jak w vacuum.yaml -->
            <div style="display:flex;flex-direction:column;gap:4px;">
              <div style="height:3px;border-radius:99px;background:rgba(255,255,255,0.07);overflow:hidden;">
                <div style="height:100%;width:${barPct.toFixed(1)}%;border-radius:99px;
                            background:${barGrad};transition:width 1s ease;"></div>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="font-size:10px;color:rgba(255,255,255,0.28);">${barLabel}</span>
                <span style="font-size:10px;color:rgba(255,255,255,0.28);">${barPct.toFixed(0)}%</span>
              </div>
            </div>

          </div>

          <!-- right column — 20px/600 jak w vacuum.yaml -->
          <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:center;
                      gap:2px;min-width:52px;">
            <span style="font-size:20px;font-weight:600;letter-spacing:-0.5px;line-height:1;
                         color:${rightCol};">${rightVal}</span>
            <span style="font-size:10px;color:rgba(255,255,255,0.28);white-space:nowrap;">${rightLabel}</span>
          </div>

        </div>
      </div>`;
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
    const showDock = this._config.show_dock && (
      this._config.dock_entity ||
      ['mop_washing','mop_drying','emptying','charging'].includes(group)
    );

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

    // ── Section 5: Dok + Konsumable (combined) ──
    sections.push('<div class="sep"></div>');
    sections.push('<div class="section">' + this._renderDockAndConsumables(group, showDock) + '</div>');

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
      html += `<div class="water-alert">⚠ Brak płynu czyszczącego — uzupełnij zanim wróci</div>`;
    }

    return html;
  }

  _renderDockDiagram(group) {
    const isMopWashing  = group === 'mop_washing';
    const isMopDrying   = group === 'mop_drying';
    const isEmptying    = group === 'emptying';
    const isCharging    = this._isBinaryOn('charging');
    const mopAttached   = this._isBinaryOn('mop_attached');
    const statusVal     = this._getSensorState('status') || '';
    const vacError      = this._getSensorState('vacuum_error') || 'none';
    const hasVacError   = vacError !== 'none' && vacError !== 'unknown';

    // Dock sensors (saros_10r_dock) — device_class:problem → on = PROBLEM
    const dirtyBoxProblem  = this._isDockProblem('dirty_water_box');   // brudna woda (lewo góra)
    const cleanBoxProblem  = this._isDockProblem('clean_water_box');   // czysta woda (prawo góra)
    const fluidProblem     = this._isDockProblem('cleaning_fluid');    // płyn czyszczący (lewo dół)
    const dockMopDrying    = this._isDockRunning('mop_drying');        // dok suszy mop
    const dockError        = this._getDockSensorState('dock_error');   // ok / error code
    const hasDockError     = dockError && dockError !== 'ok' && dockError !== 'unknown';
    const mopDryingTimeSec = this._getDockSensorNum('mop_drying_time');// sekundy pozostałe
    const hasError         = hasDockError;                             // dla SVG overlay

    // ── Isometric 30° projection ─────────────────────────────────────────
    // Saros 10R dock: wide rect box, roughly 1:0.7:1.15 (W:D:H)
    // We exaggerate depth slightly for readability
    const W = 72, D = 54, BH = 75, PH = 22; // BH=body height, PH=platform/podest height
    const cos30 = 0.866, sin30 = 0.5;
    const dx  = W * cos30;
    const dy  = W * sin30;
    const ddx = D * cos30;
    const ddy = D * sin30;
    const pl  = 8;
    const pt  = ddy + 10;

    // Parametric helpers — coordinates on each face
    // Front face (u=0..1 left→right, v=0..1 top→bottom) — dock BODY only (height BH)
    const fp = (u, v) => [pl + u * dx,       pt + u * dy + v * BH];
    // Top face  (u=0..1 left→right, d=0..1 front→back)
    const tp = (u, d) => [pl + u * dx + d * ddx, pt + u * dy - d * ddy];
    // Right face (d=0..1 front→back, v=0..1 top→bottom) — dock BODY only (height BH)
    const rp = (d, v) => [pl + dx + d * ddx, pt + dy - d * ddy + v * BH];
    // Platform (podest) face helpers — below dock body (height PH)
    const pFp = (u, v) => [pl + u * dx,       pt + u * dy + BH + v * PH];
    const pRp = (d, v) => [pl + dx + d * ddx, pt + dy - d * ddy + BH + v * PH];

    const poly = pts => pts.map(p => p.join(',')).join(' ');

    // ── Geometry — new layout matching actual Saros 10R dock ────────────
    const frontPts      = poly([fp(0,0), fp(1,0), fp(1,1), fp(0,1)]);
    const rightPts      = poly([rp(0,0), rp(1,0), rp(1,1), rp(0,1)]);
    const topPts        = poly([tp(0,0), tp(1,0), tp(1,1), tp(0,1)]);
    const topDirtyPts   = poly([tp(0,0), tp(0.5,0), tp(0.5,1), tp(0,1)]);
    const topCleanPts   = poly([tp(0.5,0), tp(1,0), tp(1,1), tp(0.5,1)]);
    const topDivLine    = [tp(0.5,0), tp(0.5,1)];

    // Front face — upper: two large tank panels
    const leftTankPts   = poly([fp(0,0.03), fp(0.5,0.03), fp(0.5,0.57), fp(0,0.57)]);
    const rightTankPts  = poly([fp(0.5,0.03), fp(1,0.03), fp(1,0.57), fp(0.5,0.57)]);
    const tankDivLine   = [fp(0.5,0.03), fp(0.5,0.57)];

    // Front face — lower: fluid (left), mop band (right narrow), dock slot (right)
    const fluidPts      = poly([fp(0.02,0.59), fp(0.38,0.59), fp(0.38,0.95), fp(0.02,0.95)]);
    const mopBayPts     = poly([fp(0.40,0.59), fp(0.97,0.59), fp(0.97,0.70), fp(0.40,0.70)]);
    const dockSlotPts   = poly([fp(0.40,0.71), fp(0.97,0.71), fp(0.97,0.97), fp(0.40,0.97)]);

    // Platform (podest) polygons — below dock body
    const platLeftPts  = poly([pFp(0,0), pFp(0.40,0), pFp(0.40,1), pFp(0,1)]);
    const platSlotPts  = poly([pFp(0.40,0), pFp(1,0), pFp(1,1), pFp(0.40,1)]);
    const platRightPts = poly([pRp(0,0), pRp(1,0), pRp(1,1), pRp(0,1)]);

    // Robot docked — floor at BH + PH
    const isRobotDocked = isCharging || ['mop_washing','mop_drying','emptying','charging'].includes(group);
    const Xr_l = 0.685 * W, Zr_l = 0;
    const robotCX = pl + cos30 * (Xr_l + Zr_l);
    const robotCY = pt + sin30 * (Xr_l - Zr_l) + BH + PH;
    const robotRX = 26 * cos30 * Math.SQRT2;
    const robotRY = 26 * sin30 * Math.SQRT2;

    // ── Colors ───────────────────────────────────────────────────────────
    const activeDrying  = isMopDrying || dockMopDrying;
    const dirtyCol      = dirtyBoxProblem ? '#EF9F27' : '#5F5E5A';
    const dirtyCBg      = dirtyBoxProblem ? 'rgba(239,159,39,0.10)' : 'rgba(95,94,90,0.06)';
    const cleanCol      = cleanBoxProblem ? '#EF9F27' : '#5F5E5A';
    const cleanBg       = cleanBoxProblem ? 'rgba(239,159,39,0.10)' : 'rgba(95,94,90,0.06)';
    const fluidCol      = fluidProblem    ? '#EF9F27' : '#5F5E5A';
    const fluidBg       = fluidProblem    ? 'rgba(239,159,39,0.10)' : 'rgba(95,94,90,0.06)';
    const mopBayCol     = isMopWashing ? '#7BAED4' : activeDrying ? '#C97A50' : 'rgba(255,255,255,0.05)';
    const mopBayBg      = isMopWashing ? 'rgba(123,174,212,0.12)' : activeDrying ? 'rgba(201,122,80,0.10)' : 'rgba(255,255,255,0.02)';
    const robotCol      = isCharging ? '#97C459' : hasError ? '#E24B4A' : '#5F5E5A';
    const robotBg       = isCharging ? 'rgba(151,196,89,0.14)' : hasError ? 'rgba(226,75,74,0.12)' : 'rgba(95,94,90,0.10)';
    const robotSideBg   = isCharging ? 'rgba(151,196,89,0.38)' : hasError ? 'rgba(226,75,74,0.32)' : 'rgba(80,80,78,0.55)';
    const robotH        = 8;

    // ── Fill levels (front-face vertical fills, rising from bottom) ──────
    const dirtyLvl      = this._getDockLevel('dirty_water_level', 'dirty_water_box', false) / 100;
    const cleanLvl      = this._getDockLevel('clean_water_level', 'clean_water_box', true)  / 100;
    const fluidLvl      = this._getDockLevel('fluid_level', 'cleaning_fluid', true)         / 100;

    const dirtyFillTopV = 0.57 - 0.54 * dirtyLvl;
    const cleanFillTopV = 0.57 - 0.54 * cleanLvl;
    const fluidFillTopV = 0.95 - 0.36 * fluidLvl;
    const dirtyFillPts  = poly([fp(0,dirtyFillTopV), fp(0.5,dirtyFillTopV), fp(0.5,0.57), fp(0,0.57)]);
    const cleanFillPts  = poly([fp(0.5,cleanFillTopV), fp(1,cleanFillTopV), fp(1,0.57), fp(0.5,0.57)]);
    const fluidFillPts  = poly([fp(0.02,fluidFillTopV), fp(0.38,fluidFillTopV), fp(0.38,0.95), fp(0.02,0.95)]);
    const dirtyFillCol  = dirtyBoxProblem ? 'rgba(239,159,39,0.38)' : 'rgba(95,94,90,0.18)';
    const cleanFillCol  = cleanBoxProblem ? 'rgba(239,159,39,0.38)' : 'rgba(95,94,90,0.18)';
    const fluidFillCol  = fluidProblem    ? 'rgba(239,159,39,0.38)' : 'rgba(95,94,90,0.18)';

    const [dirtyDropX, dirtyDropY] = fp(0.25, 0.30);
    const [cleanDropX, cleanDropY] = fp(0.75, 0.30);
    const [fluidDropX, fluidDropY] = fp(0.20, 0.72);

    const dropIcon = (cx, cy, r, col) => {
      const t = n => n.toFixed(1);
      return `<path d="M${t(cx)},${t(cy-r)} C${t(cx+r*0.6)},${t(cy-r*0.15)} ${t(cx+r)},${t(cy+r*0.4)} ${t(cx)},${t(cy+r)} C${t(cx-r)},${t(cy+r*0.4)} ${t(cx-r*0.6)},${t(cy-r*0.15)} ${t(cx)},${t(cy-r)}" fill="${col}" opacity="0.65"/>`;
    };

    // ── Animations in mop band ────────────────────────────────────────────
    const makeMopLine = (frac, delay, col) => {
      const v = 0.59 + 0.11 * frac;
      const [x1, y1] = fp(0.42, v), [x2, y2] = fp(0.95, v);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
                    stroke="${col}" stroke-width="1.2" stroke-linecap="round"
                    style="animation:vac-water-drop 1.2s ${delay}s ease-in-out infinite"/>`;
    };
    const makeHeatArc = (uf, vf, delay) => {
      const [xs, ys] = fp(0.42+0.53*uf-0.07, 0.59+0.11*vf+0.02);
      const [xe, ye] = fp(0.42+0.53*uf+0.07, 0.59+0.11*vf+0.02);
      const [xc, yc] = fp(0.42+0.53*uf,      0.59+0.11*vf-0.03);
      return `<path d="M ${xs.toFixed(1)} ${ys.toFixed(1)} Q ${xc.toFixed(1)} ${yc.toFixed(1)} ${xe.toFixed(1)} ${ye.toFixed(1)}"
                    stroke="#C97A50" stroke-width="1.3" fill="none" stroke-linecap="round"
                    style="animation:vac-heat 1.5s ${delay}s ease-in-out infinite"/>`;
    };
    const makeDustParticle = (uf, r, delay) => {
      const [cx2, cy2] = fp(0.50 + 0.40*uf, 0.64);
      return `<circle cx="${cx2.toFixed(1)}" cy="${cy2.toFixed(1)}" r="${r}"
                      fill="#EF9F27" style="animation:vac-water-drop 0.9s ${delay}s ease-in-out infinite"/>`;
    };

    let activeAnim = '';
    if (isMopWashing) {
      activeAnim = makeMopLine(0.2,0.0,'#7BAED4') + makeMopLine(0.55,0.35,'#7BAED4') + makeMopLine(0.9,0.7,'#7BAED4');
    } else if (activeDrying) {
      activeAnim = makeHeatArc(0.15,0.5,0.0) + makeHeatArc(0.5,0.5,0.3) + makeHeatArc(0.85,0.5,0.6)
                 + makeHeatArc(0.3,0.1,0.15) + makeHeatArc(0.7,0.1,0.45);
    } else if (isEmptying) {
      activeAnim = makeDustParticle(0,1.5,0.0) + makeDustParticle(0.5,1.8,0.25) + makeDustParticle(1,1.5,0.5);
    }

    const errorOverlay = hasError
      ? `<polygon points="${frontPts}" fill="rgba(226,75,74,0.07)" style="animation:vac-pulse-error 2s ease-in-out infinite"/>`
      : '';

    const vbW = Math.ceil(pl + dx + ddx + 10);
    const vbH = isRobotDocked
      ? Math.ceil(robotCY + robotRY + robotH + 4)
      : Math.ceil(pt + dy + BH + PH + 6);

    const svg = `
      <svg viewBox="0 0 ${vbW} ${vbH}" width="${vbW}" height="${vbH}"
           fill="none" style="display:block;overflow:visible;font-family:-apple-system,sans-serif;">

        <!-- ── Robot (drawn first — dock overlays upper half) ── -->
        ${isRobotDocked ? `
        <ellipse cx="${robotCX.toFixed(1)}" cy="${(robotCY+robotH).toFixed(1)}"
                 rx="${robotRX.toFixed(1)}" ry="${robotRY.toFixed(1)}"
                 fill="${robotSideBg}" stroke="${robotCol}" stroke-width="1.4"/>
        <ellipse cx="${robotCX.toFixed(1)}" cy="${robotCY.toFixed(1)}"
                 rx="${robotRX.toFixed(1)}" ry="${robotRY.toFixed(1)}"
                 fill="${robotBg}" stroke="${robotCol}" stroke-width="1.8"
                 ${isCharging ? 'style="animation:vac-pulse-charging 2.5s ease-in-out infinite"' : ''}/>
        <path d="M ${(robotCX-robotRX*0.78).toFixed(1)} ${(robotCY+robotRY*0.15).toFixed(1)}
                 A ${(robotRX*0.78).toFixed(1)} ${(robotRY*0.78).toFixed(1)} 0 0 1
                   ${(robotCX+robotRX*0.78).toFixed(1)} ${(robotCY+robotRY*0.15).toFixed(1)}"
              stroke="${robotCol}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.55"/>
        <ellipse cx="${robotCX.toFixed(1)}" cy="${(robotCY-robotRY*0.10).toFixed(1)}"
                 rx="5" ry="3" fill="${robotBg}" stroke="${robotCol}" stroke-width="1.0" opacity="0.9"/>
        ${isCharging ? `<text x="${robotCX.toFixed(1)}" y="${(robotCY+robotRY*0.12+6).toFixed(1)}"
              text-anchor="middle" font-size="12" fill="#97C459"
              style="animation:vac-dot 1.8s ease-in-out infinite">⚡</text>` : ''}
        ` : ''}

        <!-- Right face -->
        <polygon points="${rightPts}" fill="#161618" stroke="rgba(255,255,255,0.07)" stroke-width="0.8"/>

        <!-- Front face base -->
        <polygon points="${frontPts}" fill="#1C1C1E" stroke="rgba(255,255,255,0.09)" stroke-width="0.8"/>
        ${errorOverlay}

        <!-- ── Upper: Dirty water (left) ── -->
        <polygon points="${leftTankPts}" fill="${dirtyCBg}" stroke="${dirtyCol}" stroke-width="0.9"
                 ${dirtyBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        <polygon points="${dirtyFillPts}" fill="${dirtyFillCol}" stroke="none"
                 ${dirtyBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        ${dropIcon(dirtyDropX, dirtyDropY, 5, dirtyCol)}

        <!-- ── Upper: Clean water (right) ── -->
        <polygon points="${rightTankPts}" fill="${cleanBg}" stroke="${cleanCol}" stroke-width="0.9"
                 ${cleanBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        <polygon points="${cleanFillPts}" fill="${cleanFillCol}" stroke="none"
                 ${cleanBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        ${dropIcon(cleanDropX, cleanDropY, 5, cleanCol)}

        <!-- Tank divider -->
        <line x1="${tankDivLine[0][0].toFixed(1)}" y1="${tankDivLine[0][1].toFixed(1)}"
              x2="${tankDivLine[1][0].toFixed(1)}" y2="${tankDivLine[1][1].toFixed(1)}"
              stroke="rgba(255,255,255,0.12)" stroke-width="0.8"/>

        <!-- ── Lower: Fluid (left) ── -->
        <polygon points="${fluidPts}" fill="${fluidBg}" stroke="${fluidCol}" stroke-width="0.9"
                 ${fluidProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        <polygon points="${fluidFillPts}" fill="${fluidFillCol}" stroke="none"/>
        ${dropIcon(fluidDropX, fluidDropY, 3.5, fluidCol)}

        <!-- ── Lower: Mop band (right) ── -->
        <polygon points="${mopBayPts}" fill="${mopBayBg}" stroke="${mopBayCol}" stroke-width="0.8"/>
        ${activeAnim}

        <!-- ── Lower: Dock slot ── -->
        <polygon points="${dockSlotPts}" fill="rgba(255,255,255,0.01)"
                 stroke="rgba(255,255,255,0.05)" stroke-width="0.7" stroke-dasharray="2.5,2"/>

        <!-- ── Top face ── -->
        <polygon points="${topPts}" fill="#212123" stroke="rgba(255,255,255,0.09)" stroke-width="0.8"/>
        <polygon points="${topDirtyPts}" fill="${dirtyBoxProblem ? 'rgba(239,159,39,0.12)' : 'rgba(255,255,255,0.04)'}" stroke="none" opacity="0.9"/>
        <polygon points="${topCleanPts}" fill="${cleanBoxProblem ? 'rgba(239,159,39,0.12)' : 'rgba(255,255,255,0.04)'}" stroke="none" opacity="0.9"/>
        <line x1="${topDivLine[0][0].toFixed(1)}" y1="${topDivLine[0][1].toFixed(1)}"
              x2="${topDivLine[1][0].toFixed(1)}" y2="${topDivLine[1][1].toFixed(1)}"
              stroke="rgba(255,255,255,0.10)" stroke-width="0.8"/>
        <line x1="${tp(0,0)[0].toFixed(1)}" y1="${tp(0,0)[1].toFixed(1)}"
              x2="${tp(1,0)[0].toFixed(1)}" y2="${tp(1,0)[1].toFixed(1)}"
              stroke="rgba(255,255,255,0.16)" stroke-width="0.7"/>

        <!-- ── Platform (podest) — below dock body ── -->
        <polygon points="${platRightPts}" fill="#111113" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/>
        <polygon points="${platLeftPts}"  fill="#181819" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
        <polygon points="${platSlotPts}"  fill="rgba(8,8,10,0.75)"
                 stroke="rgba(255,255,255,0.05)" stroke-width="0.7"/>
      </svg>`;

    // ── Legend — compact ─────────────────────────────────────────────────
    // OK items: tiny muted dot in a row; problem items: full chip

    // Helper: small status dot (OK — muted, problem — colored + label)
    const okDot  = (label) =>
      `<span title="${label}" style="display:inline-block;width:7px;height:7px;
              border-radius:50%;background:rgba(151,196,89,0.30);flex-shrink:0;"></span>`;
    const problemChip = (label, value, col) =>
      `<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;
                   border-radius:8px;background:rgba(226,75,74,0.10);
                   border:1px solid rgba(226,75,74,0.22);">
         <span style="width:6px;height:6px;border-radius:50%;background:${col};flex-shrink:0;
                      animation:vac-dot 1.8s ease-in-out infinite;"></span>
         <span style="font-size:10px;color:rgba(255,255,255,0.55);">${label}</span>
         <span style="font-size:10px;font-weight:600;color:${col};margin-left:auto;">${value}</span>
       </div>`;
    const activeChip = (label, value, col) =>
      `<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;
                   border-radius:8px;background:rgba(${col==='#C97A50'?'201,122,80':'133,183,235'},0.10);
                   border:1px solid rgba(${col==='#C97A50'?'201,122,80':'133,183,235'},0.20);">
         <span style="width:6px;height:6px;border-radius:50%;background:${col};flex-shrink:0;
                      animation:vac-dot 1.8s ease-in-out infinite;"></span>
         <span style="font-size:10px;color:${col};font-weight:500;">${label}</span>
         ${value ? `<span style="font-size:10px;color:rgba(255,255,255,0.40);margin-left:2px;">${value}</span>` : ''}
       </div>`;

    // Row 1: quiet OK dots for all-ok items + problem chips
    const statusDots = [];   // tiny dots for OK items
    const problemRows = [];  // full chips for problems

    const dockItems = [
      { key: 'dirty', label: 'Brudna woda', problem: dirtyBoxProblem, value: '⚠ pełna' },
      { key: 'clean', label: 'Czysta woda', problem: cleanBoxProblem, value: '⚠ pusta' },
      { key: 'fluid', label: 'Płyn czyszczący', problem: fluidProblem, value: '⚠ uzupełnij' },
    ];

    dockItems.forEach(item => {
      if (item.problem) {
        problemRows.push(problemChip(item.label, item.value, '#E24B4A'));
      } else {
        statusDots.push(okDot(item.label + ' · ok'));
      }
    });

    // Mop state
    if (mopAttached) {
      statusDots.push(`<span title="Mop założony" style="display:inline-block;width:7px;height:7px;
        border-radius:50%;background:rgba(133,183,235,0.35);flex-shrink:0;"></span>`);
    }

    // Active dock operations
    if (activeDrying) {
      let timeStr = '';
      if (mopDryingTimeSec !== null && mopDryingTimeSec > 0) {
        const m = Math.ceil(mopDryingTimeSec / 60);
        timeStr = `~${m} min`;
      }
      problemRows.push(activeChip('suszy mop', timeStr, '#C97A50'));
    }

    // Dock error
    if (hasDockError) {
      const DOCK_ERROR_MAP = {
        duct_blockage:                 'Zatkany przewód',
        water_empty:                   'Brak wody',
        waste_water_tank_full:         'Pełna brudna woda',
        maintenance_brush_jammed:      'Szczotka zablokowana',
        dirty_tank_latch_open:         'Otwarty zatrzask',
        no_dustbin:                    'Brak pojemnika',
        cleaning_tank_full_or_blocked: 'Zbiornik czyszczący',
      };
      problemRows.push(problemChip('Błąd doku', DOCK_ERROR_MAP[dockError] || dockError, '#E24B4A'));
    }

    // Vacuum robot error — very muted, single dot
    if (hasVacError) {
      const errLabel = ERROR_MAP[vacError] || vacError;
      problemRows.push(problemChip('Robot', errLabel, '#EF9F27'));
    }

    const dotsRow = statusDots.length
      ? `<div style="display:flex;align-items:center;gap:5px;">${statusDots.join('')}</div>`
      : '';
    const rows = problemRows;

    const legendHtml = `
      <div style="display:flex;flex-direction:column;gap:6px;padding-top:4px;flex:1;min-width:0;">
        ${dotsRow}
        ${rows.join('')}
      </div>`;

    return `
      <div class="dock-section">
        <div class="dock-title">Dok · Saros 10R</div>
        <div style="display:flex;align-items:flex-start;gap:14px;">
          <div style="flex-shrink:0;">${svg}</div>
          ${legendHtml}
        </div>
      </div>`;
  }

  // ── Combined: compact dock SVG (left) + status + consumables (right) ──
  _renderDockAndConsumables(group, showDock) {
    const dockSvg = showDock ? this._buildCompactDockSvg(group) : null;
    const legendHtml = showDock ? this._buildDockLegend(group) : null;
    const consumablesHtml = this._buildConsumableIcons();

    if (!dockSvg) {
      // No dock — just consumables row
      return consumablesHtml;
    }

    return `
      <div style="display:flex;align-items:flex-start;gap:12px;">

        <!-- Left: compact dock SVG -->
        <div style="flex-shrink:0;">
          <div class="dock-title" style="margin-bottom:6px;">Dok</div>
          ${dockSvg}
        </div>

        <!-- Right: dock status + consumables -->
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;">

          ${legendHtml}

          <div style="height:1px;background:rgba(255,255,255,0.05);"></div>

          <!-- Consumable icons + lifetime -->
          ${consumablesHtml}

        </div>
      </div>`;
  }

  // Compact SVG — same geometry but W/D/H scaled down ~30%
  _buildCompactDockSvg(group) {
    const isMopWashing  = group === 'mop_washing';
    const isEmptying    = group === 'emptying';
    const isCharging    = this._isBinaryOn('charging');
    const dirtyBoxProblem = this._isDockProblem('dirty_water_box');
    const cleanBoxProblem = this._isDockProblem('clean_water_box');
    const fluidProblem    = this._isDockProblem('cleaning_fluid');
    const dockMopDrying   = this._isDockRunning('mop_drying');
    const activeDrying    = group === 'mop_drying' || dockMopDrying;
    const vacError        = this._getSensorState('vacuum_error') || 'none';
    const hasDockError    = (() => { const e = this._getDockSensorState('dock_error'); return e && e !== 'ok' && e !== 'unknown'; })();
    const hasError        = hasDockError;

    // ── Smaller proportions ──────────────────────────────────────────
    const W = 52, D = 38, BH = 53, PH = 15; // BH=body, PH=platform
    const cos30 = 0.866, sin30 = 0.5;
    const dx  = W * cos30, dy  = W * sin30;
    const ddx = D * cos30, ddy = D * sin30;
    const pl = 6, pt = ddy + 7;

    const fp  = (u, v) => [pl + u*dx,         pt + u*dy + v*BH];
    const tp  = (u, d) => [pl + u*dx + d*ddx,  pt + u*dy - d*ddy];
    const rp  = (d, v) => [pl + dx + d*ddx,    pt + dy - d*ddy + v*BH];
    const pFp = (u, v) => [pl + u*dx,          pt + u*dy + BH + v*PH];
    const pRp = (d, v) => [pl + dx + d*ddx,    pt + dy - d*ddy + BH + v*PH];
    const poly = pts => pts.map(p => p.join(',')).join(' ');

    // ── Geometry — new layout matching actual Saros 10R dock ────────────
    // Structural faces
    const frontPts  = poly([fp(0,0), fp(1,0), fp(1,1), fp(0,1)]);
    const rightPts  = poly([rp(0,0), rp(1,0), rp(1,1), rp(0,1)]);
    const topPts    = poly([tp(0,0), tp(1,0), tp(1,1), tp(0,1)]);
    const topDirtyPts = poly([tp(0,0), tp(0.5,0), tp(0.5,1), tp(0,1)]);
    const topCleanPts = poly([tp(0.5,0), tp(1,0), tp(1,1), tp(0.5,1)]);
    const topDivLine  = [tp(0.5,0), tp(0.5,1)];

    // Front face — upper half: two large tank panels
    const leftTankPts  = poly([fp(0,0.03), fp(0.5,0.03), fp(0.5,0.57), fp(0,0.57)]);
    const rightTankPts = poly([fp(0.5,0.03), fp(1,0.03), fp(1,0.57), fp(0.5,0.57)]);
    const tankDivLine  = [fp(0.5,0.03), fp(0.5,0.57)];

    // Front face — lower half: fluid (left), mop band (right narrow), dock slot (right)
    const fluidPts    = poly([fp(0.02,0.59), fp(0.38,0.59), fp(0.38,0.95), fp(0.02,0.95)]);
    const mopBayPts   = poly([fp(0.40,0.59), fp(0.97,0.59), fp(0.97,0.70), fp(0.40,0.70)]);
    const dockSlotPts = poly([fp(0.40,0.71), fp(0.97,0.71), fp(0.97,0.97), fp(0.40,0.97)]);

    // Platform (podest) polygons
    const platLeftPts_s  = poly([pFp(0,0), pFp(0.40,0), pFp(0.40,1), pFp(0,1)]);
    const platSlotPts_s  = poly([pFp(0.40,0), pFp(1,0), pFp(1,1), pFp(0.40,1)]);
    const platRightPts_s = poly([pRp(0,0), pRp(1,0), pRp(1,1), pRp(0,1)]);

    // Robot docked — floor at BH + PH
    const isRobotDocked = isCharging || ['mop_washing','mop_drying','emptying','charging'].includes(group);
    const Xr_s = 0.685 * W, Zr_s = 0;
    const robotCX = pl + cos30 * (Xr_s + Zr_s);
    const robotCY = pt + sin30 * (Xr_s - Zr_s) + BH + PH;
    const robotRX  = 18 * cos30 * Math.SQRT2;
    const robotRY  = 18 * sin30 * Math.SQRT2;

    // ── Colors ───────────────────────────────────────────────────────────
    const dirtyCol   = dirtyBoxProblem ? '#EF9F27' : '#5F5E5A';
    const dirtyCBg   = dirtyBoxProblem ? 'rgba(239,159,39,0.10)' : 'rgba(95,94,90,0.06)';
    const cleanCol   = cleanBoxProblem ? '#EF9F27' : '#5F5E5A';
    const cleanBg    = cleanBoxProblem ? 'rgba(239,159,39,0.10)' : 'rgba(95,94,90,0.06)';
    const fluidCol   = fluidProblem    ? '#EF9F27' : '#5F5E5A';
    const fluidBg    = fluidProblem    ? 'rgba(239,159,39,0.10)' : 'rgba(95,94,90,0.06)';
    const mopBayCol  = isMopWashing ? '#7BAED4' : activeDrying ? '#C97A50' : 'rgba(255,255,255,0.05)';
    const mopBayBg   = isMopWashing ? 'rgba(123,174,212,0.12)' : activeDrying ? 'rgba(201,122,80,0.10)' : 'rgba(255,255,255,0.02)';
    const robotCol     = isCharging ? '#97C459' : hasError ? '#E24B4A' : '#5F5E5A';
    const robotBg      = isCharging ? 'rgba(151,196,89,0.14)' : hasError ? 'rgba(226,75,74,0.12)' : 'rgba(95,94,90,0.10)';
    const robotSideBg  = isCharging ? 'rgba(151,196,89,0.38)' : hasError ? 'rgba(226,75,74,0.32)' : 'rgba(80,80,78,0.55)';
    const robotH       = 6;

    // ── Fill levels (front-face vertical fills rising from bottom) ───────
    const dirtyLvl = this._getDockLevel('dirty_water_level', 'dirty_water_box', false) / 100;
    const cleanLvl = this._getDockLevel('clean_water_level', 'clean_water_box', true)  / 100;
    const fluidLvl = this._getDockLevel('fluid_level', 'cleaning_fluid', true)         / 100;

    const dirtyFillTopV = 0.57 - 0.54 * dirtyLvl;
    const cleanFillTopV = 0.57 - 0.54 * cleanLvl;
    const fluidFillTopV = 0.95 - 0.36 * fluidLvl;
    const dirtyFillPts  = poly([fp(0,dirtyFillTopV), fp(0.5,dirtyFillTopV), fp(0.5,0.57), fp(0,0.57)]);
    const cleanFillPts  = poly([fp(0.5,cleanFillTopV), fp(1,cleanFillTopV), fp(1,0.57), fp(0.5,0.57)]);
    const fluidFillPts  = poly([fp(0.02,fluidFillTopV), fp(0.38,fluidFillTopV), fp(0.38,0.95), fp(0.02,0.95)]);
    const dirtyFillCol  = dirtyBoxProblem ? 'rgba(239,159,39,0.38)' : 'rgba(95,94,90,0.18)';
    const cleanFillCol  = cleanBoxProblem ? 'rgba(239,159,39,0.38)' : 'rgba(95,94,90,0.18)';
    const fluidFillCol  = fluidProblem    ? 'rgba(239,159,39,0.38)' : 'rgba(95,94,90,0.18)';

    // Water drop icon helper
    const dropIcon = (cx, cy, r, col) => {
      const t = n => n.toFixed(1);
      return `<path d="M${t(cx)},${t(cy-r)} C${t(cx+r*0.6)},${t(cy-r*0.15)} ${t(cx+r)},${t(cy+r*0.4)} ${t(cx)},${t(cy+r)} C${t(cx-r)},${t(cy+r*0.4)} ${t(cx-r*0.6)},${t(cy-r*0.15)} ${t(cx)},${t(cy-r)}" fill="${col}" opacity="0.65"/>`;
    };
    const [dirtyDropX, dirtyDropY] = fp(0.25, 0.30);
    const [cleanDropX, cleanDropY] = fp(0.75, 0.30);
    const [fluidDropX, fluidDropY] = fp(0.20, 0.72);

    // ── Animations inside mop band ────────────────────────────────────────
    const makeMopLine = (frac, delay, col) => {
      const v = 0.59 + 0.11 * frac;
      const [x1, y1] = fp(0.42, v), [x2, y2] = fp(0.95, v);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
                    stroke="${col}" stroke-width="1" stroke-linecap="round"
                    style="animation:vac-water-drop 1.2s ${delay}s ease-in-out infinite"/>`;
    };
    const makeHeatArc = (uf, vf, delay) => {
      const [xs, ys] = fp(0.42+0.53*uf-0.06, 0.59+0.11*vf+0.02);
      const [xe, ye] = fp(0.42+0.53*uf+0.06, 0.59+0.11*vf+0.02);
      const [xc, yc] = fp(0.42+0.53*uf,      0.59+0.11*vf-0.02);
      return `<path d="M ${xs.toFixed(1)} ${ys.toFixed(1)} Q ${xc.toFixed(1)} ${yc.toFixed(1)} ${xe.toFixed(1)} ${ye.toFixed(1)}"
                    stroke="#C97A50" stroke-width="1" fill="none" stroke-linecap="round"
                    style="animation:vac-heat 1.5s ${delay}s ease-in-out infinite"/>`;
    };
    const makeDustDot = (uf, r, delay) => {
      const [cx2, cy2] = fp(0.50 + 0.40*uf, 0.64);
      return `<circle cx="${cx2.toFixed(1)}" cy="${cy2.toFixed(1)}" r="${r}" fill="#EF9F27"
                      style="animation:vac-water-drop 0.9s ${delay}s ease-in-out infinite"/>`;
    };

    let activeAnim = '';
    if (isMopWashing) {
      activeAnim = makeMopLine(0.2,0.0,'#7BAED4') + makeMopLine(0.55,0.35,'#7BAED4') + makeMopLine(0.9,0.7,'#7BAED4');
    } else if (activeDrying) {
      activeAnim = makeHeatArc(0.15,0.5,0.0) + makeHeatArc(0.5,0.5,0.3) + makeHeatArc(0.85,0.5,0.6)
                 + makeHeatArc(0.3,0.1,0.15) + makeHeatArc(0.7,0.1,0.45);
    } else if (isEmptying) {
      activeAnim = makeDustDot(0,1.0,0.0) + makeDustDot(0.5,1.2,0.25) + makeDustDot(1,1.0,0.5);
    }

    const errorOverlay = hasError
      ? `<polygon points="${frontPts}" fill="rgba(226,75,74,0.07)" style="animation:vac-pulse-error 2s ease-in-out infinite"/>`
      : '';

    const vbW = Math.ceil(pl + dx + ddx + 8);
    const vbH = isRobotDocked
      ? Math.ceil(robotCY + robotRY + robotH + 3)
      : Math.ceil(pt + dy + BH + PH + 5);

    return `
      <svg viewBox="0 0 ${vbW} ${vbH}" width="${vbW}" height="${vbH}"
           fill="none" style="display:block;overflow:visible;font-family:-apple-system,sans-serif;">

        <!-- ── Robot (drawn first — dock overlays upper half) ── -->
        ${isRobotDocked ? `
        <ellipse cx="${robotCX.toFixed(1)}" cy="${(robotCY+robotH).toFixed(1)}"
                 rx="${robotRX.toFixed(1)}" ry="${robotRY.toFixed(1)}"
                 fill="${robotSideBg}" stroke="${robotCol}" stroke-width="1.0"/>
        <ellipse cx="${robotCX.toFixed(1)}" cy="${robotCY.toFixed(1)}"
                 rx="${robotRX.toFixed(1)}" ry="${robotRY.toFixed(1)}"
                 fill="${robotBg}" stroke="${robotCol}" stroke-width="1.4"
                 ${isCharging ? 'style="animation:vac-pulse-charging 2.5s ease-in-out infinite"' : ''}/>
        <path d="M ${(robotCX-robotRX*0.78).toFixed(1)} ${(robotCY+robotRY*0.15).toFixed(1)}
                 A ${(robotRX*0.78).toFixed(1)} ${(robotRY*0.78).toFixed(1)} 0 0 1
                   ${(robotCX+robotRX*0.78).toFixed(1)} ${(robotCY+robotRY*0.15).toFixed(1)}"
              stroke="${robotCol}" stroke-width="0.9" fill="none" stroke-linecap="round" opacity="0.55"/>
        <ellipse cx="${robotCX.toFixed(1)}" cy="${(robotCY-robotRY*0.10).toFixed(1)}"
                 rx="3.5" ry="2.1" fill="${robotBg}" stroke="${robotCol}" stroke-width="0.8" opacity="0.9"/>
        ${isCharging ? `<text x="${robotCX.toFixed(1)}" y="${(robotCY+robotRY*0.12+4).toFixed(1)}"
              text-anchor="middle" font-size="8" fill="#97C459"
              style="animation:vac-dot 1.8s ease-in-out infinite">⚡</text>` : ''}
        ` : ''}

        <!-- Right face -->
        <polygon points="${rightPts}" fill="#161618" stroke="rgba(255,255,255,0.07)" stroke-width="0.7"/>

        <!-- Front face base -->
        <polygon points="${frontPts}" fill="#1C1C1E" stroke="rgba(255,255,255,0.09)" stroke-width="0.7"/>
        ${errorOverlay}

        <!-- ── Upper: Dirty water tank (left) ── -->
        <polygon points="${leftTankPts}" fill="${dirtyCBg}" stroke="${dirtyCol}" stroke-width="0.8"
                 ${dirtyBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        <polygon points="${dirtyFillPts}" fill="${dirtyFillCol}" stroke="none"
                 ${dirtyBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        ${dropIcon(dirtyDropX, dirtyDropY, 3.5, dirtyCol)}

        <!-- ── Upper: Clean water tank (right) ── -->
        <polygon points="${rightTankPts}" fill="${cleanBg}" stroke="${cleanCol}" stroke-width="0.8"
                 ${cleanBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        <polygon points="${cleanFillPts}" fill="${cleanFillCol}" stroke="none"
                 ${cleanBoxProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        ${dropIcon(cleanDropX, cleanDropY, 3.5, cleanCol)}

        <!-- Tank divider -->
        <line x1="${tankDivLine[0][0].toFixed(1)}" y1="${tankDivLine[0][1].toFixed(1)}"
              x2="${tankDivLine[1][0].toFixed(1)}" y2="${tankDivLine[1][1].toFixed(1)}"
              stroke="rgba(255,255,255,0.12)" stroke-width="0.7"/>

        <!-- ── Lower: Fluid compartment (left) ── -->
        <polygon points="${fluidPts}" fill="${fluidBg}" stroke="${fluidCol}" stroke-width="0.8"
                 ${fluidProblem ? 'style="animation:vac-pulse-error 2s ease-in-out infinite"' : ''}/>
        <polygon points="${fluidFillPts}" fill="${fluidFillCol}" stroke="none"/>
        ${dropIcon(fluidDropX, fluidDropY, 2.5, fluidCol)}

        <!-- ── Lower: Mop band (right) ── -->
        <polygon points="${mopBayPts}" fill="${mopBayBg}" stroke="${mopBayCol}" stroke-width="0.7"/>
        ${activeAnim}

        <!-- ── Lower: Dock slot ── -->
        <polygon points="${dockSlotPts}" fill="rgba(255,255,255,0.01)"
                 stroke="rgba(255,255,255,0.05)" stroke-width="0.6" stroke-dasharray="2,2"/>

        <!-- ── Top face ── -->
        <polygon points="${topPts}" fill="#212123" stroke="rgba(255,255,255,0.09)" stroke-width="0.7"/>
        <polygon points="${topDirtyPts}" fill="${dirtyBoxProblem ? 'rgba(239,159,39,0.12)' : 'rgba(255,255,255,0.04)'}" stroke="none" opacity="0.9"/>
        <polygon points="${topCleanPts}" fill="${cleanBoxProblem ? 'rgba(239,159,39,0.12)' : 'rgba(255,255,255,0.04)'}" stroke="none" opacity="0.9"/>
        <line x1="${topDivLine[0][0].toFixed(1)}" y1="${topDivLine[0][1].toFixed(1)}"
              x2="${topDivLine[1][0].toFixed(1)}" y2="${topDivLine[1][1].toFixed(1)}"
              stroke="rgba(255,255,255,0.10)" stroke-width="0.7"/>
        <line x1="${tp(0,0)[0].toFixed(1)}" y1="${tp(0,0)[1].toFixed(1)}"
              x2="${tp(1,0)[0].toFixed(1)}" y2="${tp(1,0)[1].toFixed(1)}"
              stroke="rgba(255,255,255,0.16)" stroke-width="0.6"/>

        <!-- ── Platform (podest) — below dock body ── -->
        <polygon points="${platRightPts_s}" fill="#111113" stroke="rgba(255,255,255,0.06)" stroke-width="0.7"/>
        <polygon points="${platLeftPts_s}"  fill="#181819" stroke="rgba(255,255,255,0.08)" stroke-width="0.7"/>
        <polygon points="${platSlotPts_s}"  fill="rgba(8,8,10,0.75)"
                 stroke="rgba(255,255,255,0.05)" stroke-width="0.6"/>
      </svg>`;
  }

  _buildDockLegend(group) {
    const dirtyBoxProblem = this._isDockProblem('dirty_water_box');
    const cleanBoxProblem = this._isDockProblem('clean_water_box');
    const fluidProblem    = this._isDockProblem('cleaning_fluid');
    const dockMopDrying   = this._isDockRunning('mop_drying');
    const activeDrying    = group === 'mop_drying' || dockMopDrying;
    const mopAttached     = this._isBinaryOn('mop_attached');
    const mopDryingTimeSec = this._getDockSensorNum('mop_drying_time');
    const dockError       = this._getDockSensorState('dock_error');
    const hasDockError    = dockError && dockError !== 'ok' && dockError !== 'unknown';
    const vacError        = this._getSensorState('vacuum_error') || 'none';
    const hasVacError     = vacError !== 'none' && vacError !== 'unknown';
    const isMopWashing    = group === 'mop_washing';

    const okDot = (label) =>
      `<span title="${label}: ok" style="display:inline-block;width:6px;height:6px;border-radius:50%;
              background:rgba(151,196,89,0.28);flex-shrink:0;"></span>`;

    const problemChip = (label, value) =>
      `<div style="display:flex;align-items:center;gap:5px;padding:3px 7px;border-radius:7px;
                   background:rgba(226,75,74,0.10);border:1px solid rgba(226,75,74,0.20);">
         <span style="width:5px;height:5px;border-radius:50%;background:#E24B4A;flex-shrink:0;
                      animation:vac-dot 1.8s ease-in-out infinite;"></span>
         <span style="font-size:10px;color:rgba(255,255,255,0.50);">${label}</span>
         <span style="font-size:10px;font-weight:600;color:#E24B4A;margin-left:auto;">${value}</span>
       </div>`;

    const activeChip = (label, value, col) => {
      const rgb = col === '#C97A50' ? '201,122,80' : '123,174,212';
      return `<div style="display:flex;align-items:center;gap:5px;padding:3px 7px;border-radius:7px;
                     background:rgba(${rgb},0.10);border:1px solid rgba(${rgb},0.20);">
         <span style="width:5px;height:5px;border-radius:50%;background:${col};flex-shrink:0;
                      animation:vac-dot 1.8s ease-in-out infinite;"></span>
         <span style="font-size:10px;color:${col};font-weight:500;">${label}</span>
         ${value ? `<span style="font-size:10px;color:rgba(255,255,255,0.35);margin-left:2px;">${value}</span>` : ''}
       </div>`;
    };

    const dots = [];
    const chips = [];

    const items = [
      { label: 'Brudna woda', problem: dirtyBoxProblem, value: '⚠ pełna' },
      { label: 'Czysta woda', problem: cleanBoxProblem, value: '⚠ pusta' },
      { label: 'Płyn',        problem: fluidProblem,    value: '⚠ uzupełnij' },
    ];
    items.forEach(i => {
      if (i.problem) chips.push(problemChip(i.label, i.value));
      else dots.push(okDot(i.label));
    });

    if (mopAttached) dots.push(`<span title="Mop założony" style="display:inline-block;width:6px;height:6px;
      border-radius:50%;background:rgba(133,183,235,0.35);flex-shrink:0;"></span>`);

    if (activeDrying) {
      const m = mopDryingTimeSec && mopDryingTimeSec > 0 ? `~${Math.ceil(mopDryingTimeSec/60)} min` : '';
      chips.push(activeChip('suszy mop', m, '#C97A50'));
    }
    if (isMopWashing) chips.push(activeChip('myje mop', '', '#7BAED4'));

    if (hasDockError) {
      const DOCK_ERR = {
        duct_blockage:'Zatkany przewód', water_empty:'Brak wody',
        waste_water_tank_full:'Pełna brudna woda', maintenance_brush_jammed:'Szczotka zablok.',
        dirty_tank_latch_open:'Otwarty zatrzask', no_dustbin:'Brak pojemnika',
        cleaning_tank_full_or_blocked:'Zbiornik zablok.',
      };
      chips.push(problemChip('Dok', DOCK_ERR[dockError] || dockError));
    }
    if (hasVacError) {
      const lbl = ERROR_MAP[vacError] || vacError;
      chips.push(`<div style="display:flex;align-items:center;gap:5px;padding:3px 7px;border-radius:7px;
                   background:rgba(239,159,39,0.08);border:1px solid rgba(239,159,39,0.15);">
         <span style="width:5px;height:5px;border-radius:50%;background:#EF9F27;flex-shrink:0;"></span>
         <span style="font-size:10px;color:rgba(255,255,255,0.40);">Robot</span>
         <span style="font-size:10px;color:#EF9F27;margin-left:auto;">${lbl}</span>
       </div>`);
    }

    const dotsHtml = dots.length
      ? `<div style="display:flex;align-items:center;gap:4px;">${dots.join('')}</div>` : '';
    const chipsHtml = chips.length
      ? `<div style="display:flex;flex-direction:column;gap:4px;">${chips.join('')}</div>` : '';

    return `<div style="display:flex;flex-direction:column;gap:5px;">${dotsHtml}${chipsHtml}</div>`;
  }

  _buildConsumableIcons() {
    const ICONS = {
      filter_left:     `<path d="M3 4h18l-7 8.5v5.5l-4-2V12.5L3 4z"/>`,
      main_brush_left: `<rect x="2" y="9" width="20" height="5" rx="2.5"/>
                        <line x1="6"  y1="14" x2="5.5" y2="19"/>
                        <line x1="10" y1="14" x2="10"  y2="19"/>
                        <line x1="14" y1="14" x2="14"  y2="19"/>
                        <line x1="18" y1="14" x2="18.5" y2="19"/>`,
      side_brush_left: `<circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/>
                        <line x1="12" y1="9.5" x2="12" y2="4"/>
                        <line x1="10" y1="13.2" x2="4.8" y2="16.3"/>
                        <line x1="14" y1="13.2" x2="19.2" y2="16.3"/>`,
      sensor_left:     `<circle cx="12" cy="12" r="3"/>
                        <path d="M5 12a7 7 0 0 1 14 0" fill="none"/>
                        <path d="M8 12a4 4 0 0 1 8 0" fill="none"/>`,
      _dock_strainer:  `<rect x="3" y="3" width="18" height="18" rx="3" fill="none"/>
                        <line x1="3" y1="8"  x2="21" y2="8"/>
                        <line x1="3" y1="13" x2="21" y2="13"/>
                        <line x1="8"  y1="3" x2="8"  y2="21"/>
                        <line x1="13" y1="3" x2="13" y2="21"/>`,
    };

    const allConsumables = [
      ...CONSUMABLES,
      { key: '_dock_strainer', label: 'Filtr doku', maxHours: 150, warnAt: 30 },
    ];

    const totalArea  = this._getSensorNum('total_area');
    const totalTime  = this._getSensorNum('total_time');
    const totalCount = this._getSensorNum('total_count');

    const icons = allConsumables.map(c => {
      const hoursLeft = c.key === '_dock_strainer'
        ? this._getDockSensorNum('strainer_left')
        : this._getSensorNum(c.key);
      const pct    = hoursLeft !== null ? consumablePct(hoursLeft, c.maxHours) : null;
      const col    = pct !== null ? consumableColor(pct) : '#5F5E5A';
      const warn   = hoursLeft !== null && hoursLeft <= c.warnAt;
      const valStr = hoursLeft !== null ? `${fmtHours(hoursLeft)} · ${Math.round(pct??0)}%` : '—';
      const rgb    = col === '#97C459' ? '151,196,89' : col === '#EF9F27' ? '239,159,39' : '226,75,74';

      return `
        <div class="ci" style="background:rgba(${rgb},0.10);
                               border:1px solid rgba(${rgb},${warn?'0.35':'0.15'});">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="${col}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
               ${warn ? `style="filter:drop-shadow(0 0 4px ${col}88)"` : ''}>${ICONS[c.key]||''}</svg>
          ${warn ? `<span style="position:absolute;top:2px;right:2px;width:6px;height:6px;
                                 border-radius:50%;background:#E24B4A;border:1px solid #1C1C1E;"></span>` : ''}
          <div class="ct">
            <div class="ct-label">${c.label}</div>
            <div class="ct-bar-track"><div class="ct-bar-fill" style="width:${(pct??0).toFixed(1)}%;background:${col};"></div></div>
            <div class="ct-value" style="color:${col};">${valStr}</div>
          </div>
        </div>`;
    });

    const lifetimeParts = [];
    if (totalCount !== null) lifetimeParts.push(`${Math.round(totalCount)}×`);
    if (totalArea  !== null) lifetimeParts.push(fmtArea(parseFloat(totalArea)));
    if (totalTime  !== null) lifetimeParts.push(fmtTime(totalTime));
    const lifetime = lifetimeParts.length
      ? `<span style="font-size:10px;color:rgba(255,255,255,0.18);margin-left:auto;">${lifetimeParts.join(' · ')}</span>`
      : '';

    return `<div class="consumables">${icons.join('')}${lifetime}</div>`;
  }

  _renderConsumables() {
    const totalArea  = this._getSensorNum('total_area');
    const totalTime  = this._getSensorNum('total_time');
    const totalCount = this._getSensorNum('total_count');

    // SVG paths per consumable type
    const ICONS = {
      filter_left:     `<path d="M3 4h18l-7 8.5v5.5l-4-2V12.5L3 4z"/>`,
      main_brush_left: `<rect x="2" y="9" width="20" height="5" rx="2.5"/>
                        <line x1="6"  y1="14" x2="5.5" y2="19"/>
                        <line x1="10" y1="14" x2="10"  y2="19"/>
                        <line x1="14" y1="14" x2="14"  y2="19"/>
                        <line x1="18" y1="14" x2="18.5" y2="19"/>`,
      side_brush_left: `<circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/>
                        <line x1="12" y1="9.5" x2="12" y2="4"/>
                        <line x1="10" y1="13.2" x2="4.8" y2="16.3"/>
                        <line x1="14" y1="13.2" x2="19.2" y2="16.3"/>`,
      sensor_left:     `<circle cx="12" cy="12" r="3"/>
                        <path d="M5 12a7 7 0 0 1 14 0" fill="none"/>
                        <path d="M8 12a4 4 0 0 1 8 0" fill="none"/>`,
      _dock_strainer:  `<rect x="3" y="3" width="18" height="18" rx="3" fill="none"/>
                        <line x1="3" y1="8"  x2="21" y2="8"/>
                        <line x1="3" y1="13" x2="21" y2="13"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                        <line x1="8"  y1="3" x2="8"  y2="21"/>
                        <line x1="13" y1="3" x2="13" y2="21"/>`,
    };

    const allConsumables = [
      ...CONSUMABLES,
      { key: '_dock_strainer', label: 'Filtr doku', maxHours: 150, warnAt: 30 },
    ];

    const icons = allConsumables.map(c => {
      const hoursLeft = c.key === '_dock_strainer'
        ? this._getDockSensorNum('strainer_left')
        : this._getSensorNum(c.key);

      const pct     = hoursLeft !== null ? consumablePct(hoursLeft, c.maxHours) : null;
      const col     = pct !== null ? consumableColor(pct) : '#5F5E5A';
      const warn    = hoursLeft !== null && hoursLeft <= c.warnAt;
      const valStr  = hoursLeft !== null ? `${fmtHours(hoursLeft)} · ${Math.round(pct ?? 0)}%` : '—';
      const svgPath = ICONS[c.key] || '';

      const warnDot = warn
        ? `<span style="position:absolute;top:2px;right:2px;width:6px;height:6px;
                        border-radius:50%;background:#E24B4A;border:1px solid #1C1C1E;"></span>`
        : '';

      return `
        <div class="ci" style="background:rgba(${col==='#97C459'?'151,196,89':col==='#EF9F27'?'239,159,39':'226,75,74'},0.10);
                               border:1px solid rgba(${col==='#97C459'?'151,196,89':col==='#EF9F27'?'239,159,39':'226,75,74'},${warn?'0.35':'0.15'});">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="${col}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
               ${warn ? `style="filter:drop-shadow(0 0 4px ${col}88)"` : ''}>${svgPath}</svg>
          ${warnDot}
          <div class="ct">
            <div class="ct-label">${c.label}</div>
            <div class="ct-bar-track">
              <div class="ct-bar-fill" style="width:${(pct??0).toFixed(1)}%;background:${col};"></div>
            </div>
            <div class="ct-value" style="color:${col};">${valStr}</div>
          </div>
        </div>`;
    });

    // Lifetime stats — compact, right-aligned
    const lifetimeParts = [];
    if (totalCount !== null) lifetimeParts.push(`${Math.round(totalCount)}×`);
    if (totalArea  !== null) lifetimeParts.push(fmtArea(parseFloat(totalArea)));
    if (totalTime  !== null) lifetimeParts.push(fmtTime(totalTime));
    const lifetime = lifetimeParts.length
      ? `<span style="font-size:10px;color:rgba(255,255,255,0.18);margin-left:auto;">${lifetimeParts.join(' · ')}</span>`
      : '';

    return `<div class="consumables">${icons.join('')}${lifetime}</div>`;
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
