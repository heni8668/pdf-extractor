import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use Node.js process.env to access environment variables
// const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:3000";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["pdfjs-dist/build/pdf.worker.min.mjs"],
  },
  server: {
    proxy: {
      "/generate": {
        target: "https://teletemari-ai-content-generation.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
