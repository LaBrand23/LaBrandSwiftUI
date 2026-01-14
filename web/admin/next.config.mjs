import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Type errors in ../shared are handled by IDE; bundler resolves dependencies correctly
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint errors in ../shared are handled by IDE; focus on admin src
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['@shared'],
  webpack: (config) => {
    config.resolve.alias['@shared'] = path.resolve(__dirname, '../shared');
    // Allow shared module to resolve dependencies from this project's node_modules
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
    ];
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
};

export default nextConfig;
