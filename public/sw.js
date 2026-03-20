// Este arquivo roda em segundo plano, mesmo com o app fechado
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Alerta de Boleto';
  const options = {
    body: data.body || 'Você tem um boleto vencendo hoje!',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    vibrate: [200, 100, 200], // Faz o celular vibrar
    tag: 'boleto-alerta', // Evita notificações duplicadas
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Quando o usuário clica na notificação
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});