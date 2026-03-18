// Fix images for prompt #02971
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixImages() {
    // Get current images
    const { data, error: fetchError } = await supabase
        .from('banana_prompts')
        .select('id, images')
        .eq('display_number', 2971)
        .single();

    if (fetchError) {
        console.error('Fetch error:', fetchError);
        return;
    }

    console.log('Current images:');
    data.images.forEach((img, i) => console.log(`${i + 1}. ${img}`));

    // 2. resim format parametresi eksik, düzelt
    // Ayrıca 4. resim 2. resimle aynı - kaldıralım (çift)
    const fixedImages = [
        'https://pbs.twimg.com/media/G8Bvw5ka0AAVL0N?format=jpg&name=360x360',
        'https://pbs.twimg.com/media/G8Bvw81aQAAnaMy?format=jpg&name=360x360',
        'https://pbs.twimg.com/media/G8BvxHebgAAjN6w?format=jpg&name=360x360'
    ];

    console.log('\nFixed images (3 unique):');
    fixedImages.forEach((img, i) => console.log(`${i + 1}. ${img}`));

    // Update
    const { error: updateError } = await supabase
        .from('banana_prompts')
        .update({ images: fixedImages })
        .eq('id', data.id);

    if (updateError) {
        console.error('Update error:', updateError);
        return;
    }

    console.log('\n✅ Fixed! Now has 3 unique images.');
}

fixImages();
