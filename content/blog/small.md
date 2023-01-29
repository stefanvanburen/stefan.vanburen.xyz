---
title: small
date: "2020-07-29T19:24:11-04:00"
draft: false
---

I was browsing through my GitHub repositories the other day and noticed `small`, a CLI tool I started working on about two years ago to convert text.
I finally polished up the repo and [published it for all to see](https://github.com/stefanvanburen/small).

It's really not much, but it gave me a chance to think about the expected behaviors associated with a tool like `small`.
In particular, support for being piped (`$ command | small`) is a critical bit of playing nice with other UNIX-y tools.

Anyways, it was fun getting it out there.

```console
$ small -h
USAGE
  small [FLAGS] [TEXT...]
  command | small [FLAGS]

FLAGS
  -h         print this help message
  -l         list transform types
  -t=TYPE    specify transform type

$ small "here's some text!"
ʜᴇʀᴇ'ꜱ ꜱᴏᴍᴇ ᴛᴇxᴛ!

```

🤖
