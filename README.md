# easyvitae

App web que convierte un CV en **Markdown** a un **PDF limpio y ATS-friendly** (formato USA para Software Engineer).

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
Abre <http://localhost:3000>. Luego:
1. Pega tu CV en Markdown o carga un archivo `.md`.
2. Ajusta fuente y tamaño; mira la vista previa en vivo.
3. **Descargar PDF**.

Hay un CV de ejemplo cargado al abrir; también está en [`sample-cv.md`](sample-cv.md).

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

`font`: `calibri` (default) | `arial` | `garamond`. `bodySize`: 9–12 (default 10.5).

## Cómo funciona
Markdown → HTML (`marked`) → plantilla CSS ATS → PDF con texto real (`puppeteer`).
