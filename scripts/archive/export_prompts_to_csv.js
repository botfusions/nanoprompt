/**
 * Resimli promptları CSV dosyasına dönüştürür
 * Kullanım: node scripts/export_prompts_to_csv.js
 */

const fs = require('fs');
const path = require('path');

// JSON dosyasını oku
const jsonPath = path.join(__dirname, '../src/data/all_prompts.json');
const outputCsvPath = path.join(__dirname, '../exports/prompts_with_images.csv');

// Exports klasörünü oluştur
const exportsDir = path.join(__dirname, '../exports');
if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
}

// CSV için özel karakterleri escape et
function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Eğer virgül, tırnak veya yeni satır içeriyorsa, tırnak içine al
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

try {
    console.log('📖 JSON dosyası okunuyor...');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const prompts = JSON.parse(rawData);

    // Sadece resimli olanları filtrele
    const promptsWithImages = prompts.filter(p => p.images && p.images.length > 0);

    console.log(`📊 Toplam ${prompts.length} prompt bulundu`);
    console.log(`🖼️ Resimli prompt sayısı: ${promptsWithImages.length}`);

    // CSV başlıkları
    const headers = [
        'ID',
        'Başlık (Title)',
        'Kaynak (Source)',
        'Model',
        'Prompt (İngilizce)',
        'Prompt (Çince)',
        'Etiketler (Tags)',
        'Orijinal Kaynak Adı',
        'Orijinal Kaynak URL',
        'Resim URL 1',
        'Resim URL 2',
        'Resim URL 3'
    ];

    // CSV satırlarını oluştur
    const csvRows = [headers.join(',')];

    promptsWithImages.forEach(prompt => {
        const row = [
            escapeCSV(prompt.id),
            escapeCSV(prompt.title),
            escapeCSV(prompt.source),
            escapeCSV(prompt.model),
            escapeCSV(prompt.prompt_en || ''),
            escapeCSV(prompt.prompt_cn || ''),
            escapeCSV(prompt.tags ? prompt.tags.join('; ') : ''),
            escapeCSV(prompt.original_source?.name || ''),
            escapeCSV(prompt.original_source?.url || ''),
            escapeCSV(prompt.images?.[0] || ''),
            escapeCSV(prompt.images?.[1] || ''),
            escapeCSV(prompt.images?.[2] || '')
        ];
        csvRows.push(row.join(','));
    });

    // CSV dosyasını yaz
    fs.writeFileSync(outputCsvPath, '\ufeff' + csvRows.join('\n'), 'utf8'); // BOM ekle (Excel için UTF-8 desteği)

    console.log(`\n✅ CSV dosyası oluşturuldu!`);
    console.log(`📁 Konum: ${outputCsvPath}`);
    console.log(`📊 Toplam satır: ${promptsWithImages.length}`);

} catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
}
