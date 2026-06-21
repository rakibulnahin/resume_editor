# Quick Integration Guide - Template Generator

## 🎯 3-Minute Setup

### Step 1: Install Dependency
```bash
npm install docx
```

### Step 2: Import the Generator
```javascript
// In your React component or Node.js file
import ResumeTemplateGenerator from './TemplateGenerator.js';
import { Packer } from 'docx';
```

### Step 3: Use It
```javascript
// Create instance with your data
const generator = new ResumeTemplateGenerator(resumeData);

// Generate document
const doc = await generator.generateDocument();

// Convert to blob and download
const blob = await Packer.toBlob(doc);
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `${resumeData.name || 'resume'}.docx`;
link.click();
```

---

## 🔗 Integration Scenarios

### Scenario 1: React Component
```javascript
import React, { useState } from 'react';
import ResumeTemplateGenerator from './TemplateGenerator.js';
import { Packer } from 'docx';

function MyResumeApp() {
  const [resumeData, setResumeData] = useState({...});

  const handleDownload = async () => {
    const generator = new ResumeTemplateGenerator(resumeData);
    const doc = await generator.generateDocument();
    const blob = await Packer.toBlob(doc);
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.docx';
    a.click();
  };

  return <button onClick={handleDownload}>Download Resume</button>;
}
```

### Scenario 2: Next.js API Route
```javascript
// pages/api/generate-resume.js
import ResumeTemplateGenerator from '../../lib/TemplateGenerator.js';
import { Packer } from 'docx';

export default async function handler(req, res) {
  const { resumeData } = req.body;

  const generator = new ResumeTemplateGenerator(resumeData);
  const doc = await generator.generateDocument();
  const blob = await Packer.toBlob(doc);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', 'attachment; filename="resume.docx"');
  res.send(Buffer.from(blob));
}
```

### Scenario 3: Node.js Backend
```javascript
import fs from 'fs';
import ResumeTemplateGenerator from './TemplateGenerator.js';
import { Packer } from 'docx';

async function createResume(resumeData, outputPath) {
  const generator = new ResumeTemplateGenerator(resumeData);
  const doc = await generator.generateDocument();
  const blob = await Packer.toBlob(doc);
  
  fs.writeFileSync(outputPath, Buffer.from(blob));
  console.log(`Resume saved to ${outputPath}`);
}

createResume(myResumeData, './output/resume.docx');
```

### Scenario 4: Standalone HTML
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/docx@8.0.0/build/index.js"></script>
</head>
<body>
  <input type="file" id="jsonInput" accept=".json" />
  <button onclick="generateResume()">Generate Resume</button>

  <script type="module">
    import ResumeTemplateGenerator from './TemplateGenerator.js';

    window.generateResume = async function() {
      const file = document.getElementById('jsonInput').files[0];
      const json = JSON.parse(await file.text());
      
      const generator = new ResumeTemplateGenerator(json);
      const doc = await generator.generateDocument();
      const { Packer } = window.docx;
      const blob = await Packer.toBlob(doc);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.docx';
      a.click();
    }
  </script>
</body>
</html>
```

---

## 📊 Data Flow Examples

### Example 1: Upload JSON → Generate Document
```
User uploads JSON
    ↓
parseJSON(file)
    ↓
resumeData = parsed JSON
    ↓
generator = new ResumeTemplateGenerator(resumeData)
    ↓
doc = await generator.generateDocument()
    ↓
blob = await Packer.toBlob(doc)
    ↓
Download/Save file
```

### Example 2: Form Input → Generate Document
```
User fills form
    ↓
resumeData = formData
    ↓
generator = new ResumeTemplateGenerator(resumeData)
    ↓
doc = await generator.generateDocument()
    ↓
blob = await Packer.toBlob(doc)
    ↓
Download file
```

### Example 3: Database → Generate & Email
```
Fetch resumeData from database
    ↓
generator = new ResumeTemplateGenerator(resumeData)
    ↓
doc = await generator.generateDocument()
    ↓
blob = await Packer.toBlob(doc)
    ↓
