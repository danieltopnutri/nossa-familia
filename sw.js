/* Service worker do Nossa Família.
   Guarda a "casca" do app (página, ícones, manifesto) para abrir instantaneamente e funcionar
   como aplicativo instalado. Os dados vêm sempre da rede (Apps Script) — nunca do cache. */
const VERSAO = 'nf-v1';
const CASCA = ['./', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './maskable-192.png', './maskable-512.png',
  './apple-touch-icon.png', './favicon-64.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(CASCA); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSAO; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  const url = new URL(e.request.url);
  // Dados e fontes: direto da rede.
  if (url.origin !== self.location.origin || e.request.method !== 'GET') return;
  // Casca: rede primeiro (para pegar atualizações), cache se estiver sem internet.
  e.respondWith(
    fetch(e.request).then(function (r) {
      const copia = r.clone();
      caches.open(VERSAO).then(function (c) { c.put(e.request, copia); });
      return r;
    }).catch(function () { return caches.match(e.request, { ignoreSearch: true }); })
  );
});
