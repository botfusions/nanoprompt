const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'src', 'data', 'all_prompts.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let output = [];

output.push("=== LOCAL all_prompts.json Analizi ===\n");
output.push("Toplam prompt sayısı: " + data.length);

// Son 20 prompt
output.push("\n--- Son 20 Prompt ---");
const last20 = data.slice(-20);
last20.forEach(p => {
    const imgCount = Array.isArray(p.images) ? p.images.length : 0;
    const title = (p.title || 'N/A').substring(0, 45);
    output.push(`#${p.id} | ${title} | ${imgCount} img | ${p.source || 'N/A'}`);
});

// ID kontrolü
const numericIds = data.filter(p => /^\d{5}$/.test(p.id)).map(p => parseInt(p.id));
const maxNumericId = Math.max(...numericIds);
output.push("\nEn yüksek numerik ID: " + maxNumericId.toString().padStart(5, '0'));

// #02953 detayı
const p02953 = data.find(p => p.id === '02953');
output.push("\n--- #02953 Detay ---");
if (p02953) {
    output.push("Title: " + p02953.title);
    output.push("Images: " + JSON.stringify(p02953.images));
    output.push("Source: " + p02953.source);
    output.push("Prompt length: " + (p02953.prompt || '').length);
} else {
    output.push("#02953 LOCAL'da BULUNAMADI!");
}

// Dosyaya yaz
const outputPath = path.join(__dirname, 'analysis_output.txt');
fs.writeFileSync(outputPath, output.join('\n'));
console.log("Analiz yazıldı: " + outputPath);
