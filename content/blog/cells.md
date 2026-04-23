---
title: "cells - a language server for CEL"
date: 2026-02-22T19:24:55-05:00
draft: false
---

This weekend, I built a [language server](https://microsoft.github.io/language-server-protocol/) for <a href="https://cel.dev"><abbr title="Common Expression Language">CEL</abbr></a> called [`cells`](https://github.com/stefanvanburen/cells).
It currently supports semantic highlighting, diagnostics, documentation on hover, signature help, references, document highlighting (for variable references), completion, and formatting.
<abbr title="Common Expression Language">CEL</abbr> is a pretty simple language,
so a language server for it doesn't really need to support things like go to definition or some of the other niceties that language servers typically support.
It only works on a single `.cel` file at a time,
which is a filetype currently supported only in neovim nightly but [will be supported in neovim 0.12](https://github.com/neovim/neovim/pull/37834).

Building this out, I brought over some of the ideas that I had integrated when I was building out some of the <a href="https://buf.build/docs/cli/editors-lsp/">Buf <abbr title="Language Server Protocol">LSP</abbr> server</a> at `$WORK`,
like that tests should have separate testdata files so that they could be independently verified by opening up an <abbr title="Language Server Protocol">LSP</abbr>-powered editor and taking a look at the files themselves.
On top of this, making the tests mostly table-based made it really simple for additional test cases to be added.

Of course, building this in a weekend took working with AI (using [`pi`](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent) and [`amp`](https://ampcode.com/)).
One thing I had in mind was trying out the other <abbr title="Language Server Protocol">LSP</abbr> "frameworks" in the go ecosystem;
unfortunately, most seem to be pretty unmaintained these days.
[`go.lsp.dev`](https://github.com/go-language-server) progress has [largely stalled](https://github.com/go-language-server/protocol/pull/52),
and [tliron/glsp](https://github.com/tliron/glsp) was the only other major contender,
which seemed to be in a similar state.

At the end of the day, the agent suggested that we ought to just borrow what charmbracelet had down with [`powernap`](https://github.com/charmbracelet/x/tree/main/powernap/pkg/lsp/protocol),
and vendor in the `gopls` protocol code while maintaining the license,
and then "write" our own <a href="https://www.jsonrpc.org/specification"><abbr title="JSON Remote Procedure Call">JSONRPC</abbr></a> server,
based on the [sourcegraph implementation](https://github.com/sourcegraph/jsonrpc2),
but without the legacy cruft.
I may end up upstreaming some of this approach to `buf lsp`.

I'm not sure how many other <abbr title="Language Server Protocol">LSP</abbr> features `cells` needs to be considered "complete",
although I'll continue to track <abbr title="Common Expression Language">CEL</abbr> language features (as it's still in a pre-1.0 state as a language),
and I'd like to add most of the <abbr title="Language Server Protocol">LSP</abbr> features as functionality in the <abbr title="Command-Line Interface">CLI</abbr>,
similar to <a href="https://go.dev/gopls/command-line"><code>gopls</code>' <abbr title="Command-Line Interface">CLI</abbr> interface</a>.

`cells` turned out to be a pretty perfect weekend project for working with agents:
<abbr title="Language Server Protocol">LSP</abbr> is [fairly well-specified](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/),
with existing patterns,
a tight feedback loop,
and a great [reference library in `cel-go`](https://github.com/google/cel-go).

Fun times to be building things. 👷‍♂️
