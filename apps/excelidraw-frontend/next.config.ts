import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        destination: "https://anydraw-frontend.onrender.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
