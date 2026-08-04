# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`.md tools` (package `md-to-pdf`) — suite web que convierte entre Markdown y PDF: **md → PDF** (limpio, seleccionable, ATS-friendly), **md → DOCX** (Word editable) y **PDF → md** (extrae texto). SEO-orientada a "md to pdf", "markdown to docx", "pdf to md" y similares.

## Setup

```bash
npm install
npm run dev    # next dev (http://localhost:3000)
```

## Build & Test

```bash
npm run build  # next build
npm start      # next start (sirve el build de producción)
```

<!-- Add lint/test commands here once configured. -->

## Architecture

Stack: **Next.js 14 (App Router, JavaScript)**. SSR para las páginas (SEO) + Route Handlers como backend. Puppeteer (PDF), `docx` (Word) y `pdfjs-dist` (extracción de PDF) corren en Node.

Capas:
- `src/` — **lógica de dominio**, agnóstica del framework. `template.js` (`renderResumeHtml`: md→HTML del CV), `markdown-to-docx.js` (`markdownToDocx` + `renderDocxPreviewHtml`), `pdf-to-markdown.js` (`pdfBufferToMarkdown`).
- `lib/` — **helpers de servidor/cliente**: `browser.js` (instancia única de Puppeteer, `htmlToPdf`), `options.js` (sanitización), `request.js` (lee JSON o `.md` subido), `schema.js` (JSON-LD), `download.js` (descarga en navegador).
- `app/api/*/route.js` — **rutas** (capa fina): `preview`, `generate` (PDF), `docx`, `docx-preview`, `extract`. Validan/sanitizan y delegan en `src/`.
- `app/*/page.jsx` — **páginas** (Server Components) con su `metadata` SEO; renderizan los componentes de herramienta.
- `components/` — **presentación**. Server Components (`TopNav`, `Footer`, `ToolGrid`/`ToolCard`, `JsonLd`) y Client Components interactivos (`MdToPdfTool`, `MdToDocxTool`, `PdfToMdTool`, marcados con `'use client'`).
- `app/globals.css` — sistema de diseño (editorial claro). Fuente display Fraunces vía `next/font` (auto-hospedada).

Flujo de datos (md → PDF): el cliente envía `{ markdown, font, bodySize }` → `POST /api/preview` devuelve HTML (iframe) y `POST /api/generate` devuelve el PDF → Puppeteer imprime el HTML a PDF Letter. md → DOCX y PDF → md siguen el mismo patrón con sus rutas.

## Convenciones de desarrollo y arquitectura

Reglas obligatorias al escribir o modificar código en este repo.

### Modularidad y separación de responsabilidades
- **Una responsabilidad por archivo/módulo.** Si un archivo hace dos cosas claramente distintas (p. ej. parsear Markdown y montar el servidor), sepáralas.
- Mantén separadas las capas: **rutas** (`app/api/*/route.js`, finas), **lógica de dominio** (`src/`), **helpers** (`lib/`), **presentación** (`app/*/page.jsx` + `components/`). La lógica de negocio nunca vive en una ruta ni en un componente.
- El cliente (Client Components) no debe duplicar lógica que ya existe en el backend; si una transformación se necesita en ambos lados, extráela a un módulo compartido en `lib/`.
- Funciones puras siempre que sea posible: entrada → salida, sin efectos secundarios ocultos. Facilita el testeo y la reutilización.

### Componentización y reutilización (templates)
- **Ningún template gigante.** Un HTML o función de render no debe tener miles de hijos anidados en un solo bloque. Si un fragmento crece, divídelo.
- Descompón la UI en **componentes React pequeños y reutilizables**, cada uno en su archivo bajo `components/`:
  - `ToolGrid` — el contenedor (compone tarjetas a partir de datos).
  - `ToolCard` — una tarjeta individual.
  - `Icons` — los elementos/iconos.
  - El contenedor compone tarjetas; la tarjeta compone elementos. Cada nivel es un componente aparte.
- **Componer, no anidar a mano.** Una función de render llama a otras funciones de render más pequeñas; nunca escribas el árbol completo inline.
- Si copias y pegas un fragmento de markup más de una vez, conviértelo en una función reutilizable.
- Cada componente recibe sus datos por parámetros (props), no lee estado global. Esto garantiza reutilización y reciclaje de código.

### Estilo de código
- Nombres descriptivos; funciones cortas con una sola tarea.
- Valida y sanitiza toda entrada externa en el backend (ya se hace con fuentes y tamaños — mantén ese patrón).
- Reutiliza recursos costosos (p. ej. la instancia única de Puppeteer); no los recrees por petición.
- Comentarios solo donde aporten el "por qué", no el "qué". Mantén el idioma de los comentarios consistente con el archivo.
