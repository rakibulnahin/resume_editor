/**
 * Extract raw text from an uploaded resume file, entirely in the browser.
 *
 * Parsers are imported dynamically so they only load when the user actually
 * imports a file (keeps the main bundle small). The extracted text is then
 * handed to the AI to be converted into the resume JSON schema.
 */

async function extractFromDocx(file) {
  const mammothModule = await import('mammoth/mammoth.browser');
  const mammoth = mammothModule.default || mammothModule;
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || '';
}

// pdfjs (modern build) calls Promise.withResolvers(), which older browsers
// (notably Safari < 17.4) don't have. We use the legacy build below for broad
// support and add this polyfill as belt-and-suspenders insurance.
if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = function withResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

async function extractFromPdf(file) {
  // Legacy build is transpiled for broader browser support (avoids the
  // Promise.withResolvers / modern-syntax issues that break Safari).
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.min.mjs');
  // CDN worker pinned to the installed version — the most reliable setup under
  // Create React App, where `import.meta.url` worker resolution is flaky.
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let text = '';
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    // eslint-disable-next-line no-await-in-loop
    const page = await pdf.getPage(pageNumber);
    // eslint-disable-next-line no-await-in-loop
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(' ');
    text += '\n\n';
  }
  return text;
}

/**
 * @param {File} file
 * @returns {Promise<string>} extracted plain text
 */
export async function extractTextFromFile(file) {
  const name = (file.name || '').toLowerCase();

  if (name.endsWith('.docx')) return extractFromDocx(file);
  if (name.endsWith('.pdf')) return extractFromPdf(file);
  if (name.endsWith('.txt') || name.endsWith('.md')) return file.text();

  if (name.endsWith('.doc')) {
    throw new Error('Legacy .doc files are not supported. Please export as .docx or PDF, or paste the text.');
  }

  // Best effort: treat anything else as plain text.
  return file.text();
}
