const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envConfig = {};
envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
        const eqIndex = trimmedLine.indexOf('=');
        if (eqIndex > 0) {
            const key = trimmedLine.substring(0, eqIndex).trim();
            const value = trimmedLine.substring(eqIndex + 1).trim();
            envConfig[key] = value;
        }
    }
});

const supabase = createClient(
    envConfig.NEXT_PUBLIC_SUPABASE_URL,
    envConfig.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAndCleanup() {
    // 1. #03129'un görselini güncelle (asıl kayıt #03129, #03145 duplicate)
    console.log("🖼️ #03129 görsel güncelleniyor...\n");

    const newImageUrl = "https://pbs.twimg.com/media/G-AbDnnXIAAozQf?format=jpg&name=small";

    const { data: updated, error: updateErr } = await supabase
        .from('banana_prompts')
        .update({ images: [newImageUrl] })
        .eq('display_number', 3129)
        .select('id, display_number, images');

    if (updateErr) {
        console.error("❌ Güncelleme hatası:", updateErr);
    } else {
        console.log("✅ #03129 görsel güncellendi:", updated[0]?.images);
    }

    // 2. Duplicate'leri sil (#03130-#03145)
    console.log("\n🧹 Duplicate promptları temizleniyor (#03130-#03145)...\n");

    const { data: deleted, error: deleteErr } = await supabase
        .from('banana_prompts')
        .delete()
        .gte('display_number', 3130)
        .lte('display_number', 3145)
        .select('id, display_number');

    if (deleteErr) {
        console.error("❌ Silme hatası:", deleteErr);
    } else {
        console.log(`✅ ${deleted.length} duplicate prompt silindi.`);
    }

    // 3. Sonuç kontrol
    const { count } = await supabase
        .from('banana_prompts')
        .select('*', { count: 'exact', head: true });

    console.log(`\n📊 Kalan toplam prompt: ${count}`);
    console.log("✅ İşlem tamamlandı!");
}

fixAndCleanup();
