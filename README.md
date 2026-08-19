# AITASVIR STUDYO V2

<div align="center">

![AITASVIR](https://img.shields.io/badge/AITASVIR-STUDYO_V2-26C6FF?style=for-the-badge)

**AI Gorsel Olusturucu + Prompt Koleksiyonu**

[![Prompts](https://img.shields.io/badge/Prompts-5017-brightgreen?style=flat-square)](/)
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

### [2026-08-19] Vercel ISR Write & Önbellek Optimizasyonu

Vercel ISR (Incremental Static Regeneration) yazım maliyetlerini ve bot taramalarının yol açtığı sunucu yükünü minimize etmek için önbellek mimarisi optimize edildi:

- **Ana Sayfa (`app/page.tsx`):** `revalidate` süresi 60 saniyeden **1 saate (`3600`)** çıkarıldı. Dakikalık ISR yeniden üretim tetiklenmesi önlendi.
- **Prompt Detay Sayfaları (`app/prompt/[id]/page.tsx`):** `revalidate` süresi 1 saatten **24 saate (`86400`)** çıkarıldı. `React.cache()` ile `getPrompt(id)` tekilleştirilerek `generateMetadata` ve sayfa gövdesinin aynı istekte çift veri arama yapması engellendi.
- **Kategori Sayfaları (`app/kategori/[slug]/page.tsx`):** Açık bir **24 saat (`revalidate = 86400`)** ISR kuralı eklendi.
- **API Prompts Rotası (`app/api/prompts/route.ts`):** `revalidate = 3600` ve CDN `Cache-Control` başlığı `s-maxage=3600, stale-while-revalidate=86400` olarak güncellendi.
- **Sitemap (`app/sitemap.ts`):** Arama motoru botlarının sitemap'i her kontrolde "değişmiş" algılamasına ve gereksiz re-crawl döngülerine girmesine yol açan anlık `new Date()` dinamik tarihi kaldırılarak sabit stabil tarihe (`2026-05-24`) bağlandı.

### [2026-08-01] Bot Trafigi Maliyet Duzeltmesi + Awesome GPT Kaldirildi

Vercel kapasitesinin neden dolduğu arastirildi. Sorun ziyaretci sayisi degil,
her bot istegin cok pahali olmasiydi: cache'lenmemis sayfalar + HTML'e gomulmus
tum veri seti. Uc ayri kok sebep bulundu ve duzeltildi.

**1. Ana sayfa RSC payload'i (2.54 MB → 79 KB gzip, %96.9)**

`getAllPrompts()` sonucunun tamami `HomeClient`'a prop olarak geciyordu; Next.js
bunu RSC payload'i olarak HTML'e gomuyor, yani **5017 promptun tam metni her
istekte** teller uzerinden gidiyordu. Ilk 32 kart sunucudan, kalani
`/api/prompts` uzerinden lazy geliyor artik.

| | Oncesi | Sonrasi |
|---|---|---|
| Ana sayfa (gzip) | 2.540.575 B | **79.838 B** |
| 1.000 ziyaretin maliyeti | 2,54 GB | **0,078 GB** |
| 100 GB kac ziyarete yeter | ~39.000 | **~1.250.000** |

**2. `/prompt/[id]` hic cache'lenmiyordu**

Runtime loglarinda bir bot, UUID sirasiyla ve **tam 5,4 saniye araliklarla**
prompt sayfalarini geziyordu — %100 `cache: MISS`, %100 `source: serverless`.
Rota `private, no-cache, no-store` donuyordu; her tekrar ziyaret bile sifirdan
fonksiyon calistirip **tum tabloyu iki kez** cekiyordu (`generateMetadata` +
sayfa govdesi = istek basina 10.594 satir). 5017 sayfalik bir tam tarama bu
hizda ~174 saat kesintisiz yuk demek.

- `src/data/prompts.ts` — `getAllPrompts()` icine 60 sn'lik memo (Promise
  cache'leniyor ki es zamanli cagrilar tek sorguya dussun; hatada memo silinir)
- `app/prompt/[id]/page.tsx` — `revalidate = 3600` + `dynamicParams` +
  bos `generateStaticParams()`. **Not:** `revalidate` tek basina yetmiyor,
  dinamik segment `generateStaticParams` olmadan `ƒ` (on-demand) kaliyor
- `app/prompt/[id]/CopyButton.tsx` — Server Component'te `onClick` vardi,
  build yesil gecip **production'da her istekte 500** donduruyordu

Sonuc: `private, no-store` → `public, s-maxage=300, stale-while-revalidate=600`.
Deploy sonrasi 90 sn'lik log ornegi: `/prompt/` isteklerinin 5'i HIT/static,
2'si MISS (ilk ziyaret ISR cache dolumu).

**3. Kategori sayfalari + robots.txt**

Kategori sayfalari ana sayfayla ayni hataya sahipti (20 sayfa, hepsini bot
geziyor). API'ye `slug` parametresi eklendi.

| Kategori | Oncesi | Sonrasi |
|---|---|---|
| photography | 328 KB | **20 KB** |
| nature | 218 KB | **37 KB** |

`robots.txt` botlari ikiye ayirdi: **egitim** botlari (GPTBot,
Google-Extended, Applebot-Extended, CCBot, Bytespider) kapatildi — geriye
ziyaretci gondermiyorlar ve Google/Bing/ChatGPT **arama** gorunurlugunu
etkilemiyorlar, onlarin ayri user-agent'lari var. **Kaynak gosteren** botlar
(OAI-SearchBot, ClaudeBot, PerplexityBot) acik kaldi, `Crawl-delay: 10`.

**4. Awesome GPT kategorisi kaldirildi (126 prompt)**

Uc ayri sekilde kirikti: gorsellerinin hepsi 404 (`public/assets/gpt_image_2/`
klasoru bos, 253 jpg silinmis), ana sayfadan erisilemiyordu
(`"awesome gpt" === "awesome-gpt"` hicbir zaman eslesmiyor), ve sadece
`/kategori/awesome-gpt` uzerinden gorunuyordu — orasi da sitenin en agir
sayfasiydi (58 KB gzip). Toplam prompt 5111 → 5017, kategori 20 → 19.
Dosya git gecmisinde duruyor.

**Yeni dosyalar:** `app/api/prompts/route.ts` (sunucu tarafli sayfalama),
`src/data/filter.ts` (filtre mantigi sunucu+client ortak),
`scripts/test_prompts_api.mjs` (12 regresyon testi — `TEST_BASE_URL` ile
prodüksiyona karsi da calisir).

**Veritabani temizligi:** #4951 (promptu yok), #4636 ve #4757 (prompt degil,
tweet metni) silindi — her biri once JSON'a yedeklendi. `banana_prompts`
5300 → 5297.

### [2026-06-12] Performans Duzeltmesi — Ana Sayfa TTFB 12sn → 0.5sn

- **ISR Gecisi:** `force-dynamic` kaldirildi, `revalidate = 60` (ISR) eklendi — her request'te Supabase sorgusu yerine 60 sn'lik edge cache
- **Supabase Sorgu Optimizasyonu:** `select(*)` yerine sadece gerekli sutunlar seciliyor (id, title, prompt, categories, author, created_at, images, featured, display_number, source, user_id, approved)
- **Pagination:** 250+ kart tek seferde degil, 32'lik sayfalar halinde yukleniyor. "Daha Fazla Goster" butonu ile artirmali yukleme
- **Sonuc:** TTFB 8.8-12.5 sn → 0.5-0.8 sn (~15x iyilestirme), sayfa boyutu 47 MB → 40 KB (~1200x kuculme)

| Metrik | Oncesi | Sonrasi |
|--------|--------|---------|
| TTFB | 8.8 - 12.5 sn | 0.5 - 0.8 sn |
| Toplam Yuklenme | 10 - 14.5 sn | 0.55 - 0.83 sn |
| Sayfa Boyutu | 47 MB | 40 KB |

**Degisen dosyalar:**
- `app/page.tsx` — `force-dynamic` → `revalidate = 60`
- `src/data/prompts.ts` — `select(*)` → spesifik sutunlar
- `components/PromptGrid.tsx` — Pagination (32 kart/sayfa, "Daha Fazla Goster" butonu)

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
- > **Not:** Bu entegrasyon 2026-08-01'de tamamen kaldirildi (gorseller 404,
>   ana sayfadan erisilemiyor). Detay icin en ustteki changelog kaydina bak.

---

## Ozellikler

| Ozellik | Aciklama |
|---------|----------|
| **Gercek Zamanli Arama** | Baslik, icerik, yazar ve kart numarasi (#00123) bazli filtreleme |
| **AI Gorsel Olusturucu** | Flux Schnell/Pro, SDXL modelleri ile gorsel uretimi |
| **AI Prompt Iyilestirme** | Gemini AI ile otomatik prompt zenginlestirme |
| **Kredi Sistemi** | Ucretsiz baslangic + PayTR ile kredi satin alma |
| **Favoriler** | LocalStorage ile kalici favori listesi |
| **Kategori Filtreleme** | 19 kategori (Fotografcilik, Portre, 3D, Logo, Moda vb.) |
| **Kategori Sayfalari** | `/kategori/[slug]` 19 SSG sayfa, ilk 32 kart sunucudan + artirmali yukleme |
| **Prompt Detay Sayfalari** | `/prompt/[id]` her prompt icin ayri sayfa + CreativeWork schema |
| **Blog** | AI prompt rehberleri, model karsilastirmalari, ipuclari |
| **Neo-Brutalist UI** | Keskin kenarlar, kalin golgeler, canli renkler |
| **Tek Tikla Kopyala** | Prompt'u aninda panoya kopyala |
| **Prompt'tan Gorsel** | Her prompt kartindan dogrudan gorsel olusturma |
| **SEO + GEO Optimize** | JSON-LD (6 schema), sitemap.xml (31 sayfa), robots.txt, llms.txt |
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
| Ana Sayfa | `/` | Prompt galerisi (ISR 60sn, sunucu tarafli sayfalama) |
| AI Olusturucu | `/generate` | Flux, SDXL ile gorsel uretimi |
| Blog | `/blog` | AI prompt rehberleri |
| Blog Makale | `/blog/[slug]` | Detayli makale (Article schema) |
| Kategori | `/kategori/[slug]` | 19 kategori sayfasi (SSG) |
| Prompt Detay | `/prompt/[id]` | Tekil prompt sayfasi (ISR 1sa, CreativeWork schema) |
| Prompt API | `/api/prompts` | Sayfalama + filtre (`category`, `q`, `slug`, `offset`, `limit`) |
| Hakkimizda | `/hakkimizda` | Ekip, misyon |
| Iletisim | `/iletisim` | E-posta, sosyal medya |
| Gizlilik | `/gizlilik` | KVKK uyumlu gizlilik politikasi |
| Kosullar | `/kosullar` | Kullanim kosullari |

## SEO + GEO

| Ozellik | Durum |
|---------|-------|
| **llms.txt** | AI crawler'lar icin site ozeti |
| **JSON-LD Schema** | Organization, WebSite, ItemList, CreativeWork, Article, WebApplication |
| **Sitemap** | 31 sayfa (8 statik + 4 blog + 19 kategori) |
| **robots.txt** | Egitim botlari kapali (GPTBot, Google-Extended, Applebot-Extended, CCBot, Bytespider) / kaynak gosterenler acik + Crawl-delay 10 (OAI-SearchBot, ClaudeBot, PerplexityBot) |
| **OpenGraph** | Tum sayfalarda OG meta tag'lari |
| **Twitter Cards** | summary_large_image |
| **Canonical URL** | www.aitasvir.com |
| **Breadcrumb** | Detay ve kategori sayfalarinda |

## Testler

Sunucu tarafli sayfalama ve cache ayarlari icin regresyon kontrolu. En riskli
taraflari sessizce geri donebilmeleri — bu testler onu yakalar.

```bash
npm start                          # ayri terminalde
node scripts/test_prompts_api.mjs  # yerel

# prodüksiyona karsi
TEST_BASE_URL=https://www.aitasvir.com node scripts/test_prompts_api.mjs
```

12 test: sunucu ilk sayfasi ile API ilk sayfasinin ayni olmasi (yoksa "daha
fazla goster" kart tekrar eder), sayfalarin kesismemesi, kart numarasi ile
arama, yilbasi aralik filtresi, limit tavani, `/prompt/[id]` cache
basliklari, 404, kategori payload boyutu, `slug` filtresi, robots kurallari.

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
  sitemap.ts            # Dinamik sitemap (31 sayfa)
  robots.ts             # Robots.txt — egitim botlari kapali, kaynak gosterenler acik
  generate/page.tsx     # AI gorsel olusturucu (WebApplication schema)
  prompt/[id]/page.tsx  # Prompt detay (ISR 1sa + CreativeWork schema)
  prompt/[id]/CopyButton.tsx  # Kopyala butonu (Client Component)
  kategori/[slug]/      # Kategori sayfalari (19 kategori, SSG)
  blog/                 # Blog listesi + makaleler (Article schema)
  hakkimizda/           # Hakkimizda sayfasi
  iletisim/             # Iletisim sayfasi
  gizlilik/             # Gizlilik politikasi (KVKK)
  kosullar/             # Kullanim kosullari
  api/prompts/route.ts  # Sunucu tarafli sayfalama + filtreleme
  api/                  # Diger API route'lari
components/
  Header.tsx            # Site header
  Footer.tsx            # Site footer + FAQ + sayfa linkleri
  PromptCard.tsx        # Prompt karti + detay linki
  PromptGrid.tsx        # Kart listesi + "Daha Fazla Goster"
  CategoryFilter.tsx    # Kategori filtreleme
  generate/             # Gorsel olusturma componentleri
src/
  data/prompts.ts       # Supabase prompt fetch + 60sn memo
  data/filter.ts        # Kategori/arama filtresi (sunucu + client ortak)
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
scripts/
  test_prompts_api.mjs  # 12 regresyon testi (TEST_BASE_URL ile prod'a karsi da calisir)
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
| ISR | Ana sayfa 60sn, `/prompt/[id]` 1sa revalidate + edge cache |
| Ana sayfa boyutu | 79 KB gzip (oncesi 2,54 MB) |
| Sayfalama | Sunucu tarafli, 32 kart/sayfa (`/api/prompts`) |
| Supabase Sorgu | Sadece gerekli sutunlar, 60sn memo — tum cagiranlar paylasir |
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
