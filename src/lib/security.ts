/**
 * Security Service - Telegram Alarm & Rate Limiting
 */

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

// Rate limiting store (in-memory, resets on deploy)
const ipRequestStore = new Map<string, { count: number; timestamp: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 dakika
const RATE_LIMIT_MAX_REQUESTS = 100; // Dakikada max 100 istek
const LOGIN_ATTEMPT_LIMIT = 5; // 5 başarısız deneme

// Failed login attempts store
const failedLoginStore = new Map<string, { count: number; timestamp: number }>();

/**
 * Send Telegram Alert
 */
export async function sendTelegramAlert(
    type: 'RATE_LIMIT' | 'LOGIN_FAIL' | 'SUSPICIOUS' | 'INFO',
    message: string,
    details?: Record<string, unknown>
): Promise<boolean> {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn("[Security] Telegram credentials not configured");
        return false;
    }

    const emoji = {
        'RATE_LIMIT': '🚨',
        'LOGIN_FAIL': '⚠️',
        'SUSPICIOUS': '🔴',
        'INFO': 'ℹ️'
    };

    const formattedMessage = `
${emoji[type]} *${type} ALERT*
━━━━━━━━━━━━━━━━━━
📝 ${message}
⏰ ${new Date().toLocaleString('tr-TR')}
${details ? `\n📋 Details:\n\`\`\`\n${JSON.stringify(details, null, 2)}\n\`\`\`` : ''}
    `.trim();

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: formattedMessage,
                    parse_mode: 'Markdown'
                })
            }
        );

        return response.ok;
    } catch (error) {
        console.error("[Security] Telegram alert failed:", error);
        return false;
    }
}

/**
 * Check and update rate limit for an IP
 * Returns true if request should be blocked
 */
export function checkRateLimit(ip: string): { blocked: boolean; remaining: number } {
    const now = Date.now();
    const record = ipRequestStore.get(ip);

    if (!record || (now - record.timestamp) > RATE_LIMIT_WINDOW) {
        // Reset or create new record
        ipRequestStore.set(ip, { count: 1, timestamp: now });
        return { blocked: false, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
    }

    record.count++;

    if (record.count > RATE_LIMIT_MAX_REQUESTS) {
        // Rate limit exceeded - send alert (only once per window)
        if (record.count === RATE_LIMIT_MAX_REQUESTS + 1) {
            sendTelegramAlert('RATE_LIMIT', `IP blocked for too many requests`, {
                ip,
                requests: record.count,
                window: '1 minute'
            });
        }
        return { blocked: true, remaining: 0 };
    }

    return { blocked: false, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

/**
 * Track failed login attempts
 * Returns true if should block further attempts
 */
export function trackFailedLogin(identifier: string, ip: string): { blocked: boolean; attempts: number } {
    const key = `${identifier}-${ip}`;
    const now = Date.now();
    const record = failedLoginStore.get(key);

    if (!record || (now - record.timestamp) > (15 * 60 * 1000)) { // 15 dakika reset
        failedLoginStore.set(key, { count: 1, timestamp: now });
        return { blocked: false, attempts: 1 };
    }

    record.count++;

    if (record.count >= LOGIN_ATTEMPT_LIMIT) {
        // Too many failed attempts
        sendTelegramAlert('LOGIN_FAIL', `Multiple failed login attempts detected`, {
            identifier,
            ip,
            attempts: record.count,
            action: 'Temporarily blocked'
        });
        return { blocked: true, attempts: record.count };
    }

    // Alert on 3rd failed attempt
    if (record.count === 3) {
        sendTelegramAlert('LOGIN_FAIL', `3 failed login attempts`, {
            identifier,
            ip,
            warning: 'Monitoring...'
        });
    }

    return { blocked: false, attempts: record.count };
}

/**
 * Reset failed login attempts (on successful login)
 */
export function resetFailedLogins(identifier: string, ip: string): void {
    const key = `${identifier}-${ip}`;
    failedLoginStore.delete(key);
}

/**
 * Log suspicious activity
 */
export function logSuspiciousActivity(
    type: string,
    details: Record<string, unknown>
): void {
    sendTelegramAlert('SUSPICIOUS', `Suspicious activity: ${type}`, details);
}

/**
 * Clean up old records (call periodically)
 */
export function cleanupSecurityStores(): void {
    const now = Date.now();

    // Clean rate limit store
    ipRequestStore.forEach((value, key) => {
        if (now - value.timestamp > RATE_LIMIT_WINDOW * 2) {
            ipRequestStore.delete(key);
        }
    });

    // Clean failed login store
    failedLoginStore.forEach((value, key) => {
        if (now - value.timestamp > 15 * 60 * 1000) {
            failedLoginStore.delete(key);
        }
    });
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupSecurityStores, 5 * 60 * 1000);
}
