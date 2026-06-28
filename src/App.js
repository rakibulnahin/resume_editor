import './App.css';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import ResumeEditor from './components/ResumeEditor.js';
import { downloadJSON } from './utils/exportResume.js';
import { exportToDocx, exportToPdf } from './utils/exportResume.js';
import { emptyResume, ensureResumeShape } from './utils/resumeData';
import UploadSection from './components/UploadSection.js';
import AiSettingsModal from './components/AiSettingsModal.js';
import TailorToJob from './components/TailorToJob.js';
import SmartImport from './components/SmartImport.js';
import AppHeader from './components/AppHeader.js';
import AiSetupBanner from './components/AiSetupBanner.js';
import { loadCurrentResume, saveCurrentResume } from './utils/storage';
import { hasAiKey, shouldShowAiBanner } from './utils/ai';
import ResumePreview from './components/ResumePreview.js';

const LEGACY_TEMPLATE_IDS = {
  'classic-blue': 'classic',
  'minimal-mono': 'compact',
  'modern-teal': 'sidebar',
  'elegant-serif': 'executive',
};

function App() {
  const [resumeData, setResumeData] = useState(emptyResume);
  const [hydrated, setHydrated] = useState(false);

  const [showPreview, setShowPreview] = useState(true);
  const [, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [themeId, setThemeId] = useState(() => {
    if (typeof window === 'undefined') return 'classic';
    const stored = window.localStorage.getItem('resume_theme');
    return LEGACY_TEMPLATE_IDS[stored] || stored || 'classic';
  });
  const [importNotice, setImportNotice] = useState('');
  const [showAiBanner, setShowAiBanner] = useState(false);
  const previewRef = useRef(null);
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
  const [tailorOpen, setTailorOpen] = useState(false);
  const [smartImportOpen, setSmartImportOpen] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  ));

  useEffect(() => {
    const saved = loadCurrentResume();
    if (saved) {
      setResumeData(ensureResumeShape(saved));
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowPreview(false);
    } else {
      setShowPreview(true);
    }
    setShowAiBanner(shouldShowAiBanner());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveCurrentResume(resumeData);
  }, [resumeData, hydrated]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('resume_theme', themeId);
    }
  }, [themeId]);

  const handleLoadVersion = useCallback((data) => {
    const normalized = ensureResumeShape(data);
    setResumeData(normalized);
    setShowPreview(true);
    setImportNotice(
      normalized.name
        ? `Resume loaded for ${normalized.name}. Form and preview are updated below.`
        : 'Resume loaded. Form and preview are updated below.'
    );
    setExpandedSections(
      Object.keys(normalized).reduce((sections, key) => {
        sections[key] = true;
        return sections;
      }, {})
    );
    window.setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }, []);

  useEffect(() => {
    setAiConfigured(hasAiKey());
  }, []);

  const refreshAiConfigured = useCallback(() => {
    const configured = hasAiKey();
    setAiConfigured(configured);
    if (!configured && shouldShowAiBanner()) {
      setShowAiBanner(true);
    }
  }, []);

  /** Close feature modals first so AI settings always appears on top. */
  const openAiSettings = useCallback((fromFeatureModal = false) => {
    if (fromFeatureModal) {
      setTailorOpen(false);
      setSmartImportOpen(false);
    }
    setAiSettingsOpen(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleJsonUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    event.target.value = '';

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const json = JSON.parse(loadEvent.target.result);
        const normalizedJson = ensureResumeShape(json);
        setResumeData(normalizedJson);
        setShowPreview(true);
        setImportNotice('JSON file loaded into the editor and preview.');
        setError('');
        setExpandedSections(
          Object.keys(normalizedJson).reduce((sections, key) => {
            sections[key] = true;
            return sections;
          }, {})
        );
      } catch (err) {
        setError('Invalid JSON format. Please check your file.');
      }
    };
    reader.readAsText(file);
  }, []);

  const callDownloadJSON = useCallback(() => {
    downloadJSON(resumeData);
  }, [resumeData]);

  const callDownloadDocx = useCallback(async () => {
    setLoading(true);
    try {
      await exportToDocx(resumeData, themeId);
    } finally {
      setLoading(false);
    }
  }, [resumeData, themeId]);

  const callDownloadPdf = useCallback(() => {
    exportToPdf(resumeData, themeId);
  }, [resumeData, themeId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader
        aiConfigured={aiConfigured}
        onTailor={() => setTailorOpen(true)}
        onAiSettings={() => openAiSettings(false)}
        onDownloadJson={callDownloadJSON}
        onDownloadDocx={callDownloadDocx}
        onDownloadPdf={callDownloadPdf}
        docxLoading={loading}
        themeId={themeId}
        onThemeChange={setThemeId}
        resumeData={resumeData}
        onLoadVersion={handleLoadVersion}
      />

      {showAiBanner && !aiConfigured && (
        <AiSetupBanner
          onConfigure={() => openAiSettings(false)}
          onDismiss={() => setShowAiBanner(false)}
        />
      )}

      <main className="mx-auto max-w-7xl px-3 py-4 pb-24 sm:px-4 sm:pb-20">
        {importNotice && (
          <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <span>{importNotice}</span>
            <button
              type="button"
              onClick={() => setImportNotice('')}
              className="shrink-0 text-emerald-700 hover:text-emerald-900"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <UploadSection
          resumeData={resumeData}
          setResumeData={setResumeData}
          onUpload={handleJsonUpload}
          error={error}
          onSmartImport={() => setSmartImportOpen(true)}
        />

        <div
          ref={previewRef}
          className={`mt-4 grid gap-4 ${!isMobile && showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}
        >
          {(!showPreview || !isMobile) && (
            <ResumeEditor
              resumeData={resumeData}
              setResumeData={setResumeData}
              onNeedsKey={() => openAiSettings(true)}
            />
          )}

          {(showPreview || !isMobile) && (
            <ResumePreview resumeData={resumeData} templateId={themeId} isMobile={isMobile} />
          )}
        </div>
      </main>

      {isMobile && (
        <button
          type="button"
          onClick={() => setShowPreview((prev) => !prev)}
          className="fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full bg-purple-600 px-5 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-purple-700"
        >
          {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      )}

      <AiSettingsModal
        open={aiSettingsOpen}
        onClose={() => setAiSettingsOpen(false)}
        onSaved={refreshAiConfigured}
      />
      <TailorToJob
        open={tailorOpen}
        onClose={() => setTailorOpen(false)}
        resumeData={resumeData}
        onApply={handleLoadVersion}
        onNeedsKey={() => openAiSettings(true)}
        templateId={themeId}
      />
      <SmartImport
        open={smartImportOpen}
        onClose={() => setSmartImportOpen(false)}
        onApply={handleLoadVersion}
        onNeedsKey={() => openAiSettings(true)}
      />
    </div>
  );
}

export default App;
