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
        'bg-primary': '#000000',
        'bg-secondary': '#0A0E27',
        'accent-blue': '#1E40AF',
        'accent-sky': '#3B82F6',
        'accent-amber': '#F59E0B',
        'text-primary': '#F1F5F9',
        'text-muted': '#94A3B8',
      },
      fontFamily: {
        'code': ['Fira Code', 'monospace'],
        'sans': ['Fira Sans', 'sans-serif'],
      },
      backdropBlur: {
        'glass': '15px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.37)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.3)',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
    },
  },
  plugins: [],
}
