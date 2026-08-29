/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hextech: {
          dark: '#090a12',
          card: '#101426',
          border: '#1f294d',
          gold: '#f3c669',
          goldHover: '#ffd988',
          cyan: '#00f0ff',
          pink: '#ff2a85',
          purple: '#8a2be2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Cinzel', 'serif'],
      },
      boxShadow: {
        'hex-glow': '0 0 25px -5px rgba(0, 240, 255, 0.4)',
        'love-glow': '0 0 30px -5px rgba(255, 42, 133, 0.5)',
        'gold-glow': '0 0 25px -5px rgba(243, 198, 105, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
