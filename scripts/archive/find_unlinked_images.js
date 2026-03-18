// Find unlinked images and verify synchronization
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findUnlinkedImages() {
    console.log('🔍 Eşleşmemiş Resim Analizi\n');
    console.log('='.repeat(60));

    // 1. Get all local botnano images
    const imagesDir = path.join(__dirname, '../public/images');
    const allFiles = fs.readdirSync(imagesDir);
    const botnanoFiles = allFiles.filter(f => f.startsWith('botnano_extract_') && f.endsWith('.png'));

    console.log(`\n📁 LOCAL RESİMLER: ${botnanoFiles.length} adet`);

    // 2. Get all BotsNANO prompts from Supabase
    const { data: botsNanoPrompts, error } = await supabase
        .from('banana_prompts')
        .select('id, display_number, images, title')
        .eq('source', 'BotsNANO');

    if (error) {
        console.error('Supabase Error:', error);
        return;
    }

    console.log(`📊 SUPABASE BotsNANO KAYITLARI: ${botsNanoPrompts.length} adet`);

    // 3. Extract image filenames from Supabase records
    const linkedImages = new Set();
    botsNanoPrompts.forEach(p => {
        if (p.images) {
            p.images.forEach(imgUrl => {
                // Extract filename from URL like /images/botnano_extract_XX.png
                const match = imgUrl.match(/botnano_extract_\d+\.png/);
                if (match) {
                    linkedImages.add(match[0]);
                }
            });
        }
    });

    console.log(`🔗 SUPABASE'DE BAĞLI RESİM: ${linkedImages.size} adet`);

    // 4. Find unlinked local images
    const unlinkedImages = botnanoFiles.filter(f => !linkedImages.has(f));

    console.log(`\n❌ BAĞLANMAMIŞ RESİMLER: ${unlinkedImages.length} adet`);
    if (unlinkedImages.length > 0) {
        console.log('\nBağlanmamış resimler:');
        unlinkedImages.forEach(img => console.log(`   - ${img}`));
    }

    // 5. Find prompts without images that could be matched
    const { data: noImagePrompts, error: error2 } = await supabase
        .from('banana_prompts')
        .select('id, display_number, title, prompt')
        .or('images.is.null,images.eq.{}')
        .order('display_number', { ascending: true })
        .limit(10);

    if (!error2 && noImagePrompts.length > 0) {
        console.log(`\n📋 RESİMSİZ PROMPT ÖRNEKLERİ (ilk 10):`);
        noImagePrompts.forEach(p => {
            console.log(`   #${String(p.display_number).padStart(5, '0')} - ${p.title?.substring(0, 40) || 'No title'}`);
        });
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 ÖZET:');
    console.log(`   Local resim dosyası:     ${botnanoFiles.length}`);
    console.log(`   Supabase BotsNANO kayıt: ${botsNanoPrompts.length}`);
    console.log(`   Bağlı resimler:          ${linkedImages.size}`);
    console.log(`   Bağlanmamış resimler:    ${unlinkedImages.length}`);

    if (unlinkedImages.length > 0) {
        console.log('\n⚠️  BU RESİMLER SİLİNEBİLİR VEYA PROMPT\'LARA ATANABİLİR');
    } else {
        console.log('\n✅ TÜM RESİMLER DOĞRU EŞLEŞTİRİLMİŞ');
    }
}

findUnlinkedImages();
