import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPrompts, CATEGORY_MAP } from "@/src/data/prompts";
import CategoryPageClient from "./CategoryPageClient";

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
  const englishTag = CATEGORY_MAP[categoryName] || "";
  const categoryPrompts = allPrompts.filter((p) =>
    p.categories?.some(
      (c) => c.toLowerCase().replace(/\s+/g, "-") === englishTag
    )
  );

  return <CategoryPageClient categoryName={categoryName} prompts={categoryPrompts} />;
}
