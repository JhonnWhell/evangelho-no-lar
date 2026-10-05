/* =====================================================================
   sw.js — Evangelho no Lar (app de condução) · service worker
   Guarda só código, fonte e ícones para abrir sem internet.
   Dados e textos dos livros NÃO passam por aqui.

   Convivência com o Fitilho na mesma origem (ESPECIFICACAO 3.5):
   - todo cache deste app começa com "enl-";
   - só apaga caches "enl-" antigos; nunca toca em "fitilho-";
   - só responde com o que está no próprio cache.

   Ao publicar qualquer mudança, aumente VERSAO.
   ===================================================================== */
var PREFIXO = 'enl-';
var VERSAO = PREFIXO + 'v0.1.0';

var ARQUIVOS = [
  './',
  'index.html',
  'style.css',
  'parser.js',
  'app.js',
  'manifest.webmanifest',
  'icons/icone-192.png',
  'icons/icone-512.png',
  'icons/icone-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
  'fonts/atkinson-hyperlegible-latin-400-normal.woff2',
  'fonts/atkinson-hyperlegible-latin-400-italic.woff2',
  'fonts/atkinson-hyperlegible-latin-700-normal.woff2',
  'fonts/atkinson-hyperlegible-latin-700-italic.woff2',
  'fonts/atkinson-hyperlegible-latin-ext-400-normal.woff2',
  'fonts/atkinson-hyperlegible-latin-ext-400-italic.woff2',
  'fonts/atkinson-hyperlegible-latin-ext-700-normal.woff2',
  'fonts/atkinson-hyperlegible-latin-ext-700-italic.woff2'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSAO).then(function (c) {
      return c.addAll(ARQUIVOS.map(function (u) { return new Request(u, { cache: 'reload' }); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(nomes
        .filter(function (n) { return n.indexOf(PREFIXO) === 0 && n !== VERSAO; })
        .map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  // Só arquivos deste app; Apps Script e qualquer outra origem vão direto à rede
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf(new URL(self.registration.scope).pathname) !== 0) return;

  e.respondWith(
    caches.open(VERSAO).then(function (c) {
      var alvo = req.mode === 'navigate' ? 'index.html' : req;
      return c.match(alvo, { ignoreSearch: true }).then(function (r) {
        return r || fetch(req);
      });
    }).catch(function () { return fetch(req); })
  );
});
