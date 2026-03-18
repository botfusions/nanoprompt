
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(process.cwd(), 'src/data/all_prompts.json');
const rawData = fs.readFileSync(jsonPath, 'utf8');
const prompts = JSON.parse(rawData);

const koreanChineseRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u3131-\uD79D]/;

const getPromptFromOriginal = (p) => {
    if (p.prompt_original && typeof p.prompt_original === 'string') {
        try {
            const parsed = JSON.parse(p.prompt_original);
            return parsed.prompt || "";
        } catch {
            return "";
        }
    }
    return p.prompt_original?.prompt || "";
};

// Resimsiz ve görünür olan promptları bul
const targetPrompts = prompts.filter(p => {
    // Dil kontrolü
    const promptText = p.prompt_en || p.prompt || getPromptFromOriginal(p) || p.prompt_cn || p.title || "";
    const isKoreanChinese = koreanChineseRegex.test(promptText);
    if (isKoreanChinese) return false;

    // Resim kontrolü
    const images = p.images || [];
    const firstImage = images[0];
    const hasWorkingImage = Boolean(
        firstImage &&
        typeof firstImage === 'string' &&
        (firstImage.startsWith('http') || firstImage.startsWith('/images/')) &&
        !firstImage.includes('placeholder') &&
        firstImage.length > 10
    );

    return !hasWorkingImage;
}).slice(0, 5);

const batchData = targetPrompts.map(p => ({
    id: p.id,
    prompt: p.prompt_en || p.prompt || getPromptFromOriginal(p) || p.title || ""
}));

console.log(JSON.stringify(batchData, null, 2));

