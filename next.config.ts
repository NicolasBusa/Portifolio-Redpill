import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@libsql/client"],
  experimental: {
    serverActions: { bodySizeLimit: "3mb" },
  },
};

export default nextConfig;
