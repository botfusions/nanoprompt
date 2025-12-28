"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmail, signInWithGoogle } from "@/src/lib/firebase";
import { Mail, Lock, Loader2, AlertTriangle } from "lucide-react";

// Brute force protection constants
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60; // seconds

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Brute force protection state
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutTimer, setLockoutTimer] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    // Lockout timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (lockoutTimer > 0) {
            setIsLocked(true);
            interval = setInterval(() => {
                setLockoutTimer((prev) => {
                    if (prev <= 1) {
                        setIsLocked(false);
                        setFailedAttempts(0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [lockoutTimer]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if account is locked
        if (isLocked) {
            setError(`Çok fazla deneme. ${lockoutTimer} saniye bekleyin.`);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await signInWithEmail(email, password);
            setFailedAttempts(0); // Reset on success
            router.push("/");
        } catch (err) {
            const newAttempts = failedAttempts + 1;
            setFailedAttempts(newAttempts);

            // Report failed login to security API
            try {
                await fetch('/api/security', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'LOGIN_FAIL',
                        message: `Failed login attempt for ${email}`,
                        details: { email, attempts: newAttempts }
                    })
                });
            } catch {
                // Silently ignore if security API fails
            }

            if (newAttempts >= MAX_ATTEMPTS) {
                setLockoutTimer(LOCKOUT_DURATION);
                setError(`Çok fazla başarısız deneme. ${LOCKOUT_DURATION} saniye beklemeniz gerekiyor.`);
            } else {
                setError(err instanceof Error ? err.message : "Giriş başarısız");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            await signInWithGoogle();
            router.push("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Google ile giriş başarısız");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <h1 className="text-4xl font-black text-brand-black">
                            Bots<span className="text-brand-red">NANO</span>
                        </h1>
                    </Link>
                    <p className="mt-2 text-gray-600">Hesabınıza giriş yapın</p>
                </div>

                {/* Card */}
                <div className="bg-white border-4 border-brand-black shadow-neo p-8">
                    {/* Lockout Warning */}
                    {isLocked && (
                        <div className="mb-6 p-4 bg-orange-100 border-2 border-orange-500 text-orange-700 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <div>
                                <p className="font-bold">Hesap Geçici Olarak Kilitlendi</p>
                                <p className="text-sm">Tekrar denemek için: <span className="font-mono font-bold">{lockoutTimer}</span> saniye</p>
                            </div>
                        </div>
                    )}

                    {/* Failed Attempts Warning */}
                    {failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && !isLocked && (
                        <div className="mb-4 p-2 bg-yellow-100 border border-yellow-500 text-yellow-700 text-xs">
                            Kalan deneme hakkı: <span className="font-bold">{MAX_ATTEMPTS - failedAttempts}</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && !isLocked && (
                        <div className="mb-6 p-3 bg-red-100 border-2 border-red-500 text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-brand-black font-bold uppercase text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 mb-6"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google ile Giriş Yap
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">veya</span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold uppercase mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 border-2 border-brand-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                    placeholder="ornek@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase mb-2">Şifre</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 border-2 border-brand-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-brand-yellow border-2 border-brand-black font-bold uppercase text-sm hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Giriş yapılıyor...
                                </>
                            ) : (
                                "Giriş Yap"
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Hesabınız yok mu?{" "}
                        <Link href="/register" className="font-bold text-brand-black hover:text-brand-red">
                            Kayıt Olun
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
