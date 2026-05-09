/**
 * ============================================================
 * 🔧 NEOCLASS - Service Worker
 * Cache et fonctionnalités offline
 * ============================================================
 */

const CACHE_NAME = 'neoclass-v2';
const STATIC_CACHE = 'neoclass-static-v2';
const DYNAMIC_CACHE = 'neoclass-dynamic-v2';

// Fichiers à mettre en cache immédiatement
const STATIC_FILES = [
  '/',
  '/css/variables.css',
  '/css/base.css',
  '/css/components.css',
  '/css/layout.css',
  '/css/animations.css',
  '/css/responsive.css',
  '/js/core/config.js',
  '/js/utils/helpers.js',
  '/js/core/store.js',
  '/js/core/router.js',
  '/js/core/firebase.js',
  '/js/modules/ui.js',
  '/js/modules/auth.js',
  '/js/modules/gamification.js',
  '/js/modules/courses.js',
  '/js/app.js',
  '/assets/images/hero-illustration.svg',
  '/assets/images/default-avatar.png',
  '/assets/icons/favicon.svg',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Mise en cache des fichiers statiques');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => {
              console.log('[SW] Suppression ancien cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;
  
  // Ignorer les requêtes API et Firebase
  if (url.pathname.startsWith('/api/') || 
      url.hostname.includes('firebase') ||
      url.hostname.includes('googleapis')) {
    return;
  }
  
  // Stratégie: Cache First pour les fichiers statiques
  if (STATIC_FILES.some(file => url.pathname === file || url.pathname.endsWith(file))) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Stratégie: Network First pour les pages HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Stratégie: Stale While Revalidate pour les autres ressources
  event.respondWith(staleWhileRevalidate(request));
});

/**
 * Cache First - Utiliser le cache, sinon réseau
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network First - Utiliser le réseau, sinon cache
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return caches.match('/');
  }
}

/**
 * Stale While Revalidate - Retourner le cache et mettre à jour en arrière-plan
 */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return response;
    })
    .catch(() => cached);
  
  return cached || fetchPromise;
}

// Gestion des notifications push
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || "N'oublie pas ta leçon du jour !",
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Ouvrir'
      },
      {
        action: 'close',
        title: 'Fermer'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Neoclass 🎓', options)
  );
});

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') return;
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Si une fenêtre est déjà ouverte, la focus
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Background Sync pour les données hors ligne
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  }
});

async function syncProgress() {
  // Synchroniser les données de progression en attente
  const cache = await caches.open('neoclass-pending');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await cache.match(request);
      const data = await response.json();
      
      // Envoyer au serveur
      await fetch('/api/sync/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      // Supprimer du cache pending
      await cache.delete(request);
    } catch (error) {
      console.error('[SW] Erreur sync:', error);
    }
  }
}

console.log('[SW] Service Worker chargé');
