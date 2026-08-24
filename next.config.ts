import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [ 
      {
        source: '/api/:path*',
        destination: 'https://negus-gebeya-api.onrender.com/api/:path*', // proxy to backend
      },
    ];
  },
};

export default nextConfig;