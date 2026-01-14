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

async function exportFilteredPrompts() {
    console.log("=== Exporting Filtered Prompts (Local) ===\n");

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
        console.log("No prompts found.");
        return;
    }

    console.log(`📊 Initial Total: ${prompts.length} prompts`);

    // Filtering Logic
    let keptCount = 0;
    let removedCounts = {
        language: 0,
        infographic: 0
    };

    const filteredPrompts = prompts.filter(p => {
        const textToCheck = (p.prompt + " " + p.title).toLowerCase();

        // 1. Check for Chinese/Korean characters
        // Chinese: \u4e00-\u9fa5, Korean: \uac00-\ud7a3
        const hasAsianChars = /[\u4e00-\u9fa5\uac00-\ud7a3]/.test(p.prompt) || /[\u4e00-\u9fa5\uac00-\ud7a3]/.test(p.title);
        if (hasAsianChars) {
            removedCounts.language++;
            return false;
        }

        // 2. Check for Infographic keywords
        const infographicKeywords = ['infographic', 'info-graphic', 'chart', 'diagram', 'data viz', 'visualization'];
        const isInfographic = infographicKeywords.some(kw => textToCheck.includes(kw));
        if (isInfographic) {
            removedCounts.infographic++;
            return false;
        }

        keptCount++;
        return true;
    });

    // Convert to CSV
    const headers = ['ID', 'Title', 'Prompt', 'Use Case', 'Visual Style', 'Score', 'Reason'];
    const csvRows = [headers.join(',')];

    for (const p of filteredPrompts) {
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
    const fileName = `top_prompts_cleaned_${new Date().toISOString().split('T')[0]}.csv`;
    const outputPath = path.resolve(process.cwd(), fileName);

    fs.writeFileSync(outputPath, csvContent, 'utf8');

    console.log(`\n✅ EXPORT SUCCESS!`);
    console.log(`----------------------------------------`);
    console.log(`📉 Initial Count:    ${prompts.length}`);
    console.log(`🗑️  Removed (Lang):   ${removedCounts.language} (Chinese/Korean)`);
    console.log(`🗑️  Removed (Info):   ${removedCounts.infographic} (Infographics)`);
    console.log(`✅ Final Count:      ${filteredPrompts.length}`);
    console.log(`----------------------------------------`);
    console.log(`📂 File saved to: ${outputPath}`);
}

exportFilteredPrompts();
