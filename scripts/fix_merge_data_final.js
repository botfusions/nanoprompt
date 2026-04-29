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
const key = envConfig.VITE_SUPABASE_ANON_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function fixMergeData() {
    const pairs = [
        { link: 3529, main: 3528 }, // #3529 -> #3528
        { link: 3488, main: 3487 }, 
        { link: 3475, main: 3474 }, 
        { link: 3473, main: 3472 }, 
        { link: 3465, main: 3464 }, 
        { link: 3418, main: 3417 }
    ];

    console.log("🛠️ Multi-image veri aktarımı başlatılıyor (UPDATE)...");

    for (const { link, main } of pairs) {
        console.log(`\nProcessing #${link} -> #${main}`);

        // 1. İki kaydı da çek
        const { data: prompts } = await supabase
            .from('banana_prompts')
            .select('*')
            .in('display_number', [link, main]);

        if (!prompts || prompts.length < 2) {
            console.log(`  ⚠️ Pair #${link}-${main} bulunamadı veya eksik.`);
            continue;
        }

        const pLink = prompts.find(p => p.display_number === link);
        const pMain = prompts.find(p => p.display_number === main);

        if (!pLink || !pMain) continue;

        // 2. Resimleri birleştir
        const combinedImages = [...new Set([...(pMain.images || []), ...(pLink.images || [])])];
        console.log(`  🔹 #${main} Images: ${pMain.images?.length || 0} -> ${combinedImages.length}`);

        // 3. Main promptu GÜNCELLE
        const { error: upErr } = await supabase
            .from('banana_prompts')
            .update({ images: combinedImages })
            .eq('id', pMain.id);

        if (upErr) {
            console.error(`  ❌ #${main} GÜNCELLEME HATASI:`, upErr.message);
        } else {
            console.log(`  ✅ #${main} başarıyla güncellendi.`);
        }
    }
    console.log("\n🚀 Veri aktarımı bitti. Şimdi frontend filtresi uygulanmalı.");
}

fixMergeData();
