const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envConfig = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key) envConfig[key.trim()] = value.join('=').trim();
});

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkStatus() {
    console.log("=== Prompt Status Report ===\n");

    // 1. Total Prompts
    const { count: total, error: err1 } = await supabase
        .from('banana_prompts')
        .select('*', { count: 'exact', head: true });

    // 2. Scored Prompts (Processed)
    const { count: scored, error: err2 } = await supabase
        .from('banana_prompts')
        .select('*', { count: 'exact', head: true })
        .not('conversion_score', 'is', null);

    // 3. Unscored Prompts (Waiting)
    // Theoretically Total - Scored, but let's query to be sure
    const { count: unscored, error: err3 } = await supabase
        .from('banana_prompts')
        .select('*', { count: 'exact', head: true })
        .is('conversion_score', null);

    if (err1 || err2 || err3) {
        console.error("Error fetching counts");
        return;
    }

    const percentage = ((scored / total) * 100).toFixed(1);

    console.log(`📦 Total Prompts:   ${total}`);
    console.log(`✅ Scored:          ${scored} (${percentage}%)`);
    console.log(`⏳ Waiting (New):   ${unscored}`);
    console.log("\n--------------------------------");

    if (unscored === 0) {
        console.log("🎉 ALL CAUGHT UP! System is waiting for new uploads.");
    } else {
        console.log(`🚀 ${unscored} prompts remaining to be processed.`);
    }
}

checkStatus();
