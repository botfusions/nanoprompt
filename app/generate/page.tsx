import type { Metadata } from "next";
import { Suspense } from "react";
import { GenerateClient } from "./GenerateClient";

export const metadata: Metadata = {
  title: "AI Görsel & Video Oluşturucu | AİTASVİR STÜDYO - Flux, Video AI ile Profesyonel Tasarımlar",
  description:
    "AI ile saniyeler içinde profesyonel görsel ve videolar oluşturun. Flux Schnell, Flux Pro, SDXL ve yapay zeka video modelleri ile yüksek kaliteli üretim. Ücretsiz kredilerle başlayın.",
  keywords: [
    "AI görsel oluşturucu",
    "AI video oluşturucu",
    "yapay zeka video",
    "aitasvir video",
    "AI image generator",
    "Flux AI",
    "SDXL",
    "AI ile görsel üretme",
    "prompt ile görsel oluşturma",
    "ücretsiz AI görsel",
    "text to image",
    "text to video",
    "yapay zeka görsel",
    "image prompt",
    "tasvir",
  ],
  openGraph: {
    title: "AI Görsel & Video Oluşturucu | AİTASVİR STÜDYO",
    description:
      "AI ile saniyeler içinde profesyonel görsel ve videolar oluşturun. Flux, SDXL ve video modelleri ile ücretsiz başlayın.",
    type: "website",
    locale: "tr_TR",
    siteName: "AİTASVİR STÜDYO",
    url: "/generate",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Görsel & Video Oluşturucu | AİTASVİR STÜDYO",
    description:
      "AI ile saniyeler içinde profesyonel görsel ve videolar oluşturun. Ücretsiz kredilerle başlayın.",
  },
  alternates: {
    canonical: "/generate",
    languages: {
      "tr-TR": "/generate",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "TR",
    "geo.country": "TR",
    "geo.language": "Turkish",
    language: "tr-TR",
  },
};

function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AİTASVİR AI Görsel & Video Oluşturucu",
    description:
      "AI ile saniyeler içinde profesyonel görsel ve videolar oluşturun. Flux, SDXL ve yapay zeka video modelleri desteği.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "TRY",
      lowPrice: "99.90",
      highPrice: "999.90",
      offerCount: 3,
    },
    featureList: [
      "AI görsel oluşturma",
      "AI video oluşturma",
      "Flux Schnell modeli",
      "Flux Pro modeli",
      "SDXL modeli",
      "Yapay zeka video modelleri",
      "Prompt iyileştirme",
      "Farklı boyut desteği",
      "Ücretsiz kredi",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default function GeneratePage() {
  return (
    <>
      <JsonLd />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="h-12 w-12 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
          </div>
        }
      >
        <GenerateClient />
      </Suspense>
    </>
  );
}
