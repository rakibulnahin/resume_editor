/**
 * Bring-Your-Own-Key (BYOK) AI client.
 *
 * The app has no backend, so AI calls go straight from the browser to the
 * provider using a key the user pastes in (stored only in localStorage). This
 * keeps the project's "no signup / privacy" promise: the key never touches any
 * server we run.
 *
 * Provider reality check (CORS): Google Gemini, OpenRouter, Groq and Anthropic
 * allow direct browser calls; OpenAI usually blocks them. The UI nudges users
 * toward browser-friendly providers and surfaces CORS errors clearly.
 */

const CONFIG_KEY = 'resume_ai_config';

export const PROVIDERS = {
  gemini: {
    id: 'gemini',
    label: 'Google Gemini',
    type: 'gemini',
    defaultModel: 'gemini-2.0-flash',
    models: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'],
    browserFriendly: true,
    keyHint: 'AIza…',
    getKeyUrl: 'https://aistudio.google.com/apikey',
    note: 'Recommended — generous free tier and works directly from the browser.',
  },
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    type: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    models: [
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemini-2.0-flash-exp:free',
      'mistralai/mistral-small-3.1-24b-instruct:free',
      'google/gemini-2.0-flash-001',
      'openai/gpt-4o-mini',
    ],
    browserFriendly: true,
    keyHint: 'sk-or-…',
    getKeyUrl: 'https://openrouter.ai/keys',
    note: 'One key, 200+ models. Tip: huge models (e.g. Nemotron 550B) on the free tier are very slow — pick a fast model like Llama 3.3 70B or Gemini Flash.',
  },
  groq: {
    id: 'groq',
    label: 'Groq',
    type: 'openai',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
    browserFriendly: true,
    keyHint: 'gsk_…',
    getKeyUrl: 'https://console.groq.com/keys',
    note: 'Very fast, free tier. Usually works from the browser.',
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic Claude',
    type: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-haiku-latest',
    models: ['claude-3-5-haiku-latest', 'claude-3-5-sonnet-latest'],
    browserFriendly: true,
    keyHint: 'sk-ant-…',
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
    note: 'Supports direct browser access.',
  },
  openai: {
    id: 'openai',
    label: 'OpenAI',
    type: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o'],
    browserFriendly: false,
    keyHint: 'sk-…',
    getKeyUrl: 'https://platform.openai.com/api-keys',
    note: 'May be blocked by CORS in the browser. Use a custom base URL/proxy if calls fail.',
  },
  custom: {
    id: 'custom',
    label: 'Custom (OpenAI-compatible)',
    type: 'openai',
    baseUrl: '',
    defaultModel: '',
    models: [],
    browserFriendly: true,
    keyHint: '',
    getKeyUrl: '',
    note: 'Point at any OpenAI-compatible endpoint (LiteLLM, Ollama, Together, a proxy…).',
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

class AiError extends Error {}

function describeHttpError(status, bodyText) {
  if (status === 401 || status === 403) {
    return 'Authentication failed — please check that your API key is correct and active.';
  }
  if (status === 429) {
    return 'Rate limit or quota reached for your key. Wait a moment or check your provider plan.';
  }
  if (status === 404) {
    return 'Model or endpoint not found. Double-check the model name (and base URL for custom providers).';
  }
  return `Request failed (HTTP ${status}). ${bodyText ? bodyText.slice(0, 300) : ''}`.trim();
}

async function safeFetch(url, options, timeoutMs = 120000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AiError(
        `The request timed out after ${Math.round(timeoutMs / 1000)}s. The selected model is likely slow or busy — switch to a faster/smaller model (e.g. a Llama 3.3 70B or Gemini Flash) in AI Settings.`
      );
    }
    // A network/TypeError here is almost always CORS or connectivity.
    throw new AiError(
      'Could not reach the provider from the browser. This is usually a CORS block — try a browser-friendly provider (Gemini, OpenRouter, Groq) or a custom proxy base URL.'
    );
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    let bodyText = '';
    try {
      bodyText = await response.text();
    } catch (error) {
      bodyText = '';
    }
    throw new AiError(describeHttpError(response.status, bodyText));
  }
  return response.json();
}

async function callOpenAiCompatible(config, { system, user, temperature, json, maxTokens }) {
  const provider = getProvider(config.provider);
  const baseUrl = (config.baseUrl || provider.baseUrl || '').replace(/\/$/, '');
  if (!baseUrl) throw new AiError('Missing base URL for this provider.');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  };
  // OpenRouter recommends these attribution headers.
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
  if (json) body.response_format = { type: 'json_object' };

  const data = await safeFetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return data?.choices?.[0]?.message?.content ?? '';
}

async function callGemini(config, { system, user, temperature, json, maxTokens }) {
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

  const data = await safeFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text || '').join('');
}

async function callAnthropic(config, { system, user, temperature, json, maxTokens }) {
  const provider = getProvider('anthropic');
  const baseUrl = (config.baseUrl || provider.baseUrl).replace(/\/$/, '');
  const systemText = json
    ? `${system || ''}\nRespond with valid JSON only, no markdown fences.`.trim()
    : system;

  const data = await safeFetch(`${baseUrl}/messages`, {
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
  });

  const blocks = data?.content || [];
  return blocks.map((block) => block.text || '').join('');
}

/**
 * Main entry point. Routes to the configured provider and returns the model's
 * text output.
 * @param {{system?: string, user: string, temperature?: number, json?: boolean, maxTokens?: number}} params
 * @returns {Promise<string>}
 */
export async function callAi(params) {
  const config = getAiConfig();
  if (!config || !config.apiKey) {
    throw new AiError('No API key set. Open AI Settings and add your key first.');
  }
  const provider = getProvider(config.provider);

  if (provider.type === 'gemini') return callGemini(config, params);
  if (provider.type === 'anthropic') return callAnthropic(config, params);
  return callOpenAiCompatible(config, params);
}

/** Extract a JSON object from a model response that may be wrapped in fences. */
export function parseJsonFromText(text) {
  if (!text) throw new Error('Empty response from the model.');
  let cleaned = text.trim();
  // Strip ```json ... ``` or ``` ... ``` fences.
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    // Fall back to the first {...} block.
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error('Could not parse JSON from the model response.');
  }
}
