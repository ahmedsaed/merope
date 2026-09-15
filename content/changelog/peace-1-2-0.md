---
project: peace
version: 1.2.0
date: 2026-08-13
headline: Bank notifications read into records for approval, editable prompts, and a Settings screen that holds your rules rather than the app's wiring.
---

### Added

- **Bank alerts captured and offered as records to approve,** never written
  behind your back. Android hands over the notification your messaging app
  already showed — the same text you read off a lock screen. No `READ_SMS`, no
  conversation history, and the sender list starts empty.
- The finance half of each prompt is yours to edit, so "the card ending 0042 is
  Kenana" resolves against your real accounts.

### Changed

- Captured messages join the records list instead of living on a page of their
  own.
- Two permissions the app never used are no longer declared.

### Fixed

- A busy model no longer burns the message it failed to read.
- The app says when messages are waiting on a key you have not supplied.
