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

async function debugScores() {
    console.log("=== Debugging Scores ===\n");

    // 1. Check if ANY scores are being written
    const { data: scored, error } = await supabase
        .from('banana_prompts')
        .select('id, conversion_score, visual_style')
        .not('conversion_score', 'is', null)
        .limit(20);

    if (error) {
        console.error("Error fetching scored prompts:", error);
        return;
    }

    console.log(`Found ${scored.length} scored prompts.`);

    // 2. List them to see if any are >= 4
    const highScorers = scored.filter(p => p.conversion_score >= 4);

    console.log("\n--- Valid Scores (Sample) ---");
    scored.forEach(p => console.log(`ID: ${p.id} | Score: ${p.conversion_score}`));

    console.log(`\nFound ${highScorers.length} prompts with Score >= 4.`);

    if (highScorers.length > 0) {
        // 3. Verify they are in top table
        const { count, error: topError } = await supabase
            .from('banana_top_prompts')
            .select('*', { count: 'exact', head: true });

        console.log(`\nEntries in 'banana_top_prompts' table: ${count}`);

        if (count < highScorers.length) {
            console.log("❌ CRITICAL: High scores exist but are NOT in top table.");
            console.log("Trigger failure confirmed.");
        } else {
            console.log("✅ Sync seems correct.");
        }
    } else {
        console.log("\n⚠️ No high scores found yet. The AI might be rating everything 1-3.");
    }
}

debugScores();
