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
    // Sirf admin (API) routes ke liye token add karein
    if (config.url.startsWith("/api/admin")) {
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
