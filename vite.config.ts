import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import daisyUiThemes from 'daisyui/src/theming/themes'
import tsconfigPaths from 'vite-tsconfig-paths'

const daisyUiFormattedThemes = Object.entries(daisyUiThemes).map(([k, v]) => ({
  theme: k.match(/theme=([\-\w]+)/)[1],
  scheme: v['color-scheme']
}))

daisyUiFormattedThemes.sort((a, b) => `${a.scheme}${a.theme}`.localeCompare(`${b.scheme}${b.theme}`))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), tsconfigPaths()],
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
