import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "export", // enables static export in Next.js 15
};

export default nextConfig;
