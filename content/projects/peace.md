---
name: Peace
summary: An expense tracker that keeps its mouth shut. Every record lives in one SQLite file on your phone — no account, no server, no sync, and nothing on the network unless you ask for it.
magnitude: 2
kind: app
firstLight: 2026-08-10
updated: 2026-11-05
url: https://peace.merope.dev
repo: https://github.com/ahmedsaed/Peace
---

Peace is built around the month, and around the thing you do fifty times a
month: type an amount.

The pickers sit at the top of the record screen and a calculator keypad at the
bottom, so the bottom-right key walks the whole record — account, category,
save — and a coffee takes four taps with one thumb. `=` finishes a sum first if
you were still adding things up, and the key's label always says which of the
three it is about to do. It works in split-screen, with a bank notification open
beside it, because that is where records actually get logged.

<figure>
  <img
    src="/files/peace/month.png"
    alt="Three screens from Peace. The month of October, grouped by day, with expense, income and what is held now in the header. The new-record screen, with account and category pickers at the top and a calculator keypad showing 42 at the bottom. The analysis ring, with Food at 37.1 percent and its sub-categories ranked beneath it."
    width="1716"
    height="1200"
  />
  <figcaption>The month, one record, and where it went.</figcaption>
</figure>

Everything else exists to make the ledger tell the truth afterwards. Transfers
appear once instead of twice. A refund nets against the thing it reversed rather
than inflating both sides of the month. A credit card reads as money owed rather
than an emptied wallet. The percentages on the analysis ring add up to exactly 100. Search shows the total of every match, not of the rows that fit on screen.
Budgets suggest themselves from what you actually spend, so the first month does
not open on a blank screen asking for nineteen numbers.

## Less typing, never less control

The keypad is fast, but the fastest record is one you do not type. Peace can
read a bank's card alert as it arrives, a photographed receipt, or a sentence
you say out loud — and every one of them ends as a form you still have to save.
Nothing is written behind your back.

<figure>
  <img
    src="/files/peace/less-typing.png"
    alt="Three more screens. A bank's text message arriving as a notification, and the same charge waiting at the top of Records to be approved. The record screen listening, reading what was said. Penny, the assistant, proposing a coffee expense read from a photographed café receipt, with Add and Decline buttons."
    width="1716"
    height="1200"
  />
  <figcaption>A bank alert, a spoken record, and a receipt handed to Penny.</figcaption>
</figure>

- **Bank alerts are read, not your inbox.** Android hands over the notification
  your messaging app already showed — the same text you read off a lock screen.
  No permission to read SMS, no conversation history, and the list of senders
  starts empty, so nothing is read until you name a bank.
- **Speech goes to the model as audio, not as a transcript.** The people it was built
  for say “<span dir="rtl" lang="ar">دفعت 300 Uber من الـ CIB</span>” — Arabic and English in one sentence — and the
  phone's own speech recogniser listens for one language at a time, so it would
  hear half of that as noise. A model that hears the audio gets both halves and
  the meaning in one request.
- **Penny, the assistant, is a typist, not an accountant.** Ask how December's
  fuel compared with November's and the answer is worked out from the ledger,
  with every amount drawn by the app rather than written by the model. It can
  add, edit and delete records, but each change arrives as a card you approve,
  and a delete asks twice and can be undone.

All of it is off until you switch it on, and it runs on your own Gemini key,
which lives in the phone's keystore rather than in the settings table — that
table travels inside every backup.

## What it refuses to do

What an app declines is as much a description of it as what it ships.

- **No sync.** Sync means a server, an account, and a copy of your spending
  somewhere you do not control.
- **No budget carry-over.** An unspent limit rolling forward is a limit that
  gets easier every time you fail to use it. What carries between months is
  money, and the header does that instead.
- **No single cross-currency total.** Valuing a whole balance needs today's
  rate, and the only honest rates here belong to past records — each one stored
  against the record that used it, so a purchase made when the dollar was fifty
  pounds stays at fifty forever.
- **No settings that do nothing.** A control for a preference nothing reads is a
  switch that silently lies, so each row ships in the same change as the code
  that honours it.

The whole app makes four outbound calls and there are no others: an exchange
rate when you tap for one, Gemini for receipts, bank messages, speech and Penny
if you have supplied your own key, Drive if you have connected it, and a
once-a-day check for a newer build. Two of the four are off until you switch
them on.

A backup is a plain zip — the database beside a folder of receipts — so it
opens without this app, and restoring one can itself be undone. Peace is on
Google Play in closed testing, and every merge also publishes a signed APK to
GitHub. Play Protect blocks that one: Google stops apps installed from outside
Play from reading notifications, and no change to the manifest gets around it.
The code is GPL-3.0.
