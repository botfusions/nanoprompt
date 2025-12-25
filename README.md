# Botfusions NaNo Prompt Galerisi

[Nano Banana Pro Prompts](https://youmind.com/tr-TR/nano-banana-pro-prompts) sayfasının modern replikası. Neo-Brutalist tasarım ve Next.js 15+ ile geliştirildi.

![Status](https://img.shields.io/badge/Prompts-2930-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15+-black)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

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
| 🖼️ **3 Katmanlı Sıralama** | Resim+Prompt → Resim+Başlık → Resimsiz |

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

## 📁 Proje Yapısı

```
botfusions-banana/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Ana sayfa (Server Component)
│   ├── HomeClient.tsx     # Client-side ana sayfa
│   ├── layout.tsx         # Root layout
│   ├── login/             # Giriş sayfası
│   ├── auth/callback/     # OAuth callback
│   └── api/image-proxy/   # Görsel proxy API
├── components/            # UI Bileşenleri
│   ├── Header.tsx         # Üst banner (BETA etiketi)
│   ├── PromptCard.tsx     # Prompt kartı (tab sistemi)
│   ├── PromptGrid.tsx     # Kart grid'i
│   ├── SearchBar.tsx      # Arama çubuğu
│   ├── CategoryFilter.tsx # Kategori filtreleri
│   ├── AuthButton.tsx     # Google OAuth butonu
│   └── AddPromptSection.tsx # Prompt ekleme alanı
├── contexts/
│   └── AuthContext.tsx    # Firebase Auth context
├── src/
│   ├── data/
│   │   ├── prompts.ts     # 2930 prompt (Supabase'den)
│   │   ├── all_prompts.json # Orijinal JSON verisi
│   │   └── schema.sql     # Veritabanı şeması
│   └── lib/
│       ├── supabase.ts    # Supabase client
│       └── firebase.ts    # Firebase config
└── scripts/
    ├── migrate_prompts.ts # JSON → Supabase migrasyon
    └── extract_prompts.js # Veri çıkarma scripti
```

## 🛠️ Teknik Stack

- **Framework:** Next.js 15+ (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Google OAuth)
- **Styling:** Tailwind CSS + CSS Variables
- **Icons:** Lucide React
- **Storage:** LocalStorage (favoriler için)

## 📊 Mevcut Durum

- ✅ **2930 prompt** Supabase veritabanında
- ✅ **789 görselli prompt** (ilk sırada gösteriliyor)
- ✅ Neo-Brutalist UI replikasyonu
- ✅ Arama, filtreleme ve favoriler tam fonksiyonel
- ✅ Google OAuth entegrasyonu
- ✅ 3 katmanlı sıralama (Resim+Prompt > Resim+Başlık > Resimsiz)
- ✅ Kart numaraları ile arama (#00123)

## 🔧 Migrasyon

```bash
# Supabase service role key gerekli
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
npx tsx scripts/migrate_prompts.ts
```

## 📋 Son Değişiklikler (25 Aralık 2024)

### 🎨 UI/UX Güncellemeleri
- **Hero Bölümü:** Pembe arka plan → Gök Mavisi (#26C6FF) olarak değiştirildi
- **Footer Bölümü:** YouMind tarzı FAQ accordion ve CTA bölümü eklendi
  - Mor arka planlı SSS (Sıkça Sorulan Sorular) bölümü
  - Cyan arka planlı "HAZIR MISINIZ" CTA bölümü
  - Siyah copyright footer

### 📊 Veri Güncellemeleri
- **CSV Export:** `scripts/export_prompts_to_csv.js` scripti eklendi
  - 989 resimli prompt CSV formatında export edilebilir
  - Excel ve Google Sheets uyumlu UTF-8 BOM desteği
- **#02196 Kartı:** Eksik görsel eklendi

### 🔧 Teknik Düzeltmeler
- CSS renk değişkenleri düzeltildi (`@theme` + `:root` + utility sınıfları)
- `brand-cyan` ve `brand-purple` renkleri eklendi
- Footer bileşeni (`components/Footer.tsx`) oluşturuldu

### 📁 Yeni Dosyalar
- `components/Footer.tsx` - FAQ ve CTA footer bileşeni
- `scripts/export_prompts_to_csv.js` - CSV export scripti
- `exports/prompts_with_images.csv` - Resimli promptların CSV dosyası
- `public/images/prompt_02196.jpg` - Eksik kart görseli

## 📝 Lisans

MIT License - Bu proje eğitim amaçlıdır.
