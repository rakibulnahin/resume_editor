import { jsPDF } from 'jspdf';
import { getTheme, hexToRgb, DEFAULT_THEME_ID } from './themes';

/**
 * Generate a clean, ATS-friendly PDF resume from JSON data.
 *
 * Unlike html2canvas-based exporters, this writes real, selectable text with
 * jsPDF so the output stays machine-readable (important for ATS parsing) and
 * mirrors the DOCX layout/theme. Everything runs in the browser.
 */

const MARGIN = 42;

function mapFont(name) {
  const value = (name || '').toLowerCase();
  if (value.includes('times') || value.includes('georgia') || value.includes('serif')) return 'times';
  if (value.includes('courier') || value.includes('mono')) return 'courier';
  return 'helvetica';
}

function buildPdf(resumeData, themeId) {
  const theme = getTheme(themeId);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;

  const headingFamily = mapFont(theme.headingFont);
  const bodyFamily = mapFont(theme.bodyFont);

  let y = MARGIN;

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const setColor = (hex) => {
    const [r, g, b] = hexToRgb(hex);
    doc.setTextColor(r, g, b);
  };

  // Writes a wrapped paragraph and advances the cursor.
  const writeParagraph = (text, opts = {}) => {
    const {
      size = theme.bodySizePt,
      family = bodyFamily,
      style = 'normal',
      color = theme.colors.text,
      bullet = false,
      align = 'left',
      gapAfter = 4,
    } = opts;

    if (!text || !String(text).trim()) return;

    doc.setFont(family, style);
    doc.setFontSize(size);
    setColor(color);

    const indent = bullet ? 14 : 0;
    const lines = doc.splitTextToSize(String(text), contentWidth - indent);
    const lineHeight = size * 1.35;

    lines.forEach((line, index) => {
      ensureSpace(lineHeight);
      if (bullet && index === 0) {
        doc.text('\u2022', MARGIN, y, { baseline: 'top' });
      }
      if (align === 'right') {
        doc.text(line, MARGIN + contentWidth, y, { baseline: 'top', align: 'right' });
      } else if (align === 'justify' && index < lines.length - 1) {
        doc.text(line, MARGIN + indent, y, { baseline: 'top', align: 'justify', maxWidth: contentWidth - indent });
      } else {
        doc.text(line, MARGIN + indent, y, { baseline: 'top' });
      }
      y += lineHeight;
    });

    y += gapAfter;
  };

  const sectionTitle = (title) => {
    const size = theme.sectionSizePt;
    const lineHeight = size * 1.5;
    ensureSpace(lineHeight + 10);
    y += 6;

    if (theme.sectionShaded) {
      const [r, g, b] = hexToRgb(theme.colors.sectionBg);
      doc.setFillColor(r, g, b);
      doc.rect(MARGIN, y, contentWidth, lineHeight, 'F');
    }

    doc.setFont(headingFamily, 'bold');
    doc.setFontSize(size);
    setColor(theme.colors.sectionHeading);
    doc.text(title, MARGIN + (theme.sectionShaded ? 5 : 0), y + lineHeight / 2, { baseline: 'middle' });

    const [ar, ag, ab] = hexToRgb(theme.colors.accent);
    doc.setDrawColor(ar, ag, ab);
    doc.setLineWidth(1);
    doc.line(MARGIN, y + lineHeight, MARGIN + contentWidth, y + lineHeight);

    y += lineHeight + 8;
  };

  // Two-column row: bold title on the left, meta (location | date) on the right.
  const twoColumnRow = (left, right) => {
    const titleSize = theme.sectionSizePt;
    const metaSize = theme.bodySizePt;
    const titleLineHeight = titleSize * 1.3;
    ensureSpace(titleLineHeight);
    const startY = y;

    if (right) {
      doc.setFont(bodyFamily, 'normal');
      doc.setFontSize(metaSize);
      setColor(theme.colors.jobMeta);
      doc.text(right, MARGIN + contentWidth, startY, { baseline: 'top', align: 'right' });
    }

    doc.setFont(headingFamily, 'bold');
    doc.setFontSize(titleSize);
    setColor(theme.colors.jobTitle);
    const leftLines = doc.splitTextToSize(left, contentWidth * 0.62);
    let cursor = startY;
    leftLines.forEach((line) => {
      doc.text(line, MARGIN, cursor, { baseline: 'top' });
      cursor += titleLineHeight;
    });

    y = Math.max(cursor, startY + metaSize * 1.3) + 2;
  };

  // ---- Header ----
  if (resumeData.name) {
    doc.setFont(headingFamily, 'bold');
    doc.setFontSize(theme.nameSizePt);
    setColor(theme.colors.name);
    ensureSpace(theme.nameSizePt * 1.4);
    doc.text(resumeData.name, MARGIN, y, { baseline: 'top' });
    y += theme.nameSizePt * 1.1;

    const [ar, ag, ab] = hexToRgb(theme.colors.accent);
    doc.setDrawColor(ar, ag, ab);
    doc.setLineWidth(1.4);
    doc.line(MARGIN, y, MARGIN + contentWidth, y);
    y += 12;
  }

  const contactLine1 = [];
  if (resumeData.email) contactLine1.push(`Email: ${resumeData.email}`);
  if (resumeData.phone) contactLine1.push(`Phone: ${resumeData.phone}`);
  if (contactLine1.length) writeParagraph(contactLine1.join('  |  '), { gapAfter: 2 });

  if (Array.isArray(resumeData.contacts) && resumeData.contacts.length) {
    const line = resumeData.contacts
      .filter((contact) => contact && contact.link)
      .map((contact) => (contact.annotation ? `${contact.annotation}: ${contact.link}` : contact.link))
      .join('  |  ');
    if (line) writeParagraph(line, { gapAfter: 2 });
  }

  if (resumeData.address) writeParagraph(`Address: ${resumeData.address}`, { gapAfter: 6 });

  // ---- Profile ----
  if (resumeData.profile && resumeData.profile.trim()) {
    sectionTitle('PROFILE');
    writeParagraph(resumeData.profile, { gapAfter: 6 });
  }

  // ---- Experience ----
  if (Array.isArray(resumeData.experience) && resumeData.experience.length) {
    sectionTitle('WORK EXPERIENCE');
    resumeData.experience.forEach((job) => {
      const title = [job.position, job.company].filter(Boolean).join(' | ');
      const meta = [job.address, job.date].filter(Boolean).join(' | ');
      if (title || meta) twoColumnRow(title || ' ', meta);
      if (Array.isArray(job.description)) {
        job.description.forEach((desc) => writeParagraph(desc, { bullet: true, gapAfter: 2 }));
      }
      y += 6;
    });
  }

  // ---- Projects ----
  if (Array.isArray(resumeData.projects) && resumeData.projects.length) {
    sectionTitle('PROJECTS | PERSONAL WORK');
    resumeData.projects.forEach((project) => {
      if (project.name) {
        writeParagraph(project.name, { family: headingFamily, style: 'bold', color: theme.colors.jobTitle, gapAfter: 2 });
      }
      const descriptions = Array.isArray(project.description)
        ? project.description
        : (project.description ? [project.description] : []);
      descriptions.forEach((desc) => writeParagraph(desc, { align: 'justify', gapAfter: 3 }));
      y += 4;
    });
  }

  // ---- Skills ----
  if (Array.isArray(resumeData.skills) && resumeData.skills.length) {
    sectionTitle('SKILLS');
    resumeData.skills.forEach((skillGroup) => {
      if (skillGroup.field) {
        const items = Array.isArray(skillGroup.field) ? skillGroup.field.filter(Boolean).join(', ') : skillGroup.field;
        if (items) writeParagraph(items, { bullet: true, gapAfter: 3 });
      } else if (skillGroup.type || skillGroup.value) {
        const items = Array.isArray(skillGroup.value) ? skillGroup.value.filter(Boolean).join(', ') : (skillGroup.value || '');
        const text = skillGroup.type ? `${skillGroup.type}: ${items}` : items;
        if (text) writeParagraph(text, { bullet: true, gapAfter: 3 });
      }
    });
  }

  // ---- Education ----
  if (Array.isArray(resumeData.education) && resumeData.education.length) {
    sectionTitle('EDUCATION');
    resumeData.education.forEach((edu) => {
      if (edu.school) {
        writeParagraph(edu.school, { family: headingFamily, style: 'bold', gapAfter: 1 });
      }
      if (edu.date) {
        writeParagraph(edu.date, { style: 'italic', color: theme.colors.jobMeta, size: theme.bodySizePt - 1, gapAfter: 2 });
      }
      if (edu.details) writeParagraph(edu.details, { gapAfter: 6 });
    });
  }

  // ---- Additional ----
  if (Array.isArray(resumeData.miscellaneous) && resumeData.miscellaneous.length) {
    const items = resumeData.miscellaneous.filter((item) => item && item.type && item.type.trim());
    if (items.length) {
      sectionTitle('ADDITIONAL INFORMATION');
      items.forEach((item) => writeParagraph(item.type, { bullet: true, gapAfter: 2 }));
    }
  }

  return doc;
}

/**
 * Build the resume PDF and trigger a browser download.
 * @param {Object} resumeData
 * @param {string} themeId
 * @param {string|null} filename
 */
export function downloadResumePdf(resumeData, themeId = DEFAULT_THEME_ID, filename = null) {
  const doc = buildPdf(resumeData, themeId);
  const fileName = filename || `${resumeData.name || 'resume'}.pdf`;
  doc.save(fileName);
  return fileName;
}

export default buildPdf;
