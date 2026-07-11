const CACHE_NAME = "hogevor-erger-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./songs.json",
    "./manifest.json"
];


self.addEventListener("install", event => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(
                    FILES_TO_CACHE
                );
            })
    );

    self.skipWaiting();
});


self.addEventListener("activate", event => {
    event.waitUntil(
        caches
            .keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(
                            cacheName =>
                                cacheName !== CACHE_NAME
                        )
                        .map(
                            cacheName =>
                                caches.delete(cacheName)
                        )
                );
            })
    );

    self.clients.claim();
});


self.addEventListener("fetch", event => {
    event.respondWith(
        caches
            .match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request);
            })
    );
});