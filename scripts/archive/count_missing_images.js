// Count prompts with and without images
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function countImages() {
    console.log('📊 Resim İstatistikleri Analizi\n');
    console.log('='.repeat(50));

    // Get all prompts
    const { data: allPrompts, error } = await supabase
        .from('banana_prompts')
        .select('id, display_number, images, source, title')
        .order('display_number', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    const totalPrompts = allPrompts.length;

    // Count prompts with images
    const withImages = allPrompts.filter(p => p.images && p.images.length > 0);
    const withoutImages = allPrompts.filter(p => !p.images || p.images.length === 0);

    // Count by source
    const botsNanoSource = allPrompts.filter(p => p.source === 'BotsNANO');
    const youMindSource = allPrompts.filter(p => p.source === 'YouMind');
    const otherSource = allPrompts.filter(p => p.source !== 'BotsNANO' && p.source !== 'YouMind');

    // Count images per prompt
    const with1Image = withImages.filter(p => p.images.length === 1);
    const with2Images = withImages.filter(p => p.images.length === 2);
    const with3Images = withImages.filter(p => p.images.length === 3);
    const with4PlusImages = withImages.filter(p => p.images.length >= 4);

    console.log(`\n📦 TOPLAM PROMPT: ${totalPrompts}\n`);

    console.log('🖼️ RESİM DURUMU:');
    console.log(`   ✅ Resimli prompt:     ${withImages.length} (${(withImages.length / totalPrompts * 100).toFixed(1)}%)`);
    console.log(`   ❌ Resimsiz prompt:    ${withoutImages.length} (${(withoutImages.length / totalPrompts * 100).toFixed(1)}%)`);

    console.log('\n📊 RESİM SAYISINA GÖRE DAĞILIM:');
    console.log(`   1 resim:  ${with1Image.length}`);
    console.log(`   2 resim:  ${with2Images.length}`);
    console.log(`   3 resim:  ${with3Images.length}`);
    console.log(`   4+ resim: ${with4PlusImages.length}`);

    console.log('\n🏷️ KAYNAK DAĞILIMI:');
    console.log(`   BotsNANO: ${botsNanoSource.length}`);
    console.log(`   YouMind:  ${youMindSource.length}`);
    console.log(`   Diğer:    ${otherSource.length}`);

    // Show some examples of prompts without images
    console.log('\n📋 RESİMSİZ PROMPT ÖRNEKLERİ (Son 10):');
    const examples = withoutImages.slice(0, 10);
    examples.forEach(p => {
        console.log(`   #${String(p.display_number).padStart(5, '0')} - ${p.title?.substring(0, 40) || 'No title'}...`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('✅ Analiz tamamlandı');
}

countImages();
