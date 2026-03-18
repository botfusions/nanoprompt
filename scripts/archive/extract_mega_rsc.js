const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '../BotNANo.txt');

function extractMegaRSC() {
    const content = fs.readFileSync(sourcePath, 'utf8');
    const pushRegex = /self\.__next_f\.push\(\[\d+,"([\s\S]*?)"\]\)/g;
    let match;
    let parts = [];

    while ((match = pushRegex.exec(content)) !== null) {
        parts.push(match[1]);
    }

    console.log(`Found ${parts.length} push parts.`);

    // Unescape carefully
    let combined = parts.join('');
    combined = combined
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g, '\n');

    console.log(`Combined unescaped length: ${combined.length}`);

    // Look for occurrences of "id" followed by a number, which is common for prompts
    const ids = [];
    const idRegex = /"id":"(\d+)"/g;
    while ((match = idRegex.exec(combined)) !== null) {
        ids.push(match[1]);
    }

    console.log(`Found ${ids.length} objects with an "id" property.`);
    if (ids.length > 0) {
        console.log(`ID range: ${Math.min(...ids.map(Number))} to ${Math.max(...ids.map(Number))}`);

        // Let's see some context for one of them
        const sampleId = ids[Math.floor(ids.length / 2)];
        const sampleIdx = combined.indexOf(`"id":"${sampleId}"`);
        console.log(`Sample context for id ${sampleId}:`);
        console.log(combined.substring(sampleIdx, sampleIdx + 1000));
    }
}

extractMegaRSC();
