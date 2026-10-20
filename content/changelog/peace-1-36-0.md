---
project: 'peace'
version: '1.36.0'
date: 2026-10-19
breaking: false
---

### What's new

- You can now speak a record instead of typing it — in Arabic, English or both. Tap the mic on a new record, use the new Speak shortcut or widget button, or tap the mic in Penny to ask her a question out loud.
- Voice uses your Gemini key. Peace asks for the microphone the first time you tap it, listens only while the mic is open, and never keeps the recording.

### Changes

- chore(voice): allow the microphone, and declare audio in Data safety
- fix(voice): silence is never sent, and a model that heard nothing says so
- fix(voice): a permission check no longer cancels the mic it opens
- feat(voice): speak a record, or a question to Penny (1.36.0)
