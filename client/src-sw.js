const { offlineFallback, warmStrategyCache } = require('workbox-recipes');
const { CacheFirst } = require('workbox-strategies');
const { registerRoute } = require('workbox-routing');
const { CacheableResponsePlugin } = require('workbox-cacheable-response');
const { ExpirationPlugin } = require('workbox-expiration');
const { precacheAndRoute } = require('workbox-precaching/precacheAndRoute');

precacheAndRoute(self.__WB_MANIFEST);

const pageCache = new CacheFirst({
  cacheName: 'page-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

warmStrategyCache({
  urls: ['/index.html', '/'],
  strategy: pageCache,
});

registerRoute(({ request }) => request.mode === 'navigate', pageCache);

// Define a RegExp pattern to match asset requests
const assetsPattern = /\.(js|css|png|jpg|jpeg|svg|woff2|woff)$/;

// Define a caching strategy for asset requests
const assetCache = new CacheFirst({
  cacheName: 'asset-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

// Register a route for asset requests using the defined strategy
registerRoute(({ request }) => assetsPattern.test(request.url), assetCache);

// Define an offline fallback response
const offlineFallbackResponse = () =>
  new Response('You are offline.', {
    headers: { 'Content-Type': 'text/plain' },
  });

// Use the offlineFallback recipe to return the fallback response
offlineFallback({
  pageFallback: '/index.html',
  imageFallback: null,
  // Use the previously defined offlineFallbackResponse
  fallback: { offline: offlineFallbackResponse },
});