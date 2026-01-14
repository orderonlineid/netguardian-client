import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const PORT = env.VITE_PORT ? parseInt(env.VITE_PORT) : 3000
    const API_URL = env.VITE_API_URL || 'http://localhost:3001'

    return {
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
    }
})
