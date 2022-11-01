---
title: "Service Wrappers"
date: 2022-11-01T18:54:05-04:00
draft: false
---

TIL of [Service Wrappers](https://naildrivin5.com/blog/2022/10/31/wrap-third-party-apis-in-service-wrappers-to-simplify-your-code.html), a technique I've used in the past but have never had a name for. It's essentially an approach to wrapping external APIs. From the article:

> * Methods should be named in the language of the service, not the language of the app.
> * Arguments should use the domain of the service, not the domain of the app.
> * Arguments should be whatever type is directly needed by the service, so passing in complex stuff like Active Record should be avoided.
> * The return value should not be a complex object from the third party, but ideally only what data a caller will need (often nothing at all). If it must be a complex object, its name or properties should be in the domain of the service.

The article is written from a Rails perspective, but is broadly useful - always nice to have a name for something useful!
