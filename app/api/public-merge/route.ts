import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.turklawai.com';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

export async function GET() {
    if (!supabaseKey) {
        return NextResponse.json({ error: 'Service Role Key missing in environment' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const pairs = [
        [3529, 3528], // #3529 (Link) -> #3528 (Main)
        [3488, 3487], 
        [3475, 3474], 
        [3473, 3472], 
        [3465, 3464], 
        [3418, 3417]
    ];

    const results = [];

    for (const [linkNum, mainNum] of pairs) {
        // Fetch
        const { data: prompts } = await supabase
            .from('banana_prompts')
            .select('*')
            .in('display_number', [linkNum, mainNum]);

        if (!prompts || prompts.length < 2) {
            results.push({ pair: `${linkNum}-${mainNum}`, status: 'Not Found' });
            continue;
        }

        const pLink = prompts.find(p => p.display_number === linkNum);
        const pMain = prompts.find(p => p.display_number === mainNum);

        if (!pLink || !pMain) continue;

        // Merge Images
        const combinedImages = [...new Set([...(pMain.images || []), ...(pLink.images || [])])];
        
        // Update
        const { error: upErr } = await supabase
            .from('banana_prompts')
            .update({ images: combinedImages })
            .eq('id', pMain.id);

        if (upErr) {
            results.push({ pair: `${linkNum}-${mainNum}`, status: 'Update Fail', error: upErr.message });
            continue;
        }

        // Delete Link
        const { error: delErr } = await supabase
            .from('banana_prompts')
            .delete()
            .eq('id', pLink.id);

        results.push({ 
            pair: `${linkNum}->${mainNum}`, 
            status: delErr ? 'Delete Fail' : 'SUCCESS', 
            images: combinedImages.length 
        });
    }

    return NextResponse.json({ results });
}
