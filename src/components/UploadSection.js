import { Check, ChevronDown, ChevronUp, Copy, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { normalizeResumeData } from '../utils/resumeData';

export default function UploadSection({ resumeData, setResumeData, onUpload, error }) {
  const [showSchemaPreview, setShowSchemaPreview] = useState(true);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setJsonText(JSON.stringify(resumeData || {}, null, 2));
    setJsonError('');
  }, [resumeData]);

  const handleJsonTextChange = (value) => {
    setJsonText(value);

    if (!setResumeData) return;

    try {
      const parsedData = JSON.parse(value);
      setResumeData(normalizeResumeData(parsedData));
      setJsonError('');
    } catch (err) {
      setJsonError('Invalid JSON. Resume data will update after the JSON is valid.');
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
    <div className="m-4 md:m-8 flex flex-col md:flex-row max-w-6xl mx-auto gap-6">
  {/* Left Box: Resume JSON Editor */}
  <div className="w-full md:w-1/2 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm flex flex-col min-w-0">
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-base sm:text-lg font-bold text-slate-900">Resume JSON</h2>
      <div className="flex shrink-0 items-center gap-2">
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
    <textarea
      value={jsonText}
      onChange={(event) => handleJsonTextChange(event.target.value)}
      spellCheck="false"
      className="min-h-80 flex-1 resize-y rounded-lg border border-slate-300 bg-slate-950 px-4 py-3 font-mono text-xs leading-5 text-slate-100 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
    />
    {(error || jsonError) && (
      <p className="mt-3 text-sm font-medium text-red-600">{error || jsonError}</p>
    )}
  </div>

  {/* Right Box: Schema Preview Container */}
  <div className="w-full md:w-1/2 p-4 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-w-0">
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
