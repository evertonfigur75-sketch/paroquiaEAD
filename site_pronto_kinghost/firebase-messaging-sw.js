importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  projectId: "silver-fiber-267314",
  appId: "1:676890928921:web:9f10ce5d94ab32dfa60788",
  apiKey: "AIzaSyDsyOEyGIWPp0Hitl4tVUmEbWOdSFDwTe8",
  authDomain: "silver-fiber-267314.firebaseapp.com",
  messagingSenderId: "676890928921",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensagem recebida em segundo plano: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
