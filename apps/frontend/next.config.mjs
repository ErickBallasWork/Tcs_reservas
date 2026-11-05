// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Vercel-optimized output ──────────────────────────────────────────────
  // "standalone" bundles only the files needed for production, reducing
  // cold-start times on Vercel Serverless Functions.
  output: 'standalone',

  // ── React strict mode ───────────────────────────────────────────────────
  reactStrictMode: true,

  // ── Image optimization ──────────────────────────────────────────────────
  images: {
    // Add any external image domains your app uses, e.g.:
    // domains: ['avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // ── Experimental features ───────────────────────────────────────────────
  experimental: {
    // Enable server actions (Next.js 13.4+)
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },

  // ── Environment variables exposed to the client ─────────────────────────
  // Only NEXT_PUBLIC_* vars are auto-exposed; list additional server-only
  // vars here if needed by middleware.
  env: {},

  // ── Webpack customizations (optional) ───────────────────────────────────
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
