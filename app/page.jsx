import Link from 'next/link';
import ToolGrid from '@/components/ToolGrid.jsx';
import Footer from '@/components/Footer.jsx';
import JsonLd from '@/components/JsonLd.jsx';

export const metadata = {
  alternates: { canonical: '/' },
};

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '.md tools',
  url: 'https://mdtopdf.app/',
  description: 'Herramientas gratis para Markdown y PDF: md a pdf, md a docx, pdf a markdown y más.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://mdtopdf.app/?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={STRUCTURED_DATA} />
      <header className="hero">
        <span className="eyebrow">Gratis · Online · Sin registro</span>
        <h1>
          Herramientas para <span className="grad">Markdown y PDF</span>
        </h1>
        <p>
          Convierte, extrae y transforma tus documentos en segundos. Todo en el navegador, con
          vista previa en vivo y resultados limpios y seleccionables.
        </p>
      </header>

      <main className="tools">
        <h2>Herramientas disponibles</h2>
        <ToolGrid />
      </main>

      <section className="seo">
        <h2>Herramientas gratis para convertir Markdown y PDF</h2>
        <p>
          Esta es una suite de <strong>herramientas online y gratuitas</strong> para trabajar con{' '}
          <strong>Markdown (.md)</strong> y <strong>PDF</strong>. Convierte{' '}
          <strong>md a pdf</strong>, <strong>md a docx</strong>, extrae el texto de un{' '}
          <strong>PDF a Markdown</strong> (<strong>pdf a md</strong>) y más, todo desde el
          navegador, sin instalar nada y sin registrarte.
        </p>
        <h3>Herramientas incluidas</h3>
        <ul>
          <li>
            <strong>
              <Link href="/md-to-pdf">Markdown a PDF</Link>:
            </strong>{' '}
            convierte tus archivos <code>.md</code> en PDFs limpios y seleccionables.
          </li>
          <li>
            <strong>
              <Link href="/pdf-to-md">PDF a Markdown</Link>:
            </strong>{' '}
            sube un PDF, extrae su texto y obtén <code>.md</code> editable.
          </li>
          <li>
            <strong>
              <Link href="/md-to-docx">Markdown a DOCX</Link>:
            </strong>{' '}
            convierte tus archivos <code>.md</code> en documentos Word (<code>.docx</code>)
            editables.
          </li>
          <li>
            <strong>PDF a DOCX</strong> (próximamente).
          </li>
        </ul>
        <p>
          Ideal para CVs, READMEs, documentación técnica, apuntes y cualquier documento en Markdown.
        </p>
      </section>

      <Footer />
    </>
  );
}