Send email with attachment
```

---

## 🛠️ Common Customizations

### Custom Font Sizes
```javascript
class CustomGenerator extends ResumeTemplateGenerator {
  createHeading(text) {
    return new Paragraph({
      text: text.toUpperCase(),
      size: 32,  // Increase font size
      bold: true,
      spacing: { before: 240, after: 120 }
    });
  }
}
```

### Custom Colors
```javascript
class ColoredGenerator extends ResumeTemplateGenerator {
  createHeading(text) {
    return new Paragraph({
      text: text.toUpperCase(),
      color: 'DC143C',  // Crimson red
      bold: true,
      spacing: { before: 240, after: 120 }
    });
  }
}
```

### Custom Margins
```javascript
async generateDocument() {
  const sections = [];
  // ... add your sections ...
  
  return new Document({
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
}
```

### Add Company Logo
```javascript
class LogoGenerator extends ResumeTemplateGenerator {
  async createHeader() {
    const paragraphs = [];
    
    // Add image (if available)
    if (this.data.logoUrl) {
      paragraphs.push(
        new Paragraph({
          text: new ImageRun({
            data: await this.fetchImageData(this.data.logoUrl),
            transformation: { width: 100, height: 100 }
          }),
          alignment: AlignmentType.CENTER
        })
      );
    }
    
    // ... rest of header ...
    return paragraphs;
  }
}
```

---

## ✅ Validation Checklist

Before generating documents, validate your data:

```javascript
function validateResumeData(data) {
  const errors = [];

  // Check required fields
  if (!data.name) errors.push('Missing name');
  if (!data.email) errors.push('Missing email');

  // Validate array fields
  if (data.experience && !Array.isArray(data.experience)) {
    errors.push('experience must be an array');
  }

  // Validate structure
  if (Array.isArray(data.experience)) {
    data.experience.forEach((exp, idx) => {
      if (!exp.company) errors.push(`experience[${idx}] missing company`);
      if (!Array.isArray(exp.description)) {
        errors.push(`experience[${idx}].description must be an array`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Usage
const validation = validateResumeData(resumeData);
if (!validation.isValid) {
  console.error('Invalid resume data:', validation.errors);
} else {
  const generator = new ResumeTemplateGenerator(resumeData);
  // ... generate document
}
```

---

## 🎨 Template Customization Examples

### Minimal Resume (Only Essential Sections)
```javascript
class MinimalGenerator extends ResumeTemplateGenerator {
  async generateDocument() {
    const sections = [];
    sections.push(...this.createHeader());
    sections.push(...this.createExperience());
    sections.push(...this.createSkills());
    // Skip: Profile, Projects, Education, Miscellaneous

    return new Document({ sections: [{ children: sections }] });
  }
}
```

### Detailed Resume (All Sections + Custom)
```javascript
class DetailedGenerator extends ResumeTemplateGenerator {
  createPublications() {
    const paragraphs = [];
    if (!this.data.publications || this.data.publications.length === 0) {
      return paragraphs;
    }

    paragraphs.push(this.createHeading('PUBLICATIONS'));
    
    this.data.publications.forEach(pub => {
      paragraphs.push(
        new Paragraph({
          text: pub.title,
          bold: true,
          spacing: { after: 50 }
        })
      );
      paragraphs.push(
        new Paragraph({
          text: pub.venue,
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
    sections.push(...this.createProfile());
    sections.push(...this.createExperience());
    sections.push(...this.createProjects());
    sections.push(...this.createPublications());
    sections.push(...this.createSkills());
    sections.push(...this.createEducation());
    sections.push(...this.createMiscellaneous());

    return new Document({ sections: [{ children: sections }] });
  }
}
```

---

## 🐛 Error Handling

```javascript
async function safeGenerateResume(resumeData) {
  try {
    // Validate
    if (!resumeData.name) {
      throw new Error('Resume must have a name');
    }

    // Generate
    const generator = new ResumeTemplateGenerator(resumeData);
    const doc = await generator.generateDocument();
    const blob = await Packer.toBlob(doc);

    // Download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.name}-resume.docx`;
    link.click();
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'Resume downloaded successfully' };
  } catch (error) {
    console.error('Resume generation failed:', error);
    return { success: false, message: error.message };
  }
}
```

---

## 📦 Bundle Size Impact

Current sizes (approximate):
- `TemplateGenerator.js`: ~5KB (minified)
- `docx` library: ~500KB (production bundle)
- Total impact: ~500KB added to bundle

For smaller bundle size:
- Use dynamic imports: `const { Packer } = await import('docx')`
- Load docx from CDN instead of npm
- Lazy load the generator only when needed

---

## 🚀 Performance Tips

1. **Cache the generator instance** if generating multiple documents
2. **Use async/await** to avoid blocking UI
3. **Generate in a Web Worker** for large documents
4. **Batch generate** multiple resumes efficiently

Example Web Worker:
```javascript
// resume-worker.js
import ResumeTemplateGenerator from './TemplateGenerator.js';
import { Packer } from 'docx';

self.onmessage = async (event) => {
  const { resumeData, id } = event.data;
  
  const generator = new ResumeTemplateGenerator(resumeData);
  const doc = await generator.generateDocument();
  const blob = await Packer.toBlob(doc);
  
  self.postMessage({ id, blob });
};
```

---

## 📖 Next Steps

1. Install docx: `npm install docx`
2. Copy TemplateGenerator.js to your project
3. Import and use in your components
4. Customize styling as needed
5. Test with various resume data
6. Deploy and gather feedback

For detailed API documentation, see `TEMPLATE_GENERATOR_GUIDE.md`
