const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envConfig = {};
envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
        const eqIndex = trimmedLine.indexOf('=');
        if (eqIndex > 0) {
            const key = trimmedLine.substring(0, eqIndex).trim();
            const value = trimmedLine.substring(eqIndex + 1).trim();
            envConfig[key] = value;
        }
    }
});

const supabase = createClient(
    envConfig.NEXT_PUBLIC_SUPABASE_URL,
    envConfig.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPrompt() {
    // Display number ile ara
    const { data, error } = await supabase
        .from('banana_prompts')
        .select('*')
        .gte('display_number', 3203)
        .order('display_number', { ascending: true });

    if (error) {
        console.error("Hata:", error);
        return;
    }

    console.log(`\n📊 Twitter'dan eklenen promptlar (#03203+):\n`);

    data.forEach(p => {
        const hasImage = p.images && p.images.length > 0 && p.images[0];
        const imageStatus = hasImage ? '🖼️' : '❌';
        console.log(`${imageStatus} #${String(p.display_number).padStart(5, '0')} | ${p.author || 'N/A'} | ${(p.title || '').substring(0, 40)}`);
        if (hasImage) {
            console.log(`   Image: ${p.images[0].substring(0, 60)}...`);
        }
    });

    // #03145 detaylı göster
    console.log("\n" + "=".repeat(60));
    console.log("📋 #03341 Detay:");
    const p3145 = data.find(p => p.display_number === 3341);
    if (p3145) {
        console.log("ID:", p3145.id);
        console.log("Author:", p3145.author);
        console.log("Title:", p3145.title);
        console.log("Images:", JSON.stringify(p3145.images, null, 2));
    }
}

checkPrompt();
