---
title: "Go's fmt package Explicit Argument Indexes"
date: 2022-06-24T15:59:17-04:00
draft: false
---

Not sure how I hadn't seen this before:
in Go, you can specify the index of the format argument you want to use for each formatting verb.

Simply enough, from the [package docs](https://pkg.go.dev/fmt#hdr-Explicit_argument_indexes):

```go
fmt.Sprintf("%[2]d %[1]d\n", 11, 22) // => "22 11"
```

In the past, I've actually done something along the lines of:

```go
s := "test"
fmt.Sprintf("%s %s", s, s) // => "test test"
```

Instead, you can do:

```go
s := "test"
fmt.Sprintf("%[1]s %[1]s", s) // => "test test"
```

This came up today at $WORK while providing a table name to a constructed SQL query -
the table name needed to be supplied multiple times in an upsert, so we could simply do:

```go
query := fmt.Sprintf(`
INSERT INTO %[1]s (...) VALUES ($1, $2)
ON CONFLICT (...) DO UPDATE SET ... = %[1]s.(...) WHERE %[1]s.(...) = $2;
`, tableName)
```

Instead of needing to supply `tableName` three times,
it could be supplied once using `%[1]s`.
