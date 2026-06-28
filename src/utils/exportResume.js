import { downloadResume } from '../template_generator/docGenerator.js';
import { downloadResumePdf } from '../template_generator/pdfGenerator.js';
import { DEFAULT_THEME_ID } from '../template_generator/themes';

export function downloadJSON(resumeData) {
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

export async function exportToDocx(resumeData, themeId = DEFAULT_THEME_ID) {
  try {
    await downloadResume(resumeData, null, themeId);
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    alert('Error exporting document. Please check console for details.');
  }
}

export function exportToPdf(resumeData, themeId = DEFAULT_THEME_ID) {
  try {
    downloadResumePdf(resumeData, themeId);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Error exporting PDF. Please check console for details.');
  }
}
