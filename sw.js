const CACHE = 'cipher-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.add('/')));
});

self.addEventListener('activate', e => {
  e.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))),
  ]));
});

// Network-first for the HTML page — always fetch fresh code from server,
// fall back to cache only when offline.
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          // Clone before returning — the body is single-use, and the page
          // starts consuming it as soon as we hand it back
          const copy = r.clone();
          e.waitUntil(caches.open(CACHE).then(c => c.put(e.request, copy)));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
