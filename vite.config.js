import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use relative asset URLs so the app works at the domain root or under a subdirectory.
  base: './',
})
