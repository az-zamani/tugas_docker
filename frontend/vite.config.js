import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Config Vite yang benar untuk Tailwind
export default defineConfig({
  plugins: [react()],
})
