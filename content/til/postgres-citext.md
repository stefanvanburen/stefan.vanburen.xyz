---
title: "Postgres citext type"
date: 2024-08-21T07:49:04-04:00
draft: false
---

TIL about the Postgres `citext` type (that is, [case-insensitive text type][1]),
from reading [this schema][2].

Based on this tip from the Postgres docs,
this might not be the right type for general text:

> Consider using nondeterministic collations (see [Section 24.2.2.4][3]) instead of this module.
> They can be used for case-insensitive comparisons,
> accent-insensitive comparisons,
> and other combinations,
> and they handle more Unicode special cases correctly.

... but if you're storing something like a username or email address that's already limited to an ascii-ish character set,
and want to keep things unique on a case-insensitive basis,
it might be what you're looking for.

[1]: https://www.postgresql.org/docs/current/citext.html
[2]: https://github.com/surprisetalk/ding/blob/main/db.sql#L18-L19
[3]: https://www.postgresql.org/docs/current/collation.html#COLLATION-NONDETERMINISTIC
