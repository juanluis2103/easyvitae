import Link from 'next/link';

// Pie de página compartido.
export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/md-to-pdf">md → PDF</Link>·<Link href="/md-to-docx">md → DOCX</Link>·
        <Link href="/pdf-to-md">PDF → md</Link>
      </div>
      <p>Hecho para escribir en Markdown. Gratis y sin registro.</p>
    </footer>
  );
}
