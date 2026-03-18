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

async function checkTopPrompts() {
    console.log("=== Checking banana_top_prompts ===\n");

    // 1. Check banana_top_prompts count
    const { count: topCount, error: topError } = await supabase
        .from('banana_top_prompts')
        .select('*', { count: 'exact', head: true });

    console.log(`banana_top_prompts count: ${topCount} (Error: ${topError?.message || 'None'})`);

    // 2. Check banana_prompts for high scores (>= 3 now)
    const { count: highScoresCount, error: mainError } = await supabase
        .from('banana_prompts')
        .select('*', { count: 'exact', head: true })
        .gte('conversion_score', 3);

    console.log(`banana_prompts (score >= 3) count: ${highScoresCount} (Error: ${mainError?.message || 'None'})`);

    // 3. Compare and suggest fix
    if (highScoresCount > 0 && topCount < highScoresCount) {
        console.log("\n⚠️ MISMATCH DETECTED!");
        console.log("High scores (3+) exist in main table but are missing from top table.");
        console.log("Likely cause: Updates happened before trigger was active or threshold changed.");
        console.log("Running backfill...");

        // Manual Backfill
        const { data: highPrompts } = await supabase
            .from('banana_prompts')
            .select('*')
            .gte('conversion_score', 3);

        for (const p of highPrompts) {
            const { error: insertError } = await supabase
                .from('banana_top_prompts')
                .upsert({
                    id: p.id,
                    prompt: p.prompt,
                    title: p.title,
                    images: p.images,
                    conversion_score: p.conversion_score,
                    visual_style: p.visual_style,
                    short_reason: p.short_reason
                });

            if (insertError) console.error(`Failed to copy ${p.id}:`, insertError.message);
            else console.log(`Synced: ${p.id}`);
        }
        console.log("Backfill complete.");
    } else {
        console.log("\nSync status looks OK (or no high scores yet).");
    }
}

checkTopPrompts();
