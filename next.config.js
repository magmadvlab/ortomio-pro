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
  // Configurazione Turbopack vuota per silenziare warning
  turbopack: {},
  // Configurazione webpack per compatibilità
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

// In sviluppo, esporta direttamente senza PWA
// In produzione, next-pwa verrà applicato durante il build
export default nextConfig;

