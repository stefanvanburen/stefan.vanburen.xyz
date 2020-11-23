module.exports = {
  plugins: [
    require('tailwindcss'),
    require('postcss-dark-theme-class')({
      darkSelector: '[data-theme="dark"]',
      lightSelector: '[data-theme="light"]',
    }),
    require('autoprefixer')
  ]
};
