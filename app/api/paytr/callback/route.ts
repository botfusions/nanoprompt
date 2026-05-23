import { NextRequest, NextResponse } from 'next/server';
import { verifyPayTRCallback } from '@/src/lib/payment';
import { addCredits } from '@/src/lib/credits';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = value.toString();
    });

    const verification = verifyPayTRCallback(body);

    if (!verification.valid) {
      console.error('PayTR callback invalid hash:', body.merchant_oid);
      return new NextResponse('PAYTR notification failed', { status: 400 });
    }

    if (verification.status === 'success') {
      const merchantOid = verification.merchantOid;
      // merchantOid format: credits_{userId}_{timestamp}
      const parts = merchantOid.split('_');
      const userId = parts[1];

      if (!userId) {
        console.error('PayTR callback missing userId:', merchantOid);
        return new NextResponse('PAYTR notification failed', { status: 400 });
      }

      // Paket bilgisi merchantOid'den veya amount'dan belirlenebilir
      const totalAmount = parseInt(body.total_amount || '0', 10) / 100; // TL'ye çevir

      const credits = getAmountToCredits(totalAmount);

      await addCredits(
        userId,
        credits,
        'purchase',
        `Kredi paketi satın alımı (${totalAmount} TL)`,
        merchantOid
      );
    }

    return new NextResponse('PAYTR notification received', { status: 200 });
  } catch (error) {
    console.error('PayTR callback error:', error);
    return new NextResponse('PAYTR notification failed', { status: 400 });
  }
}

function getAmountToCredits(amountTL: number): number {
  if (amountTL >= 900) return 200;     // Sınırsız
  if (amountTL >= 300) return 50;      // Pro
  return 10;                           // Başlangıç
}
