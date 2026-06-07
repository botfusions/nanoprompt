# AITASVIR STUDYO V2

<div align="center">

![AITASVIR](https://img.shields.io/badge/AITASVIR-STUDYO_V2-26C6FF?style=for-the-badge)

**AI Gorsel Olusturucu + Prompt Koleksiyonu**

[![Prompts](https://img.shields.io/badge/Prompts-3715+-brightgreen?style=flat-square)](/)
[![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat-square)](https://nextjs.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS_v4-38bdf8?style=flat-square)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square)](https://supabase.com)
[![Replicate](https://img.shields.io/badge/Replicate-AI_Image-6366f1?style=flat-square)](https://replicate.com)
[![PayTR](https://img.shields.io/badge/PayTR-Odeme-00b894?style=flat-square)](https://paytr.com)
[![GEO](https://img.shields.io/badge/GEO_Score-68/100-blue?style=flat-square)](/)

[Demo](https://www.aitasvir.com) | [Blog](https://www.aitasvir.com/blog) | [Raporla](https://github.com/botfusions/nanoprompt/issues) | [Iletisim](mailto:info@botfusions.com)

</div>

---

## Changelog

### [2026-05-24] GEO+SEO Optimizasyonu (Faz 1-3)

- **GEO Skoru:** 31 -> 68-75 (tahmini)
- **llms.txt:** AI crawler'lar icin site ozeti olusturuldu
- **JSON-LD Schema:** Organization, WebSite, ItemList, CreativeWork, Article schema'lari eklendi
- **4 Temel Sayfa:** Hakkimizda, Iletisim, Gizlilik (KVKK), Kullanim Kosullari
- **Blog:** 3 makale ile blog altyapisi (prompt teknikleri, model karsilastirmasi, portre rehberi)
- **Kategori Sayfalari:** `/kategori/[slug]` path-bazli 20 kategori sayfasi
- **Prompt Detay:** `/prompt/[id]` dinamik sayfa (CreativeWork schema + breadcrumb)
- **Sitemap:** 24 sayfadan 35 sayfaya genisletildi (8 statik + 4 blog + 20 kategori + 3 makale)
- **robots.txt:** GPTBot, PerplexityBot, ClaudeBot, Applebot-Extended, Google-Extended izinleri
- **Footer:** Sayfa linkleri + AITASVIR STUDYO guncellemesi

### [2026-05-24] Performans ve SEO Optimizasyonu

- **Performans:** C80 -> A99 notuna yukseltme
- **Canonical URL:** www.aitasvir.com olarak guncellendi
- **Cache:** CDN cache aktif (s-maxage=300, stale-while-revalidate)
- **Bundle:** framer-motion kaldirildi (~30KB), replicate SDK server-only (~200KB tasarruf)
- **DNS Prefetch:** fonts, twimg, replicate icin dns-prefetch + preconnect eklendi
- **Gzip:** Compression aktif
- **SSL/TLS:** Cloudflare Full SSL dogrulandi
- **Firebase Auth:** Authorized domains eklendi
- **Font:** Turkce karakter destegi (latin-ext subset)

### [2026-05-23] Rebranding -> AITASVIR

- **Domain:** aitasvir.com / www.aitasvir.com aktif
- **Vercel:** nanoprompt-j6gt projesine baglandi
- **Cloudflare:** Full SSL, DNS yonetimi

### [2026-05-13] AI Gorsel Olusturucu + Kredi Sistemi

- **AI Gorsel Olusturucu:** `/generate` sayfasi ile Replicate API (Flux Schnell, Flux Pro, SDXL) entegrasyonu
- **Prompt Iyilestirme:** Gemini AI ile prompt otomatik zenginlestirme
- **Kredi Sistemi:** Ucretsiz 3 baslangic kredisi, gunluk +2 dolum, model bazli kredi maliyeti
- **Odeme:** PayTR entegrasyonu ile TL bazli kredi paketleri
- **SEO Optimizasyonu:** JSON-LD structured data, OpenGraph, Twitter Cards, geo meta tag'lari

### [2026-05-05] Global Rebranding & Project Cleanup

- **Rebranding:** "BotsNANO" -> "IMAGE PROMPT" -> "AITASVIR" gecis
- **Bulk Import:** 43 yeni prompt (#03673 - #03715)

### [2026-04-29] Awesome GPT Integration

- **Awesome GPT:** ~126 prompt + 153 gorsel entegrasyonu

---

## Ozellikler

| Ozellik | Aciklama |
|---------|----------|
| **Gercek Zamanli Arama** | Baslik, icerik, yazar ve kart numarasi (#00123) bazli filtreleme |
| **AI Gorsel Olusturucu** | Flux Schnell/Pro, SDXL modelleri ile gorsel uretimi |
| **AI Prompt Iyilestirme** | Gemini AI ile otomatik prompt zenginlestirme |
| **Kredi Sistemi** | Ucretsiz baslangic + PayTR ile kredi satin alma |
| **Favoriler** | LocalStorage ile kalici favori listesi |
| **Kategori Filtreleme** | 20+ kategori (Fotografcilik, Portre, 3D, Logo, Moda vb.) |
| **Kategori Sayfalari** | `/kategori/[slug]` path-bazli SEO uyumlu kategori sayfalari |
| **Prompt Detay Sayfalari** | `/prompt/[id]` her prompt icin ayri sayfa + CreativeWork schema |
| **Blog** | AI prompt rehberleri, model karsilastirmalari, ipuclari |
| **Neo-Brutalist UI** | Keskin kenarlar, kalin golgeler, canli renkler |
| **Tek Tikla Kopyala** | Prompt'u aninda panoya kopyala |
| **Prompt'tan Gorsel** | Her prompt kartindan dogrudan gorsel olusturma |
| **SEO + GEO Optimize** | JSON-LD (6 schema), sitemap.xml (35 sayfa), robots.txt, llms.txt |
| **Google OAuth** | Firebase + Supabase auth entegrasyonu |

## Teknik Stack

| Teknoloji | Aciklama |
|-----------|----------|
| **Next.js 16+** | App Router, Server Components, Turbopack |
| **React 19** | UI framework |
| **Supabase** | PostgreSQL + Auth + RLS |
| **Firebase** | Google OAuth authentication |
| **Tailwind CSS v4** | Utility-first styling |
| **Replicate** | AI gorsel uretim (Flux, SDXL) |
| **Google Gemini** | Prompt iyilestirme + degerlendirme |
| **PayTR** | TL bazli odeme altyapisi |
| **TypeScript** | Tip guvenligi |

## Hizli Baslangic

```bash
# Bagimliliklari yukle
npm install

# Ortam degiskenlerini ayarla
cp .env.example .env.local
```

### Gerekli Ortam Degiskenleri

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# AI Gorsel Olusturucu
REPLICATE_API_TOKEN=r8_your-token
GEMINI_API_KEY=your-gemini-key

# PayTR Odeme
PAYTR_MERCHANT_ID=your-merchant-id
PAYTR_MERCHANT_KEY=your-merchant-key
PAYTR_MERCHANT_SALT=your-merchant-salt

# Genel
NEXT_PUBLIC_BASE_URL=https://www.aitasvir.com
```

```bash
# Gelistirme sunucusunu baslat
npm run dev

# Tarayicida ac
http://localhost:3000           # Ana sayfa (Prompt Galerisi)
http://localhost:3000/generate  # AI Gorsel Olusturucu
http://localhost:3000/blog      # Blog
http://localhost:3000/kategori/photography  # Kategori sayfasi
http://localhost:3000/hakkimizda # Hakkimizda
```

## Sayfa Yapisi

| Sayfa | URL | Aciklama |
|-------|-----|----------|
| Ana Sayfa | `/` | Prompt galerisi (3700+ prompt) |
| AI Olusturucu | `/generate` | Flux, SDXL ile gorsel uretimi |
| Blog | `/blog` | AI prompt rehberleri |
| Blog Makale | `/blog/[slug]` | Detayli makale (Article schema) |
| Kategori | `/kategori/[slug]` | 20 kategori sayfasi (SSG) |
| Prompt Detay | `/prompt/[id]` | Tekil prompt sayfasi (CreativeWork schema) |
| Hakkimizda | `/hakkimizda` | Ekip, misyon |
| Iletisim | `/iletisim` | E-posta, sosyal medya |
| Gizlilik | `/gizlilik` | KVKK uyumlu gizlilik politikasi |
| Kosullar | `/kosullar` | Kullanim kosullari |

## SEO + GEO

| Ozellik | Durum |
|---------|-------|
| **llms.txt** | AI crawler'lar icin site ozeti |
| **JSON-LD Schema** | Organization, WebSite, ItemList, CreativeWork, Article, WebApplication |
| **Sitemap** | 35 sayfa (8 statik + 4 blog + 20 kategori + 3 makale) |
| **robots.txt** | GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended |
| **OpenGraph** | Tum sayfalarda OG meta tag'lari |
| **Twitter Cards** | summary_large_image |
| **Canonical URL** | www.aitasvir.com |
| **Breadcrumb** | Detay ve kategori sayfalarinda |

## Deploy

`main` branch'ine push yapildiginda Vercel otomatik deploy yapar.

```
git push origin main -> GitHub -> Vercel (auto deploy)
```

### Vercel Yapilandirmasi

| Ayar | Deger |
|------|-------|
| Proje | nanoprompt-j6gt |
| Domain | aitasvir.com / www.aitasvir.com |
| DNS | Cloudflare (Full SSL) |
| Build Command | next build |

### Firebase Authorized Domains

Firebase Console -> Authentication -> Settings -> Authorized domains:
- `aitasvir.com`
- `www.aitasvir.com`

## Guvenlik

| Koruma | Durum |
|--------|-------|
| **HSTS** | Strict Transport Security (1 yil + preload) |
| **CSP** | Dinamik: Dev (esnek) / Prod (kati) |
| **SSRF Korumasi** | Image proxy URL whitelist |
| **Rate Limiting** | API istek limitleri |
| **IP Download Limit** | IP basina gunluk 20 prompt |
| **RLS** | Supabase Row Level Security |
| **Input Validation** | Tum kullanici girisleri dogrulanir |

## Kredi Sistemi

| Model | Kredi Maliyeti | Tahmini Sure |
|-------|---------------|--------------|
| Flux Schnell | 1 kredi | 5-10s |
| SDXL | 2 kredi | 10-20s |
| Flux Pro | 3 kredi | 15-30s |

## Proje Yapisi

```
app/
  page.tsx              # Ana sayfa (Server Component + ItemList JSON-LD)
  HomeClient.tsx        # Ana sayfa (Client Component)
  layout.tsx            # Root layout + Organization + WebSite JSON-LD
  sitemap.ts            # Dinamik sitemap (35 sayfa)
  robots.ts             # Robots.txt + AI crawler izinleri
  generate/page.tsx     # AI gorsel olusturucu (WebApplication schema)
  prompt/[id]/page.tsx  # Prompt detay (CreativeWork schema)
  kategori/[slug]/      # Kategori sayfalari (20 kategori, SSG)
  blog/                 # Blog listesi + makaleler (Article schema)
  hakkimizda/           # Hakkimizda sayfasi
  iletisim/             # Iletisim sayfasi
  gizlilik/             # Gizlilik politikasi (KVKK)
  kosullar/             # Kullanim kosullari
  api/                  # API route'lari
components/
  Header.tsx            # Site header
  Footer.tsx            # Site footer + FAQ + sayfa linkleri
  PromptCard.tsx        # Prompt karti + detay linki
  CategoryFilter.tsx    # Kategori filtreleme
  generate/             # Gorsel olusturma componentleri
src/
  data/prompts.ts       # Supabase prompt fetch + filtreleme
  lib/firebase.ts       # Firebase Auth
  lib/supabase.ts       # Supabase client
  lib/models.ts         # AI model tanimlari (client-safe)
  lib/replicate.ts      # Replicate AI (server-only)
  lib/credits.ts        # Kredi sistemi
  lib/payment.ts        # PayTR odeme
contexts/
  AuthContext.tsx        # Firebase auth context
middleware.ts           # Rate limiting + korumali rotalar
next.config.ts          # Next.js config + cache + CSP + guvenlik
public/
  llms.txt              # AI crawler site ozeti
```

## Performans

| Metrik | Deger |
|--------|-------|
| Performans notu | A99 |
| CDN Cache | Aktif (s-maxage=300) |
| Gzip Compression | Aktif |
| DNS Prefetch | Aktif |
| ISR | Ana sayfa dynamic + CDN cache |
| Bundle | framer-motion ve replicate SDK client-side'dan cikarildi |

## Iletisim

**E-posta:** info@botfusions.com

## Lisans

MIT License - Bu proje egitim amaclidir.

---

<div align="center">

**[Basa Don](#aitasvir-studyo-v2)**

Made with ❤️ by [BotFusions](https://botfusions.com)

</div>
