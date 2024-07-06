---
title: "HTML datetime duration"
date: 2024-07-13T10:18:24-04:00
draft: false
---

Last week I learned that an HTML `datetime` attribute can [represent a duration][valid-datetime-values].

For example:

```html
<time datetime="PT4H18M3S">4 hours, 18 minutes and 3 seconds</time>
```

The syntax is an [ISO 8601 Duration][iso-8601].

[valid-datetime-values]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time#valid_datetime_values
[iso-8601]: https://en.wikipedia.org/wiki/ISO_8601#Durations
