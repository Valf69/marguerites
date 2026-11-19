/* Les Marguerites du Vieux : mise en cache pour jouer hors ligne.
   À chaque nouvelle version du jeu, change VERSION pour que les téléphones récupèrent les nouveaux fichiers. */
const VERSION = 'marguerites-v6-plat';
const FILES = ["./", "index.html", "manifest.json", "audio.js", "core.js", "data.js", "ete.js", "game.js", "levels.js", "map.js", "render.js", "render2.js", "render3.js", "saisons.js", "12.png", "16.png", "24.png", "4.png", "5.png", "8.png", "apple-touch-icon.png", "carte.png", "icon-192.png", "icon-512.png"];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// réseau d'abord (pour avoir la dernière version), cache si pas de réseau
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
