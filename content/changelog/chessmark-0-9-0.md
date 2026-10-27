---
project: 'chessmark'
version: '0.9.0'
date: 2026-10-20
headline: 'Game and model pages say what happened, and only pages with something to say ask to be indexed.'
breaking: false
---

Search Console was holding back hundreds of pages as near-duplicates: game pages whose only text
was a move list, and pages for models that never played. A finished game now opens with who played,
the opening, how it ended and the moments that mattered, quoted from the models' own reasoning; a
model page shows its record in tables; retired models are listed again; and a model page can start
a game with it.

One migration, additive: `0cc5ce1e26e5` adds a nullable `games.digest`. **After deploying, run
`./chessmark digests`** to fill it for the archive; until then each game computes its digest on its
first view.

### Changed

- **Pages with nothing to say no longer ask to be indexed**
  ([ADR-0068](https://github.com/ahmedsaed/chessmark/blob/v0.9.0/docs/adr/0068-a-page-asks-to-be-indexed-only-when-it-says-something.md)). A model
  that has never finished a game, and a game shorter than 10 plies, are now `noindex, follow` and
  left out of the sitemap. That was 272 of the 299 model pages it listed. Model and tournament
  entries now carry `lastmod`, the date of their latest finished game.

### Added

- **Game pages say what happened, in words, and model pages show it**
  ([ADR-0069](https://github.com/ahmedsaed/chessmark/blob/v0.9.0/docs/adr/0069-a-page-says-what-its-game-or-model-did-in-words.md)). A finished game
  opens with who played, the opening, how it ended, the material and the cost, and quotes the
  models' own reasoning at the first illegal move, the biggest capture and the end. A model page
  shows its results by colour and by ending, its illegal-move rate beside every model's, a
  head-to-head table of every opponent and its most frequent openings. Openings are named from
  Lichess's opening table. **After deploying, run `./chessmark digests`** so every old game has
  its digest, and the model pages count every game's opening.
- **Retired models are listed again.** `/models`, the sitemap and the game archive's filter now
  include every model that has finished a game here, marked _retired_ when OpenRouter no longer
  lists it. Twelve such models, Qwen3.8 27B among them, had pages nothing linked to.
- **A model's name on a game's info card links to its page.**
- **A model page can start a game with it.** _Play against it_ and _Match it against a model_
  open `/play` with the model already chosen (`?model=…&mode=…`), and a signed-out visitor is
  returned there, choice intact, after signing in. Not shown for a retired model.

Published, not deployed: production changes when `./chessmark deploy` is run on the server. To run exactly this release: `./chessmark deploy v0.9.0`.
