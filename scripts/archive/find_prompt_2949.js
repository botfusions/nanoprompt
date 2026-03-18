
const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'user', 'Downloads', 'Project Claude', 'Nano bot', 'botfusions-banana', 'src', 'data', 'all_prompts.json');

try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const prompts = JSON.parse(rawData);

    // Calculate display numbers like in prompts.ts logic
    // We need to filter and sort same way to find what #02949 maps to
    const koreanChineseRegex = /[\u3131-\uD79D\u4e00-\u9fff]/;
    let englishOnlyPrompts = prompts.filter(prompt => {
        return !koreanChineseRegex.test(prompt.prompt || '') && !koreanChineseRegex.test(prompt.title || '');
    });

    // Sort: Date descending
    englishOnlyPrompts.sort((a, b) => {
        const dateA = new Date(a.date || '1970-01-01').getTime();
        const dateB = new Date(b.date || '1970-01-01').getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (Math.abs(dateA - dateB) > oneDayMs) {
            return dateB - dateA;
        }
        // Simplified secondary sort for quick checking
        return 0;
    });

    // Find the 2949th item
    const targetIndex = 2948; // 0-based

    if (targetIndex < englishOnlyPrompts.length) {
        console.log("Prompt #02949 might be:");
        const p = englishOnlyPrompts[targetIndex];
        console.log(`ID: ${p.id}`);
        console.log(`Title: ${p.title}`);
        console.log(`Images: ${JSON.stringify(p.images)}`);
    } else {
        console.log("Index out of bounds");
    }

    // Also search simply for any ID containing 2949
    const directMatch = prompts.find(p => p.id && p.id.includes('2949'));
    if (directMatch) {
        console.log("\nDirect ID Match for '2949':");
        console.log(`ID: ${directMatch.id}`);
        console.log(`Images: ${JSON.stringify(directMatch.images)}`);
    }

} catch (err) {
    console.error(err);
}
