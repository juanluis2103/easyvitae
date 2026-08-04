import { renderResumeHtml } from '@/src/template.js';
import { sanitizeOptions } from '@/lib/options.js';

export const runtime = 'nodejs';

// Vista previa HTML del CV (para el iframe del editor md → PDF).
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const markdown = String(body?.markdown ?? '');
  const opts = sanitizeOptions(body || {});
  return new Response(renderResumeHtml(markdown, opts), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
