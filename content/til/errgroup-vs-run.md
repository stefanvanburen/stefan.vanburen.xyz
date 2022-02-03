---
title: run vs errgroup
date: "2021-05-11T10:38:26-04:00"
draft: false
---

I typically don't do much with concurrency in Go, but messed around this morning with both [oklog/run](https://github.com/oklog/run) and [sync/errgroup](https://golang.org/x/sync/errgroup).

I've defaulted to using oklog/run in the past, but I realized that while they have similar interfaces, they're useful for different things:

* oklog/run is useful for long-running processes.
  * think starting up http servers alongside other components, and waiting for one to finish, in which case all other components are signalled to finish.
* sync/errgroup is useful for short-lived, parallel processes.
  * think units of work to be done in parallel, where one process resulting in an error should stop the entire computation.
