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
const anonKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("URL:", supabaseUrl ? "OK" : "MISSING");
console.log("Anon Key:", anonKey ? "OK" : "MISSING");

const supabase = createClient(supabaseUrl, anonKey);

// Local JSON'dan #02953 verilerini al
const jsonPath = path.join(__dirname, '..', 'src', 'data', 'all_prompts.json');
const allPrompts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const p02953Local = allPrompts.find(p => p.id === '02953');

async function sync02953() {
    console.log("\n=== #02953 Supabase Senkronizasyonu (Anon Key) ===\n");

    if (!p02953Local) {
        console.log("HATA: #02953 local JSON'da bulunamadı!");
        return;
    }

    console.log("LOCAL veri:");
    console.log("  Title:", p02953Local.title);
    console.log("  Images:", p02953Local.images?.length, "adet");

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

    console.log("\nSupabase'e güncelleniyor (Anon Key ile)...");

    const { data, error } = await supabase
        .from('banana_prompts')
        .update(updateData)
        .eq('id', '02953')
        .select();

    if (error) {
        console.error("\n❌ GÜNCELLEME HATASI:", error.message);
        console.log("\n⚠️ RLS (Row Level Security) aktif olabilir!");
        console.log("ÇÖZÜM: .env.local dosyasına SUPABASE_SERVICE_ROLE_KEY ekleyin.");
        console.log("Bu key Supabase Dashboard > Settings > API bölümünden alınabilir.");
        return;
    }

    if (!data || data.length === 0) {
        console.log("\n⚠️ Güncelleme yapılamadı - RLS policy izin vermedi olabilir.");
        return;
    }

    console.log("✓ Güncelleme yapıldı! Dönen kayıt:", data.length);

    // Doğrulama
    const { data: verify } = await supabase
        .from('banana_prompts')
        .select('title, images, source')
        .eq('id', '02953')
        .single();

    console.log("\nSUPABASE (güncellenmiş):");
    console.log("  Title:", verify?.title);
    console.log("  Images:", verify?.images?.length, "adet");
    console.log("  Source:", verify?.source);
}

sync02953().catch(err => console.error("Script error:", err));
