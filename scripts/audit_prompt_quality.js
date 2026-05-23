/**
 * Prompt Kalite ve Veri Bütünlüğü Denetim Scripti (Audit Tool)
 * 
 * Bu script banana_prompts tablosundaki tüm kayıtları çeker ve:
 * 1. Görseli olup prompt metni olmayan (eksik prompt) kartları,
 * 2. 1 satırdan fazla (çok satırlı / satır sonu içeren) prompt kartlarını tespit eder.
 * 
 * Sonuçları konsola yazdırır ve exports/corrupted_audit_report.json olarak kaydeder.
 * 
 * Kullanım: node scripts/audit_prompt_quality.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env or .env.local
const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local')
];

let envConfig = {};
for (const p of envPaths) {
    if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        content.split('\n').forEach(line => {
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
    }
}

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL || envConfig.VITE_SUPABASE_URL;
const serviceRoleKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY || envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Supabase yapılandırması (.env) eksik!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runAudit() {
    console.log("\n" + "═".repeat(60));
    console.log("🔍 PROMPT VERİ KALİTESİ DENETİMİ (AUDIT) BAŞLADI");
    console.log("═".repeat(60) + "\n");

    let allPrompts = [];
    let from = 0;
    let to = 999;
    let hasMore = true;

    console.log("📥 banana_prompts tablosundaki tüm veriler indiriliyor...");
    
    while (hasMore) {
        const { data, error } = await supabase
            .from('banana_prompts')
            .select('id, display_number, title, prompt, images, author')
            .range(from, to)
            .order('display_number', { ascending: true });

        if (error) {
            console.error("❌ Veri indirme hatası:", error.message);
            process.exit(1);
        }

        if (!data || data.length === 0) {
            hasMore = false;
        } else {
            allPrompts = allPrompts.concat(data);
            console.log(`   -> ${allPrompts.length} kayıt indirildi...`);
            if (data.length < 1000) {
                hasMore = false;
            } else {
                from += 1000;
                to += 1000;
            }
        }
    }

    console.log(`\n✓ Toplam ${allPrompts.length} prompt başarıyla indirildi. Analiz ediliyor...\n`);

    const noPromptWithImage = [];
    const multiLinePrompts = [];

    allPrompts.forEach(p => {
        const promptText = p.prompt ? String(p.prompt).trim() : '';
        const hasPrompt = promptText.length > 0;
        
        const hasImage = p.images && (
            (Array.isArray(p.images) && p.images.length > 0) || 
            (typeof p.images === 'string' && p.images.trim().length > 0)
        );

        // 1. Görseli olup promptu olmayan kartlar
        if (hasImage && !hasPrompt) {
            noPromptWithImage.push({
                id: p.id,
                display_number: p.display_number,
                title: p.title || 'İsimsiz Kart',
                images: p.images,
                author: p.author
            });
        }

        // 2. Birden fazla satır içeren promptlar (1 satırdan fazla)
        if (hasPrompt) {
            // Satır sonu karakterlerine göre bölüp boş olmayan satır sayısına bakıyoruz
            const lines = promptText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length > 1) {
                multiLinePrompts.push({
                    id: p.id,
                    display_number: p.display_number,
                    title: p.title || 'İsimsiz Kart',
                    line_count: lines.length,
                    lines: lines,
                    prompt_preview: promptText.substring(0, 100) + (promptText.length > 100 ? '...' : ''),
                    author: p.author
                });
            }
        }
    });

    // Sonuçları Konsola Raporlama
    console.log("═".repeat(60));
    console.log("📊 DENETİM SONUÇLARI:");
    console.log("═".repeat(60));
    console.log(`🎨 Görseli Olup Promptu Olmayan Kart Sayısı: ${noPromptWithImage.length}`);
    console.log(`📝 Birden Fazla Satır İçeren Prompt Sayısı:  ${multiLinePrompts.length}`);
    console.log("═".repeat(60) + "\n");

    if (noPromptWithImage.length > 0) {
        console.log("⚠️ GÖRSELİ OLUP PROMPTU OLMAYAN KARTLAR:");
        noPromptWithImage.forEach(item => {
            console.log(`   🔸 [#${String(item.display_number).padStart(5, '0')}] Title: ${item.title} | Yazar: ${item.author}`);
        });
        console.log("");
    }

    if (multiLinePrompts.length > 0) {
        console.log("⚠️ BİRDEN FAZLA SATIR İÇEREN PROMPTLAR:");
        multiLinePrompts.forEach(item => {
            console.log(`   🔸 [#${String(item.display_number).padStart(5, '0')}] Title: ${item.title} | Satır Sayısı: ${item.line_count} | Yazar: ${item.author}`);
        });
        console.log("");
    }

    // Raporu Dosya Olarak Kaydetme
    const exportsDir = path.resolve(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir);
    }

    const reportPath = path.join(exportsDir, 'corrupted_audit_report.json');
    const reportData = {
        scan_time: new Date().toISOString(),
        total_scanned: allPrompts.length,
        no_prompt_with_image: {
            count: noPromptWithImage.length,
            items: noPromptWithImage
        },
        multi_line_prompts: {
            count: multiLinePrompts.length,
            items: multiLinePrompts
        }
    };

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf8');
    console.log(`💾 Detaylı analiz raporu kaydedildi: exports/corrupted_audit_report.json\n`);
}

runAudit().catch(err => {
    console.error("❌ Denetim hatası:", err.message);
    process.exit(1);
});
