/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Kaggle Brand Colors
        kaggle: {
          cyan: '#20BEFF',
          blue: '#008ABC',
          darkblue: '#006185',
          lightcyan: '#E6F8FF',
          darkbg: '#121826',
          darkcard: '#182234',
        },
        'kaggle-darkbg': '#121826',
        'kaggle-darkcard': '#182234',
        'kaggle-lightcyan': '#E6F8FF',
        'kaggle-darkblue': '#006185',
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#20BEFF',
          600: '#00A0E3',
          700: '#008ABC',
          800: '#006B94',
          900: '#005273',
        },
        secondary: {
          50: '#f0fdf4',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        accent: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        // Dark Theme Colors
        darkBg: '#0F172A',
        darkSurface: '#1E293B',
        darkCard: '#1E293B',
        darkBorder: '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        kaggle: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        kaggleHover: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        kaggleGlow: '0 0 20px rgba(32, 190, 255, 0.25)',
      }
    },
  },
  plugins: [],
}
