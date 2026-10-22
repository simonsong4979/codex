// Increment VERSION when changing any app-shell file before publishing.
const VERSION = 'v4';
const PREFIX = `tokyo-family-${new URL(self.registration.scope).pathname}-`;
const CACHE = `${PREFIX}${VERSION}`;
const SHELL = ['index.html','styles.css','theme.css','theme.js','shared-lists.css','firebase-config.js','shared-lists.js','list-ui.js','app.js','itinerary.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','itinerary.txt'];

self.addEventListener('install',(event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL.map((file) => new Request(new URL(file,self.registration.scope), {cache:'reload'})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',(event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
    for (const client of await self.clients.matchAll()) client.postMessage({type:'OFFLINE_READY', version:VERSION});
  })());
});

self.addEventListener('fetch',(event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  if (url.pathname === new URL('firebase-config.js',self.registration.scope).pathname) {
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      try {const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;}
      catch {return cache.match(event.request,{ignoreSearch:true});}
    })());
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try { return await fetch(event.request); }
      catch { return (await caches.open(CACHE)).match(new URL('index.html',self.registration.scope)); }
    })());
    return;
  }
  // A versioned, verified app shell is cached atomically on install. Maps and other
  // third-party requests stay outside this service worker.
  if (SHELL.some((file) => url.pathname === new URL(file,self.registration.scope).pathname)) {
    event.respondWith((async () => (await caches.open(CACHE)).match(event.request,{ignoreSearch:true}) || fetch(event.request))());
  }
});
