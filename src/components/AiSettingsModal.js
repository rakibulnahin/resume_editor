import React, { useEffect, useState } from 'react';
import { Check, Loader2, ExternalLink, ShieldCheck, AlertTriangle, Sparkles } from 'lucide-react';
import { PROVIDERS, getProvider, getAiConfig, saveAiConfig, clearAiConfig, callAi } from '../utils/ai';
import Modal from './ui/Modal';

/** AI settings always stacks above feature modals (z-index 200). */
const AI_SETTINGS_Z = 200;

export default function AiSettingsModal({ open, onClose, onSaved }) {
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(PROVIDERS.gemini.defaultModel);
  const [baseUrl, setBaseUrl] = useState('');
  const [testState, setTestState] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    if (!open) return;
    const existing = getAiConfig();
    if (existing) {
      setProvider(existing.provider || 'gemini');
      setApiKey(existing.apiKey || '');
      setModel(existing.model || getProvider(existing.provider).defaultModel);
      setBaseUrl(existing.baseUrl || '');
    }
    setTestState({ status: 'idle', message: '' });
  }, [open]);

  const providerInfo = getProvider(provider);

  const handleProviderChange = (nextProvider) => {
    setProvider(nextProvider);
    const info = getProvider(nextProvider);
    setModel(info.defaultModel || '');
    setBaseUrl(info.baseUrl || '');
    setTestState({ status: 'idle', message: '' });
  };

  const buildConfig = () => ({ provider, apiKey: apiKey.trim(), model: model.trim(), baseUrl: baseUrl.trim() });

  const handleSave = () => {
    saveAiConfig(buildConfig());
    onSaved?.();
    onClose();
  };

  const handleClear = () => {
    clearAiConfig();
    setApiKey('');
    setTestState({ status: 'idle', message: '' });
    onSaved?.();
  };

  const handleTest = async () => {
    saveAiConfig(buildConfig());
    setTestState({ status: 'loading', message: '' });
    try {
      const reply = await callAi({ user: 'Reply with the single word: OK', maxTokens: 5, temperature: 0 });
      if (reply && reply.toLowerCase().includes('ok')) {
        setTestState({ status: 'success', message: 'Connection works!' });
      } else {
        setTestState({ status: 'success', message: `Connected. Model replied: "${reply.slice(0, 40)}"` });
      }
      onSaved?.();
    } catch (error) {
      setTestState({ status: 'error', message: error.message || 'Test failed.' });
    }
  };

  const footer = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button type="button" onClick={handleClear} className="text-sm text-slate-500 hover:text-red-600 text-left">
        Clear key
      </button>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleTest}
          disabled={!apiKey.trim() || testState.status === 'loading'}
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
        >
          Test
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="AI Settings"
      icon={<Sparkles size={18} className="shrink-0 text-purple-600" />}
      size="md"
      zIndex={AI_SETTINGS_Z}
      footer={footer}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <span>
            Your key is stored <strong>only in this browser</strong> (localStorage) and used to call the
            provider directly. It is never sent to any server we run.
          </span>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Provider</label>
          <select
            value={provider}
            onChange={(event) => handleProviderChange(event.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(PROVIDERS).map((info) => (
              <option key={info.id} value={info.id}>{info.label}</option>
            ))}
          </select>
          {providerInfo.note && <p className="text-xs text-slate-500 mt-1">{providerInfo.note}</p>}
          {!providerInfo.browserFriendly && (
            <p className="flex items-center gap-1 text-xs text-amber-700 mt-1">
              <AlertTriangle size={13} /> This provider may be blocked by CORS in the browser.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder={providerInfo.keyHint || 'Paste your API key'}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          {providerInfo.getKeyUrl && (
            <a
              href={providerInfo.getKeyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
            >
              Get a free key <ExternalLink size={12} />
            </a>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Model</label>
          <input
            type="text"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            list="ai-model-options"
            placeholder={providerInfo.defaultModel || 'model name'}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <datalist id="ai-model-options">
            {(providerInfo.models || []).map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>

        {(provider === 'custom' || provider === 'openai') && (
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1">
              Base URL {provider === 'openai' && <span className="font-normal text-slate-400">(optional proxy)</span>}
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="https://your-endpoint/v1"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {testState.status !== 'idle' && (
          <div
            className={`text-sm rounded-lg p-3 ${
              testState.status === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : testState.status === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            {testState.status === 'loading' && (
              <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Testing…</span>
            )}
            {testState.status === 'success' && (
              <span className="flex items-center gap-2"><Check size={15} /> {testState.message}</span>
            )}
            {testState.status === 'error' && testState.message}
          </div>
        )}
      </div>
    </Modal>
  );
}
