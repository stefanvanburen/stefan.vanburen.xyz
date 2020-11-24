// tailwind.config.js
module.exports = {
  purge: {
    // To enable purging in development, uncomment this
    // enabled: true,
    content: ['./layouts/**/*.html'],
  },
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
  corePlugins: {
    animation: false,
  }
}
