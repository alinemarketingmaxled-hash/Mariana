/* Service worker: deixa o app abrir offline depois da primeira visita. */
const CACHE = 'mesada-v3';
const ASSETS = [
  './', './index.html', './manifest.json',
  './assets/styles.css', './assets/icon.svg',
  './assets/fonts/archivo-latin.woff2', './assets/fonts/archivo-italic-latin.woff2',
  './assets/js/icons.js', './assets/js/photos.js', './assets/js/store.js', './assets/js/ui.js', './assets/js/screen-auth.js',
  './assets/js/screen-child.js', './assets/js/screen-parent.js', './assets/js/app.js',
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (ev) => {
  if (ev.request.method !== 'GET') return;
  ev.respondWith(
    fetch(ev.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(ev.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(ev.request).then((hit) => hit || caches.match('./index.html')))
  );
});
