import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.aitasvir.com";

const ARTICLES: Record<string, {
  title: string;
  description: string;
  date: string;
  category: string;
  content: string[];
}> = {
  "en-iyi-ai-prompt-yazma-teknikleri": {
    title: "En Iyi AI Prompt Yazma Teknikleri",
    description: "Yapay zeka ile profesyonel gorseller olusturmak icin prompt yazma tekniklerini ogrenin.",
    date: "2026-05-24",
    category: "Rehber",
    content: [
      "Yapay zeka (AI) gorsel olusturucular, dogru promptlar kullanildiginda inanilmaz sonuclar uretebilir. Bu rehberde, profesyonel kalitede gorseller olusturmak icin kullanabileceginiz en etkili prompt yazma tekniklerini paylasacagiz.",
      "## 1. Detayli Aciklamalar Kullanin",
      "AI modelleri ne kadar fazla bilgi alirsa, o kadar iyi sonuclar verir. 'Bir kedi' yerine 'Altin saclarli, yesil gozlu bir Scottish Fold kedi, yumusak dogal isikta, hafif bulanik arka plan, profesyonel portre fotografciligi' seklinde detayli aciklamalar kullanin.",
      "## 2. Stil Belirtin",
      "Gorsel stilini belirtmek sonuclari onemli olcude iyilestirir: 'fotorealistik', 'dijital sanat', 'sulu boya', 'minimalist', '3D render' gibi stiller deneyin.",
      "## 3. Isiklandirma ve Kompozisyon Ekleyin",
      "'Altin saat isigi', 'studio aydinlatma', 'dramatik golgeler' gibi isiklandirma terimleri ve 'yakin cekim', 'genis aci', 'kus bakisi' gibi kompozisyon ifadeleri kullanin.",
      "## 4. Negatif Promptlar Kullanin",
      "Istemediginiz ogeleri belirterek sonuclari iyilestirebilirsiniz: 'bulanik, bozuk yuzlar, metin, watermark olmasin' gibi negatif ifadeler ekleyin.",
      "## 5. Referans Sanatci ve Eserlerden Bahsedin",
      "'Van Gogh tarzinda', 'Studio Ghibli animasyon stilinde', 'Ansel Adams'in manzara fotografciligi tarzinda' gibi referanslar kullanin.",
    ],
  },
  "flux-vs-sdxl-model-karsilastirmasi": {
    title: "Flux vs SDXL: Hangi AI Modeli Sizin Icin Uygun?",
    description: "Flux Schnell, Flux Pro ve SDXL modellerinin karsilastirmali incelemesi.",
    date: "2026-05-24",
    category: "Karsilastirma",
    content: [
      "AITASVIR STUDYO platformunda uc farkli AI modeli bulunmaktadir: Flux Schnell, Flux Pro ve SDXL. Her birinin farkli guclu yonleri ve kullanim senaryolari vardir.",
      "## Flux Schnell (1 Kredi)",
      "En hizli model olan Flux Schnell, 5-10 saniye icinde sonuclar uretir. Hizli prototipleme, konsept calismalari ve basit gorseller icin idealdir. Kredi maliyeti en dusuktur.",
      "## SDXL (2 Kredi)",
      "Stability AI'nin SDXL modeli, daha detayli ve sanatsal sonuclar uretir. Illüstrasyon, karikatur ve yaratici calismalar icin guclu bir secenektir. 10-20 saniye surer.",
      "## Flux Pro (3 Kredi)",
      "En gelismis model olan Flux Pro, en yuksek kaliteli sonuclari uretir. Profesyonel fotografcilik, urun gorselleri ve marka icerikleri icin en iyi secenektir. 15-30 saniye surer.",
      "## Hangisini Secmelisiniz?",
      "Hizli deneme icin Schnell, detayli calismalar icin SDXL, profesyonel sonuclar icin Pro modelini tercih edin. Ucretsiz 3 baslangic kredinizle her modeli deneyebilirsiniz.",
    ],
  },
  "portre-fotografciligi-icin-prompt-rehberi": {
    title: "Portre Fotografciligi Icin Prompt Rehberi",
    description: "AI ile portre gorselleri olusturmak icin en etkili prompt sablonlari.",
    date: "2026-05-24",
    category: "Rehber",
    content: [
      "Yapay zeka ile portre gorselleri olusturmak, dogru promptlari bildiginizde cok kolaydir. Bu rehber, profesyonel kalitede portre gorselleri icin ihtiyaciniz olan tum bilgileri icerir.",
      "## Isiklandirma Teknikleri",
      "Portre fotografciliginin en onemli ogesi isiklandirmadir. AI modeller icin etkili isiklandirma promptlari: 'Rembrandt isigi', 'kelebek isiklandirma', 'split isik', 'yumuşak ambient isik', 'altin saat isigi'.",
      "## Kamera Acilari",
      "Farkli acilar farkli hisler uyandirir: 'goz seviyesinden cekim', 'hafif yukaridan bakis', 'yan profil', 'yakin cekim (close-up)', 'ortayakin (medium shot)'.",
      "## Derinlik ve Arka Plan",
      "Profesyonel portrelerin sirri: 'hafif bulanik arka plan (bokeh)', 'f/1.8 diyafram', 'dalgali saclar ve yumusak odak'. Arka plan ogelerini kontrol etmek sonuclari iyilestirir.",
      "## Duygu ve Ifade",
      "Portrelerin ruhu ifadelerdedir: 'dusunceli bakis', 'sicak tebessum', 'kararli bakislar', 'dogal gulumseme'. Duygu ifadeleri promptlarda onemli bir detaydir.",
      "## Ornek Prompt",
      "'Profesyonel portre fotografciligi, genc kadin, dogal isiklandirma, hafif bulanik yesil arka plan, f/1.4 diyafram, sicak tonlar, Goz seviyesi cekim, samimi tebessum, 85mm lens, photorealistik, 4K kalite.'",
    ],
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES[slug];

  if (!article) {
    return { title: "Makale Bulunamadi | AITASVIR STUDYO" };
  }

  return {
    title: `${article.title} | AITASVIR STUDYO Blog`,
    description: article.description,
    openGraph: {
      title: `${article.title} | AITASVIR STUDYO`,
      description: article.description,
      type: "article",
      locale: "tr_TR",
      url: `/blog/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
    alternates: { canonical: `/blog/${slug}` },
  };
}

export async function generateStaticParams() {
  return Object.keys(ARTICLES).map((slug) => ({ slug }));
}

function ArticleJsonLd({
  article,
  slug,
}: {
  article: (typeof ARTICLES)[string];
  slug: string;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Organization",
      name: "AITASVIR STUDYO",
    },
    publisher: {
      "@type": "Organization",
      name: "BotFusions",
    },
    url: `${BASE_URL}/blog/${slug}`,
    mainEntityOfPage: `${BASE_URL}/blog/${slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = ARTICLES[slug];

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <ArticleJsonLd article={article} slug={slug} />
      <article className="container mx-auto max-w-3xl px-4 py-16">
        {/* Breadcrumb */}
        <nav className="text-sm text-brand-black/50 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-cyan transition-colors">
            Ana Sayfa
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-brand-cyan transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-brand-black">{article.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-brand-cyan/10 text-brand-cyan text-xs font-bold px-3 py-1 border border-brand-cyan/30">
              {article.category}
            </span>
            <time className="text-sm text-brand-black/40" dateTime={article.date}>
              {new Date(article.date).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-brand-black">
            {article.title}
          </h1>
        </header>

        {/* Content */}
        <div className="prose max-w-none space-y-6 text-brand-black/80 leading-relaxed">
          {article.content.map((paragraph, i) => {
            if (paragraph.startsWith("## ")) {
              return (
                <h2 key={i} className="text-2xl font-bold mt-8 mb-3 text-brand-black">
                  {paragraph.replace("## ", "")}
                </h2>
              );
            }
            return (
              <p key={i} className="leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Back Links */}
        <div className="mt-12 pt-8 border-t border-brand-black/10 flex gap-6">
          <Link
            href="/blog"
            className="text-brand-cyan font-bold hover:underline"
          >
            &larr; Blog
          </Link>
          <Link
            href="/"
            className="text-brand-cyan font-bold hover:underline"
          >
            &larr; Ana Sayfa
          </Link>
        </div>
      </article>
    </main>
  );
}
