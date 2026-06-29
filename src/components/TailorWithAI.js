import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { normalizeResumeData } from '../utils/resumeData';

const MODEL_OPTIONS = [
  { label: 'OpenRouter Auto', value: 'openrouter/auto' },
  { label: 'DeepSeek Chat', value: 'deepseek/deepseek-chat' },
  { label: 'Llama 3.1 8B Instruct', value: 'meta-llama/llama-3.1-8b-instruct' },
  { label: 'Mistral 7B Instruct', value: 'mistralai/mistral-7b-instruct' },
  { label: 'openrouter/free', value: 'openrouter/free' },
];

const MODEL_PROMPT = `You are an exper in tailoriion resumes besed on job description. Return only valid JSON. 
you will be given a job description and json with resume data you will tailor 
the json for the best match for the job description.
The JSON must match the input resumeData structure and 
include no markdown or commentary.`

function parseTailoredResume(content) {
  const cleanedContent = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');

  const parsedContent = JSON.parse(cleanedContent);
  return parsedContent.resumeData || parsedContent;
}

export default function TailorWithAI({ resumeData, onApplyTailoredResume }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].value);
  const [apiKey, setApiKey] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorReason, setErrorReason] = useState('');
  const [tailoredResume, setTailoredResume] = useState(null);

  const resetResponseState = () => {
    setStatus('idle');
    setErrorReason('');
    setTailoredResume(null);
  };

  const handleOpen = () => {
    resetResponseState();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleStartTailor = async () => {
    if (!apiKey.trim()) {
      setStatus('error');
      setErrorReason('API key is required.');
      return;
    }

    setStatus('loading');
    setErrorReason('');
    setTailoredResume(null);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Easy Customize Resume Tailor',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content:
                MODEL_PROMPT,
            },
            {
              role: 'user',
              content: JSON.stringify(
                {
                  resumeData,
                  jobDescription,
                },
                null,
                2
              ),
            },
          ],
          temperature: 0.4,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with status ${response.status}.`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('The model did not return resume JSON.');
      }

      const parsedResume = normalizeResumeData(parseTailoredResume(content));
      setTailoredResume(parsedResume);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorReason(error.message || 'Something went wrong while tailoring the resume.');
    }
  };

  const handleApplyTailoredResume = () => {
    if (!tailoredResume) return;
    onApplyTailoredResume(tailoredResume);
    handleClose();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
      >
        <Sparkles size={16} />
        Tailor with AI
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Tailor with AI</h2>
                <p className="text-sm text-slate-500">Send the current resume JSON to OpenRouter.</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Configuration</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    AI Model
                    <select
                      value={selectedModel}
                      onChange={(event) => setSelectedModel(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {MODEL_OPTIONS.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    API Key
                    <textarea
                      rows={3}
                      value={apiKey}
                      onChange={(event) => setApiKey(event.target.value)}
                      placeholder="Paste your OpenRouter API key"
                      className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </label>
                </div>

                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  Job Description
                  <textarea
                    rows={6}
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    placeholder="Paste the target job description"
                    className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleStartTailor}
                  disabled={status === 'loading'}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'loading' ? 'Thinking...' : 'Start Tailor'}
                </button>
              </section>

              <section className="space-y-3 border-t border-slate-200 pt-5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Status & Response</h3>
                {status === 'idle' && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    No response yet.
                  </div>
                )}
                {status === 'loading' && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-700">
                    thinking
                  </div>
                )}
                {status === 'error' && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <div className="font-bold">Sorry, bad request</div>
                    <div className="mt-1 whitespace-pre-wrap">{errorReason}</div>
                  </div>
                )}
                {status === 'success' && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <div className="text-sm font-bold text-emerald-700">Successful</div>
                    <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-white p-3 text-xs text-slate-800">
                      {JSON.stringify(tailoredResume, null, 2)}
                    </pre>
                  </div>
                )}
              </section>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={handleApplyTailoredResume}
                disabled={status !== 'success'}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export Tailored JSON
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
