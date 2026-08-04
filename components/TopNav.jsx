import Link from 'next/link';

// Navegación superior compartida por todas las páginas.
export default function TopNav() {
  return (
    <nav className="topnav">
      <Link className="brand" href="/">
        <span className="logo">.md</span>
        <span>
          <span className="dot">.md</span> tools
        </span>
      </Link>
      <span className="spacer" />
      <Link className="navlink" href="/md-to-pdf">
        md → PDF
      </Link>
      <Link className="navlink" href="/md-to-docx">
        md → DOCX
      </Link>
      <Link className="navlink" href="/pdf-to-md">
        PDF → md
      </Link>
    </nav>
  );
}
