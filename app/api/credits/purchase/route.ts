import { NextRequest, NextResponse } from 'next/server';
import { createPayTRPayment, getPackageById } from '@/src/lib/payment';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, packageId } = await request.json();

    if (!userId || !packageId) {
      return NextResponse.json({ error: 'userId ve packageId zorunlu' }, { status: 400 });
    }

    const pkg = getPackageById(packageId);
    if (!pkg) {
      return NextResponse.json({ error: 'Geçersiz paket' }, { status: 400 });
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const userIp = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1';

    const result = await createPayTRPayment(userId, email || '', packageId, userIp);

    return NextResponse.json({ checkoutUrl: result.paymentUrl, token: result.token });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json({ error: 'Ödeme oturumu oluşturulamadı' }, { status: 500 });
  }
}
