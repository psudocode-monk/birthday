import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps the build portable across static hosts
// (Vercel, Netlify, GitHub Pages project sites, plain file hosting).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2018',
    cssCodeSplit: true,
    assetsInlineLimit: 1024,
  },
})
