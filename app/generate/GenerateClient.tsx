"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GeneratePage as GeneratePageContent } from "@/components/generate/GeneratePage";

export function GenerateClient() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-gray">
        <GeneratePageContent />
      </main>
      <Footer />
    </>
  );
}
