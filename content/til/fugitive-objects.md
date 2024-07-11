---
title: "GBrowse to another branch with Fugitive.vim"
date: 2024-07-11T08:28:24-04:00
draft: false
---

Last week, I watched a coworker bring up a file on a different branch using fugitive.vim's [:GBrowse][GBrowse] and I was floored:
almost daily I find myself using it to open the URL to a file to share (or a few lines).

However, much of the time I'm working on a different branch than the one I want to share,
and navigating to the same file on a different branch in the GitHub UI takes too many steps.
First, you realize you're on the wrong branch,
then you change branches,
then you have to navigate back to the file again.

I had always been vaguely aware of [`:h fugitive-object`][fugitive-object],
but had never put them to use.

The object you're looking for is `<branch>:%`, meaning:
bring up this file (`%`) on branch `<branch>`.

For example:

```vim
:GBrowse main:%
```

And of course, this just works with all of the [`:GBrowse` variants][GBrowse-variants].

[GBrowse]: https://github.com/tpope/vim-fugitive/blob/8c8cdf4405cb8bdb70dd9812a33bb52363a87dbc/doc/fugitive.txt#L254
[fugitive-object]: https://github.com/tpope/vim-fugitive/blob/8c8cdf4405cb8bdb70dd9812a33bb52363a87dbc/doc/fugitive.txt#L611
[GBrowse-variants]: https://github.com/tpope/vim-fugitive/blob/8c8cdf4405cb8bdb70dd9812a33bb52363a87dbc/doc/fugitive.txt#L264-L277
