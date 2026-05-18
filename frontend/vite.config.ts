import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const useMono = process.env.VITE_MONO === 'true'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: useMono
      ? { '/api': 'http://localhost:3000' }
      : {
          '/api/auth': 'http://localhost:3001',
          '/api/users': 'http://localhost:3002',
          '/api/ingredients': 'http://localhost:3003',
          '/api/freezbe': 'http://localhost:3004',
          '/api/processes': 'http://localhost:3005',
        },
  },
})
