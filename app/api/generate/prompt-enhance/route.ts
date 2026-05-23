import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt zorunlu' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ enhancedPrompt: prompt });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Sen bir AI görsel oluşturma prompt uzmanısın. Kullanıcının verdiği basit açıklamayı, yüksek kaliteli görsel üretecek detaylı bir prompt'a dönüştür.

Kurallar:
- İngilizce yaz (AI modeller İngilizce prompt'larla daha iyi çalışır)
- Aydınlatma, kompozisyon, stil, renk paleti detayları ekle
- Negatif prompt öner
- Maksimum 200 kelime
- Sadece prompt'u döndür, açıklama yazma

Kullanıcı açıklaması: "${prompt}"

Geliştirilmiş prompt:`,
    });

    const enhancedPrompt = response.text?.trim() || prompt;

    return NextResponse.json({ enhancedPrompt });
  } catch (error) {
    console.error('Prompt enhance error:', error);
    return NextResponse.json({ enhancedPrompt: (await request.json()).prompt });
  }
}
