import React, { useState } from 'react';
import { Upload, FileText, Loader2, Sparkles } from 'lucide-react';
import { hasAiKey, cancelActiveAiRequest } from '../utils/ai';
import { parseResumeText } from '../utils/aiActions';
import { extractTextFromFile } from '../utils/extractText';
import { ensureResumeShape } from '../utils/resumeData';
import Modal from './ui/Modal';

export default function SmartImport({ open, onClose, onApply, onNeedsKey }) {
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setFileName(file.name);
    setStatus('extracting');
    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) {
        setError('Could not read any text from that file. Try another file or paste the text below.');
      }
      setRawText(text.trim());
    } catch (err) {
      setError(err.message || 'Failed to read the file.');
    } finally {
      setStatus('idle');
    }
  };

  const handleConvert = async () => {
    setError('');
    if (!hasAiKey()) {
      onNeedsKey?.();
      return;
    }
    if (!rawText.trim()) {
      setError('Upload a file or paste your resume text first.');
      return;
    }
    setStatus('parsing');
    try {
      const parsed = await parseResumeText(rawText.trim());
      onApply?.(ensureResumeShape(parsed));
      setRawText('');
      setFileName('');
      setStatus('idle');
      onClose();
    } catch (err) {
      setStatus('idle');
      setError(err.message || 'Failed to convert the resume.');
    }
  };

  const busy = status !== 'idle';

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      {status === 'parsing' ? (
        <button
          type="button"
          onClick={() => { cancelActiveAiRequest(); setStatus('idle'); setError('Cancelled.'); }}
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
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Close
        </button>
        <button
          type="button"
          onClick={handleConvert}
          disabled={busy || !rawText.trim()}
          className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
        >
          {status === 'parsing' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {status === 'parsing' ? 'Converting…' : 'Convert with AI'}
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Smart Import (PDF / Word / Text)"
      icon={<Sparkles size={18} className="shrink-0 text-blue-600" />}
      size="lg"
      zIndex={100}
      footer={footer}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Upload an existing resume (<strong>.pdf</strong>, <strong>.docx</strong> or <strong>.txt</strong>) or
          paste its text. The AI converts it into editable fields — review the extracted text first, then convert.
        </p>

        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          {status === 'extracting' ? (
            <Loader2 size={28} className="text-blue-600 animate-spin" />
          ) : (
            <Upload size={28} className="text-blue-600" />
          )}
          <span className="text-sm font-medium text-slate-700">
            {status === 'extracting' ? 'Reading file…' : 'Choose a PDF, DOCX or TXT file'}
          </span>
          {fileName && <span className="text-xs text-slate-500 flex items-center gap-1"><FileText size={12} /> {fileName}</span>}
          <input type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={handleFile} disabled={busy} />
        </label>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Extracted / pasted text (editable)
          </label>
          <textarea
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            rows={8}
            placeholder="…or paste your resume text here"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {status === 'parsing' && (
          <p className="text-xs text-slate-500">
            Sending to AI… large resumes can take up to 90s. Use Google Gemini for fastest results.
          </p>
        )}
      </div>
    </Modal>
  );
}
