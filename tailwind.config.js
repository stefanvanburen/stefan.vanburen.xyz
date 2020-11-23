// tailwind.config.js
module.exports = {
  purge: [
     './layouts/**/*.html',
  ],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [
    require('@tailwindcss/custom-forms'),
  ],
}
