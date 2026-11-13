// Service worker van Netto.
//
// Uitgangspunt: een kapotte of verouderde service worker is erger dan geen.
// De site wordt vaak bijgewerkt (cache busting via ?v=) en de Daily komt uit
// Supabase. Daarom blijft deze worker bewust klein en voorzichtig:
//
//   * Pagina's (HTML)      netwerk eerst. Alleen als het netwerk echt wegvalt
//                          tonen we offline.html. Er wordt geen HTML bewaard,
//                          dus er kan nooit een oude pagina blijven hangen.
//   * Supabase en API's    worden nooit bewaard en zelfs niet aangeraakt: de
//                          worker doet er geen respondWith voor.
//   * Statische bestanden  (css, js, data, afbeeldingen, lettertypen) uit
//                          eigen domein en Google Fonts: stale-while-revalidate.
//                          De sleutel is de volledige URL, dus ?v=63 en ?v=64
//                          zijn aparte vermeldingen. Elke vermelding wordt bij
//                          gebruik op de achtergrond ververst.
//
// Nieuwe versie uitrollen? Alleen VERSION ophogen als de logica hieronder
// verandert. Bij activate worden alle oudere netto-caches opgeruimd.
//
// Noodrem: wil je de worker bij iedereen uitzetten, publiceer dan een sw.js die
// alleen deze regels bevat:
//   self.addEventListener('install', () => self.skipWaiting());
//   self.addEventListener('activate', e => e.waitUntil(
//     caches.keys().then(k => Promise.all(k.map(c => caches.delete(c))))
//       .then(() => self.registration.unregister())));
// Lokaal zonder worker testen kan met ?sw=0 achter het adres.

const VERSION = 'v1';
const SHELL_CACHE = `netto-shell-${VERSION}`;
const ASSET_CACHE = `netto-assets-${VERSION}`;
const OFFLINE_URL = new URL('offline.html', self.registration.scope).href;
const MAX_ASSET_ENTRIES = 400; // fotos kunnen zich opstapelen; oudste gaan eerst
const TRIM_EVERY = 20;         // keys() is traag bij veel vermeldingen; niet bij elke schrijfactie
let writes = 0;

// Bestandstypen die we als statisch beschouwen. HTML hoort hier bewust niet bij.
const STATIC_PATH = /\.(?:css|js|mjs|json|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf)$/i;
// Externe hosts waarvan we lettertypen mogen bewaren.
const CACHEABLE_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);
// Alles wat naar de backend gaat: nooit bewaren, nooit tussenbeide komen.
const BACKEND_HOST = /(?:^|\.)supabase\.(?:co|in)$/i;
const BACKEND_PATH = /\/(?:rest|auth|realtime|functions|storage|graphql)\/v1\//;

self.addEventListener('install', event => {
  // Zonder offline-pagina is de worker waardeloos; faalt dit, dan installeert
  // hij niet en blijft de site gewoon zonder worker werken.
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.add(new Request(OFFLINE_URL, { cache: 'reload' })))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL_CACHE, ASSET_CACHE]);
    const names = await caches.keys();
    await Promise.all(names
      .filter(name => name.startsWith('netto-') && !keep.has(name))
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'netto:version') event.source?.postMessage({ type: 'netto:version', version: VERSION });
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (request.headers.has('range') || request.headers.has('authorization')) return;

  const url = new URL(request.url);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return;
  if (BACKEND_HOST.test(url.hostname) || BACKEND_PATH.test(url.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith(pageNetworkFirst(request));
    return;
  }

  if (url.origin === self.location.origin) {
    if (url.pathname === new URL('sw.js', self.registration.scope).pathname) return;
    if (STATIC_PATH.test(url.pathname)) event.respondWith(staleWhileRevalidate(event, true));
    return; // al het andere (HTML via fetch, manifest, ...) gaat gewoon naar het netwerk
  }

  if (CACHEABLE_HOSTS.has(url.hostname)) event.respondWith(staleWhileRevalidate(event, false));
});

async function pageNetworkFirst(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Alleen bij een echte netwerkfout; een 404 of 500 van de server gaat door.
    const cache = await caches.open(SHELL_CACHE);
    const offline = await cache.match(OFFLINE_URL);
    return offline || new Response('Netto is offline. Check your connection and try again.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

async function staleWhileRevalidate(event, sameOrigin) {
  const request = event.request;
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  // Op eigen domein vragen we de server of het bestand veranderd is (304 is
  // goedkoop); zo is een vergeten ?v=-ophoging na één bezoek toch hersteld.
  const refresh = fetch(sameOrigin ? new Request(request, { cache: 'no-cache' }) : request)
    .then(async response => {
      // Alleen echte, leesbare antwoorden; geen fouten en geen ondoorzichtige.
      if (response.status === 200 && response.type !== 'opaque') {
        await cache.put(request, response.clone());
        if (++writes % TRIM_EVERY === 0) await trim(cache);
      }
      return response;
    });

  if (cached) {
    event.waitUntil(refresh.catch(() => {}));
    return cached;
  }
  return refresh;
}

async function trim(cache) {
  const keys = await cache.keys();
  const surplus = keys.length - MAX_ASSET_ENTRIES;
  for (let index = 0; index < surplus; index += 1) await cache.delete(keys[index]);
}
