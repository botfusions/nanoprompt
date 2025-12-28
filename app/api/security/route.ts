import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, sendTelegramAlert } from '@/src/lib/security';

/**
 * Security Check API - Rate limit verification endpoint
 * Can be called by frontend to check if user is rate limited
 */
export async function GET(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';

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
 * POST - Report suspicious activity
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, message, details } = body;

        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Check rate limit first
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
