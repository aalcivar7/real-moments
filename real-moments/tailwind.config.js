/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'pale-pink': '#D8C3B6',
        'off-white': '#F2F0EC',
        'sage': '#A9B6AE',
        'forest': '#6F8378',
        'mauve': '#BFA6A0',
        'blue-bell': '#90b0d2',
      },
      fontFamily: {
        title: ['Bachelorette', 'Playfair Display', 'Georgia', 'serif'],
        body: ['Arial', 'Helvetica', 'sans-serif'],
        gellatio: ['Gellatio', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
