import { renderResumeHtml } from '@/src/template.js';
import { sanitizeOptions, safeFilename } from '@/lib/options.js';
import { htmlToPdf } from '@/lib/browser.js';
import { readMarkdownInput } from '@/lib/request.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Genera el PDF. Acepta JSON ({markdown, font, bodySize}) o un .md subido (campo "file").
export async function POST(req) {
  try {
    const { markdown, fields, error } = await readMarkdownInput(req);
    if (error) return Response.json({ error }, { status: 400 });
    if (!markdown.trim()) {
      return Response.json({ error: 'No se recibió contenido Markdown.' }, { status: 400 });
    }

    const opts = sanitizeOptions(fields);
    const filename = safeFilename(fields.filename, 'resume');
    const pdf = await htmlToPdf(renderResumeHtml(markdown, opts));

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        'Content-Length': String(pdf.length),
      },
    });
  } catch (err) {
    console.error('Error generando PDF:', err);
    return Response.json({ error: 'No se pudo generar el PDF.' }, { status: 500 });
  }
}
