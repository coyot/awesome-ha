You are working on a Home Assistant Lovelace custom card library.
There are two existing JS cards:

1. `kontaktron-card.js` — binary sensor (open/closed contact sensor)
2. `temp-humidity-card.js` — temperature + humidity sensor card (Pergola style)

Both cards are used side-by-side in a grid and must feel like one design system.

## Current inconsistencies to fix:

### 1. Name typography
- Both cards: name (e.g. "Pergola", "Garaż") must use identical style:
  font-size: 13px, font-weight: 500, color: #a1a1a6
  — treat it as a secondary label ABOVE the primary value, not a headline

### 2. Primary value hierarchy  
- kontaktron: state text ("zamknięte") should be the large primary element, 
  font-size: 22px, font-weight: 600, matching how "17.4°" dominates on temp card
- Both cards: primary value color follows state (green/yellow/red)

### 3. Secondary info line
- Both cards: bottom info line ("od 12 min", "28%") must use identical style:
  font-size: 11px, font-weight: 400, color: #636366
- Remove the outlined KOMFORT button — replace with plain state text using 
  same pattern as kontaktron's duration line

### 4. Icon treatment
- Both cards: top-right corner = battery icon (if available), same size and style
- Both cards: main icon uses the same "rounded square badge" style:
  width: 36px, height: 36px, border-radius: 10px
  background: rgba(COLOR, 0.18) where COLOR matches current state accent
- Icon size inside badge: 20px

### 5. Spacing and padding
- Both cards: padding: 14px, aspect-ratio: 1/1, border-radius: 18px
- Grid layout: icon-badge top-left, battery top-right, 
  primary value middle, secondary info bottom

### 6. State color system — use these exact values in BOTH cards:
- Closed / OK / Comfort: #30d158 (green)
- Open / Warning:        #ffd60a (yellow)  
- Alarm / Error:         #ff453a (red)
- Neutral / secondary:   #636366 (gray)

### 7. Card backgrounds per state:
- OK state:    background: #1c1c1e, border: 1px solid rgba(255,255,255,0.06)
- Warning:     background: #252510, border: 1px solid rgba(255,214,10,0.15)
- Alarm:       background: #2c1410, border: 1px solid rgba(255,69,58,0.30)
  + animation: alarm-pulse 1.5s ease-in-out infinite (defined in kontaktron-card.js)

## Constraints:
- Do NOT change the alarm animation logic in kontaktron-card.js
- Do NOT change entity binding or config options
- Only touch visual/styling code
- Keep shadow DOM, keep `customElements.define`
- After changes, both cards must be visually indistinguishable 
  in terms of layout rhythm, spacing, and typography — 
  only the content (icon, value, state text) differs