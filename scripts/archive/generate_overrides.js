
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'all_prompts.json');
const rawData = fs.readFileSync(filePath, 'utf8');
const prompts = JSON.parse(rawData);

const localOverrides = {};

prompts.forEach(p => {
    if (p.images && p.images.length > 0 && p.images[0].startsWith('/images/')) {
        localOverrides[p.id] = p.images;
    }
});

const content = "export const LOCAL_IMAGE_OVERRIDES: Record<string, string[]> = " + JSON.stringify(localOverrides, null, 2) + ";";
const outputPath = path.join(__dirname, '..', 'src', 'data', 'local_overrides.ts');

fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Successfully wrote ${outputPath} with UTF-8 encoding.`);
