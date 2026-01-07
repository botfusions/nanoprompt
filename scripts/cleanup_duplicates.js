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

const supabase = createClient(
    envConfig.NEXT_PUBLIC_SUPABASE_URL,
    envConfig.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupDuplicates() {
    console.log("🧹 Duplicate promptları temizleme...\n");

    // #03130-#03145 duplicate olarak eklendi, bunları sil
    const { data, error } = await supabase
        .from('banana_prompts')
        .delete()
        .gte('display_number', 3130)
        .lte('display_number', 3145)
        .select('id, display_number');

    if (error) {
        console.error("❌ Hata:", error);
        return;
    }

    console.log(`✅ ${data.length} duplicate prompt silindi.`);
    data.forEach(p => {
        console.log(`   - #${String(p.display_number).padStart(5, '0')}`);
    });

    // Kalan promptları kontrol et
    const { count } = await supabase
        .from('banana_prompts')
        .select('*', { count: 'exact', head: true });

    console.log(`\n📊 Kalan toplam prompt: ${count}`);
}

cleanupDuplicates();
