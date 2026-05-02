/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: { bg: '#0f0f0f', card: '#181818', border: '#2a2a2a' },
        brand: { red: '#ff3b3b', orange: '#ff7a18', accent: '#ff9f43' },
        text: { primary: '#f5f5f5', secondary: '#a1a1aa' },
        status: { success: '#22c55e', danger: '#ef4444' }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #ff3b3b, #ff7a18)',
      }
    },
  },
  plugins: [],
}