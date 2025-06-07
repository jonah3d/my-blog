import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // This tells Vite that your site will be in a subfolder called /my-blog/
  base: '/my-blog/',
  plugins: [react()],
})
