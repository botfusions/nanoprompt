import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aitasvir.com";

export const metadata: Metadata = {
  title: {
    default: "AİTASVİR STÜDYO V2 - Yapay Zeka Görsel & Video Promptları",
    template: "%s | AİTASVİR STÜDYO",
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
  authors: [{ name: "AİTASVİR STÜDYO" }],
  creator: "AİTASVİR STÜDYO",
  publisher: "AİTASVİR STÜDYO",
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
    siteName: "AİTASVİR STÜDYO",
    title: "AİTASVİR STÜDYO V2 - Yapay Zeka Görsel & Video Promptları",
    description:
      "En iyi yapay zeka (AI) görsel ve video oluşturma promptları. Ücretsiz kredilerle doğrudan promptlardan imaj ve video üretmeye başlayın.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AİTASVİR STÜDYO V2",
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
