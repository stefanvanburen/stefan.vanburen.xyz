---
title: "Wrapping arrays in jq"
date: 2025-08-20T08:55:08-04:00
draft: false
---

Riffing on [Tom MacWright's "Using super" post][1] from yesterday,
I saw the post and immediately thought of using [`jq`][2].

I thought I might get what he was looking for with my initial attempt, something like:

```console
$ pbpaste | jq '.[].name'
"ALGOLIA_API_KEY"
"AMAZON_AWS_ACCESS_KEY_ID"
```

... but that left out the wrapper array.
I figured I might need some other `jq` function or pipe,
but instead I found that you can just wrap the entire expression in square brackets to wrap the result:

```console
$ pbpaste | jq '[.[].name]'
"ALGOLIA_API_KEY"
"AMAZON_AWS_ACCESS_KEY_ID"
```

Regardless, `jq` feels worth the investment,
especially given [the community (and alternative implementations)][3] built up around it.

[1]: https://macwright.com/2025/08/19/using-super
[2]: https://jqlang.org
[3]: https://github.com/fiatjaf/awesome-jq
