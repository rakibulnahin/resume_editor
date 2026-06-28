import { callAi, parseJsonFromText } from './ai';

/**
 * High-level resume AI actions. Each function builds a focused prompt and
 * returns either a string (text edits) or a resume-shaped object (tailor /
 * import). All transforms keep the existing JSON schema so the rest of the app
 * (editor, preview, export) keeps working unchanged.
 */

const SCHEMA = `{
  "name": string,
  "email": string,
  "phone": string,
  "address": string,
  "contacts": [{ "annotation": string, "link": string, "showAnnotation": boolean }],
  "profile": string,
  "experience": [{ "company": string, "position": string, "address": string, "date": string, "description": string[] }],
  "projects": [{ "name": string, "description": string[] }],
  "skills": [{ "type": string, "value": string[] }],
  "education": [{ "school": string, "date": string, "details": string }],
  "miscellaneous": [{ "type": string }]
}`;

const STYLE_INSTRUCTIONS = {
  impact: 'Make it impact-focused: lead with a strong action verb and quantify the result where reasonable.',
  concise: 'Make it as concise as possible while keeping the key information. Trim filler words.',
  senior: 'Frame it for a senior/leadership audience: emphasize scope, ownership, and outcomes.',
};

function cleanBullet(text) {
  return (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)[0]
    ?.replace(/^[-•*]\s*/, '')
    .replace(/^["']|["']$/g, '')
    .trim() || '';
}

/**
 * Rewrite a single resume bullet point.
 * @param {string} text
 * @param {{style?: 'impact'|'concise'|'senior', context?: string}} options
 * @returns {Promise<string>}
 */
export async function improveBullet(text, { style = 'impact', context = '' } = {}) {
  const system =
    'You are an expert resume editor. Rewrite the given bullet point into ONE polished resume bullet. ' +
    'Use a strong action verb, keep it truthful (never invent metrics or facts), avoid first-person pronouns, ' +
    'and do not include a leading bullet character. Return only the rewritten bullet text.';
  const user = [
    context ? `Context: ${context}` : '',
    STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS.impact,
    `Bullet: ${text}`,
  ].filter(Boolean).join('\n');

  const result = await callAi({ system, user, temperature: 0.6, maxTokens: 200 });
  return cleanBullet(result) || text;
}

/**
 * Generate (or rewrite) the professional summary from the rest of the resume.
 * @param {Object} resumeData
 * @returns {Promise<string>}
 */
export async function generateProfile(resumeData) {
  const { profile, ...rest } = resumeData || {};
  const system =
    'You write concise professional resume summaries. Produce 2-3 sentences in a confident, ' +
    'professional tone. No first-person pronouns, no fabricated facts. Return only the summary text.';
  const user = `Here is the resume data (JSON). Write a strong professional summary based only on it:\n${JSON.stringify(rest)}`;

  const result = await callAi({ system, user, temperature: 0.6, maxTokens: 400 });
  return (result || '').trim();
}

/**
 * Rewrite the professional summary paragraph (keeps it 2-3 sentences).
 * @param {string} text current profile text
 * @param {{style?: 'impact'|'concise'|'senior'}} options
 * @returns {Promise<string>}
 */
export async function improveProfile(text, { style = 'impact' } = {}) {
  const system =
    'You are an expert resume editor. Rewrite the professional summary into 2-3 polished sentences. ' +
    'Keep it truthful, no first-person pronouns, no fabricated facts. Return only the rewritten summary.';
  const user = [STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS.impact, `Summary: ${text}`].join('\n');
  const result = await callAi({ system, user, temperature: 0.6, maxTokens: 400 });
  return (result || '').trim() || text;
}

/**
 * Tailor a resume to a specific job description (ATS optimization).
 * Rewrites wording/emphasis only — never fabricates history.
 * @param {Object} resumeData
 * @param {string} jobDescription
 * @returns {Promise<Object>} a resume object in the same schema
 */
export async function tailorResume(resumeData, jobDescription) {
  const system =
    'You are an expert resume writer and ATS optimization specialist. You tailor a resume to a job ' +
    'description by rephrasing and reordering existing content to surface relevant skills and keywords ' +
    'naturally. STRICT RULES: do not invent employers, job titles, dates, degrees, or metrics; keep all ' +
    'factual fields (name, email, phone, company names, schools, dates) exactly as given; only improve ' +
    'wording, ordering, and emphasis. Return ONLY a JSON object matching the provided schema.';
  const user = [
    `Resume schema:\n${SCHEMA}`,
    `Current resume (JSON):\n${JSON.stringify(resumeData)}`,
    `Target job description:\n${jobDescription}`,
    'Return the tailored resume as JSON only, same schema, same factual data.',
  ].join('\n\n');

  const result = await callAi({ system, user, temperature: 0.3, json: true, maxTokens: 4096 });
  return parseJsonFromText(result);
}

/**
 * Convert raw resume text (e.g. extracted from a PDF/DOCX) into the JSON schema.
 * @param {string} rawText
 * @returns {Promise<Object>}
 */
export async function parseResumeText(rawText) {
  const system =
    'You convert raw resume text into structured JSON. Extract the information faithfully; do not invent ' +
    'data. For any missing field use an empty string or empty array. "description" fields must be arrays ' +
    'of separate bullet strings. Return ONLY a JSON object matching the provided schema.';
  const user = [
    `Resume schema:\n${SCHEMA}`,
    `Raw resume text:\n${rawText}`,
    'Return JSON only.',
  ].join('\n\n');

  const result = await callAi({ system, user, temperature: 0.2, json: true, maxTokens: 4096 });
  return parseJsonFromText(result);
}
