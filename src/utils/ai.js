/**
 * Bring-Your-Own-Key (BYOK) AI client — browser-only, no backend.
 *
 * Verified OpenRouter free models (Jun 2026): openrouter.ai/collections/free-models
 * Do NOT send response_format/json_object to OpenRouter free models — most reject
 * or hang on it. Use prompt-based JSON + parseJsonFromText instead.
 */

const CONFIG_KEY = 'resume_ai_config';

/** Shared abort controller so UI can cancel in-flight requests. */
let activeAbort = null;

export function cancelActiveAiRequest() {
  if (activeAbort) {
    activeAbort.abort();
    activeAbort = null;
  }
}

export const PROVIDERS = {
  gemini: {
    id: 'gemini',
    label: 'Google Gemini (recommended — fastest free)',
    type: 'gemini',
    defaultModel: 'gemini-2.0-flash',
    models: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'],
    browserFriendly: true,
    supportsJsonMode: true,
    keyHint: 'AIza…',
    getKeyUrl: 'https://aistudio.google.com/apikey',
    note: 'Free tier at Google AI Studio. Fastest reliable option — get a key in 30 seconds.',
  },
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    type: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openrouter/free',
    models: [
      'openrouter/free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemma-4-26b-a4b-it:free',
      'google/gemma-4-31b-it:free',
      'openai/gpt-oss-120b:free',
    ],
    browserFriendly: true,
    supportsJsonMode: false,
    keyHint: 'sk-or-…',
    getKeyUrl: 'https://openrouter.ai/keys',
    note: 'Use "openrouter/free" to auto-pick an available free model. Avoid huge models (550B) — they queue for minutes.',
  },
  groq: {
    id: 'groq',
    label: 'Groq',
    type: 'openai',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.1-8b-instant',
    models: ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile'],
    browserFriendly: true,
    supportsJsonMode: false,
    keyHint: 'gsk_…',
    getKeyUrl: 'https://console.groq.com/keys',
    note: 'Very fast inference. Free tier available.',
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic Claude',
    type: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-haiku-latest',
    models: ['claude-3-5-haiku-latest', 'claude-3-5-sonnet-latest'],
    browserFriendly: true,
    supportsJsonMode: false,
    keyHint: 'sk-ant-…',
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
    note: 'Paid API. Supports direct browser access.',
  },
  custom: {
    id: 'custom',
    label: 'Custom (OpenAI-compatible)',
    type: 'openai',
    baseUrl: '',
    defaultModel: '',
    models: [],
    browserFriendly: true,
    supportsJsonMode: false,
    keyHint: '',
    getKeyUrl: '',
    note: 'LiteLLM, Ollama (localhost), or any OpenAI-compatible endpoint.',
  },
};

export function getProvider(id) {
  return PROVIDERS[id] || PROVIDERS.gemini;
}

export function getAiConfig() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('ai: failed to read config', error);
    return null;
  }
}

export function saveAiConfig(config) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearAiConfig() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CONFIG_KEY);
}

export function hasAiKey() {
  const config = getAiConfig();
  return Boolean(config && config.apiKey);
}

const AI_BANNER_KEY = 'resume_ai_banner_dismissed';

export function shouldShowAiBanner() {
  if (typeof window === 'undefined') return false;
  return !hasAiKey() && !window.localStorage.getItem(AI_BANNER_KEY);
}

export function dismissAiBanner() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AI_BANNER_KEY, '1');
}

class AiError extends Error {}

function parseErrorBody(bodyText) {
  try {
    const parsed = JSON.parse(bodyText);
    return parsed?.error?.message || parsed?.message || bodyText;
  } catch {
    return bodyText;
  }
}

function describeHttpError(status, bodyText) {
  const detail = parseErrorBody(bodyText);
  if (status === 401 || status === 403) {
    return `Authentication failed — check your API key. ${detail ? detail.slice(0, 200) : ''}`.trim();
  }
  if (status === 429) {
    return `Rate limit hit. Wait 30s or switch to Google Gemini (free, fast). ${detail ? detail.slice(0, 150) : ''}`.trim();
  }
  if (status === 404) {
    return `Model not found: "${detail}". Pick a model from the dropdown or use openrouter/free.`;
  }
  if (status === 402) {
    return 'OpenRouter credits required for this model. Use a :free model or add credits at openrouter.ai/settings/credits.';
  }
  return `Request failed (HTTP ${status}). ${detail ? String(detail).slice(0, 300) : ''}`.trim();
}

