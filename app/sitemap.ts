import { MetadataRoute } from "next";
import { CATEGORIES, CATEGORY_MAP } from "@/src/data/prompts";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.aitasvir.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/generate`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES
    .filter((cat) => cat !== "Tümü")
    .map((cat) => ({
      url: `${BASE_URL}/?category=${encodeURIComponent(CATEGORY_MAP[cat] || cat)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

  return [...staticPages, ...categoryPages];
}
