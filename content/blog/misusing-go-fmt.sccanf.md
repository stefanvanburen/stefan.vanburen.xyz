+++
title = "Misusing go's `fmt.Sscanf`"
date = 2020-11-09T08:12:09-05:00
draft = false
+++
Recently I was building a new website in go at $work and needed to do some URL parsing to grab some expected parameters in the URL.
The URL was expected to look something like the following: `/path/:id1/:id2`, where I was trying to grab `id1` and `id2` out of the URL.

In the past, I've done something along the lines of:

```go
splitPath := strings.Split(r.URL.Path, "/")

// error handling, etc.

// splitPath is ["", "path", ":id1", ":id2"], 
// because of the way `strings.Split` works
id1 := splitPath[2]
id2 := splitPath[3]
```

However, I had come across the following code, from [the source code of builds.sr.ht](https://git.sr.ht/~sircmpwn/builds.sr.ht/tree/master/worker/http.go#L20):

```go
var (
  jobId int
  op    string
)
_, err := fmt.Sscanf(r.URL.Path, "/job/%d/%s", &jobId, &op)
```

`fmt.Sscanf`? Haven't seen that in use often! But it seemed like a great fit for the exact problem I was solving.

So, I tried it:

```go
var id1, id2 string
matchCount, err := fmt.Sscanf(r.URL.Path, "/path/%s/%s", &id1, &id2)
if err != nil {
    fmt.Printf("err: %s, match count: %d\n", err, matchCount)
    fmt.Printf("id1: %s, id2: %s", id1, id2)
} else {
    fmt.Printf("no err, id1: %s, id2: %s", id1, id2)
}
```

Here's a [slightly modified version on play.golang.org](https://play.golang.org/p/I3AtQCF_Wvv).

<details>
  <summary>Spoiler: here's the output.</summary>
  <samp>
  err: unexpected EOF, match count: 1<br>
  id1: abc/def, id2:
  </samp>
</details>

---

So, the first match hit by the scan, because it's `%s`, continues through the `/` character and picks up `id2`'s value as well, leaving nothing for `id2`.

So why did it work in the line of code shown above?

Because the `%d` format specifier only captures numeric characters, so the `/` character breaks up the scan.

I messed around with this approach for awhile, but ultimately gave up and went back to my approach using `strings.Split`.
But, it's a nice reminder that format strings in go can be used both for formatting output and for scanning input, even if there are some footguns attached.

🔫
