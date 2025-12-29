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

async function assignDisplayNumbers() {
    console.log("=== Display Number Atama ===\n");

    // Tüm promptları created_at'a göre sıralı al
    console.log("1. Tüm promptlar alınıyor...");
    const { data: allPrompts, error } = await supabase
        .from('banana_prompts')
        .select('id, title, created_at')
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Hata:", error);
        return;
    }

    console.log(`   Toplam ${allPrompts.length} prompt bulundu.\n`);

    // Her prompt'a sıralı numara ata
    console.log("2. Display number atanıyor...");
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allPrompts.length; i++) {
        const prompt = allPrompts[i];
        const displayNumber = i + 1; // 1'den başla

        const { error: updateError } = await supabase
            .from('banana_prompts')
            .update({ display_number: displayNumber })
            .eq('id', prompt.id);

        if (updateError) {
            // Sütun yoksa bu hata verir - SQL ile sütun eklememiz gerekebilir
            if (i === 0) {
                console.error("   İlk güncelleme hatası:", updateError.message);
                console.log("\n   ⚠️ 'display_number' sütunu tabloda yok olabilir!");
                console.log("   Supabase Dashboard'dan SQL ile ekleyin:");
                console.log("   ALTER TABLE banana_prompts ADD COLUMN display_number INTEGER;");
                return;
            }
            errorCount++;
        } else {
            successCount++;
            if ((i + 1) % 500 === 0) {
                console.log(`   ${i + 1}/${allPrompts.length} işlendi...`);
            }
        }
    }

    console.log(`\n3. Tamamlandı!`);
    console.log(`   ✓ Başarılı: ${successCount}`);
    console.log(`   ✗ Hatalı: ${errorCount}`);

    // Doğrulama - ilk ve son 3 kayıt
    console.log("\n4. Doğrulama:");
    const { data: first3 } = await supabase
        .from('banana_prompts')
        .select('id, title, display_number')
        .order('display_number', { ascending: true })
        .limit(3);

    console.log("   İlk 3:");
    first3?.forEach(p => console.log(`     #${String(p.display_number).padStart(5, '0')} - ${p.title?.substring(0, 30)}`));

    const { data: last3 } = await supabase
        .from('banana_prompts')
        .select('id, title, display_number')
        .order('display_number', { ascending: false })
        .limit(3);

    console.log("   Son 3:");
    last3?.forEach(p => console.log(`     #${String(p.display_number).padStart(5, '0')} - ${p.title?.substring(0, 30)}`));
}

assignDisplayNumbers();
