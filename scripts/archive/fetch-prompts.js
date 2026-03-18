/**
 * YouMind Prompt Fetcher
 * Bu script YouMind API'sinden tüm promptları çeker ve prompts.ts dosyasına yazar.
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'https://youmind.com/youhome-api/prompts';
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'prompts.ts');

// YouMind API'den prompt çek
async function fetchPrompts(offset = 0, limit = 100) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://youmind.com/tr-TR/nano-banana-pro-prompts',
                'Origin': 'https://youmind.com'
            },
            body: JSON.stringify({
                model: 'nano-banana-pro-prompts',
                limit: limit,
                offset: offset,
                categories: []
            })
        });

        if (!response.ok) {
            console.log(`HTTP ${response.status}: ${response.statusText}`);
            const text = await response.text();
            console.log('Response:', text.substring(0, 500));
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error.message);
        return null;
    }
}

// Prompt'u Prompt interface formatına dönüştür
function transformPrompt(rawPrompt, index) {
    return {
        id: String(rawPrompt.id || index + 1),
        title: rawPrompt.title || `Prompt ${index + 1}`,
        prompt: rawPrompt.content || rawPrompt.prompt || rawPrompt.description || '',
        summary: rawPrompt.description || rawPrompt.summary || '',
        categories: rawPrompt.categories || ['Tümü'],
        author: rawPrompt.author?.name || rawPrompt.author || 'YouMind',
        date: rawPrompt.createdAt || rawPrompt.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        images: rawPrompt.media || rawPrompt.images || [],
        featured: rawPrompt.featured || false
    };
}

// Tüm benzersiz kategorileri çıkar
function extractCategories(prompts) {
    const categories = new Set(['Tümü']);
    prompts.forEach(p => {
        if (p.categories && Array.isArray(p.categories)) {
            p.categories.forEach(c => categories.add(c));
        }
    });
    return Array.from(categories);
}

// TypeScript dosyası oluştur
function generateTsFile(prompts, categories) {
    const content = `
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

export const CATEGORIES = ${JSON.stringify(categories, null, 2)};

export const PROMPTS: Prompt[] = ${JSON.stringify(prompts, null, 2)};
`;
    return content;
}

async function main() {
    console.log('YouMind API\'den promptlar çekiliyor...');

    // Önce API'yi test et
    const testResult = await fetchPrompts(0, 5);

    if (!testResult) {
        console.log('API direkt erişim başarısız. Alternatif yöntem deneniyor...');

        // Alternatif: BotNANo.txt'den çıkar
        console.log('BotNANo.txt dosyasından prompt çıkarılıyor...');
        await extractFromHtml();
        return;
    }

    console.log('API yanıtı:', JSON.stringify(testResult, null, 2).substring(0, 1000));

    // Tam veriyi çek
    const allPrompts = [];
    let offset = 0;
    const limit = 100;

    while (true) {
        console.log(`Çekiliyor: offset=${offset}, limit=${limit}`);
        const batch = await fetchPrompts(offset, limit);

        if (!batch || !batch.prompts || batch.prompts.length === 0) {
            break;
        }

        allPrompts.push(...batch.prompts.map((p, i) => transformPrompt(p, offset + i)));
        offset += limit;

        if (batch.prompts.length < limit) {
            break;
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`Toplam ${allPrompts.length} prompt çekildi.`);

    const categories = extractCategories(allPrompts);
    const tsContent = generateTsFile(allPrompts, categories);

    fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf-8');
    console.log(`Promptlar ${OUTPUT_FILE} dosyasına yazıldı.`);
}

// HTML'den prompt çıkarma (fallback)
async function extractFromHtml() {
    const htmlFile = path.join(__dirname, '..', 'BotNANo.txt');
    const html = fs.readFileSync(htmlFile, 'utf-8');

    // data-id'li kartları bul
    const cardMatches = html.match(/data-id="(\d+)"/g) || [];
    console.log(`HTML'de ${cardMatches.length} kart bulundu.`);

    // Script içindeki prompt verilerini bul
    // Next.js RSC stream formatı: self.__next_f.push([...])
    const scriptMatches = html.match(/self\.__next_f\.push\(\[(.*?)\]\)/gs) || [];
    console.log(`${scriptMatches.length} script bloğu bulundu.`);

    // Prompt pattern'lerini ara
    const promptPattern = /"id":(\d+),"title":"([^"]+)"/g;
    let match;
    const prompts = [];

    while ((match = promptPattern.exec(html)) !== null) {
        prompts.push({
            id: match[1],
            title: match[2]
        });
    }

    console.log(`${prompts.length} prompt pattern'i bulundu.`);
}

main().catch(console.error);
