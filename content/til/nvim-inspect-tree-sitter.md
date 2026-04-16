---
title: "Neovim :InspectTree Tree-sitter"
date: 2025-09-10T19:50:36-04:00
draft: false
---

I had assumed that to interact with Tree-sitter in Neovim,
you still needed to use the utilities from [nvim-treesitter][1].
Apparently that's not the case ---
Neovim has had a builtin [`:InspectTree`][2] command that brings up the AST from Tree-sitter in a split window,
which is [`scrollbound`][3] to the original window and highlights the selected node in both windows.

It also has a [query editor][4],
which I haven't yet had the need for,
but it's good to know it exists.

[1]: https://github.com/nvim-treesitter/nvim-treesitter
[2]: https://neovim.io/doc/user/treesitter.html#%3AInspectTree
[3]: https://neovim.io/doc/user/options.html#'scrollbind'
[4]: https://gpanders.com/blog/whats-new-in-neovim-0.10/#tree-sitter-query-editor
