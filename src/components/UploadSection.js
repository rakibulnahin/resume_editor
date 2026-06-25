import { ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { useState } from 'react';

export default function UploadSection({ onUpload, error }) {
  const [showSchemaPreview, setShowSchemaPreview] = useState(true);

  return (
    <div className="m-4 md:m-8 flex flex-col md:flex-row max-w-6xl mx-auto gap-6">
  {/* Left Box: Upload Drag/Drop Area */}
  <div className="w-full md:w-1/2 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-6 sm:p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col justify-center items-center">
    <Upload size={48} className="mx-auto text-blue-600 mb-4" strokeWidth={1.5} />
    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Upload Your Resume JSON</h2>
    <p className="text-sm sm:text-base text-slate-600 mb-6 max-w-sm mx-auto">
      Select a JSON file with your resume data to get started editing and customizing.
    </p>
    <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base">
      <Upload size={18} />
      Choose JSON File
      <input
        type="file"
        accept=".json"
        onChange={onUpload}
        className="hidden"
      />
    </label>
    {error && (
      <p className="mt-4 text-red-600 text-sm font-medium">{error}</p>
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
