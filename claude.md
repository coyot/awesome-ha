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

## Releasing

When publishing a new version:
1. Rebuild the bundle: `cat dist/aha-shared.js dist/action-apple-card.js dist/entries-apple-card.js dist/garden-meters-card.js dist/szambo-apple-card.js dist/szambo-predict-card.js dist/szambo-finance-card.js dist/waste-schedule-apple-card.js dist/astronomical-events-card.js dist/climate-apple-card.js dist/solar-clock-card.js dist/teleco-card.js > awesome-ha.js`
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