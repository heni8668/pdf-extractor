import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
