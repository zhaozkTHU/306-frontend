/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: { unoptimized: true },
  i18n: {
    locales: ["zh-cn", "en"],
    defaultLocale: "zh-cn",
  },

  async rewrites() {
    return [{
      source: "/api/:path*",
      destination: "https://crowdsourcing-backend-306wins.app.secoder.net/:path*",
      // destination: "http://127.0.0.1:8000/:path*",
      // destination: "https://crowdsourcing-backend.306wins.secoder.local/:path*"
    }];
  }
}

module.exports = nextConfig