import React, { useState, useEffect, useCallback } from 'react';
import { Download, Plus, X, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
// import { generateAndDownloadResume } from './docGenerator.js';

// const newResume = () => {
//   const [resumeData, setResumeData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     address: '',
//     contacts: [],
//     profile: '',
//     experience: [],
//     projects: [],
//     skills: [],
//     education: [],
//     miscellaneous: []
//   });

//   const [showPreview, setShowPreview] = useState(true);
//   const [expandedSections, setExpandedSections] = useState({});
//   const [loading, setLoading] = useState(false);

//   // Load from sessionStorage on mount
//   useEffect(() => {
//     const saved = sessionStorage.getItem('resumeData');
//     if (saved) {
//       try {
//         setResumeData(JSON.parse(saved));
//       } catch (e) {
//         console.error('Failed to load resume:', e);
//       }
//     }
//   }, []);

//   // Save to sessionStorage on change
//   useEffect(() => {
//     sessionStorage.setItem('resumeData', JSON.stringify(resumeData));
//   }, [resumeData]);

//   // Handle basic field changes
//   const handleFieldChange = useCallback((field, value) => {
//     setResumeData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   }, []);

//   // Handle array item changes
//   const handleArrayChange = useCallback((arrayName, index, field, value) => {
//     setResumeData(prev => {
//       const newArray = [...prev[arrayName]];
//       if (Array.isArray(value) && field === 'description') {
//         newArray[index][field] = value;
//       } else if (Array.isArray(value) && field === 'value') {
//         newArray[index][field] = value;
//       } else {
//         newArray[index] = {
//           ...newArray[index],
//           [field]: value
//         };
//       }
//       return { ...prev, [arrayName]: newArray };
//     });
//   }, []);

//   // Add array item
//   const addArrayItem = useCallback((arrayName, template) => {
//     setResumeData(prev => ({
//       ...prev,
//       [arrayName]: [...prev[arrayName], { ...template }]
//     }));
//   }, []);

//   // Remove array item
//   const removeArrayItem = useCallback((arrayName, index) => {
//     setResumeData(prev => ({
//       ...prev,
//       [arrayName]: prev[arrayName].filter((_, i) => i !== index)
//     }));
//   }, []);

//   // Toggle section expand
//   const toggleSection = useCallback((section) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   }, []);

//   // Download JSON
//   const downloadJSON = useCallback(() => {
//     const jsonString = JSON.stringify(resumeData, null, 2);
//     const blob = new Blob([jsonString], { type: 'application/json' });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `${resumeData.name || 'resume'}.json`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     window.URL.revokeObjectURL(url);
//   }, [resumeData]);

//   // Download DOCX
//   const downloadDocx = useCallback(async () => {
//     setLoading(true);
//     try {
//       const templatePath = '/templates/resumeTemplate.docx';
//       await generateAndDownloadResume(resumeData, templatePath);
//     } catch (error) {
//       console.error('Error downloading DOCX:', error);
//       alert('Failed to generate DOCX. Check console for details.');
//     } finally {
//       setLoading(false);
//     }
//   }, [resumeData]);

//   // Detect mobile
//   const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       {/* Header */}
//       <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
//           <h1 className="text-2xl font-bold text-slate-900">Resume Builder</h1>
//           <div className="flex gap-2">
//             <button
//               onClick={downloadJSON}
//               className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-sm"
//             >
//               <Download size={16} />
//               JSON
//             </button>
//             <button
//               onClick={downloadDocx}
//               disabled={loading}
//               className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
//             >
//               <Download size={16} />
//               {loading ? 'Generating...' : 'DOCX'}
//             </button>
//             {isMobile && (
//               <button
//                 onClick={() => setShowPreview(!showPreview)}
//                 className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
//               >
//                 {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
//                 {showPreview ? 'Edit' : 'Preview'}
//               </button>
//             )}
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto p-4">
//         <div className={`grid gap-4 ${!isMobile && showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
//           {/* Form Section */}
//           {!showPreview || !isMobile ? (
//             <FormSection
//               resumeData={resumeData}
//               handleFieldChange={handleFieldChange}
//               handleArrayChange={handleArrayChange}
//               addArrayItem={addArrayItem}
//               removeArrayItem={removeArrayItem}
//               expandedSections={expandedSections}
//               toggleSection={toggleSection}
//             />
//           ) : null}

//           {/* Preview Section */}
//           {(showPreview || !isMobile) && (
//             <PreviewSection resumeData={resumeData} isMobile={isMobile} />
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// // Form Section Component
// const FormSection = ({
//   resumeData,
//   handleFieldChange,
//   handleArrayChange,
//   addArrayItem,
//   removeArrayItem,
//   expandedSections,
//   toggleSection
// }) => {
//   return (
//     <div className="space-y-3">
//       {/* Personal Info */}
//       <SectionCard
//         title="Personal Information"
//         expanded={expandedSections['personal']}
//         onToggle={() => toggleSection('personal')}
//       >
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           <InputField
//             label="Full Name"
//             value={resumeData.name}
//             onChange={(v) => handleFieldChange('name', v)}
//           />
//           <InputField
//             label="Email"
//             value={resumeData.email}
//             onChange={(v) => handleFieldChange('email', v)}
//           />
//           <InputField
//             label="Phone"
//             value={resumeData.phone}
//             onChange={(v) => handleFieldChange('phone', v)}
//           />
//           <InputField
//             label="Address"
//             value={resumeData.address}
//             onChange={(v) => handleFieldChange('address', v)}
//           />
//         </div>
//         <div className="mt-3">
//           <TextAreaField
//             label="Profile"
//             value={resumeData.profile}
//             onChange={(v) => handleFieldChange('profile', v)}
//             rows={3}
//           />
//         </div>

//         {/* Contacts */}
//         <div className="mt-3">
//           <div className="flex justify-between items-center mb-2">
//             <label className="text-sm font-bold text-slate-900">Contacts</label>
//             <button
//               onClick={() => addArrayItem('contacts', { annotation: '', link: '', showAnnotation: true })}
//               className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1"
//             >
//               <Plus size={14} /> Add
//             </button>
//           </div>
//           <div className="space-y-2">
//             {resumeData.contacts.map((contact, idx) => (
//               <div key={idx} className="flex gap-2 p-2 bg-slate-100 rounded">
//                 <div className="flex-1 space-y-2">
//                   <InputField
//                     label="Annotation"
//                     value={contact.annotation}
//                     onChange={(v) => handleArrayChange('contacts', idx, 'annotation', v)}
//                     size="small"
//                   />
//                   <InputField
//                     label="Link"
//                     value={contact.link}
//                     onChange={(v) => handleArrayChange('contacts', idx, 'link', v)}
//                     size="small"
//                   />
//                 </div>
//                 <button
//                   onClick={() => removeArrayItem('contacts', idx)}
//                   className="text-red-500 hover:bg-red-50 p-1 rounded h-fit"
//                 >
//                   <X size={16} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </SectionCard>

//       {/* Experience */}
//       <SectionCard
//         title="Work Experience"
//         expanded={expandedSections['experience']}
//         onToggle={() => toggleSection('experience')}
//         count={resumeData.experience.length}
//       >
//         <div className="space-y-3">
//           {resumeData.experience.map((exp, idx) => (
//             <div key={idx} className="p-3 bg-slate-100 rounded border border-slate-200">
//               <div className="flex justify-between mb-2">
//                 <h4 className="font-semibold text-slate-900">Position {idx + 1}</h4>
//                 <button
//                   onClick={() => removeArrayItem('experience', idx)}
//                   className="text-red-500 hover:bg-red-50 p-1 rounded"
//                 >
//                   <X size={16} />
//                 </button>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                 <InputField
//                   label="Company"
//                   value={exp.company}
//                   onChange={(v) => handleArrayChange('experience', idx, 'company', v)}
//                   size="small"
//                 />
//                 <InputField
//                   label="Position"
//                   value={exp.position}
//                   onChange={(v) => handleArrayChange('experience', idx, 'position', v)}
//                   size="small"
//                 />
//                 <InputField
//                   label="Address"
//                   value={exp.address}
//                   onChange={(v) => handleArrayChange('experience', idx, 'address', v)}
//                   size="small"
//                 />
//                 <InputField
//                   label="Date"
//                   value={exp.date}
//                   onChange={(v) => handleArrayChange('experience', idx, 'date', v)}
//                   size="small"
//                 />
//               </div>
//               <div className="mt-2">
//                 <label className="text-xs font-bold text-slate-700 block mb-1">Descriptions</label>
//                 <div className="space-y-1">
//                   {Array.isArray(exp.description) && exp.description.map((desc, descIdx) => (
//                     <div key={descIdx} className="flex gap-1">
//                       <input
//                         type="text"
//                         value={desc}
//                         onChange={(e) => {
//                           const newDesc = [...exp.description];
//                           newDesc[descIdx] = e.target.value;
//                           handleArrayChange('experience', idx, 'description', newDesc);
//                         }}
//                         className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       />
//                       <button
//                         onClick={() => {
//                           const newDesc = exp.description.filter((_, i) => i !== descIdx);
//                           handleArrayChange('experience', idx, 'description', newDesc);
//                         }}
//                         className="text-red-500 hover:bg-red-50 p-1 rounded"
//                       >
//                         <X size={14} />
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     onClick={() => {
//                       const newDesc = [...(exp.description || []), ''];
//                       handleArrayChange('experience', idx, 'description', newDesc);
//                     }}
//                     className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1"
//                   >
//                     <Plus size={12} /> Add
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//           <button
//             onClick={() => addArrayItem('experience', { company: '', position: '', address: '', date: '', description: [] })}
//             className="w-full py-2 px-3 border-2 border-dashed border-blue-300 text-blue-600 rounded hover:bg-blue-50 text-sm font-medium flex items-center justify-center gap-1"
//           >
//             <Plus size={16} /> Add Experience
//           </button>
//         </div>
//       </SectionCard>

//       {/* Projects */}
//       <SectionCard
//         title="Projects"
//         expanded={expandedSections['projects']}
//         onToggle={() => toggleSection('projects')}
//         count={resumeData.projects.length}
//       >
//         <div className="space-y-3">
//           {resumeData.projects.map((proj, idx) => (
//             <div key={idx} className="p-3 bg-slate-100 rounded border border-slate-200">
//               <div className="flex justify-between mb-2">
//                 <h4 className="font-semibold text-slate-900">Project {idx + 1}</h4>
//                 <button
//                   onClick={() => removeArrayItem('projects', idx)}
//                   className="text-red-500 hover:bg-red-50 p-1 rounded"
//                 >
//                   <X size={16} />
//                 </button>
//               </div>
//               <InputField
//                 label="Project Name"
//                 value={proj.name}
//                 onChange={(v) => handleArrayChange('projects', idx, 'name', v)}
//                 size="small"
//               />
//               <div className="mt-2">
//                 <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
//                 <div className="space-y-1">
//                   {Array.isArray(proj.description) && proj.description.map((desc, descIdx) => (
//                     <div key={descIdx} className="flex gap-1">
//                       <input
//                         type="text"
//                         value={desc}
//                         onChange={(e) => {
//                           const newDesc = [...proj.description];
//                           newDesc[descIdx] = e.target.value;
//                           handleArrayChange('projects', idx, 'description', newDesc);
//                         }}
//                         className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       />
//                       <button
//                         onClick={() => {
//                           const newDesc = proj.description.filter((_, i) => i !== descIdx);
//                           handleArrayChange('projects', idx, 'description', newDesc);
//                         }}
//                         className="text-red-500 hover:bg-red-50 p-1 rounded"
//                       >
//                         <X size={14} />
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     onClick={() => {
//                       const newDesc = [...(proj.description || []), ''];
//                       handleArrayChange('projects', idx, 'description', newDesc);
//                     }}
//                     className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1"
//                   >
//                     <Plus size={12} /> Add
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//           <button
//             onClick={() => addArrayItem('projects', { name: '', description: [] })}
//             className="w-full py-2 px-3 border-2 border-dashed border-blue-300 text-blue-600 rounded hover:bg-blue-50 text-sm font-medium flex items-center justify-center gap-1"
//           >
//             <Plus size={16} /> Add Project
//           </button>
//         </div>
//       </SectionCard>

//       {/* Skills */}
//       <SectionCard
//         title="Skills"
//         expanded={expandedSections['skills']}
//         onToggle={() => toggleSection('skills')}
//         count={resumeData.skills.length}
//       >
//         <div className="space-y-3">
//           {resumeData.skills.map((skill, idx) => (
//             <div key={idx} className="p-3 bg-slate-100 rounded border border-slate-200">
//               <div className="flex justify-between mb-2">
//                 <h4 className="font-semibold text-slate-900">Skill Group {idx + 1}</h4>
//                 <button
//                   onClick={() => removeArrayItem('skills', idx)}
//                   className="text-red-500 hover:bg-red-50 p-1 rounded"
//                 >
//                   <X size={16} />
//                 </button>
//               </div>
//               <InputField
//                 label="Category (Type)"
//                 value={skill.type || ''}
//                 onChange={(v) => handleArrayChange('skills', idx, 'type', v)}
//                 size="small"
//               />
//               <div className="mt-2">
//                 <label className="text-xs font-bold text-slate-700 block mb-1">Skills</label>
//                 <div className="space-y-1">
//                   {Array.isArray(skill.value || skill.field) && (skill.value || skill.field).map((s, sIdx) => (
//                     <div key={sIdx} className="flex gap-1">
//                       <input
//                         type="text"
//                         value={s}
//                         onChange={(e) => {
//                           const fieldName = skill.value ? 'value' : 'field';
//                           const newSkills = [...(skill[fieldName] || [])];
//                           newSkills[sIdx] = e.target.value;
//                           handleArrayChange('skills', idx, fieldName, newSkills);
//                         }}
//                         className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       />
//                       <button
//                         onClick={() => {
//                           const fieldName = skill.value ? 'value' : 'field';
//                           const newSkills = (skill[fieldName] || []).filter((_, i) => i !== sIdx);
//                           handleArrayChange('skills', idx, fieldName, newSkills);
//                         }}
//                         className="text-red-500 hover:bg-red-50 p-1 rounded"
//                       >
//                         <X size={14} />
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     onClick={() => {
//                       const fieldName = skill.value ? 'value' : 'field';
//                       const newSkills = [...(skill[fieldName] || []), ''];
//                       handleArrayChange('skills', idx, fieldName, newSkills);
//                     }}
//                     className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1"
//                   >
//                     <Plus size={12} /> Add
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//           <button
//             onClick={() => addArrayItem('skills', { type: '', value: [] })}
//             className="w-full py-2 px-3 border-2 border-dashed border-blue-300 text-blue-600 rounded hover:bg-blue-50 text-sm font-medium flex items-center justify-center gap-1"
//           >
//             <Plus size={16} /> Add Skill Group
//           </button>
//         </div>
//       </SectionCard>

//       {/* Education */}
//       <SectionCard
//         title="Education"
//         expanded={expandedSections['education']}
//         onToggle={() => toggleSection('education')}
//         count={resumeData.education.length}
//       >
//         <div className="space-y-3">
//           {resumeData.education.map((edu, idx) => (
//             <div key={idx} className="p-3 bg-slate-100 rounded border border-slate-200">
//               <div className="flex justify-between mb-2">
//                 <h4 className="font-semibold text-slate-900">Education {idx + 1}</h4>
//                 <button
//                   onClick={() => removeArrayItem('education', idx)}
//                   className="text-red-500 hover:bg-red-50 p-1 rounded"
//                 >
//                   <X size={16} />
//                 </button>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                 <InputField
//                   label="School/University"
//                   value={edu.school}
//                   onChange={(v) => handleArrayChange('education', idx, 'school', v)}
//                   size="small"
//                 />
//                 <InputField
//                   label="Date"
//                   value={edu.date}
//                   onChange={(v) => handleArrayChange('education', idx, 'date', v)}
//                   size="small"
//                 />
//               </div>
//               <div className="mt-2">
//                 <TextAreaField
//                   label="Details"
//                   value={edu.details}
//                   onChange={(v) => handleArrayChange('education', idx, 'details', v)}
//                   rows={2}
//                 />
//               </div>
//             </div>
//           ))}
//           <button
//             onClick={() => addArrayItem('education', { school: '', date: '', details: '' })}
//             className="w-full py-2 px-3 border-2 border-dashed border-blue-300 text-blue-600 rounded hover:bg-blue-50 text-sm font-medium flex items-center justify-center gap-1"
//           >
//             <Plus size={16} /> Add Education
//           </button>
//         </div>
//       </SectionCard>

//       {/* Miscellaneous */}
//       <SectionCard
//         title="Additional Information"
//         expanded={expandedSections['misc']}
//         onToggle={() => toggleSection('misc')}
//         count={resumeData.miscellaneous.length}
//       >
//         <div className="space-y-2">
//           {resumeData.miscellaneous.map((item, idx) => (
//             <div key={idx} className="flex gap-2 p-2 bg-slate-100 rounded">
//               <InputField
//                 label={`Item ${idx + 1}`}
//                 value={item.type}
//                 onChange={(v) => handleArrayChange('miscellaneous', idx, 'type', v)}
//                 size="small"
//               />
//               <button
//                 onClick={() => removeArrayItem('miscellaneous', idx)}
//                 className="text-red-500 hover:bg-red-50 p-1 rounded h-fit"
//               >
//                 <X size={16} />
//               </button>
//             </div>
//           ))}
//           <button
//             onClick={() => addArrayItem('miscellaneous', { type: '' })}
//             className="w-full py-2 px-3 border-2 border-dashed border-blue-300 text-blue-600 rounded hover:bg-blue-50 text-sm font-medium flex items-center justify-center gap-1"
//           >
//             <Plus size={16} /> Add Item
//           </button>
//         </div>
//       </SectionCard>
//     </div>
//   );
// };

// Preview Section Component
//  const PreviewSection = ({ resumeData, isMobile }) => {
//   return (
//     <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-6 ${isMobile ? 'fixed inset-0 z-50 overflow-y-auto' : 'sticky top-20 h-fit'}`}>
//       {/* Preview Header */}
//       <div className="text-center border-b-2 border-slate-300 pb-4 mb-4">
//         {resumeData.name && (
//           <h1 className="text-2xl font-bold text-slate-900">{resumeData.name}</h1>
//         )}
//         <div className="text-sm text-slate-600 mt-2">
//           {[resumeData.email, resumeData.phone, resumeData.address]
//             .filter(Boolean)
//             .join(' | ')}
//         </div>
//       </div>

//       {/* Profile */}
//       {resumeData.profile && (
//         <div className="mb-4">
//           <h3 className="font-bold text-slate-900 mb-2">PROFILE</h3>
//           <p className="text-sm text-slate-700">{resumeData.profile}</p>
//         </div>
//       )}

//       {/* Experience */}
//       {resumeData.experience?.length > 0 && (
//         <div className="mb-4">
//           <h3 className="font-bold text-slate-900 mb-2">WORK EXPERIENCE</h3>
//           {resumeData.experience.map((exp, idx) => (
//             <div key={idx} className="mb-3 pb-2 border-b border-slate-200">
//               <div className="font-semibold text-sm text-slate-900">
//                 {exp.position && exp.company ? `${exp.position} | ${exp.company}` : (exp.position || exp.company)}
//               </div>
//               {(exp.address || exp.date) && (
//                 <div className="text-xs text-slate-600 italic">{exp.address} | {exp.date}</div>
//               )}
//               {exp.description?.map((desc, didx) => (
//                 <div key={didx} className="text-xs text-slate-700 ml-2 mt-1">• {desc}</div>
//               ))}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Projects */}
//       {resumeData.projects?.length > 0 && (
//         <div className="mb-4">
//           <h3 className="font-bold text-slate-900 mb-2">PROJECTS</h3>
//           {resumeData.projects.map((proj, idx) => (
//             <div key={idx} className="mb-3 pb-2 border-b border-slate-200">
//               {proj.name && <div className="font-semibold text-sm text-slate-900">{proj.name}</div>}
//               {proj.description?.map((desc, didx) => (
//                 <div key={didx} className="text-xs text-slate-700">• {desc}</div>
//               ))}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Skills */}
//       {resumeData.skills?.length > 0 && (
//         <div className="mb-4">
//           <h3 className="font-bold text-slate-900 mb-2">SKILLS</h3>
//           {resumeData.skills.map((skill, idx) => (
//             <div key={idx} className="text-xs text-slate-700">
//               {skill.type && <span className="font-semibold">{skill.type}: </span>}
//               {(skill.value || skill.field)?.join(', ')}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Education */}
//       {resumeData.education?.length > 0 && (
//         <div className="mb-4">
//           <h3 className="font-bold text-slate-900 mb-2">EDUCATION</h3>
//           {resumeData.education.map((edu, idx) => (
//             <div key={idx} className="mb-2 pb-2 border-b border-slate-200">
//               {edu.school && <div className="font-semibold text-sm text-slate-900">{edu.school}</div>}
//               {edu.date && <div className="text-xs text-slate-600 italic">{edu.date}</div>}
//               {edu.details && <div className="text-xs text-slate-700">{edu.details}</div>}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Miscellaneous */}
//       {resumeData.miscellaneous?.length > 0 && (
//         <div>
//           <h3 className="font-bold text-slate-900 mb-2">ADDITIONAL</h3>
//           {resumeData.miscellaneous.map((item, idx) => (
//             <div key={idx} className="text-xs text-slate-700">• {item.type}</div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // Input Field Component
// const InputField = ({ label, value, onChange, size = 'normal' }) => {
//   const sizeClasses = size === 'small' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm';
  
//   return (
//     <div>
//       <label className={`block font-semibold text-slate-900 mb-1 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
//         {label}
//       </label>
//       <input
//         type="text"
//         value={value || ''}
//         onChange={(e) => onChange(e.target.value)}
//         className={`w-full border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${sizeClasses}`}
//       />
//     </div>
//   );
// };

// // Text Area Field Component
// const TextAreaField = ({ label, value, onChange, rows = 4 }) => {
//   return (
//     <div>
//       <label className="block text-sm font-semibold text-slate-900 mb-1">
//         {label}
//       </label>
//       <textarea
//         value={value || ''}
//         onChange={(e) => onChange(e.target.value)}
//         rows={rows}
//         className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
//       />
//     </div>
//   );
// };

// // Section Card Component
// const SectionCard = ({ title, expanded, onToggle, count, children }) => {
//   return (
//     <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
//       <button
//         onClick={onToggle}
//         className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
//       >
//         <div className="flex items-center gap-2">
//           <h2 className="text-sm font-bold text-slate-900">{title}</h2>
//           {count !== undefined && (
//             <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
//               {count}
//             </span>
//           )}
//         </div>
//         {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//       </button>
//       {expanded && (
//         <div className="border-t border-slate-200 px-4 py-3">
//           {children}
//         </div>
//       )}
//     </div>
//   );
// };

// export default newResume;
