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

async function exportCsvLocal() {
    console.log("=== Exporting High Score Prompts (Local) ===\n");

    // Fetch prompts with score >= 3
    const { data: prompts, error } = await supabase
        .from('banana_prompts')
        .select('id, title, prompt, use_case, visual_style, conversion_score, short_reason')
        .gte('conversion_score', 3)
        .order('conversion_score', { ascending: false });

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    if (!prompts || prompts.length === 0) {
        console.log("No high scoring prompts found.");
        return;
    }

    // Convert to CSV
    const headers = ['ID', 'Title', 'Prompt', 'Use Case', 'Visual Style', 'Score', 'Reason'];
    const csvRows = [headers.join(',')];

    for (const p of prompts) {
        const row = [
            p.id,
            `"${(p.title || '').replace(/"/g, '""')}"`, // Escape quotes
            `"${(p.prompt || '').replace(/"/g, '""')}"`,
            p.use_case || '',
            p.visual_style || '',
            p.conversion_score,
            `"${(p.short_reason || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    const fileName = `top_prompts_${new Date().toISOString().split('T')[0]}.csv`;
    const outputPath = path.resolve(process.cwd(), fileName);

    fs.writeFileSync(outputPath, csvContent, 'utf8');
    console.log(`✅ EXPORT SUCCESS!`);
    console.log(`📂 File saved to: ${outputPath}`);
    console.log(`📊 Total Prompts in CSV: ${prompts.length}`);
}

exportCsvLocal();
