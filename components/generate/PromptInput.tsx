"use client";

import { useState } from "react";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import clsx from "clsx";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnhance: () => void;
  isEnhancing: boolean;
}

const EXAMPLE_PROMPTS = [
  "A futuristic cityscape at sunset with neon lights",
  "Portrait of a cat wearing a crown, oil painting style",
  "Minimalist logo design for a coffee brand",
  "A magical forest with glowing mushrooms and fireflies",
];

export function PromptInput({ value, onChange, onEnhance, isEnhancing }: PromptInputProps) {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-black uppercase tracking-wider text-black">
          Prompt
        </label>
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="text-xs font-bold text-brand-purple hover:underline"
        >
          {showExamples ? "Gizle" : "Örnekler"}
        </button>
      </div>

      {showExamples && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((example) => (
            <button
              key={example}
              onClick={() => {
                onChange(example);
                setShowExamples(false);
              }}
              className="rounded-full border-2 border-black bg-brand-yellow px-3 py-1 text-xs font-bold text-black shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              {example.slice(0, 40)}...
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Görsel oluşturmak için bir prompt yazın veya örneklerden seçin..."
          rows={4}
          className={clsx(
            "w-full resize-none rounded-none border-2 border-black bg-white p-4 text-base",
            "shadow-neo focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none",
            "transition-all outline-none placeholder:text-gray-400"
          )}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className="text-xs text-gray-400">{value.length}/500</span>
        </div>
      </div>

      <button
        onClick={onEnhance}
        disabled={isEnhancing || !value.trim()}
        className={clsx(
          "flex items-center gap-2 rounded-none border-2 border-black px-4 py-2",
          "font-bold text-sm uppercase tracking-wider transition-all",
          isEnhancing || !value.trim()
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-brand-purple text-white shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
        )}
      >
        {isEnhancing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        {isEnhancing ? "İyileştiriliyor..." : "AI ile İyileştir"}
      </button>
    </div>
  );
}
