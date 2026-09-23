---
project: 'peace'
version: '1.2.0+build.117'
date: 2026-08-13
headline: 'Peace 1.2.0 (build 117)'
breaking: false
draft: true
---

Install the APK below. It is signed with the release key, so it
upgrades an existing install in place — no uninstall, no data loss.
arm64 only: it will not run on an x86_64 emulator.

Commit: `fc5856f`
Android versionCode: `117`

### Changes

- Merge pull request #33 from ahmedsaed/feat/bank-notifications
- docs: 1.2.0 — the roadmap is complete
- fix: a captured message shows up on its own
- refactor: bank messages join the records list instead of a page
- chore: stop declaring two permissions the app never uses
- fix: say when messages are waiting on a missing key
- feat: read bank SMS notifications into records for approval
