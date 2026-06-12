import { supabase } from "@/src/lib/supabase";
import { LOCAL_IMAGE_OVERRIDES, LOCAL_PROMPT_OVERRIDES } from './local_overrides';
import GPT_IMAGE_2_PROMPTS from './gpt_image_2_prompts.json';

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
  source?: 'migration' | 'user' | 'twitter'; // Prompt kaynağı
  user_id?: string; // Kullanıcı promptı ise Firebase UID
  approved?: boolean; // Admin onayı
}

export const CATEGORIES = [
  "Tümü",
  "🎄 Yılbaşı Kartları",
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
  "Yaratıcı",
  "Awesome GPT"
];

// Mapping Turkish to English tags for filtering
export const CATEGORY_MAP: Record<string, string> = {
  "Tümü": "",
  "🎄 Yılbaşı Kartları": "christmas",
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
  "Yaratıcı": "creative",
  "Awesome GPT": "awesome-gpt"
};

// Yılbaşı Kartları display_number aralığı (import edilenler)
export const CHRISTMAS_CARDS_RANGE = {
  start: 2973,
  end: 3112
};

// Fallback for types if needed, but mainly we use the fetcher now
export const PROMPTS: Prompt[] = [];

export async function getAllPrompts(): Promise<Prompt[]> {
  // Fetch from the main table only as twitter prompts are migrated here
  const { data, error } = await supabase
    .from('banana_prompts')
    .select('id, title, prompt, categories, author, created_at, images, featured, display_number, source, user_id, approved')
    .order('created_at', { ascending: false }) as { data: any[] | null; error: any };

  // Load GPT Image 2 Prompts
  const gpt2Prompts: Prompt[] = GPT_IMAGE_2_PROMPTS.map((p: any) => ({
    id: `gpt2_${p.id}`,
    title: p.title,
    prompt: p.prompt,
    summary: p.description,
    categories: ["Awesome GPT"],
    author: p.author || "YouMind",
    date: p.publishedAt || "2026-04-29",
    images: p.images.map((img: string) => `/assets/gpt_image_2/${img}`),
    source: 'migration',
    featured: false,
    approved: true
  }));

  if (error) {
    console.error("Error fetching banana_prompts:", error);
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

      // created_at değerini date olarak kullan (saat bilgisi için)
      if (p.created_at) {
        p.date = p.created_at;
      }

      // "Test Kuşlar" başlıklı promptu düzelt
      if (p.title === 'Test Kuşlar') {
        p.title = 'IMAGE PROMPT Pro prompt';
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

      // Prompt Content Cleaning (Remove top-level descriptions/sub-prompts at the top)
      if (p.prompt) {
        p.prompt = cleanPromptText(p.prompt);
      }
    });
  }

  // Combine with GPT-2 Prompts
  const allData = [...(data || []), ...gpt2Prompts];

  // Silinecek kartların ID'leri (duplicate ve sorunlu kartlar)
  const EXCLUDED_IDS = [
    'fbdbed40-4991-457e-82af-81d250c1e3ed', // 02953 ile aynı resimlere sahip duplicate
    'a326fe3a-592c-42c3-aa74-0ffffa2955fb', // #3529 (Link)
    '929c362d-0fb8-4229-8fba-2df47b3cd17c', // #3488 (Link)
    'e1f98501-ad2c-4f7f-ba00-72d80d286df0', // #3475 (Link)
    'ef130f14-07fa-4e7a-976d-1c32484501fc', // #3473 (Link)
    '2983b7db-1138-4540-ba75-3708b7dcdc2c', // #3465 (Link)
    '0af6af6-65b2-4fff-9a42-2341cb0bc7df'  // #3418 (Link)
  ];

  // Sorunlu kartları filtrele
  const filteredData = (allData as Prompt[]).filter(prompt => {
    // Excluded ID'leri çıkar
    if (EXCLUDED_IDS.includes(prompt.id)) return false;

    // "Construction of the Impossible" başlıklı kartları çıkar
    if (prompt.title?.toLowerCase().includes('construction of the impossible')) return false;

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
  // Görselsizler en sona gider ve author "IMAGE PROMPT" olur
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

  // Görselsiz kartlara AİTASVİR etiketi ata
  promptsWithNumber.forEach(p => {
    if (!p.hasWorkingImage) {
      p.author = 'AITASVIR';
    }
  });

  return promptsWithNumber;
}

/**
 * Prompt metnindeki gereksiz üst yazıları ve alt prompt karmaşasını temizler.
 */
function cleanPromptText(text: string): string {
  if (!text) return text;

  let cleaned = text.trim();

  // Pattern 1: Eğer metin içinde "---" gibi bir ayraç varsa, genellikle ayraçtan sonrası asıl promptdur.
  if (cleaned.includes('---')) {
    const parts = cleaned.split('---');
    // Son parçayı al (genelde açıklama --- prompt şeklinde olur)
    cleaned = parts[parts.length - 1].trim();
  } else if (cleaned.includes('===')) {
    const parts = cleaned.split('===');
    cleaned = parts[parts.length - 1].trim();
  }

  // Pattern 2: "Prompt:", "Alt Prompt:", "Final Prompt:", "Midjourney Prompt:" gibi kısımları temizle
  const labelsToRemove = [
    /^(Prompt|Alt Prompt|Final Prompt|Midjourney Prompt|Copy Prompt|Stable Diffusion Prompt):\s*/gi,
    /^(İşte prompt|Here is the prompt|Your prompt):\s*/gi
  ];

  for (const labelRegex of labelsToRemove) {
    cleaned = cleaned.replace(labelRegex, '');
  }

  // Gereksiz tırnakları ve başlardaki/sonlardaki boşlukları temizle
  cleaned = cleaned.replace(/^["'“”«»]|["'“”«»]$/g, '').trim();

  return cleaned;
}
