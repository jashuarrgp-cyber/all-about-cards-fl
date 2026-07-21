import type { NextConfig } from 'next';
import { securityHeaders } from './src/lib/security/headers';
const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  images: {
    // Official public card images for live pricing search.
    remotePatterns: [{ protocol: 'https', hostname: 'images.pokemontcg.io' }],
  },
};
export default nextConfig;
