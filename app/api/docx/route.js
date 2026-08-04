import { markdownToDocx } from '@/src/markdown-to-docx.js';
import { safeFilename } from '@/lib/options.js';
import { readMarkdownInput } from '@/lib/request.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Genera el DOCX. Acepta JSON ({markdown}) o un .md subido (campo "file").
export async function POST(req) {
  try {
    const { markdown, fields, error } = await readMarkdownInput(req);
    if (error) return Response.json({ error }, { status: 400 });
    if (!markdown.trim()) {
      return Response.json({ error: 'No se recibió contenido Markdown.' }, { status: 400 });
    }

    const filename = safeFilename(fields.filename, 'document');
    const buffer = await markdownToDocx(markdown);

    return new Response(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}.docx"`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (err) {
    console.error('Error generando DOCX:', err);
    return Response.json({ error: 'No se pudo generar el DOCX.' }, { status: 500 });
  }
}
