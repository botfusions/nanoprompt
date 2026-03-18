const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const sourcePath = path.join(__dirname, '../BotNANo.txt');
const htmlContent = fs.readFileSync(sourcePath, 'utf8');
const $ = cheerio.load(htmlContent);

console.log("Searching for elements with data-id...");
const allDataIds = $('[data-id]');
console.log(`Found ${allDataIds.length} elements with data-id attribute.`);

// Print first few classes to see if they differ
allDataIds.each((i, el) => {
    if (i < 5 || i > allDataIds.length - 5) {
        console.log(`Index ${i}: Tag=${el.tagName}, Classes=${$(el).attr('class')}, ID=${$(el).attr('data-id')}`);
    }
});
