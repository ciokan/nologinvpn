import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getAllPageSlugs } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const contentPages: MetadataRoute.Sitemap = getAllPageSlugs().map((slug) => ({
    url: `${base}/p/${slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.4,
  }));

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/access`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // Content pages (privacy policy, terms, etc.)
    ...contentPages,
    // /dashboard and /api/* are intentionally excluded — private + dynamic
  ];
}
