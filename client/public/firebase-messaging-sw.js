// client/public/firebase-messaging-sw.js

// Yeh file lagbhag khaali rahegi.
// Firebase SDK isse automatically dhoond lega.

// Scripts import karein
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// --- Yahaan apna FIREBASE CONFIG daalein ---
// Yeh wahi config hai jo aapne Step 2 mein copy kiya tha
const firebaseConfig = {
  apiKey: "AIzaSyAg5rmx5JkAQyHktP2LhH6XQXB4whY4zls",
  authDomain: "clyroo-9a4c6.firebaseapp.com",
  projectId: "clyroo-9a4c6",
  storageBucket: "clyroo-9a4c6.firebasestorage.app",
  messagingSenderId: "595015862814",
  appId: "1:595015862814:web:b376369a81709b4f2a7c0f",
};
// --- CONFIG KHATAM ---

// Firebase ko initialize karein
firebase.initializeApp(firebaseConfig);

// Messaging service ko access karein
const messaging = firebase.messaging();

// Background notification handler (optional)
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Yahaan aap notification ko customize kar sakte hain
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico", // Aapka logo
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
