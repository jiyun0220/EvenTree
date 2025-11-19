import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://api.data.go.kr",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: false,
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("Proxying to:", proxyReq.path);
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log("Response status:", proxyRes.statusCode);
          });
        },
      },
    },
  },
});
