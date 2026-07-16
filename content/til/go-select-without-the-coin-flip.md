---
title: 'Go `select` without the coin flip'
date: 2026-07-15T18:49:26-04:00
draft: false
---

In Go, it's common to wait on a condition via a channel while also respecting context cancellation.
A common idiom looks like:

```go
select {
case <-condition:
	return nil
case <-ctx.Done():
	return ctx.Err()
}
```

An issue with this is that if you'd prefer that `condition` (i.e., the non-error case) be treated with precedence, you're racing with `ctx.Done()`;
[`select` chooses a `case` at random when multiple cases are ready][1].

My coworker suggested a solution with a nested select within the `ctx.Done()` case to re-check `condition`:

```go
select {
case <-condition:
	return nil
case <-ctx.Done():
	// Re-check condition in case we raced above.
	select {
	case <-condition:
		return nil
	default:
		return ctx.Err()
	}
}
```

But I don't care for that nested select.
Looking at [this Go proposal](https://github.com/golang/go/issues/52637),
it looks like this is the best existing idiom,
but I'd love to know if there's a better way of solving this without the nested-`select` smell.

* * *

P.S.:
Vaguely related is the approach [bufbuild/buf's `thread.Parallelize` takes][2],
with a similar nested `select`.
Related PR: [bufbuild/buf#913](https://github.com/bufbuild/buf/pull/913).

[1]: https://go.dev/tour/concurrency/5#:~:text=It%20chooses%20one%20at%20random%20if%20multiple%20are%20ready.
[2]: https://github.com/bufbuild/buf/blob/efe167b22b3176a585992eb38a597dbc3c0c52ea/private/pkg/thread/thread.go#L86-L100
