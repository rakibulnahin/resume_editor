import React, { useState } from 'react';
import { Wand2, Loader2, AlertTriangle } from 'lucide-react';
import { hasAiKey, cancelActiveAiRequest } from '../utils/ai';
import { tailorResume } from '../utils/aiActions';
import { ensureResumeShape } from '../utils/resumeData';
import Modal from './ui/Modal';
import TailorCompare from './TailorCompare';

/**
 * "Tailor to Job Description" modal with before/after review step.
 */
export default function TailorToJob({
  open,
  onClose,
  resumeData,
  onApply,
  onNeedsKey,
  templateId,
}) {
  const [jobDescription, setJobDescription] = useState('');
  const [step, setStep] = useState('input'); // input | loading | compare
  const [error, setError] = useState('');
  const [beforeData, setBeforeData] = useState(null);
  const [afterData, setAfterData] = useState(null);

  const resetAndClose = () => {
    setStep('input');
    setError('');
    setBeforeData(null);
    setAfterData(null);
    onClose();
  };

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
    setStep('loading');
    const snapshot = JSON.parse(JSON.stringify(resumeData));
    setBeforeData(snapshot);
    try {
      const tailored = await tailorResume(snapshot, jobDescription.trim());
      const normalized = ensureResumeShape(tailored);
      setAfterData(normalized);
      setStep('compare');
    } catch (err) {
      setStep('input');
      setError(err.message || 'Failed to tailor the resume.');
    }
  };

  const handleUseAfter = () => {
    onApply?.(afterData);
    setJobDescription('');
    setStep('input');
    setBeforeData(null);
    setAfterData(null);
    onClose();
  };

  const handleKeepBefore = () => {
    setStep('input');
    setAfterData(null);
  };

  const loading = step === 'loading';

  const footer = step === 'input' ? (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      {loading ? (
        <button
          type="button"
          onClick={() => {
            cancelActiveAiRequest();
            setStep('input');
            setError('Cancelled.');
          }}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
        >
          Cancel
        </button>
      ) : (
        <span className="hidden sm:block" />
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={resetAndClose}
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Close
        </button>
        <button
          type="button"
          onClick={handleTailor}
          disabled={loading}
          className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          {loading ? 'Tailoring…' : 'Tailor my resume'}
        </button>
      </div>
    </div>
  ) : null;

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title={step === 'compare' ? 'Before & after' : 'Tailor to Job Description'}
      icon={<Wand2 size={18} className="shrink-0 text-purple-600" />}
      size={step === 'compare' ? 'full' : 'lg'}
      zIndex={100}
      footer={footer}
    >
      {step === 'compare' && beforeData && afterData ? (
        <TailorCompare
          before={beforeData}
          after={afterData}
          templateId={templateId}
          onUseAfter={handleUseAfter}
          onKeepBefore={handleKeepBefore}
          onBack={() => setStep('input')}
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Paste the job description. The AI rewrites your wording and ordering to match the role and surface
            relevant keywords — it never invents employers, dates, or degrees.
          </p>

          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>Tip: save a version in “My Resumes” first so you can revert if needed.</span>
          </div>

          <textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            rows={10}
            disabled={loading}
            placeholder="Paste the full job description here…"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y disabled:opacity-60"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {loading && (
            <p className="text-xs text-slate-500">
              AI is working… up to 90s. Cancel anytime, or switch to Google Gemini for speed.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
