---
title: git pull --autostash
date: "2020-05-13T19:11:09-04:00"
draft: false
---

I've recently moved from a largely merge commit based git workflow to a squash and merge based one.
Learning to flex my `git rebase` muscles has been refreshing, and I'm enjoying the cleaner `git log` that results.

As part of the workflow, I've changed my `git pull` to [default to rebasing on pull](https://github.com/stefanvanburen/dotfiles/commit/de0f57867ba3270212c02884ec1053e64158fa1b), rather than merging (the default).
The only thing that's rough about this workflow is whenever I have local changes, `git pull` will fail, telling me that I have unstaged changes:

```console
$ git pull
error: cannot pull with rebase: You have unstaged changes.
error: please commit or stash them.
```

To work around this, I'd typically do a compound shell command (I'm using `fish` - you would typically do this with `&&` in `bash`):

```console
$ git stash; and git pull; and git stash pop
Saved working directory and index state WIP on main: 79911a7 chore: Remove gemini
Already up to date.
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   content/blog/git-pull-autostash.md
        modified:   content/blog/small.md

no changes added to commit (use "git add" and/or "git commit -a")
Dropped refs/stash@{0} (2ecce561c9bbd9cf222848d4b225a49edb816bb2)
```

I recently discovered the solution to needing this: `git pull --autostash`!
It automatically stashes your current working directory and re-applies it after the pull.

```console
$ git pull --autostash
Created autostash: a14af18
Current branch master is up to date.
Applied autostash.
```

This option is so handy for my workflow that I [made an alias for it](https://github.com/stefanvanburen/dotfiles/commit/297733).

🥳
