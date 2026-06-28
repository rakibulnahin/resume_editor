import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { hasAiKey } from '../utils/ai';
import { improveBullet, improveProfile } from '../utils/aiActions';

const STYLE_OPTIONS = [
  { id: 'impact', label: 'Impact' },
  { id: 'concise', label: 'Concise' },
  { id: 'senior', label: 'Senior tone' },
];

/**
 * Small inline "improve with AI" control. Shows a sparkle button that opens a
 * style menu (Impact / Concise / Senior) and rewrites the given text in place.
 *
 * @param {{ text: string, mode?: 'bullet'|'profile', context?: string,
 *           onResult: (newText: string) => void, onNeedsKey?: () => void }} props
 */
export default function AiImproveButton({ text, mode = 'bullet', context = '', onResult, onNeedsKey }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const disabled = !text || !text.trim();

  const handleClick = () => {
    setError('');
    if (!hasAiKey()) {
      onNeedsKey?.();
      return;
    }
    setOpen((value) => !value);
  };

  const run = async (style) => {
    setOpen(false);
    setLoading(true);
    setError('');
    try {
      const improved =
        mode === 'profile'
          ? await improveProfile(text, { style })
          : await improveBullet(text, { style, context });
      if (improved) onResult(improved);
    } catch (err) {
      setError(err.message || 'AI request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        title={disabled ? 'Add some text first' : 'Improve with AI'}
        className="flex items-center justify-center p-2 rounded text-purple-600 hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
          <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Rewrite as</div>
          {STYLE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => run(option.id)}
              className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-purple-50"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-2 shadow">
          {error}
        </div>
      )}
    </div>
  );
}
