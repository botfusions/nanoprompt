import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPrompts, CATEGORY_MAP } from "@/src/data/prompts";
import { matchesCategorySlug } from "@/src/data/filter";
import CategoryPageClient from "./CategoryPageClient";

export const revalidate = 86400; // ISR: 24 saatte bir revalidate

// Ana sayfadaki ile ayni sebep: tum kategori listesini client component prop'u
// olarak gecmek RSC payload'ini HTML'e gomuyordu (buyuk kategorilerde 329 KB).
// Kalani /api/prompts?slug=... uzerinden lazy geliyor.
const INITIAL_PAGE_SIZE = 32;

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.aitasvir.com";

const SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([tr, en]) => [en, tr])
);

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = SLUG_TO_CATEGORY[slug];

  if (!categoryName) {
    return { title: "Kategori Bulunamadi | AITASVIR STUDYO" };
  }

  return {
    title: `${categoryName} Promptlari | AITASVIR STUDYO`,
    description: `${categoryName} kategorisindeki AI gorsel olusturma promptlari. En iyi ${categoryName.toLowerCase()} promptlari ile profesyonel gorseller olusturun.`,
    openGraph: {
      title: `${categoryName} Promptlari | AITASVIR STUDYO`,
      description: `${categoryName} kategorisindeki AI promptlari.`,
      type: "website",
      locale: "tr_TR",
      url: `/kategori/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} Promptlari | AITASVIR STUDYO`,
    },
    alternates: { canonical: `/kategori/${slug}` },
  };
}

export async function generateStaticParams() {
  return Object.values(CATEGORY_MAP)
    .filter((slug) => slug !== "")
    .map((slug) => ({ slug }));
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const categoryName = SLUG_TO_CATEGORY[slug];

  if (!categoryName) {
    notFound();
  }

  const allPrompts = await getAllPrompts();
  const categoryPrompts = allPrompts.filter((p) =>
    matchesCategorySlug(p, slug)
  );

  return (
    <CategoryPageClient
      categoryName={categoryName}
      slug={slug}
      initialPrompts={categoryPrompts.slice(0, INITIAL_PAGE_SIZE)}
      initialTotal={categoryPrompts.length}
    />
  );
}
