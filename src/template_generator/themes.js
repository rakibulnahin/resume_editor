/**
 * Shared resume theme presets.
 *
 * A theme is described once in neutral, human-friendly units (hex colors,
 * point sizes, font family names) and then translated by each generator:
 *   - docGenerator.js  -> docx units (half-points, hex without '#')
 *   - pdfGenerator.js  -> jsPDF units (points, RGB arrays)
 *
 * This keeps the DOCX and PDF outputs visually consistent and makes adding a
 * new style a one-object change.
 */

export const THEMES = {
  'classic-blue': {
    id: 'classic-blue',
    label: 'Classic Blue',
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
      jobTitle: '#0066CC',
      jobMeta: '#0066CC',
      text: '#1A1A1A',
    },
  },
  'minimal-mono': {
    id: 'minimal-mono',
    label: 'Minimal Mono',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    nameSizePt: 26,
    sectionSizePt: 11,
    bodySizePt: 10,
    sectionShaded: false,
    colors: {
      name: '#111111',
      accent: '#111111',
      sectionHeading: '#111111',
      sectionBg: '#EFEFEF',
      jobTitle: '#111111',
      jobMeta: '#555555',
      text: '#222222',
    },
  },
  'modern-teal': {
    id: 'modern-teal',
    label: 'Modern Teal',
    headingFont: 'Calibri',
    bodyFont: 'Calibri',
    nameSizePt: 28,
    sectionSizePt: 12,
    bodySizePt: 10,
    sectionShaded: true,
    colors: {
      name: '#0F766E',
      accent: '#14B8A6',
      sectionHeading: '#0F766E',
      sectionBg: '#E6FFFA',
      jobTitle: '#0D9488',
      jobMeta: '#475569',
      text: '#1A1A1A',
    },
  },
  'elegant-serif': {
    id: 'elegant-serif',
    label: 'Elegant Serif',
    headingFont: 'Georgia',
    bodyFont: 'Times New Roman',
    nameSizePt: 28,
    sectionSizePt: 12,
    bodySizePt: 11,
    sectionShaded: false,
    colors: {
      name: '#3B2F2F',
      accent: '#8C6A4A',
      sectionHeading: '#3B2F2F',
      sectionBg: '#F1EAE2',
      jobTitle: '#5B4636',
      jobMeta: '#6B5B4B',
      text: '#2A2A2A',
    },
  },
};

export const DEFAULT_THEME_ID = 'classic-blue';

export function getTheme(themeId) {
  return THEMES[themeId] || THEMES[DEFAULT_THEME_ID];
}

export const THEME_LIST = Object.values(THEMES);

/** Strip the leading '#' for docx, which expects bare hex (e.g. "1A365D"). */
export function hexForDocx(hex) {
  return (hex || '').replace('#', '');
}

/** Convert "#RRGGBB" to a [r, g, b] array for jsPDF. */
export function hexToRgb(hex) {
  const clean = (hex || '').replace('#', '');
  const bigint = parseInt(clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean, 16);
  if (Number.isNaN(bigint)) return [0, 0, 0];
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}
