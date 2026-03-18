const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(process.cwd(), '.env');
const content = fs.readFileSync(envPath, 'utf8');
const envConfig = {};
content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const eq = trimmed.indexOf('=');
        if (eq > 0) envConfig[trimmed.substring(0, eq).trim()] = trimmed.substring(eq + 1).trim();
    }
});

const url = envConfig.VITE_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const key = envConfig.VITE_SUPABASE_ANON_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function analyze() {
    const { data, error } = await supabase
        .from('banana_prompts')
        .select('display_number, title, prompt, images')
        .gte('display_number', 3520)
        .lte('display_number', 3541)
        .order('display_number', { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    let report = "";
    data.forEach(p => {
        const hasPrompt = !!p.prompt && p.prompt.length > 2;
        const hasImages = !!p.images && Array.isArray(p.images) && p.images.length > 0;
        
        report += `[#${p.display_number}] ${p.title}\n`;
        report += `   Prompt: ${hasPrompt ? p.prompt.substring(0, 50) + '...' : '❌ BOŞ'}\n`;
        report += `   Images: ${hasImages ? p.images[0].substring(0, 50) + '...' : '❌ BOŞ'}\n`;
        report += "-".repeat(40) + "\n";
    });
    
    fs.writeFileSync('migration_check.txt', report);
    console.log("Rapor migration_check.txt dosyasına yazıldı.");
}

analyze();
