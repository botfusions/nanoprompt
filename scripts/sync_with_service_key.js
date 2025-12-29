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

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

console.log("URL:", supabaseUrl ? "OK" : "MISSING");
console.log("Service Role Key:", serviceRoleKey ? "OK (length: " + serviceRoleKey.length + ")" : "MISSING");

if (!serviceRoleKey) {
    console.log("\n⚠️ SUPABASE_SERVICE_ROLE_KEY bulunamadı!");
    console.log("Mevcut Supabase keys:", Object.keys(envConfig).filter(k => k.includes('SUPABASE')));
    process.exit(1);
}

// Service Role key ile client oluştur (RLS bypass)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Local JSON'dan #02953 verilerini al
const jsonPath = path.join(__dirname, '..', 'src', 'data', 'all_prompts.json');
const allPrompts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const p02953Local = allPrompts.find(p => p.id === '02953');

async function sync02953() {
    console.log("\n=== #02953 Supabase Senkronizasyonu (Service Role) ===\n");

    if (!p02953Local) {
        console.log("HATA: #02953 local JSON'da bulunamadı!");
        return;
    }

    console.log("LOCAL veri:");
    console.log("  Title:", p02953Local.title);
    console.log("  Images:", p02953Local.images?.length, "adet");
    console.log("  Source:", p02953Local.source);

    const updateData = {
        title: p02953Local.title,
        prompt: p02953Local.prompt,
        images: p02953Local.images,
        author: p02953Local.author || '@BotFusionsS',
        source: p02953Local.source,
        categories: p02953Local.categories || ['photography', 'portrait', 'creative'],
        featured: p02953Local.featured || false,
        model: p02953Local.model || 'Nano banana pro'
    };

    console.log("\nSupabase'e güncelleniyor (Service Role Key ile)...");

    const { data, error } = await supabase
        .from('banana_prompts')
        .update(updateData)
        .eq('id', '02953')
        .select();

    if (error) {
        console.error("\n❌ GÜNCELLEME HATASI:", JSON.stringify(error, null, 2));
        return;
    }

    console.log("✓ Güncelleme yanıtı:", data ? data.length + " kayıt güncellendi" : "Veri dönmedi");

    // Doğrulama
    console.log("\nDoğrulanıyor...");
    const { data: verify, error: verifyErr } = await supabase
        .from('banana_prompts')
        .select('id, title, images, source, prompt')
        .eq('id', '02953')
        .single();

    if (verifyErr) {
        console.error("Doğrulama hatası:", verifyErr);
        return;
    }

    console.log("\nSUPABASE (güncellenmiş) veri:");
    console.log("  Title:", verify.title);
    console.log("  Images:", verify.images?.length, "adet");
    console.log("  Source:", verify.source);
    console.log("  Prompt length:", verify.prompt?.length);

    if (verify.title === p02953Local.title && verify.images?.length === p02953Local.images?.length) {
        console.log("\n✅ BAŞARILI: #02953 Supabase'e doğru şekilde senkronize edildi!");
    } else {
        console.log("\n⚠️ Veri eşleşmiyor!");
    }
}

sync02953().catch(err => console.error("Script error:", err));
