"use client";

import { Check, Crown, Sparkles, Zap } from "lucide-react";
import clsx from "clsx";
import { CREDIT_PACKAGES } from "@/src/lib/payment";

interface CreditPackagesProps {
  onSelectPackage: (packageId: string) => void;
  isProcessing: boolean;
}

const PACKAGE_ICONS = {
  starter: <Zap className="h-6 w-6" />,
  pro: <Crown className="h-6 w-6" />,
  ultimate: <Sparkles className="h-6 w-6" />,
};

export function CreditPackages({ onSelectPackage, isProcessing }: CreditPackagesProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black uppercase tracking-wider text-black">
        Kredi Paketleri
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CREDIT_PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => onSelectPackage(pkg.id)}
            disabled={isProcessing}
            className={clsx(
              "relative flex flex-col items-center gap-3 rounded-none border-2 border-black p-6 transition-all",
              pkg.popular
                ? "bg-brand-purple text-white shadow-neo-strong ring-2 ring-brand-purple/50 scale-105"
                : "bg-white text-black shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
              isProcessing && "opacity-50 cursor-not-allowed"
            )}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-yellow px-3 py-1 text-xs font-black text-black border border-black">
                EN POPÜLER
              </div>
            )}
            <div
              className={clsx(
                "rounded-full p-3 border-2 border-current",
                pkg.popular ? "bg-white/20" : "bg-gray-100"
              )}
            >
              {PACKAGE_ICONS[pkg.id as keyof typeof PACKAGE_ICONS]}
            </div>
            <span className="text-xl font-black">{pkg.label}</span>
            <span className="text-3xl font-black">
              ₺{pkg.price}
            </span>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span className="text-sm font-bold">{pkg.credits} kredi</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span className="text-sm font-bold">
                ₺{(pkg.price / pkg.credits).toFixed(2)}/görsel
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
