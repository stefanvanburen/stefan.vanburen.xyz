---
title: "PSA: Include full article content in feeds"
date: 2026-07-31T19:36:00-04:00
draft: false
---

I recently learned that NetNewsWire supports [opting-in individual feeds to "always use reader view"][nnw-reader-individual],
so I've been noticing more closely which of my feeds provide the full content of their feeds versus just a summary,
and opting in the latter to that setting where it makes sense.
(Annoyingly, this setting doesn't seem to sync across NetNewsWire macOS and iOS, oh well!)

Really, this is a PSA:
if you're a feed author,
you ought to **include the [full content of the article in your feed][nnw-full-text]**,
_especially_ if you're writing a blog.
Readers generally prefer being able to read all of the content in their feed reader than going to your site,
or using a feed content extractor (which isn't guaranteed to work and takes extra time to run and server resources).
Sure --- call out that your site has a beautiful design and typography if they'd rather read on your site,
but include the full content so the reader can make that choice.

If you're using Atom feeds, you're in luck:
the `content` element should already be used for the full article content.
For RSS, one option is shoving the full content into the [`description` element][rss-description],
instead of a summary of the content.
The other option I've seen documented is leaving the `description` as the summary,
and providing a [`content:encoded`][rss-content-encoded] with the full content.
Generally, though, [prefer the former][rss-content-encoded-prefer]:

> Publishers who employ summaries SHOULD store the summary in description and the full content in content:encoded,
> ordering description first within the item.
> **On items with no summary, the full content SHOULD be stored in description.**

(Emphasis mine.)

Unfortunately, this doesn't seem to be the default in several popular SSGs, like [Hugo][],
which [flipped from content → summary way back in 2017][hugo-content-to-summary]
and is still trying to figure out how to [enable full content][hugo-full-content-option] without an override template.
(Hugo also doesn't have Atom support yet, although they're [working on it][hugo-atom].)
If you need a reference override template,
feel free to pull from [my custom Atom feed](https://git.sr.ht/~svbn/stefan.vanburen.xyz/tree/main/item/layouts/list.atom.xml),
and if you need a reference on `content:encoded`,
[gohugoio/hugo#4242](https://github.com/gohugoio/hugo/issues/4242) may be useful.
I haven't checked other SSGs,
but I imagine that others might also need to flip a configuration setting or need a similar override.

Your readers will thank you. 📖

[hugo]: https://gohugo.io
[hugo-content-to-summary]: https://github.com/gohugoio/hugo/releases/tag/v0.20
[hugo-atom]: https://github.com/gohugoio/hugo/issues/13565
[hugo-full-content-option]: https://github.com/gohugoio/hugo/issues/4071
[nnw-reader-individual]: https://netnewswire.com/frequently-asked-questions.html#:~:text=How%20do%20I%20turn%20on%20the%20Reader%20view%20for%20individual%20feeds?
[nnw-full-text]: https://netnewswire.com/frequently-asked-questions.html#:~:text=If%20a%20feed%20provides%20full%20text%2C%20there’s%20no%20need%20to%20use%20the%20Reader%20view
[rss-description]: https://www.rssboard.org/rss-profile#element-channel-item-description
[rss-content-encoded]: https://www.rssboard.org/rss-profile#namespace-elements-content-encoded
[rss-content-encoded-prefer]: https://www.rssboard.org/rss-profile#:~:text=Publishers%20who%20employ,stored%20in%20description.
