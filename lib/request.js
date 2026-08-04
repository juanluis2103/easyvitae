const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Lee el Markdown de una petición que puede llegar como JSON ({markdown, ...})
 * o como multipart con un archivo .md en el campo "file". Devuelve también el
 * resto de campos (font, bodySize, filename) para que la ruta los sanitice.
 *
 * @param {Request} req
 * @returns {Promise<{ markdown: string, fields: Object, error?: string }>}
 */
export async function readMarkdownInput(req) {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const file = form.get('file');
    const fields = {};
    for (const [key, value] of form.entries()) {
      if (key !== 'file' && typeof value === 'string') fields[key] = value;
    }

    if (file && typeof file !== 'string') {
      const buffer = Buffer.from(await file.arrayBuffer());
      if (buffer.length > MAX_BYTES) {
        return { markdown: '', fields, error: 'El archivo supera el límite de 2 MB.' };
      }
      return { markdown: buffer.toString('utf-8'), fields };
    }
    return { markdown: String(fields.markdown ?? ''), fields };
  }

  const body = await req.json().catch(() => ({}));
  return { markdown: String(body?.markdown ?? ''), fields: body || {} };
}
