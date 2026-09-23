---
project: 'peace'
version: '1.0.0+build.30'
date: 2026-08-10
headline: 'Peace 1.0.0 (build 30)'
breaking: false
draft: true
---

Install the APK below. It is signed with the release key, so it
upgrades an existing install in place — no uninstall, no data loss.
arm64 only: it will not run on an x86_64 emulator.

Commit: `2404af7`
Android versionCode: `30`

### Changes

- Merge pull request #5 from ahmedsaed/fix/release-artifact-output
- fix(ci): the release job could not see the artifact name
- Merge pull request #4 from ahmedsaed/feat/versioning-and-compact
- docs: Murabaha explains the charge-then-refund on the Kenana card
- feat: build identity, release automation, and a one-line record row
- Merge pull request #3 from ahmedsaed/feat/responsive-and-polish
- docs: record the credit-card decisions
- feat: split-screen layout, themed pickers, and picker polish
- Merge pull request #2 from ahmedsaed/feat/logo-and-drawer
- feat: app icon, side menu and search entry point
- Merge pull request #1 from ahmedsaed/ci/release-signing
- ci: install build-tools so the signing assertion can actually run
- ci: assert the release APK carries our certificate
- ci: commit ambient type references so typecheck works on a fresh checkout
- ci: pin @emnapi via overrides so npm ci resolves identically everywhere
- ci: pin Node via .nvmrc so npm ci accepts the lockfile
- build: sign releases with our own key; add PR CI
- feat: accounts and categories CRUD — Stage 1 complete
- feat: delete a record, with undo
- fix: allow future-dated records; match date/time button styling
