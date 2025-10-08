import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // make asset links relative so moved files work correctly
  plugins: [react()],
})
