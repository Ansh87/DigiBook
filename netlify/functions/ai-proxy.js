// DigiBook AI — Gemini proxy (updated model chain, Aug 2026)
// Reads GEMINI_API_KEY from Netlify environment variables.
// Never exposes the key or the underlying model name to the browser.
//
// Model chain updated to current GA models. Older 2.5 names are kept as
// last-resort fallbacks in case a given key/region still serves them, but
// the current GA models are tried first.

const MODELS = [
  'gemini-2.5-flash',                     // widely available, stable
  'gemini-2.0-flash',                     // broad fallback
  'gemini-flash-latest',                  // alias that tracks the current flash
  'gemini-2.5-flash-lite',                // lite fallback (non-preview name)
];

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
        maxOutputTokens: json ? 2048 : 1200,
        ...(json ? { responseMimeType: 'application/json' } : {}),
      };
      // Gemini 2.5 models default to "thinking", which can consume the whole output
      // budget and return EMPTY text — the reason quiz/cards/graph silently fell back
      // to offline mode even when the tutor was Live. Turn thinking off for these.
      if (/2\.5/.test(model)) genConfig.thinkingConfig = { thinkingBudget: 0 };

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
