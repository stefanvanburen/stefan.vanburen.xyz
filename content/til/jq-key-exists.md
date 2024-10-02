---
title: Use jq to see if a JSON key exists
date: "2021-04-22T11:11:03-04:00"
draft: false
---

I'm constantly using [`jq`](https://stedolan.github.io/jq/) to deal with JSON via the CLI.

Today I needed to figure out the difference between a key existing with a `null` value or not existing at all in a bit of JSON.

By default, "querying" a key via `jq` will return `null` whether the key exists and is `null`, **or** the key doesn't exist:

```fish
△ # NOTE: the following is in fish, but should be straightforward to port to other shells

△ set json '{"test": null}'

△ echo $json | jq .test
null

△ echo $json | jq .nonexistent
null
```

Instead, you can use the `jq`'s [`has`](https://stedolan.github.io/jq/manual/#has(key)) function to determine the difference:

```fish
△ echo $json | jq 'has("test")'
true

△ echo $json | jq 'has("nonexistent")'
false
```
