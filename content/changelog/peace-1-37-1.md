---
project: 'peace'
version: '1.37.1'
date: 2026-10-23
breaking: false
---

### What's new

- Peace no longer slows to a crawl when it opens on a day a backup is due. Backups are now made in the background, so the app stays quick while one runs.

### Changes

- fix(backup): pack and seal natively so a due backup cannot stall the app (1.37.1)
