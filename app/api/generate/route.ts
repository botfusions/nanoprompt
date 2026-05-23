import { NextRequest, NextResponse } from 'next/server';
import { generateImage, MODELS, ModelKey } from '@/src/lib/replicate';
import { getOrCreateCreditBalance, deductCredits, CREDIT_COSTS } from '@/src/lib/credits';
import { supabase } from '@/src/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, width, height, negativePrompt, userId } = body;

    if (!prompt || !model || !userId) {
      return NextResponse.json(
        { error: 'prompt, model ve userId zorunlu' },
        { status: 400 }
      );
    }

    const modelKey = model as ModelKey;
    const modelConfig = MODELS[modelKey];
    if (!modelConfig) {
      return NextResponse.json({ error: 'Geçersiz model' }, { status: 400 });
    }

    const creditCost = CREDIT_COSTS[modelKey] || 1;
    const balance = await getOrCreateCreditBalance(userId);

    if (balance.credits < creditCost) {
      return NextResponse.json(
        { error: 'Yetersiz kredi', creditsRemaining: balance.credits, creditCost },
        { status: 402 }
      );
    }

    const startTime = Date.now();

    const result = await generateImage({
      prompt,
      model: modelKey,
      width: width || 1024,
      height: height || 1024,
      negativePrompt,
    });

    const generationTime = Date.now() - startTime;

    const { data: imageRecord, error: dbError } = await supabase
      .from('generated_images')
      .insert({
        user_id: userId,
        prompt,
        enhanced_prompt: result.enhancedPrompt,
        negative_prompt: negativePrompt || null,
        model: modelKey,
        image_url: result.imageUrl,
        width: width || 1024,
        height: height || 1024,
        generation_time_ms: generationTime,
        credits_used: creditCost,
        status: 'completed',
      })
      .select('id')
      .single();

    const { remaining } = await deductCredits(
      userId,
      creditCost,
      imageRecord?.id
    );

    return NextResponse.json({
      imageUrl: result.imageUrl,
      prompt: result.enhancedPrompt,
      originalPrompt: prompt,
      model: modelKey,
      generationTime,
      creditsUsed: creditCost,
      creditsRemaining: remaining,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: 'Görsel oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
