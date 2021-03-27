+++
title = "Hiccup Makes Writing HTML Fun"
date = 2021-03-21T19:48:36-04:00
description = "A discussion on writing Hiccup syntax"
draft = false
+++
At $work, I've been writing a web application that is server-side rendered via Go's `html/template` package.

I've been writing a toy application in Clojure with a similar approach: server rendered HTML with [Tailwind](https://tailwindcss.com) for styling and [AlpineJS](https://github.com/alpinejs/alpine) for a hint of interactivity.

With the introduction of Go's new `embed` package in 1.16, I was tempted to port the application to Go.
I was imagining being able to embed the templates and assets in a static binary.

And I could still do that!
But I hesitated as soon as I reached the portion of rewriting my templates in Go, and for good reason: Go's template syntax isn't great, and Clojure has Hiccup.

## Hiccup

[Hiccup](https://github.com/weavejester/hiccup) is a library for writing HTML in Clojure.
Writing HTML in Hiccup is a *dream*:

* Unlike HTML, Hiccup automatically closes tags.
* Hiccup doesn't require that you remember the proper way to close an HTML element.
* Hiccup has shortcuts for adding an `id` or `class` attributes.

And, more than anything, Hiccup is written **within** your regular Clojure functions, which makes it incredibly easy to interweave logic with your templates.

A `<form>` in Hiccup might look like this:

```clojure
[:form {:action "/add-address"
        :method "POST"}
  [:label {:for "label-input"} "Label"]
  [:input {:type "text"
           :id "label-input"
           :name "label"
           ;; for now, label is required
           :required true}]

  [:label {:for "street-input"} "Street"]
  [:input {:type "text"
           :id "street-input"
           :name "street"}]

  [:label {:for "city-input"} "City"]
  [:input {:type "text"
           :id "city-input"
           :name "city"}]

  [:label {:for "state-input"} "State"]
  [:input {:type "text"
           :id "state-input"
           :name "state"}]]
;; …
```

The beauty begins when you start to weave in the logic:

```clojure
(def disabled-classes "text-gray-500 …")

(defn button
  [id classes disabled?]
  [:button {:id id
            :class (if disabled?
                     (merge classes disabled-classes)
                     classes)
            :disabled disabled?}])
```

In this way, Hiccup is similar to the JSX syntax while writing React — and this approach has been taken to the ClojureScript side via the [Reagent](https://github.com/reagent-project/reagent) library.
(A more thorough example of Reagent-style Hiccup code can be found in my [seven-guis](https://github.com/svanburen/seven-guis/blob/main/src/app/main.cljs) project).

And, when you pair Hiccup with [Parinfer](http://shaunlebron.github.io/parinfer/) + [Conjure](https://github.com/Olical/conjure), the DX is too good to pass up.
While I love writing Go, the conciseness, simplicity and the REPL of Clojure have drawn me in.
It's magical.

🪄
