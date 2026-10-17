/* Service worker de la página de músico.
   - Guarda lo básico (página, logos, íconos) para que abra rápido y funcione la instalación.
   - Primero intenta la red, así cada versión nueva que subas a GitHub se ve enseguida.
   - NO toca los audios: no se guardan en el teléfono (no ocupan almacenamiento). */
const CACHE = "jpn-musica-v2";
const NUCLEO = [
  "./", "index.html", "manifest.json",
  "icons/icon-192.png", "icons/icon-512.png",
  "img/bidukka-logo.png", "img/troskare-logo.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(NUCLEO.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request;
  const url = new URL(r.url);
  if (r.method !== "GET" || url.origin !== location.origin) return;
  if (r.headers.has("range") || /\.(mp3|m4a|wav|ogg|flac|aac)$/i.test(url.pathname)) return;
  e.respondWith(
    fetch(r)
      .then(res => {
        if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(r, copia)); }
        return res;
      })
      .catch(() => caches.match(r).then(m => m || caches.match("index.html")))
  );
});
