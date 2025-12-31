// Analyze and import Christmas card prompts from extract-data.json
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeAndImport() {
    console.log('📊 Extract Data Analizi ve İçe Aktarma\n');
    console.log('='.repeat(60));

    // 1. Load JSON data
    const jsonPath = path.join(__dirname, 'extract-data.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    const prompts = jsonData.christmas_card_prompts || [];
    console.log(`\n📦 JSON'da ${prompts.length} adet Christmas card prompt bulundu`);

    // 2. Get current max display_number
    const { data: maxData, error: maxError } = await supabase
        .from('banana_prompts')
        .select('display_number')
        .order('display_number', { ascending: false })
        .limit(1);

    if (maxError) {
        console.error('Max display_number error:', maxError);
        return;
    }

    let nextDisplayNumber = (maxData[0]?.display_number || 0) + 1;
    console.log(`📌 Sonraki display_number: ${nextDisplayNumber}`);

    // 3. Check for duplicates - compare by image URL
    const { data: existingPrompts, error: existError } = await supabase
        .from('banana_prompts')
        .select('images');

    if (existError) {
        console.error('Existing prompts error:', existError);
        return;
    }

    // Extract all existing image URLs
    const existingImageUrls = new Set();
    existingPrompts.forEach(p => {
        if (p.images) {
            p.images.forEach(img => existingImageUrls.add(img));
        }
    });

    console.log(`📊 Mevcut ${existingImageUrls.size} adet image URL var`);

    // 4. Filter new prompts (ones not already in DB)
    const newPrompts = prompts.filter(p => !existingImageUrls.has(p.image_url));
    console.log(`✨ ${newPrompts.length} adet YENİ prompt eklenecek`);

    if (newPrompts.length === 0) {
        console.log('\n⚠️  Tüm promptlar zaten veritabanında mevcut!');
        return;
    }

    // 5. Show first 5 examples
    console.log('\n📋 İlk 5 Örnek:');
    newPrompts.slice(0, 5).forEach((p, i) => {
        const shortPrompt = p.prompt.substring(0, 80).replace(/\n/g, ' ');
        console.log(`   ${i + 1}. ${shortPrompt}...`);
    });

    // 6. Import prompts
    console.log('\n🚀 İçe aktarma başlıyor...\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < newPrompts.length; i++) {
        const p = newPrompts[i];

        // Create title from first line or first 50 chars
        const firstLine = p.prompt.split('\n')[0];
        const title = firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;

        const promptData = {
            id: crypto.randomUUID(),
            title: title,
            prompt: p.prompt,
            images: [p.image_url],
            source: 'YouMind',
            display_number: nextDisplayNumber + i,
            created_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
            .from('banana_prompts')
            .insert(promptData);

        if (insertError) {
            console.log(`   ❌ #${nextDisplayNumber + i} - HATA: ${insertError.message}`);
            errorCount++;
        } else {
            if (i < 10 || i % 20 === 0) {
                console.log(`   ✅ #${String(nextDisplayNumber + i).padStart(5, '0')} - ${title.substring(0, 40)}...`);
            }
            successCount++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 ÖZET:');
    console.log(`   Başarılı: ${successCount}`);
    console.log(`   Hata: ${errorCount}`);
    console.log(`   Toplam: ${successCount + errorCount}`);

    if (successCount > 0) {
        console.log(`\n✅ ${successCount} yeni Christmas card prompt eklendi!`);
        console.log(`   Display numbers: #${String(nextDisplayNumber).padStart(5, '0')} - #${String(nextDisplayNumber + successCount - 1).padStart(5, '0')}`);
    }
}

analyzeAndImport();
