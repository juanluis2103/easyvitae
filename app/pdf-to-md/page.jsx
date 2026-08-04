import PdfToMdTool from '@/components/PdfToMdTool.jsx';
import JsonLd from '@/components/JsonLd.jsx';
import { webAppSchema } from '@/lib/schema.js';

export const metadata = {
  title: 'PDF a Markdown — Extrae texto de un PDF a .md online y gratis',
  description:
    'Convierte PDF a Markdown online y gratis. Sube un PDF, extrae su texto automáticamente y descarga un archivo .md editable. Detecta títulos y listas. Sin registro.',
  keywords: [
    'pdf to md',
    'pdf a md',
    'pdf a markdown',
    'pdf to markdown',
    'extraer texto de pdf',
    'convertir pdf a markdown',
  ],
  alternates: { canonical: '/pdf-to-md' },
  openGraph: {
    title: 'PDF a Markdown — Extrae texto de un PDF a .md gratis',
    description:
      'Sube un PDF, extrae su texto y descarga Markdown editable. Gratis y sin registro.',
    url: '/pdf-to-md',
  },
};

export default function PdfToMdPage() {
  return (
    <>
      <JsonLd
        data={webAppSchema({
          name: 'PDF a Markdown',
          alternateName: ['pdf to md', 'pdf a markdown'],
          description:
            'Extrae el texto de un PDF y lo convierte en Markdown editable, online y gratis.',
          path: '/pdf-to-md',
        })}
      />
      <PdfToMdTool />
    </>
  );
}
