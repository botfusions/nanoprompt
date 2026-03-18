
const fs = require('fs');
const path = require('path');

/**
 * Updates a prompt in all_prompts.json with a new image URL.
 * @param {string} id - The ID of the prompt to update.
 * @param {string} imageUrl - The new image URL to add.
 */
function updatePromptImage(id, imageUrl) {
    const jsonPath = path.join(process.cwd(), 'src/data/all_prompts.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const prompts = JSON.parse(rawData);

    const index = prompts.findIndex(p => p.id === id);
    if (index === -1) {
        console.error(`❌ Prompt with ID ${id} not found.`);
        return;
    }

    // Initialize images array if it doesn't exist
    if (!prompts[index].images) {
        prompts[index].images = [];
    }

    // Add the new image
    prompts[index].images.unshift(imageUrl);

    // Update source to BotsNANO for these new AI-enhanced records
    if (prompts[index].source && prompts[index].source.includes('YouMind')) {
        prompts[index].source = 'BotsNANO';
    }

    fs.writeFileSync(jsonPath, JSON.stringify(prompts, null, 2), 'utf8');
    console.log(`✅ successfully updated prompt ${id} with image ${imageUrl} and updated source to BotsNANO`);
}

// Example usage (commented out):
// updatePromptImage('youmind_extract_1', '/images/youmind_extract_1_image.png');

const id = process.argv[2];
const imageUrl = process.argv[3];

if (id && imageUrl) {
    updatePromptImage(id, imageUrl);
} else {
    console.log('Usage: node scripts/update_prompt_image.js <id> <imageUrl>');
}
