/**
 * Twitter Prompts -> Banana Prompts Import Script
 * 
 * Bu script twitter_prompts tablosundaki verileri 
 * banana_prompts tablosuna yeni display_number'larla aktarır.
 * Başarılı importtan sonra twitter_prompts tablosunu temizler.
 * 
 * Kullanım: node scripts/import_twitter_prompts.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// UUID oluşturma fonksiyonu
function generateUUID() {
    return crypto.randomUUID();
}

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
const serviceRoleKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

console.log("🔧 Supabase bağlantısı kontrol ediliyor...");
console.log("   URL:", supabaseUrl ? "OK" : "MISSING");
console.log("   Service Role Key:", serviceRoleKey ? "OK" : "MISSING");

if (!serviceRoleKey) {
    console.log("\n⚠️ SUPABASE_SERVICE_ROLE_KEY bulunamadı!");
    console.log("   .env.local dosyasına SUPABASE_SERVICE_ROLE_KEY ekleyin.");
    process.exit(1);
}

// Service Role key ile client oluştur (RLS bypass)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function importTwitterPrompts() {
    console.log("\n" + "=".repeat(60));
    console.log("🚀 Twitter Prompts -> Banana Prompts Import");
    console.log("=".repeat(60) + "\n");

    // 1. twitter_prompts tablosundan verileri al
    console.log("📥 twitter_prompts tablosu okunuyor...");
    const { data: twitterPrompts, error: twitterError } = await supabase
        .from('twitter_prompts')
        .select('*')
        .order('created_at', { ascending: true });

    if (twitterError) {
        console.error("❌ twitter_prompts okuma hatası:", twitterError.message);
        return { success: false, error: twitterError };
    }

    if (!twitterPrompts || twitterPrompts.length === 0) {
        console.log("ℹ️ twitter_prompts tablosu boş - import edilecek veri yok.");
        return { success: true, imported: 0 };
    }

    console.log(`✓ ${twitterPrompts.length} kayıt bulundu.\n`);

    // 2. banana_prompts tablosundaki en yüksek display_number'ı bul
    console.log("📊 Mevcut en yüksek display_number kontrol ediliyor...");
    const { data: maxData, error: maxError } = await supabase
        .from('banana_prompts')
        .select('display_number')
        .not('display_number', 'is', null)
        .order('display_number', { ascending: false })
        .limit(1);

    if (maxError) {
        console.error("❌ Max display_number okuma hatası:", maxError.message);
        return { success: false, error: maxError };
    }

    const maxDisplayNumber = maxData && maxData.length > 0 ? maxData[0].display_number : 0;
    let nextDisplayNumber = maxDisplayNumber + 1;

    console.log(`   Mevcut max: ${maxDisplayNumber}`);
    console.log(`   Yeni kayıtlar: ${nextDisplayNumber} - ${nextDisplayNumber + twitterPrompts.length - 1}\n`);

    // 3. Her kaydı ekle
    console.log("📤 Kayıtlar ekleniyor...\n");

    let successCount = 0;
    let errorCount = 0;
    const importedIds = [];

    for (let i = 0; i < twitterPrompts.length; i++) {
        const tp = twitterPrompts[i];
        const currentDisplayNumber = nextDisplayNumber + i;

        // Veriyi banana_prompts formatına dönüştür
        const newPrompt = {
            id: generateUUID(),
            title: tp.title || `Twitter Prompt #${currentDisplayNumber}`,
            prompt: tp.prompt || tp.content || '',
            images: tp.images || (tp.image_url ? [tp.image_url] : []),
            author: tp.author || tp.username || '@TwitterUser',
            source: tp.source || tp.tweet_url || 'Twitter',
            categories: tp.categories || ['twitter', 'imported'],
            featured: tp.featured || false,
            model: tp.model || 'Nano banana pro',
            display_number: currentDisplayNumber,
            created_at: new Date().toISOString()
        };

        // Insert işlemi
        const { data, error } = await supabase
            .from('banana_prompts')
            .insert(newPrompt)
            .select('id, display_number')
            .single();

        if (error) {
            console.log(`   ❌ [${i + 1}/${twitterPrompts.length}] #${String(currentDisplayNumber).padStart(5, '0')} - HATA: ${error.message}`);
            errorCount++;
        } else {
            console.log(`   ✅ [${i + 1}/${twitterPrompts.length}] #${String(currentDisplayNumber).padStart(5, '0')} - ${(newPrompt.title || '').substring(0, 40)}`);
            successCount++;
            importedIds.push(tp.id); // Başarılı import edilen Twitter prompt ID'lerini kaydet
        }
    }

    console.log("\n" + "-".repeat(60));
    console.log("📊 Import Sonucu:");
    console.log(`   ✅ Başarılı: ${successCount}`);
    console.log(`   ❌ Hatalı: ${errorCount}`);
    console.log("-".repeat(60));

    // 4. Başarılı import sonrası twitter_prompts tablosunu temizle
    if (successCount > 0 && importedIds.length > 0) {
        console.log("\n🧹 twitter_prompts tablosu temizleniyor...");

        const { error: deleteError } = await supabase
            .from('twitter_prompts')
            .delete()
            .in('id', importedIds);

        if (deleteError) {
            console.log(`   ⚠️ Temizleme hatası: ${deleteError.message}`);
            console.log("   Manuel temizleme gerekebilir.");
        } else {
            console.log(`   ✅ ${importedIds.length} kayıt twitter_prompts tablosundan silindi.`);
        }
    }

    return { success: true, imported: successCount, errors: errorCount };
}

// Önce tabloyu kontrol et
async function checkTwitterPromptsTable() {
    console.log("🔍 twitter_prompts tablosu kontrol ediliyor...\n");

    const { count, error } = await supabase
        .from('twitter_prompts')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("❌ Tablo hatası:", error.message);
        console.log("\n💡 Tablo mevcut olmayabilir veya erişim izni yok.");
        return false;
    }

    console.log(`✓ Tablo erişilebilir, ${count || 0} kayıt mevcut.`);
    return true;
}

// Ana fonksiyon
async function main() {
    console.log("\n" + "═".repeat(60));
    console.log("  📦 TWITTER PROMPTS IMPORT TOOL");
    console.log("  " + new Date().toLocaleString('tr-TR'));
    console.log("═".repeat(60));

    const tableExists = await checkTwitterPromptsTable();

    if (!tableExists) {
        console.log("\n⚠️ İşlem iptal edildi.");
        process.exit(1);
    }

    const result = await importTwitterPrompts();

    console.log("\n" + "═".repeat(60));
    if (result.success) {
        if (result.imported > 0) {
            console.log(`  ✅ İşlem tamamlandı! ${result.imported} prompt import edildi.`);
        } else {
            console.log("  ℹ️ Import edilecek veri bulunamadı.");
        }
    } else {
        console.log("  ❌ İşlem başarısız!");
    }
    console.log("═".repeat(60) + "\n");
}

main().catch(err => {
    console.error("\n❌ Script hatası:", err.message);
    process.exit(1);
});
