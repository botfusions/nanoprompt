import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateCreditBalance, checkAndRefillDaily } from '@/src/lib/credits';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId zorunlu' }, { status: 400 });
    }

    const balance = await checkAndRefillDaily(userId);

    return NextResponse.json(balance);
  } catch (error) {
    console.error('Credits fetch error:', error);
    return NextResponse.json({ error: 'Krediler yüklenemedi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId zorunlu' }, { status: 400 });
    }

    const balance = await checkAndRefillDaily(userId);

    return NextResponse.json(balance);
  } catch (error) {
    console.error('Credits refill error:', error);
    return NextResponse.json({ error: 'Kredi dolumu başarısız' }, { status: 500 });
  }
}
