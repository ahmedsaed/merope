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

### Why the toggle says so

Two words rather than two icons, because a sun and a moon would claim these are
light and dark modes, which is the one thing they are not.

## What the archive kept

Between 1885 and 1888 the Henrys' plates and Isaac Roberts' revealed the full
complexity of the nebulae around the cluster.

## Notes & asides

A heading with an ampersand, kept deliberately: the contents list slugs it with
the same slugger that generates the anchor, so the two agree.
