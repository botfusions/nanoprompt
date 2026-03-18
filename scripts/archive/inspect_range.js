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

async function inspectRange() {
    console.log("🧐 #3530 - #3540 Aralığı Detaylı İnceleme:");
    
    const { data, error } = await supabase
        .from('banana_prompts')
        .select('display_number, title, prompt, images')
        .gte('display_number', 3530)
        .lte('display_number', 3540)
        .order('display_number', { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    data.forEach(p => {
        console.log(`[#${p.display_number}]`);
        console.log(`Title: ${p.title}`);
        console.log(`Prompt Length: ${p.prompt ? p.prompt.length : 0}`);
        console.log(`Images: ${JSON.stringify(p.images)}`);
        console.log("-".repeat(20));
    });
}

inspectRange();
