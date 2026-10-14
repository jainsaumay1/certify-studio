import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack (default in Next.js 16) — resolve browser-incompatible Node modules to empty
  turbopack: {
    resolveAlias: {
      canvas: { browser: "./empty.js" },
    },
  },
};

export default nextConfig;
