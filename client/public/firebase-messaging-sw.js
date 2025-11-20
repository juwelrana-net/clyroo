// client/public/firebase-messaging-sw.js

importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

// --- CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAg5rmx5JkAQyHktP2LhH6XQXB4whY4zls",
  authDomain: "clyroo-9a4c6.firebaseapp.com",
  projectId: "clyroo-9a4c6",
  storageBucket: "clyroo-9a4c6.firebasestorage.app",
  messagingSenderId: "595015862814",
  appId: "1:595015862814:web:b376369a81709b4f2a7c0f",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Background mein notification aane par
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background Message:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico", // Icon path check kar lena
    // Click karne par wahi tab khule
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  // Agar URL data mein hai toh wahan le jao
  const urlToOpen = event.notification.data?.click_action || "/admin/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Agar tab khula hai to focus karo
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }
        // Nahi to naya kholo
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
