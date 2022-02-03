---
title: Go's package fmt %q verb for strings
date: "2021-09-23T10:00:45-04:00"
draft: false
---
I wasn't aware of the Go `fmt` package `%q` verb, for quoting strings.
Typically, I've been escaping the quotes manually and using the `%s` verb:

```go
fmt.Sprintf("this needs quoting: \"%s\"", "input")
```

But the `%q` verb obviates the need for that manual quoting.

From the [package documentation](https://pkg.go.dev/fmt@go1.17):

> %s    the uninterpreted bytes of the string or slice
>
> %q    a double-quoted string safely escaped with Go syntax

And a quick example (on the [Go Playground](https://play.golang.org/p/w-DfnVMSi_k)):

```go
package main

import (
	"fmt"
)

func main() {
	test := "I'm a test string"

	fmt.Printf("\"%s\"", test)
	// Output: "I'm a test string"
	fmt.Println()
	fmt.Printf("%q", test)
	// Output: "I'm a test string"
}

```
