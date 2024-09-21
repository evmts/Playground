import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import {vitePluginTevm} from 'tevm/bundler/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginTevm()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
