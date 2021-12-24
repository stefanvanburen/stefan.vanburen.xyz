# [stefan.vanburen.xyz](https://stefan.vanburen.xyz)

The site is also deployed to [the gemini protocol](https://gemini.circumlunar.space) at [gemini://stefan.vanburen.xyz](gemini://stefan.vanburen.xyz).

Built with [hugo](https://github.com/gohugoio/hugo).

The code here is licensed under the [MIT License](./LICENSE).

The content is licensed as [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## Development

Most development tasks are automated in the [justfile](./justfile).
To use it, install [just](https://github.com/casey/just).

The CSS is linted with [`stylelint`](https://github.com/stylelint/stylelint),
using [`stylelint-config-standard`](https://github.com/stylelint/stylelint-config-standard).

To run the linter, run `just lint`.
