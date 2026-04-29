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

async function inspectAll() {
    const pairs = [
        [3529, 3528], // Yeni eklendi (Görseldeki ikili)
        [3488, 3487], 
        [3475, 3474], 
        [3473, 3472], 
        [3465, 3464], 
        [3418, 3417]
    ];
    const flatIds = pairs.flat();

    const { data, error } = await supabase
        .from('banana_prompts')
        .select('id, display_number, title, prompt, images')
        .in('display_number', flatIds);

    if (error) {
        console.error(error);
        return;
    }

    console.log("\n--- MEVCUT DURUM ANALİZİ ---\n");
    for (const pair of pairs) {
        const p1 = data.find(p => p.display_number === pair[0]);
        const p2 = data.find(p => p.display_number === pair[1]);

        console.log(`PAIR: #${pair[0]} & #${pair[1]}`);
        if (p1) console.log(`  🔸 #${p1.display_number} [ID: ${p1.id}]: "${p1.prompt?.substring(0, 50)}..." | Images: ${p1.images?.length || 0}`);
        else console.log(`  ❌ #${pair[0]} BULUNAMADI`);

        if (p2) console.log(`  🔸 #${p2.display_number} [ID: ${p2.id}]: "${p2.prompt?.substring(0, 50)}..." | Images: ${p2.images?.length || 0}`);
        else console.log(`  ❌ #${pair[1]} BULUNAMADI`);
        console.log("");
    }
}

inspectAll();
