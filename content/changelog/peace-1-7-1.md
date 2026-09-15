---
project: peace
version: 1.7.1
date: 2026-09-02
headline: The Now card explains itself and splits by time as well as by account, and a loan stops being filed as a card.
---

### Added

- **Now explains itself.** The header's running position reconciles exactly with
  the Accounts total, and the card now shows the working rather than asking you
  to trust the number.
- The breakdown splits by time as well as by account.

### Fixed

- A loan is not a credit card. It was being drawn as one, with a credit limit it
  does not have.
