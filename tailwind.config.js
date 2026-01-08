/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#064E3B', // Deep Emerald Green
        secondary: '#F3F4F6', // Misty Grey
        accent: '#D97706', // Antique Gold
        snow: '#FFFDFA', // Off-white/Snow
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'mist-gradient': 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 100%)',
      }
    },
  },
  plugins: [],
}
