const docx = require('docx');
const Document = resolveDocxExport(docx, 'Document');
const Packer = resolveDocxExport(docx, 'Packer');
const Paragraph = resolveDocxExport(docx, 'Paragraph');
const HeadingLevel = resolveDocxExport(docx, 'HeadingLevel');
const AlignmentType = resolveDocxExport(docx, 'AlignmentType');
const BorderStyle = resolveDocxExport(docx, 'BorderStyle');

const DOCX_HEADING_LEVEL = HeadingLevel || {
  HEADING_1: 'Heading1',
  HEADING_2: 'Heading2',
};
const DOCX_ALIGNMENT = AlignmentType || {
  CENTER: 'center',
  JUSTIFIED: 'both',
};
const DOCX_BORDER_STYLE = BorderStyle || {
  SINGLE: 'single',
};

function resolveDocxExport(moduleExports, exportName) {
  const directExport = moduleExports?.[exportName];
  const defaultExport = moduleExports?.default?.[exportName];
  const nestedDefaultExport = directExport?.default;

  return defaultExport || nestedDefaultExport || directExport;
}

/**
 * ResumeTemplateGenerator
 * Converts JSON resume data into a professional DOCX document
 * Based on the template structure with robust handling of missing data
 */
class ResumeTemplateGenerator {
  constructor(resumeData = {}) {
    this.data = {
      name: '',
      address: '',
      phone: '',
      email: '',
      contacts: [],
      profile: '',
      experience: [],
      projects: [],
      skills: [],
      education: [],
      miscellaneous: [],
      ...resumeData
    };
  }

  /**
   * Create a heading with custom styling
   */
  createHeading(text, level = 'HEADING_2') {
    return new Paragraph({
      text: text.toUpperCase(),
      heading: DOCX_HEADING_LEVEL[level],
      bold: true,
      spacing: { before: 240, after: 120 },
      border: {
        bottom: {
          color: '0066CC',
          space: 1,
          style: DOCX_BORDER_STYLE.SINGLE,
          size: 6
        }
      }
    });
  }

