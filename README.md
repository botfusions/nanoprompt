# BotsNANO Prompt Galerisi

<div align="center">

![BotsNANO](https://img.shields.io/badge/BotsNANO-Prompt%20Ar%C5%9Fivi-26C6FF?style=for-the-badge)

**Gemini Nano Banana Pro için en iyi prompt koleksiyonu**

[![Prompts](https://img.shields.io/badge/Prompts-2957+-brightgreen?style=flat-square)](/)
[![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat-square)](https://nextjs.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=flat-square)](https://supabase.com)

[Demo](https://nanoprompt.botfusions.com) • [Raporla](https://github.com/botfusions/nanopromt/issues) • [İletişim](mailto:info@botfusions.com)

</div>

---

## ✨ Özellikler

| Özellik | Açıklama |
|---------|----------|
| 🔍 **Gerçek Zamanlı Arama** | Başlık, içerik, yazar ve kart numarası (#00123) bazlı filtreleme |
| ❤️ **Favoriler** | LocalStorage ile kalıcı favori listesi |
| 🏷️ **Kategori Filtreleme** | Fotoğrafçılık, Portre, 3D, Logo, Moda vb. 18+ kategori |
| 🎨 **Neo-Brutalist UI** | Keskin kenarlar, kalın gölgeler, canlı renkler |
| 📋 **Tek Tıkla Kopyala** | Prompt'u anında panoya kopyala |
| ⭐ **Öne Çıkan Etiketleri** | Featured prompt'lar için görsel işaretleme |
| 🔐 **Supabase Auth** | Google OAuth ile kullanıcı girişi |
| 📤 **Prompt Gönderimi** | Kullanıcılar kendi promptlarını ekleyebilir |
| 🖼️ **Akıllı Sıralama** | En yeni en üstte + resim kalitesine göre |

## 🚀 Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ekle

# Geliştirme sunucusunu başlat
npm run dev

# Tarayıcıda aç
http://localhost:3000
```

## 🛠️ Teknik Stack

| Teknoloji | Açıklama |
|-----------|----------|
| **Next.js 15+** | App Router, Server Components |
| **Supabase** | PostgreSQL + Auth + Realtime |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | İkon kütüphanesi |
| **TypeScript** | Tip güvenliği |

## 🛡️ Güvenlik

| Koruma | Durum |
|--------|-------|
| ✅ **Şifre Güvenliği** | 8+ karakter, büyük/küçük harf, rakam, özel karakter |
| ✅ **Brute Force Koruması** | 5 başarısız denemede 60sn kilitlenme |
| ✅ **HSTS** | Strict Transport Security (1 yıl + preload) |
| ✅ **CSP** | Content Security Policy (unsafe-eval yok) |
| ✅ **SSRF Koruması** | Image proxy URL whitelist |
| ✅ **Open Redirect** | Redirect path validation |
| ✅ **Security Headers** | X-Frame-Options, X-Content-Type-Options |
| ✅ **Rate Limiting** | API istekleri için limit |
| ✅ **Route Protection** | Middleware ile auth kontrolü |
| ✅ **API Proxy** | Webhook URL'leri server-side |

## 📊 Mevcut Durum

- ✅ **2801+ prompt** (Filtrelenmiş ve gösterime hazır)
- ✅ **700+ aktif görselli prompt**
- ✅ Neo-Brutalist UI replikasyonu
- ✅ Arama, filtreleme ve favoriler tam fonksiyonel
- ✅ Google OAuth entegrasyonu
- ✅ Akıllı sıralama (En yeni + Resim kalitesi)
- ✅ Kart numaraları ile arama (#00123)

## 📁 Proje Yapısı

```
├── app/                    # Next.js App Router
│   ├── api/chat/          # Chat API proxy
│   ├── api/image-proxy/   # Güvenli görsel proxy
│   ├── auth/callback/     # OAuth callback
│   └── login/             # Giriş sayfası
├── components/            # UI Bileşenleri
│   ├── Header.tsx         # Hero + Sticky Note
│   ├── Footer.tsx         # FAQ + CTA + Email
│   ├── PromptCard.tsx     # Kopyalama özellikli kart
│   └── AddPromptSection.tsx # Prompt ekleme formu
├── middleware.ts          # Rate limiting + Auth
├── src/data/              # Prompt verileri
└── scripts/               # Yardımcı scriptler
```

## 📋 Son Güncelleme (29 Aralık 2025)

### 🔢 Kalıcı Kayıt Numaraları
- **display_number Sütunu**: Supabase'de kalıcı kayıt numarası sistemi
- **Otomatik Numara Atama**: Yeni promptlar otomatik sıradaki numarayı alıyor
- **2957 Prompt**: Tüm mevcut promptlara sıralı numara atandı (#00001 → #02957)

### 🔧 Veri Kalitesi İyileştirmeleri
- **Duplicate Filtreleme**: Aynı görsellere sahip duplicate kartlar otomatik filtreleniyor
- **Prompt Override Sistemi**: Veritabanında eksik prompt içerikleri için local override desteği
- **Görsel Kontrolü**: Bozuk/görselsiz kartlar otomatik tespit ve sıralama
- **Kart Numaraları**: Tüm kartlarda #XXXXX formatında kalıcı numara görünümü

### 🛡️ Güvenlik İyileştirmeleri (28 Aralık)
- **Password Strength**: 8+ karakter, büyük/küçük harf, rakam, özel karakter zorunluluğu
- **Brute Force Koruması**: 5 başarısız denemede 60sn lockout + timer UI
- **HSTS Header**: Strict Transport Security eklendi
- **CSP İyileştirme**: unsafe-eval kaldırıldı
- **Chat API Proxy**: Webhook URL'si server-side'a taşındı
- **Username Enumeration**: Genel hata mesajları ile koruma

### 🎨 Görsel İyileştirmeler (26 Aralık)
- **Multi-Image Grid**: 1-4 görsel desteği (Grid düzeni)
- **Image Polish**: Artırılmış kontrast ve doygunluk + Hover efektleri
- **Auto-Sync Sistem**: Yerel görsellerin otomatik DB eşitlenmesi

### 🧹 Temizlik
- ~9MB gereksiz dosya silindi
- 45+ debug script kaldırıldı
- Kod optimizasyonu yapıldı

## 📧 İletişim

**E-posta:** info@botfusions.com

## 📝 Lisans

MIT License - Bu proje eğitim amaçlıdır.

---

<div align="center">

**[⬆ Başa Dön](#botsnano-prompt-galerisi)**

Made with ❤️ by [BotFusions](https://botfusions.com)

</div>

