const fs = require('fs');
const path = require('path');

const jsonPath = path.join(process.cwd(), 'src/data/all_prompts.json');
const rawData = fs.readFileSync(jsonPath, 'utf8');
const prompts = JSON.parse(rawData);

const targetId = 'youmind_extract_278';
const newImage = '/images/botnano_extract_278.png';

const index = prompts.findIndex(p => p.id === targetId);
if (index !== -1) {
    prompts[index].source = 'BotsNANO';
    prompts[index].images = [newImage];
    // Clean "Prompt" prefix if present
    if (prompts[index].prompt && prompts[index].prompt.startsWith('Prompt')) {
        prompts[index].prompt = prompts[index].prompt.substring(6);
    }
    if (prompts[index].prompt_original && prompts[index].prompt_original.startsWith('Prompt')) {
        prompts[index].prompt_original = prompts[index].prompt_original.substring(6);
    }
    fs.writeFileSync(jsonPath, JSON.stringify(prompts, null, 2));
    console.log(`Successfully updated ${targetId}`);
} else {
    console.error(`Prompt with id ${targetId} not found`);
}
