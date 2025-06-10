import { defineConfig } from 'vite';

export default defineConfig({
  // Hapus baris 'root'
  build: {
    outDir: 'dist', // Build output akan ada di dalam frontend/dist
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true
  }
});