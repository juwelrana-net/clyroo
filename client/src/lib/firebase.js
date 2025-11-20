// client/src/lib/firebase.js

import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "./api.js";

const firebaseConfig = {
  apiKey: "AIzaSyAg5rmx5JkAQyHktP2LhH6XQXB4whY4zls",
  authDomain: "clyroo-9a4c6.firebaseapp.com",
  projectId: "clyroo-9a4c6",
  storageBucket: "clyroo-9a4c6.firebasestorage.app",
  messagingSenderId: "595015862814",
  appId: "1:595015862814:web:b376369a81709b4f2a7c0f",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const VAPID_KEY =
  "BGG52q8xmB4MMnS9HjKE5hccn_waMO8r9DBucSzmUL0KjEiEJUpKdZmBm6sEpZ-QpH7kQyo8-w_pkXZpz3MFYYE";

export const requestNotificationPermission = async () => {
  console.log("Requesting notification permission...");

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission was not granted.");
      return null;
    }

    console.log("Permission granted. Registering Service Worker...");

    // 1. Service Worker Register karein
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    console.log("Service Worker registered. Waiting for it to be ready...");

    // 2. CRITICAL FIX: Wait karein jab tak SW poori tarah active na ho jaye
    // Agar hum yeh nahi karte, toh 'no active service worker' error aata hai
    const activeRegistration = await navigator.serviceWorker.ready;
    console.log("Service Worker is now READY!");

    // 3. Ab Token maangein (Active Registration use karke)
    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: activeRegistration, // Yahan active wala pass karein
    });

    if (!currentToken) {
      console.log("No registration token available.");
      return null;
    }

    console.log("FCM Token:", currentToken);

    const savedToken = localStorage.getItem("fcmToken");
    if (currentToken === savedToken) {
      return currentToken;
    }

    await api.post("/api/admin/register-device", {
      fcmToken: currentToken,
    });

    localStorage.setItem("fcmToken", currentToken);
    console.log("New FCM Token registered with server.");

    return currentToken;
  } catch (err) {
    console.error("An error occurred while getting token: ", err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      resolve(payload);
    });
  });
