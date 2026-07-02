import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix Turbopack workspace root resolution in monorepo
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
