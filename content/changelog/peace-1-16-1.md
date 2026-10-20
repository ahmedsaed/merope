---
project: 'peace'
version: '1.16.1'
date: 2026-10-13
breaking: false
---

### Changes

- fix(ui): sheets and snackbars clear the three-button navigation bar
- ci(e2e): run Maestro from one script line, or the workflow never reaches a flow
- test(e2e): one record lifecycle flow instead of three that each logged it first
- test: share DB fixtures, drop tests that only re-proved another, and stop sleeping
