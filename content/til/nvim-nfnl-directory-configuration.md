---
title: "Neovim nfnl Directory Configuration"
date: 2024-05-31T08:16:19-04:00
draft: true
---

I've long wanted to figure out how to get [`nfnl's` directory-local configuration][1] working,
but it took me until yesterday to figure it out ---
mostly by [opening a discussion][2] and then realizing my mistakes. 🤡

First, `exrc` needs to be [enabled][3].
This will ultimately load the contents of the generated `.nvim.lua` file,
as described in [`:help 'exrc'`][4]

Next, create an `.nfnl.fnl` file in the directory.
I've been creating mine as:

```fennel
{:source-file-patterns [:.nvim.fnl]}
```

... which means that `nfnl` only needs to compile the `.nvim.fnl` file into `.nvim.lua`.

From there, I create a `.nvim.fnl` file with my configuration.
Often this is to set up a particular project-local formatter or linter with conform or nvim-lint,
so it may look something like:

```fennel
(let [conform (require :conform)]
  (set conform.formatters_by_ft.json [:prettier]))
```

With this I've been able to [remove a few $WORK specific formatters][6].

Lastly, I've [globally gitignored][5] these files so they aren't accidentally committed.
It's possible to commit the `.nvim.lua` files to share with other neovim users that have `exrc` enabled,
but I doubt I'll use that very often ---
I'm still undecided on if I'll commit these for my personal projects.

📁

[1]: https://github.com/olical/nfnl?tab=readme-ov-file#directory-local-neovim-configuration-in-fennel
[2]: https://github.com/Olical/nfnl/discussions/41
[3]: https://github.com/stefanvanburen/dotfiles/commit/beed66f9a0a872f2a0db07b0e2de36ad262e4649
[4]: https://neovim.io/doc/user/options.html#'exrc'
[5]: https://github.com/stefanvanburen/dotfiles/commit/1d740e2a0337678eb6084e4c97cd0a096ea46a71
[6]: https://github.com/stefanvanburen/dotfiles/commit/b7ab7019510c4554e5eb432996bb8378d9e9bd44
