import { supabase } from "@/src/lib/supabase";

export interface Prompt {
  id: string;
  title: string;
  prompt: string;
  summary?: string;
  categories: string[];
  author: string;
  date: string;
  images: string[];
  featured?: boolean;
  hasWorkingImage?: boolean;
  displayNumber?: number; // Sabit numara - her zaman aynı kalır
  source?: 'migration' | 'user'; // Prompt kaynağı
  user_id?: string; // Kullanıcı promptı ise Firebase UID
  approved?: boolean; // Admin onayı
}

export const CATEGORIES = [
  "Tümü",
  "Fotoğrafçılık",
  "Doğa",
  "Portre",
  "Manzara",
  "Minimalist",
  "Araç",
  "Karakter",
  "Moda",
  "Logo",
  "Marka",
  "İllüstrasyon",
  "Ürün",
  "Karikatür",
  "Tipografi",
  "İç Tasarım",
  "3D",
  "Retro",
  "Yaratıcı"
];

// Mapping Turkish to English tags for filtering
export const CATEGORY_MAP: Record<string, string> = {
  "Tümü": "",
  "Fotoğrafçılık": "photography",
  "Doğa": "nature",
  "Portre": "portrait",
  "Manzara": "landscape",
  "Minimalist": "minimalist",
  "Araç": "vehicle",
  "Karakter": "character",
  "Moda": "fashion",
  "Logo": "logo",
  "Marka": "branding",
  "İllüstrasyon": "illustration",
  "Ürün": "product",
  "Karikatür": "cartoon",
  "Tipografi": "typography",
  "İç Tasarım": "interior",
  "3D": "3d",
  "Retro": "retro",
  "Yaratıcı": "creative"
};

// Fallback for types if needed, but mainly we use the fetcher now
export const PROMPTS: Prompt[] = [];

export async function getAllPrompts(): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from('banana_prompts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching prompts:", error);
    return [];
  }

  // HOTFIX: Manually correct the image for prompt #02207 (zerolu_64) since DB update is restricted
  const promptToFix = data.find(p => p.id === 'zerolu_64');
  if (promptToFix) {
    promptToFix.images = ['/images/botnano_extract_2207.png'];
  }

  // Filter out prompts with Korean or Chinese characters in prompt content
  const koreanChineseRegex = /[\u3131-\uD79D\u4e00-\u9fff]/;
  const englishOnlyPrompts = (data as Prompt[]).filter(prompt => {
    return !koreanChineseRegex.test(prompt.prompt || '');
  });

  // Önce tüm promptlara sabit numara ata (orijinal DB sırasına göre)
  // Bu numara asla değişmez - arama için kullanılır
  const promptsWithNumber = englishOnlyPrompts.map((prompt, index) => {
    const firstImage = prompt.images?.[0];
    // Geçerli görsel URL'si kontrolü - boş/placeholder değilse ve http ile başlıyorsa
    const hasWorkingImage = Boolean(
      firstImage &&
      firstImage.startsWith('http') &&
      !firstImage.includes('placeholder') &&
      firstImage.length > 10
    );
    return {
      ...prompt,
      hasWorkingImage,
      displayNumber: index + 1 // Sabit numara - DB sırasına göre
    };
  });

  // Sıralama: En yeni en üstte, sonra resim kalitesine göre
  // 1. Önce tarihe göre sırala (en yeni en üstte)
  // 2. Aynı gündeki promptlar için: Resim + Prompt > Resim + Başlık > Resimsiz
  promptsWithNumber.sort((a, b) => {
    // Önce tarihe göre sırala (en yeni en üstte)
    const dateA = new Date(a.date || '1970-01-01').getTime();
    const dateB = new Date(b.date || '1970-01-01').getTime();

    // Tarih farkı 1 günden fazlaysa tarihe göre sırala
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (Math.abs(dateA - dateB) > oneDayMs) {
      return dateB - dateA; // En yeni en üstte
    }

    // Aynı gün içindeyse resim kalitesine göre sırala
    const getCategory = (p: typeof a) => {
      if (p.hasWorkingImage && p.prompt && p.prompt !== p.title) return 1; // Resim + Gerçek Prompt
      if (p.hasWorkingImage) return 2; // Resim + Başlık
      return 3; // Resimsiz
    };
    return getCategory(a) - getCategory(b);
  });

  return promptsWithNumber;
}
