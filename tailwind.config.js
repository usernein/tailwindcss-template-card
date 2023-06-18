/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  daisyui: {
    themes: [
      'light',
      {
        dark: {
          ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
          'base-100': '#1c1c1c'
        }
      }
    ]
  },
  plugins: [require('daisyui')],
  theme: {
    extend: {}
  }
}
