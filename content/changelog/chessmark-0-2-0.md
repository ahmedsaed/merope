---
project: chessmark
version: 0.2.0
date: 2026-09-15
headline: Seventy-seven commits. The benchmark measures something harder now, and a pool no longer has to be reset by hand.
breaking: true
---

### The task changed

- **`get_legal_moves` no longer says which move is mate.** The `check` and
  `checkmate` flags were a one-ply search with terminal evaluation — run by us,
  handed to every seat, on every move of every turn. No model playing Chessmark
  had ever had to _find_ mate in one. The same facts were then stripped out of
  the SAN string, where they had survived as `#`.
- **A third version of the prompt.** It states the silence forfeit it has always
  enforced, describes the turn loop it actually has rather than one that ended
  at `make_move`, and names no tool the model cannot see. Three rules that
  decided games were not in it.
- **A pool balances its pairings.** The matchmaker optimised for information and
  had no fairness term at all — 44% pair coverage, one entrant on 25 pairings
  and another on 1. Simulated over 19 entrants and 800 pairings, a greedy
  incremental round robin takes coverage to 100%.

### Harness bounds stopped becoming findings about models

- **A turn ends when the model stops, not when it moves** — and a turn could
  previously end between a tool call and its result, leaving a transcript every
  provider refuses for the rest of the game. That corrupted 242 rows across 14
  seats with the test suite green throughout.
- **The window is sized for the request going out,** not the previous one.
- **A halt does not spend a game's patience.** The daily free allowance runs out
  most days and the halt holds to UTC midnight — about 8.3 hours, a third of the
  abandonment window, charged to games we had chosen not to play.

### Upgrading

Four migrations, all safe to apply with the old code still running. There is no
backfill. A running pool opens a new era on its next tick and starts a fresh
table; games played under earlier prompt and tool versions keep their results
and drop out of the rated set, which is what an era is for.
