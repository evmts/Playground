import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import {vitePluginTevm} from 'tevm/bundler/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginTevm()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
