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

async function analyzeSchema() {
    let output = [];

    output.push("=== banana_prompts Tablo Yapısı ===\n");

    // Bir kayıt alıp tüm sütunları görelim
    const { data, error } = await supabase
        .from('banana_prompts')
        .select('*')
        .limit(1);

    if (error) {
        output.push("HATA: " + JSON.stringify(error));
    } else if (data && data[0]) {
        output.push("Mevcut Sütunlar:");
        Object.keys(data[0]).forEach(key => {
            const value = data[0][key];
            const valueType = typeof value;
            const sampleValue = JSON.stringify(value)?.substring(0, 50);
            output.push(`  ${key}: ${valueType} (örnek: ${sampleValue})`);
        });
    }

    // İlk 5 kaydı created_at'a göre sıralı al
    output.push("\n=== İlk 5 Kayıt (oluşturulma sırasına göre) ===");
    const { data: first5 } = await supabase
        .from('banana_prompts')
        .select('id, title, created_at, display_number')
        .order('created_at', { ascending: true })
        .limit(5);

    if (first5) {
        first5.forEach((p, idx) => {
            output.push(`${idx + 1}. ID: ${p.id?.substring(0, 20)} | display_number: ${p.display_number || 'YOK'} | created: ${p.created_at}`);
        });
    }

    // Son 5 kayıt
    output.push("\n=== Son 5 Kayıt (en yeni) ===");
    const { data: last5 } = await supabase
        .from('banana_prompts')
        .select('id, title, created_at, display_number')
        .order('created_at', { ascending: false })
        .limit(5);

    if (last5) {
        last5.forEach((p, idx) => {
            output.push(`${idx + 1}. ID: ${p.id?.substring(0, 20)} | display_number: ${p.display_number || 'YOK'} | title: ${p.title?.substring(0, 30)}`);
        });
    }

    // Dosyaya yaz
    const outputPath = path.join(__dirname, 'schema_analysis.txt');
    fs.writeFileSync(outputPath, output.join('\n'));
    console.log("Analiz yazıldı:", outputPath);
}

analyzeSchema();
