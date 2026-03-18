const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env
const envPath = path.resolve(process.cwd(), '.env');
const content = fs.readFileSync(envPath, 'utf8');
const envConfig = {};
content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const eq = trimmed.indexOf('=');
        if (eq > 0) envConfig[trimmed.substring(0, eq).trim()] = trimmed.substring(eq + 1).trim();
    }
});

const url = envConfig.VITE_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const key = envConfig.VITE_SUPABASE_ANON_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function checkIntegrity() {
    console.log("🔍 Son eklenen promptlar kontrol ediliyor (#3400+)...");
    
    const { data, error } = await supabase
        .from('banana_prompts')
        .select('id, display_number, title, prompt, images')
        .gt('display_number', 3400)
        .order('display_number', { ascending: true });

    if (error) {
        console.error("Hata:", error.message);
        return;
    }

    console.log(`Toplam ${data.length} kayıt inceleniyor.\n`);

    data.forEach(p => {
        const hasPrompt = !!p.prompt && p.prompt.length > 5;
        const hasImage = !!p.images && Array.isArray(p.images) && p.images.length > 0;
        
        if (!hasPrompt || !hasImage) {
            console.log(`⚠️ [#${p.display_number}] ID: ${p.id}`);
            console.log(`   Başlık: ${p.title}`);
            console.log(`   Prompt: ${hasPrompt ? 'OK' : '❌ EKSİK'}`);
            console.log(`   Resim:  ${hasImage ? 'OK' : '❌ EKSİK'}`);
            console.log("-".repeat(30));
        }
    });
}

checkIntegrity();
