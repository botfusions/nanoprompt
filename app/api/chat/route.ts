import { NextRequest, NextResponse } from 'next/server';

// Rate limiting for chat API
const chatRateLimit = new Map<string, { count: number; resetTime: number }>();
const CHAT_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const CHAT_RATE_LIMIT_MAX = 30; // 30 messages per minute

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = chatRateLimit.get(ip);

    if (!record || now > record.resetTime) {
        chatRateLimit.set(ip, { count: 1, resetTime: now + CHAT_RATE_LIMIT_WINDOW });
        return false;
    }

    if (record.count >= CHAT_RATE_LIMIT_MAX) {
        return true;
    }

    record.count++;
    return false;
}

export async function POST(request: NextRequest) {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';

    // Rate limiting
    if (isRateLimited(ip)) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait.' },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();
        const { message } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Invalid message' },
                { status: 400 }
            );
        }

        // Sanitize message - prevent extremely long messages
        const sanitizedMessage = message.trim().slice(0, 2000);

        const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;

        if (!webhookUrl) {
            console.error('N8N_CHAT_WEBHOOK_URL is not configured');
            return NextResponse.json(
                { output: 'Chat servisi geçici olarak kullanılamıyor.' },
                { status: 200 }
            );
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: sanitizedMessage }),
        });

        if (!response.ok) {
            throw new Error(`Webhook returned ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json({
            output: data.output || data.message || 'Yanıt alınamadı.'
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { output: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
            { status: 200 }
        );
    }
}
