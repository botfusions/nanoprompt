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
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY gerekli!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Load all_prompts.json
const jsonPath = path.join(__dirname, '..', 'src', 'data', 'all_prompts.json');
const allPrompts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

async function syncBotsNANOPrompts() {
    console.log("=== BotsNANO Promptları Supabase'e Senkronize ===\n");

    // Local image kullanan BotsNANO source'lu promptları bul
    const botsNANOPrompts = allPrompts.filter(p =>
        p.source === 'BotsNANO' &&
        p.images?.some(img => img.includes('/images/botnano_extract'))
    );

    console.log(`Toplam ${botsNANOPrompts.length} prompt bulundu.\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const prompt of botsNANOPrompts) {
        // Supabase'de bu ID'ye göre güncelle
        const updateData = {
            images: prompt.images,
            source: 'BotsNANO'
        };

        const { error } = await supabase
            .from('banana_prompts')
            .update(updateData)
            .eq('id', prompt.id);

        if (error) {
            console.log(`❌ #${prompt.id}: ${error.message}`);
            errorCount++;
        } else {
            successCount++;
            if (successCount % 10 === 0) {
                console.log(`  ${successCount}/${botsNANOPrompts.length} senkronize edildi...`);
            }
        }
    }

    console.log(`\n=== Tamamlandı ===`);
    console.log(`✓ Başarılı: ${successCount}`);
    console.log(`✗ Hatalı: ${errorCount}`);
}

syncBotsNANOPrompts();
