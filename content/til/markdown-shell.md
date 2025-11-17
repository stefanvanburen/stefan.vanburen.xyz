---
title: Shell in Markdown
date: "2022-01-28T16:23:20-05:00"
draft: false
---
For a long time,
I've used `commandline` as the name for the syntax of code fences in markdown whenever I've wanted to denote a shell command or session.

I've now realized that I've been using the wrong name,
and also that there are two separate scenarios to keep in mind:

* * *

The first scenario is one-off commands, which should use the syntax [`sh`, or `shell`](https://github.com/github/linguist/blob/73e2d735c3c26577fc89c1cb3f8342e5a8ff1d82/lib/linguist/languages.yml#L5602).
This would be showing something you'd enter directly at the command line.

For example:

```sh
brew install git
```

I leave out the [command prompt](https://en.wikipedia.org/wiki/Command-line_interface#Command_prompt),
because it's implied by the context that the line is to be entered in a command line.
Also, it helps with copy-paste.

* * *

The other scenario is showing a shell _session_,
which typically shows the command prompt, an entered command, and _the response to the command_.
In this instance I'd use the [`console`, or `sh-session`](https://github.com/github/linguist/blob/cddf7476af4c95d1572956ffc5c0cb84f7e431c5/lib/linguist/languages.yml#L5921) syntax.

For example:

```console
$ git st
?? content/til/markdown-shell.md
```

🐚
