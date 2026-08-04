import { pdfBufferToMarkdown } from '@/src/pdf-to-markdown.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

// PDF → Markdown: recibe un PDF (campo "file"), devuelve { markdown, filename }.
export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return Response.json({ error: 'No se recibió ningún archivo PDF.' }, { status: 400 });
    }

    const name = file.name || '';
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(name);
    if (!isPdf) {
      return Response.json({ error: 'El archivo debe ser un PDF.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      return Response.json({ error: 'El PDF supera el límite de 2 MB.' }, { status: 413 });
    }

    const markdown = await pdfBufferToMarkdown(buffer);
    return Response.json({ markdown, filename: name.replace(/\.pdf$/i, '') || 'document' });
  } catch (err) {
    if (err?.message === 'EMPTY') {
      return Response.json(
        { error: 'No se encontró texto en el PDF. Puede ser un PDF escaneado (imagen) sin texto.' },
        { status: 422 }
      );
    }
    console.error('Error extrayendo PDF:', err);
    return Response.json({ error: 'No se pudo procesar el PDF.' }, { status: 500 });
  }
}
