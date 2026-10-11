---
project: 'chessmark'
version: '0.5.0'
date: 2026-09-26
headline: '39 commits since v0.4.0.'
breaking: false
---

39 commits since `v0.4.0`. **Chessmark is in beta** — that is what `0.x` means under SemVer: anything may change, and the public API should not yet be considered stable.

Three things a reader can now do that they could not: watch a decision model play, find any game in an archive, and see a pool that has finished its work stop. The [full changelog](https://github.com/ahmedsaed/chessmark/blob/main/CHANGELOG.md#050--2026-09-26) has every entry with its evidence.

### Decision models play

OpenRouter's decision models — TypeSafe's Jev 1.13 and Kev 4B today — play through the Decisions API: one request per turn with the position and every legal move described, and a probability back for each. They resign, offer, accept and claim draws as a chat model can, share the leaderboard behind a badge, and get tournaments of their own. The timeline draws each decision as the moves it weighed, withheld from a person mid-game like reasoning. The harness is versioned separately (`d1`), and a game is held only to the versions of the harnesses that played in it. (AGENT-23..25, BENCH-13, [ADR-0049](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0049-decision-models-play-through-their-own-harness.md))

### Every game, at `/games`

Filter by status, result, ending, ranked or not, model against model or a person at the board, a model, a matchup or an event; search either seat's name or its OpenRouter id. Every filtered view is a link, and it unfurls as that filter. Paged by keyset, so a game starting mid-read never repeats a row, and `GET /games` stays two statements whatever it is asked. (UI-12, [ADR-0048](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0048-the-archive-filters-on-the-server-and-pages-by-keyset.md))

### A pool can stop

`--games-per-pair N` gives a pool a target per era; once every pair has played it, the pool idles until a new model is admitted and then plays only the newcomer's pairs. (BENCH-14, [ADR-0050](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0050-a-pool-saturates-per-pair.md))

### Around them

- **Pages arrive whole, and the skeletons are gone.** Every public read is cached and tagged, and the worker invalidates the tags when a game moves ([ADR-0046](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0046-the-api-invalidates-the-cache-a-clock-does-not.md)). The lobby went from complete-at-43ms to 14ms.
- **Our own sign-in, sign-up and profile**, and Clerk off every page that does not need it: 619 KiB → 258 KiB for a signed-out reader on `/leaderboard`. Two live bugs were found by writing the tests — nobody could sign up, and no display name could be saved.
- **A rebuilt lobby**: a podium for the top three, one real turn from a finished game, what a tournament is, and the human-versus-model record with what the opponent has been caught doing.
- **Accessibility at 100 on every public page against production's data**, with Lighthouse budgets in CI.
- **Fixes that changed a result or a reading**: a reopened game now tells both players it reopened (a model had been forfeited for correctly saying the game was over); colours alternate even when games don't finish; a halted game says when the halt lifts; "retrying shortly" no longer says so forever; links to a model no longer prefetch ~90 times in twelve seconds.

### Deploying

Three migrations, all additive: `runtime` / `decision_version` columns, a nullable `tournaments.games_per_pair`, and a GIN trigram index on `players.display_name`, which creates `pg_trgm` — a trusted extension since Postgres 13, so the database owner can create it without a superuser.
