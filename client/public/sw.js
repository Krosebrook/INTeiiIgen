// DashGen Service Worker
const CACHE_VERSION = 'dashgen-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Cache-first for static assets (CSS, JS, images)
const STATIC_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.svg$/,
  /\.ico$/,
];

// Network-first for API calls
const API_PATTERNS = [
  /^\/api\//,
];

// Never cache these
const NO_CACHE_PATTERNS = [
  /\/api\/upload/,
  /\/api\/auth/,
  /\/api\/login/,
  /\/api\/logout/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => {
          // Only cache if the resource exists
          return true;
        }));
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('dashgen-') && name !== STATIC_CACHE && name !== API_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip no-cache patterns
  if (NO_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return;
  }

  // API calls: Network-first with cache fallback
  if (API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(networkFirstWithCache(event.request, API_CACHE, 300)); // 5 min cache
    return;
  }

  // Static assets: Cache-first
  if (STATIC_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheFirstWithNetwork(event.request, STATIC_CACHE));
    return;
  }

  // HTML pages: Network-first
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithCache(event.request, STATIC_CACHE, 3600)); // 1 hour cache
    return;
  }

  // Default: Network-first
  event.respondWith(networkFirstWithCache(event.request, STATIC_CACHE, 3600));
});

// Cache-first strategy (for static assets)
async function cacheFirstWithNetwork(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Revalidate in background
      fetchAndCache(request, cacheName);
      return cachedResponse;
    }
    return await fetchAndCache(request, cacheName);
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    return new Response('Offline - resource not available', { status: 503 });
  }
}

// Network-first strategy (for API and HTML)
async function networkFirstWithCache(request, cacheName, maxAgeSeconds = 300) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const responseClone = response.clone();
      
      // Add timestamp header for stale-while-revalidate
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cached-at', Date.now().toString());
      
      const cachedResponse = new Response(await responseClone.blob(), {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers,
      });
      
      cache.put(request, cachedResponse);
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Check if stale
      const cachedAt = parseInt(cachedResponse.headers.get('sw-cached-at') || '0');
      const age = (Date.now() - cachedAt) / 1000;
      
      if (age < maxAgeSeconds) {
        return cachedResponse;
      }
      
      console.log('[SW] Cache stale, returning anyway:', age, 'seconds old');
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Fetch and cache helper
async function fetchAndCache(request, cacheName) {
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

// Background sync for failed uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'upload-retry') {
    console.log('[SW] Background sync: retrying uploads');
    event.waitUntil(retryFailedUploads());
  }
});

async function retryFailedUploads() {
  // Get failed uploads from IndexedDB or postMessage to clients
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'RETRY_UPLOADS' });
  });
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
});
