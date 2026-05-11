const CACHE = 'sscc-v5';
const ASSETS = [
  '/sscc-check/',
  '/sscc-check/index.html',
  '/sscc-check/guide.html',
  '/sscc-check/sscc-api-guide.html',
  '/sscc-check/app.js',
  '/sscc-check/parser.js',
  '/sscc-check/scanner.js',
  '/sscc-check/manifest.json',
  '/sscc-check/icon-192.png',
  '/sscc-check/icon-512.png',
  '/sscc-check/og-image.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
  'https://unpkg.com/@zxing/library@0.18.6/umd/index.min.js',
  'https://unpkg.com/lucide@0.453.0/dist/umd/lucide.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (!res || res.status !== 200 || res.type === 'opaque') return res;
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});
