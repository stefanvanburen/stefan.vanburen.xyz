---
title: "SQLite Connection Configuration"
date: 2022-04-02T10:54:44-04:00
draft: false
---

These notes are basically cribbed from Ben Johnson's excellent "Building Production Applications Using Go & SQLite" GopherCon talk,
specifically the ["Configuring SQLite" section](https://youtu.be/XcAYkriuQ1o?t=430).

Generally speaking, you'll want to set three `PRAGMA`s on each SQLite connection:

```sql
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;
```

In turn,

* [`PRAGMA journal_mode = WAL;`][pragma-journal-mode] sets the database into [WAL journaling mode](https://sqlite.org/wal.html#activating_and_configuring_wal_mode).
  Unlike the others,
  this doesn't necessarily need to be set on each connection;
  once a database is in WAL mode [it'll stay in that mode across database connections](https://sqlite.org/wal.html#persistence_of_wal_mode).
  WAL journaling mode is recommended for most SQLite server applications,
  because it makes writers not block readers.

* [`PRAGMA busy_timeout = 5000;`][pragma-busy-timeout] sets the [busy_timeout](https://sqlite.org/c3ref/busy_timeout.html) to 5000 milliseconds (5 seconds).
  Without this setting,
  if a write transaction is running,
  and another write transaction starts,
  the second write transaction will fail immediately.

* [`PRAGMA foreign_keys = ON;`][pragma-foreign-keys] turns on SQLite's [foreign key support](https://sqlite.org/foreignkeys.html).
  Foreign Keys aren't enabled by default in SQLite for historical reasons,
  but foreign keys are great for maintaining data integrity.
  So -- use them!

[pragma-journal-mode]: https://sqlite.org/pragma.html#pragma_journal_mode
[pragma-foreign-keys]: https://sqlite.org/pragma.html#pragma_foreign_keys
[pragma-busy-timeout]: https://sqlite.org/pragma.html#pragma_busy_timeout

* * *

<ins datetime="2024-06-30">
  Update(2024-06-30): A more complete discussion of these settings and more can be found over at
  <a href="https://kerkour.com/sqlite-for-servers">kerkour.com/sqlite-for-servers</a>
</ins>
