/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    colors: {
      'primary-color': '#124559',
      'secondary-color': '#E8EBE4',
      'color-accent': '#ffa630',
      'dark-color': '#01161e',
    },

    fontFamily: {
      'primary-font': ['Lato', 'sans-serif'],
      'secondary-font': ['Merriweather Sans', 'sans-serif'],
    },
    extend: {},
  },
  plugins: [],
}

