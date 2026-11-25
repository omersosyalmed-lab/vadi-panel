/* Uygulama dosyalarını önbelleğe alır: internet olmasa da açılır.
   Her açılışta önce internetten EN YENİ sürüm alınır (hiçbir ara önbellek kullanılmaz). */
const CACHE = 'vadi-v5';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache:'reload'}))))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // Sayfa açılışlarında adres sonuna zaman damgası eklenir: GitHub/telefon ara önbellekleri atlanır
  const isPage = e.request.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html');
  const key = (u.pathname.endsWith('/') || u.pathname.endsWith('/index.html')) ? './index.html' : e.request;
  const net = isPage ? new Request(u.pathname + '?_=' + Date.now(), {cache:'no-store'}) : new Request(e.request, {cache:'no-store'});
  e.respondWith(fetch(net).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(key, c)); } return r; })
    .catch(() => caches.match(key).then(r => r || caches.match('./index.html'))));
});
