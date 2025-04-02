import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'spwzptuyiuqgrpcamgav.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/photos/**',
      },
    ],
  },
};

export default nextConfig;
