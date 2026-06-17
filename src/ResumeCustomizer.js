import React, { useState, useCallback } from 'react';
import { Download, Upload, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

// Main Resume Customizer Component
export default function ResumeCustomizer() {
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  const handleJsonUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setResumeData(json);
        setError('');
        // Expand all sections by default
        const sections = Object.keys(json).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {});
        setExpandedSections(sections);
      } catch (err) {
        setError('Invalid JSON format. Please check your file.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDataChange = useCallback((path, value) => {
    setResumeData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const index = keys[i + 1];
        if (!isNaN(index)) {
          current = current[key][parseInt(index)];
          i++;
        } else {
          current = current[key];
        }
      }
      
      const lastKey = keys[keys.length - 1];
      if (!isNaN(lastKey)) {
        const parentKey = keys[keys.length - 2];
        let parent = updated;
        for (let i = 0; i < keys.length - 2; i++) {
          parent = parent[keys[i]];
        }
        parent[parentKey][parseInt(lastKey)] = value;
      } else {
        current[lastKey] = value;
      }
      
      return updated;
    });
    setLastUpdated(new Date());
  }, []);

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const addArrayItem = (path, template) => {
    setResumeData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = updated;
      
      for (const key of keys) {
        current = current[key];
      }
      
      current.push(JSON.parse(JSON.stringify(template)));
      return updated;
    });
    setLastUpdated(new Date());
  };

  const removeArrayItem = (path, index) => {
    setResumeData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = updated;
      
      for (const key of keys) {
        current = current[key];
      }
      
      current.splice(index, 1);
      return updated;
    });
    setLastUpdated(new Date());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Resume Customizer</h1>
            <p className="text-sm text-slate-600 mt-1">Upload, edit, and export your professional resume</p>
            {lastUpdated && (
              <p className="text-xs text-emerald-600 font-medium mt-1">
                ✓ Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          {resumeData && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => downloadJSON(resumeData)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                <Download size={18} />
                Download JSON
              </button>
              <button
                onClick={() => exportToDocx(resumeData)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                <Download size={18} />
                Download Document
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {!resumeData ? (
          <UploadSection onUpload={handleJsonUpload} error={error} />
        ) : (
          <>
            <ResumeEditor
              resumeData={resumeData}
              onDataChange={handleDataChange}
              onAddItem={addArrayItem}
              onRemoveItem={removeArrayItem}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            />
            <ResumeStats resumeData={resumeData} />
          </>
        )}
      </main>
    </div>
  );
}

// Resume Statistics Component
function ResumeStats({ resumeData }) {
  const stats = {
    experience: resumeData.experience?.length || 0,
    skills: resumeData.skills?.reduce((acc, group) => acc + (group.field?.length || 0), 0) || 0,
    education: resumeData.education?.length || 0,
    contacts: resumeData.contacts?.filter(c => c.link)?.length || 0,
  };

  const totalItems = stats.experience + stats.skills + stats.education + stats.contacts;

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 font-medium">Total Items</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{totalItems}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 font-medium">Experience</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.experience}</p>
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">💼</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 font-medium">Skills</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.skills}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">⚡</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 font-medium">Education</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.education}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">🎓</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 font-medium">Contacts</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.contacts}</p>
          </div>
          <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">🔗</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Upload Section Component
