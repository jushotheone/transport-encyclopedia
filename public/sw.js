// Minimal service worker: makes the site installable and shows a friendly page if the network is down.
// It does not cache the app itself, so new versions always arrive straight away.
const OFFLINE = 'zts-offline-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(OFFLINE).then((cache) => cache.add('/offline.html')).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/offline.html')))
  }
})
