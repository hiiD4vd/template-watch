import { readFileSync } from 'node:fs';

const assets = JSON.parse(
  readFileSync(new URL('./src/config/assets.json', import.meta.url), 'utf8'),
);
const assetBaseUrl = (
  process.env.NEXT_PUBLIC_WATCH_ASSET_BASE_URL || assets.baseUrl
).replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: `${assetBaseUrl}/branding/favicon.ico?v=${assets.release}`,
        permanent: false,
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({ test: /\.glsl$/, type: 'asset/source' });
    return config;
  },
};

export default nextConfig;
