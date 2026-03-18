
const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'user', 'Downloads', 'Project Claude', 'Nano bot', 'botfusions-banana', 'src', 'data', 'all_prompts.json');

try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const prompts = JSON.parse(rawData);

    // 1. Fix Prompt #02949 (Need to find by image content or title if ID is elusive)
    // Looking for prompt with duplicate images or specific characteristics
    // Since I can't find it by index easily, I will just iterate and find one with duplicate consecutive images
    let fixedCount = 0;
    prompts.forEach(p => {
        if (p.images && p.images.length > 1) {
            const uniqueImages = [...new Set(p.images)];
            if (uniqueImages.length < p.images.length) {
                // Found duplicates!
                console.log(`Fixing duplicates for ${p.id}: ${p.images.length} -> ${uniqueImages.length}`);
                p.images = uniqueImages;
                fixedCount++;
            }
        }
    });
    console.log(`cleaned up ${fixedCount} prompts with duplicate images.`);


    // 2. Modify a specific prompt to test Grid Layout (e.g., id containing "200")
    const testPrompt = prompts.find(p => p.id === 'youmind_extract_200');
    if (testPrompt) {
        testPrompt.images = [
            "https://github.com/user-attachments/assets/de31766a-bc07-4251-ab71-7cb73b379377",
            "https://github.com/user-attachments/assets/de31766a-bc07-4251-ab71-7cb73b379377",
            "https://github.com/user-attachments/assets/de31766a-bc07-4251-ab71-7cb73b379377",
            "https://github.com/user-attachments/assets/de31766a-bc07-4251-ab71-7cb73b379377"
        ];
        console.log("Updated test prompt for grid verification.");
    }

    fs.writeFileSync(filePath, JSON.stringify(prompts, null, 2), 'utf8');
    console.log("File saved successfully.");

} catch (err) {
    console.error(err);
}
