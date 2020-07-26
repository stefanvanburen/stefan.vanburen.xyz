const postcssimport = require("postcss-import");
const darkTheme = require("postcss-dark-theme-class");

module.exports = {
  plugins: [
    // parses `import()`s
    postcssimport(),
    darkTheme({
      darkSelector: '[data-theme="dark"]',
      lightSelector: '[data-theme="light"]',
    }),
  ],
};
