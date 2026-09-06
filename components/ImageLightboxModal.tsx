"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
  cardNumber?: string | null;
  promptId?: string;
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title,
  cardNumber,
  promptId,
}: ImageLightboxModalProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync currentIndex with initialIndex when modal opens or initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, (images?.length || 1) - 1)));
    }
  }, [isOpen, initialIndex, images]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images]);

  // Keyboard navigation & lock scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!mounted || !isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex] || "/placeholder.jpg";
  const hasMultiple = images.length > 1;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex flex-col justify-between bg-black/95 backdrop-blur-md p-3 sm:p-6 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="flex items-center justify-between gap-4 z-20 w-full max-w-6xl mx-auto bg-brand-black/80 border-2 border-white/20 px-3 sm:px-5 py-2.5 shadow-[4px_4px_0_#fff]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {cardNumber && (
            <span className="font-mono text-xs sm:text-sm font-black bg-brand-yellow text-brand-black px-2 sm:px-3 py-1 border border-brand-black">
              {cardNumber}
            </span>
          )}
          {title && (
            <h4 className="text-white font-bold text-xs sm:text-sm md:text-base truncate max-w-[180px] sm:max-w-md md:max-w-lg uppercase">
              {title}
            </h4>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {hasMultiple && (
            <span className="font-mono text-xs font-bold text-white/90 bg-white/10 px-2.5 py-1 border border-white/20">
              {currentIndex + 1} / {images.length}
            </span>
          )}

          {promptId && (
            <Link
              href={`/prompt/${promptId}`}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-white text-brand-black px-3 py-1.5 border border-brand-black hover:bg-brand-yellow transition-colors shadow-[2px_2px_0_#fff]"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>DETAYA GİT</span>
            </Link>
          )}

          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-brand-red text-white border-2 border-white hover:bg-white hover:text-brand-black transition-colors shadow-[2px_2px_0_#fff] cursor-pointer"
            title="Kapat (ESC)"
            aria-label="Kapat"
          >
            <X className="w-5 h-5 font-black" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center my-3 sm:my-5 overflow-hidden"
        onClick={onClose}
      >
        {/* Navigation Arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-6 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-brand-yellow text-brand-black border-2 border-brand-black flex items-center justify-center transition-all shadow-[3px_3px_0px_#000] active:translate-y-[1px] cursor-pointer"
              title="Önceki Görsel (Sol Ok)"
              aria-label="Önceki Görsel"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-6 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-brand-yellow text-brand-black border-2 border-brand-black flex items-center justify-center transition-all shadow-[3px_3px_0px_#000] active:translate-y-[1px] cursor-pointer"
              title="Sonraki Görsel (Sağ Ok)"
              aria-label="Sonraki Görsel"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Displayed Image */}
        <div
          className="relative max-h-[80vh] max-w-[94vw] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={currentImage}
            src={currentImage}
            alt={title || "Büyük görsel"}
            className="max-h-[80vh] max-w-[94vw] w-auto h-auto object-contain border-4 border-brand-black shadow-[8px_8px_0px_rgba(255,255,255,0.9)] bg-brand-black"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.jpg";
            }}
          />
        </div>
      </div>

      {/* Bottom Thumbnails / Bar */}
      <div
        className="flex items-center justify-center gap-2 z-20 pb-1 max-w-full overflow-x-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {hasMultiple ? (
          images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 border-2 overflow-hidden transition-all cursor-pointer",
                idx === currentIndex
                  ? "border-brand-yellow scale-105 shadow-[0_0_8px_rgba(255,222,89,0.9)]"
                  : "border-white/40 opacity-50 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img || "/placeholder.jpg"}
                alt={`Küçük resim ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.jpg";
                }}
              />
            </button>
          ))
        ) : (
          <div className="text-white/60 font-mono text-[11px] sm:text-xs">
            Kapatmak için arka plana tıklayın veya ESC tuşuna basın
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
