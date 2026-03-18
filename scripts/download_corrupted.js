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

async function downloadRange() {
    const { data, error } = await supabase
        .from('banana_prompts')
        .select('*')
        .gte('display_number', 3414)
        .lte('display_number', 3540)
        .order('display_number', { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    fs.writeFileSync('corrupted_prompts.json', JSON.stringify(data, null, 2));
    console.log("Kayıtlar corrupted_prompts.json dosyasına indirildi.");
}

downloadRange();
