// Validación y sanitización de opciones del CV (compartida por las rutas PDF).

export const VALID_FONTS = new Set(['calibri', 'arial', 'garamond']);

/**
 * Normaliza fuente y tamaño de cuerpo a valores seguros.
 * @param {Object} input  Objeto con posibles {font, bodySize} sin confiar.
 * @returns {{font: string, bodySize: number}}
 */
export function sanitizeOptions(input = {}) {
  const font = VALID_FONTS.has(input.font) ? input.font : 'calibri';
  let bodySize = parseFloat(input.bodySize);
  if (!Number.isFinite(bodySize) || bodySize < 9 || bodySize > 12) bodySize = 10.5;
  return { font, bodySize };
}

/**
 * Convierte un nombre de archivo arbitrario en algo seguro para Content-Disposition.
 * @param {string} name
 * @param {string} fallback
 */
export function safeFilename(name, fallback = 'document') {
  return (
    (name || fallback)
      .toString()
      .replace(/[^a-z0-9_-]/gi, '_')
      .slice(0, 60) || fallback
  );
}
