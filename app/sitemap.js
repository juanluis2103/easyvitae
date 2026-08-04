const BASE = 'https://mdtopdf.app';

export default function sitemap() {
  const now = new Date();
  return [
    { url: `${BASE}/`, changeFrequency: 'weekly', priority: 1.0, lastModified: now },
    { url: `${BASE}/md-to-pdf`, changeFrequency: 'weekly', priority: 0.9, lastModified: now },
    { url: `${BASE}/md-to-docx`, changeFrequency: 'weekly', priority: 0.9, lastModified: now },
    { url: `${BASE}/pdf-to-md`, changeFrequency: 'weekly', priority: 0.9, lastModified: now },
  ];
}
