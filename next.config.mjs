/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow large file uploads (100 MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;
