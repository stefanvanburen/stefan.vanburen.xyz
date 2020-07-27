---
title: "git pull --autostash"
date: 2020-05-13T19:11:09-04:00
draft: false
---
I've recently moved from a largely merge commit based git workflow to a squash and merge based one.
Learning to flex my <kbd>git rebase</kbd> muscles has been refreshing, and I'm enjoying the cleaner <kbd>git log</kbd> that results.

As part of the workflow, I've changed my <kbd>git pull</kbd> to [default to rebasing on pull](https://github.com/svanburen/dotfiles/commit/de0f57867ba3270212c02884ec1053e64158fa1b), rather than merging (the default).
The only thing that's rough about this workflow is whenever I have local changes, <kbd>git pull</kbd> will fail, telling me that I have unstaged changes:

<pre>
▵ <kbd>git pull</kbd>
<samp>error: cannot pull with rebase: You have unstaged changes.
error: please commit or stash them.</samp>
</pre>

To work around this, I'd typically do a compound shell command (I'm using <kbd>fish</kbd> - you would typically do this with <kbd>&&</kbd> in <kbd>bash</kbd>):

<pre>
▵ <kbd>git stash; and git pull; and git stash pop</kbd>
</pre>

I recently discovered the solution to needing this: <kbd>git pull -\-autostash</kbd>!
It automatically stashes your current working directory and re-applies it after the pull.

<pre>
▵ <kbd>git pull --autostash</kbd>
<samp>Created autostash: a14af18
Current branch master is up to date.
Applied autostash.</samp>
</pre>

This option is so handy for my workflow that I [made an alias for it](https://github.com/svanburen/dotfiles/commit/297733).

🥳
