import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/app",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/app",
        destination: "/design/Notion%20Mobile%20App.html",
      },
    ];
  },
};

export default nextConfig;
