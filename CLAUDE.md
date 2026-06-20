# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`.md to PDF` (package `md-to-pdf`) — web app that converts Markdown (.md) to a clean, selectable, ATS-friendly PDF. SEO-targeted at "md to pdf" / "markdown to pdf" search queries.

## Setup

```bash
npm install
npm run dev    # node --watch server.js
```

## Build & Test

```bash
npm start      # node server.js
```

<!-- Add lint/test commands here once configured. -->

## Architecture

Stack: Node + Express (backend), JavaScript vanilla en el navegador (frontend, sin framework), Puppeteer para generar el PDF.

- `server.js` — entry point. Configura Express, valida/sanitiza opciones (fuente, tamaño) y orquesta el pipeline `markdown → HTML → PDF`. Reutiliza una sola instancia de Puppeteer.
- `src/template.js` — convierte Markdown a HTML del CV (`renderResumeHtml`).
- `public/` — frontend estático: `index.html` (estructura), `app.js` (editor, preview en vivo, descarga).

Flujo de datos: el front envía `{ markdown, font, bodySize }` → `/preview` devuelve HTML, `/` (descarga) devuelve PDF → Puppeteer imprime el HTML renderizado a PDF Letter.

## Convenciones de desarrollo y arquitectura

Reglas obligatorias al escribir o modificar código en este repo.

### Modularidad y separación de responsabilidades
- **Una responsabilidad por archivo/módulo.** Si un archivo hace dos cosas claramente distintas (p. ej. parsear Markdown y montar el servidor), sepáralas.
- Mantén separadas las capas: **servidor/rutas** (`server.js`), **lógica de dominio/render** (`src/`), **presentación/cliente** (`public/`). La lógica de negocio nunca vive en el archivo de rutas ni en el HTML.
- El frontend (`public/app.js`) no debe duplicar lógica que ya existe en el backend; si una transformación se necesita en ambos lados, extráela a un módulo compartido.
- Funciones puras siempre que sea posible: entrada → salida, sin efectos secundarios ocultos. Facilita el testeo y la reutilización.

### Componentización y reutilización (templates)
- **Ningún template gigante.** Un HTML o función de render no debe tener miles de hijos anidados en un solo bloque. Si un fragmento crece, divídelo.
- Descompón la UI en piezas pequeñas y reutilizables. Aunque no usemos un framework, modela "componentes" como **funciones de render independientes** que reciben datos y devuelven un fragmento de HTML (string/template literal):
  - `renderCardContainer(children)` — el contenedor.
  - `renderCard(data)` — una tarjeta individual.
  - `renderCardElement(item)` — un elemento dentro de la tarjeta.
  - El contenedor compone tarjetas; la tarjeta compone elementos. Cada nivel es una función aparte.
- **Componer, no anidar a mano.** Una función de render llama a otras funciones de render más pequeñas; nunca escribas el árbol completo inline.
- Si copias y pegas un fragmento de markup más de una vez, conviértelo en una función reutilizable.
- Cada componente recibe sus datos por parámetros (props), no lee estado global. Esto garantiza reutilización y reciclaje de código.

### Estilo de código
- Nombres descriptivos; funciones cortas con una sola tarea.
- Valida y sanitiza toda entrada externa en el backend (ya se hace con fuentes y tamaños — mantén ese patrón).
- Reutiliza recursos costosos (p. ej. la instancia única de Puppeteer); no los recrees por petición.
- Comentarios solo donde aporten el "por qué", no el "qué". Mantén el idioma de los comentarios consistente con el archivo.