function UploadSection({ onUpload, error }) {
  return (
    <div className="max-w-2xl mx-auto">
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

      {/* Example Schema */}
      <div className="mt-12 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
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
  "skills": [{"field": [""]}],
  "education": [{"school": "", "date": "", "details": ""}],
  "miscellaneous": [{"type": "description"}]
}`}
        </pre>
      </div>
    </div>
  );
}

// Resume Editor Component
function ResumeEditor({
  resumeData,
  onDataChange,
  onAddItem,
  onRemoveItem,
  expandedSections,
  onToggleSection
}) {
  return (
    <div className="space-y-4">
      {/* Basic Information Section */}
      <SectionCard
        title="Personal Information"
        isExpanded={expandedSections['name']}
        onToggle={() => onToggleSection('name')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Full Name"
            value={resumeData.name || ''}
            onChange={(value) => onDataChange('name', value)}
          />
          <InputField
            label="Email"
            value={resumeData.email || ''}
            onChange={(value) => onDataChange('email', value)}
          />
          <InputField
            label="Phone"
            value={resumeData.phone || ''}
            onChange={(value) => onDataChange('phone', value)}
          />
          <InputField
            label="Address"
            value={resumeData.address || ''}
            onChange={(value) => onDataChange('address', value)}
          />
        </div>

        {/* Profile */}
        <div className="mt-4">
          <TextAreaField
            label="Professional Profile"
            value={resumeData.profile || ''}
            onChange={(value) => onDataChange('profile', value)}
            rows={3}
          />
        </div>

        {/* Contacts */}
        {Array.isArray(resumeData.contacts) && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-900">Contacts</label>
              <button
                onClick={() => onAddItem('contacts', { annotation: '', link: '', showAnnotation: true })}
                className="flex items-center gap-1 text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-3">
              {resumeData.contacts.map((contact, idx) => (
                <div key={idx} className="flex gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1 space-y-2">
                    <InputField
                      label="Annotation"
                      value={contact.annotation || ''}
                      onChange={(value) => onDataChange(`contacts.${idx}.annotation`, value)}
                      size="small"
                    />
                    <InputField
                      label="Link"
                      value={contact.link || ''}
                      onChange={(value) => onDataChange(`contacts.${idx}.link`, value)}
                      size="small"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={contact.showAnnotation || false}
                        onChange={(e) => onDataChange(`contacts.${idx}.showAnnotation`, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-slate-700">Show Annotation</span>
                    </label>
                  </div>
                  <button
                    onClick={() => onRemoveItem('contacts', idx)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Experience Section */}
      {Array.isArray(resumeData.experience) && (
        <SectionCard
          title="Work Experience"
          isExpanded={expandedSections['experience']}
          onToggle={() => onToggleSection('experience')}
          itemCount={resumeData.experience.length}
        >
          <div className="space-y-4">
            {resumeData.experience.map((exp, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Position {idx + 1}</h4>
                  <button
                    onClick={() => onRemoveItem('experience', idx)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InputField
                    label="Company"
                    value={exp.company || ''}
                    onChange={(value) => onDataChange(`experience.${idx}.company`, value)}
                    size="small"
                  />
                  <InputField
                    label="Position"
                    value={exp.position || ''}
                    onChange={(value) => onDataChange(`experience.${idx}.position`, value)}
                    size="small"
                  />
                  <InputField
                    label="Address"
                    value={exp.address || ''}
                    onChange={(value) => onDataChange(`experience.${idx}.address`, value)}
                    size="small"
                  />
                  <InputField
                    label="Date"
                    value={exp.date || ''}
                    onChange={(value) => onDataChange(`experience.${idx}.date`, value)}
                    size="small"
                  />
                </div>
                <div className="mt-3">
                  <label className="text-xs font-bold text-slate-700 block mb-2">Descriptions</label>
                  <div className="space-y-2">
                    {Array.isArray(exp.description) && exp.description.map((desc, descIdx) => (
                      <div key={descIdx} className="flex gap-2">
                        <input
                          type="text"
                          value={desc}
                          onChange={(e) => onDataChange(`experience.${idx}.description.${descIdx}`, e.target.value)}
                          className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add description"
                        />
                        <button
                          onClick={() => {
                            const newDesc = exp.description.filter((_, i) => i !== descIdx);
                            onDataChange(`experience.${idx}.description`, newDesc);
                          }}
                          className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newDesc = [...(exp.description || []), ''];
                        onDataChange(`experience.${idx}.description`, newDesc);
                      }}
                      className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Description
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => onAddItem('experience', {
                company: '',
                position: '',
                address: '',
                date: '',
                description: ['']
              })}
              className="w-full py-2 px-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Experience
            </button>
          </div>
        </SectionCard>
      )}

      {/* Skills Section */}
      {Array.isArray(resumeData.skills) && (
        <SectionCard
          title="Skills"
          isExpanded={expandedSections['skills']}
          onToggle={() => onToggleSection('skills')}
          itemCount={resumeData.skills.length}
        >
          <div className="space-y-4">
            {resumeData.skills.map((skillGroup, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Skill Group {idx + 1}</h4>
                  <button
                    onClick={() => onRemoveItem('skills', idx)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Skills</label>
                  <div className="space-y-2">
                    {Array.isArray(skillGroup.field) && skillGroup.field.map((skill, skillIdx) => (
                      <div key={skillIdx} className="flex gap-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => onDataChange(`skills.${idx}.field.${skillIdx}`, e.target.value)}
                          className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add skill"
                        />
                        <button
                          onClick={() => {
                            const newSkills = skillGroup.field.filter((_, i) => i !== skillIdx);
                            onDataChange(`skills.${idx}.field`, newSkills);
                          }}
                          className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newSkills = [...(skillGroup.field || []), ''];
                        onDataChange(`skills.${idx}.field`, newSkills);
                      }}
                      className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Skill
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => onAddItem('skills', { field: [''] })}
              className="w-full py-2 px-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Skill Group
            </button>
          </div>
        </SectionCard>
      )}

      {/* Education Section */}
      {Array.isArray(resumeData.education) && (
        <SectionCard
          title="Education"
          isExpanded={expandedSections['education']}
          onToggle={() => onToggleSection('education')}
          itemCount={resumeData.education.length}
        >
          <div className="space-y-4">
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Education {idx + 1}</h4>
                  <button
                    onClick={() => onRemoveItem('education', idx)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InputField
                    label="School/University"
                    value={edu.school || ''}
                    onChange={(value) => onDataChange(`education.${idx}.school`, value)}
                    size="small"
                  />
                  <InputField
                    label="Date"
                    value={edu.date || ''}
                    onChange={(value) => onDataChange(`education.${idx}.date`, value)}
                    size="small"
                  />
                  <div className="md:col-span-2">
                    <TextAreaField
                      label="Details"
                      value={edu.details || ''}
                      onChange={(value) => onDataChange(`education.${idx}.details`, value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => onAddItem('education', { school: '', date: '', details: '' })}
              className="w-full py-2 px-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Education
            </button>
          </div>
        </SectionCard>
      )}

      {/* Miscellaneous Section */}
      {Array.isArray(resumeData.miscellaneous) && (
        <SectionCard
          title="Additional Information"
          isExpanded={expandedSections['miscellaneous']}
          onToggle={() => onToggleSection('miscellaneous')}
          itemCount={resumeData.miscellaneous.length}
        >
          <div className="space-y-4">
            {resumeData.miscellaneous.map((misc, idx) => (
              <div key={idx} className="flex gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <InputField
                    label={`Item ${idx + 1}`}
                    value={misc.type || ''}
                    onChange={(value) => onDataChange(`miscellaneous.${idx}.type`, value)}
                    size="small"
                  />
                </div>
                <button
                  onClick={() => onRemoveItem('miscellaneous', idx)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
            <button
              onClick={() => onAddItem('miscellaneous', { type: '' })}
              className="w-full py-2 px-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Item
            </button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// Section Card Component
function SectionCard({ title, isExpanded, onToggle, itemCount, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {itemCount !== undefined && (
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
              {itemCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-slate-600" />
        ) : (
          <ChevronDown size={20} className="text-slate-600" />
        )}
      </button>
      {isExpanded && (
        <div className="border-t border-slate-200 px-6 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

// Input Field Component
function InputField({ label, value, onChange, size = 'normal' }) {
  const sizeClasses = size === 'small' ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm';
  
  return (
    <div>
      <label className={`block font-semibold text-slate-900 mb-1 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${sizeClasses}`}
      />
    </div>
  );
}

// Text Area Field Component
function TextAreaField({ label, value, onChange, rows = 4 }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-900 mb-1">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
      />
    </div>
  );
}

// Download JSON Function
function downloadJSON(resumeData) {
  try {
    const jsonString = JSON.stringify(resumeData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.name || 'resume'}-updated.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading JSON:', error);
    alert('Error downloading JSON file.');
  }
}

// Export to DOCX Function
async function exportToDocx(resumeData) {
  try {
    // Dynamically import the docx library
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import('docx');

    const sections = [];

    // Add header with personal info
    if (resumeData.name) {
      sections.push(
        new Paragraph({
          text: resumeData.name,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        })
      );
    }

    // Contact info
    const contactLines = [];
    if (resumeData.email) contactLines.push(resumeData.email);
    if (resumeData.phone) contactLines.push(resumeData.phone);
    if (resumeData.address) contactLines.push(resumeData.address);

    if (contactLines.length > 0) {
      sections.push(
        new Paragraph({
          text: contactLines.join(' | '),
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        })
      );
    }

    // Contacts/Links
    if (resumeData.contacts && resumeData.contacts.length > 0) {
      const contactTexts = resumeData.contacts
        .filter(c => c.link)
        .map(c => c.showAnnotation ? `${c.annotation}: ${c.link}` : c.link)
        .join(' | ');
      if (contactTexts) {
        sections.push(
          new Paragraph({
            text: contactTexts,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          })
        );
      }
    }

    // Profile
    if (resumeData.profile) {
      sections.push(
        new Paragraph({
          text: 'PROFESSIONAL SUMMARY',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          text: resumeData.profile,
          spacing: { after: 300 }
        })
      );
    }

    // Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      sections.push(
        new Paragraph({
          text: 'WORK EXPERIENCE',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        })
      );

      resumeData.experience.forEach((exp) => {
        if (exp.company || exp.position) {
          sections.push(
            new Paragraph({
              text: `${exp.position}${exp.company ? ' at ' + exp.company : ''}`,
              bold: true,
              spacing: { before: 100, after: 50 }
            })
          );

          if (exp.address || exp.date) {
            sections.push(
              new Paragraph({
                text: [exp.address, exp.date].filter(Boolean).join(' | '),
                italics: true,
                spacing: { after: 100 }
              })
            );
          }

          if (exp.description && exp.description.length > 0) {
            exp.description.forEach((desc) => {
              if (desc) {
                sections.push(
                  new Paragraph({
                    text: desc,
                    spacing: { after: 50 },
                    bullet: { level: 0 }
                  })
                );
              }
            });
          }

          sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
        }
      });
    }

    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      sections.push(
        new Paragraph({
          text: 'SKILLS',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        })
      );

      resumeData.skills.forEach((skillGroup, groupIdx) => {
        if (skillGroup.field && skillGroup.field.length > 0) {
          const skills = skillGroup.field.filter(Boolean).join(', ');
          if (skills) {
            sections.push(
              new Paragraph({
                text: skills,
                spacing: { after: 100 }
              })
            );
          }
        }
      });
    }

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      sections.push(
        new Paragraph({
          text: 'EDUCATION',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        })
      );

      resumeData.education.forEach((edu) => {
        if (edu.school) {
          sections.push(
            new Paragraph({
              text: edu.school,
              bold: true,
              spacing: { before: 100, after: 50 }
            })
          );

          if (edu.date) {
            sections.push(
              new Paragraph({
                text: edu.date,
                italics: true,
                spacing: { after: 100 }
              })
            );
          }

          if (edu.details) {
            sections.push(
              new Paragraph({
                text: edu.details,
                spacing: { after: 200 }
              })
            );
          }
        }
      });
    }

    // Miscellaneous
    if (resumeData.miscellaneous && resumeData.miscellaneous.length > 0) {
      const miscItems = resumeData.miscellaneous.filter(m => m.type);
      if (miscItems.length > 0) {
        sections.push(
          new Paragraph({
            text: 'ADDITIONAL INFORMATION',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          })
        );

        miscItems.forEach((misc) => {
          sections.push(
            new Paragraph({
              text: misc.type,
              spacing: { after: 100 }
            })
          );
        });
      }
    }

    const doc = new Document({ sections: [{ children: sections }] });
    const blob = await Packer.toBlob(doc);
    
    // Download the file
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.name || 'resume'}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    alert('Error exporting document. Make sure you have the latest version of dependencies.');
  }
}