// debug_display_numbers.js
// Supabase'deki promptların displayNumber değerlerini kontrol et

const fs = require('fs');
const path = require('path');
const { createClient } = require("@supabase/supabase-js");

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

async function debugDisplayNumbers() {
    console.log("=== DisplayNumber Debug ===\n");

    // İlk 10 prompt'u tarihe göre sıralı getir
    const { data: prompts, error } = await supabase
        .from("banana_prompts")
        .select("id, title, author, created_at, display_number, images")
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) {
        console.error("Hata:", error);
        return;
    }

    console.log("En son 20 prompt (tarihe göre):\n");
    console.log("-".repeat(100));

    prompts.forEach((p, idx) => {
        const imgCount = Array.isArray(p.images) ? p.images.length : 0;
        console.log(`${idx + 1}. ID: ${p.id}`);
        console.log(`   Title: ${p.title?.substring(0, 50)}...`);
        console.log(`   Author: @${p.author}`);
        console.log(`   DB display_number: ${p.display_number || 'YOK'}`);
        console.log(`   Oluşturulma: ${p.created_at}`);
        console.log(`   Resim sayısı: ${imgCount}`);
        console.log("-".repeat(100));
    });

    // 02953, 02952 ve problematik ID'leri kontrol et
    console.log("\n\n=== Problematik Promptlar ===\n");

    const targetIds = ['02953', '02952', 'fbdbed40-4991-457e-82af-81d250c1e3ed'];

    for (const id of targetIds) {
        const { data: prompt } = await supabase
            .from("banana_prompts")
            .select("*")
            .eq("id", id)
            .single();

        if (prompt) {
            console.log(`\nID: ${prompt.id}`);
            console.log(`  Title: ${prompt.title}`);
            console.log(`  Author: @${prompt.author}`);
            console.log(`  display_number: ${prompt.display_number || 'YOK'}`);
            console.log(`  images:`, JSON.stringify(prompt.images, null, 2));
        } else {
            console.log(`\nID "${id}" bulunamadı!`);
        }
    }
}

debugDisplayNumbers();
