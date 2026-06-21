import ResumeCustomizer from '../ResumeCustomizer';
import { downloadResume } from './TemplateGenerator';

export async function exportToDocxTemplate(resumeData) {
  try {
    await downloadResume(resumeData);
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    alert('Error exporting document. Please check console for details.');
  }
}

export default ResumeCustomizer;
