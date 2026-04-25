const CACHE = 'zafer-v2'
const STATIC = ['/manifest.json', '/logo.svg', '/icon-192.png']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ))
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)

  // Toujours réseau pour les pages HTML et les API (jamais de cache stale)
  if (e.request.mode === 'navigate') return
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) return

  // Cache-first uniquement pour les assets statiques (images, icônes, manifeste)
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  )
})
