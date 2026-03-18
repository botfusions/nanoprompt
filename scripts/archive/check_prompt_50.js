
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPrompt50() {
    const { data, error } = await supabase
        .from('banana_prompts')
        .select('id, images, title')
        .eq('id', 'youmind_extract_50')
        .single();

    if (error) {
        console.error("Error fetching prompt:", error);
    } else {
        console.log("DB Data for youmind_extract_50:");
        console.log(JSON.stringify(data, null, 2));
    }
}

checkPrompt50();
