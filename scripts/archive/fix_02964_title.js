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
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTitle() {
    console.log("=== #02964 Başlık Düzeltme ===\n");

    // Mevcut başlığı al
    const { data: current } = await supabase
        .from('banana_prompts')
        .select('id, title')
        .eq('display_number', 2964)
        .single();

    console.log("Mevcut başlık:", current?.title);

    // Yeni başlık - "Nano Banana Pro" yerine daha açıklayıcı bir başlık
    const newTitle = "Bronze Beach Portrait - Summer Vibes";

    const { error } = await supabase
        .from('banana_prompts')
        .update({ title: newTitle })
        .eq('display_number', 2964);

    if (error) {
        console.error("Hata:", error);
    } else {
        console.log("Yeni başlık:", newTitle);
        console.log("✓ Başlık güncellendi!");
    }
}

fixTitle();
