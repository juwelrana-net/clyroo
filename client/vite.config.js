// client/vite.config.js

import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],

  // YEH NAYA BLOCK ADD KIYA GAYA HAI
  server: {
    proxy: {
      // /api se shuru hone wale sabhi requests ko 5000 par bhej do
      "/api": {
        target: "https://clyroo-server.onrender.com",
        changeOrigin: true, // Zaroori hai
      },
    },
  },
  // YEH BLOCK KHATAM HUA

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
