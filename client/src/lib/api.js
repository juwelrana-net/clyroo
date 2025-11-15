// client/src/lib/api.js

import axios from "axios";

// 1. Naya axios instance banayein
const api = axios.create({
  baseURL: import.meta.env.PROD
    ? import.meta.env.VITE_API_BASE_URL // Production
    : "/", // Development (proxy ke liye)
});

// 2. NAYA (FIXED) INTERCEPTOR
// Yeh har request ko bhejte waqt check karega
api.interceptors.request.use(
  (config) => {
    // Local storage se token padhein
    const token = localStorage.getItem("adminToken");

    // Check karein ki URL login ya register ka toh nahi hai
    const isAuthRoute =
      config.url.includes("/api/auth/login") ||
      config.url.includes("/api/auth/register");

    // Agar token hai AUR yeh request login/register ki NAHI hai,
    // toh header mein token add karo
    if (token && !isAuthRoute) {
      config.headers["x-auth-token"] = token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
