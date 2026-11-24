/* AID Genesis - kept on the phone (founder 20 Nov 2026: "a download version ... just the audio, no Jed ... keep the fancy sphere with words
   coming down, the fancy play buttons, the 12 channels"). Once a reader keeps Genesis, the page, the narration, the words and the art open
   without internet. The page itself is fetched fresh whenever there is a connection, so fixes still arrive at once. */
const CACHE = "aid-genesis-v1";
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;   // Jedidiah (another address) is never kept or faked offline
  /* ALWAYS THE NEWEST WORDS (founder 24 Nov 2026: in chapter 49 he saw no words - a kept chapter list from before they existed was served
     forever). The chapter list and the words (.json) now come like the page: newest when online, the kept copy only when offline. Narration
     and art stay kept-first, but only while the kept copy is the version the chapter list names (?v=...); a corrected recording replaces
     the old one the next time there is a connection. */
  const page = u.pathname.endsWith("/") || u.pathname.endsWith(".html") || u.pathname.endsWith(".json");
  const v = u.searchParams.get("v");
  if (page) {   // the page: newest when online, kept copy when not
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(u.pathname, c)); return r; })
      .catch(() => caches.match(u.pathname).then(r => r || caches.match("./"))));
    return;
  }
  e.respondWith(Promise.all([caches.match(u.pathname), caches.match("/__v" + u.pathname)]).then(([hit, ver]) =>
    (ver ? ver.text() : Promise.resolve("")).then(kept => {
      const fresh = () => fetch(e.request).then(r => {   /* narration, art: kept copy first, while it is the version asked for */
        if (r.ok && !e.request.headers.get("range")) { const c = r.clone(); caches.open(CACHE).then(k => { k.put(u.pathname, c); k.put("/__v" + u.pathname, new Response(v || "")); }); }
        return r;
      });
      if (hit && (!v || kept === v)) return hit;
      return hit ? fresh().catch(() => hit) : fresh();
    })));
});

self.addEventListener("notificationclick", e => {   // tapping the 'Genesis is in your phone' notification opens AID Genesis
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type: "window"}).then(cs => { for (const c of cs) if ("focus" in c) return c.focus(); return self.clients.openWindow((e.notification.data && e.notification.data.open) || "./"); }));
});
