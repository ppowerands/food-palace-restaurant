const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00A8E8',
        accent: '#0096C7',
        gold: '#FFD60A',
        dark: '#1A1A2E'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0,168,232,0.08), 0 30px 60px rgba(0,0,0,0.12)'
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.slate.700'),
            a: {
              color: theme('colors.primary.600'),
              '&:hover': {
                color: theme('colors.primary.700')
              }
            },
            h1: {
              color: theme('colors.dark')
            },
            h2: {
              color: theme('colors.dark')
            },
            code: {
              color: theme('colors.indigo.600')
            }
          }
        },
        dark: {
          css: {
            color: theme('colors.slate.200'),
            a: {
              color: theme('colors.primary.300')
            },
            h1: {
              color: theme('colors.white')
            },
            h2: {
              color: theme('colors.white')
            },
            strong: {
              color: theme('colors.white')
            },
            code: {
              color: theme('colors.cyan.200')
            },
            blockquote: {
              borderLeftColor: theme('colors.primary.500')
            }
          }
        }
      }),
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans]
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
