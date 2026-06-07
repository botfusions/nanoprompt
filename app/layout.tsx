import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.aitasvir.com";

export const metadata: Metadata = {
  title: {
    default: "AITASVIR STUDYO V2 - Yapay Zeka Görsel & Video Promptları",
    template: "%s | AITASVIR STUDYO",
  },
  description:
    "En iyi yapay zeka (AI) görsel ve video oluşturma promptları koleksiyonu. Flux, SDXL ve AI video modelleri ile doğrudan promptlardan imaj ve video üretin.",
  keywords: [
    "yapay zeka prompt",
    "aitasvir",
    "ai tasvir",
    "AI prompt",
    "image prompt",
    "AI görsel oluşturucu",
    "AI video oluşturucu",
    "video promptları",
    "yapay zeka video üretimi",
    "prompt koleksiyonu",
    "Flux AI",
    "SDXL",
    "text to image",
    "text to video",
    "görsel prompt",
  ],
  authors: [{ name: "AITASVIR STUDYO" }],
  creator: "AITASVIR STUDYO",
  publisher: "AITASVIR STUDYO",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
    languages: {
      "tr-TR": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: baseUrl,
    siteName: "AITASVIR STUDYO",
    title: "AITASVIR STUDYO V2 - Yapay Zeka Görsel & Video Promptları",
    description:
      "En iyi yapay zeka (AI) görsel ve video oluşturma promptları. Ücretsiz kredilerle doğrudan promptlardan imaj ve video üretmeye başlayın.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AITASVIR STUDYO V2",
    description: "Yapay zeka görsel ve video promptları ve üretim platformu.",
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
  category: "technology",
};

function OrganizationJsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BotFusions",
    url: "https://www.aitasvir.com",
    logo: "https://www.aitasvir.com/images/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@botfusions.com",
      contactType: "customer support",
      availableLanguage: ["Turkish", "English"],
    },
    sameAs: [],
    description:
      "AITASVIR STUDYO - AI gorsel ve video olusturma promptlari koleksiyonu. 3700+ hazir prompt ile yapay zeka gorsel uretimi.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

function WebSiteJsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AITASVIR STUDYO",
    url: "https://www.aitasvir.com",
    description:
      "En iyi yapay zeka gorsel ve video olusturma promptlari koleksiyonu. Flux, SDXL ve AI video modelleri ile dogrudan promptlardan imaj ve video uretin.",
    inLanguage: "tr-TR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.aitasvir.com/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta name="geo.region" content="TR" />
        <meta name="geo.country" content="TR" />
        <meta name="geo.language" content="Turkish" />
        <meta name="language" content="tr-TR" />
        <meta httpEquiv="content-language" content="tr-TR" />
        <link rel="alternate" hrefLang="tr-TR" href={baseUrl} />
        <link rel="alternate" hrefLang="x-default" href={baseUrl} />
        <meta name="theme-color" content="#26C6FF" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://pbs.twimg.com" />
        <link rel="dns-prefetch" href="https://replicate.delivery" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
