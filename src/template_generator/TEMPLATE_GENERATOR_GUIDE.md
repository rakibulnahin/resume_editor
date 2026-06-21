# Resume Template Generator - Complete Documentation

## 📋 Overview

The `TemplateGenerator.js` is a robust JavaScript class that converts JSON resume data into professionally formatted DOCX documents. It's designed to work with flexible resume data structures and handles missing/incomplete data gracefully.

### Key Features
- ✅ **Template-Based Generation**: Maps JSON data to resume template structure
- ✅ **Robust Data Handling**: Gracefully handles missing or incomplete data
- ✅ **Multiple Schema Support**: Works with both old and new JSON schemas
- ✅ **Professional Formatting**: Creates polished, print-ready documents
- ✅ **Section Support**: Supports all major resume sections
- ✅ **Customizable**: Easy to extend and modify

---

## 🚀 Installation & Setup

### Prerequisites
```bash
npm install docx
```

### Import in Your Project

#### Option 1: As a Class Module
```javascript
import ResumeTemplateGenerator from './TemplateGenerator.js';

// Create instance
const generator = new ResumeTemplateGenerator(resumeData);

// Generate document
const doc = await generator.generateDocument();
```

#### Option 2: Using Utility Functions
```javascript
import { downloadResume, createResumeDocument } from './TemplateGenerator.js';

// Download directly
await downloadResume(resumeData, 'my-resume.docx');

// Or create document without saving
const doc = await createResumeDocument(resumeData);
```

#### Option 3: In React (as already integrated)
The ResumeCustomizer.jsx already includes the TemplateGenerator class and uses it automatically.

---

## 📊 Supported JSON Schemas

### Schema 1: New Format (Recommended)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "City, Country",
  "contacts": [
    {
      "annotation": "LinkedIn",
      "link": "https://linkedin.com/in/johndoe",
      "showAnnotation": true
    }
  ],
  "profile": "Professional summary...",
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "address": "City, Country",
      "date": "Month Year - Present",
      "description": ["Achievement 1", "Achievement 2"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": ["Description point 1", "Description point 2"]
    }
  ],
  "skills": [
    {
      "field": ["Skill 1", "Skill 2", "Skill 3"]
    }
  ],
  "education": [
    {
      "school": "University Name",
      "date": "Year - Year",
      "details": "Degree and honors"
    }
  ],
  "miscellaneous": [
    {
      "type": "Awards, Publications, Languages, etc."
    }
  ]
}
```

### Schema 2: Old Format (Legacy Support)
```json
{
  "skills": [
    {
      "type": "Category Name",
      "value": ["Skill 1", "Skill 2", "Skill 3"]
    }
  ]
}
```

Both formats are automatically detected and handled by the generator!

---

## 🎯 Usage Examples

### Example 1: Basic Usage
```javascript
import ResumeTemplateGenerator from './TemplateGenerator.js';

const resumeData = {
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  experience: [
    {
      company: "Tech Corp",
      position: "Developer",
      date: "2022 - Present",
      description: ["Built features", "Led teams"]
    }
  ]
};

const generator = new ResumeTemplateGenerator(resumeData);
const doc = await generator.generateDocument();

// Save to DOCX
const { Packer } = await import('docx');
const blob = await Packer.toBlob(doc);
```

### Example 2: Download in Browser
```javascript
import { downloadResume } from './TemplateGenerator.js';

// This handles everything - parsing, generating, and downloading
await downloadResume(resumeData, 'john-doe-resume.docx');
```

### Example 3: Server-Side Usage (Node.js)
```javascript
import ResumeTemplateGenerator from './TemplateGenerator.js';
import { Packer } from 'docx';
import fs from 'fs';

const generator = new ResumeTemplateGenerator(resumeData);
const doc = await generator.generateDocument();
const blob = await Packer.toBlob(doc);

// Save to file
fs.writeFileSync('resume.docx', Buffer.from(blob));
```

### Example 4: With Missing Data
```javascript
// The generator handles missing data gracefully
const incompleteData = {
  name: "Jane Doe",
  email: "jane@example.com",
  // Missing: phone, address, profile, experience, skills
  education: [
    {
      school: "University",
      date: "2020"
      // Missing: details
    }
  ]
};

