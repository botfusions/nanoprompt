import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.aitasvir.com";

/**
 * 5297 prompt sayfasi var ve botlar bunlari sirayla geziyor - bant genisligi ve
 * fonksiyon maliyeti buradan cikiyor. Ayrim su:
 *
 *  - EGITIM botlari (GPTBot, Google-Extended, Applebot-Extended, CCBot):
 *    sadece model egitimi icin toplarlar, geriye ziyaretci gondermezler.
 *    Kapatmak Google/Bing/ChatGPT arama gorunurlugunu ETKILEMEZ - onlarin ayri
 *    user-agent'lari var. Net kazanc, kayip yok.
 *
 *  - ARAMA/ALINTI botlari (OAI-SearchBot, ClaudeBot, PerplexityBot):
 *    cevaplarinda kaynak gosterip trafik gonderiyorlar. Acik birakiliyor,
 *    sadece hizlari crawl-delay ile sinirlaniyor.
 */
const TRAINING_ONLY_BOTS = [
  "GPTBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
];

const CITING_BOTS = ["OAI-SearchBot", "ClaudeBot", "PerplexityBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
      ...TRAINING_ONLY_BOTS.map((userAgent) => ({
        userAgent,
        disallow: "/",
      })),
      ...CITING_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/api/", "/admin/"],
        crawlDelay: 10,
      })),
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
