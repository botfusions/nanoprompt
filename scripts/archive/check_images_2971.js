// Check images for prompt #02971
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkImages() {
    const { data, error } = await supabase
        .from('banana_prompts')
        .select('images, title')
        .eq('display_number', 2971)
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Title:', data.title);
    console.log('Image count:', data.images?.length || 0);
    console.log('\nImages:');
    data.images?.forEach((img, i) => {
        console.log(`${i + 1}. ${img}`);
    });
}

checkImages();
