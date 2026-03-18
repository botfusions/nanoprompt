const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const sourcePath = path.join(__dirname, '../BotNANo.txt');
const outputPath = path.join(__dirname, '../src/data/prompts.ts');

try {
    const html = fs.readFileSync(sourcePath, 'utf8');
    const $ = cheerio.load(html);

    const prompts = [];
    const categories = new Set(["Tümü"]);

    // Find all prompt cards. Based on BotNANo.txt analysis, they seem to be wrapper in div with data-id or specific classes.
    // Looking at the view_file output of BotNANo.txt:
    // <div class="group relative flex flex-col mt-12" data-id="151">

    $('.group.relative.flex.flex-col.mt-12[data-id]').each((i, el) => {
        const $el = $(el);
        const id = $el.data('id').toString();

        // Extract Author info
        // <div class="flex items-center gap-2 mb-4 ..."> ... <a href="..." ... title="@Handle">@Handle</a>
        const $authorLink = $el.find('a[href*="x.com"]');
        const authorHandle = $authorLink.text().trim();
        const authorLink = $authorLink.attr('href');
        const authorName = $authorLink.attr('title').replace('@', ''); // Roughly getting name from title or handle

        // Extract Date
        const date = $el.find('.font-mono.text-gray-500').text().trim();

        // Extract Title/Description (The main bold text)
        // <h3 class="text-2xl font-black ...">...</h3>
        const title = $el.find('h3').text().trim();

        // Extract Prompt Text
        // <div class="bg-[#F8F9FA] ... font-mono ...">
        const promptText = $el.find('.font-mono.text-sm.whitespace-pre-wrap').text().trim();

        // Extract Images
        const images = [];
        $el.find('img').each((j, img) => {
            let src = $(img).attr('src');
            // Fix src if it's relative or from cdn-cgi (we might want the original if possible, or just keep as is)
            // The sample shows src="/cdn-cgi/image/..."
            // We will keep it as is, or prepend domain if needed. But for a local clone, we might need to rely on external URLs working.
            // The sample html has <base> or just uses absolute? 
            // It seems to be full URLs in srcSet but let's check src.
            // src="/cdn-cgi/..." -> this will fail on localhost if we don't have a proxy. 
            // However, looking at the file, the 'src' attribute often starts with /cdn-cgi. 
            // Let's look for 'srcSet' or try to find a full URL.
            // The sample file has: srcSet="/cdn-cgi/...https%3A%2F%2Fcms-assets.youmind.com..."
            // We can try to extract the real URL from the query param if possible, or use the one present if it works.
            // Let's use the one in src for now, but if it starts with /, it's problematic.

            const srcSet = $(img).attr('srcset');
            let candidateSrc = src;

            if (srcSet) {
                // Try to grab the largest image from srcset
                const parts = srcSet.split(',');
                const lastPart = parts[parts.length - 1].trim().split(' ')[0];
                candidateSrc = lastPart;
            }

            // Extract real URL if it's nested in cdn-cgi path
            // Pattern: /cdn-cgi/image/.../https%3A%2F%2F...
            if (candidateSrc && (candidateSrc.includes('https%3A%2F%2F') || candidateSrc.includes('http%3A%2F%2F'))) {
                const match = candidateSrc.match(/(https?%3A%2F%2F[^ ]+)/);
                if (match) {
                    src = decodeURIComponent(match[0]);
                }
            } else if (candidateSrc && candidateSrc.startsWith('/')) {
                // If it's a relative path but not encoded, try to make it absolute if reasonable,
                // or leave it if it's just a local path (though unlikely for external assets)
                src = `https://youmind.com${candidateSrc}`;
            } else if (candidateSrc) {
                src = candidateSrc;
            }

            if (src && !images.includes(src)) {
                images.push(src);
            }
        });

        // Extract Category/Tags from buttons if available?
        // The example HTML shows <button ...>Profil / Avatar</button> in the sticky header, but not explicitly on the card (except maybe implied).
        // The previous prompts.ts had categories. The card HTML itself doesn't seem to explicitly list categories like "Profile/Avatar" as a tag visually?
        // Wait, looking at sticky header: 
        // <button>Profil / Avatar</button>
        // But on the card: 
        // <div class="absolute -right-4 -top-3 ...">Öne Çıkan</div> (Featured)
        // We might have to guess category or put them all in "Tümü" + "Öne Çıkan" if present.
        // Or we can simple assign "Tümü" to all, and maybe infer from title?
        // For 100% parity, if we can't find the category on the card, we might lose filtering capability unless we find it.
        // Let's look closely at the data-id or other attributes.
        // The sample HTML doesn't explicitly link cards to categories except maybe via react state we can't see.
        // However, some descriptions might have keywords.
        // For now, we'll collect all as "Tümü". If "Öne Çıkan" is present, we add that tag.

        const cardCategories = ["Tümü"];
        if ($el.find(':contains("Öne Çıkan")').length > 0) {
            cardCategories.push("Öne Çıkan");
        }

        // Try to map known categories from title?
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes("portre") || lowerTitle.includes("avatar") || lowerTitle.includes("profil")) cardCategories.push("Profil / Avatar");
        if (lowerTitle.includes("logo") || lowerTitle.includes("ikon") || lowerTitle.includes("simge")) cardCategories.push("Logo / İkon");
        if (lowerTitle.includes("web") || lowerTitle.includes("tasarım") || lowerTitle.includes("ui")) cardCategories.push("Uygulama / Web Tasarımı");
        // ... add more heuristics if needed

        cardCategories.forEach(c => categories.add(c));

        // Check if ID already exists
        if (!prompts.some(p => p.id === id)) {
            prompts.push({
                id: id,
                title: title,
                description: promptText, // using prompt text as description for now, or the p tag above prompt box?
                // <p class="text-gray-800 font-medium mb-4 ...">Description text</p>
                summary: $el.find('p.text-gray-800').text().trim(),
                prompt: promptText,
                images: images,
                categories: cardCategories,
                author: {
                    name: authorName || authorHandle,
                    handle: authorHandle,
                    avatar: "", // Cannot easily find avatar img in the snippet, default to something?
                    url: authorLink
                },
                date: date,
                featured: cardCategories.includes("Öne Çıkan")
            });
        }
    });

    console.log(`Extracted ${prompts.length} prompts.`);

    const fileContent = `export interface Prompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  images: string[];
  categories: string[];
  author: {
    name: string;
    handle: string;
    avatar: string;
    url?: string;
  };
  date: string;
  featured?: boolean;
  summary: string;
}

export const CATEGORIES = ${JSON.stringify(Array.from(categories), null, 2)};

export const PROMPTS: Prompt[] = ${JSON.stringify(prompts, null, 2)};
`;

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Saved to ${outputPath}`);

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
