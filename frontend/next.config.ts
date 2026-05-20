import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Allow images from any Supabase storage bucket
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      // Allow images from your Laravel storage (adjust when backend is live)
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
