"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Copy,
  Zap,
  Check,
  Eye,
  Share2,
  Bookmark,
  Bot,
} from "lucide-react";
import { Prompt } from "@/src/data/prompts";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { GhostSignupModal } from "./GhostSignupModal";

interface PromptCardProps {
  prompt: Prompt;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

// Tarih formatı: "DD.MM.YYYY HH:mm"
function formatDate(dateString: string | undefined): string {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Geçersiz tarih ise orijinali döndür

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

export function PromptCard({
  prompt,
  isFavorite,
  onToggleFavorite,
}: PromptCardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"prompt" | "original">("prompt");
  const [copied, setCopied] = useState(false);
  const [showGhostModal, setShowGhostModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sabit numara - sıralama değişse bile aynı kalır
  // Numara yoksa gösterme
  const cardNumber = prompt.displayNumber
    ? `#${String(prompt.displayNumber).padStart(5, "0")}`
    : null;

  const handleCopy = async () => {
    if (!user) {
      setShowGhostModal(true);
      return;
    }

    try {
      // 1. Check download limit
      const checkRes = await fetch("/api/security?type=download");
      const { allowed } = await checkRes.json();

      if (!allowed) {
        alert(
          "Günlük prompt kopyalama limitinize (20) ulaştınız. Lütfen yarın tekrar deneyin.",
        );
        return;
      }

      // 2. Perform copy
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // 3. Increment download count (async in background)
      fetch("/api/security", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Nano-Secure-Token": "nano-studio-v2-secure-2026",
        },
        body: JSON.stringify({ type: "increment_download" }),
      }).catch((err) =>
        console.error("Error incrementing download count:", err),
      );
    } catch (error) {
      console.error("Copy operation failed:", error);
      // Fallback: Copy anyway if security check fails (for UX)
      navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isLongPrompt = prompt.prompt && (prompt.prompt.length > 150 || prompt.prompt.includes('\n'));

  return (
    <div className="group relative flex flex-col mt-12 w-full">
      {/* Tabs - Positioned absolutely above the card */}
      <div className="absolute -top-10 left-0 flex z-0">
        <button
          onClick={() => setActiveTab("prompt")}
          className={cn(
            "h-10 px-6 font-black text-sm border-t-4 border-l-4 border-r-4 border-brand-black uppercase relative transition-all duration-100 ease-in-out pb-1 rounded-none",
            activeTab === "prompt"
              ? "bg-white translate-y-[4px] z-20 border-b-0 text-brand-black"
              : "bg-gray-200 hover:bg-gray-100 translate-y-[8px] z-10 border-b-4 text-gray-500",
          )}
        >
          IMAGE PROMPT
        </button>
        <button
          onClick={() => setActiveTab("original")}
          className={cn(
            "h-10 px-6 font-black text-sm border-t-4 border-r-4 border-brand-black uppercase flex items-center gap-2 relative ml-[-4px] transition-all duration-100 ease-in-out rounded-none",
            activeTab === "original"
              ? "bg-white translate-y-[4px] z-20 border-b-0 text-brand-black"
              : "bg-gray-200 hover:bg-gray-100 translate-y-[8px] z-10 border-b-4 border-l-4 text-gray-500",
          )}
        >
          ORIJINAL
        </button>
      </div>

      {/* Black Background Shadow Layer */}
      <div className="absolute inset-0 bg-brand-black translate-x-2 translate-y-2 z-0 rounded-none"></div>

      {/* Main Card Content */}
      <div className="relative z-10 bg-white border-4 border-brand-black p-5 flex flex-col transition-transform duration-200 ease-in-out rounded-none">
        {/* Featured Tag */}
        {prompt.featured && (
          <div className="absolute -right-4 -top-3 z-30 bg-brand-yellow text-brand-black border-2 border-brand-black px-3 py-1 shadow-[2px_2px_0_#000] rotate-3 font-black uppercase text-xs tracking-wider rounded-none">
            ÖNE ÇIKAN
          </div>
        )}

        {/* Author Info */}
        <div className="flex items-center justify-between mb-4 border-b-2 border-gray-100 pb-2">
          <div className="flex items-center gap-2">
            {cardNumber && (
              <Link href={`/prompt/${prompt.id}`} className="font-mono text-xs bg-gray-100 border border-gray-300 px-2 py-0.5 text-gray-600 hover:bg-brand-cyan/10 hover:border-brand-cyan/30 transition-colors">
                {cardNumber}
              </Link>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black uppercase text-xs tracking-wide text-gray-500">
                <span className="text-brand-black border-b-2 border-brand-yellow hover:bg-brand-yellow transition-colors cursor-pointer">
                  @{prompt.author}
                </span>
              </span>
              <div className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 font-bold border rounded-sm tracking-wider uppercase bg-brand-yellow/20 text-brand-black border-brand-yellow/50">
                <Bot className="w-3 h-3" />
                <span>NANO BANANA</span>
              </div>
            </div>
          </div>
          <span className="font-mono text-xs text-gray-400">
            {formatDate(prompt.date)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black mb-4 leading-tight uppercase tracking-tight line-clamp-2 min-h-[3rem]">
          {prompt.title?.replace(/GEM[Iİ]N[Iİ]\s*(NANO\s*PROMPT|NANO\s*BANANA|NANOBANANA|NANOPROMPT|PROMPT)/gi, "IMAGE PROMPT")}
        </h3>

        {/* Image Area with Multi-Image Grid */}
        <div className="mb-4 border-2 border-brand-black relative group/image bg-gray-200 rounded-none overflow-hidden">
          <div
            className={cn(
              "aspect-video w-full relative bg-brand-black/10 transition-all duration-300",
              // Tüm çoklu resimler için grid layout kullan
              prompt.images?.length === 1
                ? "flex"
                : prompt.images?.length === 2
                  ? "grid grid-cols-2"
                  : prompt.images?.length === 3
                    ? "grid grid-cols-2 grid-rows-2"
                    : prompt.images?.length === 4
                      ? "grid grid-cols-2 grid-rows-2"
                      : "flex",
            )}
          >
            {(!prompt.images || prompt.images.length === 0) && (
              <img
                src="/placeholder.jpg"
                alt="Placeholder"
                className="object-cover w-full h-full"
              />
            )}

            {prompt.images?.slice(0, 4).map((imgUrl, idx, arr) => {
              const count = arr.length;

              // Layout sınıfları - tüm çoklu resimler için grid kullan
              let layoutClass = "";

              if (count === 1) {
                // 1 resim: tam genişlik
                layoutClass = "w-full h-full";
              } else if (count === 2) {
                // 2 resim: yan yana (grid ile otomatik)
                layoutClass = "";
              } else if (count === 3) {
                // 3 resim: 1 büyük sol (tam yükseklik), 2 küçük sağda üst üste
                if (idx === 0) {
                  // Büyük resim - sol sütun, her iki satırı kaplar
                  layoutClass = "col-start-1 row-start-1 row-span-2";
                } else if (idx === 1) {
                  // Sağ üst resim
                  layoutClass = "col-start-2 row-start-1";
                } else {
                  // Sağ alt resim
                  layoutClass = "col-start-2 row-start-2";
                }
              } else if (count === 4) {
                // 4 resim: 2x2 grid - grid ile otomatik sıralama
                layoutClass = "";
              }

              return (
                <div
                  key={idx}
                  className={cn("relative overflow-hidden", layoutClass)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl || "/placeholder.jpg"}
                    alt={`${prompt.title} - ${idx + 1}`}
                    className={cn(
                      "object-cover w-full h-full transition-all duration-500 opacity-100 saturate-[1.15] contrast-[1.1]",
                      "group-hover/image:scale-105 group-hover/image:brightness-110 group-hover/image:saturate-125 group-hover/image:contrast-115",
                    )}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.jpg";
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Description / Content */}
        <div className="mb-6 flex-grow">
          <div
            className={cn(
              "bg-gray-50 border-2 border-brand-black p-3 font-mono text-xs md:text-sm text-gray-600 leading-relaxed rounded-none relative transition-all duration-200",
              activeTab === "prompt" && user && isExpanded ? "h-auto min-h-[8rem]" : "h-32 overflow-hidden"
            )}
          >
            {activeTab === "prompt" ? (
              user ? (
                <div className={cn(!isExpanded && isLongPrompt && "line-clamp-4")}>
                  {prompt.prompt}
                </div>
              ) : (
                <>
                  {/* Blurred content for non-users */}
                  <div
                    className="blur-[6px] select-none pointer-events-none"
                    aria-hidden="true"
                  >
                    {prompt.prompt.substring(0, 200)}...
                  </div>
                  {/* Overlay with login prompt */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                    <Eye className="w-6 h-6 mb-2 text-gray-400" />
                    <p className="text-center text-sm font-bold text-gray-600 mb-2">
                      Promptu görmek için giriş yapın
                    </p>
                    <button
                      onClick={() => setShowGhostModal(true)}
                      className="px-4 py-1 bg-brand-black text-white text-xs font-bold uppercase hover:bg-brand-yellow hover:text-brand-black transition-colors"
                    >
                      Giriş Yap
                    </button>
                  </div>
                </>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                <p>Orijinal kaynak için butona tıklayın.</p>
                <ExternalLink className="w-4 h-4" />
              </div>
            )}

            {/* "Daha Fazla Göster" / "Daha Az Göster" Butonu */}
            {activeTab === "prompt" && user && isLongPrompt && (
              <>
                {!isExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                )}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="absolute bottom-2 right-2 bg-brand-yellow text-brand-black border border-brand-black px-2 py-0.5 text-[10px] font-black uppercase hover:bg-brand-black hover:text-white transition-colors shadow-[1px_1px_0_#000] z-10"
                >
                  {isExpanded ? "DAHA AZ" : "DAHA FAZLA"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex gap-3 h-12">
          <button
            onClick={handleCopy}
            className={cn(
              "flex-grow flex items-center justify-center gap-2 border-2 border-brand-black font-black uppercase tracking-wider transition-all shadow-none hover:shadow-neo active:translate-y-[1px] active:shadow-none rounded-none text-sm group/btn",
              copied
                ? "bg-green-500 text-white"
                : "bg-brand-black text-white hover:bg-white hover:text-brand-black",
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>KOPYALANDI!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>KOPYALA</span>
              </>
            )}
          </button>

          <Link
            href={`/generate?prompt=${encodeURIComponent(prompt.prompt)}`}
            className="w-12 flex items-center justify-center bg-brand-purple text-white border-2 border-brand-black hover:bg-brand-yellow hover:text-brand-black transition-all shadow-none hover:shadow-neo active:translate-y-[1px] active:shadow-none rounded-none"
            title="Bu prompt ile görsel oluştur"
          >
            <Zap className="w-5 h-5" />
          </Link>

          <button
            className="w-12 flex items-center justify-center bg-white border-2 border-brand-black hover:bg-gray-100 transition-all shadow-none hover:shadow-neo active:translate-y-[1px] active:shadow-none rounded-none"
            title="Paylaş"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => onToggleFavorite(prompt.id)}
            className={cn(
              "w-12 flex items-center justify-center border-2 border-brand-black transition-all shadow-none hover:shadow-neo active:translate-y-[1px] active:shadow-none rounded-none",
              isFavorite
                ? "bg-brand-red text-white"
                : "bg-white hover:bg-gray-100",
            )}
            title={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
          >
            <Bookmark className={cn("w-5 h-5", isFavorite && "fill-current")} />
          </button>
        </div>
      </div>

      <GhostSignupModal
        isOpen={showGhostModal}
        onClose={() => setShowGhostModal(false)}
      />
    </div>
  );
}
