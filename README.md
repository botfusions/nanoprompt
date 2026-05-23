# IMAGE PROMPT STÜDYO V2

<div align="center">

![IMAGE PROMPT](https://img.shields.io/badge/IMAGE_PROMPT-ST%C3%9CDYO_V2-26C6FF?style=for-the-badge)

**AI Görsel Oluşturucu + Prompt Koleksiyonu**

[![Prompts](https://img.shields.io/badge/Prompts-3715+-brightgreen?style=flat-square)](/)
[![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat-square)](https://nextjs.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS_v4-38bdf8?style=flat-square)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square)](https://supabase.com)
[![Replicate](https://img.shields.io/badge/Replicate-AI_Image-6366f1?style=flat-square)](https://replicate.com)
[![PayTR](https://img.shields.io/badge/PayTR-Odeme-00b894?style=flat-square)](https://paytr.com)

[Demo](https://nanoprompt.botfusions.com) • [Raporla](https://github.com/botfusions/nanopromt/issues) • [İletişim](mailto:info@botfusions.com)

</div>

---

## 📝 Changelog

### [2026-05-13] AI Görsel Oluşturucu + Kredi Sistemi 🎨

- **AI Görsel Oluşturucu:** `/generate` sayfası ile Replicate API (Flux Schnell, Flux Pro, SDXL) entegrasyonu
- **Prompt İyileştirme:** Gemini AI ile prompt otomatik zenginleştirme
- **Kredi Sistemi:** Ücretsiz 3 başlangıç kredisi, günlük +2 dolum, model bazlı kredi maliyeti
- **Ödeme:** PayTR entegrasyonu ile TL bazlı kredi paketleri (Başlangıç/Pro/Sınırsız)
- **PromptCard Entegrasyonu:** Her prompt kartında "Oluştur" butonu ile doğrudan görsel üretimi
- **SEO Optimizasyonu:** JSON-LD structured data, OpenGraph, Twitter Cards, geo meta tag'ları
- **Teknik Dosyalar:** sitemap.xml, robots.txt, hreflang etiketleri
- **CSP Güncelleme:** Development/production ortamlarına göre dinamik CSP politikası
- **Supabase Migration:** 3 yeni tablo (user_credits, credit_transactions, generated_images)

### [2026-05-05] Global Rebranding & Project Cleanup

- **Rebranding:** "BotsNANO" → "IMAGE PROMPT" global geçiş tamamlandı
- **Bulk Import:** 43 yeni prompt (#03673 - #03715)
- **Data Quality Audit:** Import sonrası tam veritabanı doğrulaması

### [2026-04-29] Security Audit & Awesome GPT Integration

- **Awesome GPT:** ~126 prompt + 153 görsel entegrasyonu
- **Security Audit:** 33 zafiyet tespit edildi, remediation planlandı
- **Build Fix:** Legacy `App.tsx` kaldırıldı

### [2026-03-18] Security & Data Quality Update

- **IP Limit:** IP başına günlük 20 prompt kopyalama sınırı
- **Twitter Migrasyonu:** 127 yeni prompt aktarıldı
- **Telegram Uyarıları:** Limit aşım bildirimleri

---

## ✨ Özellikler

| Özellik | Açıklama |
|---------|----------|
| 🔍 **Gerçek Zamanlı Arama** | Başlık, içerik, yazar ve kart numarası (#00123) bazlı filtreleme |
| 🎨 **AI Görsel Oluşturucu** | Flux Schnell/Pro, SDXL modelleri ile görsel üretimi |
| 🪄 **AI Prompt İyileştirme** | Gemini AI ile otomatik prompt zenginleştirme |
| 💳 **Kredi Sistemi** | Ücretsiz başlangıç + PayTR ile kredi satın alma |
| ❤️ **Favoriler** | LocalStorage ile kalıcı favori listesi |
| 🏷️ **Kategori Filtreleme** | 18+ kategori (Fotoğrafçılık, Portre, 3D, Logo, Moda vb.) |
| 🎨 **Neo-Brutalist UI** | Keskin kenarlar, kalın gölgeler, canlı renkler |
| 📋 **Tek Tıkla Kopyala** | Prompt'u anında panoya kopyala |
| ⚡ **Prompt'tan Görsel** | Her prompt kartından doğrudan görsel oluşturma |
| 📊 **SEO Optimize** | JSON-LD, OpenGraph, sitemap.xml, robots.txt |
| 🔐 **Google OAuth** | Firebase + Supabase auth entegrasyonu |

## 🚀 Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env
```

### Gerekli Ortam Değişkenleri

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# AI Görsel Oluşturucu
REPLICATE_API_TOKEN=r8_your-token
GEMINI_API_KEY=your-gemini-key

# PayTR Ödeme
PAYTR_MERCHANT_ID=your-merchant-id
PAYTR_MERCHANT_KEY=your-merchant-key
PAYTR_MERCHANT_SALT=your-merchant-salt

# Genel
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

```bash
# Geliştirme sunucusunu başlat
npm run dev

# Tarayıcıda aç
http://localhost:3000         # Ana sayfa (Prompt Galerisi)
http://localhost:3000/generate  # AI Görsel Oluşturucu
```

### Veritabanı Kurulumu

Supabase SQL Editor'de `src/data/generate_schema.sql` dosyasını çalıştırın:

```sql
-- 3 yeni tablo oluşturur:
-- user_credits (kredi bakiyeleri)
-- credit_transactions (kredi hareketleri)
-- generated_images (üretilen görseller)
```

## 🛠️ Teknik Stack

| Teknoloji | Açıklama |
|-----------|----------|
| **Next.js 16+** | App Router, Server Components, Turbopack |
| **React 19** | UI framework |
| **Supabase** | PostgreSQL + Auth + RLS |
| **Firebase** | Google OAuth authentication |
| **Tailwind CSS v4** | Utility-first styling |
| **Replicate** | AI görsel üretim (Flux, SDXL) |
| **Google Gemini** | Prompt iyileştirme + değerlendirme |
| **PayTR** | TL bazlı ödeme altyapısı |
| **Framer Motion** | Animasyonlar |
| **TypeScript** | Tip güvenliği |

## 🛡️ Güvenlik

| Koruma | Durum |
|--------|-------|
| **HSTS** | Strict Transport Security (1 yıl + preload) |
| **CSP** | Dinamik: Dev (esnek) / Prod (katı) |
| **SSRF Koruması** | Image proxy URL whitelist |
| **Rate Limiting** | API istek limitleri |
| **IP Download Limit** | IP başına günlük 20 prompt |
| **RLS** | Supabase Row Level Security |
| **Input Validation** | Tüm kullanıcı girişleri doğrulanır |

## 💳 Kredi Sistemi

| Model | Kredi Maliyeti | Tahmini Süre |
|-------|---------------|--------------|
| Flux Schnell | 1 kredi | 5-10s |
| SDXL | 2 kredi | 10-20s |
| Flux Pro | 3 kredi | 15-30s |

| Paket | Kredi | Fiyat |
|-------|-------|-------|
| Başlangıç | 10 | ₺99,90 |
| Pro | 50 | ₺349,90 |
| Sınırsız | 200 | ₺999,90 |

## 📁 Proje Yapısı

```
├── app/
│   ├── page.tsx                     # Ana sayfa (Server Component)
│   ├── HomeClient.tsx               # Ana sayfa (Client Component)
│   ├── generate/
│   │   ├── page.tsx                 # AI Görsel Oluşturucu (SEO)
│   │   └── GenerateClient.tsx       # Generate (Client Component)
│   ├── api/
│   │   ├── generate/
│   │   │   ├── route.ts             # Görsel oluşturma API
│   │   │   └── prompt-enhance/
│   │   │       └── route.ts         # Prompt iyileştirme API
│   │   ├── credits/
│   │   │   ├── route.ts             # Kredi bakiye API
│   │   │   └── purchase/
│   │   │       └── route.ts         # PayTR ödeme API
│   │   ├── paytr/
│   │   │   └── callback/
│   │   │       └── route.ts         # PayTR webhook
│   │   ├── image-proxy/             # Güvenli görsel proxy
│   │   └── admin/
│   │       ├── evaluate/            # Gemini AI değerlendirme
│   │       ├── backup/              # Veritabanı yedekleme
│   │       └── export-csv/          # CSV export
│   ├── sitemap.ts                   # SEO sitemap
│   └── robots.ts                    # SEO robots.txt
├── components/
│   ├── Header.tsx                   # Navbar + "Oluştur" butonu
│   ├── PromptCard.tsx               # Prompt kartı + "Oluştur" butonu
│   ├── generate/
│   │   ├── GeneratePage.tsx         # Ana oluşturucu layout
│   │   ├── PromptInput.tsx          # Prompt girişi + örnekler
│   │   ├── ModelSelector.tsx        # AI model seçimi
│   │   ├── SizeSelector.tsx         # Boyut seçimi
│   │   ├── ImagePreview.tsx         # Sonuç önizleme
│   │   ├── CreditBalance.tsx        # Kredi göstergesi
│   │   └── CreditPackages.tsx       # Kredi paketleri
│   └── ...
├── src/
│   ├── data/
│   │   ├── prompts.ts               # Prompt veri katmanı
│   │   ├── generate_schema.sql      # Kredi/Generate migration
│   │   └── schema.sql               # Ana DB schema
│   └── lib/
│       ├── supabase.ts              # Supabase client
│       ├── firebase.ts              # Firebase auth
│       ├── replicate.ts             # Replicate AI wrapper
│       ├── payment.ts               # PayTR ödeme entegrasyonu
│       └── credits.ts               # Kredi sistemi
├── contexts/
│   └── AuthContext.tsx               # Auth provider
├── middleware.ts                     # Rate limiting + proxy
└── next.config.ts                    # Next.js config + CSP
```

## 📊 Mevcut Durum

- **3715+ prompt** koleksiyonu
- **AI Görsel Oluşturucu** (Flux Schnell, Flux Pro, SDXL)
- **Kredi sistemi** (PayTR ödeme entegrasyonu)
- **Neo-Brutalist UI** tasarımı
- **SEO optimize** (JSON-LD, sitemap, robots, geo)
- **Google OAuth** ile kullanıcı girişi
- **IP bazlı** güvenlik korumaları

## 📧 İletişim

**E-posta:** info@botfusions.com

## 📝 Lisans

MIT License - Bu proje eğitim amaçlıdır.

---

<div align="center">

**[⬆ Başa Dön](#image-prompt-stüdyo-v2)**

Made with ❤️ by [BotFusions](https://botfusions.com)

</div>
