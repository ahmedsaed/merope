---
project: 'peace'
version: '1.10.0'
date: 2026-09-21
headline: 'Peace 1.10.0 (build 168)'
breaking: false
draft: true
---

Install the APK below. It is signed with the release key, so it
upgrades an existing install in place — no uninstall, no data loss.
arm64 only: it will not run on an x86_64 emulator.

Commit: `29e34e7`
Android versionCode: `168`

### Changes

- Merge pull request #48 from ahmedsaed/claude/entity-actions-redesign
- feat: hold a row in search, say why a delete sent you there, and ask about updates
- test: there is no form to cancel any more
- test: anchor the category scrolls instead of guessing the offset
- fix: say it where the tap was, and lift the FAB clear of it
- feat: one long press, one archive, one way to delete
