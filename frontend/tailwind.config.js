/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#fefdeb',
          100: '#fdf9c8',
          200: '#fbf395',
          300: '#f8e755',
          400: '#f4d51b',
          500: '#dcb80e',
          600: '#be930a',
          700: '#986d0b',
          800: '#7c540f',
          900: '#654411',
          950: '#3b2306',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
