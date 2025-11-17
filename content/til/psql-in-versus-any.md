---
title: PostgreSQL IN versus ANY
date: "2022-01-11T08:40:46-05:00"
draft: false
---

I still feel rather new to PostgreSQL,
and a few times now in Go I've tried to do something along the lines of:

```go
type pgdb struct {
	db *sql.DB
}

func (db *pgdb) getEntityByID(ctx context.Context, ids []string) ([]Entity, error) {
	query := "SELECT * FROM entities WHERE entities.id IN ($1)"

	rows, err := db.db.QueryContext(ctx, query, pq.StringArray(ids))
	/// ...
}
```

But the query would always fail or retrieve no rows.
I've always fixed it by switching the `IN $1` for a `= ANY($1)`,
but never quite understood why.

Researching this a bit more today,
I realized that the [`IN`] function takes a list of literals,
whereas [`ANY`] is an array function that takes a single array literal.
Thus, when I'm passing a `pq.StringArray`, it only works with the array function.

* * *

I found this out going through [lib/pq](https://github.com/lib/pq)'s issues,
finding [this issue](https://github.com/lib/pq/issues/600) with [this comment](https://github.com/lib/pq/issues/600#issuecomment-294143990) explaining the difference quite well,
which also pointed to a [simpler case](https://github.com/lib/pq/issues/515) where [this comment](https://github.com/lib/pq/issues/515#issuecomment-252393112) cleared things up for me.

[`IN`]: https://www.postgresql.org/docs/current/functions-comparisons.html#FUNCTIONS-COMPARISONS-IN-SCALAR
[`ANY`]: https://www.postgresql.org/docs/current/functions-comparisons.html#id-1.5.8.30.16
