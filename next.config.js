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
  // Assicura che i file di dati siano inclusi nel bundle
  webpack: (config, { isServer }) => {
    // Forza l'inclusione dei file di dati nel bundle client
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    return config;
  },
  // Removed experimental.turbo - not supported in Next.js 16
  // Turbopack is now the default bundler
}

// In sviluppo, esporta direttamente senza PWA
// In produzione, next-pwa verrà applicato durante il build
export default nextConfig;

