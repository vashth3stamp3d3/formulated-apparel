import type { MetadataRoute } from "next";
import { locations } from "@/lib/locations";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/company-swag",
    "/event-swag",
    "/custom-merch",
    "/design",
    "/how-it-works",
    "/about",
    "/contact",
  ];

  const now = new Date();

  return [
    ...staticRoutes.map((path) => ({
      url: `${site.url}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...locations.map((location) => ({
      url: `${site.url}/locations/${location.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
