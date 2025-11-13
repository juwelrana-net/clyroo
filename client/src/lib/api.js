// client/src/lib/api.js

import axios from "axios";

// 1. Naya axios instance banayein
const api = axios.create({
  baseURL: import.meta.env.PROD
    ? import.meta.env.VITE_API_BASE_URL // Production mein yeh URL use karega
    : "/", // Development mein root use karega (taaki proxy kaam kare)
});

// 2. Automatic Token Header (Yeh bohot future-proof hai)
// Yeh aapke har admin request ke saath 'x-auth-token' khud bhej dega
api.interceptors.request.use(
  (config) => {
    // --- YEH LINE UPDATE HUI HAI ---
    // Ab hum check karenge ki URL mein '/admin' kahin bhi hai ya nahi
    // Ya phir URL '/api/auth' (login/register) ke alawa hai
    const isAdminRoute = config.url.includes("/admin");

    if (isAdminRoute) {
      const token = localStorage.getItem("adminToken");
      if (token) {
        config.headers["x-auth-token"] = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
