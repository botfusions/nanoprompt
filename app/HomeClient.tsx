"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AddPromptSection } from "@/components/AddPromptSection";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PromptGrid } from "@/components/PromptGrid";
import { SearchBar } from "@/components/SearchBar";
import { Prompt, CATEGORIES } from "@/src/data/prompts";

const PAGE_SIZE = 32;

interface HomeClientProps {
    initialPrompts: Prompt[];
    initialTotal: number;
}

export default function HomeClient({ initialPrompts, initialTotal }: HomeClientProps) {
    const [activeCategory, setActiveCategory] = useState("Tümü");
    const [searchQuery, setSearchQuery] = useState("");

    // Sunucudan gelen ilk sayfa. Filtre degistikce /api/prompts'tan yenilenir.
    const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
    const [total, setTotal] = useState(initialTotal);
    const [loading, setLoading] = useState(false);

    // Load favorites from localStorage with lazy initialization
    const [favorites, setFavorites] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem("favorites");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing favorites", e);
                return [];
            }
        }
        return [];
    });

    // Save favorites to localStorage
    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (id: string) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    const fetchPage = useCallback(async (offset: number, signal?: AbortSignal) => {
        const params = new URLSearchParams({
            category: activeCategory,
            q: searchQuery,
            offset: String(offset),
            limit: String(PAGE_SIZE),
        });
        const res = await fetch(`/api/prompts?${params}`, { signal });
        if (!res.ok) throw new Error(`Prompt yuklenemedi (${res.status})`);
        return res.json() as Promise<{ items: Prompt[]; total: number }>;
    }, [activeCategory, searchQuery]);

    // Kategori / arama degisince ilk sayfayi yeniden cek.
    // Ilk mount'ta atlanir - o veri zaten sunucudan geldi (gereksiz istek olmasin).
    const isFirstRun = useRef(true);
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const controller = new AbortController();
        // arama yazarken her tusa istek atmamak icin
        const debounce = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await fetchPage(0, controller.signal);
                setPrompts(data.items);
                setTotal(data.total);
            } catch (e) {
                if ((e as Error).name !== "AbortError") console.error(e);
            } finally {
                setLoading(false);
            }
        }, searchQuery ? 300 : 0);

        return () => {
            clearTimeout(debounce);
            controller.abort();
        };
    }, [fetchPage, searchQuery]);

    const loadMore = async () => {
        setLoading(true);
        try {
            const data = await fetchPage(prompts.length);
            setPrompts(prev => [...prev, ...data.items]);
            setTotal(data.total);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

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
                        {total}
                    </div>

                    <SearchBar onSearch={setSearchQuery} />
                </div>

                <PromptGrid
                    prompts={prompts}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    hasMore={prompts.length < total}
                    loading={loading}
                    remaining={total - prompts.length}
                    onLoadMore={loadMore}
                />
            </main>

            <Footer />
        </div>
    );
}
