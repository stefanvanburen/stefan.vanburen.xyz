---
title: "Git Stash File(s)"
date: 2024-05-24T07:39:46-04:00
draft: false
---

This isn't something I'm just learning today,
but I've looked this up enough to warrant writing it down.

I'm often working on some code,
and come across something unrelated that I want to change.
So I do --- but it really doesn't belong in this commit or <abbr title="Pull Request">PR</abbr>/patch/etc.!

(I've yet to put in the reps to understand [worktrees][] or [jujutsu][],
which I'm assuming are the "real" answers here.)

For now, you can provide `git stash push` a filename (or multiple!) to come back to those changes later:

```console
$ git stash push <filename(s)>
```

I'm sure there's also a way to do this incrementally with `-p` or [Fugitive's][fugitive] interface.

📦

[worktrees]: https://git-scm.com/docs/git-worktree
[jujutsu]: https://martinvonz.github.io/jj
[fugitive]: https://github.com/tpope/vim-fugitive
