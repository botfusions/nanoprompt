"use client";

import Link from "next/link";
import { Github, Languages, HelpCircle } from "lucide-react";
import { AuthButton } from "./AuthButton";

export function Header() {
  return (
    <header className="bg-brand-cyan border-b-4 border-brand-black py-8 md:py-12 px-4 mb-8 md:mb-12 relative overflow-hidden w-full">
      {/* Top Bar */}
      <div className="container mx-auto flex justify-between items-center relative z-20 mb-8 md:mb-12">
        <Link
          href="/"
          className="bg-white border-2 border-brand-black px-4 py-2 shadow-neo font-black text-xl tracking-tighter hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none flex items-center gap-2"
        >
          AİTASVİR
          <span className="text-xs bg-brand-yellow text-brand-black px-1.5 py-0.5 border border-brand-black font-bold">
            (BETA)
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/generate"
            className="bg-brand-purple text-white border-2 border-brand-black px-4 py-2 shadow-neo font-black text-sm uppercase tracking-wider hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v2m0 14v2M5.636 5.636l1.414 1.414m9.9 9.9l1.414 1.414M3 12h2m14 0h2M5.636 18.364l1.414-1.414m9.9-9.9l1.414-1.414"/><circle cx="12" cy="12" r="4"/></svg>
            Oluştur
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border-2 border-brand-black p-2 shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none"
          >
            <Github className="w-5 h-5" />
          </a>
          <button className="bg-white border-2 border-brand-black p-2 shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none">
            <HelpCircle className="w-5 h-5" />
          </button>
          <div className="bg-white border-2 border-brand-black px-3 py-2 shadow-neo flex items-center gap-2 rounded-none font-bold text-sm uppercase">
            <Languages className="w-4 h-4" />
            <span>TR</span>
          </div>
          <AuthButton />
        </div>
      </div>

      <div className="container mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-8xl font-black mb-4 tracking-tighter text-white drop-shadow-[5px_5px_0_#000] leading-none transform -rotate-1">
          AİTASVİR
          <br />
          <span className="text-brand-yellow drop-shadow-[3px_3px_0_#000]">
            STÜDYO
          </span>{" "}
          V2
        </h1>
        <p className="text-xl md:text-2xl font-bold text-brand-black bg-white inline-block px-4 py-1 border-2 border-brand-black shadow-neo transform rotate-1 rounded-none">
          İlham veren en iyi prompt koleksiyonu
        </p>
      </div>

      {/* Sarı Yapışkan Kağıt - Sticky Note */}
      <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-20 hidden md:block">
        <div
          className="bg-yellow-200 w-52 p-5 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 border-2 border-brand-black/10"
          style={{
            boxShadow: "4px 4px 12px rgba(0,0,0,0.25)",
            background: "linear-gradient(135deg, #fef08a 0%, #fde047 100%)",
          }}
        >
          {/* Tape effect */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/60 backdrop-blur-[2px] opacity-70 shadow-sm"></div>

          <p
            className="text-amber-950 font-handwriting text-xs leading-relaxed text-center"
            style={{ fontFamily: "cursive" }}
          >
            📌 Güncel Koleksiyon:
            <br />
            <span className="font-black text-sm text-brand-black block my-1 bg-white/40 px-1 py-0.5 border border-brand-black/5 uppercase tracking-wide">
              GPT IMAGE 2.0
            </span>
            ve
            <span className="font-black text-sm text-brand-black block my-1 bg-white/40 px-1 py-0.5 border border-brand-black/5 uppercase tracking-wide">
              NANO BANANA 2
            </span>
            PROMPTLARI!
          </p>
        </div>
      </div>
    </header>
  );
}
