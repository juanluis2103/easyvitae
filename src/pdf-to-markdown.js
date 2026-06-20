// Extracts text from a PDF buffer and converts it to Markdown.
// Uses pdfjs-dist (legacy build) so it runs on the main thread in Node.
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const BULLET_RE = /^\s*[•‣◦⁃∙▪●·•·▪◦‣*\-–]\s+/;

// Group a page's text items into visual lines, tracking the dominant font size.
function pageToLines(items) {
  const lines = [];
  let current = { text: '', size: 0 };

  for (const item of items) {
    if (typeof item.str !== 'string') continue; // skip marked-content markers
    current.text += item.str;
    // transform = [a, b, c, d, e, f]; vertical scale ~ font size.
    const size = Math.hypot(item.transform[2], item.transform[3]) || item.height || 0;
    if (size > current.size) current.size = size;
    if (item.hasEOL) {
      lines.push(current);
      current = { text: '', size: 0 };
    }
  }
  if (current.text.trim()) lines.push(current);

  for (const l of lines) l.text = l.text.replace(/\s+/g, ' ').trim();
  return lines.filter((l) => l.text);
}

function median(numbers) {
  if (!numbers.length) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

const isUpperHeading = (t) =>
  t.length <= 60 && /[A-ZÁÉÍÓÚÑ]/.test(t) && t === t.toUpperCase() && !BULLET_RE.test(t);

// Classify each line and assemble Markdown with sensible spacing.
function linesToMarkdown(lines) {
  const baseSize = median(lines.map((l) => l.size).filter(Boolean));
  const out = [];
  let prevType = 'blank';

  const pushBlank = () => {
    if (out.length && out[out.length - 1] !== '') out.push('');
  };

  for (const line of lines) {
    const text = line.text;
    const ratio = baseSize ? line.size / baseSize : 1;
    let type = 'text';
    let md = text;

    if (BULLET_RE.test(text)) {
      type = 'bullet';
      md = '- ' + text.replace(BULLET_RE, '');
    } else if (ratio >= 1.5) {
      type = 'heading';
      md = '# ' + text;
    } else if (ratio >= 1.22) {
      type = 'heading';
      md = '## ' + text;
    } else if ((ratio >= 1.08 || isUpperHeading(text)) && text.length <= 70) {
      type = 'heading';
      md = '### ' + text;
    }

    if (type === 'heading') {
      pushBlank();
      out.push(md);
      out.push('');
      prevType = 'blank';
    } else if (type === 'bullet') {
      out.push(md);
      prevType = 'bullet';
    } else {
      if (prevType === 'bullet') pushBlank();
      out.push(md);
      prevType = 'text';
    }
  }

  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

export async function pdfBufferToMarkdown(buffer) {
  const data = new Uint8Array(buffer);
  const doc = await getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
    verbosity: 0, // suppress noisy font warnings (errors still throw)
  }).promise;

  const allLines = [];
  try {
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      allLines.push(...pageToLines(content.items));
      page.cleanup();
    }
  } finally {
    await doc.destroy();
  }

  if (!allLines.length) {
    throw new Error('EMPTY');
  }
  return linesToMarkdown(allLines);
}
