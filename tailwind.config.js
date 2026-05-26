const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00A8E8',
        accent: '#0096C7',
        gold: '#FFD60A',
        dark: '#1A1A2E'
      },
      boxShadow: {
        glow:
          '0 0 0 1px rgba(0,168,232,0.08), 0 30px 60px rgba(0,0,0,0.12)'
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans]
      }
    }
  },
  plugins: []
};