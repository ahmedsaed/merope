---
project: peace
version: 1.3.0
date: 2026-08-22
headline: Eight fixes to the reader after a week of real use — a cash withdrawal is a transfer, not an expense — and a relicence to GPL-3.0.
---

### Fixed

- **A withdrawal is a transfer.** Cash out of a machine has not been spent; it
  is spent later, one purchase at a time. Filing it as an expense counted it
  twice and left the cash account permanently empty. Both halves looked
  individually plausible, which is why it survived a glance.
- **Bank messages get a category.** The prompt never asked for one, so every
  bank record arrived uncategorised — which read as the model declining to
  guess, and was the app never putting the question.
- **The currency the message named is the currency entered.** The screen took
  its currency from the account and nothing else, so a correctly-read `USD 50.00`
  was saved as fifty pounds. Not displayed wrong — saved wrong.
- **The message survives a failed reading.** The app had the bank's own words,
  showed them in the grey row, and threw them away at the one moment they became
  permanent.

### Changed

- Relicensed under GPL-3.0, so anything distributed from this comes back rather
  than disappearing into a closed fork. The name and the icon stay reserved.
