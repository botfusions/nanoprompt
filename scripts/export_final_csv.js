
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

function flattenObject(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? prefix + ' ' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
        } else if (Array.isArray(obj[k])) {
            acc[pre + k] = obj[k].join(', ');
        } else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
}

function formatPromptText(text) {
    if (!text) return '';

    let cleanText = text;

    // Try to parse as JSON
    try {
        // Sometimes the prompt text starts with "Prompt" or similar prefix before JSON, clean it
        let jsonCandidate = text.trim();
        if (jsonCandidate.startsWith('Prompt{')) {
            jsonCandidate = jsonCandidate.substring(6); // Remove 'Prompt' prefix if strictly attached
        }

        // Basic JSON finding logic if embedded
        const jsonMatch = jsonCandidate.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const flattened = flattenObject(parsed);
            // Convert to "key: value. key2: value2." format
            cleanText = Object.entries(flattened)
                .map(([k, v]) => `${k}: ${v}`)
                .join('. ');
        }
    } catch (e) {
        // Not JSON, continue with normal text
    }

    // Identify and format "Subject:", "Description:" patterns if they exist non-JSON
    // Replace newlines with spaces
    cleanText = cleanText.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

    // Remove "Prompt" word from start if present (often appears in data)
    if (cleanText.startsWith('Prompt')) {
        cleanText = cleanText.substring(6).trim();
    }

    return cleanText;
}

async function exportFinalCsv() {
    console.log("=== Exporting Final CSV (Formatted IDs & Flattened Prompts) ===\n");

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
    const filteredPrompts = prompts.filter(p => {
        const textToCheck = (p.prompt + " " + p.title).toLowerCase();

        // 1. Check for Chinese/Korean characters
        const hasAsianChars = /[\u4e00-\u9fa5\uac00-\ud7a3]/.test(p.prompt) || /[\u4e00-\u9fa5\uac00-\ud7a3]/.test(p.title);
        if (hasAsianChars) return false;

        // 2. Check for Infographic keywords
        const infographicKeywords = ['infographic', 'info-graphic', 'chart', 'diagram', 'data viz', 'visualization'];
        const isInfographic = infographicKeywords.some(kw => textToCheck.includes(kw));
        if (isInfographic) return false;

        return true;
    });

    // Convert to CSV
    const headers = ['ID', 'Title', 'Prompt', 'Use Case', 'Visual Style', 'Score', 'Reason'];
    const csvRows = [headers.join(',')];

    for (const p of filteredPrompts) {
        // ID Replacement
        const newId = (p.id || '').replace(/youmind/g, 'botfusions');

        // Text Cleaning
        const cleanTitle = (p.title || '').replace(/[\r\n]+/g, ' ').replace(/"/g, '""');
        const cleanPrompt = formatPromptText(p.prompt).replace(/"/g, '""');
        const cleanReason = (p.short_reason || '').replace(/[\r\n]+/g, ' ').replace(/"/g, '""');

        const row = [
            newId,
            `"${cleanTitle}"`,
            `"${cleanPrompt}"`,
            p.use_case || '',
            p.visual_style || '',
            p.conversion_score,
            `"${cleanReason}"`
        ];
        csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    const fileName = `top_prompts_final_${new Date().toISOString().split('T')[0]}.csv`;
    const outputPath = path.resolve(process.cwd(), fileName);

    fs.writeFileSync(outputPath, csvContent, 'utf8');

    console.log(`\n✅ EXPORT SUCCESS!`);
    console.log(`✅ Final Count:      ${filteredPrompts.length}`);
    console.log(`📂 File saved to: ${outputPath}`);
}

exportFinalCsv();
