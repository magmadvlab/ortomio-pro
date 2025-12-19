/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Turbopack è il bundler di default in Next.js 16
  // I file di dati (plantMasterSheets.ts, varietyMappings.ts, ecc.) 
  // vengono automaticamente inclusi nel bundle tramite import statici
  turbopack: {},
}

// In sviluppo, esporta direttamente senza PWA
// In produzione, next-pwa verrà applicato durante il build
export default nextConfig;

