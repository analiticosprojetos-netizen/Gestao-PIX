// Este arquivo roda em segundo plano
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Alerta de Boleto';
  const options = {
    body: data.body || 'Você tem um boleto vencendo hoje!',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40],
    tag: 'boleto-alerta',
    renotify: true,
    requireInteraction: true // A notificação fica na tela até você clicar
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

// Forçar ativação imediata
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());