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

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestPrompts() {
    console.log("=== SUPABASE PROMPT ANALIZI ===\n");

    // Toplam
    const { count } = await supabase
        .from('banana_prompts')
        .select('*', { count: 'exact', head: true });
    console.log("Toplam prompt: " + count);

    // Sadece numerik ID'ler (00001, 02953 gibi)
    const { data: numericPrompts, error: numErr } = await supabase
        .from('banana_prompts')
        .select('id, title')
        .like('id', '0%')
        .order('id', { ascending: false })
        .limit(20);

    if (numErr) {
        console.error("Hata:", numErr);
    } else {
        console.log("\n--- Son 20 Numerik ID ---");
        numericPrompts.forEach(p => {
            console.log("#" + p.id + " | " + (p.title || 'N/A').substring(0, 50));
        });
    }

    // 02953 detayı
    console.log("\n--- #02953 Detay ---");
    const { data: p02953 } = await supabase
        .from('banana_prompts')
        .select('*')
        .eq('id', '02953')
        .single();

    if (p02953) {
        console.log("Title:", p02953.title);
        console.log("Images:", JSON.stringify(p02953.images));
        console.log("Source:", p02953.source);
        console.log("Prompt length:", (p02953.prompt || '').length);
    } else {
        console.log("#02953 BULUNAMADI!");
    }

    // 02954 var mı?
    console.log("\n--- #02954 Var mı? ---");
    const { data: p02954 } = await supabase
        .from('banana_prompts')
        .select('id, title')
        .eq('id', '02954')
        .single();

    if (p02954) {
        console.log("#02954 MEVCUT:", p02954.title);
    } else {
        console.log("#02954 YOK!");
    }
}

checkLatestPrompts();