async function safeFetch(url, options, timeoutMs = 90000) {
  cancelActiveAiRequest();
  activeAbort = new AbortController();
  const timer = setTimeout(() => activeAbort.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(url, {
      ...options,
      signal: activeAbort.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AiError(
        `Timed out after ${Math.round(timeoutMs / 1000)}s. Try Google Gemini (fastest) or openrouter/free with a smaller model.`
      );
    }
    throw new AiError(
      'Network error — could not reach the provider. If using OpenAI directly, try Google Gemini or Groq instead (CORS-friendly).'
    );
  } finally {
    clearTimeout(timer);
    activeAbort = null;
  }

  if (!response.ok) {
    let bodyText = '';
    try {
      bodyText = await response.text();
    } catch {
      bodyText = '';
    }
    throw new AiError(describeHttpError(response.status, bodyText));
  }
  return response.json();
}

async function callOpenAiCompatible(config, { system, user, temperature, json, maxTokens, timeoutMs }) {
  const provider = getProvider(config.provider);
  const baseUrl = (config.baseUrl || provider.baseUrl || '').replace(/\/$/, '');
  if (!baseUrl) throw new AiError('Missing base URL for this provider.');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  };
  if (config.provider === 'openrouter' && typeof window !== 'undefined') {
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'Resume Editor';
  }

  const body = {
    model: config.model || provider.defaultModel,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      { role: 'user', content: user },
    ],
    temperature: temperature ?? 0.4,
    max_tokens: maxTokens || 2048,
  };
  // Only OpenAI paid + some providers support json_object — NOT OpenRouter free models.
  if (json && provider.supportsJsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const data = await safeFetch(
    `${baseUrl}/chat/completions`,
    { method: 'POST', headers, body: JSON.stringify(body) },
    timeoutMs
  );

  const content = data?.choices?.[0]?.message?.content;
  if (!content && content !== '') {
    throw new AiError('Empty response from model. Try openrouter/free or Google Gemini.');
  }
  return content;
}

async function callGemini(config, { system, user, temperature, json, maxTokens, timeoutMs }) {
  const provider = getProvider('gemini');
  const model = config.model || provider.defaultModel;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(config.apiKey)}`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: {
      temperature: temperature ?? 0.4,
      maxOutputTokens: maxTokens || 2048,
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  const data = await safeFetch(
    url,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    timeoutMs
  );

  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((part) => part.text || '').join('');
  if (!text) {
    const blockReason = data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason;
    throw new AiError(blockReason ? `Gemini blocked the response: ${blockReason}` : 'Empty response from Gemini.');
  }
  return text;
}

async function callAnthropic(config, { system, user, temperature, json, maxTokens, timeoutMs }) {
  const provider = getProvider('anthropic');
  const baseUrl = (config.baseUrl || provider.baseUrl).replace(/\/$/, '');
  const systemText = json
    ? `${system || ''}\nRespond with valid JSON only, no markdown fences.`.trim()
    : system;

  const data = await safeFetch(
    `${baseUrl}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: config.model || provider.defaultModel,
        max_tokens: maxTokens || 2048,
        temperature: temperature ?? 0.4,
        ...(systemText ? { system: systemText } : {}),
        messages: [{ role: 'user', content: user }],
      }),
    },
    timeoutMs
  );

  const blocks = data?.content || [];
  return blocks.map((block) => block.text || '').join('');
}

/**
 * @param {{system?: string, user: string, temperature?: number, json?: boolean, maxTokens?: number, timeoutMs?: number}} params
 */
export async function callAi(params) {
  const config = getAiConfig();
  if (!config || !config.apiKey) {
    throw new AiError('No API key set. Open AI Settings and add your key first.');
  }
  const provider = getProvider(config.provider);
  const timeoutMs = params.timeoutMs ?? (params.maxTokens > 1000 ? 90000 : 45000);

  if (provider.type === 'gemini') return callGemini(config, { ...params, timeoutMs });
  if (provider.type === 'anthropic') return callAnthropic(config, { ...params, timeoutMs });
  return callOpenAiCompatible(config, { ...params, timeoutMs });
}

export function parseJsonFromText(text) {
  if (!text) throw new Error('Empty response from the model.');
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error('Could not parse JSON from model response. Try Google Gemini or a smaller model.');
  }
}
