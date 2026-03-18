const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

async function inspectMergePairs() {
    const pairs = [[3488, 3487], [3475, 3474], [3473, 3472], [3465, 3464], [3418, 3417]];
    const flatIds = pairs.flat();

    const { data, error } = await supabase
        .from('banana_prompts')
        .select('id, display_number, prompt, images')
        .in('display_number', flatIds);

    if (error) {
        console.error(error);
        return;
    }

    pairs.forEach(pair => {
        const p1 = data.find(p => p.display_number === pair[0]);
        const p2 = data.find(p => p.display_number === pair[1]);
        
        console.log(`PAIR: #${pair[0]} & #${pair[1]}`);
        if(p1) console.log(`  [#${p1.display_number}] Prompt: ${!!p1.prompt}, Images: ${p1.images && p1.images.length}`);
        if(p2) console.log(`  [#${p2.display_number}] Prompt: ${!!p2.prompt}, Images: ${p2.images && p2.images.length}`);
        console.log("-".repeat(20));
    });
}

inspectMergePairs();
