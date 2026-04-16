const CACHE_NAME = 'qbacano-v3';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './img/logo.png'
];

// Instalar SW
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Error cacheando:', err))
  );
});

// Activar SW
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch: Priorizar red para HTML, cache para assets
self.addEventListener('fetch', event => {
  // Si es una página HTML, ir primero a red
  if (event.request.destination === 'document' || 
      event.request.url.endsWith('.html') ||
      event.request.url.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clonar y guardar en cache si es válido
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla, servir desde cache
          return caches.match(event.request);
        })
    );
  } else {
    // Para assets (CSS, JS, imágenes), cache first
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then(networkResponse => {
              // Guardar en cache si es válido
              if (networkResponse && networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseClone);
                });
              }
              return networkResponse;
            })
            .catch(() => {
              // Fallback para imágenes rotas
              if (event.request.destination === 'image') {
                return caches.match('./img/logo.png');
              }
            });
        })
    );
  }
});