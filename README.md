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

### Temperature & Humidity

#### `aha-temp-gauge-card`
Dual-arc gauge for temperature (outer arc) and humidity (inner arc). State-driven backgrounds and animations: frost, cold, comfort, warm, fire. Room icons (salon, bedroom, office, bathroom, pergola, garden, garage). Hover focus mode — hovered arc brightens, opposite dims, tooltip shows exact value and zone label.

#### `aha-temp-humidity-card`
Square tile for a temperature + humidity sensor pair. State-driven color scheme matching `aha-temp-gauge-card`. Supports room type icons, battery level indicator, and optional party mode entity.

#### `aha-temp-slim-card`
Compact single-row card for a temperature sensor. 4px color bar, state badge, and current value. Designed to pair with `aha-temp-humidity-card` in the same grid column.

---

### Lawn Mower

#### `aha-kosiarka-card`
Full-size tile for a `lawn_mower` entity (Worx Landroid and compatible). Shows mowing state with animated SVG, battery level, daily progress arc, party mode, rain delay, and blade runtime warning. Pulsing border when active.

#### `aha-kosiarka-slim-card`
Compact row card for a lawn mower — 4px color bar, state badge, chips (zone, party, rain, blade warning), progress bar (daily or battery), and a stats row showing blade age, next scheduled run, and battery. Mirrors the style of `vacuum.yaml`.

---

### Home Controls

#### `aha-action-apple-card`
Tappable button for triggering scripts, scenes, covers, lights or any HA service. Supports navigation, confirmation dialogs, compact mode, and conditional danger highlighting when an entity exceeds a threshold.

#### `aha-climate-apple-card`
Compact climate tile showing temperature, humidity, and HVAC state for a room. Icon reflects the area type (bedroom, living room, office, etc.).

#### `aha-kontaktron-card`
Square tile for a door/window contact sensor (`binary_sensor`). Shows open/closed state, elapsed time since opening, and optional battery level. Triggers a red pulsing alarm after a configurable number of minutes open (`alarm_after`, default 10).

#### `aha-teleco-card`
Telecom service status card — shows signal strength, data usage, or any numeric sensor in a compact tile with status color coding.

#### `aha-teleco-card-slim`
Slim row variant of the teleco card for controlling tilt covers (blinds). Animated tilt angle dial, open/close/stop controls, current position display.

---

### Household & Utilities

#### `aha-entries-apple-card`
Timeline of recent gate/door entries. Reads `input_text` entities in `person|timestamp` format, groups simultaneous arrivals, and shows relative time labels ("3 min ago", "yesterday @ 08:25").

#### `aha-garden-meters-card`
Dual water meter card with inline numeric editing. Displays current readings, stale-data warnings, and a confirm button that calls `input_number.set_value` + `input_button.press` in one tap.

#### `aha-szambo-apple-card`
Septic tank monitor for two households. Shows fill level as a 3D isometric tank with layered liquids (sewage + garden water per house), warning thresholds, and optional cost breakdown.

#### `aha-szambo-predict-card`
Predicts days until the septic tank needs emptying based on current fill level and daily usage rate. Shows a countdown, target date, and a progress bar from last emptying to full capacity.

#### `aha-szambo-finance-card`
Cost split between two households for septic emptying. Displays a donut chart and per-house amounts based on actual water consumption ratio.

#### `aha-waste-schedule-apple-card`
Waste pickup schedule with an optional 2-week mini calendar and an upcoming list. Urgency color-coding: red (today/tomorrow), orange (this week), blue (next week), green (later). Supports multiple waste types with custom icons and colors.

---

### Other

#### `aha-astronomical-events-card`
Paginated calendar of upcoming astronomical events — solar/lunar eclipses, meteor showers, planetary conjunctions. Pre-loaded with events through 2031, filterable by type.

#### `aha-solar-clock-card`
Analog clock with a sun arc showing today's sunrise, solar noon, and sunset. Displays current planetary positions and a date label with Polish month names.

---

## Design system

Every device card exists in two variants:

| Variant | Suffix | Layout |
|---|---|---|
| Full tile | `*-card` | Square-ish, centered icon, state-driven background + border |
| Compact row | `*-slim-card` | `4px color-bar \| body (name + badge + chips + bar) \| metric` |

Common rules across all cards:
- Background `#1C1C1E`, border-radius `16px` (slim) / `20px` (full)
- Font `-apple-system, system-ui, sans-serif`
- Active states: pulsing `box-shadow` at 2–3.5s ease-in-out
- Tap: `scale(0.96–0.97)` on `:active`
- Transitions: `0.4s ease` for color/background, `0.15s ease` for transform

---

## Requirements

- Home Assistant `2024.4.0+`
- HACS
