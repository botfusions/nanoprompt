"use client";

import { Coins } from "lucide-react";
import clsx from "clsx";

interface CreditBalanceProps {
  credits: number;
  onBuyCredits: () => void;
}

export function CreditBalance({ credits, onBuyCredits }: CreditBalanceProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={clsx(
          "flex items-center gap-2 rounded-none border-2 border-black px-4 py-2 shadow-neo",
          credits > 5 ? "bg-brand-yellow" : credits > 0 ? "bg-orange-200" : "bg-red-200"
        )}
      >
        <Coins className="h-5 w-5" />
        <span className="font-black text-lg">{credits}</span>
        <span className="text-xs font-bold uppercase">kredi</span>
      </div>
      <button
        onClick={onBuyCredits}
        className="rounded-none border-2 border-black bg-white px-3 py-2 font-bold text-xs uppercase shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
      >
        + Kredi Al
      </button>
    </div>
  );
}
