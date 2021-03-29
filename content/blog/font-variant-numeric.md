+++
title = "font-variant-numeric"
date = 2021-01-24T12:55:27-05:00
draft = false
+++

I was reminded of the `font-variant-numeric` CSS property by [Jim Nielsen, here](https://twitter.com/jimniels/status/1353081335347351552), and ended up [using it in a similar way](https://git.sr.ht/~svbn/svbn.me/commit/d6272469c9caf6b2286fa65cdef385f10e258642) for the dates on my [list of blog posts](/blog).

For context, without tabular-nums enabled, numbers on this site look like this:

<p style="font-size: var(--size-700)">
0123456789
</p>

And with it enabled, they look like this:

<p style="font-size: var(--size-700)" class="nums">
0123456789
</p>

At least on Apple platforms, where the system sans-serif font is [San Francisco](https://developer.apple.com/fonts/), the "0" and "1" characters have a little additional spacing, making them equal size to the rest of the digits.

Glad to get this changed - the previous look was somewhat off-putting, now that I look at it in comparison.
There are so many neat CSS properties nowadays for [all sorts of typographical situations](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant).
