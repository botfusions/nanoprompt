# Uygulama Planı - Spesifik Prompt Kartları Görselleştirme (8 Kart)

Bu plan, kullanıcının belirttiği 8 adet prompt kartının (`4606, 4591, 4571, 4548, 4533, 4524, 4512, 4515`) eksik görsellerini tamamlamayı ve veritabanını güncellemeyi amaçlar.

## Kullanıcı İncelemesi Gereken Konular

> [!IMPORTANT]
> - **4606** numaralı prompt için yerel görsel eksiktir. Bu görsel `generate_image` aracıyla üretilecek ve `public/images/bb645269-db38-4809-a9c3-fee713a9f535.png` olarak kaydedilecektir.
> - Diğer 7 kart (`4591, 4571, 4548, 4533, 4524, 4512, 4515`) için yerelde görsel dosyaları bulunmaktadır. Ancak bu dosyalar **git repomuzda untracked** durumdadır. Bu sebeple canlı yayındaki sitede kırık/görselsiz görünmektedirler.
> - Tüm bu 8 görsel git repomuza eklenecek ve Vercel üzerinde otomatik deploy tetiklenecektir.
> - Veritabanındaki `images` alanları ve `approved` onay alanları güncellenecektir.

## Önerilen Değişiklikler

### 1. Görsel Oluşturma ve Kopyalama

#### [NEW] [bb645269-db38-4809-a9c3-fee713a9f535.png](file:///c:/Users/user/Downloads/Project%20Claude/NANO%20%20PROMPT%20STUDYO%20V2/public/images/bb645269-db38-4809-a9c3-fee713a9f535.png)
- 4606 numaralı Dünya Kupası 2026 temalı prompt için üretilecek görsel.

### 2. Veritabanı Güncellemeleri

#### [MODIFY] [update_database_images.js](file:///c:/Users/user/Downloads/Project%20Claude/NANO%20%20PROMPT%20STUDYO%20V2/scripts/update_database_images.js)
- Script, bu 8 kartın ID'lerini içerecek şekilde güncellenecek ve Supabase'de hem `images` yollarını (`/images/<id>.png`) hem de `approved: true` değerlerini set edecektir.

---

## Verifikasyon Planı

### Otomatik Testler
- `npx eslint .`
- `npx tsc --noEmit`
- `npx prettier --check .`

### Manuel Doğrulama
- `git status` ile tüm görsellerin repoya eklendiği doğrulanacak.
- Güncelleme sonrasında yerel sunucuda (`npm run dev`) kartların görsellerinin yüklendiği teyit edilecek.


