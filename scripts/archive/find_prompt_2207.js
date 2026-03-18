
const fs = require('fs');
const path = require('path');

const promptsPath = path.resolve('src/data/all_prompts.json');
const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));

const targetIndex = 2206; // 2207 - 1
const prompt = prompts[targetIndex];

if (prompt) {
    console.log("Found Prompt #2207:");
    console.log("ID:", prompt.id);
    console.log("Title:", prompt.title);
    console.log("Images:", prompt.images);
    console.log("Index:", targetIndex);
} else {
    console.log("Prompt #2207 not found. Total prompts:", prompts.length);
}
