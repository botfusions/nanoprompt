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

async function debugPrompt() {
    let output = [];
    output.push("=== #02964 Debug ===\n");

    const { data } = await supabase
        .from('banana_prompts')
        .select('*')
        .eq('display_number', 2964)
        .single();

    if (!data) {
        output.push("Kayıt bulunamadı!");
        fs.writeFileSync(path.join(__dirname, 'debug_output.txt'), output.join('\n'));
        return;
    }

    output.push("Kayıt bulundu:");
    output.push("  ID: " + data.id);
    output.push("  Title: " + data.title);
    output.push("  Prompt: " + (data.prompt?.substring(0, 100) || 'BOŞ'));
    output.push("  Images: " + JSON.stringify(data.images));
    output.push("  Author: " + data.author);
    output.push("  Source: " + data.source);
    output.push("  Featured: " + data.featured);
    output.push("  Display Number: " + data.display_number);
    output.push("  Created At: " + data.created_at);

    // Korece/Çince karakterler var mı?
    const koreanChineseRegex = /[\u3131-\uD79D\u4e00-\u9fff]/;
    const hasKoreanChinese = koreanChineseRegex.test(data.prompt || '');
    output.push("\n  Korece/Çince var mı? " + (hasKoreanChinese ? "EVET - FİLTRELENECEK!" : "Hayır"));

    // Title kontrolü
    const badTitles = ['construction of the impossible', 'nano banana pro'];
    const isBadTitle = badTitles.some(bad => data.title?.toLowerCase().includes(bad));
    output.push("  Kötü başlık mı? " + (isBadTitle ? "EVET - FİLTRELENECEK!" : "Hayır"));

    // Görsel kontrolü
    const hasValidImage = data.images && data.images.length > 0 &&
        data.images[0]?.startsWith('http');
    output.push("  Geçerli görsel var mı? " + (hasValidImage ? "Evet" : "Hayır - Sona gidecek"));

    fs.writeFileSync(path.join(__dirname, 'debug_output.txt'), output.join('\n'));
    console.log("Debug output yazıldı.");
}

debugPrompt();
