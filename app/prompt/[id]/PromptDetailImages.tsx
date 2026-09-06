"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { ImageLightboxModal } from "@/components/ImageLightboxModal";

interface PromptDetailImagesProps {
  images: string[];
  title?: string;
  cardNumber?: string | null;
  promptId?: string;
}

export function PromptDetailImages({
  images,
  title,
  cardNumber,
  promptId,
}: PromptDetailImagesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 border-2 border-brand-black/10 overflow-hidden flex items-center justify-center text-brand-black/30">
        Görsel mevcut değil
      </div>
    );
  }

  const handleOpen = (idx: number) => {
    setSelectedIndex(idx);
    setIsOpen(true);
  };

  const mainImage = images[0];

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image */}
      <div
        onClick={() => handleOpen(0)}
        className="aspect-square bg-gray-100 border-2 border-brand-black relative group overflow-hidden cursor-zoom-in"
        title="Görseli tam boyutta açmak için tıklayın"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainImage}
          alt={title || "Prompt görseli"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.jpg";
          }}
        />

        {/* Hover Zoom Overlay */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-black/80 hover:bg-brand-black text-white text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 shadow-[2px_2px_0px_#fff] border border-white/40">
          <Maximize2 className="w-3.5 h-3.5 text-brand-yellow" />
          <span>BÜYÜT</span>
        </div>
      </div>

      {/* Multi-image thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleOpen(idx)}
              className="w-16 h-16 flex-shrink-0 border-2 border-brand-black overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${title} - ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.jpg";
                }}
              />
            </button>
          ))}
        </div>
      )}

      <ImageLightboxModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        images={images}
        initialIndex={selectedIndex}
        title={title}
        cardNumber={cardNumber}
        promptId={promptId}
      />
    </div>
  );
}
