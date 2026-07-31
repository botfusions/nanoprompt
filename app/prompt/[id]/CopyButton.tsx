"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="bg-brand-cyan text-brand-black font-bold px-6 py-3 border-2 border-brand-black shadow-neo hover:-translate-y-0.5 transition-transform text-sm"
    >
      {copied ? "Kopyalandi" : "Promptu Kopyala"}
    </button>
  );
}
