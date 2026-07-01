const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
const content = fs.readFileSync(envPath, 'utf8');
const envConfig = {};
content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const eq = trimmed.indexOf('=');
        if (eq > 0) envConfig[trimmed.substring(0, eq).trim()] = trimmed.substring(eq + 1).trim();
    }
});

const url = envConfig.VITE_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key to bypass RLS for writing
const key = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Error: Supabase URL or Key is missing in .env configuration.");
    process.exit(1);
}

const supabase = createClient(url, key);

// The list of prompt IDs that were successfully visualized
const updatedPrompts = [
    { id: "bb645269-db38-4809-a9c3-fee713a9f535", display_number: 4606 },
    { id: "4b716580-6a4f-48b3-b546-373868b4b056", display_number: 4591 },
    { id: "bc98325d-5337-424d-a29e-79ed9e5d251a", display_number: 4571 },
    { id: "21289bb3-5ba2-4934-a9fe-81d7d5152ab7", display_number: 4548 },
    { id: "d25b6579-7776-481d-b80c-caba83b3dc47", display_number: 4533 },
    { id: "43bee754-2b26-4455-9682-ae53f035c9a2", display_number: 4524 },
    { id: "ecce4d1b-38f8-497a-a226-504252099c59", display_number: 4512 },
    { id: "3d409431-859b-43dc-ab97-6d0a4edef0d3", display_number: 4515 }
];

async function updateDatabaseImages() {
    console.log(`🚀 Starting database update for ${updatedPrompts.length} prompts...`);
    
    for (const prompt of updatedPrompts) {
        const imagePath = `/images/${prompt.id}.png`;
        console.log(`Updating Prompt #${prompt.display_number} (${prompt.id}) with image path: ${imagePath}`);
        
        // Update images and set approved to true as they now have valid images
        const { data, error } = await supabase
            .from('banana_prompts')
            .update({ 
                images: [imagePath],
                approved: true 
            })
            .eq('id', prompt.id)
            .select();

        if (error) {
            console.error(`❌ Failed to update Prompt #${prompt.display_number}:`, error.message);
        } else {
            console.log(`✅ Successfully updated Prompt #${prompt.display_number}`);
        }
    }
    
    console.log("🎉 Database updates completed successfully!");
}

updateDatabaseImages();
