const CACHE = 'cipher-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.add('/')));
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

// Network-first for the HTML page — always fetch fresh code from server,
// fall back to cache only when offline.
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          caches.open(CACHE).then(c => c.put(e.request, r.clone()));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
