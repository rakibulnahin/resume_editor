import { Plus, X } from 'lucide-react';
import { getSkillValues } from '../utils/resumeData';
import { InputField, TextAreaField } from './FormFields';
import SectionCard from './SectionCard';

export default function ResumeEditor({
  resumeData,
  onDataChange,
  onAddItem,
  onRemoveItem,
  expandedSections,
  onToggleSection,
}) {
  return (
    <div className="space-y-4">
      <SectionCard
        title="Personal Information"
        isExpanded={expandedSections.name}
        onToggle={() => onToggleSection('name')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Full Name" value={resumeData.name || ''} onChange={(value) => onDataChange('name', value)} />
          <InputField label="Email" value={resumeData.email || ''} onChange={(value) => onDataChange('email', value)} />
          <InputField label="Phone" value={resumeData.phone || ''} onChange={(value) => onDataChange('phone', value)} />
          <InputField label="Address" value={resumeData.address || ''} onChange={(value) => onDataChange('address', value)} />
        </div>

        <div className="mt-4">
          <TextAreaField
            label="Professional Profile"
            value={resumeData.profile || ''}
            onChange={(value) => onDataChange('profile', value)}
            rows={3}
          />
        </div>

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
              {resumeData.contacts.map((contact, index) => (
                <div key={index} className="flex gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1 space-y-2">
                    <InputField
                      label="Annotation"
                      value={contact.annotation || ''}
                      onChange={(value) => onDataChange(`contacts.${index}.annotation`, value)}
                      size="small"
                    />
                    <InputField
                      label="Link"
                      value={contact.link || ''}
                      onChange={(value) => onDataChange(`contacts.${index}.link`, value)}
                      size="small"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={contact.showAnnotation || false}
                        onChange={(event) => onDataChange(`contacts.${index}.showAnnotation`, event.target.checked)}
                        className="rounded"
                      />
                      <span className="text-slate-700">Show Annotation</span>
                    </label>
                  </div>
                  <button
                    onClick={() => onRemoveItem('contacts', index)}
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
          onToggle={() => onToggleSection('experience')}
          itemCount={resumeData.experience.length}
        >
          <div className="space-y-4">
            {resumeData.experience.map((experience, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Position {index + 1}</h4>
                  <button
                    onClick={() => onRemoveItem('experience', index)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InputField label="Company" value={experience.company || ''} onChange={(value) => onDataChange(`experience.${index}.company`, value)} size="small" />
                  <InputField label="Position" value={experience.position || ''} onChange={(value) => onDataChange(`experience.${index}.position`, value)} size="small" />
                  <InputField label="Address" value={experience.address || ''} onChange={(value) => onDataChange(`experience.${index}.address`, value)} size="small" />
                  <InputField label="Date" value={experience.date || ''} onChange={(value) => onDataChange(`experience.${index}.date`, value)} size="small" />
                </div>
                <div className="mt-3">
                  <label className="text-xs font-bold text-slate-700 block mb-2">Descriptions</label>
                  <div className="space-y-2">
                    {Array.isArray(experience.description) && experience.description.map((description, descriptionIndex) => (
                      <div key={descriptionIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={description}
                          onChange={(event) => onDataChange(`experience.${index}.description.${descriptionIndex}`, event.target.value)}
                          className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add description"
                        />
                        <button
                          onClick={() => {
                            const newDescriptions = experience.description.filter((_, itemIndex) => itemIndex !== descriptionIndex);
                            onDataChange(`experience.${index}.description`, newDescriptions);
                          }}
                          className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => onDataChange(`experience.${index}.description`, [...(experience.description || []), ''])}
                      className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Description
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => onAddItem('experience', { company: '', position: '', address: '', date: '', description: [''] })}
              className="w-full py-2 px-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Experience
            </button>
          </div>
        </SectionCard>
      )}

      {Array.isArray(resumeData.skills) && (
        <SectionCard
          title="Skills"
          isExpanded={expandedSections.skills}
          onToggle={() => onToggleSection('skills')}
          itemCount={resumeData.skills.length}
        >
          <div className="space-y-4">
            {resumeData.skills.map((skillGroup, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Skill Section {index + 1}</h4>
                  <button
                    onClick={() => onRemoveItem('skills', index)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <InputField
                  label="Skill Type"
                  value={skillGroup.type || ''}
                  onChange={(value) => onDataChange(`skills.${index}.type`, value)}
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
                          onChange={(event) => onDataChange(`skills.${index}.value.${skillIndex}`, event.target.value)}
                          className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add skill"
                        />
                        <button
                          onClick={() => {
                            const newSkills = getSkillValues(skillGroup).filter((_, itemIndex) => itemIndex !== skillIndex);
                            onDataChange(`skills.${index}.value`, newSkills);
                          }}
                          className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => onDataChange(`skills.${index}.value`, [...getSkillValues(skillGroup), ''])}
                      className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Skill
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => onAddItem('skills', { type: '', value: [''] })}
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
          onToggle={() => onToggleSection('education')}
          itemCount={resumeData.education.length}
        >
          <div className="space-y-4">
            {resumeData.education.map((education, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Education {index + 1}</h4>
                  <button
                    onClick={() => onRemoveItem('education', index)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InputField label="School/University" value={education.school || ''} onChange={(value) => onDataChange(`education.${index}.school`, value)} size="small" />
                  <InputField label="Date" value={education.date || ''} onChange={(value) => onDataChange(`education.${index}.date`, value)} size="small" />
                  <div className="md:col-span-2">
                    <TextAreaField
                      label="Details"
                      value={education.details || ''}
                      onChange={(value) => onDataChange(`education.${index}.details`, value)}
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

      {Array.isArray(resumeData.miscellaneous) && (
        <SectionCard
          title="Additional Information"
          isExpanded={expandedSections.miscellaneous}
          onToggle={() => onToggleSection('miscellaneous')}
          itemCount={resumeData.miscellaneous.length}
        >
          <div className="space-y-4">
            {resumeData.miscellaneous.map((miscellaneousItem, index) => (
              <div key={index} className="flex gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <InputField
                    label={`Item ${index + 1}`}
                    value={miscellaneousItem.type || ''}
                    onChange={(value) => onDataChange(`miscellaneous.${index}.type`, value)}
                    size="small"
                  />
                </div>
                <button
                  onClick={() => onRemoveItem('miscellaneous', index)}
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
