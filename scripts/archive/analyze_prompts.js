
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(process.cwd(), 'src/data/all_prompts.json');
const rawData = fs.readFileSync(jsonPath, 'utf8');
const prompts = JSON.parse(rawData);

const koreanChineseRegex = /[\u3131-\uD79D\u4e00-\u9fff]/;

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

let total = prompts.length;
let filteredOutCount = 0;
let imagelessCount = 0;
let totalVisible = 0;

prompts.forEach(p => {
    // Migrate scriptindeki gibi prompt metnini belirle
    const promptText = p.prompt_en || p.prompt || getPromptFromOriginal(p) || p.prompt_cn || p.title || "";

    // Dil filtrelemesi (getAllPrompts içindeki mantık)
    const isKoreanChinese = koreanChineseRegex.test(promptText);

    if (isKoreanChinese) {
        filteredOutCount++;
        return;
    }

    totalVisible++;

    // Resim kontrolü (hasWorkingImage mantığı)
    const images = p.images || [];
    const firstImage = images[0];

    const hasWorkingImage = Boolean(
        firstImage &&
        typeof firstImage === 'string' &&
        firstImage.startsWith('http') &&
        !firstImage.includes('placeholder') &&
        firstImage.length > 10
    );

    if (!hasWorkingImage) {
        imagelessCount++;
    }
});

console.log('--- Prompt Analiz Raporu (Hassas) ---');
console.log(`Toplam JSON verisi: ${total}`);
console.log(`Korece/Çince olduğu için elenen: ${filteredOutCount}`);
console.log(`Web sitesinde görünen toplam: ${totalVisible}`);
console.log(`Resimsiz olan (hasWorkingImage = false): ${imagelessCount}`);
console.log('---------------------------');
