const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let envConfig = {};

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            envConfig[key.trim()] = value.join('=').trim();
        }
    });
} catch (e) {
    console.error("Error loading .env.local", e);
}

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase credentials missing!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function countPrompts() {
    const { count, error } = await supabase
        .from('banana_prompts')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("Error counting:", error);
    } else {
        console.log(`Total Prompts: ${count}`);
    }
}

countPrompts();
