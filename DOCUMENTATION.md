# DigiBook AI — Project Documentation

**Adaptive AI Textbook & Learning Platform**
Built by Ansh Saini, South Brunswick High School, New Jersey.
Submitted to ReverieHacks 2026 — Software Development track.

---

## Table of contents

1. [Purpose](#1-purpose)
2. [Target audience](#2-target-audience)
3. [Main features](#3-main-features)
4. [How it works — technical overview](#4-how-it-works--technical-overview)
5. [Installation and deployment](#5-installation-and-deployment)
6. [Configuration](#6-configuration)
7. [User manual](#7-user-manual)
8. [Accessibility guide](#8-accessibility-guide)
9. [Keyboard shortcuts and voice commands](#9-keyboard-shortcuts-and-voice-commands)
10. [Data, storage, and privacy](#10-data-storage-and-privacy)
11. [Troubleshooting](#11-troubleshooting)
12. [Known limitations](#12-known-limitations)
13. [References and credits](#13-references-and-credits)

---

## 1. Purpose

A textbook is a dead end. When a student hits a sentence they don't understand,
the book has nothing more to offer — so they open a new tab, type a question that
strips away all the surrounding context, and lose their place. The reading, the
explanation, the practice, and the record of what they actually learned all live
in different places, and none of them talk to each other.

DigiBook closes that loop. It takes an ordinary document — a PDF, a Word file, a
plain text file — and turns it into an active lesson. The student can ask about
any word or passage in place, get tutored rather than told, generate practice from
what they just read, and see a running, visible model of which concepts they have
actually mastered and which one to study next.

The design goal was not "a chatbot next to a PDF." It was to bring three ideas
from intelligent-tutoring-systems research into a tool a student would use on a
Tuesday night:

- **Socratic tutoring** — the tutor asks guiding questions before it gives answers,
  because being handed an answer produces the weakest kind of learning.
- **Open student modeling** — the system's estimate of what you know is shown to
  you, not hidden. You can see it, disagree with it, and act on it.
- **Adaptive sequencing** — what you practice next is chosen from evidence about
  your performance, and the reasoning behind that choice is displayed.

DigiBook extends earlier ARGOS research on Socratic tutoring and open student
modeling into a practical, everyday reading tool.

> DigiBook is an educational proof of concept. AI-generated explanations,
> translations, quizzes, and recommendations are meant to support learning and
> should not replace textbooks, teachers, or trusted academic resources.

---

## 2. Target audience

**Primary: students aged roughly 13–22** reading assigned material independently —
high school and early undergraduate. Anyone with a chapter to get through and no
one nearby to ask.

Specific groups the design serves deliberately:

| Audience | What DigiBook gives them |
|---|---|
| Students with dyslexia | Easy-reading font, reading ruler, read-aloud |
| Students with low vision | Large / extra-large text, high contrast, zoom-friendly layout |
| Students with motor differences | Large touch targets, full keyboard control, optional drawing canvas |
| Students with attention differences | Reading ruler, reduced motion, Focus mode |
| English learners | Read-aloud paired with nine-language translation and explanation |
| Screen-reader users | Announced page turns, quiz feedback, path updates, room activity; a text outline alternative to the visual concept map |
| Study pairs and small groups | Study Rooms with shared page, notes, sketch, chat, and voice |
| Teachers and tutors | Exportable study report showing concept mastery and recommended next step |

Secondary audience: anyone reading technical material outside a classroom — the
tool has no concept of a course, an enrollment, or a grade.

---

## 3. Main features

### Reading
- Open **PDF, DOCX, or TXT** by drag-and-drop or file picker.
- **Demo Library** — 17 built-in lessons across Biology, Physics, Math, Computer
  Science, Space Exploration, Scientific Research, and Practical Skills, each with
  a pre-built concept map. No upload or account needed.
- Adjustable text size, three reading themes (light, sepia, dark), bookmarks,
  paragraph highlighting, and a recently-opened shelf.
- **Read aloud** in the language the text is actually written in — a Hindi passage
  is spoken in Hindi, not in mispronounced English — with male/female voice and
  0.75x–1.5x speed.

### Learning
- **Select to learn.** Highlight any word or passage and choose **Define**,
  **Explain simply**, **Translate**, **Summarize**, **Ask tutor**, or
  **Add to Notes** — in any of nine languages.
- **Explanation level** — Simple, Standard, or Advanced, so the same passage can be
  explained at the reader's level.
- **Socratic tutor** with two modes: **Guide me** (asks guiding questions so the
  student reasons to the answer) and **Just answer** (direct response).

### Practice
- **Auto-generated quizzes** built from the current page, from the student's own
  notes, or targeted at a specific weak concept.
- **Flashcards** with a Leitner-style spaced-repetition scheduler.
- Quiz results move concept mastery: **+12 correct, −10 incorrect**, clamped 0–100.

### The student model
- **Open Student Model** — a visible mastery bar for every concept, banded as
  Strong (≥75), Developing (50–74), or Needs review (<50).
- **Concept knowledge graph** — an interactive SVG map of how concepts connect,
  with a full **text outline alternative** for screen-reader and keyboard users.
- **Adaptive Learning Path** — ranks what to study next and explains why.
- **Reading analytics** — page views, time reading, words looked up, passages
  explained, quizzes taken, quiz accuracy, strong vs. weak concept counts.
- **Study report** — a printable summary of mastery and the recommended next step.

### Notebook
- **Notes mode** — type or dictate; pull in book passages with a *Go to Source*
  link back to the exact page; ask DigiBook to explain or check your notes.
- **Sketch mode** — a canvas for equations, diagrams, and handwriting, with pen,
  highlighter, and eraser.
- Turn notes directly into **flashcards or a quiz**.
- Autosaves per book. Expandable to full screen with **Focus mode**.

### Study Rooms
- Create a room, share a **six-character code or a link**.
- Follow the presenter's page, take **collaborative notes and sketches** attributed
  to whoever wrote them, exchange chat messages, and talk over **live voice**.
- Per-participant **edit / view-only** permissions.
- Private notebooks and progress are never shared — only the active room's content.

### Accessibility
A dedicated panel (person icon, top bar) covering read-aloud, voice commands, voice
dictation, high contrast, text size, line and letter spacing, dyslexia-friendly
font, reading ruler, reading themes, reduced motion, easy-interaction mode, and a
keyboard-shortcut reference. See [section 8](#8-accessibility-guide).

---

## 4. How it works — technical overview

### Stack

| Layer | Technology |
|---|---|
| Frontend | A single `index.html` — vanilla JavaScript, no framework, no build step |
| AI | Google Gemini, reached through a Netlify serverless function |
| Document parsing | pdf.js 3.11.174 and mammoth 1.6.0, loaded from CDN, run in-browser |
| Collaboration | Firebase Realtime Database (state sync) + WebRTC (voice) |
| Speech | Web Speech API — `speechSynthesis` for read-aloud, `SpeechRecognition` for dictation and commands |
| Persistence | Browser `localStorage` |
| Hosting | Netlify static hosting + Netlify Functions |

There is no bundler, no `package.json`, and no install step. The deployable
artifact is the folder itself.

### Repository layout

```
.
├── index.html                    # the entire application (~3,900 lines)
├── netlify.toml                  # publish dir + functions dir
├── netlify/
│   └── functions/
│       └── ai-proxy.js           # Gemini proxy — hides the API key
├── README.md
└── DOCUMENTATION.md              # this file
```

### Request flow

```
Browser (index.html)
   │  POST { system, user, json }
   ▼
/.netlify/functions/ai-proxy       ← GEMINI_API_KEY lives here, never in the browser
   │  tries models in order
   ▼
Google Generative Language API
```

The browser never sees the API key **or the model name in the request** — the proxy
chooses. The model chain is:

1. `gemini-2.5-flash`
2. `gemini-2.0-flash`
3. `gemini-flash-latest`
4. `gemini-2.5-flash-lite`

If a model returns a non-200 or an empty body, the proxy logs the reason and falls
through to the next one. The model that actually served each request is logged
(`[ai-proxy] served by …`) and returned in the response body.

Two details worth knowing:

- **Thinking is disabled on 2.5 models.** Gemini 2.5 defaults to "thinking," which
  can consume the entire output budget and return empty text. `thinkingBudget: 0`
  is set for any model matching `2.5`.
- **Token budget varies by mode.** Structured (JSON) generations get 2048 output
  tokens at temperature 0.3; prose gets 1200 at temperature 0.6.

### Adaptive Learning Path algorithm

For every assessed concept, DigiBook tracks a signal record: quiz attempts,
correct, incorrect, tutor questions, explanation requests, last interaction, and
previous mastery. Priority is a weighted sum:

| Signal | Weight | Meaning |
|---|---|---|
| Mastery gap `(100 − score)/100` | **40%** | How far from mastered |
| Error rate `incorrect/attempts` | **25%** | How often you got it wrong |
| Confusion `min(1, (tutorQ + explainReq)/4)` | **15%** | How much help you needed |
| Recency `1 − days/7` | **10%** | Recently touched concepts stay warm |
| Prerequisite density | **10%** | Concepts other concepts depend on |

Ties break toward prerequisites, then toward recent errors, then toward the weaker
score. The highest-priority concept becomes the recommendation, and the panel shows
the reasoning rather than just the verdict. Recommended actions scale with the
band: *Needs review* gets Review → Practice → Connect → Apply; *Strong* gets only
Connect → Apply.

### Spaced repetition

Flashcards use a six-box Leitner schedule. "Got it" advances a box (capped at 5);
"Again" resets to box 0.

| Box | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Next review | immediately | 10 min | 1 day | 3 days | 7 days | 14 days |

### Honest-fallback design

Offline fallbacks for quizzes, flashcards, and the concept map **only fire on the
built-in genetics sample**. Arbitrary uploads never receive fabricated content — if
the AI is unreachable, the app says so instead of inventing questions about a
document it could not read. Likewise, if pdf.js or mammoth fails to load from CDN,
the app still runs and only that one file format is disabled, with an explicit
message.

---

## 5. Installation and deployment

### Run locally

There is nothing to install and nothing to build. Any static file server works:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

Opening `index.html` directly via `file://` mostly works, but some browsers
restrict `localStorage`, the Web Speech API, and microphone access on `file://`
origins — a local server is more reliable.

**With `file://` or a plain static server, the AI tutor will be Offline**, because
`/.netlify/functions/ai-proxy` does not exist. Reading, themes, accessibility,
notes, sketching, and the demo lessons all still work. To run the AI locally,
install the Netlify CLI and use its dev server, which serves the functions too:

```bash
npm install -g netlify-cli
```

```bash
GEMINI_API_KEY=your_key_here netlify dev
```

### Deploy to Netlify

**Option A — drag and drop**

1. Zip this folder.
2. Drop the zip on the Netlify dashboard.
3. Go to **Site settings → Environment variables** and add `GEMINI_API_KEY`.
4. Redeploy (environment variables are read at function runtime, but a redeploy
   guarantees the new value is picked up).

**Option B — CLI**

```bash
netlify deploy --prod
```

Set `GEMINI_API_KEY` in the site environment either way.

### Verify the deployment

Open `https://<your-site>/.netlify/functions/ai-proxy` in a browser. A `GET`
returns a self-check:

```json
{
  "ok": true,
  "keyConfigured": true,
  "models": ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-2.5-flash-lite"],
  "note": "Function is deployed. POST here to generate."
}
```

If `keyConfigured` is `false`, the environment variable is missing or the site has
not been redeployed since it was set.

In the app itself, the **AI pill** in the top bar reads **AI Tutor: Live** once the
proxy answers, or **Offline** if the key is missing or every model in the chain
failed.

---

## 6. Configuration

### Required: Gemini API key

| Variable | Where | Value |
|---|---|---|
| `GEMINI_API_KEY` | Netlify site environment variables | A Google AI Studio key — the free tier is sufficient |

Get one at [aistudio.google.com](https://aistudio.google.com/app/apikey). This key
is read only inside `netlify/functions/ai-proxy.js` and is never sent to the
browser.

### Optional: Study Rooms (Firebase)

Study Rooms use a Firebase Realtime Database with anonymous auth. A working
configuration is already present in `index.html` (search for `FIREBASE_CONFIG`),
so rooms work out of the box on the reference deployment.

To point Study Rooms at **your own** Firebase project:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Realtime Database** and **Anonymous authentication**.
3. Replace the `FIREBASE_CONFIG` object in `index.html` with your project's web
   config.

> **Note on the Firebase web config.** A Firebase web config — including `apiKey` —
> is a public client identifier by design, not a secret; it identifies the project
> and cannot by itself grant data access. What actually protects the data is your
> **Realtime Database security rules**. If you fork this project and deploy your own
> Firebase instance, write rules that restrict reads and writes to authenticated
> users and to the room paths they belong to, rather than leaving the database in
> test mode.

If Firebase is unreachable or unconfigured, Study Rooms are disabled and the rest
of the app is unaffected.

### Optional: change the featured demo

`index.html` defines:

```js
const DEFAULT_DEMO = 'genetics';   // any topic id from DEMO_LIB
```

Valid ids: `photosynthesis`, `genetics`, `cell-structure`, `motion-forces`,
`energy`, `electricity`, `algebra`, `functions`, `probability`, `ml-basics`,
`algorithms`, `data-structures`, `mars-rover`, `black-holes`,
`scientific-method`, `vaccines`, `carpentry-safety`.

### Optional: change the model chain

Edit the `MODELS` array at the top of `netlify/functions/ai-proxy.js`. Order is
priority order. If you add a model whose name contains `2.5`, thinking is
automatically disabled for it.

### Browser requirements

| Feature | Requirement |
|---|---|
| Core reading, quizzes, notes | Any current browser |
| Read aloud | `speechSynthesis` — all current browsers; available voices vary by OS |
| Voice commands / dictation | `SpeechRecognition` / `webkitSpeechRecognition` — Chrome and Edge; not available in Firefox |
| Study Room voice | WebRTC + `getUserMedia`; requires HTTPS and microphone permission |

Chrome or Edge is recommended for the full feature set. Everything except voice
input works everywhere.

---

## 7. User manual

### Getting started

1. **Open something to read.** Drag a PDF, DOCX, or TXT onto the drop zone, click
   the picker, or choose a lesson from the **Demo Library**. If you just want to
   see the app work, use the featured demo — one click, no upload.
2. **Confirm the tutor is live.** The pill in the top bar should read
   *AI Tutor: Live*. If it says *Offline*, see [Troubleshooting](#11-troubleshooting).
3. **Set your language and level.** The two dropdowns in the top bar control the
   language explanations come back in (nine options) and their depth (Simple,
   Standard, Advanced).

### The four tabs

| Tab | What's in it |
|---|---|
| **Learn** | The document, plus everything you can do to a selection |
| **Quiz** | Adaptive questions built from the page or from a targeted concept |
| **Progress** | Mastery, concept map, flashcards, analytics, and the Adaptive Learning Path |
| **About** | What DigiBook is, how it works, and its research roots |

### Reading

- **Turn pages** with the arrows, or the ← / → keys.
- **Resize text** with the A− / A+ buttons.
- **Switch theme** — light, sepia, or dark.
- **Bookmark** the current page with the bookmark button; bookmarks appear in the
  page navigator.
- **Highlight** paragraphs with the highlighter toggle.
- **Read aloud** — plays the current page in the language the text is written in.
  Choose male or female voice and speed in the Accessibility panel.
- **Focus mode** hides the side panel and gives the document the full window.

### Asking about the text

Select a word or a passage. A small popup appears with six actions:

| Action | What you get |
|---|---|
| **Define** | A short definition of the selected term |
| **Explain simply** | The passage restated at your chosen level |
| **Translate** | The passage in your chosen language |
| **Summarize** | The key points of the passage |
| **Ask tutor** | Opens the tutor chat with the passage as context |
| **Add to Notes** | Sends the passage to the Notebook with a link back to this page |

### Using the tutor

The tutor sits below the document in the Learn tab. Two modes:

- **Guide me** (default) — the tutor asks you a question back, then another, until
  you reach the answer yourself. Use this when you're studying.
- **Just answer** — a direct response. Use this when you're short on time or you
  only need a fact.

You can type or use the microphone button to dictate. Everything you ask counts as
a *confusion signal* on the concepts involved, which feeds the Adaptive Learning
Path — asking a lot about one idea will push it up your study list.

### Taking a quiz

- Open the **Quiz** tab and press **New quiz** to generate questions from the
  current page.
- Or start a targeted quiz from the Adaptive Learning Path to drill one weak
  concept.
- Or build one from your Notebook with **Quiz me on this**.

Answer every question, then submit. Each correct answer adds **+12** to that
concept's mastery; each incorrect answer subtracts **10**. Results are announced
for screen readers, mastery bars update, and the Adaptive Learning Path recomputes.

### Flashcards

In **Progress → Cards**, generate cards from the page or from your notes. For each
card, flip it, then rate yourself:

- **Got it** — the card moves up a box and comes back later (10 min → 1 day →
  3 days → 7 days → 14 days).
- **Again** — the card resets and comes back soon.

**Review N due cards first** sorts the deck so anything overdue comes up before
anything else.

### Reading your progress

**Progress → Mastery** shows every assessed concept with a percentage and a band.
**Progress → Map** shows the concept graph; the **Outline** toggle gives the same
information as structured text, which is what screen readers and keyboard users
should use. **Progress → Stats** shows reading and learning analytics plus the
export, import, report, and reset controls.

### The Adaptive Learning Path

**Progress → Adaptive** answers one question: *what should I do next?*

It shows the concept it picked, **why it picked that one** (mastery gap, error
rate, how often you asked for help, how recently you touched it, and what depends
on it), a suggested sequence of actions, recent improvements, and an overview of
the whole path. You can start a targeted lesson or a targeted quiz directly from
this panel.

### The Notebook

Open it with the **Notebook** button in the reader toolbar.

- **Notes** — type or dictate. Passages added from the reader carry a *Go to
  Source* link back to the exact page. Ask DigiBook to explain or check a note, or
  turn your notes into cards or a quiz.
- **Sketch** — pen, highlighter, and eraser on a canvas, for equations and
  diagrams. Convert a sketch into a note, or export it.
- Scope your notes to **this page** or **the whole book**.
- Everything autosaves per book. Export notes or sketches from the **More** menu.

### Study Rooms

**To host:** open the Study Room panel, enter your name, and press **Create room**.
You get a six-character code and a shareable link. As presenter, the page you're on
is the page everyone following you sees.

**To join:** enter the code (or open the link) and your name.

Inside a room you can:
- **Follow** the presenter, or unfollow to read at your own pace.
- Add **shared notes**, attributed to whoever wrote them.
- **Sketch together** on a shared canvas.
- **Chat**, and **talk** over live voice.
- Share the current **page**, a **note**, or a **sketch** into the room.
- As host, set each participant to **Can edit** or **View only**.

Your private notebook, your mastery scores, and your analytics are never shared —
only what is explicitly in the room.

### Saving and moving your progress

In **Progress → Stats**:

| Button | What it does |
|---|---|
| **Export progress** | Downloads a JSON file with your concepts, scores, cards, and analytics |
| **Import progress** | Loads that file on another device or browser |
| **Study report** | Generates a printable report — mastery, recommended next step, concept breakdown |
| **Reset all progress** | Clears everything on this device (asks for confirmation) |

Because there are no accounts, **export is the only way to move between devices.**

---

## 8. Accessibility guide

Accessibility is built into the reading experience rather than bolted on as a
separate simplified mode. There is one app, and it adapts.

Open the panel with the **person icon** in the top bar.

### Vision and reading
- **Read aloud** — male or female voice, 0.75x / 1.0x / 1.25x / 1.5x speed, spoken
  in whichever of the nine supported languages the text is written in.
- **Auto-read tutor responses** — tutor replies are spoken as they arrive.
- **High contrast** mode.
- **Text size** — default, large, extra large.
- **Reading spacing** — default, comfortable, spacious (line *and* letter spacing).
- **Easy-reading font** — a dyslexia-friendly typeface.
- **Reading ruler** — dims everything except the line you're pointing at.
- **Reading themes** — light, sepia, dark.

### Motor and mobility
- **Easy interaction mode** — larger touch targets and more forgiving hit areas.
- **Voice commands** — drive the app by speaking (see below).
- Full keyboard operation with a visible focus outline; the drawing canvas is
  always optional, never required to complete a task.

### Comfort
- **Reduce motion** — suppresses animation and transitions.

### Screen reader support
- Live regions announce page turns, quiz results, Adaptive Path updates, and Study
  Room activity.
- The concept map has a full **Outline** alternative — every concept with its
  mastery band and its connections, as headings and lists.
- Skip links to the document and to the tools appear on the first Tab press.
- All controls carry labels and `aria-pressed` / `aria-expanded` state.

All accessibility choices are saved to this device and restored on your next visit.
**Reset accessibility settings** in the panel restores defaults without touching
your learning progress.

---

## 9. Keyboard shortcuts and voice commands

### Keyboard

| Key | Action |
|---|---|
| `Tab` / `Shift + Tab` | Move between controls |
| `Enter` or `Space` | Activate the focused control |
| `←` / `→` | Previous / next document page |
| `Esc` | Close a menu or dialog |
| `Tab` at the top of the page | Reveal skip links to the document or the tools |

### Voice commands

Turn on **Voice commands** in the Accessibility panel, then say:

| Say | Does |
|---|---|
| "Open learn" / "Go to learn" | Switch to the Learn tab |
| "Open quiz" / "Go to quiz" | Switch to the Quiz tab |
| "Open progress" | Switch to the Progress tab |
| "Open about" | Switch to the About tab |
| "Open mastery" / "Show mastery" | Progress → Mastery |
| "Concept map" / "Open map" / "Show map" | Progress → Map |
| "Open cards" / "Flashcards" | Progress → Cards |
| "Open stats" / "Statistics" | Progress → Stats |
| "Adaptive path" / "Open adaptive" | Progress → Adaptive Learning Path |
| "Read page" / "Read aloud" / "Read this" | Read the current page aloud |
| "Stop reading" / "Stop aloud" | Stop reading |
| "Next page" | Turn forward |
| "Previous page" / "Go back a page" | Turn back |
| "Quiz me" / "Start quiz" / "Create quiz" | Generate a quiz from this page |
| "Start adaptive lesson" | Start a lesson on your top-priority concept |
| "Answer A" / "B" / "C" / "D" | Select that quiz option |
| "Next question" / "Submit quiz" | Submit the quiz |
| "Focus mode" / "Expand" | Hide the side panel |
| "Back to reader" / "Split view" | Restore the split layout |

Voice commands require Chrome or Edge.

---

## 10. Data, storage, and privacy

**There are no accounts.** Nothing to sign up for, nothing to sign in to.

### What is stored, and where

Everything lives in this browser's `localStorage` under the `digibook_v1` prefix:

| Key | Contents |
|---|---|
| `digibook_v1` | Concepts, mastery scores, flashcards, SRS schedule, adaptive signals, analytics |
| `digibook_v1_acx` | Accessibility settings |
| `digibook_v1_nb` | Notebook notes and sketches |
| `digibook_v1_shelf` | Recently opened documents |
| `digibook_v1_theme` | Reading theme |
| `digibook_v1_level` | Explanation level |
| `digibook_v1_read` | Easy-reading font toggle |

Clearing browser data clears all of it. Nothing syncs between devices — use
**Export progress** to move it yourself.

### What leaves the browser

- **Your document does not.** PDF, DOCX, and TXT parsing happens entirely in the
  browser via pdf.js and mammoth. The file is never uploaded.
- **Only the passage you ask about** is sent to the AI proxy, along with your
  question, language, and level. Not the document, not your notes, not your scores.
- **Study Room content** — the shared page, shared notes, shared sketch, and chat —
  is synced through Firebase while the room is active. Your private notebook,
  mastery scores, and analytics are not.
- **Voice** in a Study Room is peer-to-peer over WebRTC.

### What is never exposed
- The Gemini API key stays server-side in the Netlify function.
- The model name is chosen by the proxy, not requested by the browser.

---

## 11. Troubleshooting

**The AI pill says "Offline."**
Open `https://<your-site>/.netlify/functions/ai-proxy` in a browser. If
`keyConfigured` is `false`, set `GEMINI_API_KEY` in Netlify and redeploy. If it is
`true` but the app still shows Offline, check the function logs in Netlify — each
failed model logs a line like `[ai-proxy] gemini-2.5-flash -> HTTP 429: …`, which
usually means rate limiting or a region restriction. Running from `file://` or a
plain static server always shows Offline, because the function isn't there.

**Quizzes or flashcards fall back to offline content.**
This only happens on the built-in genetics sample, and it's deliberate — arbitrary
uploads never get fabricated content. If it happens there, the AI is unreachable;
check the pill and the function logs.

**A PDF won't open.**
pdf.js loads from CDN. If the CDN is blocked, that format is disabled and the app
says so; DOCX, TXT, and the demo lessons still work. Check the browser console for
a blocked request to `cdnjs.cloudflare.com`.

**Read aloud is silent, or uses the wrong voice.**
Available voices come from the operating system, not from DigiBook. If no voice is
installed for the text's language, the browser may substitute one or stay silent.
Installing that language pack at the OS level fixes it.

**The microphone button does nothing.**
Voice input needs `SpeechRecognition`, which Firefox does not implement. Use Chrome
or Edge, and grant microphone permission when prompted.

**Study Room voice doesn't connect.**
WebRTC needs HTTPS and microphone permission. Some restrictive networks block the
peer connection; try a different network.

**Progress disappeared.**
`localStorage` is per-browser and per-device, and clearing site data erases it.
There is no server copy. Use **Export progress** regularly if the data matters.

---

## 12. Known limitations

DigiBook is a proof of concept, and these are honest boundaries rather than bugs:

- **No accounts and no sync.** Progress is device-local. Export/import is manual.
- **Voice input is Chromium-only.** Firefox and some mobile browsers lack
  `SpeechRecognition`.
- **AI output needs verification.** Explanations, translations, and generated
  questions can be wrong. The app says so in-product.
- **Concept extraction is heuristic.** Concepts are drawn from the lesson's graph
  or from text matching, which works well on the curated demos and less well on an
  arbitrary scanned PDF.
- **Scanned PDFs without a text layer won't work** — there is no OCR.
- **Mastery is a simple additive model** (+12 / −10), not a Bayesian knowledge
  tracing implementation. It's legible and it responds sensibly, but it is not
  calibrated against real learning data.
- **Study Rooms are small-group.** They're built for a study pair or a handful of
  students, not a lecture hall.
- **Single-file architecture.** `index.html` is ~3,900 lines. It deploys anywhere
  with zero build tooling, which was the point, but it is not how you'd structure
  this for a team.

---

## 13. References and credits

**Author.** Ansh Saini, South Brunswick High School, New Jersey.

**Research lineage.** DigiBook extends earlier **ARGOS** work on Socratic tutoring
and open student modeling, bringing those ideas out of a research setting and into
an everyday reading tool. The three concepts it builds on:

- *Socratic tutoring* — guiding questions produce stronger learning than direct
  answers.
- *Open student modeling* — showing learners the system's model of their knowledge
  supports self-regulated learning.
- *Spaced repetition* (Leitner) — expanding review intervals for durable retention.

**Libraries and services.**

| Component | Used for | License / terms |
|---|---|---|
| [pdf.js](https://mozilla.github.io/pdf.js/) 3.11.174 | In-browser PDF parsing | Apache-2.0 |
| [mammoth.js](https://github.com/mwilliamson/mammoth.js) 1.6.0 | In-browser DOCX parsing | BSD-2-Clause |
| [Firebase](https://firebase.google.com/) 10.12.2 | Study Room sync + anonymous auth | Google terms |
| [Google Gemini API](https://ai.google.dev/) | Explanations, tutoring, quizzes, cards | Google AI terms |
| [Netlify](https://www.netlify.com/) | Static hosting + serverless functions | Netlify terms |
| [Google Fonts](https://fonts.google.com/) | Typography | Open Font License |
| Web Speech API | Read-aloud, dictation, voice commands | Browser built-in |
| WebRTC | Study Room voice | Browser built-in |

**Demo lesson content** was written for this project. Images referenced from
Wikimedia Commons are used under their respective Creative Commons licenses.

**License.** See `LICENSE` in the repository root.
