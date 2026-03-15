import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the app root to this repo so Turbopack does not walk parent lockfiles.
    root: process.cwd()
  },
  images: {
    formats: ["image/avif", "image/webp"],
    domains: ["assets.coingecko.com"]
  }
};

export default nextConfig;
