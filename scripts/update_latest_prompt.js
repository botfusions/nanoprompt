// Son eklenen promptu güncelle - başlık ve prompt içeriği
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://cqurdcqvmpnfxhchcvhb.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxdXJkY3F2bXBuZnhoY2hjdmhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTA0MzI4MiwiZXhwIjoyMDUwNjE5MjgyfQ.FV9L1SusOKT_cqmq1ei1m4t6YCkgHitsAhvySvEE5pU'
);

async function updateLatestPrompt() {
    // En son eklenen kaydı bul
    const { data: latestPrompt, error: findError } = await supabase
        .from('banana_prompts')
        .select('id, title, date')
        .order('date', { ascending: false })
        .limit(1)
        .single();

    if (findError) {
        console.error('Kayıt bulunamadı:', findError);
        return;
    }

    console.log('Bulundu:', latestPrompt);

    // Güncelle
    const { data, error } = await supabase
        .from('banana_prompts')
        .update({
            title: 'Nano Banana Pro prompt',
            prompt: `Do this for a random famous Asian painting <instruction>

Input A is a Famous Painting (e.g., The Mona Lisa, The Scream). Analyze: The brushstroke technique, the 3D depth implied, and the hidden symbols. 
Goal: A "Paint Tube Squeeze." A giant, realistic oil paint tube sitting on a palette. 
Rules:

Action: The tube is being squeezed, and the paint coming out is not just a blob, but it forms the 3D landscape of the painting. The Mona Lisa's face is emerging in 3D relief from the 2D smear of paint. 

Texture: Viscous, thick oil paint texture (impasto).

Props: Paintbrushes, a dirty rag, a palette knife, plus culture appropriate tools and environment. 
 
Lighting: North-light studio lighting, true color representation. Output:
ONE image, 4:5, "artistic process" aesthetic. </instruction>`,
            display_number: 2954,
            date: '2025-12-29'
        })
        .eq('id', latestPrompt.id)
        .select();

    if (error) {
        console.error('Güncelleme hatası:', error);
    } else {
        console.log('✅ Güncellendi:', data);
    }
}

updateLatestPrompt();
