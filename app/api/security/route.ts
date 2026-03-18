import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, sendTelegramAlert, checkDownloadLimit, incrementDownloadCount } from '@/src/lib/security';

/**
 * Security Check API - Rate limit and Download limit verification endpoint
 */
export async function GET(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';

    const type = request.nextUrl.searchParams.get('type');

    if (type === 'download') {
        const { allowed, remaining } = checkDownloadLimit(ip);
        return NextResponse.json({ allowed, remaining });
    }

    const { blocked, remaining } = checkRateLimit(ip);

    if (blocked) {
        return NextResponse.json(
            { error: 'Too many requests', retryAfter: 60 },
            {
                status: 429,
                headers: {
                    'Retry-After': '60',
                    'X-RateLimit-Remaining': '0'
                }
            }
        );
    }

    return NextResponse.json(
        { ok: true, remaining },
        {
            headers: {
                'X-RateLimit-Remaining': remaining.toString()
            }
        }
    );
}

/**
 * POST - Report suspicious activity or increment download count
 */
export async function POST(request: NextRequest) {
    // SECURITY LAYER 2: Token verification to prevent bot-spamming
    const secureToken = request.headers.get('X-Nano-Secure-Token');
    if (secureToken !== 'nano-studio-v2-secure-2026' && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { type, message, details } = body;

        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';

        if (type === 'increment_download') {
            const currentCount = incrementDownloadCount(ip);
            return NextResponse.json({ ok: true, count: currentCount });
        }

        // Check rate limit first for other security reports
        const { blocked } = checkRateLimit(ip);
        if (blocked) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        // Send alert
        await sendTelegramAlert(type || 'INFO', message || 'Security event', {
            ...details,
            reportedFrom: ip
        });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        );
    }
}
