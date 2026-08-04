'use client';

import { useRef, useState } from 'react';
import { downloadBlob } from '@/lib/download.js';

export default function PdfToMdTool() {
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [ready, setReady] = useState(false);
  const baseName = useRef('document');
  const fileInput = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
      setStatus('Selecciona un archivo PDF.');
      return;
    }

    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(URL.createObjectURL(file));
    setStatus(`Extrayendo "${file.name}"...`);

    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/extract', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(data.error || 'No se pudo procesar el PDF.');
        return;
      }
      baseName.current = (data.filename || 'document').replace(/[^a-z0-9_-]+/gi, '_') || 'document';
      setOutput(data.markdown || '');
      setReady(true);
      setStatus(`Listo ✓ — ${file.name}`);
    } catch (err) {
      console.error(err);
      setStatus('Error de red al procesar el PDF.');
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer?.files?.[0]);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setStatus('Markdown copiado ✓');
    } catch {
      setStatus('No se pudo copiar.');
    }
  }

  function download() {
    const blob = new Blob([output], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `${baseName.current}.md`);
    setStatus(`Descargado: ${baseName.current}.md`);
  }

  return (
    <>
      <div className="toolbar">
        <span className="title">PDF → .md</span>
        <span className="sub">Sube un PDF y extrae su texto a Markdown editable</span>
        <h1 className="visually-hidden">Convertir PDF a Markdown online y gratis (pdf to md)</h1>
        <div className="controls">
          <label className="file-label">
            📂 Cargar otro PDF
            <input
              ref={fileInput}
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
          <button className="btn ghost" onClick={copy} disabled={!ready}>
            Copiar
          </button>
          <button className="btn" onClick={download} disabled={!ready}>
            Descargar .md
          </button>
        </div>
      </div>

      <main className="app-main">
        <section className="pane">
          <div className="pane-head">PDF original</div>
          {pdfUrl ? (
            <iframe title="Vista previa del PDF" src={pdfUrl} />
          ) : (
            <div
              className={`dropzone${dragging ? ' drag' : ''}`}
              onClick={() => fileInput.current?.click()}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragging(false);
              }}
              onDrop={onDrop}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M12 18v-6" />
                <path d="M9 15l3-3 3 3" />
              </svg>
              <span className="big">Arrastra tu PDF aquí</span>
              <span>o haz clic para seleccionar un archivo · máx. 2&nbsp;MB</span>
            </div>
          )}
        </section>

        <section className="pane">
          <div className="pane-head">
            Markdown (.md)
            <span className="status">{status}</span>
          </div>
          <textarea
            spellCheck={false}
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder="El Markdown extraído aparecerá aquí..."
          />
        </section>
      </main>
    </>
  );
}
