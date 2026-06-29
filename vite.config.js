import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { campaignsMockPlugin } from './vite/campaignsMockPlugin.js'

const useRealApi = process.env.VITE_USE_REAL_API === 'true'

export default defineConfig({
  plugins: [react(), tailwindcss(), ...(useRealApi ? [] : [campaignsMockPlugin()])],
  server: useRealApi
    ? {
        proxy: {
          '/campaigns': {
            target: 'http://localhost:8000',
            changeOrigin: true,
          },
        },
      }
    : {},
})
