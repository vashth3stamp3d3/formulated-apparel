import type { NextConfig } from "next";
import blogRedirects from "./scripts/blog-redirects.json";

const mockupAppUrl = (
  process.env.NEXT_PUBLIC_MOCKUP_APP_URL ||
  "https://mockup-app-production.up.railway.app"
).replace(/\/+$/, "");

const prunedBlogRedirects = Object.entries(blogRedirects).map(
  ([from, to]) => ({
    source: `/blog/${from}`,
    destination: `/blog/${to}`,
    permanent: true,
  }),
);

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
      ...prunedBlogRedirects,
    ];
  },
  async rewrites() {
    // Shopify app-proxy paths used by the mockup editor → Mockup App on Railway
    return [
      {
        source: "/apps/mockup/:path*",
        destination: `${mockupAppUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
