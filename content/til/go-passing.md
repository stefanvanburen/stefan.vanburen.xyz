---
title: "Go Pass by Value or Pointer"
date: 2024-08-18T19:09:03-04:00
draft: false
---

I've long struggled with the choice of how to pass around Go values,
specifically structs.
I was happy to find [this article][1] on the topic,
specifically the conclusion,
reproduced here:

> 1. Types that are not structs or arrays should be passed by value.
> 1. Struct types that don’t export their members and are clearly built as immutable value types, like time.Time, should be passed by value. Note that these types are relatively rare, and are even rarer to be defined by you.
> 1. Arrays and all other struct types should be passed by pointer, whether small, large, stateful, or whatever.
> 1. If you’re passing data that could be mutated by a concurrent process and its important to you for that data not to be mutated, explicitly make a copy of it before passing it along. Be aware that you can’t just rely on passing the data by value since that does not create a deep copy.

I'll be referencing this moving forward,
and taking the guesswork out of my passing conventions.

[1]: https://blog.percywegmann.com/2023/09/20/go-pass-by-value-or-pointer.html
