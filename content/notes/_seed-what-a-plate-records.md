---
title: What a plate records
description: A photographic plate is a negative, and everything about this site's light theme follows from that one fact.
date: 2026-08-28
tags: [design, lore]
project: merope-dev
draft: true
---

The Henry brothers photographed the Pleiades in November 1885 with a 13-inch
refractor and found nebulosity nobody had ever seen through an eyepiece.

## The camera saw what the eye could not

That sentence is the whole reason this site has two themes rather than a light
mode and a dark mode.

```ts
const themes = ['plate', 'sky'] as const;
```

A plate is a negative. Stars come out dark on pale stock. So the light theme is
not a concession to daylight — it is the archive, and it is correct.
