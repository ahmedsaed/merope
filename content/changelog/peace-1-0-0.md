---
project: peace
version: 1.0.0
date: 2026-08-10
headline: First light. The whole ledger in one version — keypad entry, budgets, analysis, credit cards, refunds, backups, receipts and recurring payments.
---

The version stayed at 1.0.0 for seventy-five builds while the app was built, so
this is less a release than the shape of the thing when it was first worth
installing.

### Added

- **Recording** — a calculator keypad, two-tier categories, transfers written as
  one atomic pair, refunds that net against the purchase they reverse, and
  multi-currency with the rate stored per record.
- **Making sense of it** — records grouped by day and netted, a category ring
  with a ranked breakdown, budgets suggested from what you actually spend,
  free-text search with a total, and balances derived from the ledger rather
  than stored.
- **Credit cards** as money owed rather than an emptied wallet, with per-card
  fee profiles and balance corrections that move your position without counting
  as spending.
- **Keeping it** — a backup that is a plain zip you can open anywhere, an undo
  for the last restore, optional Drive backup sealed with a passphrase, and a
  CSV export that carries both legs of a transfer.
- **Receipts read by Gemini,** with your own key, off until you supply one.
- **Recurring payments and portfolio rebalancing,** the latter deliberately not
  wired into the ledger — it never tells you to sell.
