
/**
 * @format
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Skip building pages that require runtime environment variables
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
