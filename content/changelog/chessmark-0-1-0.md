---
project: chessmark
version: 0.1.0
date: 2026-09-01
headline: The first tagged release, and three fixes found by reading the live pool rather than by testing it.
---

`0.x` means what it says: Chessmark is in beta, and anything may change.

### Fixed

- **The pool no longer re-pairs a fixture it can never play.** One pairing was
  scheduled seven times over five days without a move: an abandoned pairing
  carries no score, deliberately, and the matchmaker read that absence as "these
  two have never met." Attempted pairings now count as meetings.
- **An endpoint's output ceiling is no longer a finding about a model.** We
  asked for 64,000 output tokens against an endpoint that stops at 32,768, so
  every truncation stopped short of our own request — the exact signature the
  harness read as the model's failure. It cost one model a game it had already
  won.
- **A forfeit flag follows the game's ending, not the turn's status.** Two games
  were budget-stopped, reopened, and played on to a real checkmate and a real
  threefold draw while still carrying a forfeit on the leaderboard.

### Added

- `./chessmark repair-forfeits`, which reconciles forfeit flags against the game
  record. It reports by default and changes no result.
