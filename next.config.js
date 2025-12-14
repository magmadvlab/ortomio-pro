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
  // Removed experimental.turbo - not supported in Next.js 16
  // Turbopack is now the default bundler
}

// In sviluppo, esporta direttamente senza PWA
// In produzione, next-pwa verrà applicato durante il build
export default nextConfig;

