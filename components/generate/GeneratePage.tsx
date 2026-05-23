"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { PromptInput } from "./PromptInput";
import { ModelSelector } from "./ModelSelector";
import { SizeSelector } from "./SizeSelector";
import { ImagePreview } from "./ImagePreview";
import { CreditBalance } from "./CreditBalance";
import { CreditPackages } from "./CreditPackages";
import { CREDIT_COSTS, CreditBalance as CreditBalanceType } from "@/src/lib/credits";
import { MODELS, ModelKey } from "@/src/lib/replicate";
import { Wand2, Loader2, AlertCircle, X } from "lucide-react";
import clsx from "clsx";

export function GeneratePage() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();

  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelKey>("flux-schnell");
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [negativePrompt, setNegativePrompt] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const [result, setResult] = useState<{
    imageUrl: string;
    prompt: string;
    creditsRemaining: number;
  } | null>(null);

  const [credits, setCredits] = useState<CreditBalanceType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPackages, setShowPackages] = useState(false);

  // URL'den prompt parametresini oku
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (promptParam) {
      setPrompt(decodeURIComponent(promptParam));
    }
  }, [searchParams]);

  // Kredileri yükle
  const loadCredits = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/credits?userId=${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setCredits(data);
      }
    } catch (err) {
      console.error("Credits load error:", err);
    }
  }, [user]);

  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  const creditCost = CREDIT_COSTS[selectedModel] || 1;
  const currentCredits = credits?.credits ?? 0;

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await fetch("/api/generate/prompt-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err) {
      console.error("Enhance error:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!user) return;
    if (currentCredits < creditCost) {
      setShowPackages(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          width,
          height,
          negativePrompt,
          userId: user.uid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          setShowPackages(true);
          setError("Yetersiz kredi. Lütfen kredi satın alın.");
        } else {
          setError(data.error || "Görsel oluşturulamadı");
        }
        return;
      }

      setResult({
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        creditsRemaining: data.creditsRemaining,
      });
      await loadCredits();
    } catch (err) {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!user) return;
    setIsPurchasing(true);
    try {
      const res = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          packageId,
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError("Ödeme başlatılamadı");
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
        <div className="rounded-none border-2 border-black bg-brand-yellow p-8 shadow-neo-strong text-center max-w-md">
          <h2 className="text-2xl font-black uppercase mb-3">Giriş Yapın</h2>
          <p className="text-sm text-gray-700">
            Görsel oluşturmak için giriş yapmanız gerekiyor. Ücretsiz 3 kredi ile başlayın!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Üst Başlık */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
              AI Görsel{" "}
              <span className="text-brand-purple">Oluşturucu</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Prompt yazın, AI görsel ve prompt'u birlikte üretsin
            </p>
          </div>
          <CreditBalance
            credits={currentCredits}
            onBuyCredits={() => setShowPackages(true)}
          />
        </div>
      </div>

      {/* Hata mesajı */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-none border-2 border-red-500 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm font-bold text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4 text-red-500" />
          </button>
        </div>
      )}

      {/* Kredi Paketleri Modal */}
      {showPackages && (
        <div className="mb-8 rounded-none border-2 border-brand-purple bg-white p-6 shadow-neo-strong">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black uppercase">Kredi Satın Al</h3>
            <button
              onClick={() => setShowPackages(false)}
              className="rounded-none border-2 border-black bg-white p-1 shadow-neo hover:shadow-none transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <CreditPackages
            onSelectPackage={handlePurchase}
            isProcessing={isPurchasing}
          />
        </div>
      )}

      {/* Ana İçerik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol Panel - Kontroller */}
        <div className="space-y-6">
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onEnhance={handleEnhance}
            isEnhancing={isEnhancing}
          />

          <ModelSelector
            selected={selectedModel}
            onSelect={setSelectedModel}
          />

          <SizeSelector
            width={width}
            height={height}
            onSizeChange={(w, h) => {
              setWidth(w);
              setHeight(h);
            }}
          />

          {/* Negatif Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-wider text-black">
              Negatif Prompt (Opsiyonel)
            </label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="İstemediğiniz ögeler: blurry, low quality..."
              className="w-full rounded-none border-2 border-black bg-white px-4 py-3 text-sm shadow-neo focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none transition-all outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Oluştur Butonu */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={clsx(
              "w-full flex items-center justify-center gap-3 rounded-none border-2 border-black px-6 py-4",
              "font-black text-lg uppercase tracking-wider transition-all",
              isGenerating || !prompt.trim()
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-brand-purple text-white shadow-neo-strong hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            )}
          >
            {isGenerating ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Wand2 className="h-6 w-6" />
            )}
            {isGenerating
              ? "Oluşturuluyor..."
              : `Oluştur (${creditCost} kredi)`}
          </button>

          {currentCredits < creditCost && !isGenerating && prompt.trim() && (
            <p className="text-center text-sm font-bold text-red-500">
              Yetersiz kredi!{" "}
              <button
                onClick={() => setShowPackages(true)}
                className="underline"
              >
                Kredi satın alın
              </button>
            </p>
          )}
        </div>

        {/* Sağ Panel - Önizleme */}
        <div className="space-y-4">
          <ImagePreview
            imageUrl={result?.imageUrl || null}
            prompt={result?.prompt || null}
            isGenerating={isGenerating}
            onRegenerate={handleGenerate}
          />
        </div>
      </div>
    </div>
  );
}
