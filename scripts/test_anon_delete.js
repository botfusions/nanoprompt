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

async function testDelete() {
    console.log("🛠️ Testing DELETE permission with ANON KEY...");
    
    // Geçici bir kayıt yaratıp silmeyi deneyelim (Ama ANON KEY ile insert yetkisi var mı?)
    // Varsa 2953 üzerinde (featured false ise) delete testi yerine, id'si bilinen bir çiftin biri üzerinde deneyelim
    const pairIdToDelete = 'a326fe3a-592c-42c3-aa74-0ffffa2955fb'; // #3529

    const { error: delErr } = await supabase
        .from('banana_prompts')
        .delete()
        .eq('id', pairIdToDelete);

    if (delErr) {
        console.error("❌ DELETE FAILED with Anon Key:", delErr.message);
        console.error("Error Detail:", JSON.stringify(delErr, null, 2));
    } else {
        console.log("✅ DELETE SUCCESSFUL with Anon Key!");
    }
}

testDelete();
