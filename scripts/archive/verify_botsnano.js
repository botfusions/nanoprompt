// Verify BotsNANO records in Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyBotsNANO() {
    console.log('🔍 BotsNANO Kayıtları Doğrulaması\n');
    console.log('='.repeat(50));

    // Get all BotsNANO source prompts
    const { data: botsNanoPrompts, error } = await supabase
        .from('banana_prompts')
        .select('id, display_number, images, source, title')
        .eq('source', 'BotsNANO')
        .order('display_number', { ascending: true });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`\n📦 TOPLAM BotsNANO KAYIT: ${botsNanoPrompts.length}\n`);

    // Check image paths
    let withLocalImages = 0;
    let withTwitterImages = 0;
    let withNoImages = 0;

    botsNanoPrompts.forEach((p, idx) => {
        const hasImages = p.images && p.images.length > 0;
        if (!hasImages) {
            withNoImages++;
        } else {
            const hasLocal = p.images.some(img => img.includes('/images/botnano'));
            const hasTwitter = p.images.some(img => img.includes('pbs.twimg.com'));
            if (hasLocal) withLocalImages++;
            if (hasTwitter) withTwitterImages++;
        }

        // Show first 30 records
        if (idx < 30) {
            const imgCount = p.images?.length || 0;
            const imgType = hasImages ? (p.images[0].includes('/images/') ? 'LOCAL' : 'TWITTER') : 'NONE';
            console.log(`   #${String(p.display_number).padStart(5, '0')} - ${imgCount} img (${imgType}) - ${p.title?.substring(0, 30) || 'No title'}...`);
        }
    });

    if (botsNanoPrompts.length > 30) {
        console.log(`   ... ve ${botsNanoPrompts.length - 30} kayıt daha`);
    }

    console.log('\n📊 RESİM TİPİ DAĞILIMI:');
    console.log(`   Local (/images/botnano...): ${withLocalImages}`);
    console.log(`   Twitter (pbs.twimg.com):   ${withTwitterImages}`);
    console.log(`   Resimsiz:                  ${withNoImages}`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Doğrulama tamamlandı');
}

verifyBotsNANO();
