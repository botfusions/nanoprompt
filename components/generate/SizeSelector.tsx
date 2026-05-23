"use client";

import clsx from "clsx";

interface SizePreset {
  label: string;
  width: number;
  height: number;
  icon: string;
}

const SIZE_PRESETS: SizePreset[] = [
  { label: "1:1", width: 1024, height: 1024, icon: "□" },
  { label: "16:9", width: 1344, height: 768, icon: "▬" },
  { label: "9:16", width: 768, height: 1344, icon: "▮" },
  { label: "4:3", width: 1152, height: 896, icon: "▣" },
];

interface SizeSelectorProps {
  width: number;
  height: number;
  onSizeChange: (width: number, height: number) => void;
}

export function SizeSelector({ width, height, onSizeChange }: SizeSelectorProps) {
  const isActive = (preset: SizePreset) =>
    preset.width === width && preset.height === height;

  return (
    <div className="space-y-3">
      <label className="text-sm font-black uppercase tracking-wider text-black">
        Boyut
      </label>
      <div className="flex gap-2">
        {SIZE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onSizeChange(preset.width, preset.height)}
            className={clsx(
              "flex flex-col items-center gap-1 rounded-none border-2 border-black px-4 py-3 transition-all",
              isActive(preset)
                ? "bg-brand-yellow text-black shadow-neo"
                : "bg-white text-black shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            )}
          >
            <span className="text-lg">{preset.icon}</span>
            <span className="text-xs font-black">{preset.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {width} x {height}px
      </p>
    </div>
  );
}
