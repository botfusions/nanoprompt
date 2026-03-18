const fs = require('fs');
const path = require('path');
const https = require('https');

const API_URL = 'https://youmind.com/youhome-api/prompts';
const OUTPUT_PATH = path.join(__dirname, '../src/data/prompts.ts');
const LIMIT_PER_PAGE = 100;

function fetchPage(page) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            model: 'nano-banana-pro',
            page: page,
            limit: LIMIT_PER_PAGE
        });

        const options = {
            hostname: 'youmind.com',
            path: '/youhome-api/prompts',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${e.message}`));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

function mapPrompt(apiPrompt) {
    // Extract category from useCases or use default
    const categories = ['Tümü'];
    if (apiPrompt.useCases && apiPrompt.useCases.length > 0) {
        apiPrompt.useCases.forEach(uc => {
            if (uc.translatedName) categories.push(uc.translatedName);
            else if (uc.name) categories.push(uc.name);
        });
    }

    // Get images from media
    const images = [];
    if (apiPrompt.media && apiPrompt.media.length > 0) {
        apiPrompt.media.forEach(m => {
            if (m.url) images.push(m.url);
        });
    }

    // Use translated content if available, otherwise original
    const promptText = apiPrompt.translatedContent || apiPrompt.content || '';
    const title = apiPrompt.translatedTitle || apiPrompt.title || 'Untitled';
    const summary = apiPrompt.translatedDescription || apiPrompt.description || '';

    // Extract author
    let author = 'Anonymous';
    if (apiPrompt.author) {
        author = apiPrompt.author.name || apiPrompt.author.displayName || 'Anonymous';
    }

    // Format date
    let date = 'Dec 2025';
    if (apiPrompt.publishedAt) {
        const d = new Date(apiPrompt.publishedAt);
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        date = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }

    return {
        id: String(apiPrompt.id || apiPrompt._id || Math.random().toString(36).substr(2, 9)),
        title: title,
        prompt: promptText,
        summary: summary,
        categories: categories,
        author: author,
        date: date,
        images: images,
        featured: apiPrompt.featured || false
    };
}

async function fetchAllPrompts() {
    console.log('🍌 Starting YouMind API fetch...\n');

    const allPrompts = [];
    let page = 1;
    let totalPages = 1;
    let totalCount = 0;

    try {
        // First request to get total count
        console.log(`📡 Fetching page ${page}...`);
        const firstResponse = await fetchPage(page);

        if (firstResponse.total) {
            totalCount = firstResponse.total;
            totalPages = Math.ceil(totalCount / LIMIT_PER_PAGE);
            console.log(`📊 Total prompts: ${totalCount} (${totalPages} pages)\n`);
        }

        // Process first page - debug the response
        console.log('📋 Response keys:', Object.keys(firstResponse));

        // Try different possible data structures
        let pagePrompts = [];
        if (firstResponse.prompts) {
            pagePrompts = firstResponse.prompts;
        } else if (firstResponse.data) {
            pagePrompts = firstResponse.data;
        } else if (firstResponse.items) {
            pagePrompts = firstResponse.items;
        } else if (Array.isArray(firstResponse)) {
            pagePrompts = firstResponse;
        }

        if (pagePrompts.length > 0) {
            console.log('📋 Sample prompt keys:', Object.keys(pagePrompts[0]));
            pagePrompts.forEach(p => allPrompts.push(mapPrompt(p)));
            console.log(`   ✓ Page ${page}: ${pagePrompts.length} prompts`);
        } else {
            console.log('⚠ No prompts found in response. Full response:', JSON.stringify(firstResponse).substring(0, 500));
        }

        // Fetch remaining pages
        for (page = 2; page <= totalPages; page++) {
            // Add small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 200));

            console.log(`📡 Fetching page ${page}/${totalPages}...`);
            const response = await fetchPage(page);

            const prompts = response.prompts || response.data || [];
            prompts.forEach(p => allPrompts.push(mapPrompt(p)));
            console.log(`   ✓ Page ${page}: ${prompts.length} prompts`);

            if (prompts.length === 0) {
                console.log('   ⚠ No more prompts, stopping.');
                break;
            }
        }

        console.log(`\n✅ Fetched ${allPrompts.length} prompts total.`);
        return allPrompts;

    } catch (error) {
        console.error('❌ Fetch failed:', error.message);
        return allPrompts; // Return what we have so far
    }
}

async function main() {
    const prompts = await fetchAllPrompts();

    if (prompts.length === 0) {
        console.error('❌ No prompts fetched. Aborting.');
        return;
    }

    // Remove duplicates by ID
    const uniqueMap = new Map();
    prompts.forEach(p => {
        if (!uniqueMap.has(p.id)) {
            uniqueMap.set(p.id, p);
        }
    });
    const uniquePrompts = Array.from(uniqueMap.values());
    console.log(`📦 Unique prompts after deduplication: ${uniquePrompts.length}`);

    // Generate output file
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

export const CATEGORIES = ["Tümü", "Profil / Avatar", "Sosyal Medya Gönderisi", "İnfografik / Eğitici Görsel", "YouTube Küçük Resmi", "Çizgi Roman / Hikaye Taslağı", "Ürün Pazarlaması", "E-ticaret Ana Görseli", "Oyun Varlığı"];

export const PROMPTS: Prompt[] = ${JSON.stringify(uniquePrompts, null, 2)};
`;

    fs.writeFileSync(OUTPUT_PATH, output);
    console.log(`\n🎉 Saved ${uniquePrompts.length} prompts to ${OUTPUT_PATH}`);
}

main();
