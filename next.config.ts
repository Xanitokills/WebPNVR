import type { NextConfig } from "next";

declare module "next" {
  interface NextConfig {
    serverActions?: {
      bodySizeLimit?: string | number;
    };
  }
}

const nextConfig: NextConfig = {
  serverActions: {
    bodySizeLimit: "10mb",
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;