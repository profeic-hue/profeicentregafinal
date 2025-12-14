/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // ELIMINADO: Bloqueaba la API de IA
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;