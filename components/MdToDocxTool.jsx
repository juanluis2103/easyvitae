'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadBlob } from '@/lib/download.js';

const SAMPLE = `# Informe de proyecto

## Resumen
Este documento demuestra la conversión de **Markdown** a un documento de **Word (.docx)** editable, conservando títulos, listas, *énfasis* y [enlaces](https://example.com).

## Objetivos
- Mantener la estructura de títulos y secciones.
- Conservar listas con viñetas y numeradas.
- Soportar **negrita**, *cursiva* y \`código\`.

## Pasos
1. Escribe o pega tu Markdown a la izquierda.
2. Revisa la vista previa a la derecha.
3. Descarga el archivo .docx y ábrelo en Word.

## Notas
> Las listas, títulos y estilos se mapean a los estilos nativos de Word, así que el documento queda totalmente editable.
`;

export default function MdToDocxTool() {
  const [markdown, setMarkdown] = useState(SAMPLE);
  const [status, setStatus] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const debounce = useRef(null);

  const refreshPreview = useCallback(async () => {
    try {
      const res = await fetch('/api/docx-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown }),
      });
      setPreviewHtml(await res.text());
    } catch (err) {
      console.error(err);
    }
  }, [markdown]);

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
      setStatus('Escribe o carga un documento primero.');
      return;
    }
    setStatus('Generando DOCX...');
    try {
      const res = await fetch('/api/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, filename: 'document' }),
      });
      if (!res.ok) throw new Error('Fallo al generar');
      downloadBlob(await res.blob(), 'document.docx');
      setStatus('DOCX descargado ✓');
    } catch (err) {
      console.error(err);
      setStatus('Error al generar el DOCX.');
    }
  }

  return (
    <>
      <div className="toolbar">
        <span className="title">.md → DOCX</span>
        <span className="sub">Convierte Markdown a un documento Word (.docx) editable</span>
        <h1 className="visually-hidden">
          Convertidor de Markdown a Word (DOCX) online y gratis (md to docx)
        </h1>
        <div className="controls">
          <button className="btn ghost" onClick={refreshPreview}>
            Actualizar vista
          </button>
          <button className="btn" onClick={download}>
            Descargar DOCX
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
            placeholder="Pega aquí tu documento en Markdown..."
          />
        </section>
        <section className="pane">
          <div className="pane-head">Vista previa</div>
          <iframe title="Vista previa del documento Word" srcDoc={previewHtml} />
        </section>
      </main>
    </>
  );
}
