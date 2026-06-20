# .md tools

Suite de **herramientas online y gratuitas para Markdown y PDF**. La home (`/`) muestra las herramientas en cards; cada una tiene su propia página.

Keywords: `md to pdf` · `md a pdf` · `markdown to pdf` · `pdf to md` · `pdf a markdown` · `md to docx` (próximamente).

## Herramientas

| Herramienta | Ruta | Estado | Qué hace |
|-------------|------|--------|----------|
| **.md → PDF** | `/md-to-pdf.html` | ✅ | Convierte Markdown a un PDF limpio, seleccionable y ATS-friendly. |
| **PDF → .md** | `/pdf-to-md.html` | ✅ | Sube un PDF, extrae su texto y devuelve Markdown editable (detecta títulos y listas). |
| .md → DOCX / PDF → DOCX / Unir PDF / Editor | — | 🔜 | Cards "Próximamente" en la home. |

### .md → PDF
El PDF resultante:
- Una sola columna, sin tablas, columnas, iconos, fotos ni colores llamativos.
- Texto negro real y **seleccionable** (no es imagen), por eso los ATS lo leen bien.
- Fuentes estándar: Calibri / Arial / Garamond. Cuerpo 10–11 pt, nombre ~22 pt.
- Márgenes ~0.6", tamaño Letter.

### PDF → .md
Extrae el texto del PDF con `pdfjs-dist` y lo convierte a Markdown con heurísticas:
títulos según el tamaño de fuente (y mayúsculas), viñetas a partir de los marcadores
de lista (`•`, `-`, …). No hace OCR: los **PDFs escaneados (imagen)** sin capa de texto
devuelven un error indicándolo.

El PDF resultante:
- Una sola columna, sin tablas, columnas, iconos, fotos ni colores llamativos.
- Texto negro real y **seleccionable** (no es imagen), por eso los ATS lo leen bien.
- Fuentes estándar: Calibri / Arial / Garamond. Cuerpo 10–11 pt, nombre ~22 pt.
- Márgenes ~0.6", tamaño Letter.

## Requisitos
- Node.js 18+ (probado en v24).

## Instalación
```bash
npm install
```
> La primera instalación descarga Chromium (lo usa Puppeteer para generar el PDF).

## Uso
```bash
npm start
```
Abre <http://localhost:3000> para ver la home con las herramientas. O entra directo a
`/md-to-pdf.html` o `/pdf-to-md.html`.

## Estructura esperada del Markdown
| Markdown | Se renderiza como |
|----------|-------------------|
| `# Nombre` | Nombre (centrado, grande) |
| Párrafo justo debajo del `#` | Línea de contacto (centrada): LinkedIn \| GitHub \| Email \| Tel \| Ciudad |
| `## SECCIÓN` | Encabezado de sección con línea inferior (SUMMARY, SKILLS, EXPERIENCE, PROJECTS, EDUCATION) |
| `### Empresa — Cargo \| fechas` | Sub-encabezado en negrita |
| `- viñeta` | Logros cuantificados |
| `**Languages:** ...` | Negrita inline para etiquetas de skills |

## API
- `POST /generate` — body JSON `{ markdown, font?, bodySize?, filename? }` **o** `multipart/form-data` con campo `file` (.md). Devuelve el PDF.
- `POST /preview` — body JSON `{ markdown, font?, bodySize? }`. Devuelve el HTML estilizado.
- `POST /extract` — `multipart/form-data` con campo `file` (.pdf). Devuelve JSON `{ markdown, filename }`.

`font`: `calibri` (default) | `arial` | `garamond`. `bodySize`: 9–12 (default 10.5).

## Cómo funciona
- **md → PDF:** Markdown → HTML (`marked`) → plantilla CSS ATS → PDF con texto real (`puppeteer`).
- **PDF → md:** PDF → capa de texto (`pdfjs-dist`) → heurísticas de títulos/listas → Markdown (`src/pdf-to-markdown.js`).
