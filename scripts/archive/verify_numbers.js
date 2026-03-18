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

async function verify() {
    let output = [];

    output.push("=== Display Number Doğrulama ===\n");

    // İlk 5 kayıt
    output.push("İlk 5 kayıt (en eski):");
    const { data: first5 } = await supabase
        .from('banana_prompts')
        .select('id, title, display_number')
        .order('display_number', { ascending: true })
        .limit(5);

    first5?.forEach(p => output.push(`  #${String(p.display_number).padStart(5, '0')} - ${p.title?.substring(0, 40)}`));

    // Son 5 kayıt
    output.push("\nSon 5 kayıt (en yeni):");
    const { data: last5 } = await supabase
        .from('banana_prompts')
        .select('id, title, display_number')
        .order('display_number', { ascending: false })
        .limit(5);

    last5?.forEach(p => output.push(`  #${String(p.display_number).padStart(5, '0')} - ${p.title?.substring(0, 40)}`));

    // #02953 (eski ID) nasıl görünüyor?
    output.push("\n#02953 ID'li kayıt:");
    const { data: p02953 } = await supabase
        .from('banana_prompts')
        .select('id, title, display_number')
        .eq('id', '02953')
        .single();

    if (p02953) {
        output.push(`  ID: ${p02953.id}`);
        output.push(`  Title: ${p02953.title}`);
        output.push(`  Display Number: ${p02953.display_number}`);
    }

    // Dosyaya yaz
    const outputPath = path.join(__dirname, 'verify_numbers.txt');
    fs.writeFileSync(outputPath, output.join('\n'));
    console.log("Doğrulama yazıldı:", outputPath);
}

verify();
