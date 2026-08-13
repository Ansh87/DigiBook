# DigiBook AI — Adaptive AI Textbook & Learning Platform

Single-file learning platform. Upload a PDF / DOCX / TXT (or open the sample
chapter) and the app adds AI explanations, translation, Socratic tutoring,
quizzes, flashcards, an open student model, a concept knowledge graph, and
reading analytics — all in the browser, progress stored in localStorage.

By Ansh Saini, South Brunswick High School, NJ. Educational proof of concept.

## Deploy (Netlify)

1. Set an environment variable in Netlify → Site settings → Environment:
   - `GEMINI_API_KEY` = your Google AI Studio key (free tier is fine)
2. Deploy this folder. Two ways:
   - **Drag & drop:** zip this folder and drop it on the Netlify dashboard.
   - **CLI:** `netlify deploy --prod` from this directory.
3. The AI pill (top bar) shows **AI Tutor: Live** once the proxy answers,
   or **Offline** if the key is missing / the model chain fails.

## AI proxy

`netlify/functions/ai-proxy.js` hides the key and the model name from the
browser. It tries three Gemini models in order and logs which one served each
request (check the function logs in Netlify):
`gemini-2.5-flash → gemini-2.5-flash-lite-preview-06-17 → gemini-2.5-pro`.

## Notes

- No accounts. Progress (concepts, scores, analytics) lives in one browser.
- If a CDN (pdf.js / mammoth) fails to load, the app still runs; only that
  file format is disabled, with an honest message.
- Offline fallbacks for quiz / flashcards / graph only fire on the built-in
  genetics sample, so arbitrary uploads never get fabricated content.
