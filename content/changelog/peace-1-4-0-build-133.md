---
project: 'peace'
version: '1.4.0+build.133'
date: 2026-09-01
headline: 'Peace 1.4.0 (build 133)'
breaking: false
draft: true
---

Install the APK below. It is signed with the release key, so it
upgrades an existing install in place — no uninstall, no data loss.
arm64 only: it will not run on an x86_64 emulator.

Commit: `b6ce273`
Android versionCode: `133`

### Changes

- chore: stop tracking generated gradle output from native modules
- Merge pull request #38 from ahmedsaed/claude/readme-marketing-rewrite-hgii3v
- fix: a reading fills the note in, it does not overwrite it
- Merge pull request #37 from ahmedsaed/claude/readme-marketing-rewrite-hgii3v
- chore: 1.4.0
- feat: hide every amount behind one tap in the header
- fix: open a picker on the selection, not at the top
- Merge pull request #36 from ahmedsaed/claude/readme-marketing-rewrite-hgii3v
- docs: rewrite the README as a product page, and relicense under GPL-3.0
- Merge pull request #35 from ahmedsaed/feat/reading-and-updates
- feat: what the reader keeps, and what the list shows
- Merge pull request #34 from ahmedsaed/fix/transient-gemini
- fix: ensure visibility of account reconciliation and deletion buttons in growing icon grid
- fix: the settings box holds the user's rules, not the app's wiring
- feat: editable prompts, the right card, and a redesigned Settings
- fix: a busy model must not burn the message
- Merge pull request #33 from ahmedsaed/feat/bank-notifications
- docs: 1.2.0 — the roadmap is complete
- fix: a captured message shows up on its own
- refactor: bank messages join the records list instead of a page
- chore: stop declaring two permissions the app never uses
- fix: say when messages are waiting on a missing key
- feat: read bank SMS notifications into records for approval
- Merge pull request #32 from ahmedsaed/chore/docs-and-1.1.0
- docs: regenerate the README screenshots
- docs: refresh the version examples for 1.1.0
- fix: the day heading was clipped by the total beside it
- feat: daily totals, and a setting deleted rather than wired
- Merge pull request #31 from ahmedsaed/feat/receipt-ocr
- fix: float the attach buttons, and let the strip scroll clear of them
- Merge pull request #30 from ahmedsaed/feat/attachments
- Merge pull request #29 from ahmedsaed/feat/receipt-ocr
- fix: an invalid Gemini key is a 400, not a 401
- feat: read the receipt from the record screen, or straight from the + button
- feat: read a receipt with Gemini — the client, the key, the Settings card
- test: cover the button that answers "am I actually covered?"
- Merge pull request #28 from ahmedsaed/feat/attachments
- fix: draw the paperclip at the size its hole survives
- feat: a paperclip on records that carry a receipt
- refactor: drop the per-record attachment count nothing calls
- test: prove a container survives the round trip to Drive and back
- fix: the backup no longer claims any SQLite tool can open it
- fix: cap a photo's long edge, not its width
- feat: photograph a receipt while entering the record
- feat: a backup carries the files it refers to, not just the ledger
- Merge pull request #27 from ahmedsaed/fix/sheet-keyboard
- fix: lift the repeat sheet above the keyboard
- Merge pull request #26 from ahmedsaed/feat/repeat-inline
- fix: the drawer's backup age froze at app launch
- refactor: occurrences are independent, not a cursor walking forward
- feat: upcoming occurrences, and a rules list built like the records list
- refactor: set a repeat while entering the record, not on a page of its own
- Merge pull request #25 from ahmedsaed/feat/background-backup
- feat: back up in the background, and say so in the drawer
- Merge pull request #24 from ahmedsaed/feat/recurring
- feat: recurring payments
- Merge pull request #23 from ahmedsaed/feat/portfolio
- feat: portfolio rebalancing
- Merge pull request #22 from ahmedsaed/feat/drive-backup
- refactor: rework Export & backup around what the screen is for
- feat: restore from Drive
- fix: a backup that worked reported itself as broken
- feat: back up to Google Drive
- fix: the CSV export called every refund income
- Merge pull request #21 from ahmedsaed/feat/refunds
- build: a fast E2E subset, and a measured no to GPU rendering
- feat: refunds, and a long-press menu on a record
- docs: record what the statement settled, and drop the statement view
- feat: paying a card fills in what it owes
- Merge pull request #20 from ahmedsaed/feat/credit-cards
- feat: foreign card purchases compute the rate and the card's fee
- feat: credit cards — owed balances, card fee profiles, balance corrections
- Merge pull request #19 from ahmedsaed/feat/carry-over
- refactor: fold the running total into the summary cell
- Merge pull request #18 from ahmedsaed/feat/carry-over
- feat: carry the balance forward, and no carry-over on budgets
- Merge pull request #17 from ahmedsaed/feat/analysis
- feat: analysis
- Merge pull request #16 from ahmedsaed/feat/budgets
- Merge pull request #15 from ahmedsaed/feat/readme-shots
- docs: screenshots in the README, generated rather than taken
- Merge pull request #14 from ahmedsaed/feat/budgets
- build: regenerate the README screenshots from a flow
- feat: budgets
- Merge pull request #13 from ahmedsaed/feat/search
- refactor(icon): make "chrome is not pickable" structural
- feat: search across the whole ledger
- Merge pull request #11 from ahmedsaed/feat/multi-currency
- feat: pick the currency, fetch the rate, and give the amount its own block
- Merge pull request #12 from ahmedsaed/feat/wordmark-font
- feat: set the Peace wordmark in Pacifico, and say what the app does differently
- feat: multi-currency
- Merge pull request #10 from ahmedsaed/feat/restore-backup
- feat: restore from a backup, with an undo
- Merge pull request #9 from ahmedsaed/fix/local-save-and-bom
- fix: save exports to a folder, and drop the CSV byte-order mark
- Merge pull request #8 from ahmedsaed/feat/export-backup
- fix(ci): lockfile rejected by CI but accepted locally
- feat: export CSV and back up the database
- Merge pull request #7 from ahmedsaed/feat/settings-screen
- feat: settings screen — home currency and default account
- Merge pull request #6 from ahmedsaed/feat/one-handed-keypad
- feat: drive the whole record screen from the keypad
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
