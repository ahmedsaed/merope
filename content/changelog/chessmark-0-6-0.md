---
project: 'chessmark'
version: '0.6.0'
date: 2026-09-27
headline: '24 commits since v0.5.0.'
breaking: false
---

24 commits since `v0.5.0`. **Chessmark is in beta**, which is what `0.x` means under SemVer: anything may change, and the public API should not yet be considered stable.

Credit is money now. It is spent at what each turn actually cost, settled to what OpenRouter billed, and ready to be bought. The [full changelog](https://github.com/ahmedsaed/chessmark/blob/main/CHANGELOG.md#060--2026-09-27) has every entry with its evidence.

### Credit is dollars, spent at actual cost

A balance is US dollars. Each model turn is charged its real cost as it is played, from the provider's own token counts, with no estimate and no hold. When credit runs out, a paid game pauses before its next turn and resumes when credit is added. Playing a free model needs no credit at all. You set a game's spending limit yourself, or none, and you can pause and resume the model-vs-model games you pay for. Existing balances were reset to zero. (AUTH-10–17, [ADR-0052](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0052-credit-is-dollars-spent-at-actual-cost.md))

### Every game is settled to what OpenRouter billed

Each game is checked against OpenRouter's own bill for its session, about 5 minutes, an hour and a day after it ends or is held. Its payer is then settled to that figure, as a charge or a refund. The page shows **Billed**, with a tooltip that explains any difference from the running total. On production's copy, 168 games reconciled to $0.4332, against the key's own $0.4334 for the month. (OPS-25, AUTH-18, [ADR-0054](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0054-a-game-is-charged-what-openrouter-billed.md))

Finding the gap fixed its main cause. **A failed turn now keeps the answers it paid for**, where it used to roll them back and pay for them again: about 3.5% of successful answers since mid-September. A turn that crashes spends one of its attempts instead of looping. ([ADR-0053](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0053-every-failure-keeps-its-rounds.md))

### Buying credit

`/credit` sells packs of $5, $10 and $25 that grant **$4.00, $8.50 and $22.00**. Each is shown as a sum: the price, the payment processor's fee, 5% for running the site, and the credit that is left. Tax is added at checkout. Paddle sells the credit as merchant of record. Only its signed webhook moves a balance: once per purchase, for the amount the server maps the paid price to. Refunds and chargebacks take the credit back. The terms of service, privacy policy and refund policy are linked from every page. (AUTH-19–21, [ADR-0055](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0055-credit-is-sold-as-fixed-packs-through-paddle.md))

**Buying is off until Paddle approves the live account.** Until then the packs show "not on sale yet".

### Around them

- **Starting a game has its settings on one row**: spending limit, ply cap, and Talk. For a game between two models, Talk is trash talk, which the form now lets you turn off.
- **Your profile lists the games you started**, with what each cost.
- **Decision models choose what to do with their turn**, and are checked before they are offered (harness `d2`). ([ADR-0051](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0051-a-decision-model-chooses-its-action-and-is-checked-before-it-plays.md))
- **`./chessmark status` lists turns that crashed**, and the worker keeps running rather than dying with them.
- **Fixes:**
  - a game ended by its spending limit now says so live;
  - balances show enough decimal places to change and to add up;
  - pauses fold only into the one directly above them;
  - a resumed turn no longer reuses a tool call's sequence number;
  - a tournament's entrant count now matches its table.

### Deploying

Four migrations, all already applied on production. Three are additive. **One is not:** `1b65e05c166c` made credit dollars and reset every balance to zero.

Deploy by hand with `./chessmark deploy` once _Publish images_ has finished. Reconciliation needs `OPENROUTER_MANAGEMENT_KEY` on the server. Buying needs the Paddle settings in [DEPLOYMENT.md](https://github.com/ahmedsaed/chessmark/blob/main/docs/DEPLOYMENT.md#selling-credit).
