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

1. In HACS go to **Dashboard → Custom repositories**
2. Add this repo URL, category: **Dashboard**
3. Install **Awesome HA Cards**
4. Reload the browser — cards are ready to use immediately, no manual resource setup needed

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