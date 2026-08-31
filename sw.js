/* Service worker: deixa o app abrir offline depois da primeira visita. */
const CACHE = 'mesada-v30';
const ASSETS = [
  './', './index.html', './manifest.json',
  './assets/styles.css', './assets/icon.svg',
  './assets/fonts/archivo-latin.woff2', './assets/fonts/archivo-italic-latin.woff2',
  './assets/js/icons.js', './assets/js/photos.js', './assets/js/effects.js', './assets/js/store.js', './assets/js/ui.js', './assets/js/agenda.js', './assets/js/pet.js', './assets/js/bank.js', './assets/js/quiz.js', './assets/js/usage.js', './assets/js/dash.js', './assets/js/notify.js', './assets/js/sync.js', './assets/js/wordbank.js', './assets/js/wordgames.js', './assets/js/games.js', './assets/js/screen-auth.js',
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

/* ---------- lembrete diário ----------
   O navegador acorda o service worker de vez em quando (só no Android,
   com o app instalado na tela de início). Quando isso acontece, o
   lembrete do dia aparece. Nos outros aparelhos o aviso sai quando ela
   abre o app, e o lembrete do calendário cobre o resto. */

/** lê o que o app guardou, sem depender do Store */
async function lembreteDoDia() {
  const clientes = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  // com o app aberto quem avisa é a própria tela, para não sair em dobro
  if (clientes.length) return null;
  return {
    titulo: 'Minha Mesada',
    texto: 'Seu bichinho está esperando: marque as tarefas e faça a leitura de hoje.',
  };
}

self.addEventListener('periodicsync', (ev) => {
  if (ev.tag !== 'lembrete-mesada') return;
  ev.waitUntil((async () => {
    const l = await lembreteDoDia();
    if (!l) return;
    await self.registration.showNotification(l.titulo, {
      body: l.texto,
      icon: './assets/icon.svg',
      badge: './assets/icon.svg',
      tag: 'mesada-lembrete',
      lang: 'pt-BR',
      data: { url: './' },
    });
  })());
});

self.addEventListener('notificationclick', (ev) => {
  ev.notification.close();
  const destino = (ev.notification.data && ev.notification.data.url) || './';
  ev.waitUntil((async () => {
    const clientes = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of clientes) {
      if ('focus' in c) return c.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow(destino);
    return undefined;
  })());
});
