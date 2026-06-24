import logo from './logo.svg';
import './App.css';

import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Download, Plus, X, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
// import { generateAndDownloadResume } from './docGenerator.js';
import ResumeEditor from './components/ResumeEditor.js';
import { downloadJSON } from './utils/exportResume.js';
import { exportToDocx } from './utils/exportResume.js';
import { normalizeResumeData } from './utils/resumeData';
import UploadSection from './components/UploadSection.js';



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
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('resumeData');
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load resume:', e);
      }
    }
  }, []);

  // Save to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  const handleJsonUpload= useCallback((event) => {
      const file = event.target.files[0];
      if (!file) return;
  
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
  
  const PreviewSection = ({ resumeData, isMobile }) => {
    return (
      <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-6 ${isMobile ? 'fixed inset-0 z-50 overflow-y-auto' : 'sticky top-20 h-fit'}`}>
        {/* Preview Header */}
        <div className="text-center border-b-2 border-slate-300 pb-4 mb-4">
          {resumeData.name && (
            <h1 className="text-2xl font-bold text-slate-900">{resumeData.name}</h1>
          )}
          <div className="text-sm text-slate-600 mt-2">
            {[resumeData.email, resumeData.phone, resumeData.address]
              .filter(Boolean)
              .join(' | ')}
          </div>
        </div>

        {/* Profile */}
        {resumeData.profile && (
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 mb-2">PROFILE</h3>
            <p className="text-sm text-slate-700">{resumeData.profile}</p>
          </div>
        )}

        {/* Experience */}
        {resumeData.experience?.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 mb-2">WORK EXPERIENCE</h3>
            {resumeData.experience.map((exp, idx) => (
              <div key={idx} className="mb-3 pb-2 border-b border-slate-200">
                <div className="font-semibold text-sm text-slate-900">
                  {exp.position && exp.company ? `${exp.position} | ${exp.company}` : (exp.position || exp.company)}
                </div>
                {(exp.address || exp.date) && (
                  <div className="text-xs text-slate-600 italic">{exp.address} | {exp.date}</div>
                )}
                {exp.description?.map((desc, didx) => (
                  <div key={didx} className="text-xs text-slate-700 ml-2 mt-1">• {desc}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {resumeData.projects?.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 mb-2">PROJECTS</h3>
            {resumeData.projects.map((proj, idx) => (
              <div key={idx} className="mb-3 pb-2 border-b border-slate-200">
                {proj.name && <div className="font-semibold text-sm text-slate-900">{proj.name}</div>}
                {proj.description?.map((desc, didx) => (
                  <div key={didx} className="text-xs text-slate-700">• {desc}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {resumeData.skills?.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 mb-2">SKILLS</h3>
            {resumeData.skills.map((skill, idx) => (
              <div key={idx} className="text-xs text-slate-700">
                {skill.type && <span className="font-semibold">{skill.type}: </span>}
                {(skill.value || skill.field)?.join(', ')}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resumeData.education?.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 mb-2">EDUCATION</h3>
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="mb-2 pb-2 border-b border-slate-200">
                {edu.school && <div className="font-semibold text-sm text-slate-900">{edu.school}</div>}
                {edu.date && <div className="text-xs text-slate-600 italic">{edu.date}</div>}
                {edu.details && <div className="text-xs text-slate-700">{edu.details}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Miscellaneous */}
        {resumeData.miscellaneous?.length > 0 && (
          <div>
            <h3 className="font-bold text-slate-900 mb-2">ADDITIONAL</h3>
            {resumeData.miscellaneous.map((item, idx) => (
              <div key={idx} className="text-xs text-slate-700">• {item.type}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const PreviewResume = ({ resumeData }) => {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-6 ${isMobile ? 'fixed inset-0 z-50 overflow-y-auto' : 'sticky top-20 h-fit'}`}>
      
      {/* Header - Name with blue underline */}
      {resumeData.name && (
        <div className="border-b-2 pb-3 mb-4" style={{ borderColor: '#3182CE' }}>
          <h1 className="text-4xl font-bold mb-0" style={{ color: '#1A365D' }}>
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
          <h3 className="font-bold text-sm mb-2 pb-1 border-b border-gray-300">PROFILE</h3>
          <p className="text-sm leading-relaxed">{resumeData.profile}</p>
        </div>
      )}

      {/* Work Experience Section */}
      {resumeData.experience?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-3 pb-1 border-b border-gray-300">WORK EXPERIENCE</h3>
          {resumeData.experience.map((job, index) => (
            <div key={index}>
              {/* Position | Company LEFT, Location | Date RIGHT */}
              <div className="flex justify-between items-start mb-1">
                <div className="font-bold text-sm" style={{ color: '#0066CC' }}>
                  {job.position && job.company ? `${job.position} | ${job.company}` : (job.position || job.company)}
                </div>
                <div className="text-sm" style={{ color: '#0066CC' }}>
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
          <h3 className="font-bold text-sm mb-3 pb-1 border-b border-gray-300">PROJECTS | PERSONAL WORK</h3>
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
          <h3 className="font-bold text-sm mb-3 pb-1 border-b border-gray-300">SKILLS</h3>
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
          <h3 className="font-bold text-sm mb-3 pb-1 border-b border-gray-300">EDUCATION</h3>
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
          <h3 className="font-bold text-sm mb-3 pb-1 border-b border-gray-300">ADDITIONAL INFORMATION</h3>
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
  const handleArrayChange = useCallback((arrayName, index, field, value) => {
    setResumeData(prev => {
      const newArray = [...prev[arrayName]];
      if (Array.isArray(value) && field === 'description') {
        newArray[index][field] = value;
      } else if (Array.isArray(value) && field === 'value') {
        newArray[index][field] = value;
      } else {
        newArray[index] = {
          ...newArray[index],
          [field]: value
        };
      }
      return { ...prev, [arrayName]: newArray };
    });
  }, []);

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

    exportToDocx(resumeData)
    
  }, [resumeData]);

  // Detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Resume Builder</h1>
          <div className="flex gap-2">

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
            {isMobile && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPreview ? 'Edit' : 'Preview'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <UploadSection onUpload={handleJsonUpload} error={error} />

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
                // onDataChange={handleArrayChange}
                // onAddItem={addArrayItem}
                // onRemoveItem={removeArrayItem}
                // expandedSections={expandedSections}
                // onToggleSection={toggleSection}
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
    </div>
  );
};

export default App;
