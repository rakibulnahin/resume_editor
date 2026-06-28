/** Default empty resume — single source of truth for the app schema. */
export function emptyResume() {
  return {
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
    miscellaneous: [],
  };
}

function toStringArray(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function mapExperienceItem(item) {
  if (!item || typeof item !== 'object') return null;
  return {
    company: item.company || item.employer || '',
    position: item.position || item.title || item.role || '',
    address: item.address || item.location || '',
    date: item.date || item.dates || item.period
      || [item.startDate, item.endDate].filter(Boolean).join(' – ')
      || '',
    description: toStringArray(item.description || item.highlights || item.bullets),
  };
}

function mapProjectItem(item) {
  if (!item || typeof item !== 'object') return null;
  return {
    name: item.name || item.title || '',
    description: toStringArray(item.description || item.summary),
  };
}

function mapEducationItem(item) {
  if (!item || typeof item !== 'object') return null;
  return {
    school: item.school || item.institution || item.university || '',
    date: item.date || item.dates || [item.startDate, item.endDate].filter(Boolean).join(' – ') || '',
    details: item.details || item.studyType || item.area || '',
  };
}

/**
 * Convert JSON Resume standard format (basics/work/education) into our flat schema.
 * AI models often return this format even when asked for ours.
 */
function fromJsonResumeFormat(data) {
  if (!data?.basics && !data?.work) return data;
  const basics = data.basics || {};
  const location = basics.location || {};
  return {
    name: basics.name || data.name || '',
    email: basics.email || data.email || '',
    phone: basics.phone || data.phone || '',
    address: basics.address || data.address
      || [location.city, location.region, location.countryCode].filter(Boolean).join(', ')
      || '',
    profile: basics.summary || data.profile || data.summary || '',
    contacts: Array.isArray(basics.profiles)
      ? basics.profiles.map((p) => ({
          annotation: p.network || p.label || '',
          link: p.url || '',
          showAnnotation: true,
        }))
      : (data.contacts || []),
    experience: (data.work || data.experience || []).map(mapExperienceItem).filter(Boolean),
    projects: (data.projects || []).map(mapProjectItem).filter(Boolean),
    skills: data.skills || [],
    education: (data.education || []).map(mapEducationItem).filter(Boolean),
    miscellaneous: data.miscellaneous || data.interests || [],
  };
}

/**
 * Merge any partial / AI / uploaded JSON into a complete resume object
 * the editor, preview, and exporters all understand.
 */
export function ensureResumeShape(input) {
  const raw = fromJsonResumeFormat(input && typeof input === 'object' ? input : {});
  const base = emptyResume();

  const merged = {
    ...base,
    ...raw,
    name: String(raw.name || '').trim(),
    email: String(raw.email || '').trim(),
    phone: String(raw.phone || '').trim(),
    address: String(raw.address || '').trim(),
    profile: String(raw.profile || '').trim(),
    contacts: Array.isArray(raw.contacts) ? raw.contacts : [],
    experience: Array.isArray(raw.experience)
      ? raw.experience.map(mapExperienceItem).filter(Boolean)
      : [],
    projects: Array.isArray(raw.projects)
      ? raw.projects.map(mapProjectItem).filter(Boolean)
      : [],
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    education: Array.isArray(raw.education)
      ? raw.education.map(mapEducationItem).filter(Boolean)
      : [],
    miscellaneous: Array.isArray(raw.miscellaneous) ? raw.miscellaneous : [],
  };

  return normalizeResumeData(merged);
}

export function normalizeResumeData(data) {
  if (!data || typeof data !== 'object') return emptyResume();

  return {
    ...data,
    contacts: Array.isArray(data.contacts) ? data.contacts : [],
    experience: Array.isArray(data.experience) ? data.experience : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    education: Array.isArray(data.education) ? data.education : [],
    miscellaneous: Array.isArray(data.miscellaneous) ? data.miscellaneous : [],
    skills: Array.isArray(data.skills)
      ? data.skills.map((skillGroup) => {
          const value = getSkillValues(skillGroup);
          const { field, ...rest } = skillGroup || {};

          return {
            ...rest,
            type: skillGroup?.type || (Array.isArray(field) ? 'field' : ''),
            value,
          };
        })
      : [],
  };
}

export function getSkillValues(skillGroup) {
  if (Array.isArray(skillGroup?.value)) return skillGroup.value;
  if (Array.isArray(skillGroup?.field)) return skillGroup.field;
  return [];
}
