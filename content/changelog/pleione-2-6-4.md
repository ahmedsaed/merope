---
project: 'pleione'
version: '2.6.4'
date: 2026-11-17
headline: 'Movies and Series show more categories at once, and long category names stay readable.'
breaking: false
---

### Changed

- Browse now loads ten category rows instead of six. It appears once the
  first four are ready, and the rest fill in below in order, so nothing
  already on screen moves.
- In All categories, each name gets two lines plus its title count. A name
  that still doesn't fit is shortened in the middle, so you keep both its
  start and its end, such as a trailing year or genre.
- The All categories button now sits at the start of the row.
