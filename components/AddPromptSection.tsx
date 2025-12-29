"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Plus, Send, Image, X, Twitter, Loader2 } from "lucide-react";
import Link from "next/link";

export function AddPromptSection() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [prompt, setPrompt] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [twitterUrl, setTwitterUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [savedCardNumber, setSavedCardNumber] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !profile) return;

        setLoading(true);
        setError(null);

        try {
            // Twitter URL'sinden kullanıcı adını çıkar
            let authorName = profile.username || "unknown";
            if (twitterUrl) {
                // https://twitter.com/username veya https://x.com/username formatından çıkar
                const twitterMatch = twitterUrl.match(/(?:twitter\.com|x\.com)\/(@?\w+)/i);
                if (twitterMatch) {
                    authorName = twitterMatch[1].replace('@', ''); // @ varsa kaldır
                }
            }

            // Virgülle ayrılmış URL'leri parse et ve temizle
            const parseImageUrls = (input: string): string[] => {
                if (!input.trim()) return [];
                return input
                    .split(',')
                    .map(url => url.trim())
                    .filter(url => url.startsWith('http'));
            };

            // En yüksek displayNumber'ı bul ve +1 ekle
            const { data: maxNumberData } = await supabase
                .from("banana_prompts")
                .select('display_number')
                .order('display_number', { ascending: false })
                .limit(1)
                .single();

            const nextDisplayNumber = (maxNumberData?.display_number || 2953) + 1;

            // Tarih formatı: YYYY-MM-DD (saniye yok)
            const formattedDate = new Date().toISOString().split('T')[0];

            const insertData = {
                id: crypto.randomUUID(),
                title,
                prompt,
                images: parseImageUrls(imageUrl),
                categories: [],
                author: authorName,
                date: formattedDate,
                display_number: nextDisplayNumber,
                model: 'Nano banana pro',
                featured: false,
            };

            console.log("Inserting data:", insertData);

            const { data: insertedData, error: insertError } = await supabase
                .from("banana_prompts")
                .insert(insertData)
                .select('id')
                .single();

            if (insertError) {
                console.error("Insert error details:", {
                    message: insertError.message,
                    code: insertError.code,
                    details: insertError.details,
                    hint: insertError.hint
                });
                throw new Error(insertError.message || "Veritabanı hatası");
            }

            // Toplam kayıt sayısını al ve kart numarası olarak göster
            const { count } = await supabase
                .from("banana_prompts")
                .select('*', { count: 'exact', head: true });

            const cardNumber = `#${String(count || 1).padStart(5, '0')}`;
            setSavedCardNumber(cardNumber);
            setSuccess(true);
            setTitle("");
            setPrompt("");
            setImageUrl("");
            setTwitterUrl("");

            // 8 saniye sonra kapat ve sayfayı yenile
            setTimeout(() => {
                setSuccess(false);
                setSavedCardNumber(null);
                setIsOpen(false);
                // Sayfayı yenile - yeni prompt görünsün
                router.refresh();
            }, 8000);
        } catch (err) {
            console.error("Submit error:", err);
            setError(err instanceof Error ? err.message : "Gönderme başarısız");
        } finally {
            setLoading(false);
        }
    };

    // Not logged in - show CTA
    if (!user) {
        return (
            <div className="mb-8 p-6 bg-gradient-to-r from-brand-yellow/20 to-brand-red/20 border-4 border-brand-black shadow-neo">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-black uppercase">Promptunu Paylaş!</h3>
                        <p className="text-gray-700">Kendi prompt&apos;larını ekle, topluluğa katkıda bulun.</p>
                    </div>
                    <Link
                        href="/login"
                        className="flex items-center gap-2 px-6 py-3 bg-brand-yellow border-2 border-brand-black font-bold uppercase text-sm hover:bg-yellow-400 transition-colors shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        <Plus className="w-5 h-5" />
                        Giriş Yap ve Ekle
                    </Link>
                </div>
            </div>
        );
    }

    // Logged in - show form toggle
    return (
        <div className="mb-8">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full p-4 bg-white border-4 border-dashed border-brand-black hover:border-solid hover:bg-brand-yellow/10 transition-all flex items-center justify-center gap-3 group"
                >
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                    <span className="font-bold uppercase">Promptunu Ekle</span>
                </button>
            ) : (
                <div className="bg-white border-4 border-brand-black shadow-neo p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black uppercase">Yeni Prompt</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 p-4 bg-green-100 border-2 border-green-500 text-green-700 font-medium">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">✅</span>
                                <div>
                                    <p className="font-bold">Prompt başarıyla gönderildi!</p>
                                    {savedCardNumber && (
                                        <p className="text-lg mt-1">
                                            Kart Numaranız: <span className="font-black text-green-800 bg-green-200 px-2 py-1">{savedCardNumber}</span>
                                        </p>
                                    )}
                                    <p className="text-sm mt-1 opacity-75">Onay bekliyor...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700 font-medium">
                            {error}
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">Başlık</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border-2 border-brand-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                    placeholder="Prompt başlığı"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">Prompt</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 border-2 border-brand-black focus:outline-none focus:ring-2 focus:ring-brand-yellow resize-none"
                                    placeholder="Prompt içeriğini buraya yazın..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">
                                    <Image className="w-4 h-4 inline mr-1" />
                                    Görsel URL&apos;leri (Opsiyonel - virgülle ayırın)
                                </label>
                                <textarea
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-3 border-2 border-brand-black focus:outline-none focus:ring-2 focus:ring-brand-yellow resize-none text-sm"
                                    placeholder="https://pbs.twimg.com/media/xxx?format=jpg, https://pbs.twimg.com/media/yyy?format=jpg"
                                />
                                <p className="text-xs text-gray-500 mt-1">Birden fazla görsel için URL&apos;leri virgülle ayırın</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">
                                    <Twitter className="w-4 h-4 inline mr-1" />
                                    Twitter/X URL (Opsiyonel)
                                </label>
                                <input
                                    type="url"
                                    value={twitterUrl}
                                    onChange={(e) => setTwitterUrl(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-brand-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                    placeholder="https://twitter.com/username/status/..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-brand-yellow border-2 border-brand-black font-bold uppercase text-sm hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Gönderiliyor...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Gönder
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Preview Card */}
                        <div>
                            <p className="text-sm font-bold uppercase mb-2 text-gray-500">Önizleme</p>
                            <div className="bg-white border-4 border-brand-black shadow-neo p-4">
                                {/* User Info */}
                                <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-200">
                                    {profile?.avatar_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={profile.avatar_url}
                                            alt={profile.display_name || "user"}
                                            className="w-10 h-10 border-2 border-brand-black object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-brand-yellow border-2 border-brand-black flex items-center justify-center font-bold">
                                            {profile?.username?.[0]?.toUpperCase() || "U"}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold">@{profile?.username || "kullanici"}</p>
                                        {profile?.twitter_url && (
                                            <a href={profile.twitter_url} className="text-xs text-blue-500 hover:underline">
                                                Twitter
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <h4 className="font-black text-lg uppercase mb-3 line-clamp-2">
                                    {title || "Prompt Başlığı"}
                                </h4>

                                {/* Image Preview - Multi Image Support */}
                                {imageUrl && (() => {
                                    const urls = imageUrl.split(',').map(u => u.trim()).filter(u => u.startsWith('http'));
                                    if (urls.length === 0) return null;
                                    return (
                                        <div className={`mb-3 grid gap-1 ${urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                            {urls.slice(0, 4).map((url, idx) => (
                                                <div key={idx} className="aspect-square bg-gray-200 border-2 border-brand-black overflow-hidden">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={url}
                                                        alt={`Preview ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = "none";
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}

                                {/* Prompt Preview */}
                                <div className="bg-gray-50 border-2 border-gray-200 p-3 text-sm text-gray-600 line-clamp-4">
                                    {prompt || "Prompt içeriği burada görünecek..."}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
