/**
 * kosiarka-slim-card.js
 * Alias dla aha-kosiarka-card (zdefiniowanej w kosiarka-card.js).
 * Domyślny tryb to slim — taki sam jak aha-kosiarka-card.
 */
if (!customElements.get('aha-kosiarka-slim-card'))
  customElements.define('aha-kosiarka-slim-card', class extends KosiarkaCard {});
if (!customElements.get('kosiarka-slim-card'))
  customElements.define('kosiarka-slim-card', class extends KosiarkaCard {});

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'aha-kosiarka-slim-card',
  name:        'Kosiarka Slim Card',
  description: 'Kompaktowy alias aha-kosiarka-card — slim mode domyślnie',
  preview:     true,
});
