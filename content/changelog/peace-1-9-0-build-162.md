---
project: 'peace'
version: '1.9.0+build.162'
date: 2026-09-20
headline: 'Peace 1.9.0 (build 162)'
breaking: false
draft: true
---

Install the APK below. It is signed with the release key, so it
upgrades an existing install in place — no uninstall, no data loss.
arm64 only: it will not run on an x86_64 emulator.

Commit: `56c0306`
Android versionCode: `162`

### Changes

- Merge pull request #47 from ahmedsaed/claude/backup-restore-tags-fix-9wl2zm
- chore: 1.9.0 — the rest of the Archived section
- test: reach a tab from Settings, and a button from its card
- ci: run the flows on a runner when there is no emulator to hand
- test: check every flow's testIDs without a device
- feat: delete what has been put away, once nothing points at it
- fix: an archived account still holds its money
- feat: put categories away, and bring any of the three back
