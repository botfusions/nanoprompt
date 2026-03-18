import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramAlert } from '@/src/lib/security';

/**
 * HONEYPOT ROUTE: /api/admin/backup
 * Bu rota UI'da yoktur. Sadece dizin tarayan botlar veya saldırganlar buraya erişir.
 * Erişen IP anında raporlanır.
 */
export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    console.warn(`🚨 HONEYPOT TRIGGERED: IP ${ip} accessed /api/admin/backup`);

    // Telegram Alert Gönder (Layer 3: Active Defense)
    await sendTelegramAlert(
        'HONEYPOT',
        'Honeypot route accessed',
        { 
            path: '/api/admin/backup',
            ip,
            userAgent,
            action: 'Immediate IP Review Recommended'
        }
    );

    // Saldırganı yanıltmak için 404 yerine 403 (veya fake JSON) dönelim
    return NextResponse.json(
        { error: 'Access Denied', timestamp: new Date().toISOString() },
        { status: 403 }
    );
}

// POST için de aynısını yapalım
export async function POST(req: NextRequest) {
    return GET(req);
}
