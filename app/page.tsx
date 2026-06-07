import { getAllPrompts } from "@/src/data/prompts";
import HomeClient from "./HomeClient";

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.aitasvir.com";

const CATEGORIES = [
  { name: "Fotografcilik", slug: "photography" },
  { name: "Portre", slug: "portrait" },
  { name: "Doga", slug: "nature" },
  { name: "Manzara", slug: "landscape" },
  { name: "Minimalist", slug: "minimalist" },
  { name: "Arac", slug: "vehicle" },
  { name: "Karakter", slug: "character" },
  { name: "Moda", slug: "fashion" },
  { name: "Logo", slug: "logo" },
  { name: "Marka", slug: "branding" },
  { name: "Illüstrasyon", slug: "illustration" },
  { name: "Urun", slug: "product" },
  { name: "Karikatur", slug: "cartoon" },
  { name: "Tipografi", slug: "typography" },
  { name: "Ic Tasarim", slug: "interior" },
  { name: "3D", slug: "3d" },
  { name: "Retro", slug: "retro" },
  { name: "Yaratici", slug: "creative" },
];

function ItemListJsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AITASVIR Prompt Koleksiyonu",
    description: "AI gorsel olusturma promptlari kategorileri",
    numberOfItems: CATEGORIES.length,
    itemListElement: CATEGORIES.map((cat, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: cat.name,
      url: `${BASE_URL}/?category=${cat.slug}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function Home() {
  const prompts = await getAllPrompts();

  return (
    <>
      <ItemListJsonLd />
      <HomeClient initialPrompts={prompts} />
    </>
  );
}
