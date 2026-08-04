import { renderDocxPreviewHtml } from '@/src/markdown-to-docx.js';

export const runtime = 'nodejs';

// Vista previa HTML (estilo Word) del documento, para el iframe md → DOCX.
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const markdown = String(body?.markdown ?? '');
  return new Response(renderDocxPreviewHtml(markdown), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
