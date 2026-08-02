import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During local dev, requests to /api/* are forwarded to the Express
// backend on port 4000, so the React app can just call fetch("/api/books").
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:4001"
    }
  }
});
