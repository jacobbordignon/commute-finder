import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  eslint: {
    // Allow production builds to complete with warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
