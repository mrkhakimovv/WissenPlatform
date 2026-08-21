importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCn04t32JuYeOl-xvNklbJ9vNeTK7RGrfg",
  authDomain: "wissenapp-4bce7.firebaseapp.com",
  projectId: "wissenapp-4bce7",
  storageBucket: "wissenapp-4bce7.firebasestorage.app",
  messagingSenderId: "853806293997",
  appId: "1:853806293997:web:a1948456c1b16403e8bde4"
});

const messaging = firebase.messaging();

// Server "data-only" xabar yuboradi (notification kaliti yo'q), shuning uchun
// bildirishnomani faqat shu yerda bir marta ko'rsatamiz — dublikat bo'lmaydi.
messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || 'Yangi xabarnoma';
  self.registration.showNotification(title, {
    body: data.body || '',
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    data: { link: data.link || '/' },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Ilova allaqachon ochiq bo'lsa — o'sha oynani fokuslaymiz va yo'naltiramiz
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && link) {
            client.navigate(link).catch(() => {});
          }
          return;
        }
      }
      // Aks holda yangi oyna ochamiz
      if (clients.openWindow) return clients.openWindow(link);
    })
  );
});