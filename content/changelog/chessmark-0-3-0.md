---
project: 'chessmark'
version: '0.3.0'
date: 2026-09-15
headline: 'Twenty-nine commits since v0.2.0.'
breaking: false
draft: true
---

Twenty-nine commits since `v0.2.0`. **Chessmark is in beta** — that is what `0.x` means under SemVer: anything may change, and the public API should not yet be considered stable.

One thread runs through this release. **A provider that stops answering no longer destroys the work it interrupted** — and everything downstream of that discard, from the cooldown ladder to the way a pause is drawn on the page, was built around it. The [full changelog](https://github.com/ahmedsaed/chessmark/blob/main/CHANGELOG.md#030--2026-09-15) has every entry with the evidence behind it.

### A turn keeps the rounds it completed

A turn ran inside one transaction and a provider failure raised out of it, so a turn refused on its third call discarded the two that had already been answered and **billed**. The retry then paid for them again. In `f129b600` the rolled-back turns are the gaps in the id sequence — 7854-7856, 7859 — each a fresh attempt redoing the board read the one before it had finished. A model that could not complete a whole turn inside one provider window never banked a step, and therefore never moved.

The retry now continues the turn ([ADR-0045]). Most of that was free: the transcript is rebuilt in `seq` order, so committed rounds are simply there and the model carries on mid-conversation. What needed writing is what must _not_ repeat — the turn prompt and `turn_started` are per turn, not per attempt.

Which failures keep their rounds follows one rule: **commit when the next attempt sends the same request again.** A rate limit, a timeout and a 5xx do. `NoRoomToAnswerError`, `HarnessCeilingError`, `ProviderAccountingError` and `ProviderMangledError` still roll back, because each needs the next request to be _different_.

The rollback was avoiding something real — a half-written turn can leave an assistant message whose `tool_calls` nothing answered, and that shape corrupted 242 rows across 14 seats — but a refusal comes out of `complete()`, before the round's assistant message is appended, so the transcript is already at a clean boundary.

### The ladder measures the endpoint, not the turn

A turn is many calls against a growing transcript, so an endpoint that answered the board read and was refused on the move never reached the reset: 60s, 300s, 900s, up to the hour cap, against an endpoint that had never gone away. The direction was the perverse part — the longer the game, the less likely a turn completes, so the ladder was harshest on exactly the endpoint a long game most needs. It resets on an answered **call** now ([ADR-0044]).

The endpoint being credited was also the wrong one: OpenRouter's `provider` field is absent for several models — every call in `f129b600` came back `provider: None` — so the clear landed on `model|*` while the strikes sat under `model|BaseTen`. The seat's pin is the answer when the response has none.

### A pause is drawn where it happened

The move divider **closes** its turn instead of opening it, so a reader meets the thinking, the tool calls, then the move — above, a pause belonging to the _next_ seat appeared under the previous seat's block, which is how a deepseek rate limit read as GLM's problem. A pause names the seat it is waiting on. And a pause inside an open turn is a **step of it**, in sequence under the step counter, so unrolling the steps shows what survived the interruption and what followed it.

Then the panel had to be taught that a turn can be committed and still unfinished: an interrupted turn and the retry continuing it were drawn as two headers for one seat, and a turn that talked after it moved was split in half by its own move divider. Both are one turn again, and the frames that predicted a round no longer linger beside the record of it.

Four kinds of event — `game_paused`, `game_resumed`, `output` and `compacted` — were never reaching the browser at all. The SSE listener list was written by hand and named nine of thirteen types; every one of those events was published, delivered and discarded, which is why a pause appeared only after a reload. The list is keyed by the type union now, so the next omission does not compile.

### Also

A game already paused when the free allowance ran out could not say so — `9b4bced5` sat fifteen hours advertising a reason that had stopped being true within the hour. The reconciler now publishes the events it writes, instead of committing a `game_resumed` that reached nobody. And CI can run its jobs again: `setup-uv@v10` does not exist, and the browser job now stops the servers it starts.

[ADR-0044]: https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0044-the-ladder-resets-on-an-answered-call.md
[ADR-0045]: https://github.com/ahmedsaed/chessmark/blob/main/docs/adr/0045-a-turn-keeps-the-rounds-it-completed.md
