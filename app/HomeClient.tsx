"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AddPromptSection } from "@/components/AddPromptSection";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PromptGrid } from "@/components/PromptGrid";
import { SearchBar } from "@/components/SearchBar";
import { Prompt, CATEGORIES, CATEGORY_MAP } from "@/src/data/prompts";

interface HomeClientProps {
    initialPrompts: Prompt[];
}

export default function HomeClient({ initialPrompts }: HomeClientProps) {
    const [activeCategory, setActiveCategory] = useState("Tümü");
    const [searchQuery, setSearchQuery] = useState("");
    const [favorites, setFavorites] = useState<string[]>([]);

    // Load favorites from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("favorites");
        if (saved) {
            try {
                setFavorites(JSON.parse(saved));
            } catch (e) {
                console.error("Error parsing favorites", e);
            }
        }
    }, []);

    // Save favorites to localStorage
    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (id: string) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    const filteredPrompts = initialPrompts.filter((p, index) => {
        // Get the English tag for filtering
        const englishTag = CATEGORY_MAP[activeCategory] || "";
        const cardNumber = `#${String(index + 1).padStart(5, '0')}`;

        // Check if searching by card number (e.g., #00002 or #2)
        const searchLower = searchQuery.toLowerCase();
        const matchesCardNumber = searchQuery.startsWith('#') && (
            cardNumber === searchQuery ||
            cardNumber.endsWith(searchQuery.replace('#', '')) ||
            String(index + 1) === searchQuery.replace('#', '')
        );

        const matchesCategory = activeCategory === "Tümü" || p.categories?.some(cat => cat.toLowerCase() === englishTag.toLowerCase());
        const matchesSearch = !searchQuery ||
            matchesCardNumber ||
            p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.prompt?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen font-sans flex flex-col bg-[#F0F0F0]">
            <Header />

            <CategoryFilter
                categories={CATEGORIES}
                selectedCategory={activeCategory}
                onSelectCategory={setActiveCategory}
            />

            <main className="container mx-auto px-4 flex-grow relative z-0">
                <AddPromptSection />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div className="font-mono font-bold text-lg md:text-xl bg-brand-yellow border-2 border-brand-black px-2 md:px-3 py-1 min-h-[2rem] shadow-neo">
                        <span className="hidden md:inline">TOPLAM: </span>
                        {filteredPrompts.length}
                    </div>

                    <SearchBar onSearch={setSearchQuery} />
                </div>

                <PromptGrid
                    prompts={filteredPrompts}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                />
            </main>

            <Footer />
        </div>
    );
}
