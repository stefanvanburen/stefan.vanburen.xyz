---
title: Now
description: What I'm up to, now
---
<!-- Remember to update "Last updated"!-->
Change is imminent!

👶

<p>
  <small>
    Last updated: <time datetime="2025-02-23">February 23rd, 2025</time>
  </small>
</p>

<p>
  <small class="text-sm text-grey">
    Based on <a href="https://nownownow.com/">nownownow.com</a>.
  </small>
</p>

{{ $image := resources.GetRemote "https://media.tate.org.uk/art/images/work/N/N01/N01615_10.jpg" }}
{{ with $image }}
<img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}">
{{ end }}