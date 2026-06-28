import React from 'react';
import { Sparkles, X, KeyRound } from 'lucide-react';
import { dismissAiBanner } from '../utils/ai';

export default function AiSetupBanner({ onConfigure, onDismiss }) {
  const handleDismiss = () => {
    dismissAiBanner();
    onDismiss?.();
  };

  return (
    <div
      role="status"
      className="border-b border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
            <KeyRound size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              AI features need your API key
            </p>
            <p className="text-xs text-slate-600 sm:text-sm">
              Smart Import, Tailor to JD, and bullet improvements run in your browser with a free key from Google Gemini or OpenRouter. Takes about 30 seconds.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onConfigure}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <Sparkles size={16} />
            Set up AI
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg p-2 text-slate-500 hover:bg-white/60 hover:text-slate-700"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
