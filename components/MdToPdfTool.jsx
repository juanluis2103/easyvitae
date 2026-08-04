'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadBlob } from '@/lib/download.js';

const SAMPLE = `# Jane Doe
[LinkedIn](https://linkedin.com/in/janedoe) | [GitHub](https://github.com/janedoe) | jane.doe@email.com | (555) 123-4567 | San Francisco, CA

## Summary
Software Engineer with 3+ years building scalable web services. Specialized in backend systems, cloud infrastructure, and developer tooling. Passionate about clean code and measurable impact.

## Skills
**Languages:** Python, JavaScript, TypeScript, Go, SQL
**Frameworks:** React, Node.js, Django, FastAPI
**Tools:** Git, Docker, Kubernetes, AWS, PostgreSQL, Redis

## Experience
### Acme Corp — Software Engineer | Jan 2022 – Present
- Reduced API latency by 45% by introducing Redis caching and query optimization.
- Led migration of 12 microservices to Kubernetes, cutting deploy time from 30 to 5 minutes.
- Mentored 3 junior engineers and established the team's code review standards.

### StartupXYZ — Junior Developer | Jun 2020 – Dec 2021
- Built a billing dashboard in React used by 2,000+ daily customers.
- Automated reporting pipeline, saving the team ~10 hours per week.

## Projects
### OpenMetrics CLI | [github.com/janedoe/openmetrics](https://github.com/janedoe/openmetrics)
- CLI tool to collect and export app metrics. Built with Go; 400+ GitHub stars.

## Education
### University of California, Berkeley — B.S. Computer Science | 2020
`;

export default function MdToPdfTool() {
  const [markdown, setMarkdown] = useState(SAMPLE);
  const [font, setFont] = useState('calibri');
  const [bodySize, setBodySize] = useState('10.5');
  const [status, setStatus] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const debounce = useRef(null);

  const refreshPreview = useCallback(async () => {
    try {
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, font, bodySize }),
      });
      setPreviewHtml(await res.text());
    } catch (err) {
      console.error(err);
    }
  }, [markdown, font, bodySize]);

  // Refresca la vista previa con debounce ante cualquier cambio.
  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(refreshPreview, 350);
    return () => clearTimeout(debounce.current);
  }, [refreshPreview]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMarkdown(await file.text());
    setStatus(`Cargado: ${file.name}`);
  }

  async function download() {
    if (!markdown.trim()) {
      setStatus('Escribe o carga un CV primero.');
      return;
    }
    setStatus('Generando PDF...');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, font, bodySize, filename: 'resume' }),
      });
      if (!res.ok) throw new Error('Fallo al generar');
      downloadBlob(await res.blob(), 'resume.pdf');
      setStatus('PDF descargado ✓');
    } catch (err) {
      console.error(err);
      setStatus('Error al generar el PDF.');
    }
  }

  return (
    <>
      <div className="toolbar">
        <span className="title">.md → PDF</span>
        <span className="sub">Convierte Markdown a un PDF limpio y ATS-friendly</span>
        <h1 className="visually-hidden">
          Convertidor de Markdown a PDF online y gratis (md to pdf)
        </h1>
        <div className="controls">
          <label className="field">
            Fuente
            <select value={font} onChange={(e) => setFont(e.target.value)}>
              <option value="calibri">Calibri</option>
              <option value="arial">Arial</option>
              <option value="garamond">Garamond</option>
            </select>
          </label>
          <label className="field">
            Tamaño
            <select value={bodySize} onChange={(e) => setBodySize(e.target.value)}>
              <option value="10">10 pt</option>
              <option value="10.5">10.5 pt</option>
              <option value="11">11 pt</option>
            </select>
          </label>
          <button className="btn ghost" onClick={refreshPreview}>
            Actualizar vista
          </button>
          <button className="btn" onClick={download}>
            Descargar PDF
          </button>
        </div>
      </div>

      <main className="app-main">
        <section className="pane">
          <div className="pane-head">
            Markdown
            <label className="file-label">
              📂 Cargar .md
              <input
                type="file"
                accept=".md,.markdown,text/markdown,text/plain"
                onChange={handleFile}
              />
            </label>
            <span className="status">{status}</span>
          </div>
          <textarea
            spellCheck={false}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Pega aquí tu CV o documento en Markdown..."
          />
        </section>
        <section className="pane">
          <div className="pane-head">Vista previa</div>
          <iframe title="Vista previa del PDF" srcDoc={previewHtml} />
        </section>
      </main>
    </>
  );
}
