const BASE = 'https://mdtopdf.app';

/**
 * Construye el JSON-LD de una herramienta (schema.org/WebApplication).
 * @param {{name: string, alternateName?: string[], description: string, path: string}} info
 */
export function webAppSchema({ name, alternateName = [], description, path }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    alternateName,
    description,
    url: `${BASE}${path}`,
    applicationCategory: 'Productivity',
    operatingSystem: 'Any (web browser)',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}
