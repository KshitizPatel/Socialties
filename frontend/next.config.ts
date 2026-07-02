import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix Turbopack workspace root resolution in monorepo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(({ experimental: { turbo: { root: path.resolve(__dirname) } } }) as any),
};

export default nextConfig;
