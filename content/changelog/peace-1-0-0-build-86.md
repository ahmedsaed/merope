---
project: 'peace'
version: '1.0.0+build.86'
date: 2026-08-13
headline: 'Peace 1.0.0 (build 86)'
breaking: false
draft: true
---

Install the APK below. It is signed with the release key, so it
upgrades an existing install in place — no uninstall, no data loss.
arm64 only: it will not run on an x86_64 emulator.

Commit: `97a3ffe`
Android versionCode: `86`

### Changes

- Merge pull request #26 from ahmedsaed/feat/repeat-inline
- fix: the drawer's backup age froze at app launch
- refactor: occurrences are independent, not a cursor walking forward
- feat: upcoming occurrences, and a rules list built like the records list
- refactor: set a repeat while entering the record, not on a page of its own
