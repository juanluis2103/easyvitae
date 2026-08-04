import MdToPdfTool from '@/components/MdToPdfTool.jsx';
import JsonLd from '@/components/JsonLd.jsx';
import { webAppSchema } from '@/lib/schema.js';

export const metadata = {
  title: '.md to PDF — Convertidor de Markdown a PDF online y gratis',
  description:
    'Convierte Markdown (.md) a PDF online, gratis y sin registro. Convertidor md a pdf rápido con vista previa en vivo, texto seleccionable y resultado ATS-friendly. Ideal para CVs, READMEs y documentación.',
  keywords: [
    'md to pdf',
    'md a pdf',
    'markdown to pdf',
    'convertir markdown a pdf',
    'convertidor md a pdf',
    'markdown a pdf online',
  ],
  alternates: { canonical: '/md-to-pdf' },
  openGraph: {
    title: '.md to PDF — Convertidor de Markdown a PDF online y gratis',
    description:
      'Convierte Markdown (.md) a PDF gratis y sin registro. Vista previa en vivo y texto seleccionable ATS-friendly.',
    url: '/md-to-pdf',
  },
};

export default function MdToPdfPage() {
  return (
    <>
      <JsonLd
        data={webAppSchema({
          name: '.md to PDF',
          alternateName: ['md to pdf', 'Markdown a PDF'],
          description:
            'Convertidor online y gratuito de Markdown (.md) a PDF con vista previa en vivo y texto seleccionable ATS-friendly.',
          path: '/md-to-pdf',
        })}
      />
      <MdToPdfTool />
    </>
  );
}
