export default function manifest() {
  return {
    name: 'Zion Transport System: Explorer\'s Encyclopedia',
    short_name: 'ZTS Explorer',
    description: 'Explore how the world moves. Daily challenges, puzzles and expeditions.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#102A43',
    theme_color: '#102A43',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
