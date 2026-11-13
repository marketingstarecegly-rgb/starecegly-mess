// Service worker: aplikacja działa offline (formularz), API zawsze z sieci.
const CACHE = 'sc-targi-v2';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg', '/icon-512.png', '/logo.png', '/bricks.jpg',
  '/vendor/xlsx.mini.min.js', '/vendor/jspdf.umd.min.js', '/vendor/jspdf.plugin.autotable.min.js',
  '/vendor/Inter-Regular.ttf', '/vendor/Inter-Bold.ttf', '/vendor/qrcode.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.pathname.startsWith('/api/')) return;

  // Strona: najpierw sieć (świeża wersja), w razie braku – cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('/index.html', copy)); return r; })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Fonty i statyki: cache, w tle odświeżenie
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(r => {
        if (r && (r.ok || r.type === 'opaque')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return r;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
