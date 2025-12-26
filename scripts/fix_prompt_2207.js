
const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/data/all_prompts.json');

try {
    console.log("Reading file...");
    const data = fs.readFileSync(filePath, 'utf8');
    const prompts = JSON.parse(data);

    const targetId = "youmind_v2_591";
    const prompt = prompts.find(p => p.id === targetId);

    if (prompt) {
        console.log(`Found prompt ${targetId}. Current images:`, prompt.images);
        if (!prompt.images || prompt.images.length === 0) {
            prompt.images = ["/images/botnano_extract_2207.png"];
            console.log("Updated images to:", prompt.images);

            fs.writeFileSync(filePath, JSON.stringify(prompts, null, 2));
            console.log("File saved successfully.");
        } else {
            console.log("Image array is not empty. Skipping update.");
        }
    } else {
        console.error(`Prompt with ID ${targetId} not found.`);
    }
} catch (err) {
    console.error("Error processing file:", err);
    process.exit(1);
}
