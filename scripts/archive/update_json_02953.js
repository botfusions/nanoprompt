const fs = require('fs');
const path = require('path');

const jsonPath = path.resolve(__dirname, '../src/data/all_prompts.json');

console.log("=== all_prompts.json #02953 Güncelleme ===\n");

try {
    // JSON dosyasını oku
    console.log("1. JSON dosyası okunuyor...");
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const prompts = JSON.parse(jsonContent);

    console.log(`   Toplam prompt sayısı: ${prompts.length}`);

    // #02953'ü bul
    const prompt02953Index = prompts.findIndex(p => p.id === '02953');

    if (prompt02953Index === -1) {
        console.log("   ⚠️ #02953 bulunamadı!");
        process.exit(1);
    }

    console.log(`   #02953 bulundu, index: ${prompt02953Index}`);
    console.log(`   Mevcut title: ${prompts[prompt02953Index].title}`);
    console.log(`   Mevcut images: ${JSON.stringify(prompts[prompt02953Index].images)}`);

    // Güncelle
    console.log("\n2. #02953 güncelleniyor...");

    prompts[prompt02953Index] = {
        "id": "02953",
        "displayNumber": 2953,
        "title": "Athletic Runner - Sports Editorial Poster",
        "prompt": "A side-profile shot of an athletic Black male runner mid-stride, captured in a high-energy sports editorial poster style. The image features mixed media elements with neon lime green scribbles outlining his body. Age 20-30, focused forward with determined energy. Lean athletic build, high knee lift in mid-air flight phase. Wearing grey hooded windbreaker jacket, black layered running shorts, white running sneakers with orange accents. Neon green doodle outline around the body as graphic overlay. Sports editorial mixed with graphic design poster style, eye-level tracking shot, full body wide shot, 3:4 vertical poster aspect ratio. Hard directional sunlight (golden hour) with sharp long shadows. Outdoor asphalt road background with large neon green typography 'EXERCISE' and hand-drawn arrows. Modern sports zine aesthetic.",
        "summary": "Athletic Black male runner in dynamic mid-stride pose with neon green graphic overlays and sports editorial poster styling",
        "author": "@BotFusionsS",
        "date": "2025-12-28",
        "tags": ["photography", "portrait", "creative", "sports"],
        "images": [
            "https://pbs.twimg.com/media/G853Mz4bEAANDNB?format=jpg&name=small",
            "https://pbs.twimg.com/media/G853MzvagAECxtt?format=jpg&name=small"
        ],
        "featured": false,
        "model": "Nano banana pro",
        "source": "BotsNANO"
    };

    // Kaydet
    console.log("\n3. Dosya kaydediliyor...");
    fs.writeFileSync(jsonPath, JSON.stringify(prompts, null, 2), 'utf8');

    // Doğrula
    console.log("\n4. Doğrulama...");
    const verifyContent = fs.readFileSync(jsonPath, 'utf8');
    const verifyPrompts = JSON.parse(verifyContent);
    const verified = verifyPrompts.find(p => p.id === '02953');

    console.log(`   Yeni title: ${verified.title}`);
    console.log(`   Yeni images (${verified.images?.length || 0} adet): ${JSON.stringify(verified.images)}`);
    console.log(`   Yeni author: ${verified.author}`);

    if (verified.images?.length === 2) {
        console.log("\n✅ BAŞARILI: #02953 artık 2 resme sahip!");
    }

    console.log("\n=== Tamamlandı ===");

} catch (err) {
    console.error("Hata:", err);
}
