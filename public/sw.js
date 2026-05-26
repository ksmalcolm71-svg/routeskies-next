// RouteSkies Service Worker
// Caches the app shell on install; serves cached content offline.
// Weather API responses are cached when the user saves a route offline.

const CACHE_VERSION = 'routeskies-v1'
const STATIC_SHELL = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// ── Install: precache the app shell ──────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_SHELL))
  )
  self.skipWaiting()
})

// ── Activate: delete old caches ──────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch: serve from cache, fall back to network ────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // API routes: network first, fall back to cache (for saved offline routes)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful weather responses so they survive offline
          if (response.ok && url.pathname === '/api/weather') {
            const clone = response.clone()
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // App shell: cache first, fall back to network then cache
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response
        }
        const clone = response.clone()
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone))
        return response
      })
    })
  )
})

// ── Message: cache a set of weather URLs for offline use ─────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_WEATHER_URLS') {
    const { urls } = event.data
    caches.open(CACHE_VERSION).then((cache) =>
      Promise.all(
        urls.map((url) =>
          fetch(url)
            .then((res) => res.ok && cache.put(url, res))
            .catch(() => {})
        )
      )
    )
  }
})
