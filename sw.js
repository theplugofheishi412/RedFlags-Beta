// Service Worker pour le Red Flag Game
const CACHE_NAME = 'red-flag-game-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/css/responsive.css',
    '/assets/js/app.js',
    '/assets/js/game.js',
    '/assets/js/cards.js',
    '/manifest.json'
];

// Installation
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Activation
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
});

// Fetch
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Retourner la version en cache ou faire la requête 
                return response || fetch(event.request);
            }
        )
    );
});