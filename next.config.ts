import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    domains: ["assets.coingecko.com"]
  }
};

export default nextConfig;