// This will work fine - only outputs sections with data
const generator = new ResumeTemplateGenerator(incompleteData);
const doc = await generator.generateDocument();
```

---

## 📄 Document Sections Explained

### 1. Header (Name & Contact)
Displays the resume owner's name prominently at the top, followed by:
- Email address
- Phone number
- Physical address
- Links (LinkedIn, GitHub, Website, etc.)

**Data source**: `name`, `email`, `phone`, `address`, `contacts`

### 2. Profile
A professional summary or introduction section.

**Data source**: `profile`

### 3. Work Experience
Lists professional positions with:
- Job title and company name
- Location and employment dates
- Bullet-pointed achievements and responsibilities

**Data source**: `experience[]`
```javascript
{
  company: "Company Name",
  position: "Job Title",
  address: "Location",
  date: "Date Range",
  description: ["Point 1", "Point 2"]
}
```

### 4. Projects
Highlights key projects with:
- Project name
- Project description as bullet points

**Data source**: `projects[]`
```javascript
{
  name: "Project Name",
  description: ["Description 1", "Description 2"]
}
```

### 5. Skills
Organized skill categories or individual skill groups.

Supports both:
```javascript
// New format
{ field: ["Skill 1", "Skill 2"] }

// Old format  
{ type: "Category", value: ["Skill 1", "Skill 2"] }
```

### 6. Education & Qualifications
Lists degrees, certifications, and educational achievements:
- Institution name
- Graduation date
- Details (degree, GPA, honors, etc.)

**Data source**: `education[]`

### 7. Additional Information
Miscellaneous information like:
- Languages
- Certifications
- Publications
- Awards

**Data source**: `miscellaneous[]`

---

## 🎨 Formatting & Styling

### Default Styling
- **Font Size**: 
  - Headers: 28pt (name), 18pt (headings)
  - Body: 20pt
- **Colors**: 
  - Header lines: Blue (#0066CC)
  - Text: Black (default)
- **Spacing**:
  - Page margins: 0.5 inch all sides
  - Section spacing: Calculated automatically
  - Line spacing: 1.5 between sections

### Customizing Styles
Edit the `ResumeTemplateGenerator` class methods:

```javascript
// Change heading style
createHeading(text, level = 'HEADING_2') {
  return new Paragraph({
    text: text.toUpperCase(),
    heading: HeadingLevel[level],
    bold: true,
    size: 28,  // Change font size
    spacing: { before: 240, after: 120 }
  });
}

// Change header styling
createHeader() {
  // Modify color, size, alignment as needed
}
```

---

## 🔧 Advanced Usage

### Creating a Custom Section
```javascript
class CustomResumeGenerator extends ResumeTemplateGenerator {
  createCertifications() {
    const paragraphs = [];
    
    if (!this.data.certifications || this.data.certifications.length === 0) {
      return paragraphs;
    }

    paragraphs.push(this.createHeading('CERTIFICATIONS'));
    
    this.data.certifications.forEach(cert => {
      paragraphs.push(
        new Paragraph({
          text: cert.name,
          bold: true,
          spacing: { after: 50 }
        })
      );
      paragraphs.push(
        new Paragraph({
          text: cert.issuer,
          italics: true,
          spacing: { after: 100 }
        })
      );
    });

    return paragraphs;
  }

  async generateDocument() {
    const sections = [];
    sections.push(...this.createHeader());
    sections.push(...this.createCertifications());
    // ... other sections
    
    return new Document({ sections: [{ children: sections }] });
  }
}
```

### Modifying Page Margins
```javascript
const doc = new Document({
  sections: [{
    children: sections,
    properties: {
      page: {
        margins: {
          top: 1440,    // 1 inch
          right: 1440,
          bottom: 1440,
          left: 1440
        }
      }
    }
  }]
});
```

---

## 🐛 Debugging & Troubleshooting

### Issue: Blank Document Generated
**Solution**: Check that resumeData has at least a `name` field:
```javascript
if (!generator.data.name) {
  console.warn('Resume has no name - document may appear empty');
}
```

### Issue: Formatting Looks Off
**Solution**: Verify the docx library version:
```bash
npm list docx
# Should be version 8.x or higher
```

### Issue: Missing Sections
**Solution**: Ensure your JSON keys match exactly:
- `experience` (not `experiences`)
- `education` (not `educations`)
- `projects` (not `project`)

### Issue: Special Characters Not Displaying
**Solution**: Ensure JSON is UTF-8 encoded:
```javascript
// When reading JSON
const reader = new FileReader();
reader.readAsText(file, 'utf-8');  // Specify encoding
```

---

## 🧪 Testing

### Unit Test Example
```javascript
import ResumeTemplateGenerator from './TemplateGenerator.js';
import { Packer } from 'docx';

