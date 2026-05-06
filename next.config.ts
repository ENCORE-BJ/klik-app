import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // This tells Next.js to stop being so strict while we are building
    allowedDevOrigins: ["*"], 
  },
};

export default nextConfig;