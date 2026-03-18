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

async function inspectPairsDetail() {
    const pairs = [[3488, 3487], [3475, 3474], [3473, 3472], [3465, 3464], [3418, 3417]];
    const flatIds = pairs.flat();

    const { data, error } = await supabase
        .from('banana_prompts')
        .select('display_number, prompt, images')
        .in('display_number', flatIds);

    pairs.forEach(pair => {
        const p1 = data.find(p => p.display_number === pair[0]);
        const p2 = data.find(p => p.display_number === pair[1]);
        
        console.log(`PAIR: #${pair[0]} vs #${pair[1]}`);
        if(p1 && p2) {
            console.log(`  P1 Prompt: ${p1.prompt?.substring(0, 30)}...`);
            console.log(`  P2 Prompt: ${p2.prompt?.substring(0, 30)}...`);
            console.log(`  P1 Image: ${p1.images?.[0]?.substring(0, 50)}...`);
            console.log(`  P2 Image: ${p2.images?.[0]?.substring(0, 50)}...`);
            
            if(p1.prompt === p2.images?.[0]) console.log("  ⚠️ UYARI: Birinin promptu diğerinin resmi (imkansız ama?)");
        }
        console.log("-".repeat(30));
    });
}

inspectPairsDetail();
