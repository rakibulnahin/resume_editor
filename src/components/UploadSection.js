import { Upload } from 'lucide-react';

export default function UploadSection({ onUpload, error }) {
  return (
    <div className="m-8 flex mx-auto">
      <div className="rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
        <Upload size={48} className="mx-auto text-blue-600 mb-4" strokeWidth={1.5} />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Your Resume JSON</h2>
        <p className="text-slate-600 mb-6 max-w-sm mx-auto">
          Select a JSON file with your resume data to get started editing and customizing.
        </p>
        <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer transition-colors shadow-lg hover:shadow-xl">
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

      <div className="ml-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-3">Expected JSON Schema</h3>
        <pre className="text-xs bg-slate-100 p-4 rounded-lg overflow-auto text-slate-700">
{`{
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
      </div>
    </div>
  );
}
