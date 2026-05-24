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
  "Awesome GPT": "awesome-gpt",
};

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

  const categoryPages: MetadataRoute.Sitemap = Object.entries(CATEGORIES).map(
    ([cat, slug]) => ({
      url: `${BASE_URL}/?category=${encodeURIComponent(slug)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })
  );

  return [...staticPages, ...categoryPages];
}
