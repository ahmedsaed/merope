---
project: _seed-sextant
version: 2.0.0
date: 2026-07-21
headline: The config format changed, and the old one is gone rather than deprecated.
breaking: true
draft: true
---

### Removed

- The v1 `.sextantrc` format. There is a codemod; there is not a fallback.

### Changed

- Rules are resolved per-directory, so a monorepo can disagree with itself.
