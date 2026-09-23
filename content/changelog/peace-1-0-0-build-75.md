---
project: 'peace'
version: '1.0.0+build.75'
date: 2026-08-12
headline: 'Peace 1.0.0 (build 75)'
breaking: false
draft: true
---

Install the APK below. It is signed with the release key, so it
upgrades an existing install in place — no uninstall, no data loss.
arm64 only: it will not run on an x86_64 emulator.

Commit: `c6521a7`
Android versionCode: `75`

### Changes

- Merge pull request #22 from ahmedsaed/feat/drive-backup
- refactor: rework Export & backup around what the screen is for
- feat: restore from Drive
- fix: a backup that worked reported itself as broken
- feat: back up to Google Drive
- fix: the CSV export called every refund income
