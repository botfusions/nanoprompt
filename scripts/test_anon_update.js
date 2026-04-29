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

async function testUpdate() {
    console.log("🛠️ Testing UPDATE permission with ANON KEY...");
    
    // #2953'ün mevcut halini al
    const { data: before } = await supabase
        .from('banana_prompts')
        .select('*')
        .eq('display_number', 2953)
        .single();

    if (!before) {
        console.error("Test record not found");
        return;
    }

    console.log(`Current model: ${before.model}`);
    
    // Küçük bir güncelleme dene (featured true/false değiştir)
    const { error: upErr } = await supabase
        .from('banana_prompts')
        .update({ featured: !before.featured })
        .eq('id', before.id);

    if (upErr) {
        console.error("❌ UPDATE FAILED with Anon Key:", upErr.message);
    } else {
        console.log("✅ UPDATE SUCCESSFUL with Anon Key!");
    }
}

testUpdate();