async function testGenerator() {
  const testData = {
    name: "Test User",
    email: "test@example.com",
    experience: [
      {
        company: "Test Corp",
        position: "Tester",
        description: ["Tested code"]
      }
    ]
  };

  const generator = new ResumeTemplateGenerator(testData);
  const doc = await generator.generateDocument();
  const blob = await Packer.toBlob(doc);
  
  console.assert(blob.size > 1000, 'Document generated');
  console.log('✓ Test passed');
}

testGenerator();
```

---

## 🔄 Integration with Resume Customizer

The `ResumeCustomizer.jsx` already includes TemplateGenerator:

1. **Upload JSON** → Data stored in `resumeData` state
2. **Edit Fields** → State updates trigger `handleDataChange`
3. **Click "Download Document"** → Calls `exportToDocxTemplate(resumeData)`
4. **TemplateGenerator** → Maps data to template and generates DOCX
5. **File Downloaded** → Professional resume document

---

## 📝 API Reference

### ResumeTemplateGenerator Class

#### Constructor
```javascript
new ResumeTemplateGenerator(resumeData)
```
- **resumeData**: Object containing resume information
- Returns: Generator instance

#### Methods

##### `generateDocument()`
```javascript
const doc = await generator.generateDocument();
```
- Returns: Promise<Document>
- Generates the complete DOCX document

##### `saveToFile(filename)`
```javascript
const { blob, fileName } = await generator.saveToFile('resume.docx');
```
- **filename** (optional): Custom filename
- Returns: Promise<{blob, fileName}>

### Utility Functions

##### `downloadResume(resumeData, filename)`
```javascript
await downloadResume(resumeData, 'my-resume.docx');
```
- Browser environment: Downloads the file
- Node.js environment: Saves to disk

##### `createResumeDocument(resumeData)`
```javascript
const doc = await createResumeDocument(resumeData);
```
- Returns: Promise<Document>
- Creates document without saving

---

## 🎓 Best Practices

1. **Always validate JSON** before generating:
   ```javascript
   try {
     const data = JSON.parse(jsonString);
   } catch (e) {
     console.error('Invalid JSON');
   }
   ```

2. **Keep descriptions concise** - 1-2 lines each
3. **Use bullet points** for achievements
4. **Organize skills by category** for better readability
5. **Include all contact information** for accessibility
6. **Test the generated document** by opening in Word

---

## 📄 Example Complete Resume JSON

```json
{
  "name": "Rakibul Alam Nahin",
  "address": "Kogarah Sydney NSW Australia",
  "phone": "0485465029",
  "email": "kibahi@gmail.com",
  "contacts": [
    {
      "annotation": "LinkedIn",
      "link": "https://www.linkedin.com/in/kibul-61b0/",
      "showAnnotation": true
    },
    {
      "annotation": "GitHub",
      "link": "https://github.com/akibulnn",
      "showAnnotation": true
    }
  ],
  "profile": "Experienced AI engineer with expertise in LLMs, Computer Vision, and full-stack development...",
  "experience": [
    {
      "company": "Truuth.id",
      "position": "AI Research Intern",
      "address": "Sydney Australia",
      "date": "FEB 2026 - JUNE 2026",
      "description": [
        "Researched high-performance text classification with LLMs",
        "Achieved >99% accuracy on document extraction tasks"
      ]
    }
  ],
  "projects": [
    {
      "name": "Chat&Go – AI Travel Assistant",
      "description": [
        "Built tourism chatbot using LLaMA-7B with RAG",
        "Implemented with Python, PyTorch, and React frontend"
      ]
    }
  ],
  "skills": [
    {
      "field": ["Python", "JavaScript", "React", "Node.js", "Machine Learning"]
    }
  ],
  "education": [
    {
      "school": "Macquarie University",
      "date": "FEB 2024 - JUNE 2026",
      "details": "Master of Information Technology in AI"
    }
  ],
  "miscellaneous": [
    {
      "type": "AWS Certified Machine Learning Specialty"
    }
  ]
}
```

---

## 🚀 Quick Start Checklist

- [ ] Install `docx` library
- [ ] Import `ResumeTemplateGenerator`
- [ ] Prepare resume JSON data
- [ ] Create generator instance
- [ ] Call `generateDocument()`
- [ ] Use `Packer.toBlob()` to create blob
- [ ] Download or save file
- [ ] Open in Microsoft Word to verify

---

## 📞 Support

For issues or customization needs:
1. Check the troubleshooting section above
2. Review the schema compatibility
3. Verify JSON format with a JSON validator
4. Check docx library documentation
5. Review the source code comments

Happy resume generating! 🎉
