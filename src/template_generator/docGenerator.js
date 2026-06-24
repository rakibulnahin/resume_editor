import { Document, Packer, Paragraph, HeadingLevel, TextRun, ExternalHyperlink, AlignmentType, BorderStyle, Table, TableCell, TableRow, WidthType, VerticalAlign } from 'docx';
import { space } from 'postcss/lib/list';

/**
 * Generate a professional resume DOCX document from JSON data
 * @param {Object} resumeData - Resume data object
 * @returns {Promise<Document>} - docx Document object
 */

function section_title(title){
  return {
        spacing: { before: 120, after: 80 },
        size: 24,
        shading: { fill: 'E8E8E8' },
        "children": [
          
          new TextRun({
            text: title,
            bold: true,
            size: 24
          }),
        ],

      }
}

async function generateResume(resumeData) {
  const sections = [];

  // Header - Name with blue underline
  if (resumeData.name) {
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 }, // Adds healthy margin above and below the header
        children: [
          new TextRun({
            text: resumeData.name,
            bold: true,
            size: 56,                 // 16pt font size
            font: "Calibri",          // Change to match your template's typography
            color: "1A365D",          // Deep dark blue color hex
          }),
        ],
        border: {
          bottom: {
            color: "3182CE",          // Slightly lighter blue line color hex
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
            size: 22,                 // 12pt font size
            font: "Times New Roman",          // Change to match your template's typography
            // color: "1A365D",          // Deep dark blue color hex
          }),
        ]
      })
    );
  }

  const contactLine2 = [];
 

  if(Array.isArray(resumeData.contacts) && resumeData.contacts.length>0){
    resumeData.contacts.forEach(contact => {
      if(contact.annotation != ""){
        contactLine2.push(`${contact.annotation}: ${contact.link}`)
      }else{
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
            size: 22,                 // 12pt font size
            font: "Times New Roman",          // Change to match your template's typography
            // color: "1A365D",          // Deep dark blue color hex
          }),
        ]
      })
    );
  }

  // Address
  if (resumeData.address) {
    sections.push(
      new Paragraph({
        text: `Address: ${resumeData.address}`,
        spacing: { after: 200 },
        size: 20
      })
    );
  }

  // Profile Section with gray background
  if (resumeData.profile && resumeData.profile.trim()) {
    sections.push(
      new Paragraph(section_title("PROFILE"))
    );
    sections.push(
      new Paragraph({
        text: resumeData.profile,
        spacing: { after: 200 },
        size: 20,
        alignment: AlignmentType.LEFT
      })
    );
  }

  // Work Experience Section
  if (Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
    sections.push(
      new Paragraph(section_title("WORK EXPERIENCE"))
    );

    resumeData.experience.forEach((job, index) => {
      // Position | Company on LEFT, Location | Date on RIGHT
      const positionCompany = [job.position, job.company]
        .filter(Boolean)
        .join(' | ');

      const locationDate = [job.address, job.date]
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
                            text: `${job.position} | ${job.company}`,
                            bold: true,
                            size: 22,       // 12pt font size
                            font: "Arial",
                            color: "0066CC", // Dark blue color hex
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
                            text: `${job.address} | ${job.date}`,
                            size: 20,       // 11pt font size
                            font: "Arial",
                            color: "0066CC", // Lighter accent blue color hex
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
      


      // Subtitle/Description line
      if (job.company) {
        sections.push(
          new Paragraph({
            text: job.address || '',
            italics: true,
            spacing: { before: 100 , after: 100 },
            size: 20
          })
        );
      }

      // Descriptions/Achievements as bullet points
      if (Array.isArray(job.description)) {
        job.description.forEach(desc => {
          if (desc && desc.trim()) {
            sections.push(
              new Paragraph({
                text: desc,
                bullet: { level: 0 },
                spacing: { after: 80 },
                size: 20
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
      new Paragraph(section_title("PROJECTS | PERSONAL WORK"))
    );

    resumeData.projects.forEach((project, index) => {
      if (project.name) {
        sections.push(
          new Paragraph({
            spacing: { before: 80, after: 60 },
            size: 22,
            children: [
              new TextRun({
                text: project.name,
                bold: true
              })
            ]
          })
        );
      }

      // Descriptions as paragraph text (not bullets)
      if (Array.isArray(project.description)) {
        project.description.forEach(desc => {
          if (desc && desc.trim()) {
            sections.push(
              new Paragraph({
                text: desc,
                spacing: { after: 100 },
                size: 20,
                alignment: AlignmentType.JUSTIFIED
              })
            );
          }
        });
      } else if (project.description && project.description.trim()) {
        sections.push(
          new Paragraph({
            text: project.description,
            spacing: { after: 100 },
            size: 20,
            alignment: AlignmentType.JUSTIFIED
          })
        );
      }

      if (index < resumeData.projects.length - 1) {
        sections.push(new Paragraph({ text: '', spacing: { after: 80 } }));
      }
    });
  }

  // Skills Section
  if (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
    sections.push(
      new Paragraph(section_title("SKILLS"))
    );

    resumeData.skills.forEach((skillGroup) => {
      let skillText = '';
      let categoryName = '';

      // Handle new schema (field)
      if (skillGroup.field) {
        const items = Array.isArray(skillGroup.field)
          ? skillGroup.field.filter(Boolean).join(', ')
          : skillGroup.field;
        
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: items,
                size: 20
              })
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
              new TextRun({
                text: skillGroup.type,
                bold: true,
                size: 20
              }),
              new TextRun({
                text: ': ' + items,
                size: 20
              })
            ],
            bullet: { level: 0 },
            spacing: { after: 100 }
          })
        );
      }
    });
  }

  // Education Section with table format
  if (Array.isArray(resumeData.education) && resumeData.education.length > 0) {
    sections.push(
      new Paragraph(section_title("EDUCATION"))
    );

    resumeData.education.forEach((edu, index) => {
      if (edu.school && edu.date) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: edu.school,
                bold: true,
                size: 20
              }),
              new TextRun({
                text: "\n"+edu.date,
                size: 18
              })
            ],
            spacing: { after: 60 },
          })
        );
      } else if (edu.school) {
        sections.push(
          new Paragraph({
            text: edu.school,
            bold: true,
            spacing: { after: 60 },
            size: 20
          })
        );
      }

      if (edu.details) {
        sections.push(
          new Paragraph({
            text: edu.details,
            spacing: { after: 100 },
            size: 20
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
        new Paragraph(section_title("ADDITIONAL INFORMATION"))
      );

      validItems.forEach(item => {
        sections.push(
          new Paragraph({
            text: item.type,
            bullet: { level: 0 },
            spacing: { after: 80 },
            size: 20
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
            font: "Arial", // Sets the global default font to Arial
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
export async function downloadResume(resumeData, filename = null) {
  const doc = await generateResume(resumeData);
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