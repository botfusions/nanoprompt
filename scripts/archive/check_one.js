const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envConfig = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key) envConfig[key.trim()] = value.join('=').trim();
});

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSpecificPrompt() {
    console.log("=== Checking Specific Prompt: youmind_extract_1420 ===\n");

    const { data, error } = await supabase
        .from('banana_prompts')
        .select('id, title, conversion_score, visual_style, short_reason')
        .eq('id', 'youmind_extract_1420')
        .single();

    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("Current Data in Database:");
        console.log(JSON.stringify(data, null, 2));

        console.log("\nVERDICT:");
        if (data.conversion_score >= 4) {
            console.log("✅ Score is 4+, SHOULD be in Top Table.");
        } else {
            console.log(`❌ Score is ${data.conversion_score}. This is BELOW 4.`);
            console.log("Reason: Only prompts with score 4 or 5 go to 'banana_top_prompts'.");
        }
    }
}

checkSpecificPrompt();
