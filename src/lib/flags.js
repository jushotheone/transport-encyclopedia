// Typing a country fills in its flag, so there is one less thing to look up.
const flags = {
  'united kingdom': '🇬🇧', uk: '🇬🇧', england: '🇬🇧', scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'united states': '🇺🇸', usa: '🇺🇸', america: '🇺🇸',
  kenya: '🇰🇪', chile: '🇨🇱', sweden: '🇸🇪', norway: '🇳🇴', denmark: '🇩🇰', finland: '🇫🇮', germany: '🇩🇪', france: '🇫🇷',
  italy: '🇮🇹', spain: '🇪🇸', portugal: '🇵🇹', netherlands: '🇳🇱', belgium: '🇧🇪', switzerland: '🇨🇭', austria: '🇦🇹',
  poland: '🇵🇱', ireland: '🇮🇪', russia: '🇷🇺', ukraine: '🇺🇦', turkey: '🇹🇷', greece: '🇬🇷', china: '🇨🇳', japan: '🇯🇵',
  'south korea': '🇰🇷', india: '🇮🇳', australia: '🇦🇺', 'new zealand': '🇳🇿', canada: '🇨🇦', mexico: '🇲🇽', brazil: '🇧🇷',
  argentina: '🇦🇷', peru: '🇵🇪', colombia: '🇨🇴', egypt: '🇪🇬', nigeria: '🇳🇬', ghana: '🇬🇭', 'south africa': '🇿🇦',
  ethiopia: '🇪🇹', tanzania: '🇹🇿', uganda: '🇺🇬', morocco: '🇲🇦', 'saudi arabia': '🇸🇦', uae: '🇦🇪', 'united arab emirates': '🇦🇪',
  singapore: '🇸🇬', thailand: '🇹🇭', indonesia: '🇮🇩', vietnam: '🇻🇳', pakistan: '🇵🇰',
}

export const flagFor = (country) => flags[(country || '').trim().toLowerCase()] || ''
