/* Duty Log offline helper V1.8.2 */
const CACHE = 'dutylog-V1.8.2';
const CORE = ['./', 'index.html', 'manifest.json', 'favicon.png', 'apple-touch-icon.png', 'icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => null)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('dutylog-') === 0 && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
function timeout(ms) { return new Promise((_, no) => setTimeout(() => no(new Error('slow')), ms)); }
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.hostname.indexOf('google') >= 0) return;               // the Duty Log server: never from the cache
  const page = r.mode === 'navigate' || (u.origin === self.location.origin && (u.pathname.slice(-1) === '/' || u.pathname.slice(-11) === '/index.html'));
  if (page) {
    e.respondWith(Promise.race([fetch(r), timeout(6000)]).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put('index.html', c)); return res; })
      .catch(() => caches.match('index.html').then(x => x || caches.match('./'))));
    return;
  }
  if (u.origin === self.location.origin || ['cdnjs.cloudflare.com', 'unpkg.com', 'cdn.jsdelivr.net'].indexOf(u.hostname) >= 0) {
    e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); } return res; })));
  }
});
