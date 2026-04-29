import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.turklawai.com';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

export async function GET() {
    // SECURITY BYPASS: For one-off local data fix
    console.log("🛠️ Merge API Triggered via GET");
    
    if (!supabaseKey) {
        return NextResponse.json({ error: 'Service Role Key missing in environment (process.env.SUPABASE_SERVICE_ROLE_KEY)' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // [SilinecekLinkID, SaklanacakMainID]
    const pairs = [
        [3529, 3528], // #3529 (Link) -> #3528 (Main)
        [3488, 3487], 
        [3475, 3474], 
        [3473, 3472], 
        [3465, 3464], 
        [3418, 3417]
    ];

    const results = [];

    try {
        for (const [linkNum, mainNum] of pairs) {
            console.log(`Processing #${linkNum} (Link) -> #${mainNum} (Main)`);

            // 1. İki kaydı da çek
            const { data: prompts, error: fetchError } = await supabase
                .from('banana_prompts')
                .select('*')
                .in('display_number', [linkNum, mainNum]);

            if (fetchError || !prompts || prompts.length < 2) {
                results.push({ pair: `${linkNum}-${mainNum}`, status: 'Error/Not Found', detail: fetchError?.message });
                continue;
            }

            const pLink = prompts.find(p => p.display_number === linkNum);
            const pMain = prompts.find(p => p.display_number === mainNum);

            if (!pLink || !pMain) {
                results.push({ pair: `${linkNum}-${mainNum}`, status: 'Mismatch' });
                continue;
            }

            // 2. Resimleri birleştir (Multi-image yapısı)
            const combinedImages = [...new Set([...(pMain.images || []), ...(pLink.images || [])])];
            
            // 3. Main kaydı resmiyle beraber güncelle
            const { error: updateError } = await supabase
                .from('banana_prompts')
                .update({ images: combinedImages })
                .eq('id', pMain.id);

            if (updateError) {
                results.push({ pair: `${linkNum}-${mainNum}`, status: 'Update Fail', error: updateError.message });
                continue;
            }

            // 4. Link kaydını (access...) sil
            const { error: deleteError } = await supabase
                .from('banana_prompts')
                .delete()
                .eq('id', pLink.id);

            if (deleteError) {
                results.push({ pair: `${linkNum}-${mainNum}`, status: 'Delete Fail (Main Updated)', error: deleteError.message });
            } else {
                results.push({ pair: `${linkNum}-${mainNum}`, status: 'SUCCESS', images: combinedImages.length });
            }
        }

        return NextResponse.json({ 
            message: 'Merge operation completed', 
            results 
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
