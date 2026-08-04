import ToolCard from './ToolCard.jsx';

// Catálogo de herramientas. El contenedor compone tarjetas a partir de estos datos.
const TOOLS = [
  {
    href: '/md-to-pdf',
    icon: 'mdToPdf',
    title: '.md → PDF',
    description:
      'Convierte archivos Markdown a un PDF limpio, seleccionable y ATS-friendly. Con vista previa en vivo y elección de fuente.',
    live: true,
  },
  {
    href: '/pdf-to-md',
    icon: 'pdfToMd',
    title: 'PDF → .md',
    description:
      'Sube un PDF, extrae su texto automáticamente y obtén Markdown listo para editar. Detecta títulos y listas.',
    live: true,
  },
  {
    href: '/md-to-docx',
    icon: 'mdToDocx',
    title: '.md → DOCX',
    description:
      'Convierte Markdown a documentos Word (.docx) editables, manteniendo títulos, listas y estilos.',
    live: true,
  },
  {
    icon: 'pdfToDocx',
    title: 'PDF → DOCX',
    description: 'Transforma PDFs en documentos de Word editables, listos para retocar.',
  },
  {
    icon: 'merge',
    title: 'Unir / dividir PDF',
    description: 'Combina varios PDFs en uno o separa páginas, directamente en el navegador.',
  },
  {
    icon: 'editor',
    title: 'Editor Markdown',
    description: 'Editor en vivo con vista previa, atajos y exportación a múltiples formatos.',
  },
];

export default function ToolGrid() {
  return (
    <div className="grid">
      {TOOLS.map((tool) => (
        <ToolCard key={tool.title} {...tool} />
      ))}
    </div>
  );
}
