importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCn04t32JuYeOl-xvNklbJ9vNeTK7RGrfg",
  authDomain: "wissenapp-4bce7.firebaseapp.com",
  projectId: "wissenapp-4bce7",
  storageBucket: "wissenapp-4bce7.firebasestorage.app",
  messagingSenderId: "853806293997",
  appId: "1:853806293997:web:a1948456c1b16403e8bde4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    data: { link: payload.data?.link || '/' },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.link || '/'));
});
