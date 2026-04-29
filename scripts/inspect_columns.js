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

async function inspectColumns() {
    const { data } = await supabase.from('banana_prompts').select('*').limit(1).single();
    if (data) {
        console.log("Columns:", Object.keys(data).join(', '));
    }
}
inspectColumns();
