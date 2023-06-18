import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import daisyUiThemes from 'daisyui/src/theming/themes'

const daisyUiFormattedThemes = Object.entries(daisyUiThemes).map(([k, v]) => ({
  theme: k.match(/theme=([\-\w]+)/)[1],
  scheme: v['color-scheme']
}))

daisyUiFormattedThemes.sort((a, b) => `${a.scheme}${a.theme}`.localeCompare(`${b.scheme}${b.theme}`))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), cssInjectedByJsPlugin()],
  define: {
    CARD_VERSION: JSON.stringify(process.env.npm_package_version),
    DAISYUI_CDN_URL:
      '"https://cdn.jsdelivr.net/npm/daisyui@latest/dist/full.css"',
    DAISYUI_THEMES: daisyUiFormattedThemes
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
