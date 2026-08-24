# DigiBook AI

**An adaptive AI textbook that turns any document into an active lesson.**

Drop in a PDF, DOCX, or TXT (or open one of 17 built-in lessons) and the
reading becomes something you can talk to. Ask about any word or passage in
place, get tutored instead of told, turn what you just read into flashcards,
and watch a visible mastery score for every concept that you earn one review
at a time.

Built by **Ansh Saini**, South Brunswick High School, New Jersey.
Submitted to **ReverieHacks 2026**, Software Development track.

📖 **[Full documentation →](DOCUMENTATION.md)**

---

## The problem

When a student hits a sentence they don't understand, the book has nothing more
to offer. So they open a new tab, type a question stripped of all its context,
and lose their place. The reading, the explanation, the practice, and the record
of what was learned live in four different places and none of them talk to each
other.

DigiBook puts them in one place.

## What it does

| | |
|---|---|
| 📄 **Reads your documents** | PDF, DOCX, TXT, parsed entirely in your browser, never uploaded |
| ✋ **Select to learn** | Highlight anything → Define, Explain simply, Translate, Summarize, Ask tutor, Add to Notes, in 9 languages |
| 🧠 **Socratic tutor** | *Guide me* mode asks you questions so you reason to the answer. *Just answer* when you need it direct |
| 🗂 **Flashcards that count** | Generated from the page or your notes, each tied to a concept: "Got it" raises that concept's mastery, "Again" lowers it, with Leitner spaced repetition deciding when cards return |
| 📊 **Open student model** | A visible mastery bar for every concept. Nothing is pre-filled; every score is earned through your own reviews |
| 📓 **Notebook** | Its own left-side panel that stays open alongside the tutor: typed or dictated notes, sketches, one-click flashcards from your notes |
| 👥 **Study Rooms** | Share a code; two or more students on the same page with shared notes, sketching, chat, and live voice |
| ♿ **Accessibility throughout** | Read-aloud in 9 languages, voice commands, dyslexia font, reading ruler, high contrast, full keyboard and screen-reader support |

Accessibility is built into the same app everyone else uses; there is no
stripped-down "accessible version."

## How it's built

A **single `index.html`**: vanilla JavaScript, no framework, no build step. The
interface is three independent regions: notebook (left), reader (center), and
learning sidebar (right, with Learn / Flashcards / Progress), any combination
open at once, with Study Rooms as a centered overlay.

AI runs through a Netlify serverless function that hides the API key, falls
through a chain of Gemini models until one answers, and **validates structured
responses server-side**: a model that returns prose or truncated JSON when
flashcards were requested gets skipped, not trusted. The chain is overridable
via a `GEMINI_MODELS` environment variable, no code changes needed. Documents
are parsed client-side with pdf.js and mammoth. Progress lives in
`localStorage`. Study Rooms sync over Firebase Realtime Database with WebRTC
voice.

Zero-cost static hosting, no per-user backend, no accounts. It runs on a
Chromebook.

```
index.html                       # the entire application
netlify/functions/ai-proxy.js    # Gemini proxy: the API key never reaches the browser
netlify.toml                     # publish + functions config
DOCUMENTATION.md                 # full docs: manual, setup, architecture, accessibility
```

## Quick start

**Try it without a key.** Any static server works; reading, themes,
accessibility, notes, sketching, offline flashcards, and all 17 demo lessons run
without AI:

```bash
python3 -m http.server 8080
```

**Run it with the AI tutor.** The proxy function needs the Netlify dev server
and a free [Google AI Studio](https://aistudio.google.com/app/apikey) key:

```bash
npm install -g netlify-cli
```

```bash
GEMINI_API_KEY=your_key_here netlify dev
```

**Deploy.** Set `GEMINI_API_KEY` in **Site configuration → Environment
variables**, then:

```bash
netlify deploy --prod
```

Verify with a GET to `/.netlify/functions/ai-proxy`; it self-reports whether
the key is configured and which model chain is live.

Full setup, configuration, and troubleshooting: **[DOCUMENTATION.md](DOCUMENTATION.md)**

## Design decisions worth calling out

**Practice is progress.** There's no separate quiz to take: rating a flashcard
*is* the assessment. Each card knows which concept it tests, so "Got it" and
"Again" move that concept's mastery directly (+12 / −10) while spaced
repetition schedules the card's return.

**Mastery is earned, never seeded.** Demo lessons open with every concept
unassessed. If a bar shows 62%, it's because the student put it there.

**Honest fallbacks.** If the AI is unreachable, flashcards fall back to a
built-in extractive analyzer over the actual page text, always labeled as
offline content, and the tutor says it's offline and preserves your question
rather than inventing an answer.

**Defense against quiet AI failures.** Gemini's "thinking" models can burn
their whole token budget and return empty text; the proxy disables thinking
where needed, gives structured calls a bigger budget, and parses JSON before
accepting it, falling through the model chain on anything malformed.

**Your document stays yours.** Parsing is client-side. Only the passage you ask
about is sent anywhere.

## Research roots

DigiBook extends earlier **ARGOS** research on Socratic tutoring and open
student modeling. Three ideas carry the design: guiding questions beat given
answers, showing learners the system's model of their knowledge supports
self-regulated learning, and expanding review intervals produce durable
retention.

## Limitations

Device-local progress with manual export/import (no accounts). Voice input is
Chromium-only. No OCR, so scanned PDFs without a text layer won't work. Mastery
is a legible additive model, not calibrated knowledge tracing. AI output can be
wrong and needs verification.

Full list: [DOCUMENTATION.md § Known limitations](DOCUMENTATION.md#12-known-limitations)

---

DigiBook is an educational proof of concept. AI-generated explanations,
translations, flashcards, and feedback are meant to support learning and should
not replace textbooks, teachers, or trusted academic resources.

Licensed under the terms in [LICENSE](LICENSE).
