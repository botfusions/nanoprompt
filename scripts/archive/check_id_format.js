const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'src', 'data', 'all_prompts.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let output = [];

// Numara bazlı ID'leri kontrol et
output.push("=== Numerik ID'li Promptlar (00XXX formatı) ===\n");

const numericPrompts = data.filter(p => /^\d{5}$/.test(p.id));
output.push(`Toplam numerik ID sayısı: ${numericPrompts.length}`);

// İlk 10 numerik
output.push("\nİlk 10 numerik ID:");
numericPrompts.slice(0, 10).forEach(p => {
    output.push(`  #${p.id} - ${p.title?.substring(0, 40)}`);
});

// UUID'li kartların ilk 5'i
output.push("\n=== UUID Formatındaki İlk 5 Prompt ===");
const uuidPrompts = data.filter(p => !/^\d{5}$/.test(p.id));
uuidPrompts.slice(0, 5).forEach(p => {
    output.push(`  ID: ${p.id.substring(0, 20)}...`);
    output.push(`  Title: ${p.title?.substring(0, 40)}`);
    output.push('');
});

// Ekrandaki kartların muhtemel ID'leri
output.push("\n=== 'Prompt for Gemini Nano Banana' başlıklı kart ===");
const geminiCard = data.find(p => p.title?.toLowerCase().includes('gemini') || p.title?.toLowerCase().includes('nano banana'));
if (geminiCard) {
    output.push(`  ID: ${geminiCard.id}`);
    output.push(`  Title: ${geminiCard.title}`);
    output.push(`  Author: ${geminiCard.author}`);
}

// Dosyaya yaz
const outputPath = path.join(__dirname, 'id_analysis.txt');
fs.writeFileSync(outputPath, output.join('\n'));
console.log("Analiz yazıldı:", outputPath);
