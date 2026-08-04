import { Fraunces } from 'next/font/google';
import TopNav from '@/components/TopNav.jsx';
import './globals.css';

// Fuente display auto-hospedada (sin depender de un CDN externo).
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://mdtopdf.app'),
  title: {
    default: 'Herramientas Markdown y PDF online y gratis — md to pdf, pdf to md',
    template: '%s | .md tools',
  },
  description:
    'Suite de herramientas gratis para Markdown y PDF: convierte md a pdf, md a docx, extrae texto de un PDF a Markdown (pdf a md) y más. Online, sin registro, con vista previa en vivo.',
  keywords: [
    'md to pdf',
    'markdown to pdf',
    'md to docx',
    'markdown to docx',
    'pdf to md',
    'pdf a markdown',
    'herramientas markdown',
    'convertidor pdf online',
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: '.md tools',
    locale: 'es_ES',
    url: '/',
    title: 'Herramientas Markdown y PDF online y gratis',
    description: 'Convierte md a pdf, md a docx, pdf a markdown y más. Gratis, online y sin registro.',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={fraunces.variable}>
      <body>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
