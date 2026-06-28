import { callAi, parseJsonFromText } from './ai';
import { PROMPTS, RESUME_JSON_SCHEMA, STYLE_INSTRUCTIONS } from './aiPrompts';

function cleanBullet(text) {
  return (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)[0]
    ?.replace(/^[-•*]\s*/, '')
    .replace(/^["']|["']$/g, '')
    .trim() || '';
}

/** Strip empty fields so we send less tokens to the model. */
function compactResume(data) {
  const out = {};
  if (data.name) out.name = data.name;
  if (data.email) out.email = data.email;
  if (data.phone) out.phone = data.phone;
  if (data.address) out.address = data.address;
  if (data.profile) out.profile = data.profile;
  if (Array.isArray(data.contacts) && data.contacts.length) {
    out.contacts = data.contacts.filter((c) => c.link);
  }
  if (Array.isArray(data.experience) && data.experience.length) {
    out.experience = data.experience.filter((e) => e.company || e.position);
  }
  if (Array.isArray(data.projects) && data.projects.length) {
    out.projects = data.projects.filter((p) => p.name);
  }
  if (Array.isArray(data.skills) && data.skills.length) out.skills = data.skills;
  if (Array.isArray(data.education) && data.education.length) {
    out.education = data.education.filter((e) => e.school);
  }
  if (Array.isArray(data.miscellaneous) && data.miscellaneous.length) {
    out.miscellaneous = data.miscellaneous.filter((m) => m.type);
  }
  return out;
}

export async function improveBullet(text, { style = 'impact', context = '' } = {}) {
  const user = [
    STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS.impact,
    context ? `Role context: ${context}` : '',
    `Original bullet:\n${text}`,
  ].filter(Boolean).join('\n\n');

  const result = await callAi({
    system: PROMPTS.improveBullet,
    user,
    temperature: 0.45,
    maxTokens: 180,
    timeoutMs: 30000,
  });
  return cleanBullet(result) || text;
}

export async function improveProfile(text, { style = 'impact' } = {}) {
  const user = [
    STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS.impact,
    `Original summary:\n${text}`,
  ].join('\n\n');

  const result = await callAi({
    system: PROMPTS.improveProfile,
    user,
    temperature: 0.45,
    maxTokens: 350,
    timeoutMs: 45000,
  });
  return (result || '').trim() || text;
}

/**
 * Tailor resume to job — sends compact JSON, no json_object mode (works on all free models).
 */
export async function tailorResume(resumeData, jobDescription) {
  const compact = compactResume(resumeData);
  const user = [
    `JSON schema (output must match exactly):\n${RESUME_JSON_SCHEMA}`,
    `Current resume:\n${JSON.stringify(compact, null, 2)}`,
    `Job description:\n${jobDescription.slice(0, 4000)}`,
    'Tailor the resume for this job. Return the full JSON object only.',
  ].join('\n\n');

  const result = await callAi({
    system: PROMPTS.tailorResume,
    user,
    temperature: 0.25,
    maxTokens: 4000,
    timeoutMs: 90000,
  });
  const parsed = parseJsonFromText(result);
  return {
    ...parsed,
    name: resumeData.name || parsed.name,
    email: resumeData.email || parsed.email,
    phone: resumeData.phone || parsed.phone,
    address: resumeData.address || parsed.address,
    contacts: resumeData.contacts?.length ? resumeData.contacts : parsed.contacts,
  };
}

/**
 * Parse raw resume text into JSON schema. Trims input to avoid token overflow.
 */
export async function parseResumeText(rawText) {
  const trimmed = rawText.slice(0, 12000);
  const user = [
    `JSON schema (output must match exactly):\n${RESUME_JSON_SCHEMA}`,
    `Resume text to parse:\n${trimmed}`,
  ].join('\n\n');

  const result = await callAi({
    system: PROMPTS.parseResumeText,
    user,
    temperature: 0.15,
    maxTokens: 4000,
    timeoutMs: 90000,
  });
  return parseJsonFromText(result);
}
