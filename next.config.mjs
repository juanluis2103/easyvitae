/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // no filtrar la versión del framework

  // Dependencias pesadas que deben ejecutarse en Node (no empaquetar para el bundle).
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', 'pdfjs-dist'],
  },

  // Cabeceras de seguridad por defecto en toda la app.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;