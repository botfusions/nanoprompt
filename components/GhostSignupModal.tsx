"use client";

import { X, Sparkles, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface GhostSignupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GhostSignupModal({ isOpen, onClose }: GhostSignupModalProps) {
    // Derive visibility directly from isOpen prop
    const isVisible = isOpen;

    useEffect(() => {
        // Prevent scrolling when modal is open
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300",
            isVisible ? "opacity-100 backdrop-blur-sm bg-brand-black/20" : "opacity-0 backdrop-blur-none bg-transparent"
        )}>
            {/* Modal Container */}
            <div
                className={cn(
                    "relative w-full max-w-md bg-white/90 backdrop-blur-md border-4 border-brand-black p-8 shadow-[8px_8px_0_#000000] transition-all duration-300 transform rounded-none",
                    isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                )}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 border-2 border-transparent hover:border-brand-black transition-all rounded-none"
                >
                    <X className="w-5 h-5 text-brand-black" />
                </button>

                {/* Content */}
                <div className="flex flex-col items-center text-center space-y-6">
                    {/* Icon/Decoration */}
                    <div className="w-20 h-20 bg-brand-yellow border-4 border-brand-black flex items-center justify-center shadow-[4px_4px_0_#000000] rotate-3 mb-2 rounded-none">
                        <Sparkles className="w-10 h-10 text-brand-black" />
                    </div>

                    {/* Text */}
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-brand-black">
                            Hayalet Olma,<br />Aramıza Katıl!
                        </h2>
                        <p className="font-mono text-sm text-gray-600 leading-relaxed max-w-[280px] mx-auto">
                            Promptları kopyalamak, koleksiyon oluşturmak ve sınırsız erişim için ücretsiz üye ol.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="w-full space-y-3 pt-2">
                        <Link href="/login" onClick={onClose} className="block w-full">
                            <button className="w-full h-12 bg-brand-black text-white font-black uppercase tracking-wider text-sm hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#333] transition-all flex items-center justify-center gap-2 border-2 border-brand-black rounded-none">
                                <UserPlus className="w-4 h-4" />
                                <span>Hemen Üye Ol</span>
                            </button>
                        </Link>

                        <button
                            onClick={onClose}
                            className="w-full h-12 bg-transparent text-gray-500 font-bold uppercase text-xs hover:text-brand-black hover:underline transition-colors"
                        >
                            Belki Daha Sonra
                        </button>
                    </div>
                </div>

                {/* Corner Decoration */}
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-brand-yellow border-2 border-brand-black z-[-1] rounded-none"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-black z-[-1] rounded-none"></div>
            </div>
        </div>
    );
}
