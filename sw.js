/* Offline support for the invitation. Pages: network first, saved copy when there is no signal.
   Pictures and fonts: saved copy first, refreshed in the background. RSVP submissions are never cached. */
const VERSION = 'v2';
const CORE = ['/groom/', '/bride/', '/qr.js',
  '/assets/door-closed.webp', '/assets/door-open.webp', '/assets/floral-corner_sm.webp', '/assets/ganesha_sm.webp', '/assets/lantern_sm.webp'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !FONT_HOSTS.includes(url.hostname)) return;   /* maps, the RSVP script and everything else go straight to the network */
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match(url.pathname.startsWith('/bride') ? '/bride/' : '/groom/'))));
    return;
  }
  const refresh = () => fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  });
  /* saved copy at once, quietly refreshed in the background so changed pictures reach guests on their next visit */
  e.respondWith(caches.match(req).then(hit => { if (hit) { refresh().catch(() => {}); return hit; } return refresh(); }));
});
