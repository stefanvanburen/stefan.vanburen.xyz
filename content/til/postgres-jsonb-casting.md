---
title: PostgreSQL and jsonb type casts
date: "2022-01-19T18:30:21-05:00"
draft: false
---

Found a bug in one of our systems at work that deals with [jsonb data](https://www.postgresql.org/docs/current/datatype-json.html) stored in Postgres today.
The quick summary is that one of our systems was looking for the maximum numerical value of a jsonb integer in a table.

A very simplified example:

```postgresql
SELECT
  max(balances)
FROM
  unnest(ARRAY[
    '{"balance": 7}'::jsonb->>'balance',
    '{"balance": 17}'::jsonb->>'balance'
  ]) as balances
```

This returns `7`, because while the "balance" field is a numeric JSON value, the [`->>` operator](https://www.postgresql.org/docs/current/functions-json.html#FUNCTIONS-JSON-PROCESSING) turns the value into text! --- which makes the comparison a lexicographical one.

Instead, you need to make sure to [cast the values](https://www.postgresql.org/docs/current/sql-expressions.html#SQL-SYNTAX-TYPE-CASTS) before comparing:

```postgresql
SELECT
  max(balances)
FROM
  unnest(ARRAY[
    ('{"balance": 7}'::jsonb->>'balance')::integer,
    ('{"balance": 17}'::jsonb->>'balance')::integer
  ]) as balances
```

Which returns the expected `17`.
