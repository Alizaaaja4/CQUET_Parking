import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    host: false, // This tells Vite to bind to 0.0.0.0, making it accessible on your network
    // You can also explicitly set a port if 5173 is causing issues, e.g.:
    port: 5173,
    proxy: {
      // Whenever a request is made to '/api', Vite will proxy it to your backend
      '/api': {
        target: 'http://localhost:8000', // <--- REPLACE WITH YOUR ACTUAL BACKEND API URL AND PORT
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false, // If your backend uses HTTPS, set this to true
      },
      // You can add more proxy rules if your backend has other base paths, e.g., '/auth'
      // '/auth': {
      //   target: 'http://localhost:8080',
      //   changeOrigin: true,
      // },
    },
  }
});
