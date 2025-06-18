/** @type {import('next').NextConfig} */
const nextConfig = {
   experimental: {
    appDir: true,
    viewTransition: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
