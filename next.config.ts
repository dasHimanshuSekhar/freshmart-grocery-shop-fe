import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",   // 👈 tells Next.js to generate static HTML
  trailingSlash: true, // optional but helps with Firebase hosting
};

export default nextConfig;
