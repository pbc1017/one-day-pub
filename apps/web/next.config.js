/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@kamf/interface'],
  eslint: {
    dirs: ['src'],
  },
};

export default nextConfig;
