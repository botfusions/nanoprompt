// Add new image to prompt #02971
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const NEW_IMAGE = 'https://pbs.twimg.com/media/G8Bvw81aQAAnaMy?format=jpg&name=360x360';

async function addImage() {
    // Get current prompt data
    const { data: prompt, error: fetchError } = await supabase
        .from('banana_prompts')
        .select('id, display_number, images, title')
        .eq('display_number', 2971)
        .single();

    if (fetchError) {
        console.error('Fetch error:', fetchError);
        return;
    }

    console.log('Current prompt:', prompt.title);
    console.log('Current images:', prompt.images);

    // Add new image to the array
    const currentImages = prompt.images || [];

    // Check if image already exists
    if (currentImages.includes(NEW_IMAGE)) {
        console.log('Image already exists in the array!');
        return;
    }

    const updatedImages = [...currentImages, NEW_IMAGE];
    console.log('New images array:', updatedImages);

    // Update the prompt
    const { error: updateError } = await supabase
        .from('banana_prompts')
        .update({ images: updatedImages })
        .eq('id', prompt.id);

    if (updateError) {
        console.error('Update error:', updateError);
        return;
    }

    console.log(`✅ Successfully added image to prompt #02971. Now has ${updatedImages.length} images.`);
}

addImage();
