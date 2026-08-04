import MdToDocxTool from '@/components/MdToDocxTool.jsx';
import JsonLd from '@/components/JsonLd.jsx';
import { webAppSchema } from '@/lib/schema.js';

export const metadata = {
  title: 'Markdown a DOCX — Convierte .md a Word online y gratis',
  description:
    'Convierte Markdown (.md) a un documento Word (.docx) editable, online y gratis. Conserva títulos, listas, negritas y enlaces. Con vista previa en vivo, sin registro.',
  keywords: [
    'md to docx',
    'md a docx',
    'markdown to docx',
    'markdown a word',
    'convertir markdown a word',
    'md a word',
  ],
  alternates: { canonical: '/md-to-docx' },
  openGraph: {
    title: 'Markdown a DOCX — Convierte .md a Word online y gratis',
    description:
      'Convierte Markdown (.md) a un documento Word (.docx) editable. Gratis, online y con vista previa en vivo.',
    url: '/md-to-docx',
  },
};

export default function MdToDocxPage() {
  return (
    <>
      <JsonLd
        data={webAppSchema({
          name: 'Markdown a DOCX',
          alternateName: ['md to docx', 'markdown a word'],
          description:
            'Convertidor online y gratuito de Markdown (.md) a documento Word (.docx) editable, con vista previa en vivo.',
          path: '/md-to-docx',
        })}
      />
      <MdToDocxTool />
    </>
  );
}
