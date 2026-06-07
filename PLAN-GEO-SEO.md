# AITASVIR GEO+SEO Iyilestirme Plani

Mevcut GEO Skoru: 31/100
Hedef: 55-65/100
Durum: TAMAMLANDI (Faz 1 + Faz 2 + Faz 3)

---

## Faz 1: P1 — Hizli Kazanimlar ✅ TAMAMLANDI

### 1.1 llms.txt Olustur (+15 puan) ✅
- [x] `public/llms.txt` — Site ozeti, kategori listesi, onemli sayfa linkleri

### 1.2 JSON-LD Schema Ekle (+12 puan) ✅
- [x] `app/layout.tsx` — Organization schema (BotFusions)
- [x] `app/layout.tsx` — WebSite schema + SearchAction
- [x] `app/page.tsx` — ItemList schema (18 kategori)
- [x] `app/generate/page.tsx` — WebApplication schema (zaten mevcut)

### 1.3 Temel Sayfalari Olustur (+10 puan) ✅
- [x] `app/hakkimizda/page.tsx`
- [x] `app/iletisim/page.tsx`
- [x] `app/gizlilik/page.tsx` (KVKK uyumlu)
- [x] `app/kosullar/page.tsx`
- [x] Sitemap'e eklendi
- [x] Footer'a linkleri eklendi

---

## Faz 2: P2 — Orta Vadeli ✅ TAMAMLANDI

### 2.1 Sitemap lastmod Duzeltme (+2 puan) ✅
- [x] Her sayfa icin farkli lastmod ve changefreq

### 2.2 Footer Iyilestirme ✅
- [x] Hakkimizda, Iletisim, Gizlilik, Kosullar linkleri
- [x] AITASVIR STUDYO guncellemesi

### 2.3 robots.txt AI Crawler Direktifleri ✅
- [x] GPTBot, Google-Extended, PerplexityBot, ClaudeBot, Applebot-Extended

---

## Faz 3: P3 — Uzun Vadeli ✅ TAMAMLANDI

### 3.1 Prompt Detay Sayfalari (+8 puan) ✅
- [x] `/prompt/[id]` dinamik routing
- [x] CreativeWork JSON-LD schema
- [x] PromptCard'tan detay linki (kart numarasi → detay sayfasi)

### 3.2 URL Yapisini Iyilestir (+3 puan) ✅
- [x] `/kategori/[slug]` path-bazli kategori sayfalari (20 kategori)
- [x] Sitemap'e kategori path'leri eklendi
- [x] generateStaticParams ile SSG

### 3.3 Blog Altyapisi (+5 puan) ✅
- [x] `/blog` sayfasi
- [x] 3 makale: prompt teknikleri, model karsilastirmasi, portre rehberi
- [x] Article JSON-LD schema
- [x] Sitemap'e blog sayfalari eklendi

---

## Skor Tahminleri

| Faz | Yapilanlar | Tahmini GEO Skoru |
|-----|-----------|-------------------|
| Mevcut | - | 31 |
| Faz 1 sonrasi | llms.txt + schema + sayfalar | 55-60 |
| Faz 2 sonrasi | sitemap + footer + robots | 60-63 |
| Faz 3 sonrasi | detay sayfalari + blog + kategori | 68-75 |

---

## Olusturulan/Degistirilen Dosyalar

### Yeni Dosyalar
- `public/llms.txt`
- `app/hakkimizda/page.tsx`
- `app/iletisim/page.tsx`
- `app/gizlilik/page.tsx`
- `app/kosullar/page.tsx`
- `app/prompt/[id]/page.tsx`
- `app/kategori/[slug]/page.tsx`
- `app/kategori/[slug]/CategoryPageClient.tsx`
- `app/blog/page.tsx`
- `app/blog/BlogPost.tsx`
- `app/blog/[slug]/page.tsx`

### Degistirilen Dosyalar
- `app/layout.tsx` — Organization + WebSite JSON-LD
- `app/page.tsx` — ItemList JSON-LD
- `app/sitemap.ts` — 8 statik + 4 blog + 20 kategori = 32 sayfa
- `app/robots.ts` — 5 AI crawler izni
- `components/Footer.tsx` — Sayfa linkleri + AITASVIR STUDYO
- `components/PromptCard.tsx` — Kart numarasina detay linki
