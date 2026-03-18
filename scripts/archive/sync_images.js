
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local to get credentials
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'); // Should be service role for updates, but lets try anon if RLS allows or if user logged in logic is needed. 
// Actually, anon key usually can't update public tables without RLS policy allowing it. 
// BUT, the user might have set up RLS to allow updates or it might be off.
// If this fails, we'll need the service role key or user might need to run SQL.
// Let's try with what we have. If it fails, we will notify.

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncImages() {
    console.log("Loading local prompts...");
    const filePath = path.join(__dirname, '..', 'src', 'data', 'all_prompts.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const prompts = JSON.parse(rawData);

    // Find prompts with local images
    const promptsToSync = prompts.filter(p =>
        p.images &&
        p.images.length > 0 &&
        p.images[0].startsWith('/images/') // Only sync local paths
    );

    console.log(`Found ${promptsToSync.length} prompts with local images to potential sync.`);

    let successCount = 0;
    let failCount = 0;

    for (const p of promptsToSync) {
        // console.log(`Syncing ${p.id}...`);

        // Update Supabase
        const { error } = await supabase
            .from('banana_prompts')
            .update({
                images: p.images,
                source: "BotsNANO" // Also update source as requested in user history
            })
            .eq('id', p.id);

        if (error) {
            console.error(`Failed to update ${p.id}:`, error.message);
            failCount++;
        } else {
            // console.log(`Updated ${p.id}`);
            successCount++;
        }
    }

    console.log(`Sync Complete.`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount} (Likely due to RLS/Permissions if high)`);
}

syncImages();
