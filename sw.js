var CACHE = 'fundament-v2';

var SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) {
        return c.addAll(SHELL);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) {
              return k !== CACHE;
            })
            .map(function (k) {
              return caches.delete(k);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;

  var url = new URL(e.request.url);

  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();

          caches.open(CACHE).then(function (cache) {
            cache.put(e.request, copy);
          });
        }

        return response;
      })
      .catch(function () {
        return caches.match(e.request).then(function (cached) {
          return cached || caches.match('./index.html');
        });
      })
  );
});
