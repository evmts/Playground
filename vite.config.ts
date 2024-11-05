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
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    }
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    }
  },
  plugins: [
    remix({
      presets: [vitePluginTevm(), RemixPWAPreset()],
      // Add headers to the server response
      serverModuleFormat: 'esm',
    }),
    RemixVitePWAPlugin({ registerType: 'prompt' }),
    tsconfigPaths(),
    // Keep your existing middleware for development
    {
      name: 'configure-response-headers',
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((_req, res, next) => {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          next();
        });
      }
    }
  ],
})
