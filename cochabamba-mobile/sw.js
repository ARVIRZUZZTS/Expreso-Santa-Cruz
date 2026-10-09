const CACHE_NAME = 'cochabamba-mobile-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/menu.html',
    '/diario.html',
    '/encomienda.html',
    '/css/variables.css',
    '/css/components.css',
    '/css/mobile.css',
    '/js/app.js',
    '/js/api.js',
    '/js/auth.js',
    '/js/components.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, responseToCache));
                        return response;
                    })
                    .catch(() => {
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-encomiendas') {
        event.waitUntil(syncEncomiendas());
    }
});

async function syncEncomiendas() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    const pendingRequests = requests.filter(req => req.url.includes('encomiendamovil'));

    for (const request of pendingRequests) {
        try {
            const response = await fetch(request);
            if (response.ok) {
                await cache.delete(request);
            }
        } catch (e) {
            console.error('Sync failed:', e);
        }
    }
}
