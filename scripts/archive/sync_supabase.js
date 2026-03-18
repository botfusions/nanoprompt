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
// Service Role Key kullan - RLS bypass için gerekli
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. SUPABASE_SERVICE_ROLE_KEY gerekli!");
    console.log("Mevcut keyler:", Object.keys(envConfig).filter(k => k.includes('SUPABASE')));
    process.exit(1);
}

console.log("Service Role Key kullanılıyor...");
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncToSupabase() {
    console.log("=== Supabase'e Sync ===\n");

    try {
        // #02953'ü upsert et
        console.log("1. #02953 Supabase'e sync ediliyor...");

        const prompt02953 = {
            id: "02953",
            title: "Athletic Runner - Sports Editorial Poster",
            prompt: "A side-profile shot of an athletic Black male runner mid-stride, captured in a high-energy sports editorial poster style. The image features mixed media elements with neon lime green scribbles outlining his body. Age 20-30, focused forward with determined energy. Lean athletic build, high knee lift in mid-air flight phase. Wearing grey hooded windbreaker jacket, black layered running shorts, white running sneakers with orange accents. Neon green doodle outline around the body as graphic overlay. Sports editorial mixed with graphic design poster style, eye-level tracking shot, full body wide shot, 3:4 vertical poster aspect ratio. Hard directional sunlight (golden hour) with sharp long shadows. Outdoor asphalt road background with large neon green typography 'EXERCISE' and hand-drawn arrows. Modern sports zine aesthetic.",
            summary: "Athletic Black male runner in dynamic mid-stride pose with neon green graphic overlays and sports editorial poster styling",
            author: "@BotFusionsS",
            date: new Date().toISOString(),
            categories: ["photography", "portrait", "creative", "sports"],
            images: [
                "https://pbs.twimg.com/media/G853Mz4bEAANDNB?format=jpg&name=small",
                "https://pbs.twimg.com/media/G853MzvagAECxtt?format=jpg&name=small"
            ],
            featured: false,
            model: "Nano banana pro",
            source: "BotsNANO"
        };

        const { error: upsertError } = await supabase
            .from('banana_prompts')
            .upsert(prompt02953, { onConflict: 'id' });

        if (upsertError) {
            console.error("  Upsert hatası:", upsertError);
        } else {
            console.log("  ✓ #02953 sync edildi!");
        }

        // Virgül sorununu düzelt
        console.log("\n2. Virgül sorunu düzeltiliyor (fbdbed40-4991-457e-82af-81d250c1e3ed)...");

        const fixedImages = [
            'https://pbs.twimg.com/media/G9GOHdRbkAATPj_?format=jpg&name=360x360',
            'https://pbs.twimg.com/media/G9GOHcuagAEA2Kt?format=jpg&name=360x360'
        ];

        const { error: fixError } = await supabase
            .from('banana_prompts')
            .update({ images: fixedImages })
            .eq('id', 'fbdbed40-4991-457e-82af-81d250c1e3ed');

        if (fixError) {
            console.error("  Düzeltme hatası:", fixError);
        } else {
            console.log("  ✓ Virgül sorunu düzeltildi!");
        }

        // Doğrulama
        console.log("\n3. Doğrulama...");

        const { data: verify02953 } = await supabase
            .from('banana_prompts')
            .select('id, title, images, author')
            .eq('id', '02953')
            .single();

        if (verify02953) {
            console.log(`  #02953: ${verify02953.title}`);
            console.log(`    images: ${verify02953.images?.length || 0} adet`);
            console.log(`    author: ${verify02953.author}`);
        }

        const { data: verifyComma } = await supabase
            .from('banana_prompts')
            .select('id, title, images')
            .eq('id', 'fbdbed40-4991-457e-82af-81d250c1e3ed')
            .single();

        if (verifyComma) {
            console.log(`  Virgül düzeltme: ${verifyComma.title}`);
            console.log(`    images: ${verifyComma.images?.length || 0} adet - ${JSON.stringify(verifyComma.images)}`);
        }

        console.log("\n=== Sync Tamamlandı ===");

    } catch (err) {
        console.error("Script hatası:", err);
    }
}

syncToSupabase();
