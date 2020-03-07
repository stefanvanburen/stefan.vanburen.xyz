module.exports = {
  plugins: {
    // Removes unused CSS
    // https://github.com/FullHuman/purgecss/tree/master/packages/postcss-purgecss
    "@fullhuman/postcss-purgecss": {
      content: ["layouts/**/*.html"]
    },
    // Add vendor prefixes for browsers
    // https://github.com/postcss/autoprefixer
    autoprefixer: {},
    // minifies css
    // https://cssnano.co/
    cssnano: { preset: "default" }
  }
};
