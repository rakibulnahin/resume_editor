import { Plus, X, Download, Hammer } from 'lucide-react';
import { getSkillValues } from '../utils/resumeData';
import { InputField, TextAreaField } from './FormFields';
import SectionCard from './SectionCard';
import React, { useCallback, useState } from 'react';

export default function ResumeEditor({
  resumeData,
  setResumeData
}) 
{

  // const [presumeData, setResumeData] = useState(resumeData);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  const handleDataChange = useCallback((path, value) => {
    setResumeData((previousData) => {
      const updated = JSON.parse(JSON.stringify(previousData));
      const keys = path.split('.');
      let current = updated;

      for (let index = 0; index < keys.length - 1; index++) {
        const key = keys[index];
        const nextKey = keys[index + 1];

        if (!Number.isNaN(Number(nextKey))) {
          current = current[key][Number(nextKey)];
          index++;
        } else {
          current = current[key];
        }
      }

      const lastKey = keys[keys.length - 1];
      if (!Number.isNaN(Number(lastKey))) {
        const parentKey = keys[keys.length - 2];
        let parent = updated;
        for (let index = 0; index < keys.length - 2; index++) {
          parent = parent[keys[index]];
        }
        parent[parentKey][Number(lastKey)] = value;
      } else {
        current[lastKey] = value;
      }

      return updated;
    });
    setLastUpdated(new Date());
  }, []);

  const toggleSection = (sectionName) => {
    setExpandedSections((previousSections) => ({
      ...previousSections,
      [sectionName]: !previousSections[sectionName],
    }));
  };

  const addArrayItem = (path, template) => {
    setResumeData((previousData) => {
      const updated = JSON.parse(JSON.stringify(previousData));
      const collection = getNestedValue(updated, path);
      collection.push(JSON.parse(JSON.stringify(template)));
      return updated;
    });
    setLastUpdated(new Date());
  };

  const removeArrayItem = (path, index) => {
    setResumeData((previousData) => {
      const updated = JSON.parse(JSON.stringify(previousData));
      const collection = getNestedValue(updated, path);
      collection.splice(index, 1);
      return updated;
    });
    setLastUpdated(new Date());
  };

  function getNestedValue(data, path) {
    return path.split('.').reduce((current, key) => current[key], data);
  }


  return (
    <div className="space-y-4">
      
      <div className='font-bold text-xl p-4 text-blue-900 flex'><Hammer className='mr-4'/> Start Customization / Building</div>
      <SectionCard
        title="Personal Information"
        isExpanded={expandedSections.name}
        onToggle={() => toggleSection('name')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Full Name" value={resumeData.name || ''} onChange={(value) => handleDataChange('name', value)} />
          <InputField label="Email" value={resumeData.email || ''} onChange={(value) => handleDataChange('email', value)} />
          <InputField label="Phone" value={resumeData.phone || ''} onChange={(value) => handleDataChange('phone', value)} />
          <InputField label="Address" value={resumeData.address || ''} onChange={(value) => handleDataChange('address', value)} />
        </div>

        <div className="mt-4">
          <TextAreaField
            label="Professional Profile"
            value={resumeData.profile || ''}
            onChange={(value) => handleDataChange('profile', value)}
            rows={3}
          />
        </div>

        {Array.isArray(resumeData.contacts) && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-900">Contacts</label>
              <button
                onClick={() => addArrayItem('contacts', { annotation: '', link: '', showAnnotation: true })}
                className="flex items-center gap-1 text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-3">
              {resumeData.contacts.map((contact, index) => (
                <div key={index} className="flex gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1 space-y-2">
                    <InputField
                      label="Annotation"
                      value={contact.annotation || ''}
                      onChange={(value) => handleDataChange(`contacts.${index}.annotation`, value)}
                      size="small"
                    />
                    <InputField
                      label="Link"
                      value={contact.link || ''}
                      onChange={(value) => handleDataChange(`contacts.${index}.link`, value)}
                      size="small"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={contact.showAnnotation || false}
                        onChange={(event) => handleDataChange(`contacts.${index}.showAnnotation`, event.target.checked)}
                        className="rounded"
                      />
                      <span className="text-slate-700">Show Annotation</span>
                    </label>
                  </div>
                  <button
                    onClick={() => removeArrayItem('contacts', index)}
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

      {Array.isArray(resumeData.experience) && (
        <SectionCard
          title="Work Experience"
          isExpanded={expandedSections.experience}
          onToggle={() => toggleSection('experience')}
          itemCount={resumeData.experience.length}
        >
          <div className="space-y-4">
            {resumeData.experience.map((experience, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Position {index + 1}</h4>
                  <button
                    onClick={() => removeArrayItem('experience', index)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InputField label="Company" value={experience.company || ''} onChange={(value) => handleDataChange(`experience.${index}.company`, value)} size="small" />
                  <InputField label="Position" value={experience.position || ''} onChange={(value) => handleDataChange(`experience.${index}.position`, value)} size="small" />
                  <InputField label="Address" value={experience.address || ''} onChange={(value) => handleDataChange(`experience.${index}.address`, value)} size="small" />
                  <InputField label="Date" value={experience.date || ''} onChange={(value) => handleDataChange(`experience.${index}.date`, value)} size="small" />
                </div>
                <div className="mt-3">
                  <label className="text-xs font-bold text-slate-700 block mb-2">Descriptions</label>
                  <div className="space-y-2">
                    {Array.isArray(experience.description) && experience.description.map((description, descriptionIndex) => (
                      <div key={descriptionIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={description}
                          onChange={(event) => handleDataChange(`experience.${index}.description.${descriptionIndex}`, event.target.value)}
                          className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add description"
                        />
                        <button
                          onClick={() => {
                            const newDescriptions = experience.description.filter((_, itemIndex) => itemIndex !== descriptionIndex);
                            handleDataChange(`experience.${index}.description`, newDescriptions);
                          }}
                          className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleDataChange(`experience.${index}.description`, [...(experience.description || []), ''])}
                      className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Description
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('experience', { company: '', position: '', address: '', date: '', description: [''] })}
              className="w-full py-2 px-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Experience
            </button>
          </div>
        </SectionCard>
      )}

      {Array.isArray(resumeData.projects) && (
        <SectionCard
          title="Projects"
          isExpanded={expandedSections.projects}
          onToggle={() => toggleSection('projects')}
          itemCount={resumeData.projects.length}
        >
          <div className="space-y-4">
            {resumeData.projects.map((project, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Project {index + 1}</h4>
                  <button
                    onClick={() => removeArrayItem('projects', index)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <InputField
                  label="Project Name"
                  value={project.name || ''}
                  onChange={(value) => handleDataChange(`projects.${index}.name`, value)}
                  size="small"
                />
                <div className="mt-3">
                  <label className="text-xs font-bold text-slate-700 block mb-2">Descriptions</label>
                  <div className="space-y-2">
                    {Array.isArray(project.description) && project.description.map((description, descriptionIndex) => (
                      <div key={descriptionIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={description}
                          onChange={(event) => handleDataChange(`projects.${index}.description.${descriptionIndex}`, event.target.value)}
                          className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add description"
                        />
                        <button
                          onClick={() => {
                            const newDescriptions = project.description.filter((_, itemIndex) => itemIndex !== descriptionIndex);
                            handleDataChange(`projects.${index}.description`, newDescriptions);
                          }}
                          className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleDataChange(`projects.${index}.description`, [...(project.description || []), ''])}
                      className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Description
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('projects', { name: '', description: [''] })}
              className="w-full py-2 px-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Project
            </button>
          </div>
        </SectionCard>
      )}

      {Array.isArray(resumeData.skills) && (
        <SectionCard
          title="Skills"
          isExpanded={expandedSections.skills}
          onToggle={() => toggleSection('skills')}
          itemCount={resumeData.skills.length}
        >
          <div className="space-y-4">
            {resumeData.skills.map((skillGroup, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Skill Section {index + 1}</h4>
                  <button
                    onClick={() => removeArrayItem('skills', index)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <InputField
                  label="Skill Type"
                  value={skillGroup.type || ''}
                  onChange={(value) => handleDataChange(`skills.${index}.type`, value)}
                  size="small"
                />
                <div className="mt-3">
                  <label className="text-xs font-bold text-slate-700 block mb-2">Skill Values</label>
                  <div className="space-y-2">
                    {getSkillValues(skillGroup).map((skill, skillIndex) => (
                      <div key={skillIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(event) => handleDataChange(`skills.${index}.value.${skillIndex}`, event.target.value)}
                          className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add skill"
                        />
                        <button
                          onClick={() => {
                            const newSkills = getSkillValues(skillGroup).filter((_, itemIndex) => itemIndex !== skillIndex);
                            handleDataChange(`skills.${index}.value`, newSkills);
                          }}
                          className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleDataChange(`skills.${index}.value`, [...getSkillValues(skillGroup), ''])}
                      className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Skill
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('skills', { type: '', value: [''] })}
              className="w-full py-2 px-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Skill Section
            </button>
          </div>
        </SectionCard>
      )}

      {Array.isArray(resumeData.education) && (
        <SectionCard
          title="Education"
          isExpanded={expandedSections.education}
          onToggle={() => toggleSection('education')}
          itemCount={resumeData.education.length}
        >
          <div className="space-y-4">
            {resumeData.education.map((education, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Education {index + 1}</h4>
                  <button
                    onClick={() => removeArrayItem('education', index)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InputField label="School/University" value={education.school || ''} onChange={(value) => handleDataChange(`education.${index}.school`, value)} size="small" />
                  <InputField label="Date" value={education.date || ''} onChange={(value) => handleDataChange(`education.${index}.date`, value)} size="small" />
                  <div className="md:col-span-2">
                    <TextAreaField
                      label="Details"
                      value={education.details || ''}
                      onChange={(value) => handleDataChange(`education.${index}.details`, value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('education', { school: '', date: '', details: '' })}
              className="w-full py-2 px-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Education
            </button>
          </div>
        </SectionCard>
      )}

      {Array.isArray(resumeData.miscellaneous) && (
        <SectionCard
          title="Additional Information"
          isExpanded={expandedSections.miscellaneous}
          onToggle={() => toggleSection('miscellaneous')}
          itemCount={resumeData.miscellaneous.length}
        >
          <div className="space-y-4">
            {resumeData.miscellaneous.map((miscellaneousItem, index) => (
              <div key={index} className="flex gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <InputField
                    label={`Item ${index + 1}`}
                    value={miscellaneousItem.type || ''}
                    onChange={(value) => handleDataChange(`miscellaneous.${index}.type`, value)}
                    size="small"
                  />
                </div>
                <button
                  onClick={() => removeArrayItem('miscellaneous', index)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('miscellaneous', { type: '' })}
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
