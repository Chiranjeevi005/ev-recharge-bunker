import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable Turbopack for faster builds (already enabled in scripts)
  experimental: {
    // Enable the latest React features
    reactCompiler: false, // Disabled due to missing dependency
    // Optimize server actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Enable partial prerendering for better performance
    ppr: false, // Disabled as it requires canary version
    // Enable cacheComponents for better streaming
    cacheComponents: false, // Disabled as it requires canary version
  },
  // Turbopack optimizations
  turbopack: {
    resolveExtensions: ['.js', '.ts', '.jsx', '.tsx']
  },
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Enable webpack optimizations
  webpack: (config) => {
    // Enable top-level await
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    
    return config;
  },
  // Enable compression for better performance
  compress: true,
  // Enable poweredByHeader for security
  poweredByHeader: false,
  // Enable strict mode for better error handling
  reactStrictMode: true,
};

export default nextConfig;