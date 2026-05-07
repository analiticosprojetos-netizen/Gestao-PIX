// Este arquivo roda em segundo plano
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Gestão PIX';
  const options = {
    body: data.body || 'Você tem uma movimentação pendente!',
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40],
    tag: 'pix-alerta',
    renotify: true,
    requireInteraction: true 
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Forçar ativação imediata e limpeza de cache antigo
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});