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

async function generateAnalysisReport() {
    console.log("=== Generating Analysis Report ===\n");

    // 1. Fetch ALL scored prompts
    const { data: prompts, error } = await supabase
        .from('banana_prompts')
        .select('id, prompt, title, use_case, visual_style, camera_framing, lighting_type, subject_type, conversion_score, short_reason')
        .not('conversion_score', 'is', null)
        .order('conversion_score', { ascending: false });

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    // 2. Calculate Statistics
    const total_prompts = prompts.length;
    const score_counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    prompts.forEach(p => {
        if (score_counts[p.conversion_score] !== undefined) {
            score_counts[p.conversion_score]++;
        }
    });

    // 3. Construct the detailed Report Object
    const report = {
        timestamp: new Date().toISOString(),
        total_evaluations: total_prompts,
        score_distribution: {
            "score_5": score_counts[5],
            "score_4": score_counts[4],
            "score_3": score_counts[3],
            "score_2": score_counts[2],
            "score_1": score_counts[1]
        },
        top_tier_prompts: prompts
            .filter(p => p.conversion_score >= 4)
            .map(p => ({
                prompt_id: p.id,
                title: p.title,
                prompt_text: p.prompt,
                metadata: {
                    use_case: p.use_case,
                    visual_style: p.visual_style,
                    camera_framing: p.camera_framing,
                    lighting_type: p.lighting_type,
                    subject_type: p.subject_type,
                    conversion_score: p.conversion_score,
                    short_reason: p.short_reason
                }
            }))
    };

    // 4. Output Results
    console.log(`✅ Analyzed ${total_prompts} prompts.`);
    console.log(`📊 Distribution: 5★: ${score_counts[5]} | 4★: ${score_counts[4]} | 3★: ${score_counts[3]}`);

    // 5. Save to file
    const outputPath = path.resolve(process.cwd(), 'analysis_report.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${outputPath}`);
}

generateAnalysisReport();
