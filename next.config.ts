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

    // Añadir compatibilidad con módulos CommonJS y evitar problemas con 'fs'
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
      layers: true,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, // Desactiva el uso de 'fs' que xlsx podría intentar
      path: false,
    };

    return config;
  },
};

export default nextConfig;