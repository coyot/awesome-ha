# 🏠 awesome-ha Project Summary

## Overview
A curated collection of **Home Assistant experiments, UI ideas, and automation solutions** designed for mobile-first usability with Apple Home-inspired aesthetics. Acts as both a playground and knowledge base for reusable configurations, dashboard designs, and smart home logic.

## Project Structure
```
awesome-ha/
├── dashboards/        # Dashboard YAMLs with layout experiments
├── cards/             # Custom button-card setups & logic
├── templates/         # Reusable template patterns
├── automations/       # Practical automations & logic experiments
├── ideas/             # Reusable automation ideas
└── misc/              # Utility/config files
```

## Core Philosophy
- **Design Principles**
  - Dark mode optimization
  - Mobile-first UX
  - Apple Home Control inspiration (iOS-like layouts)
  - Minimalism over complexity

- **Development Approach**
  - Collection of reusable components
  - Prototyping environment for smart home ideas
  - Focus on clean, maintainable configurations

## Technology Stack
- **Core**: Home Assistant (v2024.4.0+)
- **Plugins**:
  - HACS (Automation Library)
  - custom:button-card
  - card-mod
  - layout-card
  - apexcharts-card

## Key Features
- 🎮 Mobile-optimized dashboards
- 💡 Reusable automation snippets
- 📊 Visualization experiments
- ⚙️ Device state management
- 🧠 Smart home logic experiments

## Card Design System

Every device card exists in two variants — always develop/fix both in the same style:

### Compact (slim) card — `*-slim-card.js` or `cards/*.yaml` (button-card)
Reference implementations: `cards/vacuum.yaml`, `cards/ac.yaml`

Layout: `4px color-bar | body (name + badge + chips + progress bar) | right metric`
- Background: `#1C1C1E`, border-radius: `16px`, padding: `14px 16px`
- Border: `0.5px solid rgba(255,255,255,0.08)` idle; colored + pulsing `box-shadow` when active
- Active pulse animation: `0 0 0 5px rgba(R,G,B,0.18)` at 50%, named `*-pulse-*`
- Badge: inline-flex pill with animated dot (blink) when active, static dot when idle
- Chips: `border-radius: 6px`, font-size `11px`, muted bg tint matching accent color
- Progress bar: `3px` height, `border-radius: 99px`, gradient fill, label + % below
- Right column: large value (`20px 600`) + muted label (`10px`)
- Accent colors: mowing/cleaning `#97C459`, returning `#85B7EB`, heating `#EF9F27`, cooling `#85B7EB`, error `#E24B4A`, idle `#5F5E5A`

### Full card — `*-card.js`
Reference implementations: `dist/temp-gauge-card.js`, `dist/kontaktron-card.js`, `dist/kosiarka-card.js`

Layout: `flex column`, padding `10px 10px 8px`, aspect-ratio `1/1` or auto height
- Background: `#1c1c1e` base, state-driven darker tints
- Border: `1px solid` with state-driven color + opacity
- Extreme states (frost/fire/alarm): pulsing `box-shadow` outset animation
- State label: absolute, lightweight (not pill), uppercase, top-center — does NOT shift content
- Icon: centered in available space, SVG preferred
- Name: bottom, `12px 600`, `rgba(255,255,255,0.65)`, `font-family: -apple-system`
- Always register as `aha-*-card` primary + legacy alias without prefix

### General rules
- Always use `font-family: -apple-system, system-ui, sans-serif`
- Transitions: `0.4s ease` for color/background, `0.15s ease` for transform
- Tap: `scale(0.96–0.97)` on `:active`
- Never use pills that overlap/obscure other content — use absolute positioning with enough offset or inline labels
- **Active device states MUST have a pulsing box-shadow animation**: any state where the device is doing work (mowing, cleaning, returning, heating, cooling, charging-active) must animate with `box-shadow: 0 0 0 Npx rgba(R,G,B,0.18)` at 50% keyframe. Named `*-pulse-*`, duration 2.0–3.5s ease-in-out infinite. This applies to BOTH slim and full card variants.
- Optional: dedicated sensor entities (`battery_entity`, `error_entity`, `party_mode_entity`) should always be supported as config options with fallback to entity attributes

## Releasing

When publishing a new version:
1. Rebuild the bundle: `cat dist/aha-shared.js dist/action-apple-card.js dist/entries-apple-card.js dist/garden-meters-card.js dist/szambo-apple-card.js dist/szambo-predict-card.js dist/szambo-finance-card.js dist/waste-schedule-apple-card.js dist/astronomical-events-card.js dist/climate-apple-card.js dist/solar-clock-card.js dist/teleco-card.js dist/aha-teleco-slim-card.js dist/temp-humidity-card.js dist/temp-slim-card.js dist/temp-gauge-card.js dist/kontaktron-card.js dist/kosiarka-card.js dist/kosiarka-slim-card.js > awesome-ha.js`
2. Commit and tag: `git tag vX.Y.Z && git push origin main --tags`
3. **Always create a GitHub Release** (not just a git tag) using `gh release create`:
   ```
   gh release create vX.Y.Z --title "vX.Y.Z — short description" --notes "..."
   ```
   HACS reads "What's New" from GitHub Releases — a bare tag shows nothing to the user in HA.

## Contribution Guidelines
1. Add new features under relevant directory structure
2. Maintain Apple-inspired design consistency
3. Prioritize automation reliability
4. Document all new components

## Recent Activity
- Added waste schedule card (commit: 323700b)
- Implemented custom control for waste management (commit: ef7873b)
- Added customs functionality (commit: cd63336)
- Implemented UV control (commit: 24b1eac)
- Enhanced card implementations (commit: be3aeaf)