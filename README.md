# awesome-ha

> Custom dashboard cards for Home Assistant — Apple Home aesthetic, dark mode, mobile-first.

A collection of hand-crafted Lovelace cards built with vanilla JS. No dependencies, no build step. Installs via HACS in one click.

---

## Installation

1. In HACS go to **Dashboard → Custom repositories**
2. Add `https://github.com/coyot/awesome-ha`, category: **Dashboard**
3. Install **Awesome HA Cards**
4. Hard-refresh the browser — all cards are ready, no manual resource setup needed

---

## Cards

All cards use the `aha-` prefix and register automatically in the card picker.

### `aha-action-apple-card`
Tappable button for triggering scripts, scenes, covers, lights or any HA service. Supports navigation, confirmation dialogs, compact mode, and conditional danger highlighting when an entity exceeds a threshold.

### `aha-entries-apple-card`
Timeline of recent gate/door entries. Reads `input_text` entities in `person|timestamp` format, groups simultaneous arrivals, and shows relative time labels ("3 min ago", "yesterday @ 08:25").

### `aha-garden-meters-card`
Dual water meter card with inline numeric editing. Displays current readings, stale-data warnings, and a confirm button that calls `input_number.set_value` + `input_button.press` in one tap.

### `aha-szambo-apple-card`
Septic tank monitor for two households. Shows fill level as a 3D isometric tank with layered liquids (sewage + garden water per house), warning thresholds, and optional cost breakdown.

### `aha-szambo-predict-card`
Predicts days until the septic tank needs emptying based on current fill level and daily usage rate. Shows a countdown, target date, and a progress bar from last emptying to full capacity.

### `aha-szambo-finance-card`
Cost split between two households for septic emptying. Displays a donut chart and per-house amounts based on actual water consumption ratio.

### `aha-waste-schedule-apple-card`
Waste pickup schedule with an optional 2-week mini calendar and an upcoming list. Urgency color-coding: red (today/tomorrow), orange (this week), blue (next week), green (later). Supports multiple waste types with custom icons and colors.

### `aha-astronomical-events-card`
Paginated calendar of upcoming astronomical events — solar/lunar eclipses, meteor showers, planetary conjunctions. Pre-loaded with events through 2031, filterable by type.

### `aha-climate-apple-card`
Compact climate tile showing temperature, humidity, and HVAC state for a room. Icon reflects the area type (bedroom, living room, office, etc.).

### `aha-solar-clock-card`
Analog clock with a sun arc showing today's sunrise, solar noon, and sunset. Displays current planetary positions and a date label with Polish month names.

### `aha-teleco-card`
Telecom service status card — shows signal strength, data usage, or any numeric sensor in a compact tile with status color coding.

---

## Design

- Dark mode optimized
- Mobile-first layouts
- Apple Home / iOS aesthetic
- SF Pro typography, glass morphism, smooth animations
- No external dependencies — pure vanilla JS

---

## Requirements

- Home Assistant `2024.4.0+`
- HACS
