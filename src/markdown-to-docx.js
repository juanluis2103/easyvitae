import { marked } from 'marked';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  HeadingLevel,
  BorderStyle,
  AlignmentType,
  ShadingType,
} from 'docx';

/**
 * Convierte Markdown en un documento Word (.docx) editable, conservando
 * títulos, listas, énfasis y enlaces. El flujo es:
 *   markdown → tokens (marked.lexer) → bloques docx → Buffer.
 *
 * La presentación (preview HTML) y la generación binaria comparten el mismo
 * parser de marked, por eso viven juntas: ambas son "representar este Markdown
 * como documento Word", en dos formatos de salida.
 */

const HEADING_BY_DEPTH = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
};

const MONO_FONT = 'Consolas';

/**
 * Convierte tokens inline de marked en runs de docx (texto, negrita, cursiva,
 * código, enlaces...). Es recursiva: la negrita y la cursiva anidan estilos.
 * @param {Array} tokens  Tokens inline de marked.
 * @param {Object} style  Estilo heredado (bold, italics, strike...).
 * @returns {Array} Runs de docx.
 */
function inlineRuns(tokens = [], style = {}) {
  const runs = [];
  for (const token of tokens) {
    switch (token.type) {
      case 'text':
        if (token.tokens?.length) runs.push(...inlineRuns(token.tokens, style));
        else runs.push(new TextRun({ text: token.text, ...style }));
        break;
      case 'strong':
        runs.push(...inlineRuns(token.tokens, { ...style, bold: true }));
        break;
      case 'em':
        runs.push(...inlineRuns(token.tokens, { ...style, italics: true }));
        break;
      case 'del':
        runs.push(...inlineRuns(token.tokens, { ...style, strike: true }));
        break;
      case 'codespan':
        runs.push(new TextRun({ text: token.text, font: MONO_FONT, ...style }));
        break;
      case 'br':
        runs.push(new TextRun({ break: 1 }));
        break;
      case 'escape':
        runs.push(new TextRun({ text: token.text, ...style }));
        break;
      case 'link':
        runs.push(
          new ExternalHyperlink({
            link: token.href,
            children: inlineRuns(token.tokens, { ...style, style: 'Hyperlink' }),
          })
        );
        break;
      case 'html':
        break; // se ignora el HTML embebido
      default:
        if (token.text) runs.push(new TextRun({ text: token.text, ...style }));
    }
  }
  return runs;
}

/**
 * Reúne los runs inline de un ítem de lista (que puede contener texto suelto
 * o párrafos según sea una lista compacta o "loose").
 */
function listItemRuns(item) {
  const inlineTokens = (item.tokens || []).flatMap((token) =>
    token.type === 'text' || token.type === 'paragraph' ? token.tokens || [] : []
  );
  return inlineRuns(inlineTokens);
}

/**
 * Convierte una lista (ordenada o no) en párrafos docx. Cada lista ordenada
 * recibe su propia referencia de numeración para que el conteo se reinicie.
 */
