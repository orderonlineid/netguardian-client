import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PORT = process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 3000
const API_URL = process.env.VITE_API_URL || 'http://localhost:3001'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: PORT, // Port untuk frontend
        proxy: {
            // Proxy API requests ke backend agar tidak kena CORS saat development
            '/api': {
                target: API_URL,
                changeOrigin: true,
            }
        }
    }
})
