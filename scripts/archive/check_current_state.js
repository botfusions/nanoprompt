const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envConfig = {};
envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
        const eqIndex = trimmedLine.indexOf('=');
        if (eqIndex > 0) {
            const key = trimmedLine.substring(0, eqIndex).trim();
            const value = trimmedLine.substring(eqIndex + 1).trim();
            envConfig[key] = value;
        }
    }
});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    console.log("🔍 Checking banana_prompts table...");
    const { data, error } = await supabase
        .from('banana_prompts')
        .select('*')
        .limit(1);

    if (error) {
        console.error("❌ Error selecting from banana_prompts:", error.message);
    } else if (data && data.length > 0) {
        console.log("✅ Successfully connected to banana_prompts.");
        console.log("Columns:", Object.keys(data[0]));

        const { count, error: countError } = await supabase
            .from('banana_prompts')
            .select('*', { count: 'exact', head: true })
            .is('display_number', null);

        if (countError) {
            console.log("⚠️ Could not check for null display_number. Column might be missing.");
        } else {
            console.log(`📊 Records with null display_number: ${count}`);
        }
    } else {
        console.log("⚠️ No records found in banana_prompts.");
    }

    console.log("\n🔍 Checking twitter_prompts table...");
    const { data: tData, error: tError } = await supabase
        .from('twitter_prompts')
        .select('*', { count: 'exact', head: true });

    if (tError) {
        console.log(`❌ twitter_prompts table error: ${tError.message}`);
    } else {
        console.log(`✅ twitter_prompts table exists, count: ${tData ? "unknown" : "accessible"}`);
        const { count: tCount } = await supabase.from('twitter_prompts').select('*', { count: 'exact', head: true });
        console.log(`📊 twitter_prompts count: ${tCount}`);
    }
}

checkDatabase();
