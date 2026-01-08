const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envConfig = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        envConfig[key.trim()] = value.join('=').trim();
    }
});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzePrompts() {
    console.log("=== Supabase Prompt Analizi ===\n");

    // En son 10 prompt'u çek
    const { data: latest, error } = await supabase
        .from('banana_prompts')
        .select('id, title, prompt, images, source, author, created_at, conversion_score, visual_style, use_case')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Hata:", error);
        return;
    }

    console.log("Son 10 prompt:\n");
    latest?.forEach((p, i) => {
        const promptSnippet = p.prompt?.substring(0, 80) || '(boş)';
        console.log(`[${i + 1}] ID: ${p.id}`);
        console.log(`    Title: ${p.title}`);
        console.log(`    Prompt: ${promptSnippet}...`);
        console.log(`    Images: ${p.images?.length || 0} adet`);
        console.log(`    Source: ${p.source}`);
        console.log(`    Author: ${p.author}`);
        console.log(`    Score: ${p.conversion_score || 'N/A'}`);
        console.log(`    Style: ${p.visual_style || 'N/A'}`);
        console.log(`    Use Case: ${p.use_case || 'N/A'}`);
        console.log('');
    });

    // "Athletic" veya "runner" içeren prompt'ları ara
    console.log("\n--- 'Athletic' veya 'runner' içeren promptlar ---\n");

    const { data: runnerPrompts, error: runnerError } = await supabase
        .from('banana_prompts')
        .select('id, title, prompt, images')
        .or('prompt.ilike.%athletic%,prompt.ilike.%runner%,title.ilike.%runner%')
        .limit(5);

    if (runnerError) {
        console.error("Arama hatası:", runnerError);
    } else {
        runnerPrompts?.forEach(p => {
            console.log(`ID: ${p.id}`);
            console.log(`Title: ${p.title}`);
            console.log(`Prompt snippet: ${p.prompt?.substring(0, 100)}...`);
            console.log(`Images: ${JSON.stringify(p.images)}`);
            console.log('');
        });
    }
}

analyzePrompts();
