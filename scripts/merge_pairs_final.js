const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(process.cwd(), '.env');
const content = fs.readFileSync(envPath, 'utf8');
const envConfig = {};
content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const eq = trimmed.indexOf('=');
        if (eq > 0) envConfig[trimmed.substring(0, eq).trim()] = trimmed.substring(eq + 1).trim();
    }
});

const url = envConfig.VITE_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const key = envConfig.VITE_SUPABASE_ANON_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function mergePairsFinal() {
    const pairs = [[3488, 3487], [3475, 3474], [3473, 3472], [3465, 3464], [3418, 3417]];
    const flatIds = pairs.flat();

    console.log("🛠️ Prompt çiftleri birleştiriliyor (Multi-image merge)...");

    const { data, error } = await supabase
        .from('banana_prompts')
        .select('*')
        .in('display_number', flatIds);

    if (error) {
        console.error(error);
        return;
    }

    for (const pair of pairs) {
        const p1 = data.find(p => p.display_number === pair[0]);
        const p2 = data.find(p => p.display_number === pair[1]);

        if (p1 && p2) {
            // "access" içeren metin link kaydıdır
            const isP1Link = p1.prompt?.toLowerCase().includes('access nano banana');
            const mainPrompt = isP1Link ? p2 : p1;
            const linkPrompt = isP1Link ? p1 : p2;

            console.log(`🔗 #${pair[0]} & #${pair[1]} birleştiriliyor...`);
            console.log(`   🔸 Saklanan (Main): #${mainPrompt.display_number}`);
            console.log(`   🗑️ Silinen (Link): #${linkPrompt.display_number}`);

            // Resimleri birleştir (dublicate olmamasına dikkat et)
            const combinedImages = [...new Set([...(mainPrompt.images || []), ...(linkPrompt.images || [])])];

            // 1. Main promptu güncelle (Resimleri ekle)
            const { error: updateError } = await supabase
                .from('banana_prompts')
                .update({ images: combinedImages })
                .eq('id', mainPrompt.id);

            if (updateError) {
                console.error(`   ❌ Güncelleme hatası (#${mainPrompt.display_number}):`, updateError.message);
                continue;
            }

            // 2. Link promptunu sil
            const { error: deleteError } = await supabase
                .from('banana_prompts')
                .delete()
                .eq('id', linkPrompt.id);

            if (deleteError) {
                console.error(`   ❌ Silme hatası (#${linkPrompt.display_number}):`, deleteError.message);
            } else {
                console.log(`   ✅ Başarıyla birleştirildi.`);
            }
        }
    }
}

mergePairsFinal();
