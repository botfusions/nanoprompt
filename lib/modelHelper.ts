export interface ModelInfo {
  name: string;
  badgeClass: string;
}

/**
 * Resolves the model name and corresponding neo-brutalist badge styling
 * based on prompt data (model field, prompt text, title).
 */
export function resolvePromptModel(prompt: {
  model?: string;
  title?: string;
  prompt?: string;
}): ModelInfo {
  const explicit = (prompt.model || "").trim();
  const text = `${prompt.title || ""} ${prompt.prompt || ""}`;

  // 1. Specific GPT Image 2 / ChatGPT 2 / GPT-2 checks
  if (/\b(gpt\s*image\s*2|gpt-?2|chatgpt\s*2(\.0)?)\b/i.test(text)) {
    if (/chatgpt\s*2/i.test(text)) {
      return {
        name: "CHATGPT 2.0",
        badgeClass: "bg-emerald-100 text-emerald-950 border-emerald-600/60",
      };
    }
    if (/gpt\s*image\s*2/i.test(text)) {
      return {
        name: "GPT IMAGE 2",
        badgeClass: "bg-emerald-100 text-emerald-950 border-emerald-600/60",
      };
    }
    return {
      name: "GPT-2",
      badgeClass: "bg-emerald-100 text-emerald-950 border-emerald-600/60",
    };
  }

  // 2. GPT-4o
  if (/\b(gpt-?4o|gpt\s*4o)\b/i.test(text)) {
    return {
      name: "GPT-4o",
      badgeClass: "bg-emerald-100 text-emerald-950 border-emerald-600/60",
    };
  }

  // 3. General ChatGPT / GPT-4
  if (/\b(chatgpt|gpt-?4|gpt\s*4)\b/i.test(text)) {
    return {
      name: "CHATGPT",
      badgeClass: "bg-teal-100 text-teal-950 border-teal-600/60",
    };
  }

  // 4. Midjourney
  if (/\b(midjourney)\b/i.test(text) || /\b--v\s*[56]\b/i.test(text)) {
    return {
      name: "MIDJOURNEY",
      badgeClass: "bg-purple-100 text-purple-950 border-purple-600/60",
    };
  }

  // 5. Flux
  if (/\b(flux(\.1)?)\b/i.test(text)) {
    return {
      name: "FLUX",
      badgeClass: "bg-blue-100 text-blue-950 border-blue-600/60",
    };
  }

  // 6. DALL-E
  if (/\b(dall-?e(\s*3)?)\b/i.test(text)) {
    return {
      name: "DALL-E 3",
      badgeClass: "bg-amber-100 text-amber-950 border-amber-600/60",
    };
  }

  // 7. Stable Diffusion
  if (/\b(stable\s*diffusion|sdxl)\b/i.test(text)) {
    return {
      name: "STABLE DIFFUSION",
      badgeClass: "bg-orange-100 text-orange-950 border-orange-600/60",
    };
  }

  // 8. Seedance
  if (/\b(seedance)\b/i.test(text)) {
    return {
      name: "SEEDANCE",
      badgeClass: "bg-cyan-100 text-cyan-950 border-cyan-600/60",
    };
  }

  // 9. Kling AI
  if (/\b(kling(\s*ai)?)\b/i.test(text)) {
    return {
      name: "KLING AI",
      badgeClass: "bg-rose-100 text-rose-950 border-rose-600/60",
    };
  }

  // 10. Check if explicit model is set and not generic 'Nano banana pro'
  if (
    explicit &&
    explicit.toLowerCase() !== "nano banana pro" &&
    explicit.toLowerCase() !== "default"
  ) {
    return {
      name: explicit.toUpperCase(),
      badgeClass: "bg-gray-100 text-gray-900 border-gray-400",
    };
  }

  // Default: Nano Banana
  return {
    name: "NANO BANANA",
    badgeClass: "bg-brand-yellow/20 text-brand-black border-brand-yellow/50",
  };
}
