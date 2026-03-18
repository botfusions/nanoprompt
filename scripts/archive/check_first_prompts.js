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
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFirst5Prompts() {
    let output = [];

    output.push("=== İlk 5 Numerik ID'li Prompt ===\n");

    // 00001, 00002, 00003, 00004, 00005 kontrol
    for (let i = 1; i <= 5; i++) {
        const id = String(i).padStart(5, '0');
        const { data, error } = await supabase
            .from('banana_prompts')
            .select('id, title, images, source, author, display_number')
            .eq('id', id)
            .single();

        if (data) {
            output.push(`#${id}:`);
            output.push(`  Title: ${data.title}`);
            output.push(`  Author: ${data.author}`);
            output.push(`  Source: ${data.source}`);
            output.push(`  Display Number: ${data.display_number || 'YOK'}`);
            output.push(`  Images: ${data.images?.length || 0} adet`);
            output.push('');
        } else {
            output.push(`#${id}: BULUNAMADI`);
            output.push('');
        }
    }

    // #02953 de kontrol et
    output.push("=== #02953 ===");
    const { data: p02953 } = await supabase
        .from('banana_prompts')
        .select('id, title, author, source, display_number')
        .eq('id', '02953')
        .single();

    if (p02953) {
        output.push(`Title: ${p02953.title}`);
        output.push(`Display Number: ${p02953.display_number || 'YOK'}`);
    }

    // Dosyaya yaz
    const outputPath = path.join(__dirname, 'first_prompts.txt');
    fs.writeFileSync(outputPath, output.join('\n'));
    console.log("Analiz yazıldı:", outputPath);
}

checkFirst5Prompts();
