---
project: 'pleione'
version: '2.6.2'
date: 2026-11-05
headline: "A smoke suite runs in each TV's real Chromium engine, and wrapped rows sit flush on engines without flex gap."
breaking: false
---

### Added

- A smoke suite that runs the app in the Chromium engines the supported TVs
  ship, from 53 to 120, on every tagged build.

### Fixed

- Wrapped rows of buttons and chips no longer indent their second line on
  the older TV engines that lack flexbox `gap`.