  /**
   * Create header with name and contact info
   */
  createHeader() {
    const paragraphs = [];

    // Name
    if (this.data.name) {
      paragraphs.push(
        new Paragraph({
          text: this.data.name.toUpperCase(),
          alignment: DOCX_ALIGNMENT.CENTER,
          spacing: { after: 100 },
          bold: true,
          size: 28
        })
      );
    }

    // Contact Information Row
    const contactInfo = [];

    if (this.data.email) {
      contactInfo.push(this.data.email);
    }
    if (this.data.phone) {
      contactInfo.push(this.data.phone);
    }
    if (this.data.address) {
      contactInfo.push(this.data.address);
    }

    if (contactInfo.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: contactInfo.join(' | '),
          alignment: DOCX_ALIGNMENT.CENTER,
          spacing: { after: 100 },
          size: 18
        })
      );
    }

    // Links/Contacts
    if (Array.isArray(this.data.contacts) && this.data.contacts.length > 0) {
      const links = this.data.contacts
        .filter(c => c.link)
        .map(c => {
          const label = c.showAnnotation ? `${c.annotation}: ` : '';
          return label + c.link;
        })
        .join(' | ');

      if (links) {
        paragraphs.push(
          new Paragraph({
            text: links,
            alignment: DOCX_ALIGNMENT.CENTER,
            spacing: { after: 200 },
            size: 18
          })
        );
      }
    }

    return paragraphs;
  }

  /**
   * Create Profile/Summary section
   */
  createProfile() {
    const paragraphs = [];

    if (!this.data.profile) return paragraphs;

    paragraphs.push(this.createHeading('PROFILE'));
    paragraphs.push(
      new Paragraph({
        text: this.data.profile,
        spacing: { after: 200 },
        size: 20,
        alignment: DOCX_ALIGNMENT.JUSTIFIED
      })
    );

    return paragraphs;
  }

  /**
   * Create Work Experience section
   */
  createExperience() {
    const paragraphs = [];

    if (!Array.isArray(this.data.experience) || this.data.experience.length === 0) {
      return paragraphs;
    }

    paragraphs.push(this.createHeading('WORK EXPERIENCE'));

    this.data.experience.forEach((job, index) => {
      // Position and Company line
      const positionText = [job.position, job.company]
        .filter(Boolean)
        .join(' | ');

      if (positionText) {
        paragraphs.push(
          new Paragraph({
            text: positionText,
            bold: true,
            spacing: { before: 100, after: 50 },
            size: 22
          })
        );
      }

      // Location and Date line
      const locationDateText = [job.address, job.date]
        .filter(Boolean)
        .join(' | ');

      if (locationDateText) {
        paragraphs.push(
          new Paragraph({
            text: locationDateText,
            italics: true,
            spacing: { after: 100 },
            size: 20
          })
        );
      }

      // Descriptions as bullet points
      if (Array.isArray(job.description)) {
        job.description.forEach(desc => {
          if (desc && desc.trim()) {
            paragraphs.push(
              new Paragraph({
                text: desc,
                bullet: { level: 0 },
                spacing: { after: 60 },
                size: 20
              })
            );
          }
        });
      }

      // Add spacing between jobs
      if (index < this.data.experience.length - 1) {
        paragraphs.push(
          new Paragraph({
            text: '',
            spacing: { after: 100 }
          })
        );
      }
    });

    return paragraphs;
  }

  /**
   * Create Projects section
   */
  createProjects() {
    const paragraphs = [];

    if (!Array.isArray(this.data.projects) || this.data.projects.length === 0) {
      return paragraphs;
    }

    paragraphs.push(this.createHeading('PROJECTS'));

    this.data.projects.forEach((project, index) => {
      // Project Name
      if (project.name) {
        paragraphs.push(
          new Paragraph({
            text: project.name,
            bold: true,
            spacing: { before: 100, after: 60 },
            size: 22
          })
        );
      }

      // Project Description
      if (Array.isArray(project.description)) {
        project.description.forEach(desc => {
          if (desc && desc.trim()) {
            paragraphs.push(
              new Paragraph({
                text: desc,
                bullet: { level: 0 },
                spacing: { after: 60 },
                size: 20
              })
            );
          }
        });
      } else if (project.description && project.description.trim()) {
        paragraphs.push(
          new Paragraph({
            text: project.description,
            bullet: { level: 0 },
            spacing: { after: 60 },
            size: 20
          })
        );
      }

      // Add spacing between projects
      if (index < this.data.projects.length - 1) {
        paragraphs.push(
          new Paragraph({
            text: '',
            spacing: { after: 100 }
          })
        );
      }
    });

    return paragraphs;
  }

  /**
   * Create Skills section
   */
  createSkills() {
    const paragraphs = [];

    // Handle both old schema (type/value) and new schema (field)
    let skillsData = [];

    if (Array.isArray(this.data.skills)) {
      if (this.data.skills.length === 0) {
        return paragraphs;
      }

      // Check if it's the new schema with 'field' property
      if (this.data.skills[0]?.field) {
        skillsData = this.data.skills;
      }
      // Check if it's the old schema with 'type' and 'value' properties
      else if (this.data.skills[0]?.type && this.data.skills[0]?.value) {
        skillsData = this.data.skills.map(skill => ({
          category: skill.type,
          items: Array.isArray(skill.value) ? skill.value : [skill.value]
        }));
      }
    }

    if (skillsData.length === 0) {
      return paragraphs;
    }

    paragraphs.push(this.createHeading('KEY SKILLS'));

    skillsData.forEach((skillGroup, index) => {
      let skillText = '';

      // Handle new schema
      if (skillGroup.field) {
        skillText = Array.isArray(skillGroup.field)
          ? skillGroup.field.filter(Boolean).join(', ')
          : skillGroup.field;
      }
      // Handle old schema with categories
      else if (skillGroup.category && skillGroup.items) {
        const itemsText = Array.isArray(skillGroup.items)
          ? skillGroup.items.filter(Boolean).join(', ')
          : skillGroup.items;
        skillText = `${skillGroup.category}: ${itemsText}`;
      }

      if (skillText) {
        paragraphs.push(
          new Paragraph({
            text: skillText,
            spacing: { after: 120 },
            size: 20
          })
        );
      }
    });

    return paragraphs;
  }

  /**
   * Create Education section
   */
  createEducation() {
    const paragraphs = [];

    if (!Array.isArray(this.data.education) || this.data.education.length === 0) {
      return paragraphs;
    }

    paragraphs.push(this.createHeading('EDUCATION & QUALIFICATIONS'));

    this.data.education.forEach((edu, index) => {
      // School name
      if (edu.school) {
        paragraphs.push(
          new Paragraph({
            text: edu.school,
            bold: true,
            spacing: { before: 100, after: 50 },
            size: 22
          })
        );
      }

      // Date
      if (edu.date) {
        paragraphs.push(
          new Paragraph({
            text: edu.date,
            italics: true,
            spacing: { after: 60 },
            size: 20
          })
        );
      }

      // Details
      if (edu.details) {
        paragraphs.push(
          new Paragraph({
            text: edu.details,
            spacing: { after: 100 },
            size: 20
          })
        );
      }

      // Add spacing between education entries
      if (index < this.data.education.length - 1) {
        paragraphs.push(
          new Paragraph({
            text: '',
            spacing: { after: 100 }
          })
        );
      }
    });

    return paragraphs;
  }

  /**
   * Create Additional Information section
   */
  createMiscellaneous() {
    const paragraphs = [];

    if (!Array.isArray(this.data.miscellaneous) || this.data.miscellaneous.length === 0) {
      return paragraphs;
    }

    const validItems = this.data.miscellaneous.filter(item => item.type && item.type.trim());
    if (validItems.length === 0) {
      return paragraphs;
    }

    paragraphs.push(this.createHeading('ADDITIONAL INFORMATION'));

    validItems.forEach(item => {
      paragraphs.push(
        new Paragraph({
          text: item.type,
          bullet: { level: 0 },
          spacing: { after: 80 },
          size: 20
        })
      );
    });

    return paragraphs;
  }

  /**
   * Generate the complete DOCX document
   */
  async generateDocument() {
    const sections = [];

    // Add all sections
    sections.push(...this.createHeader());
    sections.push(...this.createProfile());
    sections.push(...this.createExperience());
    sections.push(...this.createProjects());
    sections.push(...this.createSkills());
    sections.push(...this.createEducation());
    sections.push(...this.createMiscellaneous());

    // Create the document
    const doc = new Document({
      sections: [
        {
          children: sections,
          properties: {
            page: {
              margins: {
                top: 720,    // 0.5 inch
                right: 720,
                bottom: 720,
                left: 720
              }
            }
          }
        }
      ]
    });

    console.log("doc")

    return doc;
  }

  /**
   * Generate and save the document as DOCX
   */
  async saveToFile(filename = null) {
    const doc = await this.generateDocument();
    const fileName = filename || `${this.data.name || 'resume'}.docx`;

    const blob = await Packer.toBlob(doc);
    return { blob, fileName };
  }
}

/**
 * Export as default for ES6 modules
 * Usage:
 * import ResumeTemplateGenerator from './TemplateGenerator.js';
 * 
 * const generator = new ResumeTemplateGenerator(resumeData);
 * const { blob, fileName } = await generator.saveToFile();
 */
export default ResumeTemplateGenerator;

/**
 * Utility function to download the generated document
 */
export async function downloadResume(resumeData, filename = null) {
  const generator = new ResumeTemplateGenerator(resumeData);
  console.log("here")
  const { blob, fileName } = await generator.saveToFile(filename);
  console.log("here 2", generator)

  if (typeof window !== 'undefined') {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return fileName;
  }

  throw new Error('Unable to save file in this environment');
}

/**
 * Utility function to create document without saving
 */
export async function createResumeDocument(resumeData) {
  const generator = new ResumeTemplateGenerator(resumeData);
  return await generator.generateDocument();
}
