import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, BorderStyle, Table, TableCell, TableRow, WidthType } from 'docx';
import { getTheme, hexForDocx, DEFAULT_THEME_ID } from './themes';

/**
 * Generate a professional resume DOCX document from JSON data
 * @param {Object} resumeData - Resume data object
 * @param {string} themeId - Theme preset id (see themes.js)
 * @returns {Promise<Document>} - docx Document object
 */

function section_title(title, theme){
  const options = {
    spacing: { before: 160, after: 80 },
    border: {
      bottom: {
        color: hexForDocx(theme.colors.accent),
        space: 2,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: theme.sectionSizePt * 2,
        color: hexForDocx(theme.colors.sectionHeading),
        font: theme.headingFont,
      }),
    ],
  };

  if (theme.sectionShaded) {
    options.shading = { fill: hexForDocx(theme.colors.sectionBg) };
  }

  return options;
}

async function generateResume(resumeData, themeId = DEFAULT_THEME_ID) {
  const theme = getTheme(themeId);
  const bodySize = theme.bodySizePt * 2;
  const sections = [];

  // Header - Name with accent underline
  if (resumeData.name) {
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 }, // Adds healthy margin above and below the header
        children: [
          new TextRun({
            text: resumeData.name,
            bold: true,
            size: theme.nameSizePt * 2,
            font: theme.headingFont,
            color: hexForDocx(theme.colors.name),
          }),
        ],
        border: {
          bottom: {
            color: hexForDocx(theme.colors.accent),
            space: 8,                 // Distance (padding) between the text and the line
            style: BorderStyle.SINGLE,
            size: 6,                  // Line thickness (measured in 1/8 pt; 6 = 0.75pt thick)
          },
        },
      })
    );
  }

  // Contact Information - Email, Phone
  const contactLine1 = [];
  if (resumeData.email) contactLine1.push(`Email: ${resumeData.email}`);
  if (resumeData.phone) contactLine1.push(`Phone: ${resumeData.phone}`);


  if (contactLine1.length > 0) {
    sections.push(
      new Paragraph({
        spacing: {before:80, after: 80 },
        "children": [
          new TextRun({
            text: contactLine1.join(' | '),
            size: bodySize,
            font: theme.bodyFont,
            color: hexForDocx(theme.colors.text),
          }),
        ]
      })
    );
  }

  const contactLine2 = [];
 

  if(Array.isArray(resumeData.contacts) && resumeData.contacts.length>0){
    resumeData.contacts.forEach(contact => {
      if (!contact || !contact.link) return;
      if (contact.annotation) {
        contactLine2.push(`${contact.annotation}: ${contact.link}`)
      } else {
        contactLine2.push(`${contact.link}`)
      }
    });
  }

  // Contact Links - GitHub, LinkedIn etc
  if (contactLine2.length > 0) {
    sections.push(
      new Paragraph({
        spacing: { before:80, after: 80 },
        "children": [
          new TextRun({
            text: contactLine2.join('  |  '),
            size: bodySize,
            font: theme.bodyFont,
            color: hexForDocx(theme.colors.text),
          }),
        ]
      })
    );
  }

  // Address
  if (resumeData.address) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Address: ${resumeData.address}`,
            size: bodySize,
            font: theme.bodyFont,
            color: hexForDocx(theme.colors.text),
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Profile Section
  if (resumeData.profile && resumeData.profile.trim()) {
    sections.push(
      new Paragraph(section_title("PROFILE", theme))
    );
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.profile,
            size: bodySize,
            font: theme.bodyFont,
            color: hexForDocx(theme.colors.text),
          }),
        ],
        spacing: { after: 200 },
        alignment: AlignmentType.LEFT
      })
    );
  }

  // Work Experience Section
  if (Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
    sections.push(
      new Paragraph(section_title("WORK EXPERIENCE", theme))
    );

    resumeData.experience.forEach((job, index) => {
      // Position | Company on LEFT, Location | Date on RIGHT
      const positionCompany = [job.position, job.company]
        .filter(Boolean)
        .join(' | ');

      if (positionCompany){
        sections.push(
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE, // Forces the table to span the full page width
            },
            
            borders: {
              // Make all borders invisible to mimic floating text columns
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  // Left Column: Position & Company Name
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE }, // Allocates half the space
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.LEFT, // Aligns content to the left
                        children: [
                          new TextRun({
                            text: [job.position, job.company].filter(Boolean).join(' | '),
                            bold: true,
                            size: theme.sectionSizePt * 2,
                            font: theme.headingFont,
                            color: hexForDocx(theme.colors.jobTitle),
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                  // Right Column: Location & Employment Date
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE }, // Allocates half the space
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT, // Forces text growth towards the LEFT
                        children: [
                          new TextRun({
                            text: [job.address, job.date].filter(Boolean).join(' | '),
                            size: bodySize,
                            font: theme.bodyFont,
                            color: hexForDocx(theme.colors.jobMeta),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        )
      }
      


      // Small gap between the title row and the bullet points
      sections.push(new Paragraph({ text: '', spacing: { after: 40 } }));

      // Descriptions/Achievements as bullet points
      if (Array.isArray(job.description)) {
        job.description.forEach(desc => {
          if (desc && desc.trim()) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: desc, size: bodySize, font: theme.bodyFont, color: hexForDocx(theme.colors.text) }),
                ],
                bullet: { level: 0 },
                spacing: { after: 80 },
              })
            );
          }
        });
      }

      if (index < resumeData.experience.length - 1) {
        sections.push(new Paragraph({ text: '', spacing: { after: 120 } }));
      }
    });
  }

  // Projects Section
  if (Array.isArray(resumeData.projects) && resumeData.projects.length > 0) {
    sections.push(
      new Paragraph(section_title("PROJECTS | PERSONAL WORK", theme))
    );

    resumeData.projects.forEach((project, index) => {
      if (project.name) {
        sections.push(
          new Paragraph({
            spacing: { before: 80, after: 60 },
            children: [
              new TextRun({
                text: project.name,
                bold: true,
                size: bodySize,
                font: theme.headingFont,
                color: hexForDocx(theme.colors.jobTitle),
              })
            ]
          })
        );
      }

      const projectDescriptions = Array.isArray(project.description)
        ? project.description
        : (project.description ? [project.description] : []);

      projectDescriptions.forEach(desc => {
        if (desc && desc.trim()) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: desc, size: bodySize, font: theme.bodyFont, color: hexForDocx(theme.colors.text) }),
              ],
              spacing: { after: 100 },
              alignment: AlignmentType.JUSTIFIED
            })
          );
        }
      });

      if (index < resumeData.projects.length - 1) {
        sections.push(new Paragraph({ text: '', spacing: { after: 80 } }));
      }
    });
  }

  // Skills Section
  if (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
    sections.push(
      new Paragraph(section_title("SKILLS", theme))
    );

    resumeData.skills.forEach((skillGroup) => {
      // Handle new schema (field)
      if (skillGroup.field) {
        const items = Array.isArray(skillGroup.field)
          ? skillGroup.field.filter(Boolean).join(', ')
          : skillGroup.field;

        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: items, size: bodySize, font: theme.bodyFont, color: hexForDocx(theme.colors.text) })
            ],
            bullet: { level: 0 },
            spacing: { after: 100 }
          })
        );
      }
      // Handle old schema (type + value)
      else if (skillGroup.type && skillGroup.value) {
        const items = Array.isArray(skillGroup.value)
          ? skillGroup.value.filter(Boolean).join(', ')
          : skillGroup.value;

        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: skillGroup.type, bold: true, size: bodySize, font: theme.bodyFont, color: hexForDocx(theme.colors.text) }),
              new TextRun({ text: ': ' + items, size: bodySize, font: theme.bodyFont, color: hexForDocx(theme.colors.text) })
            ],
            bullet: { level: 0 },
            spacing: { after: 100 }
          })
        );
      }
    });
  }

  // Education Section
  if (Array.isArray(resumeData.education) && resumeData.education.length > 0) {
    sections.push(
      new Paragraph(section_title("EDUCATION", theme))
    );

    resumeData.education.forEach((edu, index) => {
      if (edu.school) {
        const runs = [
          new TextRun({ text: edu.school, bold: true, size: bodySize, font: theme.headingFont, color: hexForDocx(theme.colors.text) }),
        ];
        if (edu.date) {
          runs.push(new TextRun({ text: edu.date, italics: true, break: 1, size: bodySize, font: theme.bodyFont, color: hexForDocx(theme.colors.jobMeta) }));
        }
        sections.push(new Paragraph({ children: runs, spacing: { after: 60 } }));
      }

      if (edu.details) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.details, size: bodySize, font: theme.bodyFont, color: hexForDocx(theme.colors.text) }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      if (index < resumeData.education.length - 1) {
        sections.push(new Paragraph({ text: '', spacing: { after: 80 } }));
      }
    });
  }

  // Additional Information Section
  if (Array.isArray(resumeData.miscellaneous) && resumeData.miscellaneous.length > 0) {
    const validItems = resumeData.miscellaneous.filter(item => item.type && item.type.trim());

    if (validItems.length > 0) {
      sections.push(
        new Paragraph(section_title("ADDITIONAL INFORMATION", theme))
      );

      validItems.forEach(item => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.type, size: bodySize, font: theme.bodyFont, color: hexForDocx(theme.colors.text) }),
            ],
            bullet: { level: 0 },
            spacing: { after: 80 },
          })
        );
      });
    }
  }

  // Create and return the document
  const doc = new Document({
    styles:{
      default: {
        document: {
          run: {
            font: theme.bodyFont,
          },
        },
      },
    },
    
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

  return doc;
}

/**
 * Generate and download resume as DOCX file (Browser)
 * @param {Object} resumeData - Resume data
 * @param {string} filename - Optional filename (defaults to name from resume)
 */
export async function downloadResume(resumeData, filename = null, themeId = DEFAULT_THEME_ID) {
  const doc = await generateResume(resumeData, themeId);
  const blob = await Packer.toBlob(doc);

  const fileName = filename || `${resumeData.name || 'resume'}.docx`;
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

/**
 * Save resume to file (Node.js)
 * @param {Object} resumeData - Resume data
 * @param {string} outputPath - File path to save to
 */
// export async function saveResume(resumeData, outputPath) {
//   const { writeFileSync } = await import('fs');
//   const doc = await generateResume(resumeData);
//   const blob = await Packer.toBlob(doc);

//   writeFileSync(outputPath, Buffer.from(blob));
//   return outputPath;
// }

export default generateResume;