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
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check02964() {
    console.log("=== #02964 Kontrol ===\n");

    // display_number 2964 olanı ara
    const { data: byDisplayNum, error: e1 } = await supabase
        .from('banana_prompts')
        .select('id, title, display_number, prompt, images, created_at')
        .eq('display_number', 2964)
        .single();

    if (byDisplayNum) {
        console.log("display_number=2964 bulundu:");
        console.log("  ID:", byDisplayNum.id);
        console.log("  Title:", byDisplayNum.title);
        console.log("  Prompt length:", byDisplayNum.prompt?.length);
        console.log("  Images:", byDisplayNum.images?.length);
        console.log("  Created:", byDisplayNum.created_at);
    } else {
        console.log("display_number=2964 bulunamadı!");
        console.log("Hata:", e1?.message);
    }

    // Son 5 kaydı göster
    console.log("\n=== Son 5 Kayıt ===");
    const { data: last5 } = await supabase
        .from('banana_prompts')
        .select('id, title, display_number, created_at')
        .order('display_number', { ascending: false })
        .limit(5);

    last5?.forEach(p => {
        console.log(`  #${String(p.display_number).padStart(5, '0')} - ${p.title?.substring(0, 40)} (${p.created_at?.substring(0, 10)})`);
    });

    // Toplam sayı
    const { count } = await supabase
        .from('banana_prompts')
        .select('*', { count: 'exact', head: true });

    console.log("\nToplam prompt sayısı:", count);
}

check02964();
