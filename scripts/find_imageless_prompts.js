const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env
const envPath = path.resolve(process.cwd(), '.env');
const content = fs.readFileSync(envPath, 'utf8');
const envConfig = {};
content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const eq = trimmed.indexOf('=');
        if (eq > 0) envConfig[trimmed.substring(0, eq).trim()] = trimmed.substring(eq + 1).trim();
    }
});

const url = envConfig.VITE_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const key = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.length < 10) return false;
  if (url.includes('placeholder')) return false;
  if (!url.startsWith('http') && !url.startsWith('/images/')) return false;

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

async function findImageless() {
    console.log("🔍 Database'deki tüm promptlar çekiliyor...");
    
    // pagination ile tüm veriyi çekelim (Supabase limitleri için)
    let allPrompts = [];
    let from = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('banana_prompts')
            .select('id, display_number, title, prompt, images, created_at')
            .order('created_at', { ascending: false })
            .range(from, from + limit - 1);

        if (error) {
            console.error("Hata:", error.message);
            return;
        }

        allPrompts = allPrompts.concat(data);
        if (data.length < limit) {
            hasMore = false;
        } else {
            from += limit;
        }
    }

    console.log(`Toplam ${allPrompts.length} prompt bulundu.`);

    const imageless = allPrompts.filter(p => {
        const images = p.images;
        if (!images || !Array.isArray(images) || images.length === 0) return true;
        const firstImage = images[0];
        return !isValidImageUrl(firstImage);
    });

    console.log(`Görselsiz prompt sayısı: ${imageless.length}`);

    // İlk 10 tanesini listele
    console.log("\n--- GÖRSELLEŞTİRİLECEK İLK 10 PROMPT ---\n");
    const count = Math.min(imageless.length, 10);
    const selected = imageless.slice(0, count);

    selected.forEach((p, idx) => {
        console.log(`${idx + 1}. [${p.display_number || 'No Num'}] ID: ${p.id}`);
        console.log(`   Başlık: ${p.title}`);
        console.log(`   Prompt: ${p.prompt?.substring(0, 150)}...`);
        console.log(`   Mevcut Görsel URL: ${JSON.stringify(p.images)}`);
        console.log("-".repeat(50));
    });

    // Sonuçları bir json dosyasına yazalım ki sonraki adımda kullanabilelim
    fs.writeFileSync(
        path.resolve(process.cwd(), 'imageless_temp.json'),
        JSON.stringify(selected, null, 2)
    );
    console.log("Seçilen 10 adet prompt 'imageless_temp.json' dosyasına kaydedildi.");
}

findImageless();
