---
title: "Structured Concurrency"
date: 2026-08-25T20:28:21-04:00
draft: true
---

> Every time you write the statement `go` in a program, you should consider the question of how, and under what conditions, the goroutine you are about to start, will end.
{source="[Never start a goroutine without knowing how it will stop](https://dave.cheney.net/2016/12/22/never-start-a-goroutine-without-knowing-how-it-will-stop)"}

> So that's the history of goto. Now, how much of this applies to go statements? Well... basically, all of it! The analogy turns out to be shockingly exact.
{source="[Notes on structured concurrency, or: Go statement considered harmful](https://vorpus.org/blog/notes-on-structured-concurrency-or-go-statement-considered-harmful/#go-statement-considered-harmful)"}

In Go, an unstructured `go` is almost always an anti-pattern.
