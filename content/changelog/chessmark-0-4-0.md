---
project: 'chessmark'
version: '0.4.0'
date: 2026-09-17
headline: 'Five commits since v0.3.0.'
breaking: false
draft: true
---

Five commits since `v0.3.0`. **Chessmark is in beta** — that is what `0.x` means under SemVer: anything may change, and the public API should not yet be considered stable.

Two halves, unrelated in the code and identical in the working habit that produced them: both were things nobody could see from where they were standing. The [full changelog](https://github.com/ahmedsaed/chessmark/blob/main/CHANGELOG.md#040--2026-09-17) has every entry with its evidence.

### A harness ceiling stopped counting as a result

`db/tournaments.settle` said in its own docstring that a game the harness stopped "is marked abandoned rather than scored", and then asked a question that could not answer it: it read `GameStatus.ABORTED`, and only `ABANDONED` arrives that way. A `ply_cap`, a `budget_exceeded` or an `adjudication` ends a game `FINISHED` carrying a real `GameResult`, so all three fell through and were scored like any other draw.

`pool-free` round 175 is what that cost. `ling-3.0-flash-sante` reached `8/6P1/1k5P/5K2/5p2/8/8/8 w` — a pawn on g7, `g8=Q` on the move, the black king stranded on b6 — and the 300-ply cap drew it. The rating rules excluded the game correctly the whole time, which is exactly why nothing showed: the two numbers agreed everywhere except one column, and there the page read `0.5` beside `unrated`.

`settle` now asks `HARNESS_TERMINATIONS`. That set was already the answer and nothing linked it — `test_classification.py` exists because three sets classifying terminations had drifted apart once, and this was the fourth, one module away and unchecked.

It is also what makes the ply cap legitimate at all. **The cap is not stated in the system prompt**, and invariant 12 says a rule that decides a game must be. A ceiling that never decides a scored game satisfies that by construction.

### The site works on a phone

Seven pages measured at 390px. Every failure had the same shape — a flex row splitting a width that does not exist — and none of it was visible from a desk.

|                             | was                                                | now                              |
| --------------------------- | -------------------------------------------------- | -------------------------------- |
| a pairing's two model names | **37px** each, against the 310px the longest needs | stacked, a full row each         |
| the pool's standings column | **37px**                                           | 173px                            |
| a player's nameplate        | 157px of a 209px name                              | the whole row, captures below    |
| the leaderboard's rating    | behind a horizontal swipe                          | on screen                        |
| the replay transport        | 28×28                                              | 44×44 on touch, 28 with a cursor |
| the conversation panel      | as tall as the game was long                       | `58svh`, scrolling inside itself |
| the stats on a game page    | a whole conversation below the board               | a tab                            |

Held by a new `mobile` Playwright project that CI runs beside `public`. Eight of its nine assertions fail without these changes.

### And one the phone work introduced

`GameLayout` orders its slots twice, and `lg:order-none` let DOM order stand: the grid was still three columns, the three tops still aligned, and the `min()` middle column that exists to size the board went to the conversation while the board sat in a 323px rail. `replay.spec.ts` now asks which child is in which column, because everything short of that passed.
