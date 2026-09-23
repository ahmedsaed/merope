---
project: 'peace'
version: '1.0.0+build.103'
date: 2026-08-13
headline: 'Peace 1.0.0 (build 103)'
breaking: false
draft: true
---

Install the APK below. It is signed with the release key, so it
upgrades an existing install in place — no uninstall, no data loss.
arm64 only: it will not run on an x86_64 emulator.

Commit: `a74c48a`
Android versionCode: `103`

### Changes

- Merge pull request #30 from ahmedsaed/feat/attachments
- Merge pull request #29 from ahmedsaed/feat/receipt-ocr
- fix: an invalid Gemini key is a 400, not a 401
- feat: read the receipt from the record screen, or straight from the + button
- feat: read a receipt with Gemini — the client, the key, the Settings card
- test: cover the button that answers "am I actually covered?"
