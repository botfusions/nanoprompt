"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import clsx from "clsx";

interface ImageUploaderProps {
    onImageSelect: (file: File | null) => void;
    selectedImage: File | null;
}

export function ImageUploader({ onImageSelect, selectedImage }: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        // Basic validation
        if (!file.type.startsWith("image/")) {
            alert("Lütfen bir resim dosyası yükleyin.");
            return;
        }

        onImageSelect(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const clearImage = () => {
        onImageSelect(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            {!selectedImage ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={clsx(
                        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-3 border-dashed p-8 transition-all hover:bg-gray-50",
                        isDragging
                            ? "border-brand-purple bg-brand-purple/5"
                            : "border-gray-300"
                    )}
                >
                    <div className="mb-4 rounded-full bg-gray-100 p-4">
                        <Upload className={clsx("h-8 w-8", isDragging ? "text-brand-purple" : "text-gray-400")} />
                    </div>
                    <p className="mb-2 text-center text-lg font-bold text-gray-700">
                        Resim Yüklemek İçin Tıkla
                    </p>
                    <p className="text-center text-sm text-gray-500">
                        veya sürükleyip bırakın (JPG, PNG)
                    </p>
                </div>
            ) : (
                <div className="relative overflow-hidden rounded-xl border-2 border-black bg-gray-100 shadow-neo">
                    <button
                        onClick={clearImage}
                        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-transform hover:scale-110"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="relative aspect-square w-full sm:aspect-video">
                        {previewUrl && (
                            <Image
                                src={previewUrl}
                                alt="Uploaded preview"
                                fill
                                className="object-contain p-2"
                            />
                        )}
                    </div>

                    <div className="bg-white p-3 border-t-2 border-black">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-brand-purple" />
                            <span className="truncate text-sm font-medium text-gray-700">
                                {selectedImage.name}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
