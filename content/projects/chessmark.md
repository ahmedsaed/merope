---
name: Chessmark
summary: LLM agents playing chess, against each other and against you — a benchmark where every token, tool call and reasoning trace is recorded and replayable.
magnitude: 1
kind: service
firstLight: 2026-09-01
url: https://chessmark.merope.dev
repo: https://github.com/ahmedsaed/chessmark
---

Chess is a clean test of the thing agents are supposed to be good at and are
usually measured on badly: holding a position in mind over dozens of turns,
acting only through tools, and never once emitting an illegal action. A model
cannot talk its way past a board. It either finds the move or it does not.

So Chessmark pairs models continuously in an open pool, streams each game as it
happens with the reasoning running beside the board, and keeps every token, tool
call and taunt for replay. You can sit down and play one yourself.

<figure>
  <img
    src="/files/chessmark/lobby.png"
    alt="The Chessmark lobby: a chessboard on the left, the line 'Language models play chess. Everything is recorded.' on the right, and a featured game quoting each model's reasoning around the move that ended it, above a grid of recent replays."
    width="1440"
    height="900"
  />
  <figcaption>The lobby, with a featured game quoted from the models' own reasoning.</figcaption>
</figure>

It is two things in one codebase. A benchmark, for anyone asking whether an
agent can get through a sixty-turn task without one invalid action. And a show,
for anyone who wants to watch two models talk themselves into losing a rook.
The show is what brings people back, and every game it records is data for the
benchmark.

## Most of the interesting decisions are exclusions

A leaderboard is only worth reading if you know what it refuses to count.

- **A ranked game runs one fixed, versioned configuration** — a recorded prompt
  version and tool schema version, no personas, no chat. A game played under an
  older version measured a different task, so it leaves the rated set rather
  than being quietly mixed in.
- **A harness bound is never a finding about a player.** Our ceilings, our
  budget, our provider's outage — those fail a turn; they do not forfeit a
  model. A forfeit for illegal moves, or for never calling a tool at all, _does_
  count. That is the benchmark's whole subject.
- **A rule that decides a game is stated in the prompt.** A model cannot be
  scored against a condition nobody told it about.
- **A model that cannot play is never offered.** One without tool calling cannot
  act at all. The `:batch` variants are half price and look healthy in every
  field the catalogue publishes, but they answer later rather than on the call a
  turn makes. Each would sit out the ten minutes a turn is allowed and
  forfeit, recording a loss against a model that never moved.

The second rule was written after it had already cost someone a game. We asked
an endpoint for more output tokens than it was able to produce, so every
response stopped short of what we had requested — which is the exact signature
the harness read as the model failing on its own. It threw away a game that
model had won with a rook and two bishops against a lone pawn.

<figure>
  <img
    src="/files/chessmark/game.png"
    alt="A finished game: each model's tokens, cache rate, cost and illegal-move count on the left, the final position in the middle, and on the right the trace of each turn — steps, tool calls like get_board and get_legal_moves, how long the model reasoned — down to the mating move."
    width="1440"
    height="900"
  />
  <figcaption>A finished game, with every turn's tool calls and reasoning beside the board.</figcaption>
</figure>

## A rating that says what it knows

The first ratings were Glicko-2, built for human players whose form drifts
between Tuesday and Friday. A model is a fixed set of weights and does not
drift, and the time machinery showed: dealing the same 116 games into the same
days in 300 different orders moved one model anywhere from first place to
thirteenth. Identical results, a different table.

So the ratings are now one Bradley-Terry fit over every counted game at once,
with no dates, on the same scale as chess ratings. And the table is ordered by
**proven strength** — the rating less twice its uncertainty — so three wins in a
row cannot outrank a long record with the same estimate. A contestant is a model
_at a precision and a reasoning level_: the same weights served at 4-bit and at
8-bit, or asked to think hard and barely at all, are different entrants and are
ranked apart.

The open pool never ends, so a change to the prompt or the tools does not reset
it. It opens a new era inside it, and the table shows the era being played.

## Where it is

Live and playing: the engine, ratings, tournaments, human-versus-model games and
the deployment all run. What is not built is written down too. There is no
engine analysis yet, so nothing anchors the rating scale to Stockfish, and
moderation is not built, which is part of why models do not talk to each other
in ranked games.

## Source-available, deliberately

The code is public so the benchmark can be audited, because a leaderboard nobody
can inspect is not worth much. Running it as a service stays here. That pair is
the whole licence.
