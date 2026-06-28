import React from 'react';
import ResumePreview from './ResumePreview';

/**
 * Side-by-side before/after comparison after tailoring.
 */
export default function TailorCompare({ before, after, templateId, onUseAfter, onKeepBefore, onBack }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Review the tailored version against your original. Identity fields (name, contact, employers, dates) are unchanged.
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col rounded-xl border-2 border-slate-200 bg-slate-50/80">
          <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
            Before
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3 max-h-[50vh] lg:max-h-[58vh]">
            <div className="origin-top scale-[0.92] sm:scale-95">
              <ResumePreview resumeData={before} templateId={templateId} isMobile compact />
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-xl border-2 border-purple-300 bg-purple-50/50">
          <div className="shrink-0 border-b border-purple-200 bg-purple-600 px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-white">
            After (tailored)
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3 max-h-[50vh] lg:max-h-[58vh]">
            <div className="origin-top scale-[0.92] sm:scale-95">
              <ResumePreview resumeData={after} templateId={templateId} isMobile compact />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          ← Edit job description
        </button>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <button
            type="button"
            onClick={onKeepBefore}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Keep original
          </button>
          <button
            type="button"
            onClick={onUseAfter}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Use tailored version
          </button>
        </div>
      </div>
    </div>
  );
}
