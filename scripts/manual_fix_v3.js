const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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
const key = envConfig.VITE_SUPABASE_ANON_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function manualFix() {
    console.log("🛠️ Spesifik kayıtlar düzeltiliyor (#3528, #3529, #3534, #3535)...");

    // 1. Verileri Çek
    const { data, error } = await supabase
        .from('banana_prompts')
        .select('id, display_number, prompt, images')
        .in('display_number', [3528, 3529, 3534, 3535]);

    if (error || !data) {
        console.error("Hata:", error);
        return;
    }

    const p3528 = data.find(p => p.display_number === 3528);
    const p3529 = data.find(p => p.display_number === 3529);
    const p3534 = data.find(p => p.display_number === 3534);
    const p3535 = data.find(p => p.display_number === 3535);

    if (!p3528 || !p3529 || !p3534 || !p3535) {
        console.error("Kayıtlar bulunamadı! Display Number'lar değişmiş olabilir.");
        return;
    }

    // İşlem A: #3528 ve #3529 Swap (Kullanıcı: #3529 Prompt = #3528 Image)
    const prompt28 = p3528.prompt;
    const prompt29 = p3529.prompt;

    console.log("🔄 #3528 ve #3529 Promptları yer değiştiriliyor...");
    await supabase.from('banana_prompts').update({ prompt: prompt29 }).eq('id', p3528.id);
    await supabase.from('banana_prompts').update({ prompt: prompt28 }).eq('id', p3529.id);

    // İşlem B: #3534 ve #3535 (Kullanıcı: 3535 Resim Yok, 3534 Resim Var, Prompt Yok)
    console.log("🔄 #3534 Resimi #3535'e aktarılıyor...");
    const image34 = p3534.images;
    await supabase.from('banana_prompts').update({ images: image34 }).eq('id', p3535.id);
    await supabase.from('banana_prompts').update({ images: [] }).eq('id', p3534.id); // 3534 resmini temizle (zaten 3535'e ait)

    // Not: Kullanıcı "3534 PROMPT YOKTUR" dedi. 
    // Eğer 3534'te şu an bir prompt varsa ve o aslında başka bir şeyse, boşaltabiliriz.
    // await supabase.from('banana_prompts').update({ prompt: '' }).eq('id', p3534.id);

    console.log("\n✅ Spesifik düzeltmeler başarıyla uygulandı.");
}

manualFix();