function listToParagraphs(token, ctx) {
  const paragraphs = [];
  let reference = null;
  if (token.ordered) {
    reference = `ordered-${ctx.numbering.length}`;
    ctx.numbering.push({
      reference,
      levels: [
        {
          level: 0,
          format: 'decimal',
          text: '%1.',
          alignment: AlignmentType.START,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    });
  }

  for (const item of token.items) {
    paragraphs.push(
      new Paragraph({
        children: listItemRuns(item),
        spacing: { after: 40 },
        ...(token.ordered
          ? { numbering: { reference, level: 0 } }
          : { bullet: { level: 0 } }),
      })
    );
    // Sublistas: se aplanan un nivel para no perder el contenido.
    for (const sub of (item.tokens || []).filter((t) => t.type === 'list')) {
      paragraphs.push(...listToParagraphs(sub, ctx));
    }
  }
  return paragraphs;
}

/** Convierte un bloque de código en párrafos monoespaciados con sombreado. */
function codeToParagraphs(token) {
  return token.text.split('\n').map(
    (line) =>
      new Paragraph({
        children: [new TextRun({ text: line || ' ', font: MONO_FONT, size: 18 })],
        shading: { type: ShadingType.SOLID, color: 'F2F2F2', fill: 'F2F2F2' },
        spacing: { after: 0 },
      })
  );
}

/**
 * Convierte una lista de tokens de bloque de marked en párrafos docx.
 * @param {Array} tokens
 * @param {Object} ctx  Acumula la configuración de numeración compartida.
 * @returns {Array<Paragraph>}
 */
function blocksToParagraphs(tokens, ctx) {
  const out = [];
  for (const token of tokens) {
    switch (token.type) {
      case 'heading':
        out.push(
          new Paragraph({
            heading: HEADING_BY_DEPTH[token.depth] || HeadingLevel.HEADING_6,
            children: inlineRuns(token.tokens),
          })
        );
        break;
      case 'paragraph':
        out.push(
          new Paragraph({ children: inlineRuns(token.tokens), spacing: { after: 120 } })
        );
        break;
      case 'list':
        out.push(...listToParagraphs(token, ctx));
        break;
      case 'blockquote':
        out.push(
          new Paragraph({
            children: inlineRuns(
              (token.tokens || []).flatMap((t) => t.tokens || []),
              { italics: true }
            ),
            indent: { left: 480 },
            spacing: { after: 120 },
          })
        );
        break;
      case 'code':
        out.push(...codeToParagraphs(token));
        break;
      case 'hr':
        out.push(
          new Paragraph({
            border: { bottom: { color: '999999', size: 6, style: BorderStyle.SINGLE, space: 1 } },
          })
        );
        break;
      case 'space':
      case 'html':
        break;
      default:
        if (token.tokens) out.push(...blocksToParagraphs(token.tokens, ctx));
    }
  }
  return out;
}

/**
 * Genera el .docx a partir del Markdown.
 * @param {string} markdown
 * @returns {Promise<Buffer>} Buffer del documento .docx.
 */
export async function markdownToDocx(markdown) {
  const tokens = marked.lexer(markdown || '');
  const ctx = { numbering: [] };
  const children = blocksToParagraphs(tokens, ctx);

  const doc = new Document({
    numbering: { config: ctx.numbering },
    sections: [{ properties: {}, children }],
  });

  return Packer.toBuffer(doc);
}

/* ===== Preview HTML (aproximación visual al documento Word) ===== */

// Estilos que imitan el aspecto por defecto de Word, para que la vista previa
// se parezca a lo que el usuario abrirá en su procesador de texto.
const WORD_PREVIEW_CSS = `
  body { margin: 0; background: #e8e8e8;
    font-family: Calibri, 'Carlito', 'Segoe UI', Arial, sans-serif; color: #000; }
  .page { background: #fff; max-width: 8.5in; margin: 24px auto; padding: 1in;
    box-shadow: 0 2px 14px rgba(0,0,0,0.18); min-height: 70vh; }
  h1 { font-size: 20pt; color: #2E74B5; font-weight: 600; margin: 0.4em 0 0.2em; }
  h2 { font-size: 16pt; color: #2E74B5; font-weight: 600; margin: 0.5em 0 0.2em; }
  h3 { font-size: 13pt; color: #1F4D78; font-weight: 600; margin: 0.5em 0 0.15em; }
  h4 { font-size: 11pt; color: #1F4D78; font-weight: 600; margin: 0.5em 0 0.15em; }
  p, li { font-size: 11pt; line-height: 1.45; margin: 0.35em 0; }
  ul, ol { margin: 0.3em 0; padding-left: 26px; }
  a { color: #0563C1; }
  code { font-family: ${MONO_FONT}, monospace; font-size: 10pt; }
  pre { background: #f2f2f2; padding: 10px; border-radius: 3px;
    font-family: ${MONO_FONT}, monospace; font-size: 10pt; overflow-x: auto; }
  blockquote { border-left: 3px solid #ccc; margin: 0.4em 0; padding-left: 12px;
    color: #555; font-style: italic; }
  hr { border: none; border-top: 1px solid #999; margin: 1em 0; }
`;

/**
 * Render HTML de vista previa del documento (no es el .docx real, sino una
 * aproximación visual al estilo de Word).
 * @param {string} markdown
 * @returns {string} HTML completo para el iframe del frontend.
 */
export function renderDocxPreviewHtml(markdown) {
  marked.setOptions({ gfm: true, breaks: false });
  const body = marked.parse(markdown || '');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Vista previa DOCX</title>
  <style>${WORD_PREVIEW_CSS}</style>
</head>
<body>
  <div class="page">${body}</div>
</body>
</html>`;
}
