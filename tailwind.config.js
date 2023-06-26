/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('daisyui'), require('tailwind-scrollbar')],
  theme: {
    extend: {}
  }
}
