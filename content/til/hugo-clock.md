---
title: "`hugo --clock`"
date: 2026-08-25T14:14:43-04:00
draft: false
---

I [use `hugo` as my SSG](/colophon).

[`hugo`][hugo] has a `--clock` flag that lets you set the clock
(using a starting [RFC 3339][rfc-3339] formatted timestamp)
that the CLI uses for its commands.
For example,
I can run:

```console
$ hugo server --clock 2026-07-01T12:00:00-04:00
...
 Pages            │ 71
...
Change detected, rebuilding site (#1).
2026-07-01 12:00:49.515 -0400
```

To start the server with the clock at noon on July 1st, 2026, EDT.

However!
Using this flag will _exclude_ posts that are dated after that timestamp,
so you'll want to add `--buildFuture` to avoid this:

```console
$ hugo server --clock 2026-07-01T12:00:00-04:00 --buildFuture
...
 Pages            │ 74
...
Change detected, rebuilding site (#1).
2026-07-01 12:00:49.515 -0400
```

I'm currently using this to test out the various ["seasons"](/blog/small-seasons) on my site,
and for testing the monthly [rotating emojis][rotating-emojis] on my homepage.

[hugo]: https://gohugo.io/commands/hugo/
[rotating-emojis]: https://git.sr.ht/~svbn/stefan.vanburen.xyz/tree/8a5f75989b70562ce9708c0a1bebb9f44a1fbc94/item/layouts/home.html?view-source#L3-22
[rfc-3339]: https://www.rfc-editor.org/info/rfc3339/#section-5.6
