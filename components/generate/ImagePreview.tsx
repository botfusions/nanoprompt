"use client";

import { Download, Copy, RefreshCw, Check } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

interface ImagePreviewProps {
  imageUrl: string | null;
  prompt: string | null;
  isGenerating: boolean;
  onRegenerate: () => void;
}

export function ImagePreview({
  imageUrl,
  prompt,
  isGenerating,
  onRegenerate,
}: ImagePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `image-prompt-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!imageUrl && !isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center rounded-none border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-6">
          <svg
            className="h-12 w-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-400">
          Görsel burada görünecek
        </p>
        <p className="text-sm text-gray-300 mt-1">
          Bir prompt yazıp oluştur butonuna tıklayın
        </p>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center rounded-none border-2 border-brand-purple bg-brand-purple/5 p-12 text-center animate-pulse">
        <div className="mb-4 relative">
          <div className="h-16 w-16 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
        </div>
        <p className="text-lg font-black text-brand-purple">
          Görsel oluşturuluyor...
        </p>
        <p className="text-sm text-gray-500 mt-1">Bu birkaç saniye sürebilir</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-none border-2 border-black bg-gray-100 shadow-neo-strong">
        <img
          src={imageUrl!}
          alt="Generated image"
          className="w-full object-contain"
        />
      </div>

      {prompt && (
        <div className="rounded-none border-2 border-black bg-white p-4 shadow-neo">
          <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
            Kullanılan Prompt
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{prompt}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex flex-1 items-center justify-center gap-2 rounded-none border-2 border-black bg-brand-yellow px-4 py-3 font-bold text-sm uppercase shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
        >
          <Download className="h-4 w-4" />
          İndir
        </button>
        <button
          onClick={handleCopyPrompt}
          className={clsx(
            "flex flex-1 items-center justify-center gap-2 rounded-none border-2 border-black px-4 py-3 font-bold text-sm uppercase shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all",
            copied
              ? "bg-green-400 text-black"
              : "bg-white text-black"
          )}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Kopyalandı!" : "Prompt'u Kopyala"}
        </button>
        <button
          onClick={onRegenerate}
          className="flex items-center justify-center gap-2 rounded-none border-2 border-black bg-brand-purple px-4 py-3 font-bold text-sm uppercase text-white shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
