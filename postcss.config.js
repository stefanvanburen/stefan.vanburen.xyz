module.exports = {
  plugins: {
    // Removes unused CSS
    // https://github.com/FullHuman/purgecss/tree/master/packages/postcss-purgecss
    "@fullhuman/postcss-purgecss": {
      content: ["layouts/**/*.html"],
      // TODO: Audit this list
      whitelist: ["highlight", "pre", "code", "content", "h3", "h4", "ul", "li"]
    },
    // Add vendor prefixes for browsers
    // https://github.com/postcss/autoprefixer
    autoprefixer: {},
    // minifies css
    // https://cssnano.co/
    cssnano: { preset: "default" }
  }
};
