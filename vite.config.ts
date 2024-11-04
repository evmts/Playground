import { defineConfig } from 'vite'
import { vitePluginTevm } from 'tevm/bundler/vite-plugin'
import { vitePlugin as remix } from '@remix-run/dev'
import { installGlobals } from '@remix-run/node'
import { RemixVitePWA } from '@vite-pwa/remix'
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals()

const { RemixVitePWAPlugin, RemixPWAPreset } = RemixVitePWA()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    remix({
      presets: [vitePluginTevm(), RemixPWAPreset()]
    }),
    RemixVitePWAPlugin({ registerType: 'prompt' }),
    tsconfigPaths(),
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
