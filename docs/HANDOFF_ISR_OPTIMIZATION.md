# HANDOFF DÖKÜMANI: Vercel ISR & Önbellek Optimizasyonu

**Tarih:** 19 Ağustos 2026  
**Proje:** AITASVIR STUDYO V2 (nanoprompt)  
**Kapsam:** Vercel ISR Write Maliyet Düşürme, Bot Tarama Optimizasyonu & Caching Mimarisi  

---

## 1. Problem & Arka Plan

Düşük kullanıcı trafiğinde dahi Vercel üzerinde beklenmeyen ISR Write (Incremental Static Regeneration) artışları ve sunucu yükü gözlemlenmiştir. Yapılan kod tabanı incelemesinde aşağıdaki kök sebepler belirlenmiştir:

1. **Çok Kısa Revalidate Süreleri:** Ana sayfa 60 saniyede bir revalidate ediliyordu (`revalidate = 60`), bot veya kullanıcı istekleri her dakikada bir ISR Write tetikliyordu.
2. **5000+ Prompt Sayfası Frekansı:** `/prompt/[id]` sayfaları `revalidate = 3600` (1 saat) olarak ayarlıydı. Sayfaların içeriği neredeyse statik olmasına rağmen botlar saatlik döngülerde yeniden üretim yaptırıyordu.
3. **Sitemap Dinamik Tarih Döngüsü:** `sitemap.ts` içinde `lastModified: new Date()` her istekte anlık üretiliyordu. Bu durum arama motoru botlarının (Googlebot vb.) sitenin sürekli güncellendiğini sanıp agresif tarama yapmasına ve ISR Write patlamalarına sebep oluyordu.
4. **İstek İçi Çift Veri Çağrısı:** `/prompt/[id]` sayfasında `generateMetadata` ve `PromptDetailPage` aynı istekte ayrı ayrı filtreleme çalıştırıyordu.

---

## 2. Yapılan Değişiklikler ve Dosyalar

| Dosya | Değişiklik Öncesi | Değişiklik Sonrası | Amaç |
|---|---|---|---|
| [`app/page.tsx`](file:///Users/cenktk/Documents/NANO%20%20PROMPT%20STUDYO%20V2/app/page.tsx) | `revalidate = 60` | `revalidate = 3600` | Ana sayfa ISR yazım frekansını 60 kat azaltma |
| [`app/prompt/[id]/page.tsx`](file:///Users/cenktk/Documents/NANO%20%20PROMPT%20STUDYO%20V2/app/prompt/[id]/page.tsx) | `revalidate = 3600`, ayrı arama | `revalidate = 86400`, `React.cache()` ile `getPrompt(id)` | 5.000+ sayfada günlük döngü & istek içi deduplication |
| [`app/kategori/[slug]/page.tsx`](file:///Users/cenktk/Documents/NANO%20%20PROMPT%20STUDYO%20V2/app/kategori/[slug]/page.tsx) | Revalidate tanımlı değildi | `revalidate = 86400` | Kategori sayfalarına 24 saat ISR koruması |
| [`app/api/prompts/route.ts`](file:///Users/cenktk/Documents/NANO%20%20PROMPT%20STUDYO%20V2/app/api/prompts/route.ts) | `revalidate = 60`, `s-maxage=60` | `revalidate = 3600`, `s-maxage=3600, stale-while-revalidate=86400` | API lazy-loading yanıtlarını CDN'de uzun süreli önbelleğe alma |
| [`app/sitemap.ts`](file:///Users/cenktk/Documents/NANO%20%20PROMPT%20STUDYO%20V2/app/sitemap.ts) | `lastModified: new Date()` (dinamik) | `lastModified: new Date("2026-05-24")` (stabil) | Botların gereksiz crawl & ISR döngüsüne girmesini önleme |
| [`README.md`](file:///Users/cenktk/Documents/NANO%20%20PROMPT%20STUDYO%20V2/README.md) | - | Changelog kaydı eklendi | Proje dokümantasyonu güncellendi |

---

## 3. Mimari ve Güvenlik Notları

- **Revalidation Webhook Durumu:** Projede dışarıdan tetiklenebilecek açık/şifresiz herhangi bir On-Demand Revalidation webhook'u bulunmamaktadır.
- **Dinamik Çıktı Güvenliği:** Sayfalarda render esnasında rastgele değişen `Math.random()` veya anlık `new Date()` kullanımı yoktur. Tarihler DB'deki statik `prompt.date` değerini formatlar.
- **404 Durumları:** `/prompt/[id]` sayfasında geçersiz ID isteklerinde `notFound()` düzgün şekilde tetiklenmektedir.

---

## 4. Sonraki Geliştiriciler İçin Öneriler

1. **Yeni Sayfa / Rota Eklerken:** Dinamik sayfa segmentlerinde (`[id]`, `[slug]`) `revalidate` süresini daima içerik değişim sıklığına göre minimum 3600 veya 86400 olarak belirleyin.
2. **Sitemap Güncellemeleri:** Yeni makale veya toplu prompt ekleme yapıldığında `app/sitemap.ts` içindeki `lastUpdated` sabit tarihini güncelleyin.
3. **Derleme Doğrulaması:** Herhangi bir ISR/Caching değişikliğinde `npm run build` çıktısındaki `Revalidate` sütununu kontrol edin.
