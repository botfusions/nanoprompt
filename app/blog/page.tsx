import type { Metadata } from "next";
import Link from "next/link";
import BlogPost from "./BlogPost";

export const metadata: Metadata = {
  title: "Blog - AI Prompt Rehberleri | AITASVIR STUDYO",
  description:
    "Yapay zeka gorsel olusturma promptlari hakkinda rehberler, ipuclari ve en iyi uygulamalar.",
  openGraph: {
    title: "Blog | AITASVIR STUDYO",
    description: "AI prompt rehberleri ve ipuclari.",
    type: "website",
    locale: "tr_TR",
    url: "/blog",
  },
  alternates: { canonical: "/blog" },
};

const posts = [
  {
    slug: "en-iyi-ai-prompt-yazma-teknikleri",
    title: "En Iyi AI Prompt Yazma Teknikleri",
    excerpt:
      "Yapay zeka ile profesyonel gorseller olusturmak icin prompt yazma tekniklerini ogrenin. Detay, stil ve kompozisyon ipuclari.",
    date: "2026-05-24",
    category: "Rehber",
  },
  {
    slug: "flux-vs-sdxl-model-karsilastirmasi",
    title: "Flux vs SDXL: Hangi AI Modeli Sizin Icin Uygun?",
    excerpt:
      "Flux Schnell, Flux Pro ve SDXL modellerinin karsilastirmali incelemesi. Hangi model hangi senaryolar icin daha uygun?",
    date: "2026-05-24",
    category: "Karsilastirma",
  },
  {
    slug: "portre-fotografciligi-icin-prompt-rehberi",
    title: "Portre Fotografciligi Icin Prompt Rehberi",
    excerpt:
      "AI ile portre gorselleri olusturmak icin en etkili prompt sablonlari ve teknikleri. Isiklandirma, aci ve stil ayarlari.",
    date: "2026-05-24",
    category: "Rehber",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-4xl font-black uppercase mb-2 text-brand-black">
          Blog
        </h1>
        <p className="text-brand-black/60 mb-12">
          AI prompt rehberleri, ipuclari ve en iyi uygulamalar
        </p>

        <div className="space-y-8">
          {posts.map((post) => (
            <BlogPost key={post.slug} post={post} />
          ))}
        </div>

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
