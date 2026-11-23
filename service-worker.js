const CACHE = 'sscc-v44';
const ASSETS = [
  '/',
  '/calculator',
  '/guide',
  '/docs',
  '/app.js?v=5.11.1',
  '/label.js?v=5.11.1',
  '/scanner.js?v=5.11.1',
  '/parser.js?v=5.11.1',
  '/init.js?v=5.11.1',
  '/llms.txt',
  '/llm.txt',
  '/openapi.json',
  '/openapi.yaml',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
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
