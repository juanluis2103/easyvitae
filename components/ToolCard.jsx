import Link from 'next/link';
import { Icons } from './icons.jsx';

// Una tarjeta de herramienta. Recibe todos sus datos por props (sin estado global).
export default function ToolCard({ href, icon, title, description, live = false }) {
  const Icon = Icons[icon];
  const inner = (
    <>
      <span className={`badge ${live ? 'live' : 'soon'}`}>
        {live ? 'Disponible' : 'Próximamente'}
      </span>
      <span className="icon" aria-hidden="true">
        {Icon ? <Icon /> : null}
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {live ? <span className="cta">Abrir herramienta →</span> : null}
    </>
  );

  return live ? (
    <Link className="card live" href={href}>
      {inner}
    </Link>
  ) : (
    <div className="card soon">{inner}</div>
  );
}
