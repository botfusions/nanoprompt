import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
    '/dashboard',
    '/profile',
    '/settings',
    '/admin',
    '/api/admin',
];

// Rate limiting simple implementation (in-memory, resets on restart)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = rateLimit.get(ip);

    if (!record || now > record.resetTime) {
        rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return false;
    }

    if (record.count >= RATE_LIMIT_MAX) {
        return true;
    }

    record.count++;
    return false;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';

    // Rate limiting for API routes
    if (pathname.startsWith('/api/')) {
        if (isRateLimited(ip)) {
            return new NextResponse('Too Many Requests', { status: 429 });
        }
    }

    // Protected route check
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
        pathname.startsWith(route)
    );

    if (isProtectedRoute) {
        // Check for Supabase auth cookie
        const supabaseCookie = request.cookies.get('sb-access-token') ||
            request.cookies.get('supabase-auth-token');

        if (!supabaseCookie) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // API routes
        '/api/:path*',
        // Protected routes
        '/dashboard/:path*',
        '/profile/:path*',
        '/settings/:path*',
    ],
};
