/**
 * Resume layout templates — each changes STRUCTURE, not just colors.
 *
 * Inspired by JSON Resume themes (jsonresume.org/themes): kendall (sidebar),
 * onepage (compact), professional (classic), spartacus (bold header).
 * Same JSON data → different visual layout in preview, DOCX, and PDF.
 */

export const TEMPLATES = {
  classic: {
    id: 'classic',
    label: 'Classic Professional',
    layout: 'classic',
    description: 'Single column, section headers with underline — ATS-friendly standard.',
    headingFont: 'Calibri',
    bodyFont: 'Arial',
    nameSizePt: 28,
    sectionSizePt: 12,
    bodySizePt: 10,
    sectionShaded: true,
    colors: {
      name: '#1A365D',
      accent: '#3182CE',
      sectionHeading: '#1A365D',
      sectionBg: '#E8E8E8',
      sidebarBg: '#1A365D',
      sidebarText: '#FFFFFF',
      jobTitle: '#0066CC',
      jobMeta: '#555555',
      text: '#1A1A1A',
    },
  },
  sidebar: {
    id: 'sidebar',
    label: 'Modern Sidebar',
    layout: 'sidebar',
    description: 'Contact & skills in a left sidebar — popular on LinkedIn-style CVs.',
    headingFont: 'Calibri',
    bodyFont: 'Arial',
    nameSizePt: 24,
    sectionSizePt: 11,
    bodySizePt: 10,
    sectionShaded: false,
    colors: {
      name: '#FFFFFF',
      accent: '#14B8A6',
      sectionHeading: '#0F766E',
      sectionBg: '#F0FDFA',
      sidebarBg: '#0F766E',
      sidebarText: '#FFFFFF',
      jobTitle: '#0F766E',
      jobMeta: '#64748B',
      text: '#1E293B',
    },
  },
  compact: {
    id: 'compact',
    label: 'Compact One-Page',
    layout: 'compact',
    description: 'Dense layout — fits more on one page, smaller spacing.',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    nameSizePt: 22,
    sectionSizePt: 10,
    bodySizePt: 9,
    sectionShaded: false,
    colors: {
      name: '#111111',
      accent: '#111111',
      sectionHeading: '#111111',
      sectionBg: '#F5F5F5',
      sidebarBg: '#111111',
      sidebarText: '#FFFFFF',
      jobTitle: '#111111',
      jobMeta: '#666666',
      text: '#222222',
    },
  },
  executive: {
    id: 'executive',
    label: 'Executive Bold',
    layout: 'executive',
    description: 'Large centered name, skills as tags, timeline-style experience.',
    headingFont: 'Georgia',
    bodyFont: 'Times New Roman',
    nameSizePt: 32,
    sectionSizePt: 13,
    bodySizePt: 11,
    sectionShaded: true,
    colors: {
      name: '#1C1917',
      accent: '#92400E',
      sectionHeading: '#92400E',
      sectionBg: '#FEF3C7',
      sidebarBg: '#1C1917',
      sidebarText: '#FFFFFF',
      jobTitle: '#92400E',
      jobMeta: '#78716C',
      text: '#292524',
    },
  },
};

export const DEFAULT_TEMPLATE_ID = 'classic';
/** @deprecated use DEFAULT_TEMPLATE_ID */
export const DEFAULT_THEME_ID = DEFAULT_TEMPLATE_ID;

const LEGACY_TEMPLATE_IDS = {
  'classic-blue': 'classic',
  'minimal-mono': 'compact',
  'modern-teal': 'sidebar',
  'elegant-serif': 'executive',
};

export function getTheme(templateId) {
  const resolved = LEGACY_TEMPLATE_IDS[templateId] || templateId;
  return TEMPLATES[resolved] || TEMPLATES[DEFAULT_TEMPLATE_ID];
}

export const THEME_LIST = Object.values(TEMPLATES);

export function hexForDocx(hex) {
  return (hex || '').replace('#', '');
}

export function hexToRgb(hex) {
  const clean = (hex || '').replace('#', '');
  const bigint = parseInt(clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean, 16);
  if (Number.isNaN(bigint)) return [0, 0, 0];
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}
