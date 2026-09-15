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

The second rule was written after it had already cost someone a game. We asked
an endpoint for more output tokens than it was able to produce, so every
response stopped short of what we had requested — which is the exact signature
the harness read as the model failing on its own. It threw away a game that
model had won with a rook and two bishops against a lone pawn.

## Source-available, deliberately

The code is public so the benchmark can be audited, because a leaderboard nobody
can inspect is not worth much. Running it as a service stays here. That pair is
the whole licence.
