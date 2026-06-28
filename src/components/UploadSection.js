import { Check, ChevronDown, ChevronUp, Copy, Upload, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ensureResumeShape } from '../utils/resumeData';

export default function UploadSection({ resumeData, setResumeData, onUpload, error, onSmartImport }) {
  const [showSchemaPreview, setShowSchemaPreview] = useState(true);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [copied, setCopied] = useState(false);
  const [jsonDirty, setJsonDirty] = useState(false);

  useEffect(() => {
    setJsonText(JSON.stringify(resumeData || {}, null, 2));
    setJsonError('');
    setJsonDirty(false);
  }, [resumeData]);

  const applyJsonToEditor = (value = jsonText) => {
    if (!setResumeData) return false;
    try {
      const parsedData = JSON.parse(value);
      setResumeData(ensureResumeShape(parsedData));
      setJsonError('');
      setJsonDirty(false);
      return true;
    } catch (err) {
      setJsonError('Invalid JSON. Fix syntax errors, then click Apply to editor.');
      return false;
    }
  };

  const handleJsonTextChange = (value) => {
    setJsonText(value);

    if (!setResumeData) return;

    try {
      const parsedData = JSON.parse(value);
      setResumeData(ensureResumeShape(parsedData));
      setJsonError('');
      setJsonDirty(false);
    } catch (err) {
      setJsonDirty(true);
      setJsonError('Invalid JSON — fix errors, then click Apply to editor.');
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setJsonError('Unable to copy JSON from this browser.');
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:gap-6">
  {/* Left Box: Resume JSON Editor */}
  <div className="flex w-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:w-1/2">
    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-base font-bold text-slate-900 sm:text-lg">Resume JSON</h2>
      <div className="flex flex-wrap items-center gap-2">
        {onSmartImport && (
          <button
            type="button"
            onClick={onSmartImport}
            className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs sm:text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
          >
            <Sparkles size={16} />
            Import PDF/Word
          </button>
        )}
        <button
          type="button"
          onClick={() => applyJsonToEditor()}
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs sm:text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100"
        >
          Apply to editor
        </button>
        <button
          type="button"
          onClick={handleCopyJson}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <label className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs sm:text-sm font-medium text-white cursor-pointer transition-colors hover:bg-blue-700">
          <Upload size={16} />
          Upload
          <input
            type="file"
            accept=".json"
            onChange={onUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
    {jsonDirty && !jsonError && (
      <p className="mb-2 text-xs text-amber-700">JSON changed — click <strong>Apply to editor</strong> to update the form and preview.</p>
    )}
    <textarea
      value={jsonText}
      onChange={(event) => handleJsonTextChange(event.target.value)}
      onBlur={() => {
        if (jsonDirty && !jsonError) applyJsonToEditor();
      }}
      spellCheck="false"
      className="min-h-80 flex-1 resize-y rounded-lg border border-slate-300 bg-slate-950 px-4 py-3 font-mono text-xs leading-5 text-slate-100 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
    />
    {(error || jsonError) && (
      <p className="mt-3 text-sm font-medium text-red-600">{error || jsonError}</p>
    )}
  </div>

  {/* Right Box: Schema Preview Container */}
  <div className="flex w-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:w-1/2">
    <div className="mb-3 flex items-center justify-between gap-3">
      <h3 className="text-base sm:text-lg font-bold text-slate-900">Instructions</h3>
      <button
        type="button"
        onClick={() => setShowSchemaPreview(prevShowSchemaPreview => !prevShowSchemaPreview)}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        aria-label={showSchemaPreview ? 'Hide instructions' : 'Show instructions'}
        aria-expanded={showSchemaPreview}
      >
        {showSchemaPreview ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
    </div>

    {showSchemaPreview && (
      <pre className="max-h-80 overflow-auto text-[10px] sm:text-xs bg-slate-100 p-4 rounded-lg text-slate-700 whitespace-pre-wrap md:whitespace-pre break-words md:break-normal">
{`

Step 1 (Build Resume)
Build Your resume add as per the given sections

Step 2 (Download Resume )
Download the Resume docx file.
Download the json file for reusing your details (Important)

Step 3 (Edit Resume)
Upload the JSON file else go for step 1 & 2
Start modifying and then step 2

JSON schmea below.
{
'
-- If you already have a json file with the following schema

  "name": "Your Name",
  "address": "City, Country",
  "phone": "+1234567890",
  "email": "email@example.com",
  "contacts": [{"annotation": "LinkedIn", "link": "url", "showAnnotation": true}],
  "profile": "Professional summary...",
  "experience": [{"company": "", "position": "", "address": "", "date": "", "description": [""]}],
  "skills": [{"type": "Programming Languages", "value": ["JavaScript", "React"]}],
  "projects": [{"name": "App Changer", "description": ["helps changing app"]}],
  "education": [{"school": "", "date": "", "details": ""}],
  "miscellaneous": [{"type": "description"}]
}`}
      </pre>
    )}
  </div>
</div>
  );
}
