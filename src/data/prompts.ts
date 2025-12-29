import { supabase } from "@/src/lib/supabase";
import { LOCAL_IMAGE_OVERRIDES, LOCAL_PROMPT_OVERRIDES } from './local_overrides';

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

  // Apply Local Overrides (Fix for missing images and prompts in DB)
  if (data) {
    data.forEach(p => {
      // Image overrides
      if (LOCAL_IMAGE_OVERRIDES[p.id]) {
        p.images = LOCAL_IMAGE_OVERRIDES[p.id];
      }

      // Prompt overrides - veritabanında boş/placeholder promptlar için
      if (LOCAL_PROMPT_OVERRIDES[p.id]) {
        p.prompt = LOCAL_PROMPT_OVERRIDES[p.id];
      }

      // "Test Kuşlar" başlıklı promptu düzelt
      if (p.title === 'Test Kuşlar') {
        p.title = 'Nano Banana Pro prompt';
        p.prompt = `Do this for a random famous Asian painting <instruction>

Input A is a Famous Painting (e.g., The Mona Lisa, The Scream). Analyze: The brushstroke technique, the 3D depth implied, and the hidden symbols. 
Goal: A "Paint Tube Squeeze." A giant, realistic oil paint tube sitting on a palette. 
Rules:

Action: The tube is being squeezed, and the paint coming out is not just a blob, but it forms the 3D landscape of the painting. The Mona Lisa's face is emerging in 3D relief from the 2D smear of paint. 

Texture: Viscous, thick oil paint texture (impasto).

Props: Paintbrushes, a dirty rag, a palette knife, plus culture appropriate tools and environment. 
 
Lighting: North-light studio lighting, true color representation. Output:
ONE image, 4:5, "artistic process" aesthetic. </instruction>`;
        p.displayNumber = 2954;
        p.date = '2025-12-29';
      }

      // Automatic Deduplication (Sanitize images)
      if (p.images && Array.isArray(p.images)) {
        p.images = [...new Set(p.images)];
      }
    });
  }

  // Silinecek kartların ID'leri (duplicate ve sorunlu kartlar)
  const EXCLUDED_IDS = [
    'fbdbed40-4991-457e-82af-81d250c1e3ed', // 02953 ile aynı resimlere sahip duplicate
  ];

  // Sorunlu kartları filtrele
  const filteredData = (data as Prompt[]).filter(prompt => {
    // Excluded ID'leri çıkar
    if (EXCLUDED_IDS.includes(prompt.id)) return false;

    // "Construction of the Impossible" başlıklı kartları çıkar
    if (prompt.title?.toLowerCase().includes('construction of the impossible')) return false;

    // "Nano Banana Pro" başlıklı kartları çıkar (02953 ile duplicate)
    if (prompt.title?.toLowerCase().includes('nano banana pro')) return false;

    return true;
  });

  // Filter out prompts with Korean or Chinese characters in prompt content
  const koreanChineseRegex = /[\u3131-\uD79D\u4e00-\u9fff]/;
  const englishOnlyPrompts = filteredData.filter(prompt => {
    return !koreanChineseRegex.test(prompt.prompt || '');
  });

  // Önce tüm promptlara sabit numara ata (veritabanındaki değer veya ID'den çıkar)
  // Bu numara asla değişmez - arama için kullanılır
  let sequentialNumber = 1; // UUID'li kartlar için sıralı numara

  const promptsWithNumber = englishOnlyPrompts.map((prompt, index) => {
    const firstImage = prompt.images?.[0];

    // Geçerli görsel URL'si kontrolü - gerçekten çalışan görsel URL'leri için
    // Sorunlu URL'ler: boş, null, placeholder, "alt text" içeren, uzantısız
    const isValidImageUrl = (url: string | undefined | null): boolean => {
      if (!url || typeof url !== 'string') return false;
      if (url.length < 10) return false;
      if (url.includes('placeholder')) return false;

      // HTTP veya local images ile başlamalı
      if (!url.startsWith('http') && !url.startsWith('/images/')) return false;

      // Görsel uzantısı veya Twitter format içermeli
      const hasImageFormat =
        url.includes('.jpg') ||
        url.includes('.jpeg') ||
        url.includes('.png') ||
        url.includes('.webp') ||
        url.includes('.gif') ||
        url.includes('format=jpg') ||
        url.includes('twimg.com');

      return hasImageFormat;
    };

    const hasWorkingImage = isValidImageUrl(firstImage);

    // displayNumber belirleme sırası:
    // 1. Veritabanındaki display_number varsa kullan
    // 2. ID sadece rakamlardan oluşuyorsa (örn: "02953") ID'yi numara olarak kullan
    // 3. UUID formatındaysa sıralı numara ata
    let displayNum = (prompt as any).display_number || (prompt as any).displayNumber;
    if (!displayNum && prompt.id) {
      // ID sadece rakamlardan oluşuyorsa (örn: "02953", "00001")
      if (/^\d+$/.test(prompt.id)) {
        displayNum = parseInt(prompt.id, 10);
      } else {
        // UUID veya diğer formatlar için sıralı numara ata
        displayNum = sequentialNumber++;
      }
    }

    return {
      ...prompt,
      hasWorkingImage,
      displayNumber: displayNum
    };
  });

  // Sıralama: Önce görselli kartlar, sonra görselsiz kartlar
  // Görselsizler en sona gider ve author "BotsNANO" olur
  promptsWithNumber.sort((a, b) => {
    // Öncelikle: Görselli kartlar her zaman görselsizlerden önce
    if (a.hasWorkingImage && !b.hasWorkingImage) return -1;
    if (!a.hasWorkingImage && b.hasWorkingImage) return 1;

    // Her iki kart da aynı kategorideyse (ikisi de görselli veya görselsiz):
    // Tarihe göre sırala (en yeni en üstte)
    const dateA = new Date(a.date || '1970-01-01').getTime();
    const dateB = new Date(b.date || '1970-01-01').getTime();
    return dateB - dateA; // En yeni en üstte
  });

  // Görselsiz kartlara BotsNANO etiketi ata
  promptsWithNumber.forEach(p => {
    if (!p.hasWorkingImage) {
      p.author = 'BotsNANO';
    }
  });

  return promptsWithNumber;
}
