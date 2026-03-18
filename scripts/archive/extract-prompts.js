/**
 * YouMind Prompt Extractor
 * BotNANo.txt dosyasından Cheerio ile promptları çıkarır
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const HTML_FILE = path.join(__dirname, '..', 'BotNANo.txt');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'prompts.ts');

function extractPrompts() {
  console.log('BotNANo.txt okunuyor...');
  const html = fs.readFileSync(HTML_FILE, 'utf-8');

  const $ = cheerio.load(html);
  const prompts = [];
  const categoriesSet = new Set(['Tümü']);

  // data-id'li tüm kartları bul
  $('div[data-id]').each((index, element) => {
    const $card = $(element);
    const id = $card.attr('data-id');

    if (!id) return;

    // Başlığı çıkar
    const $titleLink = $card.find('h3').first();
    const title = $titleLink.text().trim().replace(/\s+/g, ' ') || `Prompt ${id}`;

    // Yazarı çıkar
    const $authorLink = $card.find('a[href*="x.com"]').first();
    let author = $authorLink.attr('title') || $authorLink.text().trim();
    author = author.replace(/^@/, '').trim() || 'YouMind';

    // Tarihi çıkar
    const $date = $card.find('.font-mono.text-gray-500').first();
    const dateText = $date.text().trim() || 'December 2025';

    // Görselleri çıkar - tüm img etiketlerinden src al
    const images = [];
    $card.find('img[src*="cms-assets.youmind.com"]').each((i, img) => {
      let src = $(img).attr('src') || '';

      // cdn-cgi format varsa, gerçek URL'i çıkar
      if (src.includes('/cdn-cgi/')) {
        const match = src.match(/https%3A%2F%2Fcms-assets\.youmind\.com%2F[^'"]+/);
        if (match) {
          src = decodeURIComponent(match[0]);
        }
      }

      // srcSet'ten daha iyi kalite al
      const srcSet = $(img).attr('srcset');
      if (srcSet) {
        const srcSetParts = srcSet.split(',').pop();
        const urlMatch = srcSetParts?.match(/https%3A%2F%2Fcms-assets\.youmind\.com%2F[^\s]+/);
        if (urlMatch) {
          src = decodeURIComponent(urlMatch[0]);
        }
      }

      // Sadece orijinal görsel URL'sini al (300x300 olmayan)
      if (src && !images.includes(src)) {
        // Thumbnail'ı orijinale çevir
        src = src.replace(/-\d+x\d+\.jpg/, '.jpg');
        images.push(src);
      }
    });

    // Alt'tan da görsel çıkar
    $card.find('img').each((i, img) => {
      const alt = $(img).attr('alt') || '';
      // srcset'ten orijinal URL çıkar
      const srcSet = $(img).attr('srcset') || '';
      const match = srcSet.match(/https%3A%2F%2Fcms-assets\.youmind\.com%2Fmedia%2F[^\s]+/);
      if (match) {
        let url = decodeURIComponent(match[0]);
        url = url.replace(/-\d+x\d+\.jpg/, '.jpg');
        if (!images.includes(url)) {
          images.push(url);
        }
      }
    });

    // Prompt metnini çıkar
    let promptText = '';
    const $promptBox = $card.find('.font-mono.text-sm.whitespace-pre-wrap');
    if ($promptBox.length) {
      promptText = $promptBox.text().trim();
    }

    // Açıklamayı çıkar
    let summary = '';
    const $description = $card.find('p.text-gray-800');
    if ($description.length) {
      summary = $description.text().trim();
    }

    // Öne çıkan mı?
    const featured = $card.find('.bg-\\[\\#FFE66D\\]').length > 0 ||
      $card.text().includes('Öne Çıkan');

    // Kategorileri çıkar - başlıktan veya içerikten tahmin et
    const categories = ['Tümü'];
    const titleLower = title.toLowerCase();

    if (titleLower.includes('profil') || titleLower.includes('avatar') || titleLower.includes('selfie') || titleLower.includes('portre')) {
      categories.push('Profil / Avatar');
      categoriesSet.add('Profil / Avatar');
    }
    if (titleLower.includes('sosyal') || titleLower.includes('instagram') || titleLower.includes('twitter') || titleLower.includes('gönderi')) {
      categories.push('Sosyal Medya Gönderisi');
      categoriesSet.add('Sosyal Medya Gönderisi');
    }
    if (titleLower.includes('infografik') || titleLower.includes('eğitici') || titleLower.includes('diagram')) {
      categories.push('İnfografik / Eğitici Görsel');
      categoriesSet.add('İnfografik / Eğitici Görsel');
    }
    if (titleLower.includes('youtube') || titleLower.includes('thumbnail')) {
      categories.push('YouTube Küçük Resmi');
      categoriesSet.add('YouTube Küçük Resmi');
    }
    if (titleLower.includes('çizgi') || titleLower.includes('manga') || titleLower.includes('hikaye')) {
      categories.push('Çizgi Roman / Hikaye Taslağı');
      categoriesSet.add('Çizgi Roman / Hikaye Taslağı');
    }
    if (titleLower.includes('poster') || titleLower.includes('el ilanı') || titleLower.includes('reklam')) {
      categories.push('Poster / El İlanı');
      categoriesSet.add('Poster / El İlanı');
    }

    prompts.push({
      id,
      title,
      prompt: promptText,
      summary,
      categories,
      author,
      date: dateText,
      images: images.slice(0, 4), // Max 4 görsel
      featured
    });
  });

  console.log(`${prompts.length} prompt çıkarıldı.`);
  return { prompts, categories: Array.from(categoriesSet) };
}

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

function main() {
  const { prompts, categories } = extractPrompts();

  if (prompts.length === 0) {
    console.log('Hiç prompt bulunamadı!');
    return;
  }

  // Örnekleri göster
  console.log('\n--- İlk 3 prompt örneği ---');
  prompts.slice(0, 3).forEach((p, i) => {
    console.log(`\n${i + 1}. ID: ${p.id}`);
    console.log(`   Title: ${p.title.substring(0, 60)}...`);
    console.log(`   Author: ${p.author}`);
    console.log(`   Date: ${p.date}`);
    console.log(`   Images: ${p.images.length}`);
    console.log(`   Prompt: ${p.prompt.substring(0, 100)}...`);
  });

  // TypeScript dosyasını oluştur
  const tsContent = generateTsFile(prompts, categories);
  fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf-8');
  console.log(`\n✅ ${prompts.length} prompt ${OUTPUT_FILE} dosyasına yazıldı.`);
}

main();
