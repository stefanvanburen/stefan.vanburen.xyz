const postcssimport = require("postcss-import");
const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = {
  plugins: [
    // parses `import()`s
    postcssimport(),
    // Removes unused CSS
    // https://github.com/FullHuman/purgecss/tree/master/packages/postcss-purgecss
    purgecss({
      content: ["./layouts/**/*.html"]
    })
  ]
};
