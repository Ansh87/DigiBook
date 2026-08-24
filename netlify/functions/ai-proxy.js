// DigiBook AI — Gemini proxy (updated model chain, Aug 2026)
// Reads GEMINI_API_KEY from Netlify environment variables.
// Never exposes the key or the underlying model name to the browser.
//
// Model chain updated to current GA models. Older 2.5 names are kept as
// last-resort fallbacks in case a given key/region still serves them, but
// the current GA models are tried first.

// Override the chain from Netlify without touching code: set the GEMINI_MODELS
// environment variable to a comma-separated list, highest priority first,
// e.g.  GEMINI_MODELS=gemini-3-flash,gemini-3.5-flash   then redeploy.
const DEFAULT_MODELS = [
  'gemini-3-flash',                       // best free-tier daily quota
  'gemini-3.5-flash',                     // newer flash fallback
  'gemini-flash-latest',                  // alias that tracks the current flash
  'gemini-2.5-flash-lite',                // lite fallback, generous limits
];
const MODELS = (process.env.GEMINI_MODELS || '')
  .split(',').map((m) => m.trim()).filter(Boolean).length
  ? process.env.GEMINI_MODELS.split(',').map((m) => m.trim()).filter(Boolean)
  : DEFAULT_MODELS;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };

  const key = process.env.GEMINI_API_KEY;

  // GET = lightweight self-check you can open in a browser.
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        keyConfigured: !!key,
        models: MODELS,
        note: 'Function is deployed. POST here to generate. If keyConfigured is false, set GEMINI_API_KEY in Netlify and redeploy.',
      }),
    };
  }

  if (event.httpMethod !== 'POST')
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  if (!key)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'GEMINI_API_KEY not configured' }) };

  let system = '', user = '', json = false;
  try {
    const b = JSON.parse(event.body || '{}');
    system = b.system || '';
    user = b.user || '';
    json = !!b.json;
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad request body' }) };
  }
  if (!user)
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing user prompt' }) };

  let lastErr = 'unknown';
  for (const model of MODELS) {
    try {
      const genConfig = {
        temperature: json ? 0.3 : 0.6,
        // Raised from 900. Structured (JSON) generations need more room, and the
        // 2.5 "thinking" models spend part of the budget before producing output.
        maxOutputTokens: json ? 4096 : 1200,
        ...(json ? { responseMimeType: 'application/json' } : {}),
      };
      // Gemini 2.5 models default to "thinking", which can consume the whole output
      // budget and return EMPTY text — the reason quiz/cards/graph silently fell back
      // to offline mode even when the tutor was Live. Turn thinking off for these.
      if (/2\.5|-latest/.test(model)) genConfig.thinkingConfig = { thinkingBudget: 0 };

      const payload = {
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: genConfig,
      };

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const errBody = await r.text();
        lastErr = `${model} -> HTTP ${r.status}: ${errBody.slice(0, 160)}`;
        console.log('[ai-proxy] ' + lastErr);
        continue; // try next model in the chain
      }
      const data = await r.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
      if (!text.trim()) {
        lastErr = `${model} -> empty response`;
        console.log('[ai-proxy] ' + lastErr);
        continue;
      }
      if (json) {
        // The quiz/cards/graph callers need parseable JSON. If this model returned
        // prose or a truncated object, fall through to the next model instead of
        // handing the browser something it will silently reject.
        const stripped = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        let ok = false;
        try { JSON.parse(stripped); ok = true; } catch (e) {
          const m = stripped.match(/[\[{][\s\S]*[\]}]/);
          if (m) { try { JSON.parse(m[0]); ok = true; } catch (e2) {} }
        }
        if (!ok) {
          lastErr = `${model} -> unparseable JSON (${stripped.slice(0, 80)}...)`;
          console.log('[ai-proxy] ' + lastErr);
          continue;
        }
      }
      console.log('[ai-proxy] served by ' + model);
      return { statusCode: 200, headers, body: JSON.stringify({ text, model }) };
    } catch (e) {
      lastErr = `${model} -> ${e.message}`;
      console.log('[ai-proxy] ' + lastErr);
    }
  }

  return {
    statusCode: 502,
    headers,
    body: JSON.stringify({ error: 'All models failed', detail: lastErr }),
  };
};
