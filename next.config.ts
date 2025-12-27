import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile drizzle-orm for proper module resolution
  transpilePackages: ["drizzle-orm"],

  // Server external packages
  serverExternalPackages: ["@neondatabase/serverless"],
};

export default nextConfig;
