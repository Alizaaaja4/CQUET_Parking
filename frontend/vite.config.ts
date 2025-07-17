// PARK-IQ-CENTRAL-FE/vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    host: '0.0.0.0', // This tells Vite to bind to 0.0.0.0, making it accessible on your network
    port: 3000,      // Ensure this is 3000, matching your Dockerfile EXPOSE and docker-compose internal port
    proxy: {
      // Whenever a request is made to '/api', Vite will proxy it to your backend
      '/api': {
        target: 'http://backend:8000', // <--- CRITICAL FIX: Use the Docker Compose service name and its internal port
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false, // If your backend uses HTTPS, set this to true
      },
    },
  }
});