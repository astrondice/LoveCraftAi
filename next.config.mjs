/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Prevent server-side bundling of browser-only packages
    if (isServer) {
      config.externals = [...(config.externals || []), 'three', 'gsap', 'lenis']
    }
    return config
  },
}

export default nextConfig
