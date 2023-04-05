/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: { unoptimized: true },

  async rewrites() {
    return [{
      source: "/api/:path*",
      destination: "https://crowdsourcing-backend-306wins.app.secoder.net/:path*",
    }];
  }
}

module.exports = nextConfig
