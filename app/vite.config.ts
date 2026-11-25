import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  // Fonts are small enough to sit inside the stylesheet, which keeps them working wherever the app is hosted.
  build: { assetsInlineLimit: 60000 },
})
