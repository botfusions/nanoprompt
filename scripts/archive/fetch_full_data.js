const fs = require('fs');
const path = require('path');
const https = require('https');

const README_URL = 'https://raw.githubusercontent.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts/main/README.md';
const OUTPUT_PATH = path.join(__dirname, '../src/data/prompts.ts');
const EXISTING_PATH = path.join(__dirname, '../src/data/prompts.ts');

function fetchRaw(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to fetch: ${res.statusCode}`));
                return;
            }
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function parseMarkdown(md) {
    const prompts = [];
    // Split by horizontal rules which separate prompts
    const sections = md.split('\n---');

    for (const section of sections) {
        if (!section.includes('### No.')) continue;

        const idMatch = section.match(/id=(\d+)/);
        const titleMatch = section.match(/### No\.\s*\d+:\s*(.*?)\n/);
        const descriptionMatch = section.match(/#### 📖 Description\s*\n\n(.*?)\n/);
        const promptMatch = section.match(/#### 📝 Prompt\s*\n\n```\n?([\s\S]*?)```/);
        const authorMatch = section.match(/\*\*Author:\*\* \[(.*?)\]/);
        const publishedMatch = section.match(/\*\*Published:\*\* (.*?)\n/);

        // Extract images
        const imgRegex = /<img src="(.*?)"/g;
        let imgMatch;
        const images = [];
        while ((imgMatch = imgRegex.exec(section)) !== null) {
            images.push(imgMatch[1]);
        }

        if (idMatch && titleMatch && promptMatch) {
            prompts.push({
                id: idMatch[1],
                title: titleMatch[1].trim(),
                prompt: promptMatch[1].trim(),
                summary: descriptionMatch ? descriptionMatch[1].trim() : '',
                categories: ['Tümü'],
                author: authorMatch ? authorMatch[1] : 'Anonymous',
                date: publishedMatch ? publishedMatch[1].trim() : 'Dec 2025',
                images: images,
                featured: section.includes('🔥 Featured') || section.includes('Öne Çıkan')
            });
        }
    }
    return prompts;
}

async function start() {
    console.log('Fetching README from GitHub...');
    try {
        const md = await fetchRaw(README_URL);
        console.log(`Fetched ${Math.round(md.length / 1024)} KB of data.`);

        const githubPrompts = parseMarkdown(md);
        console.log(`Parsed ${githubPrompts.length} prompts from GitHub.`);

        // Load existing prompts to keep Turkish translations if available
        let existingPrompts = [];
        if (fs.existsSync(EXISTING_PATH)) {
            const content = fs.readFileSync(EXISTING_PATH, 'utf8');
            const match = content.match(/export const PROMPTS: Prompt\[\] = ([\s\S]*?);/);
            if (match) {
                try {
                    existingPrompts = JSON.parse(match[1]);
                } catch (e) {
                    console.error('Failed to parse existing prompts:', e);
                }
            }
        }

        console.log(`Loaded ${existingPrompts.length} existing prompts.`);

        // Merge prompts
        const mergedMap = new Map();
        // Add existing ones first (priority for Turkish content from BotNANo.txt)
        existingPrompts.forEach(p => mergedMap.set(p.id, p));

        // Update or add from GitHub
        githubPrompts.forEach(p => {
            if (mergedMap.has(p.id)) {
                const existing = mergedMap.get(p.id);
                // Preserve Turkish title if it looks Turkish (contains specific chars)
                const isTurkish = /[çğışöüÇĞİŞÖÜ]/.test(existing.title);
                if (!isTurkish) {
                    existing.title = p.title;
                    existing.summary = p.summary;
                }
                // Always take better images and prompt from GitHub if existing is lacking
                if (existing.images.length === 0) existing.images = p.images;
                if (existing.prompt.length < p.prompt.length) existing.prompt = p.prompt;
                if (!existing.author || existing.author === 'Anonymous') existing.author = p.author;
            } else {
                mergedMap.set(p.id, p);
            }
        });

        const finalPrompts = Array.from(mergedMap.values());
        console.log(`Total unique prompts after merge: ${finalPrompts.length}`);

        const output = `
export interface Prompt {
  id: string;
  title: string;
  prompt: string;
  summary?: string;
  categories: string[];
  author: string;
  date: string;
  images: string[];
  featured?: boolean;
}

export const CATEGORIES = ["Tümü", "Sosyal Medya", "Profil / Avatar"];

export const PROMPTS: Prompt[] = ${JSON.stringify(finalPrompts, null, 2)};
`;
        fs.writeFileSync(OUTPUT_PATH, output);
        console.log(`Saved ${finalPrompts.length} prompts to ${OUTPUT_PATH}`);

    } catch (err) {
        console.error('Extraction failed:', err);
    }
}

start();
