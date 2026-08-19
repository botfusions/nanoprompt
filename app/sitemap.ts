import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.aitasvir.com";

const CATEGORIES: Record<string, string> = {
  "🎄 Yılbaşı Kartları": "christmas",
  "Fotoğrafçılık": "photography",
  "Doğa": "nature",
  "Portre": "portrait",
  "Manzara": "landscape",
  "Minimalist": "minimalist",
  "Araç": "vehicle",
  "Karakter": "character",
  "Moda": "fashion",
  "Logo": "logo",
  "Marka": "branding",
  "İllüstrasyon": "illustration",
  "Ürün": "product",
  "Karikatür": "cartoon",
  "Tipografi": "typography",
  "İç Tasarım": "interior",
  "3D": "3d",
  "Retro": "retro",
  "Yaratıcı": "creative",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastUpdated = new Date("2026-05-24");

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: lastUpdated,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/generate`,
      lastModified: lastUpdated,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/hakkimizda`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/iletisim`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/gizlilik`,
      lastModified: lastUpdated,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/kosullar`,
      lastModified: lastUpdated,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: lastUpdated,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog/en-iyi-ai-prompt-yazma-teknikleri`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/blog/flux-vs-sdxl-model-karsilastirmasi`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/blog/portre-fotografciligi-icin-prompt-rehberi`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = Object.entries(CATEGORIES).map(
    ([cat, slug]) => ({
      url: `${BASE_URL}/kategori/${slug}`,
      lastModified: lastUpdated,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })
  );

  return [...staticPages, ...categoryPages];
}
