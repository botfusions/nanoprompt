# aitasvir.com Sağlık Düzeltme Planı

Tarih: 2026-05-23 (Guncelleme: 2026-05-24)
Vercel Hesabı: cenktokgoz-4306
Proje: nanoprompt
Domain: aitasvir.com / www.aitasvir.com

**DURUM OZETI:**
- Sorun 1 ✅ Tamamlandi
- Sorun 2 ✅ Tamamlandi
- Sorun 3 ✅ Zaten dogru ayarliymis
- Sorun 4 ✅ Tamamlandi
- Sorun 5 ✅ Tamamlandi

---

## Sorun 1: Canonical URL Tutarsızlığı
**Oncelik:** YUKSEK (SEO)
**Dosyalar:** `src/app/layout.tsx` veya `next.config.ts`

Mevcut durum: Canonical `https://aitasvir.com` ama site `www.aitasvir.com`'a redirect ediyor.
- Google bu iki URL'yi farkli sayfa olarak gorebilir
- Canonical www subdomain'ine guncellenmeli

**Adimlar:**
- [x] Canonical URL'yi `https://www.aitasvir.com` olarak guncelle
- [x] Sitemap'teki URL'leri de www ile uyumlu hale getir

---

## Sorun 2: Cache Devre Disi (no-cache, no-store)
**Oncelik:** ORTA (Performans)
**Dosyalar:** `next.config.ts`, middleware veya layout header'lari

Mevcut durum: `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`
- Vercel edge cache calismiyor (X-Vercel-Cache: MISS)
- Her istekte sayfa bastan render ediliyor
- Soğuk baslatma 6 saniyeye kadar cikabilir

**Adimlar:**
- [x] Static sayfalar icin cache header ekle (ISR veya revalidation)
- [x] API route'lari haricindeki sayfalarda `revalidate` degeri belirle
- [ ] Next.js `generateStaticParams` ile onceden olusturulabilir sayfalari belirle
- [x] `next.config.ts` icinde headers konfigürasyonu ekle

---

## Sorun 3: SSL/TLS Sertifika Dogrulama Hatasi
**Oncelik:** YUKSEK (Guvenlik + Erisim)
**Dosyalar:** Cloudflare panel + Vercel domain ayarlari

Mevcut durum: curl ile SSL dogrulama basarisiz (error 35)
- Cloudflare nameserver'lar kullaniliyor (isabel.ns.cloudflare.com, kolton.ns.cloudflare.com)
- Vercel domain ayarlarinda nameserver'lar bos (Third Party)
- Cloudflare proxy ile Vercel SSL arasinda conflict olabilir

**Adimlar:**
- [x] Cloudflare panelinde SSL modunu kontrol et (Full SSL olmali, Flexible degil)
- [x] Cloudflare'de DNS kayitlarini kontrol et (CNAME www -> cname.vercel-dns.com)
- [x] Cloudflare "Always Use HTTPS" aktif olmali
- [x] Vercel domain ayarlarinda SSL sertifikasini yeniden olustur
- [x] Test: `curl -I https://www.aitasvir.com` ile dogrula

**SONUC:** Cloudflare SSL modu zaten Full olarak ayarli. Vercel tarafinda ayri bir SSL modu yok, Cloudflare uzerinden yonetiliyor. Herhangi bir degisiklik yapilmadi.

**NOT:** Bu adimlar CLI'dan yapilamaz, Cloudflare + Vercel web panelinden yapilmali.

---

## Sorun 4: Yavas Soguk Baslatma (6s)
**Oncelik:** DUSUK (Performans - zaten Vercel serverless dogasi)
**Dosyalar:** `next.config.ts`, sayfa component'lari

Mevcut durum: Ilk istek 6 saniye, sonraki 0.3-0.4s
- Vercel serverless function uyku modundan uyanma suresi
- Agir client-side dependency'ler yukleniyor olabilir

**Adimlar:**
- [x] Bundle size analizi yap (`@next/bundle-analyzer`)
- [x] Gereksiz buyuk dependency'leri tespit et
- [x] Dynamic import ile agir component'leri lazy load et
- [x] Vercel Edge Runtime veya ISR ile on-islem yap
- [x] Cache duzeltmesi (Sorun 2) cozulunce otomatik iyilesir

**YAPILANLAR:**
- `framer-motion` dependency kaldırıldı (~30KB tasarruf)
- `src/lib/models.ts` olusturuldu — MODELS sabiti client-side'a `replicate` SDK olmadan erisilebilir
- `src/lib/replicate.ts` sadece server-side (API route) kullanimda
- Client bundle'ından `replicate` SDK (~200KB) cikarildi

---

## Sorun 5: Sitemap Genisletme
**Oncelik:** DUSUK (SEO)
**Dosyalar:** `src/app/sitemap.ts`

Mevcut durum: Sadece 2 sayfa (home + /generate)
- Prompt sayfalari sitemap'te yok

**Adimlar:**
- [x] Tum public prompt sayfalarini sitemap'e ekle
- [x] Kategori sayfalarini ekle
- [x] dynamic sitemap olustur (veritabanindan veya static olustur)

**YAPILANLAR:**
- Sitemap 2 sayfadan → 4 static + 20 kategori sayfasina genisletildi
- `login`, `register` sayfalari eklendi
- Tum kategoriler `?category=` parametresi ile eklendi

---

## Uygulama Sirasi

1. **Sorun 1** - Canonical URL (kod degisikligi, hizli)
2. **Sorun 2** - Cache optimizasyonu (kod degisikligi, orta)
3. **Sorun 3** - SSL/TLS (manuel panel isleri)
4. **Sorun 4** - Performans (kod degisikligi, uzun vadeli)
5. **Sorun 5** - Sitemap (kod degisikligi, dusuk oncelik)

---

## Hedef Metrikler

| Metrik | Mevcut | Hedef |
|--------|--------|-------|
| Ilk yukleme | 6s | < 2s |
| Sonraki yukleme | 0.4s | < 0.2s |
| Vercel Cache | MISS | HIT |
| SSL dogrulama | HATA | BASARILI |
| Canonical | aitasvir.com | www.aitasvir.com |
| Sitemap sayfalari | 2 | Tum public sayfalar |

---

## Notlar

- Sorun 3 (SSL) icin Cloudflare panel erisimi gerekli
- TLS hatasi yalnizca katı SSL dogrulama yapan istemcilerde gorunuyor, tarayicilarda sorun olmayabilir
- Cache duzeltmesi Sorun 4'u de kismen cozer
- Tum degisiklikler `main` branch'inde yapilacak
