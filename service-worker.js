const CACHE_NAME = "hogevor-ergaran-v9";

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
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});


self.addEventListener("activate", event => {
    event.waitUntil(
        caches
            .keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});


self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    const url = new URL(event.request.url);

    const isAppFile =
        url.origin === self.location.origin &&
        (
            url.pathname.endsWith("/") ||
            url.pathname.endsWith("/index.html") ||
            url.pathname.endsWith("/songs.json") ||
            url.pathname.endsWith("/manifest.json")
        );


    if (isAppFile) {

        event.respondWith(

            fetch(event.request)

                .then(response => {

                    if (
                        response &&
                        response.status === 200
                    ) {

                        const responseClone =
                            response.clone();

                        caches
                            .open(CACHE_NAME)
                            .then(cache => {

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            });

                    }

                    return response;

                })

                .catch(() => {

                    return caches.match(
                        event.request
                    );

                })

        );

        return;

    }


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
