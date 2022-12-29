/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/App.vue',
    './src/components/**/*.{js,vue,ts}',
    './src/layouts/**/*.vue',
    './src/pages/**/*.vue',
    './src/plugins/**/*.{js,ts}',
    './index.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/line-clamp'), require('tailwind-children')],
};
