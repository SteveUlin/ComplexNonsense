const { default: flattenColorPalette } = require('tailwindcss/lib/util/flattenColorPalette')
const svgToDataUri = require('mini-svg-data-uri')

module.exports = {
  content: [
    "./_site/**/*.{html,js}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        'hash-1': '#f44336',
        'hash-2': '#e91e63',
        'hash-3': '#9c27b0',
        'hash-4': '#673ab7',
        'hash-5': '#3f51b5',
        'hash-6': '#2196f3',
        'hash-7': '#03a9f4',
        'hash-8': '#00bcd4',
        'hash-9': '#009688',
        'hash-10': '#4caf50',
        'hash-11': '#8bc34a',
        'hash-12': '#cddc39',
        'hash-13': '#ffeb3b',
        'hash-14': '#ffc107',
        'hash-15': '#ff9800',
        'hash-16': '#ff5722',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'bg-grid': (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
        },
        { values: flattenColorPalette(theme('backgroundColor')), type: 'color' }
      )

      matchUtilities(
        {
          highlight: (value) => ({ boxShadow: `inset 0 1px 0 0 ${value}` }),
        },
        { values: flattenColorPalette(theme('backgroundColor')), type: 'color' }
      )
    }
  ],
}
