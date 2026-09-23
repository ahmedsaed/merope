---
project: 'peace'
version: '1.0.0+build.97'
date: 2026-08-13
headline: 'Peace 1.0.0 (build 97)'
breaking: false
draft: true
---

Install the APK below. It is signed with the release key, so it
upgrades an existing install in place — no uninstall, no data loss.
arm64 only: it will not run on an x86_64 emulator.

Commit: `c83728c`
Android versionCode: `97`

### Changes

- Merge pull request #28 from ahmedsaed/feat/attachments
- fix: draw the paperclip at the size its hole survives
- feat: a paperclip on records that carry a receipt
- refactor: drop the per-record attachment count nothing calls
- test: prove a container survives the round trip to Drive and back
- fix: the backup no longer claims any SQLite tool can open it
- fix: cap a photo's long edge, not its width
- feat: photograph a receipt while entering the record
- feat: a backup carries the files it refers to, not just the ledger
