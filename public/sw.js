const CACHE_NAME = 'control-v5'; // ← incrementado

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ✅ Dejar pasar TODO lo que no sea GET o sea IP local
  if (
    event.request.method !== 'GET' ||
    url.hostname.startsWith('192.168.') ||
    url.hostname.startsWith('10.') ||
    url.hostname.startsWith('172.')
  ) {
    // No llamar event.respondWith() — el navegador maneja la petición directamente
    return;
  }

  // Solo para GET de recursos propios de la app
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});