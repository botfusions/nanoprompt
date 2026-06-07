import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hakkimizda - AITASVIR STUDYO",
  description:
    "AITASVIR STUDYO hakkinda. BotFusions tarafindan gelistirilen AI gorsel ve video olusturma promptlari platformu.",
  openGraph: {
    title: "Hakkimizda | AITASVIR STUDYO",
    description: "AITASVIR STUDYO hakkinda bilgi edinin.",
  },
  alternates: { canonical: "/hakkimizda" },
};

export default function HakkimizdaPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-black uppercase mb-8 text-brand-black">
          Hakkimizda
        </h1>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Biz Kimiz?</h2>
          <p className="text-brand-black/80 leading-relaxed mb-4">
            AITASVIR STUDYO, BotFusions tarafindan gelistirilen bir yapay zeka
            gorsel ve video olusturma platformudur. Amacimiz, herkesin yapay zeka
            ile profesyonel kalitede gorseller ve videolar olusturabilmesini
            saglamaktir.
          </p>
          <p className="text-brand-black/80 leading-relaxed">
            3700&rsquo;den fazla hazir prompt sablonu ile kullanicilarimiz,
            Flux, SDXL ve diger AI modellerini kullanarak saniyeler icinde
            kaliteli gorseller uretebilir.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Misyonumuz</h2>
          <p className="text-brand-black/80 leading-relaxed mb-4">
            Yapay zeka teknolojisini herkesin erisimine sunmak. Karmasik AI
            modellerini basit ve etkili promptlar ile kullanilabilir hale
            getirmek.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Teknoloji</h2>
          <ul className="list-disc list-inside space-y-2 text-brand-black/80">
            <li>Next.js 16, React 19</li>
            <li>Supabase (PostgreSQL)</li>
            <li>Firebase Authentication</li>
            <li>Replicate AI (Flux, SDXL)</li>
            <li>Google Gemini (Prompt Iyilestirme)</li>
            <li>PayTR Odeme Sistemi</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Gelistirici</h2>
          <p className="text-brand-black/80 leading-relaxed">
            <strong>BotFusions</strong> — yazilim gelistirme ve yapay zeka
            cozumleri sirketi.
          </p>
          <p className="text-brand-black/80 mt-2">
            E-posta:{" "}
            <a
              href="mailto:info@botfusions.com"
              className="text-brand-cyan underline"
            >
              info@botfusions.com
            </a>
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-brand-black/10">
          <Link
            href="/"
            className="text-brand-cyan font-bold hover:underline"
          >
            &larr; Ana Sayfaya Don
          </Link>
        </div>
      </div>
    </main>
  );
}
