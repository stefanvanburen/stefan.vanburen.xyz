---
title: "time.Ticker in Go"
date: 2021-05-21T20:25:49-04:00
draft: true
---

The [`time.Ticker`](https://golang.org/pkg/time/#Ticker) type in Go is incredibly useful for situations in which polling is needed.

The easiest way to use the Ticker is via the [`time.Tick`](https://golang.org/pkg/time/#example_Sleep) function, which just provides access to the ticking channel, which makes it easy to `range` over:

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	for currentTime := range time.Tick(time.Second) {
		fmt.Println("current time: ", currentTime)
	}
}
```

For more control, [`time.NewTicker`](https://golang.org/pkg/time/#NewTicker) works wonders - there's no better example than the one [from the docs](https://play.golang.org/p/nG23A6LEd19)!
