---
title: "Neovim :Inspect"
date: 2026-01-10T16:26:47-05:00
draft: false
---

Yesterday, I was working on [improving `buf`'s lsp protobuf semantic tokens][1],
and needed to test out how my changes were working in a real <abbr title="Language Server Protocol">LSP</abbr> client.

I knew neovim had a couple of helper functions for inspecting the current position;
first I tried:

```vim
:lua vim.print(vim.inspect_pos())
```

I figured there must be a function more specifically for semantic tokens:

```vim
:lua vim.print(vim.lsp.semantic_tokens.get_at_pos())
```

But finally I landed on:

```vim
:Inspect
```

([neovim docs](https://neovim.io/doc/user/lua.html#%3AInspect%21))

which prints both treesitter and semantic tokens,
but in a much cleaner way than the two lua functions.

I've [keymapped the underlying `vim.show_pos()` function to `<leader>i` in neovim][2] for easier access.

[1]: https://github.com/bufbuild/buf/pull/4270
[2]: https://github.com/stefanvanburen/dotfiles/commit/7dadb128015d37030f7b3b55b1e849b2873e499b
