import React, { useState } from 'react';
import { X, Wand2, Loader2, AlertTriangle } from 'lucide-react';
import { hasAiKey } from '../utils/ai';
import { tailorResume } from '../utils/aiActions';
import { normalizeResumeData } from '../utils/resumeData';

/**
 * "Tailor to Job Description" modal.
 * Sends the current resume + a pasted job description to the AI and replaces
 * the working resume with a keyword-optimized version (same schema, same facts).
 */
export default function TailorToJob({ open, onClose, resumeData, onApply, onNeedsKey }) {
  const [jobDescription, setJobDescription] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleTailor = async () => {
    setError('');
    if (!hasAiKey()) {
      onNeedsKey?.();
      return;
    }
    if (!jobDescription.trim()) {
      setError('Paste a job description first.');
      return;
    }
    setStatus('loading');
    try {
      const tailored = await tailorResume(resumeData, jobDescription.trim());
      const normalized = normalizeResumeData(tailored);
      onApply?.(normalized);
      setStatus('idle');
      setJobDescription('');
      onClose();
    } catch (err) {
      setStatus('idle');
      setError(err.message || 'Failed to tailor the resume.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onMouseDown={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Wand2 size={18} className="text-purple-600" /> Tailor to Job Description
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-slate-600">
            Paste the job description. The AI rewrites your wording and ordering to match the role and surface
            relevant keywords — it never invents employers, dates, or degrees.
          </p>

          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>This replaces your current wording. Tip: save a version in “My Resumes” first so you can revert.</span>
          </div>

          <textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            rows={10}
            placeholder="Paste the full job description here…"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleTailor}
            disabled={status === 'loading'}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
          >
            {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {status === 'loading' ? 'Tailoring…' : 'Tailor my resume'}
          </button>
        </div>
      </div>
    </div>
  );
}
