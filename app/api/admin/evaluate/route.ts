import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Prefer Service Role Key for Admin tasks, fallback to Anon (might fail RLS)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
    if (!apiKey || !genAI) {
        return NextResponse.json({ error: 'GEMINI_API_KEY is missing in environment variables' }, { status: 500 });
    }

    try {
        const { batchSize = 5 } = await req.json();

        // 1. Fetch un-scored prompts
        const { data: prompts, error: fetchError } = await supabase
            .from('banana_prompts')
            .select('id, prompt, title')
            .is('conversion_score', null)
            .limit(batchSize);

        if (fetchError) throw fetchError;
        if (!prompts || prompts.length === 0) {
            return NextResponse.json({ message: 'No more prompts to evaluate', count: 0 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            prompt_id: { type: SchemaType.STRING },
                            use_case: { type: SchemaType.STRING },
                            visual_style: { type: SchemaType.STRING },
                            camera_framing: { type: SchemaType.STRING },
                            lighting_type: { type: SchemaType.STRING },
                            subject_type: { type: SchemaType.STRING },
                            conversion_score: { type: SchemaType.INTEGER },
                            short_reason: { type: SchemaType.STRING }
                        },
                        required: ["prompt_id", "use_case", "visual_style", "camera_framing", "lighting_type", "subject_type", "conversion_score", "short_reason"]
                    }
                }
            }
        });

        // 2. Prepare Batch Prompt
        const promptList = prompts.map((p: any) => `ID: ${p.id}\nPrompt: ${p.prompt}`).join('\n\n');
        const systemInstruction = `
    You are an AI prompt evaluator. Evaluate each prompt based on:
    - conversion_score: 1-5 (5=Viral/Excellent, 1=Weak). Be strict. Only ~15% should be 5.
    - use_case: One of [Fashion, Product, UGC / Ads, Editorial, Social Viral, Stock]
    - visual_style: One of [Y2K, Luxury, Gritty, Minimal, Cyber, Editorial, Mixed]
    - camera_framing: One of [Ultra close-up, Close-up, Medium, Wide, Fisheye, Low-angle, Mixed]
    - lighting_type: One of [High contrast, Soft cinematic, Studio, Neon, Natural, Mixed]
    - subject_type: One of [Female, Male, Product, Mixed, No human]
    - short_reason: Max 12 words.
    
    Return JSON array matching the schema.
    `;

        // 3. Call Gemini
        const result = await model.generateContent([systemInstruction, promptList]);
        const responseText = result.response.text();
        const metrics = JSON.parse(responseText);

        // 4. Update Supabase
        let successCount = 0;
        for (const item of metrics) {
            if (!item.prompt_id) continue;

            const { error: updateError } = await supabase
                .from('banana_prompts')
                .update({
                    use_case: item.use_case,
                    visual_style: item.visual_style,
                    camera_framing: item.camera_framing,
                    lighting_type: item.lighting_type,
                    subject_type: item.subject_type,
                    conversion_score: item.conversion_score,
                    short_reason: item.short_reason
                })
                .eq('id', item.prompt_id);

            if (!updateError) successCount++;
        }

        return NextResponse.json({
            success: true,
            processed: prompts.length,
            updated: successCount
        });

    } catch (error: any) {
        console.error('Evaluation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
