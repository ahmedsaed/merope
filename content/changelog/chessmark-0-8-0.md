---
project: 'chessmark'
version: '0.8.0'
date: 2026-10-12
headline: '32 commits since v0.7.0.'
breaking: false
---

32 commits since `v0.7.0`. **Chessmark is in beta**, which is what `0.x` means under SemVer: anything may change, and the public API should not yet be considered stable.

Ratings are rebuilt on Bradley-Terry, chat and decision models are ranked apart, and a model's reasoning level is now part of what plays. The [full changelog](https://github.com/ahmedsaed/chessmark/blob/main/CHANGELOG.md#080--2026-10-12) has every entry.

### Ratings, rebuilt

**Ratings are Bradley-Terry, and tables are ordered by proven strength.** Every game is fitted at once, so the same games give the same ratings in any order, and a model that stops playing keeps what it proved. Tables are ordered by the rating less twice its ±, so a three-game streak no longer outranks a long record. ([ADR-0060](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0060-models-are-rated-by-bradley-terry-and-ranked-by-proven-strength.md))

**Every rating on the site is one stored run.** The leaderboard, a pool's standings and the matchmaker all read the same fingerprinted run, so what the matchmaker pairs on is what the site shows. The stored leaderboard is now actually stored: a warm read went from about 50 ms to 8 ms. ([ADR-0061](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0061-every-rating-is-a-stored-run.md))

**Chat models and decision models are ranked separately**, and a game with a person, or between a chat and a decision model, is never ranked. ([ADR-0063](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0063-chat-and-decision-models-are-ranked-on-separate-leaderboards.md), [ADR-0064](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0064-a-game-with-a-person-or-across-harnesses-is-never-ranked.md))

### How hard a model thinks is part of what plays

A contestant is now a model at a quantization **and a reasoning level**: the same model at high reasoning and at low are separate entrants, rated separately. Until now no request named a level, so every model reasoned at whatever its provider defaulted to, and nothing recorded it. Every game now records the level each seat played at, shown on the game page, the leaderboard and the model page. Starting a game offers the levels a model supports under _think_, with its default selected. Tournaments and pools can be set to a level; existing ones carry on at each model's default. ([ADR-0067](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0067-reasoning-effort-is-part-of-the-contestant.md))

**Games already played are labelled** from whether each seat actually reasoned, read through the level its model uses by default today, and marked _inferred_ on the game page.

### Choose who serves a model

Starting a game, against a model or between two, now offers a _via_ menu listing every host for the model with its uptime. _auto_ still picks the most reliable one. The quantization row is now always shown, even when there is only one. ([ADR-0066](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0066-the-person-starting-a-game-may-choose-its-endpoint.md))

### Around them

- **Download any game as a GIF**, drawn in your browser, one frame per move. The game page's buttons are now icons. ([ADR-0065](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0065-game-gifs-are-drawn-in-the-browser.md))
- **Decision models with a limit on options play in heats**, then a final between the heat winners, so Tev and Solar can play a middlegame. ([ADR-0059](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0059-a-decision-model-with-a-limit-plays-in-heats.md))
- **Standings show abandoned pairings**, as W/D/L/A.
- **A failed call is on record**, with the provider's error body, in the turn inspector. ([ADR-0062](https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0062-a-failed-call-is-recorded-and-a-refused-answer-is-re-split.md))
- **A game interrupted by a deploy resumes within a minute, not fifteen**, and a turn longer than fifteen minutes is no longer run twice.
- **A new game appears on the site as soon as it starts**, not at its first move.
- **On a phone**, the leaderboard and standings scroll sideways instead of hiding columns, and the play page no longer scrolls sideways.
- **Fix:** "sign in" no longer sometimes shows "That did not load."

### Deploying

Three migrations, all additive: `8eac4a8e7efa` (`model_registry.decisions_max_choices`), `9a854789833f` (`leaderboard_snapshots.scope`) and `8ddbdc635007` (the reasoning columns on `model_registry` and `model_endpoints`).

Deploy by hand with `./chessmark deploy` once _Publish images_ has finished. Then expect:

- **every rating to change once**, on the first read after the deploy, because the method changed. It is not a regression;
- **the leaderboard to reshape once more** when the catalogue refresh labels past games with their reasoning level. Until it finishes, new games play with no level and are labelled with the rest;
- **no decision model to be paired** until the same refresh re-checks each one under harness `d2.1`.
