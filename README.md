# 🏠 awesome-ha

> Home Assistant yamls, ideas, cards, everything.

A curated collection of my **Home Assistant experiments, UI ideas, YAML configs, and custom Lovelace setups**.

This repo is a **playground + knowledge base** where I store:
- reusable configs
- UI concepts (Apple Home style 👀)
- custom cards
- automations
- random ideas that actually worked

---

## ✨ What you'll find here

### 🎛️ Lovelace UI
- Apple Home–inspired dashboards
- `custom:button-card` setups
- layout experiments
- mobile-first designs

### ⚙️ YAML Configurations
- reusable snippets
- templating patterns
- helpers & tricks

### 🤖 Automations
- practical automations
- experiments with logic & triggers
- ideas worth reusing

### 📊 Visualizations
- charts (`apexcharts-card`)
- state visualizations
- compact info panels

---

## 🎯 Philosophy

- **Minimalism > clutter**
- **UX matters more than features**
- **Consistency is everything**
- **If it doesn’t feel like Apple, it’s not finished yet**

---

## 🧱 Tech Stack

- Home Assistant `2024.4.0+`
- HACS
- `custom:button-card`
- `card-mod`
- `layout-card`
- `apexcharts-card`
- more coming...

---

## 🌙 Design Approach

Most setups here are:
- optimized for **dark mode**
- focused on **mobile usability**
- inspired by:
  - Apple Home
  - iOS Control Center
  - iOS widgets

---

## 📦 Installation via HACS

1. In HACS go to **Frontend → Custom repositories**
2. Add this repo URL, category: **Lovelace**
3. Install **Awesome HA Cards**
4. Add each card as a Lovelace resource (`/hacsfiles/awesome-ha/dist/<filename>.js`)

Or add resources manually in **Settings → Dashboards → Resources**:

| File | Resource URL |
|------|-------------|
| `aha-action-apple-card.js` | `/hacsfiles/awesome-ha/dist/action-apple-card.js` |
| `aha-entries-apple-card.js` | `/hacsfiles/awesome-ha/dist/entries-apple-card.js` |
| `aha-garden-meters-card.js` | `/hacsfiles/awesome-ha/dist/garden-meters-card.js` |
| `aha-szambo-apple-card.js` | `/hacsfiles/awesome-ha/dist/szambo-apple-card.js` |
| `aha-szambo-predict-card.js` | `/hacsfiles/awesome-ha/dist/szambo-predict-card.js` |
| `aha-waste-schedule-apple-card.js` | `/hacsfiles/awesome-ha/dist/waste-schedule-apple-card.js` |

## 🃏 Custom Cards

All cards use the `aha-` prefix.

| Card type | Description |
|-----------|-------------|
| `custom:aha-action-apple-card` | Action & navigation button with glass morphism |
| `custom:aha-entries-apple-card` | Timeline of recent entries/visits |
| `custom:aha-garden-meters-card` | Garden water meter with inline editing |
| `custom:aha-szambo-apple-card` | Septic tank monitor with 3D isometric visualization |
| `custom:aha-szambo-predict-card` | Septic tank emptying prediction & countdown |
| `custom:aha-waste-schedule-apple-card` | Waste pickup schedule with calendar view |

---

## 📂 Structure (WIP)

```bash
awesome-ha/
├── dist/          # HACS-served custom cards (aha-*)
├── custom/        # Card source files
├── dashboards/
├── cards/
├── templates/
├── automations/
├── ideas/
└── misc/