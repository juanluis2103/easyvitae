import express from 'express';
import multer from 'multer';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import { renderResumeHtml } from './src/template.js';
import { pdfBufferToMarkdown } from './src/pdf-to-markdown.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// Solo aceptamos texto markdown; límite generoso pero acotado.
const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const VALID_FONTS = new Set(['calibri', 'arial', 'garamond']);

function sanitizeOptions(query = {}) {
  const font = VALID_FONTS.has(query.font) ? query.font : 'calibri';
  let bodySize = parseFloat(query.bodySize);
  if (!Number.isFinite(bodySize) || bodySize < 9 || bodySize > 12) bodySize = 10.5;
  return { font, bodySize };
}

// Una sola instancia de navegador, reutilizada entre peticiones.
let browserPromise = null;
function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserPromise;
}

async function markdownToPdf(markdown, opts) {
  const html = renderResumeHtml(markdown, opts);
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
    });
    return pdf;
  } finally {
    await page.close();
  }
}

// Vista previa en HTML (para el iframe del frontend).
app.post('/preview', (req, res) => {
  const markdown = String(req.body?.markdown ?? '');
  const opts = sanitizeOptions(req.body || {});
  res.type('html').send(renderResumeHtml(markdown, opts));
});

// Genera el PDF. Acepta JSON ({markdown}) o un archivo .md subido (campo "file").
app.post('/generate', upload.single('file'), async (req, res) => {
  try {
    let markdown = '';
    if (req.file) {
      markdown = req.file.buffer.toString('utf-8');
    } else if (req.body?.markdown) {
      markdown = String(req.body.markdown);
    }

    if (!markdown.trim()) {
      return res.status(400).json({ error: 'No se recibió contenido Markdown.' });
    }

    const opts = sanitizeOptions(req.body || req.query || {});
    const filename = (req.body?.filename || 'resume')
      .toString()
      .replace(/[^a-z0-9_-]/gi, '_')
      .slice(0, 60) || 'resume';

    const pdf = await markdownToPdf(markdown, opts);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    res.setHeader('Content-Length', pdf.length);
    res.end(pdf);
  } catch (err) {
    console.error('Error generando PDF:', err);
    res.status(500).json({ error: 'No se pudo generar el PDF.' });
  }
});

// PDF → Markdown: sube un .pdf (campo "file"), devuelve { markdown }.
app.post('/extract', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo PDF.' });
    }
    const isPdf =
      req.file.mimetype === 'application/pdf' ||
      /\.pdf$/i.test(req.file.originalname || '');
    if (!isPdf) {
      return res.status(400).json({ error: 'El archivo debe ser un PDF.' });
    }

    const markdown = await pdfBufferToMarkdown(req.file.buffer);
    res.json({ markdown, filename: (req.file.originalname || 'document').replace(/\.pdf$/i, '') });
  } catch (err) {
    if (err?.message === 'EMPTY') {
      return res.status(422).json({
        error: 'No se encontró texto en el PDF. Puede ser un PDF escaneado (imagen) sin texto.',
      });
    }
    console.error('Error extrayendo PDF:', err);
    res.status(500).json({ error: 'No se pudo procesar el PDF.' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

const server = app.listen(PORT, () => {
  console.log(`.md to PDF escuchando en http://localhost:${PORT}`);
});

async function shutdown() {
  console.log('\nCerrando...');
  server.close();
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
  }
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
