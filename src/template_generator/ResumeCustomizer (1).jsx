import React, { useState, useCallback } from 'react';
import { Download, Upload, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

// Template Generator Class
class ResumeTemplateGenerator {
  constructor(resumeData = {}) {
    this.data = {
      name: '',
      address: '',
      phone: '',
      email: '',
      contacts: [],
      profile: '',
      experience: [],
      projects: [],
      skills: [],
      education: [],
      miscellaneous: [],
      ...resumeData
    };
  }

  createHeading(text, level = 'HEADING_2') {
    return new Paragraph({
      text: text.toUpperCase(),
      heading: HeadingLevel[level],
      bold: true,
      spacing: { before: 240, after: 120 },
      border: {
        bottom: {
          color: '0066CC',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6
        }
      }
    });
  }

  createHeader() {
    const paragraphs = [];

    if (this.data.name) {
      paragraphs.push(
        new Paragraph({
          text: this.data.name.toUpperCase(),
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          bold: true,
          size: 28
        })
      );
    }

    const contactInfo = [];
    if (this.data.email) contactInfo.push(this.data.email);
    if (this.data.phone) contactInfo.push(this.data.phone);
    if (this.data.address) contactInfo.push(this.data.address);

    if (contactInfo.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: contactInfo.join(' | '),
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          size: 18
        })
      );
    }

    if (Array.isArray(this.data.contacts) && this.data.contacts.length > 0) {
      const links = this.data.contacts
        .filter(c => c.link)
        .map(c => {
          const label = c.showAnnotation || c.annotaction ? `${c.annotaction || c.annotation}: ` : '';
          return label + c.link;
        })
        .join(' | ');

      if (links) {
        paragraphs.push(
          new Paragraph({
            text: links,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            size: 18
          })
        );
      }
    }

    return paragraphs;
  }

  createProfile() {
    const paragraphs = [];
    if (!this.data.profile) return paragraphs;

    paragraphs.push(this.createHeading('PROFILE'));
    paragraphs.push(
      new Paragraph({
        text: this.data.profile,
        spacing: { after: 200 },
        size: 20,
        alignment: AlignmentType.JUSTIFIED
      })
    );

    return paragraphs;
  }

  createExperience() {
    const paragraphs = [];
    if (!Array.isArray(this.data.experience) || this.data.experience.length === 0) {
      return paragraphs;
    }

    paragraphs.push(this.createHeading('WORK EXPERIENCE'));

    this.data.experience.forEach((job, index) => {
      const positionText = [job.position, job.company]
        .filter(Boolean)
        .join(' | ');

      if (positionText) {
        paragraphs.push(
          new Paragraph({
            text: positionText,
            bold: true,
            spacing: { before: 100, after: 50 },
            size: 22
          })
        );
      }

      const locationDateText = [job.address, job.date]
        .filter(Boolean)
        .join(' | ');

      if (locationDateText) {
        paragraphs.push(
          new Paragraph({
            text: locationDateText,
            italics: true,
            spacing: { after: 100 },
            size: 20
          })
        );
      }

      if (Array.isArray(job.description)) {
        job.description.forEach(desc => {
          if (desc && desc.trim()) {
            paragraphs.push(
              new Paragraph({
                text: desc,
                bullet: { level: 0 },
                spacing: { after: 60 },
                size: 20
              })
            );
          }
        });
      }

      if (index < this.data.experience.length - 1) {
        paragraphs.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      }
    });

    return paragraphs;
  }

  createProjects() {
    const paragraphs = [];
    if (!Array.isArray(this.data.projects) || this.data.projects.length === 0) {
      return paragraphs;
    }

    paragraphs.push(this.createHeading('PROJECTS'));

    this.data.projects.forEach((project, index) => {
      if (project.name) {
        paragraphs.push(
          new Paragraph({
            text: project.name,
            bold: true,
            spacing: { before: 100, after: 60 },
            size: 22
          })
        );
      }

      if (Array.isArray(project.description)) {
        project.description.forEach(desc => {
          if (desc && desc.trim()) {
            paragraphs.push(
              new Paragraph({
                text: desc,
                bullet: { level: 0 },
                spacing: { after: 60 },
                size: 20
              })
            );
          }
        });
      }

      if (index < this.data.projects.length - 1) {
        paragraphs.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      }
    });

    return paragraphs;
  }

  createSkills() {
    const paragraphs = [];

    let skillsData = [];

    if (Array.isArray(this.data.skills)) {
      if (this.data.skills.length === 0) return paragraphs;

      if (this.data.skills[0]?.field) {
        skillsData = this.data.skills;
      } else if (this.data.skills[0]?.type && this.data.skills[0]?.value) {
        skillsData = this.data.skills.map(skill => ({
          category: skill.type,
          items: Array.isArray(skill.value) ? skill.value : [skill.value]
        }));
      }
    }

    if (skillsData.length === 0) return paragraphs;

    paragraphs.push(this.createHeading('KEY SKILLS'));

    skillsData.forEach((skillGroup) => {
      let skillText = '';

      if (skillGroup.field) {
        skillText = Array.isArray(skillGroup.field)
          ? skillGroup.field.filter(Boolean).join(', ')
          : skillGroup.field;
      } else if (skillGroup.category && skillGroup.items) {
        const itemsText = Array.isArray(skillGroup.items)
          ? skillGroup.items.filter(Boolean).join(', ')
          : skillGroup.items;
        skillText = `${skillGroup.category}: ${itemsText}`;
      }

      if (skillText) {
        paragraphs.push(
          new Paragraph({
            text: skillText,
            spacing: { after: 120 },
            size: 20
          })
        );
      }
    });

    return paragraphs;
  }

  createEducation() {
    const paragraphs = [];
    if (!Array.isArray(this.data.education) || this.data.education.length === 0) {
      return paragraphs;
    }

    paragraphs.push(this.createHeading('EDUCATION & QUALIFICATIONS'));

    this.data.education.forEach((edu, index) => {
      if (edu.school) {
        paragraphs.push(
          new Paragraph({
            text: edu.school,
            bold: true,
            spacing: { before: 100, after: 50 },
            size: 22
          })
        );
      }

      if (edu.date) {
        paragraphs.push(
          new Paragraph({
            text: edu.date,
            italics: true,
            spacing: { after: 60 },
            size: 20
          })
        );
      }

      if (edu.details) {
        paragraphs.push(
          new Paragraph({
            text: edu.details,
            spacing: { after: 100 },
            size: 20
          })
        );
      }

      if (index < this.data.education.length - 1) {
        paragraphs.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      }
    });

    return paragraphs;
  }

  createMiscellaneous() {
    const paragraphs = [];
    if (!Array.isArray(this.data.miscellaneous) || this.data.miscellaneous.length === 0) {
      return paragraphs;
    }

    const validItems = this.data.miscellaneous.filter(item => item.type && item.type.trim());
    if (validItems.length === 0) return paragraphs;

    paragraphs.push(this.createHeading('ADDITIONAL INFORMATION'));

    validItems.forEach(item => {
      paragraphs.push(
        new Paragraph({
          text: item.type,
          bullet: { level: 0 },
          spacing: { after: 80 },
          size: 20
        })
      );
    });

    return paragraphs;
  }

  async generateDocument() {
    const sections = [];

    sections.push(...this.createHeader());
    sections.push(...this.createProfile());
    sections.push(...this.createExperience());
    sections.push(...this.createProjects());
    sections.push(...this.createSkills());
    sections.push(...this.createEducation());
    sections.push(...this.createMiscellaneous());

    const doc = new Document({
      sections: [
        {
          children: sections,
          properties: {
            page: {
              margins: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720
              }
            }
          }
        }
      ]
    });

    return doc;
  }
}

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
        const sections = Object.keys(json).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {});
        setExpandedSections(sections);
        setLastUpdated(new Date());
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
                onClick={() => exportToDocxTemplate(resumeData)}
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

// Export to DOCX using Template Generator
async function exportToDocxTemplate(resumeData) {
  try {
    const generator = new ResumeTemplateGenerator(resumeData);
    const doc = await generator.generateDocument();
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
    alert('Error exporting document. Please check console for details.');
  }
}
