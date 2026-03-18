const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envConfig = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        envConfig[key.trim()] = value.join('=').trim();
    }
});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyFixes() {
    console.log("=== Supabase Prompt Düzeltmeleri v2 ===\n");

    try {
        // FIX 1: Virgül sorunu olan prompt - önce mevcut veriyi çek
        console.log("1. Virgül sorununu düzeltiliyor...");

        const commaFixId = 'fbdbed40-4991-457e-82af-81d250c1e3ed';

        // Önce mevcut veriyi çek
        const { data: currentData, error: getCurrentError } = await supabase
            .from('banana_prompts')
            .select('images')
            .eq('id', commaFixId)
            .single();

        if (getCurrentError) {
            console.error("  Mevcut veri çekilemedi:", getCurrentError);
            return;
        }

        console.log("  Mevcut images:", JSON.stringify(currentData.images));

        // Virgülle ayrılmış URL'leri ayır
        let fixedImages = [];
        if (currentData.images && currentData.images.length > 0) {
            currentData.images.forEach(img => {
                if (img && img.includes(',')) {
                    // Virgülle ayrılmış URL'leri böl
                    const splitUrls = img.split(',').map(u => u.trim()).filter(u => u.length > 0);
                    fixedImages.push(...splitUrls);
                } else if (img) {
                    fixedImages.push(img);
                }
            });
        }

        console.log("  Düzeltilmiş images:", JSON.stringify(fixedImages));

        // Güncelle
        const { error: updateError } = await supabase
            .from('banana_prompts')
            .update({ images: fixedImages })
            .eq('id', commaFixId);

        if (updateError) {
            console.error("  Güncelleme hatası:", updateError);
        } else {
            console.log("  ✓ Güncelleme başarılı!");
        }

        // Doğrula
        const { data: verifyData, error: verifyError } = await supabase
            .from('banana_prompts')
            .select('images')
            .eq('id', commaFixId)
            .single();

        if (!verifyError) {
            console.log("  Doğrulama - yeni images:", JSON.stringify(verifyData.images));
            console.log("  Resim sayısı:", verifyData.images?.length || 0);
        }

        // FIX 2: #02953 için ikinci resim bilgisi
        console.log("\n\n2. #02953 için durum raporu...");

        const { data: prompt02953 } = await supabase
            .from('banana_prompts')
            .select('*')
            .eq('id', '02953')
            .single();

        if (prompt02953) {
            console.log("  ID: 02953");
            console.log("  Title:", prompt02953.title);
            console.log("  Mevcut resimler:", JSON.stringify(prompt02953.images));
            console.log("\n  ⚠️ İkinci resim URL'sini bilmiyorum - lütfen sağlayın.");
        }

        // FIX 3: #02952 durumu
        console.log("\n\n3. #02952 eksik - oluşturulması gerekiyor");
        console.log("  ⚠️ #02952 için prompt içeriği ve resim URL'si gerekiyor.");

        console.log("\n=== Script Tamamlandı ===");

    } catch (err) {
        console.error("Script hatası:", err);
    }
}

applyFixes();
