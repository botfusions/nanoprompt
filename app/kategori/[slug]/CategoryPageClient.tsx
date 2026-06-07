"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Prompt } from "@/src/data/prompts";
import { PromptCard } from "@/components/PromptCard";

interface CategoryPageClientProps {
  categoryName: string;
  prompts: Prompt[];
}

export default function CategoryPageClient({
  categoryName,
  prompts,
}: CategoryPageClientProps) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("favorites");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-brand-black/50 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-cyan transition-colors">
            Ana Sayfa
          </Link>
          <span>/</span>
          <span className="text-brand-black">{categoryName}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black uppercase text-brand-black mb-2">
            {categoryName}
          </h1>
          <p className="text-brand-black/60">
            {prompts.length} prompt bulundu
          </p>
        </div>

        {/* Prompt Grid */}
        {prompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                isFavorite={favorites.includes(prompt.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-brand-black/40 text-lg mb-4">
              Bu kategoride henuz prompt bulunmuyor.
            </p>
            <Link
              href="/"
              className="text-brand-cyan font-bold hover:underline"
            >
              Tum promptlara don
            </Link>
          </div>
        )}

        {/* Back Link */}
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
