// Assign unlinked images to prompts without images
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Unlinked images with their content descriptions
const unlinkedImages = [
    { file: 'botnano_extract_94.png', desc: 'Kış şale selfie' },
    { file: 'botnano_extract_96.png', desc: 'Akdeniz sahil portre' },
    { file: 'botnano_extract_97.png', desc: 'Noel çelengi' },
    { file: 'botnano_extract_98.png', desc: 'Protesto sokak fotoğrafı' },
    { file: 'botnano_extract_99.png', desc: 'Bunny kostümlü model' },
    { file: 'botnano_extract_100.png', desc: 'Keşmir kış sahnesi' },
    { file: 'botnano_extract_103.png', desc: 'Hint tapınağı + saree' },
    { file: 'botnano_extract_107.png', desc: 'Yağmurlu pencere portre' },
    { file: 'botnano_extract_115.png', desc: 'Spotify AR görseli' },
    { file: 'botnano_extract_116.png', desc: 'Y2K flash fotoğraf' },
    { file: 'botnano_extract_2207.png', desc: 'Ekstra resim' }
];

async function assignImages() {
    console.log('🔗 Bağlanmamış Resimleri Promptlara Atama\n');
    console.log('='.repeat(60));

    // Get prompts without images, ordered by display_number
    const { data: noImagePrompts, error } = await supabase
        .from('banana_prompts')
        .select('id, display_number, title, prompt')
        .or('images.is.null,images.eq.{}')
        .order('display_number', { ascending: true })
        .limit(11);

    if (error) {
        console.error('Error fetching prompts:', error);
        return;
    }

    console.log(`\n📋 ${noImagePrompts.length} resimsiz prompt bulundu\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < Math.min(unlinkedImages.length, noImagePrompts.length); i++) {
        const img = unlinkedImages[i];
        const prompt = noImagePrompts[i];

        const imageUrl = `/images/${img.file}`;

        console.log(`\n${i + 1}. Atama:`);
        console.log(`   Resim: ${img.file} (${img.desc})`);
        console.log(`   Prompt: #${String(prompt.display_number).padStart(5, '0')} - ${prompt.title?.substring(0, 40) || 'No title'}`);

        // Update the prompt with the image
        const { error: updateError } = await supabase
            .from('banana_prompts')
            .update({
                images: [imageUrl],
                source: 'BotsNANO'
            })
            .eq('id', prompt.id);

        if (updateError) {
            console.log(`   ❌ HATA: ${updateError.message}`);
            errorCount++;
        } else {
            console.log(`   ✅ Başarılı!`);
            successCount++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 ÖZET:');
    console.log(`   Başarılı: ${successCount}`);
    console.log(`   Hata: ${errorCount}`);
    console.log(`   Toplam: ${successCount + errorCount}`);

    if (successCount > 0) {
        console.log('\n✅ Resimler başarıyla atandı!');
    }
}

assignImages();
