import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPrompts } from "@/src/data/prompts";
import { CopyButton } from "./CopyButton";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.aitasvir.com";

// ISR: bu rota cache'siz ("no-store") calisiyordu, yani her istek bir fonksiyon
// calistirip tum tabloyu cekiyordu. 5000+ prompt sayfasi var ve botlar bunlari
// sirayla geziyor - cache olmadan her ziyaret tam maliyet demek.
//
// generateStaticParams bos dizi donuyor: hicbir sayfa build'de onceden
// uretilmiyor (5000+ sayfayi prerender etmek build'i sisirir), ama rota
// "ISR" moduna geciyor - ilk istek render edip cache'liyor, sonrakiler
// CDN'den donuyor. revalidate tek basina bunu yapmiyor, dinamik segment
// generateStaticParams olmadan her zaman on-demand kaliyor.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const prompts = await getAllPrompts();
  const prompt = prompts.find((p) => p.id === id || String(p.displayNumber) === id);

  if (!prompt) {
    return { title: "Prompt Bulunamadi | AITASVIR STUDYO" };
  }

  const title = prompt.title || `Prompt #${String(prompt.displayNumber).padStart(5, "0")}`;
  const description =
    prompt.prompt?.slice(0, 160) || "AI gorsel olusturma promptu.";

  return {
    title: `${title} | AITASVIR STUDYO`,
    description,
    openGraph: {
      title: `${title} | AITASVIR STUDYO`,
      description,
      type: "article",
      locale: "tr_TR",
      url: `/prompt/${id}`,
      images: prompt.images?.[0]
        ? [{ url: prompt.images[0], width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | AITASVIR STUDYO`,
      description,
    },
    alternates: { canonical: `/prompt/${id}` },
  };
}

function CreativeWorkJsonLd({
  prompt,
}: {
  prompt: NonNullable<ReturnType<typeof findPrompt>>;
}) {
  const cardNumber = `#${String(prompt.displayNumber).padStart(5, "0")}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: prompt.title || cardNumber,
    description: prompt.prompt?.slice(0, 300),
    author: {
      "@type": "Person",
      name: prompt.author || "AITASVIR",
    },
    datePublished: prompt.date,
    genre: prompt.categories?.join(", "),
    url: `${BASE_URL}/prompt/${prompt.id}`,
    image: prompt.images?.[0],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

function findPrompt(prompts: Awaited<ReturnType<typeof getAllPrompts>>, id: string) {
  return prompts.find(
    (p) => p.id === id || String(p.displayNumber) === id
  );
}

export default async function PromptDetailPage({ params }: Props) {
  const { id } = await params;
  const prompts = await getAllPrompts();
  const prompt = findPrompt(prompts, id);

  if (!prompt) {
    notFound();
  }

  const cardNumber = `#${String(prompt.displayNumber).padStart(5, "0")}`;
  const imageUrl = prompt.images?.[0];

  return (
    <main className="min-h-screen bg-white">
      <CreativeWorkJsonLd prompt={prompt} />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-brand-black/50 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-cyan transition-colors">
            Ana Sayfa
          </Link>
          <span>/</span>
          <span className="text-brand-black">{prompt.title || cardNumber}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square bg-gray-100 border-2 border-brand-black/10 overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={prompt.title || cardNumber}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-black/30">
                Gorsel mevcut degil
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="text-brand-black/40 text-sm font-mono mb-2">
              {cardNumber}
            </div>
            <h1 className="text-2xl font-black uppercase mb-4 text-brand-black">
              {prompt.title || `Prompt ${cardNumber}`}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-2 mb-4">
              {prompt.categories?.map((cat) => (
                <Link
                  key={cat}
                  href={`/?category=${cat}`}
                  className="bg-brand-cyan/10 border border-brand-cyan/30 px-3 py-1 text-sm font-medium text-brand-cyan hover:bg-brand-cyan/20 transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-brand-black/50 mb-6">
              {prompt.author && <span>Yazar: {prompt.author}</span>}
              {prompt.date && <span>Tarih: {new Date(prompt.date).toLocaleDateString("tr-TR")}</span>}
            </div>

            {/* Prompt Text */}
            <div className="bg-gray-50 border-2 border-brand-black/10 p-4 mb-6">
              <h2 className="font-bold text-sm text-brand-black/60 uppercase mb-2">
                Prompt
              </h2>
              <p className="text-brand-black/80 whitespace-pre-wrap leading-relaxed text-sm">
                {prompt.prompt}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <CopyButton text={prompt.prompt || ""} />
              <Link
                href={`/generate?prompt=${encodeURIComponent(prompt.prompt?.slice(0, 200) || "")}`}
                className="bg-brand-purple text-white font-bold px-6 py-3 border-2 border-brand-black shadow-neo hover:-translate-y-0.5 transition-transform text-sm"
              >
                Gorsel Olustur
              </Link>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-12 pt-8 border-t border-brand-black/10">
          <Link
            href="/"
            className="text-brand-cyan font-bold hover:underline"
          >
            &larr; Tum Promptlara Don
          </Link>
        </div>
      </div>
    </main>
  );
}
