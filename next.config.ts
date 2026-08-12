import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "mockup-app-production.up.railway.app" },
      { protocol: "https", hostname: "formulatedprints.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.formulatedprintsapparel.com" }],
        destination: "https://formulatedprintsapparel.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
