/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    './index.html',
    './components.js',
  ], safelist: [
    'light-mode',
    'dark-mode',
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#1a1a1a',
        lightBg: '#ffffff',
        darkText: '#f5f5f5',
        lightText: '#000000',
      },
    },
  },
  plugins: [],
};
