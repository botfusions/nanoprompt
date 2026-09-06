"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GeneratePage as GeneratePageContent } from "@/components/generate/GeneratePage";

export function GenerateClient() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-gray">
        {/* SEO: görsel olarak gizli H1 — /generate sayfasında H1 eksikti */}
        <h1 className="sr-only">AI Görsel &amp; Video Oluşturucu — AITASVIR STUDYO</h1>
        <GeneratePageContent />
      </main>
      <Footer />
    </>
  );
}
