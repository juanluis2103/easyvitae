import { marked } from 'marked';

/**
 * CSS pensado para ATS (Applicant Tracking Systems) en USA:
 * - Una sola columna, sin iconos, sin fotos, sin colores llamativos (blanco y negro/gris).
 * - Texto negro sobre blanco, fuentes estándar seguras (Calibri / Arial / Garamond).
 * - El texto del PDF es real y seleccionable (no es una imagen), por eso el ATS lo lee.
 * - Soporta tablas, bloques de código, citas, listas ordenadas/tareas y tachado (GFM).
 *
 * @param {Object} opts
 * @param {'calibri'|'arial'|'garamond'} [opts.font='calibri']
 * @param {number} [opts.bodySize=10.5]  Tamaño del cuerpo en pt.
 */
function buildCss({ font = 'calibri', bodySize = 10.5 } = {}) {
  const families = {
    calibri: `'Calibri', 'Carlito', 'Segoe UI', Arial, sans-serif`,
    arial: `'Arial', 'Helvetica', 'Liberation Sans', sans-serif`,
    garamond: `'Garamond', 'EB Garamond', 'Georgia', serif`,
  };
  const family = families[font] || families.calibri;
  const nameSize = (bodySize + 12).toFixed(1); // ~22pt para nombre

  return `
    @page {
      size: Letter;
      margin: 0.6in 0.7in;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      color: #000;
      background: #fff;
    }
    body {
      font-family: ${family};
      font-size: ${bodySize}pt;
      line-height: 1.3;
      -webkit-print-color-adjust: exact;
    }

    /* Nombre (primer H1) */
    h1 {
      font-size: ${nameSize}pt;
      text-align: center;
      margin: 0 0 2pt 0;
      letter-spacing: 0.3pt;
      font-weight: 700;
      text-transform: none;
    }

    /* Línea de contacto: primer párrafo justo después del nombre */
    h1 + p {
      text-align: center;
      margin: 0 0 10pt 0;
      font-size: ${(bodySize - 0.5).toFixed(1)}pt;
    }
    h1 + p a { color: #000; text-decoration: none; }

    /* Encabezados de sección (H2): SUMMARY, SKILLS, EXPERIENCE... */
    h2 {
      font-size: ${(bodySize + 1.5).toFixed(1)}pt;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      font-weight: 700;
      margin: 12pt 0 4pt 0;
      padding-bottom: 2pt;
      border-bottom: 1px solid #000;
      page-break-after: avoid;
    }

    /* Sub-encabezados (H3): Empresa — Cargo | fechas, Proyecto, etc. */
    h3 {
      font-size: ${bodySize}pt;
      font-weight: 700;
      margin: 7pt 0 1pt 0;
      page-break-after: avoid;
    }
    h3 + p { margin-top: 0; }

    /* Cuarto nivel para fechas o subtítulos en cursiva si se usa */
    h4 {
      font-size: ${bodySize}pt;
      font-weight: 400;
      font-style: italic;
      margin: 0 0 2pt 0;
    }

    p { margin: 2pt 0; }

    ul {
      margin: 2pt 0 4pt 0;
      padding-left: 16pt;
    }
    li {
      margin: 1.5pt 0;
      page-break-inside: avoid;
    }

    a { color: #000; }
    strong, b { font-weight: 700; }
    em, i { font-style: italic; }
    del, s { text-decoration: line-through; }

    ol {
      margin: 2pt 0 4pt 0;
      padding-left: 18pt;
    }
    ol li { margin: 1.5pt 0; page-break-inside: avoid; }

    /* Listas de tareas (- [ ] / - [x]): marked no añade una clase, se detecta por contenido */
    li:has(> input[type='checkbox']) { list-style: none; margin-left: -16pt; padding-left: 16pt; }
    input[type='checkbox'] { margin-right: 4pt; transform: translateY(1pt); }

    /* Citas */
    blockquote {
      margin: 4pt 0 8pt 0;
      padding: 1pt 10pt;
      border-left: 2.5pt solid #999;
      color: #333;
      font-style: italic;
      page-break-inside: avoid;
    }
    blockquote p { margin: 2pt 0; }

    /* Tablas */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 5pt 0 9pt 0;
      font-size: ${(bodySize - 0.5).toFixed(1)}pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #444;
      padding: 3.5pt 6pt;
      text-align: left;
      vertical-align: top;
    }
    thead th {
      background: #eee;
      font-weight: 700;
    }
    tbody tr:nth-child(even) { background: #f7f7f7; }

    /* Código en línea */
    code {
      font-family: 'Consolas', 'SFMono-Regular', 'Courier New', monospace;
      font-size: ${(bodySize - 1).toFixed(1)}pt;
      background: #f0f0f0;
      padding: 1pt 3pt;
      border-radius: 2pt;
    }

    /* Bloques de código */
    pre {
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 3pt;
      padding: 6pt 8pt;
      margin: 4pt 0 8pt 0;
      overflow-x: auto;
      page-break-inside: avoid;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    pre code {
      background: none;
      border-radius: 0;
      padding: 0;
      font-size: ${(bodySize - 1).toFixed(1)}pt;
      line-height: 1.35;
    }

    img { max-width: 100%; }

    hr {
      border: none;
      border-top: 1px solid #000;
      margin: 8pt 0;
    }

    /* Evitar cortes feos */
    h2, h3, table, pre, blockquote { page-break-inside: avoid; }
  `;
}

/**
 * Convierte el Markdown del CV en un documento HTML completo, estilizado para ATS.
 * @param {string} markdown
 * @param {Object} [opts]  Ver buildCss.
 * @returns {string} HTML completo listo para Puppeteer.
 */
export function renderResumeHtml(markdown, opts = {}) {
  marked.setOptions({ gfm: true, breaks: false });
  const body = marked.parse(markdown || '');
  const css = buildCss(opts);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Resume</title>
  <style>${css}</style>
</head>
<body>
${body}
</body>
</html>`;
}
