const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { marked } = require('marked');

// Define file paths
const projectRoot = path.join(__dirname, '..');
const readmePath = path.join(projectRoot, 'README.md');
const tempHtmlPath = path.join(projectRoot, 'temp_readme.html');
const pdfOutputPath = path.join(projectRoot, 'README.pdf');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

console.log('Starting PDF generation workflow...');

// Verify README exists
if (!fs.existsSync(readmePath)) {
  console.error(`Error: README.md not found at ${readmePath}`);
  process.exit(1);
}

// Read Markdown content
const markdownContent = fs.readFileSync(readmePath, 'utf8');

// Parse Markdown to HTML
console.log('Parsing Markdown to HTML...');
const rawHtml = marked(markdownContent);

// Inject modern print-focused CSS styles
const styledHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Wise Care Platform Documentation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-bg: #ffffff;
      --color-text: #2d3748;
      --color-primary: #1a365d;
      --color-secondary: #2b6cb0;
      --color-border: #e2e8f0;
      --color-quote-bg: #f7fafc;
      --color-quote-border: #3182ce;
      --color-code-bg: #2d3748;
      --color-code-text: #f7fafc;
    }

    @page {
      size: letter;
      margin: 1.0in;
      @bottom-right {
        content: counter(page);
      }
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: var(--color-text);
      background-color: var(--color-bg);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: var(--color-primary);
      font-weight: 700;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      page-break-after: avoid;
      break-after: avoid;
    }

    h1 {
      font-size: 24pt;
      border-bottom: 2px solid var(--color-primary);
      padding-bottom: 5px;
      margin-top: 0;
      margin-bottom: 1em;
    }

    h2 {
      font-size: 16pt;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 3px;
      margin-top: 2em;
    }

    h3 {
      font-size: 13pt;
      color: var(--color-secondary);
    }

    p {
      margin-top: 0;
      margin-bottom: 1em;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 1em;
      padding-left: 20px;
    }

    li {
      margin-bottom: 0.4em;
    }

    li > ul, li > ol {
      margin-top: 0.4em;
      margin-bottom: 0;
    }

    blockquote {
      margin: 1.5em 0;
      padding: 0.8em 1.2em;
      background-color: var(--color-quote-bg);
      border-left: 4px solid var(--color-quote-border);
      color: #4a5568;
      font-style: italic;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    blockquote p:last-child {
      margin-bottom: 0;
    }

    /* Table styling */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    th, td {
      border: 1px solid var(--color-border);
      padding: 8px 12px;
      text-align: left;
      font-size: 10pt;
    }

    th {
      background-color: #f7fafc;
      color: var(--color-primary);
      font-weight: 600;
    }

    tr:nth-child(even) {
      background-color: #fcfdfd;
    }

    /* Code styling */
    pre {
      background-color: var(--color-code-bg);
      color: var(--color-code-text);
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: Consolas, "Liberation Mono", Courier, monospace;
      font-size: 9.5pt;
      line-height: 1.4;
      margin: 1.5em 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    code {
      font-family: Consolas, "Liberation Mono", Courier, monospace;
      font-size: 9.5pt;
      background-color: #f7fafc;
      color: #e53e3e;
      padding: 2px 4px;
      border-radius: 3px;
    }

    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
      border-radius: 0;
      font-size: inherit;
    }

    /* Diagrams & layout helpers */
    .roadmap-timeline {
      display: flex;
      justify-content: space-between;
      border-top: 2px solid var(--color-border);
      padding-top: 15px;
      margin: 20px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .roadmap-step {
      flex: 1;
      margin-right: 15px;
    }

    .roadmap-step:last-child {
      margin-right: 0;
    }

    .roadmap-step h4 {
      margin-top: 0;
      color: var(--color-secondary);
    }

    /* Print utility helpers */
    .page-break {
      page-break-before: always;
      break-before: page;
    }

    a {
      color: var(--color-secondary);
      text-decoration: none;
    }
  </style>
</head>
<body>
  ${rawHtml}
</body>
</html>
`;

// Save HTML to temporary file
console.log('Writing styled HTML to temp file...');
fs.writeFileSync(tempHtmlPath, styledHtml, 'utf8');

// Run Edge CLI to convert HTML to PDF
console.log('Running Microsoft Edge to compile PDF...');
const command = `"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfOutputPath}" "${tempHtmlPath}"`;

try {
  execSync(command, { stdio: 'inherit' });
  console.log(`Success! PDF successfully generated at: ${pdfOutputPath}`);
} catch (error) {
  console.error('Error generating PDF using Microsoft Edge:', error);
  process.exit(1);
} finally {
  // Clean up temporary HTML file
  if (fs.existsSync(tempHtmlPath)) {
    console.log('Cleaning up temporary HTML file...');
    fs.unlinkSync(tempHtmlPath);
  }
}
