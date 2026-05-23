"use client";

import clsx from "clsx";
import { Zap, Crown, Sparkles } from "lucide-react";
import { MODELS, ModelKey } from "@/src/lib/replicate";

interface ModelSelectorProps {
  selected: ModelKey;
  onSelect: (model: ModelKey) => void;
}

const MODEL_ICONS: Record<ModelKey, React.ReactNode> = {
  "flux-schnell": <Zap className="h-5 w-5" />,
  "flux-pro": <Crown className="h-5 w-5" />,
  "sdxl": <Sparkles className="h-5 w-5" />,
};

export function ModelSelector({ selected, onSelect }: ModelSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-black uppercase tracking-wider text-black">
        AI Model
      </label>
      <div className="grid grid-cols-3 gap-3">
        {(Object.entries(MODELS) as [ModelKey, typeof MODELS[ModelKey]][]).map(
          ([key, model]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={clsx(
                "flex flex-col items-center gap-2 rounded-none border-2 border-black p-4 transition-all",
                selected === key
                  ? "bg-brand-purple text-white shadow-neo-strong ring-2 ring-brand-purple/50"
                  : "bg-white text-black shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              )}
            >
              <div
                className={clsx(
                  "rounded-full p-2 border-2 border-current",
                  selected === key ? "bg-white/20" : "bg-gray-100"
                )}
              >
                {MODEL_ICONS[key]}
              </div>
              <span className="text-sm font-black">{model.name}</span>
              <span
                className={clsx(
                  "text-xs",
                  selected === key ? "text-white/80" : "text-gray-500"
                )}
              >
                {model.description}
              </span>
              <div className="flex items-center gap-1">
                <span
                  className={clsx(
                    "inline-block rounded-full px-2 py-0.5 text-xs font-bold border border-current",
                    selected === key
                      ? "bg-white/20 text-white"
                      : "bg-brand-yellow text-black"
                  )}
                >
                  {model.creditCost} kredi
                </span>
              </div>
              <span className="text-xs opacity-60">{model.estimatedTime}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
