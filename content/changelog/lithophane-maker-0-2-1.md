---
project: 'lithophane-maker'
version: '0.2.1'
date: 2026-10-28
headline: 'Looser default fits, after the first full cube needed too much force to assemble.'
breaking: false
---

### Changes

- **Groove clearance 0.20 → 0.25 mm** and **peg clearance 0.10 → 0.15 mm.** The test pieces fit well at the old values, but a full cube binds more: panels slide along 81 mm grooves instead of 15 mm, tall posts bow slightly, and the lid seats four pegs at once. At the old values the parts went together only with real force, and a lid peg snapped.
- The frame grows 0.05 mm with the groove clearance (14.45 mm).
- **The printing guide and the test-piece instructions** now say to pick the best-fitting test piece, then go **one step (0.05 mm) looser** for the full cube.

### Upgrading a cube printed with v0.2.0

If the lid is too tight, reprint just the lid at the new defaults: it fits a v0.2.0 frame and panels. The post holes don't move; the only difference is that the lid sits 0.05 mm higher, well within print tolerance. Looser panel grooves need a new frame.
