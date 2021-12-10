module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      zIndex: {
        '-1': '-1',
      },
      skew: {
        '45': '45deg'
      }
    },
    flexGrow: {
      '0':'0',
      '1':'1',
      '2': '1.3'
    },
    keyframes: {
      popIn: {
        '0.0%': {
          transform: 'scale(0)'
        },
        '60.1%': {
          transform: 'scale(1.5)'
        },
        '89.8%': {
          transform: 'scale(1)'
        }
      }
    },
    animation: {
      popIn: 'animation: popIn 0.5s ease 0s normal forward;'
    }
  },
  variants: {
    extend: {
      flexGrow: ['hover']
    },
  },
  plugins: [],
}
