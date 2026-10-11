---
project: 'chessmark'
version: '0.7.0'
date: 2026-10-01
headline: '24 commits since v0.6.0.'
breaking: false
---

24 commits since `v0.6.0`. **Chessmark is in beta**, which is what `0.x` means under SemVer: anything may change, and the public API should not yet be considered stable.

Credit can be bought in any amount, and tournaments are paid for by Chessmark's own house account. The [full changelog](https://github.com/ahmedsaed/chessmark/blob/main/CHANGELOG.md#070--2026-10-01) has every entry.

### Buy any amount of credit

`/credit` sells any amount from $5 to $100, with $5, $10 and $25 as quick picks. **The amount you choose is what you pay, tax included.** Each purchase is shown as one sum: tax, the payment processor's fee, 5% for running Chessmark, the **AI provider fee** (OpenRouter's 5.5% on the credit we buy from it), and the credit left. Where there is no tax, $5 buys $3.79, $10 buys $8.05 and $25 buys $20.85. The checkout opens in a dialog inside the credit page and closes itself once the payment goes through. (AUTH-22, [ADR-0056](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0056-credit-is-sold-only-while-openrouter-can-cover-it.md))

**Credit is sold only while OpenRouter can pay for it.** A checkout reserves its credit against OpenRouter's remaining balance, less what users already hold and a $10 reserve. If an amount does not fit, the page offers the largest one that does. (AUTH-23)

**Sales are a switch, and it starts closed.** `./chessmark sales open | pause "reason"` opens and pauses sales without a restart. While sales are paused, `/credit` shows the breakdown and "not on sale right now". Anything already paid for is still credited. (AUTH-25, [ADR-0057](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0057-credit-sales-are-a-switch-that-starts-closed.md))

### The house pays for tournaments

Every game no person started is now charged to Chessmark's house account, turn by turn. When the house runs out of credit, those games pause, showing "waiting for Chessmark to add credit". A tournament with paid models waits rather than starting games it can't fund. Credit in the house counts against the credit for sale, so tournaments can no longer spend the OpenRouter balance that backs users' credit. (AUTH-26, [ADR-0058](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0058-the-house-account-pays-for-games-no-person-started.md))

### Move sounds

A move, a capture, castling, a check, a promotion and the end of a game each have their own sound, live and in replays. Sound is on by default. "sound on / off" beside "copy link" turns it off, and your browser remembers the setting. Sounds by Kenney.

### Around them

- **`./chessmark purchases <email>`** lists an account's purchases and whether each can be refunded. (AUTH-24)
- **Credit unused for 12 months may expire**, because OpenRouter can expire the credit we hold with it after a year.
- **Fix:** a tournament whose last game is paused is no longer marked finished.

### Deploying

Two migrations, both additive: `credit_reservations`, and the house account's user row.

Deploy by hand with `./chessmark deploy` once _Publish images_ has finished. Then:

- fund the house with `./chessmark credits house <usd>`. It starts empty, and tournaments wait until it has credit;
- open sales with `./chessmark sales open` when ready. They start paused.
