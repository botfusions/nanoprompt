// Check which prompts use local images
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLocalImages() {
    console.log('📋 Local Resim Kullanan Promptlar\n');
    console.log('='.repeat(70));

    // Get all prompts with local images
    const { data, error } = await supabase
        .from('banana_prompts')
        .select('display_number, title, images')
        .order('display_number', { ascending: true });

    if (error) {
        console.error('Error:', error);
        return;
    }

    let count = 0;
    const localImagePrompts = [];

    data.forEach(p => {
        if (p.images && p.images.length > 0) {
            const hasLocal = p.images.some(img =>
                img.includes('/images/botnano') ||
                img.includes('/images/youmind') ||
                img.includes('/images/prompt_')
            );
            if (hasLocal) {
                count++;
                localImagePrompts.push({
                    num: p.display_number,
                    title: p.title?.substring(0, 40) || 'No title',
                    images: p.images.filter(img => img.startsWith('/images/'))
                });
            }
        }
    });

    console.log(`\n📊 TOPLAM: ${count} prompt local resim kullanıyor\n`);

    localImagePrompts.forEach(p => {
        console.log(`#${String(p.num).padStart(5, '0')} - ${p.title}`);
        p.images.forEach(img => console.log(`         └─ ${img}`));
    });

    console.log('\n' + '='.repeat(70));
}

checkLocalImages();
