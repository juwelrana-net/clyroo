// client/src/lib/firebase.js

import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "./api.js"; // Hamara custom API instance

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

// Firebase app ko initialize karein
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Public VAPID key (Firebase console se milti hai)
// Yeh zaroori hai browser ko batane ke liye ki aap genuine hain
// **Yeh key public hoti hai, isse chhupane ki zaroorat nahi.**

// --- YEH KEY KAHAN SE MILEGI ---
// 1. Firebase Console -> Project Settings -> Cloud Messaging tab
// 2. Neeche "Web configuration" section mein, "Web Push certificates" dhoondein
// 3. Wahaan "Key pair" hoga, usse generate karke copy karein.
const VAPID_KEY =
  "BGG52q8xmB4MMnS9HjKE5hccn_waMO8r9DBucSzmUL0KjEiEJUpKdZmBm6sEpZ-QpH7kQyo8-w_pkXZpz3MFYYE";

// Yeh function permission maangega aur token bhejega
export const requestNotificationPermission = async () => {
  console.log("Requesting notification permission...");

  try {
    // 1. Permission maangein
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission was not granted.");
      return null;
    }

    console.log("Permission granted. Getting token...");

    // 2. Token haasil karein
    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      // Service worker file ka path batayein
      serviceWorkerRegistration: await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      ),
    });

    if (!currentToken) {
      console.log("No registration token available. Request permission.");
      return null;
    }

    console.log("FCM Token:", currentToken);

    // 3. Token ko server par bhejein (agar naya hai)
    // Hum localStorage use karenge taaki baar-baar na bhejein
    const savedToken = localStorage.getItem("fcmToken");
    if (currentToken === savedToken) {
      console.log("Token is already up-to-date on server.");
      return currentToken;
    }

    // Token naya hai, server par bhejein
    await api.post("/api/admin/register-device", {
      fcmToken: currentToken,
    });

    // Naye token ko save karein
    localStorage.setItem("fcmToken", currentToken);
    console.log("New FCM Token registered with server.");

    return currentToken;
  } catch (err) {
    console.error("An error occurred while getting token: ", err);
    // Service worker ki problem ho sakti hai
    if (err.code === "messaging/failed-serviceworker-registration") {
      console.error(
        "Service worker registration failed. Make sure 'firebase-messaging-sw.js' is in the 'public' folder."
      );
    }
    return null;
  }
};

// Yeh function foreground notifications (jab app khula hai) receive karega
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      // Yahaan aap ek custom toast ya popup dikha sakte hain
      // Example: toast.success(payload.notification.title)
      resolve(payload);
    });
  });
