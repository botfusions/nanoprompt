
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local to get credentials
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectPrompt001() {
    console.log("Fetching latest prompts...");
    const { data, error } = await supabase
        .from('banana_prompts')
        .select('*')
        .order('created_at', { ascending: false }) // Matches prompts.ts logic for #1
        .limit(5);

    if (error) {
        console.error("Error:", error);
        return;
    }

    // Filter chinese/korean like prompts.ts does, to be accurate
    const koreanChineseRegex = /[\u3131-\uD79D\u4e00-\u9fff]/;
    const validPrompts = data.filter(prompt => {
        return !koreanChineseRegex.test(prompt.prompt || '');
    });

    if (validPrompts.length > 0) {
        const p1 = validPrompts[0];
        console.log("Potential Prompt #00001:");
        console.log(`ID: ${p1.id}`);
        console.log(`Title: ${p1.title}`);
        console.log(`Images: ${JSON.stringify(p1.images)}`);
        console.log(`Prompt: ${p1.prompt?.substring(0, 50)}...`);
    } else {
        console.log("No valid prompts found.");
    }
}

inspectPrompt001();
