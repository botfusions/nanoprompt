const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local
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
// Fallback to ANON key if SERVICE_ROLE_KEY not available
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("URL exists:", !!supabaseUrl);
console.log("Key exists:", !!supabaseKey);
console.log("Keys found:", Object.keys(envConfig).join(', '));

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixSupabase() {
    let output = [];

    output.push("=== SUPABASE ANALİZ ===\n");

    // Toplam sayı
    const { count, error: countErr } = await supabase
        .from('banana_prompts')
        .select('*', { count: 'exact', head: true });

    if (countErr) {
        output.push("Count HATA: " + JSON.stringify(countErr));
    } else {
        output.push("Toplam Supabase prompt: " + count);
    }

    // #02953 var mı?
    const { data: p02953, error: e02953 } = await supabase
        .from('banana_prompts')
        .select('id, title, images, source, prompt')
        .eq('id', '02953')
        .single();

    output.push("\n--- #02953 Supabase ---");
    if (e02953) {
        output.push("HATA: " + JSON.stringify(e02953));
    } else if (p02953) {
        output.push("Title: " + p02953.title);
        output.push("Images: " + JSON.stringify(p02953.images));
        output.push("Source: " + p02953.source);
        output.push("Prompt length: " + (p02953.prompt || '').length);
    } else {
        output.push("#02953 Supabase'de YOK!");
    }

    // Son numerik ID'ler
    output.push("\n--- Supabase'de Son 10 Numerik ID (0XXXX) ---");
    const { data: numericPrompts, error: numErr } = await supabase
        .from('banana_prompts')
        .select('id, title, source')
        .like('id', '0%')
        .order('id', { ascending: false })
        .limit(10);

    if (numErr) {
        output.push("Son ID HATA: " + JSON.stringify(numErr));
    } else if (numericPrompts) {
        numericPrompts.forEach(p => {
            output.push("#" + p.id + " | " + (p.title || 'N/A').substring(0, 40) + " | " + (p.source || 'N/A'));
        });
    }

    // Dosyaya yaz
    const outputPath = path.join(__dirname, 'supabase_analysis.txt');
    fs.writeFileSync(outputPath, output.join('\n'));
    console.log("Analiz yazıldı: " + outputPath);
}

checkAndFixSupabase().catch(err => console.error("Error:", err));
