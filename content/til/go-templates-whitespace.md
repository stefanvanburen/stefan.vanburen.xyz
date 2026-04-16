---
title: Go Templates Whitespace
date: "2021-08-31T18:41:20-04:00"
draft: false
---

When writing HTML templates in Go, knowing about the [whitespace modifiers](https://pkg.go.dev/text/template#hdr-Text_and_spaces) is crucial for keeping both the templates and the output HTML looking good.

For example, if you had the following template, with `.SomeText` being `"foo"` and `.Something` being `true`:

```go-html-template
<a href="/posts">
  <span>
  {{ if .Something }}
  Text
  {{ else }}
  Image
  {{ end }}
  </span>
  {{ .SomeText }}
</a>
```

The actual output HTML would look something like:

```html
<a href="/posts"><span> Text </span> foo </a>
```

Which isn't what you want, because there's extra spaces --- both around "Text" and around "foo".

Instead, you could do:

```go-html-template
<a href="/posts">
  <span>
  {{ if .Something }}
  {{- Text -}}
  {{ else }}
  {{- Image -}}
  {{ end }}
  </span>
  {{- .SomeText -}}
</a>
```

to get

```html
<a href="/posts"><span>Text</span>foo</a>
```

Which makes both the source code and HTML nice and neat.
