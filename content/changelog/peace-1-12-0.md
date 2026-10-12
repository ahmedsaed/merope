---
project: 'peace'
version: '1.12.0'
date: 2026-10-07
breaking: false
---

### Changes

- docs: a row of Penny in the README, and npm run shots:penny to regenerate it
- feat(assistant): Penny's coin is the cursor, and the label says what is happening now
- test(assistant): live flows return to Penny before attaching, and back out of the folder picker
- docs: Penny in the features, and in the list of everything that talks to Google
- feat(assistant): the assistant is called Penny
- feat(assistant): attach receipts and invoices, save reports, richer reports, retries
- feat(assistant): replies stream in, the dots say what is happening, and a real new-chat icon
- chore: npm run demo:ledger — a year of invented data, restorable as a backup
- fix(assistant): an expired card does not leave the composer asking for an answer
- fix(assistant): what the device runs showed, and E2E flows with and without a key
- test(assistant): a live suite against the real Gemini API, skipped without a key
- feat(assistant): the chat screen, its charts, cards and settings
- feat(assistant): the engine — tools over the ledger, cited figures, approval-gated writes
