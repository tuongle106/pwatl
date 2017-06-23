// This file is intentionally without code.
// It's present so that service worker registration will work when serving from the 'app' directory.
// The version of service-worker.js that's present in the 'dist' directory is automatically
// generated by the 'generate-service-worker' gulp task, and contains code to precache resources.

// use a cacheName for cache versioning
var cacheName = 'v1::static';

// during the install phase you usually want to cache static assets
self.addEventListener('install', function(e) {
  // once the SW is installed, go ahead and fetch the resources to make this work offline
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll([
        '/styles/main.css',
        '/scripts/main.min.js',
        '/styles/material.indigo-pink.min.css'
      ]).then(function() {
        self.skipWaiting();
      });
    })
  );
});

// when the browser fetches a url
self.addEventListener('fetch', function(event) {
  // either respond with the cached object or go ahead and fetch the actual url
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log('Retrieved from cache', response.url);
        // retrieve from cache
        return response;
      }
      // fetch as normal
      return fetch(event.request);
    })
  );
});

self.addEventListener('push', function(event) {
  console.log('Received a push message');

  var title = 'New message.';
  var body = 'You have received a new message.';
  var icon = './launcher-icon-8x.png';
  var tag = 'simple-push-demo-notification-tag';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      tag: tag
    })
  );
});
