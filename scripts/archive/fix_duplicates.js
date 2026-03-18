// fix_duplicates.js
// 1. Construction kartını sil
// 2. 02953'ün prompt içeriğini kontrol et
// 3. Duplicate kartı bul ve sil

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
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDuplicates() {
    console.log("=== Duplicate ve Sorunlu Kartları Düzeltme ===\n");

    // 1. Önce #02953'ün mevcut durumunu kontrol et
    console.log("1. #02953 durumu kontrol ediliyor...");
    const { data: prompt02953 } = await supabase
        .from("banana_prompts")
        .select("*")
        .eq("id", "02953")
        .single();

    if (prompt02953) {
        console.log("   ID:", prompt02953.id);
        console.log("   Title:", prompt02953.title);
        console.log("   Author:", prompt02953.author);
        console.log("   Prompt:", prompt02953.prompt?.substring(0, 100) + "...");
        console.log("   Images:", prompt02953.images?.length, "adet");
    } else {
        console.log("   ⚠️ #02953 bulunamadı!");
    }

    // 2. Aynı resimlere sahip duplicate'leri bul
    console.log("\n2. Duplicate kartları arıyoruz (aynı resimler)...");
    const targetImages = [
        "https://pbs.twimg.com/media/G853Mz4bEAANDNB",
        "https://pbs.twimg.com/media/G853MzvagAECxtt"
    ];

    const { data: allPrompts } = await supabase
        .from("banana_prompts")
        .select("id, title, images, author");

    const duplicates = allPrompts?.filter(p => {
        if (!p.images || !Array.isArray(p.images)) return false;
        // Resimlerde aynı Twitter URL'leri var mı kontrol et
        return p.images.some(img =>
            targetImages.some(target => img && img.includes(target.split('/').pop()))
        );
    });

    console.log("   Bulunan kartlar:");
    duplicates?.forEach(d => {
        console.log(`   - ID: ${d.id}, Title: ${d.title}, Author: ${d.author}`);
    });

    // 3. "Construction of the Impossible" kartını bul
    console.log("\n3. 'Construction of the Impossible' kartını arıyoruz...");
    const constructionCards = allPrompts?.filter(p =>
        p.title?.toLowerCase().includes('construction')
    );

    constructionCards?.forEach(c => {
        console.log(`   - ID: ${c.id}, Title: ${c.title}`);
        console.log(`     Images: ${JSON.stringify(c.images)}`);
    });

    // 4. Silinecek kartları listele (02953 HARİÇ)
    console.log("\n4. Silinecek kartlar:");
    const toDelete = [];

    // 02953 ile aynı resimlere sahip ama 02953 olmayan kartlar
    duplicates?.filter(d => d.id !== '02953').forEach(d => {
        toDelete.push(d.id);
        console.log(`   - ${d.id}: ${d.title} (duplicate resimler)`);
    });

    // Construction kartları
    constructionCards?.forEach(c => {
        if (!toDelete.includes(c.id)) {
            toDelete.push(c.id);
            console.log(`   - ${c.id}: ${c.title} (görselsiz)`);
        }
    });

    console.log("\n=== Silme işlemi için bu script'i --delete flag ile çalıştırın ===");
    console.log(`   Silinecek ID'ler: ${toDelete.join(', ')}`);

    // --delete flag varsa sil
    if (process.argv.includes('--delete')) {
        console.log("\n5. Kartlar siliniyor...");
        for (const id of toDelete) {
            const { error } = await supabase
                .from("banana_prompts")
                .delete()
                .eq("id", id);

            if (error) {
                console.log(`   ❌ ${id} silinemedi:`, error.message);
            } else {
                console.log(`   ✅ ${id} silindi`);
            }
        }
    }
}

fixDuplicates();
