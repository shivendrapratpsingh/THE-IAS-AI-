/* ═══════════════════════════════════════════════
   BASS 50 — Service Worker
   Caches static assets for fast load on mobile
   ═══════════════════════════════════════════════ */

const CACHE_NAME = 'bass50-v1';
const STATIC_ASSETS = [
  '/',
  '/static/css/style.css',
  '/static/js/main.js',
  '/static/manifest.json',
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png',
];

// ── Install: cache static assets ──────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).catch(() => {
      // Don't fail install if some assets missing
    })
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first, cache fallback ──────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always fetch from network for HTML pages and API calls
  if (event.request.method !== 'GET' ||
      url.pathname.startsWith('/assistant') ||
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/guest-login') ||
      url.pathname.startsWith('/mcq') ||
      url.pathname.startsWith('/current-affairs') ||
      url.pathname.startsWith('/admin') ||
      url.pathname.startsWith('/avatar/save') ||
      event.request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For static assets: cache-first
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
