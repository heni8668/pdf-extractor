import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import API_BASE_URL from "./src/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["pdfjs-dist/build/pdf.worker.min.mjs"],
  },
  server: {
    proxy: {
      "/generate": {
        target: `${API_BASE_URL}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
