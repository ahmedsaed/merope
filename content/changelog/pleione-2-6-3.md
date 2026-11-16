---
project: 'pleione'
version: '2.6.3'
date: 2026-11-12
headline: 'Movies and Series no longer run older TVs out of memory, and their artwork fades in.'
breaking: false
---

### Changed

- Artwork in Movies and Series fades in once it has loaded instead of
  appearing all at once, and the previous title's artwork fades out as
  soon as you move to another one.

### Fixed

- Browsing Movies and Series on webOS 4 TVs no longer gets the app closed
  to free memory. The blurred poster behind a title without a backdrop
  used about 80 MB per page; it is now drawn as a soft wash that costs
  about 10 MB.
- A provider's artwork address can no longer add its own styles to the
  page.
