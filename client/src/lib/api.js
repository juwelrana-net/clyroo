// client/src/lib/api.js

import axios from "axios";

// Hum hamesha relative URL "/" use karenge.
// Development mein Vite Proxy sambhal lega.
// Production mein Vercel Rewrite sambhal lega.
const api = axios.create({
  baseURL: "/",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    const isAuthRoute =
      config.url.includes("/api/auth/login") ||
      config.url.includes("/api/auth/register");

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
