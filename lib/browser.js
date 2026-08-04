import puppeteer from 'puppeteer';

// Una sola instancia de navegador, reutilizada entre peticiones.
// Se guarda en globalThis para sobrevivir al hot-reload de Next en desarrollo
// (cada recarga de módulo no debe lanzar un Chromium nuevo).
function getBrowser() {
  if (!globalThis.__mdToolsBrowser) {
    globalThis.__mdToolsBrowser = puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return globalThis.__mdToolsBrowser;
}

/**
 * Renderiza un HTML completo a PDF Letter usando la instancia compartida.
 * @param {string} html  HTML autocontenido (con su propio <style>).
 * @returns {Promise<Buffer>}
 */
export async function htmlToPdf(html) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });
    return await page.pdf({
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await page.close();
  }
}
