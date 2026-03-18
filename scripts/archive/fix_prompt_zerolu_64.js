
const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/data/all_prompts.json');

try {
    console.log("Reading file...");
    const data = fs.readFileSync(filePath, 'utf8');
    const prompts = JSON.parse(data);

    const targetId = "zerolu_64";
    const prompt = prompts.find(p => p.id === targetId);

    if (prompt) {
        console.log(`Found prompt ${targetId} ("${prompt.title}"). Current images:`, prompt.images);

        // Define the target image path
        const newImage = "/images/botnano_extract_2207.png";

        // Check if update is needed
        if (!prompt.images || prompt.images[0] !== newImage) {
            prompt.images = [newImage];
            console.log("Updated images to:", prompt.images);

            fs.writeFileSync(filePath, JSON.stringify(prompts, null, 2));
            console.log("File saved successfully.");
        } else {
            console.log("Image is already up to date. Skipping save.");
        }
    } else {
        console.error(`Prompt with ID ${targetId} not found.`);
    }
} catch (err) {
    console.error("Error processing file:", err);
    process.exit(1);
}
