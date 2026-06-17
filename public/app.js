const editor = document.getElementById('editor');
const fontSel = document.getElementById('font');
const sizeSel = document.getElementById('bodySize');
const preview = document.getElementById('preview');
const status = document.getElementById('status');
const fileInput = document.getElementById('fileInput');

function currentOptions() {
  return {
    markdown: editor.value,
    font: fontSel.value,
    bodySize: sizeSel.value,
  };
}

async function refreshPreview() {
  try {
    const res = await fetch('/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentOptions()),
    });
    const html = await res.text();
    preview.srcdoc = html;
  } catch (err) {
    console.error(err);
  }
}

let debounce;
function scheduleRefresh() {
  clearTimeout(debounce);
  debounce = setTimeout(refreshPreview, 350);
}

editor.addEventListener('input', scheduleRefresh);
fontSel.addEventListener('change', refreshPreview);
sizeSel.addEventListener('change', refreshPreview);
document.getElementById('refresh').addEventListener('click', refreshPreview);

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  editor.value = text;
  status.textContent = `Cargado: ${file.name}`;
  refreshPreview();
});

document.getElementById('download').addEventListener('click', async () => {
  if (!editor.value.trim()) {
    status.textContent = 'Escribe o carga un CV primero.';
    return;
  }
  status.textContent = 'Generando PDF...';
  try {
    const res = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...currentOptions(), filename: 'resume' }),
    });
    if (!res.ok) throw new Error('Fallo al generar');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    status.textContent = 'PDF descargado ✓';
  } catch (err) {
    console.error(err);
    status.textContent = 'Error al generar el PDF.';
  }
});

// CV de ejemplo para arrancar.
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

editor.value = SAMPLE;
refreshPreview();
