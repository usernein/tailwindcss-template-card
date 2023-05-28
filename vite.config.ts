import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), cssInjectedByJsPlugin()],
  define: {
    CARD_VERSION: JSON.stringify(process.env.npm_package_version)
  },
  build: {
    rollupOptions: {
      input: 'src/main.ts',
      output: {
        dir: 'dist',
        entryFileNames: 'tailwindcss-template-card.js',
        manualChunks: undefined
      }
    }
  }
})
