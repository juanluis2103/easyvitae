const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const output = document.getElementById('output');
const pdfPreview = document.getElementById('pdfPreview');
const status = document.getElementById('status');
const copyBtn = document.getElementById('copy');
const downloadBtn = document.getElementById('download');

let baseName = 'document';
let pdfUrl = null;

// Muestra el PDF subido en el panel izquierdo.
function showPdf(file) {
  if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  pdfUrl = URL.createObjectURL(file);
  pdfPreview.src = pdfUrl;
  dropzone.style.display = 'none';
  pdfPreview.style.display = '';
}

function enableActions() {
  copyBtn.disabled = false;
  downloadBtn.disabled = false;
}

async function handleFile(file) {
  if (!file) return;
  if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
    status.textContent = 'Selecciona un archivo PDF.';
    return;
  }
  showPdf(file);
  status.textContent = `Extrayendo "${file.name}"...`;

  const form = new FormData();
  form.append('file', file);

  try {
    const res = await fetch('/extract', { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      status.textContent = data.error || 'No se pudo procesar el PDF.';
      return;
    }
    baseName = (data.filename || 'document').replace(/[^a-z0-9_-]+/gi, '_') || 'document';
    output.value = data.markdown || '';
    enableActions();
    status.textContent = `Listo ✓ — ${file.name}`;
  } catch (err) {
    console.error(err);
    status.textContent = 'Error de red al procesar el PDF.';
  }
}

// --- Drag & drop ---
dropzone.addEventListener('click', () => fileInput.click());
['dragenter', 'dragover'].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add('drag');
  })
);
['dragleave', 'drop'].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag');
  })
);
dropzone.addEventListener('drop', (e) => {
  const file = e.dataTransfer?.files?.[0];
  handleFile(file);
});

fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

// --- Copiar (en formato Markdown) ---
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(output.value);
    status.textContent = 'Markdown copiado ✓';
  } catch {
    output.select();
    document.execCommand('copy');
    status.textContent = 'Markdown copiado ✓';
  }
});

// --- Descargar .md ---
downloadBtn.addEventListener('click', () => {
  const blob = new Blob([output.value], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  status.textContent = `Descargado: ${baseName}.md`;
});
