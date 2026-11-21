/* AID Genesis - kept on the phone (founder 20 Nov 2026: "a download version ... just the audio, no Jed ... keep the fancy sphere with words
   coming down, the fancy play buttons, the 12 channels"). Once a reader keeps Genesis, the page, the narration, the words and the art open
   without internet. The page itself is fetched fresh whenever there is a connection, so fixes still arrive at once. */
const CACHE = "aid-genesis-v1";
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;   // Jedidiah (another address) is never kept or faked offline
  const page = u.pathname.endsWith("/") || u.pathname.endsWith(".html");
  if (page) {   // the page: newest when online, kept copy when not
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(u.pathname, c)); return r; })
      .catch(() => caches.match(u.pathname).then(r => r || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(u.pathname).then(hit => hit || fetch(e.request).then(r => {   // narration, words, art: kept copy first
    if (r.ok && !e.request.headers.get("range")) { const c = r.clone(); caches.open(CACHE).then(k => k.put(u.pathname, c)); }
    return r;
  })));
});
