import './App.css';

import React, { useState, useEffect, useCallback } from 'react';
import { Download, Eye, EyeOff, FileText, Palette, Sparkles, Wand2 } from 'lucide-react';
import ResumeEditor from './components/ResumeEditor.js';
import { downloadJSON } from './utils/exportResume.js';
import { exportToDocx, exportToPdf } from './utils/exportResume.js';
import { normalizeResumeData } from './utils/resumeData';
import UploadSection from './components/UploadSection.js';
import ResumeVersions from './components/ResumeVersions.js';
import AiSettingsModal from './components/AiSettingsModal.js';
import TailorToJob from './components/TailorToJob.js';
import SmartImport from './components/SmartImport.js';
import { loadCurrentResume, saveCurrentResume } from './utils/storage';
import { hasAiKey } from './utils/ai';
import { THEME_LIST, DEFAULT_THEME_ID, getTheme } from './template_generator/themes';



function App() {
  const [resumeData, setResumeData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contacts: [],
    profile: '',
    experience: [],
    projects: [],
    skills: [],
    education: [],
    miscellaneous: []
  });

  const [showPreview, setShowPreview] = useState(true);
  const [, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [themeId, setThemeId] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME_ID;
    return window.localStorage.getItem('resume_theme') || DEFAULT_THEME_ID;
  });
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
  const [tailorOpen, setTailorOpen] = useState(false);
  const [smartImportOpen, setSmartImportOpen] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  ));

  // Load saved resume on mount (localStorage, with one-time migration from the
  // legacy sessionStorage autosave so existing drafts survive a tab close).
  useEffect(() => {
    const saved = loadCurrentResume();
    if (saved) {
      setResumeData(saved);
    }
    if(typeof window !== 'undefined' && window.innerWidth < 768){
      setShowPreview(false)
    }else{
      setShowPreview(true)
    }

  }, []);

  // Autosave the working resume to localStorage on every change.
  useEffect(() => {
    saveCurrentResume(resumeData);
  }, [resumeData]);

  // Persist the selected document theme.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('resume_theme', themeId);
    }
  }, [themeId]);

  const handleLoadVersion = useCallback((data) => {
    const normalized = normalizeResumeData(data);
    setResumeData(normalized);
    setExpandedSections(
      Object.keys(normalized).reduce((sections, key) => {
        sections[key] = true;
        return sections;
      }, {})
    );
  }, []);

  // Track whether an AI key is configured (controls the settings button state).
  useEffect(() => {
    setAiConfigured(hasAiKey());
  }, []);

  const refreshAiConfigured = useCallback(() => setAiConfigured(hasAiKey()), []);
  const openAiSettings = useCallback(() => setAiSettingsOpen(true), []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleJsonUpload= useCallback((event) => {
      const file = event.target.files[0];
      if (!file) return;
      event.target.value = '';
  
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const json = JSON.parse(loadEvent.target.result);
          const normalizedJson = normalizeResumeData(json);
          setResumeData(normalizedJson);
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

  // Handle basic field changes
  // const handleFieldChange = useCallback((field, value) => {
  //   setResumeData(prev => ({
  //     ...prev,
  //     [field]: value
  //   }));
  // }, []);
  
  const theme = getTheme(themeId);
  const previewColors = theme.colors;

  const PreviewResume = ({ resumeData, isMobile }) => {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-6 ${isMobile ? 'fixed inset-0 z-50 overflow-y-auto' : 'sticky top-20 h-fit'}`}>
      
      {/* Header - Name with accent underline */}
      {resumeData.name && (
        <div className="border-b-2 pb-3 mb-4" style={{ borderColor: previewColors.accent }}>
          <h1 className="text-4xl font-bold mb-0" style={{ color: previewColors.name }}>
            {resumeData.name}
          </h1>
        </div>
      )}

      {/* Contact Line 1 - Email, Phone */}
      {(resumeData.email || resumeData.phone) && (
        <div className="text-sm mb-2">
          {[
            resumeData.email && `Email: ${resumeData.email}`,
            resumeData.phone && `Phone: ${resumeData.phone}`
          ].filter(Boolean).join(' | ')}
        </div>
      )}

      {/* Contact Line 2 - All Contacts (annotation: link) */}
      {Array.isArray(resumeData.contacts) && resumeData.contacts.length > 0 && (
        <div className="text-sm mb-3">
          {resumeData.contacts
            .map(contact => 
              contact.annotation ? `${contact.annotation}: ${contact.link}` : contact.link
            )
            .filter(Boolean)
            .join('  |  ')}
        </div>
      )}

      {/* Address */}
      {resumeData.address && (
        <div className="text-sm mb-5">Address: {resumeData.address}</div>
      )}

      {/* Profile Section */}
      {resumeData.profile && (
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2 pb-1 border-b" style={{ color: previewColors.sectionHeading, borderColor: previewColors.accent }}>PROFILE</h3>
          <p className="text-sm leading-relaxed">{resumeData.profile}</p>
        </div>
      )}

      {/* Work Experience Section */}
      {resumeData.experience?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-3 pb-1 border-b" style={{ color: previewColors.sectionHeading, borderColor: previewColors.accent }}>WORK EXPERIENCE</h3>
          {resumeData.experience.map((job, index) => (
            <div key={index}>
              {/* Position | Company LEFT, Location | Date RIGHT */}
              <div className="flex justify-between items-start mb-1">
                <div className="font-bold text-sm" style={{ color: previewColors.jobTitle }}>
                  {job.position && job.company ? `${job.position} | ${job.company}` : (job.position || job.company)}
                </div>
                <div className="text-sm" style={{ color: previewColors.jobMeta }}>
                  {job.address && job.date ? `${job.address} | ${job.date}` : (job.address || job.date)}
                </div>
              </div>

              {/* Descriptions as bullets */}
              {job.description?.map((desc, didx) => (
                <div key={didx} className="text-sm ml-4 mb-1">
                  • {desc}
                </div>
              ))}

              {index < resumeData.experience.length - 1 && <div className="my-3" />}
            </div>
          ))}
        </div>
      )}

      {/* Projects Section */}
      {resumeData.projects?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-3 pb-1 border-b" style={{ color: previewColors.sectionHeading, borderColor: previewColors.accent }}>PROJECTS | PERSONAL WORK</h3>
          {resumeData.projects.map((proj, idx) => (
            <div key={idx}>
              {proj.name && (
                <h4 className="font-bold text-sm mb-1">{proj.name}</h4>
              )}
              {proj.description?.map((desc, didx) => (
                <p key={didx} className="text-sm mb-2 text-justify">
                  {desc}
                </p>
              ))}
              {idx < resumeData.projects.length - 1 && <div className="my-2" />}
            </div>
          ))}
        </div>
      )}

      {/* Skills Section */}
      {resumeData.skills?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-3 pb-1 border-b" style={{ color: previewColors.sectionHeading, borderColor: previewColors.accent }}>SKILLS</h3>
          {resumeData.skills.map((skill, idx) => (
            <div key={idx} className="text-sm mb-2 ml-4">
              {skill.type ? (
                <>
                  <span className="font-bold">{skill.type}</span>: {(skill.value || skill.field)?.join(', ')}
                </>
              ) : (
                <>• {(skill.value || skill.field)?.join(', ')}</>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education Section */}
      {resumeData.education?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-3 pb-1 border-b" style={{ color: previewColors.sectionHeading, borderColor: previewColors.accent }}>EDUCATION</h3>
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="mb-3">
              <div className="font-bold text-sm">{edu.school}</div>
              <div className="text-xs italic text-gray-600">{edu.date}</div>
              <div className="text-sm">{edu.details}</div>
            </div>
          ))}
        </div>
      )}

      {/* Additional Information */}
      {resumeData.miscellaneous?.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-3 pb-1 border-b" style={{ color: previewColors.sectionHeading, borderColor: previewColors.accent }}>ADDITIONAL INFORMATION</h3>
          {resumeData.miscellaneous.map((item, idx) => (
            <div key={idx} className="text-sm ml-4">
              • {item.type}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

  // Handle array item changes
  // // Add array item
  // const addArrayItem = useCallback((arrayName, template) => {
  //   setResumeData(prev => ({
  //     ...prev,
  //     [arrayName]: [...prev[arrayName], { ...template }]
  //   }));
  // }, []);

  // // Remove array item
  // const removeArrayItem = useCallback((arrayName, index) => {
  //   setResumeData(prev => ({
  //     ...prev,
  //     [arrayName]: prev[arrayName].filter((_, i) => i !== index)
  //   }));
  // }, []);

  // // Toggle section expand
  // const toggleSection = useCallback((section) => {
  //   setExpandedSections(prev => ({
  //     ...prev,
  //     [section]: !prev[section]
  //   }));
  // }, []);

  // Download JSON
  const callDownloadJSON = useCallback(() => {

    downloadJSON(resumeData)
    
  }, [resumeData]);

  // Download DOCX
  const callDownloadDocx = useCallback(async () => {
    setLoading(true);
    try {
      await exportToDocx(resumeData, themeId);
    } finally {
      setLoading(false);
    }
  }, [resumeData, themeId]);

  // Download PDF
  const callDownloadPdf = useCallback(() => {
    exportToPdf(resumeData, themeId);
  }, [resumeData, themeId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Easy Customize</h1>
          <div className="flex gap-2 flex-wrap items-center justify-end">
            <button
              onClick={() => setTailorOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Wand2 size={16} />
              Tailor to JD
            </button>

            <button
              onClick={openAiSettings}
              title={aiConfigured ? 'AI is configured' : 'Set up AI'}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors text-sm"
            >
              <Sparkles size={16} className={aiConfigured ? 'text-purple-600' : 'text-slate-400'} />
              AI
              {aiConfigured && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
            </button>

            <ResumeVersions resumeData={resumeData} onLoad={handleLoadVersion} />

            <label className="flex items-center gap-1.5 px-2 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700">
              <Palette size={16} className="text-slate-500" />
              <select
                value={themeId}
                onChange={(event) => setThemeId(event.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer pr-1"
                aria-label="Document theme"
              >
                {THEME_LIST.map((theme) => (
                  <option key={theme.id} value={theme.id}>{theme.label}</option>
                ))}
              </select>
            </label>

            <button
              onClick={callDownloadJSON}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Download size={16} />
              JSON
            </button>

            <button
              onClick={callDownloadDocx}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
            >
              <Download size={16} />
              {loading ? 'Generating...' : 'DOCX'}
            </button>

            <button
              onClick={callDownloadPdf}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <FileText size={16} />
              PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 pb-20">
        <UploadSection resumeData = {resumeData} setResumeData={setResumeData} onUpload={handleJsonUpload} error={error} onSmartImport={() => setSmartImportOpen(true)} />

        <div className={`grid gap-4 ${!isMobile && showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {/* Form Section */}
          {!showPreview || !isMobile ? (
            // <FormSection
            //   resumeData={resumeData}
            //   handleFieldChange={handleFieldChange}
            //   handleArrayChange={handleArrayChange}
            //   addArrayItem={addArrayItem}
            //   removeArrayItem={removeArrayItem}
            //   expandedSections={expandedSections}
            //   toggleSection={toggleSection}
            // />
            <>

              <ResumeEditor
                resumeData={resumeData}
                setResumeData = {setResumeData}
                onNeedsKey={openAiSettings}
              />
              {/* <ResumeStats resumeData={resumeData} /> */}
            </>
          ) : null}

          {/* Preview Section */}
          {(showPreview || !isMobile) && (
            <PreviewResume resumeData={resumeData} isMobile={isMobile} />
          )}
        </div>
      </main>

      {isMobile && (
        <button
          type="button"
          onClick={() => setShowPreview(prevShowPreview => !prevShowPreview)}
          className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full bg-purple-600 px-5 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-purple-700"
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
        onNeedsKey={openAiSettings}
      />
      <SmartImport
        open={smartImportOpen}
        onClose={() => setSmartImportOpen(false)}
        onApply={handleLoadVersion}
        onNeedsKey={openAiSettings}
      />
    </div>
  );
};

export default App;
