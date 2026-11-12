import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import checker from 'vite-plugin-checker'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/**
 * daisyUI 5 no longer exposes a JS theme registry (the v3 `src/theming/themes`
 * path is gone), so the theme list for the config UI is parsed out of the
 * shipped `themes.css` at build time.
 */
const readDaisyUiThemes = () => {
  const themesCss = readFileSync(require.resolve('daisyui/themes.css'), 'utf8')
  const blocks = themesCss.matchAll(/\[data-theme=([-\w]+)\]\s*\{([^}]*)\}/g)

  const themes = [...blocks].map(([, theme, body]) => ({
    theme,
    scheme: body.match(/color-scheme:\s*([a-z]+)/)?.[1] ?? 'light'
  }))

  themes.sort((a, b) =>
    `${a.scheme}${a.theme}`.localeCompare(`${b.scheme}${b.theme}`)
  )

  return themes
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    tailwindcss(),
    checker({
      typescript: true
    })
  ],
  define: {
    CARD_VERSION: JSON.stringify(process.env.npm_package_version),
    DAISYUI_THEMES: readDaisyUiThemes()
  },
  resolve: {
    tsconfigPaths: true
  },
  build: {
    // A Home Assistant card ships as one file by design: Tailwind's compiler
    // and daisyUI are most of it, and splitting would only add requests.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: 'src/main.ts',
      output: {
        dir: 'dist',
        entryFileNames: 'tailwind-template-card.js',
        manualChunks: undefined
      }
    }
  }
})
