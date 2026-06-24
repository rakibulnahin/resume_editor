import { resume } from 'react-dom/server';
import { downloadResume } from '../template_generator/docGenerator.js';


export function downloadJSON(resumeData) {
  try {
    console.log(resumeData);
    
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

export async function exportToDocx(resumeData) {
  try {
    console.log(resumeData);
    
    await downloadResume(resumeData);
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    alert('Error exporting document. Please check console for details.');
  }
}