# HANDOFF DÖKÜMANI: Dinamik Model Rozetleri ve Tam Ekran Görsel Lightbox

**Tarih:** 6 Eylül 2026  
**Proje:** AITASVIR STUDYO V2 (nanoprompt)  
**Kapsam:** Kart Model Etiketlerinin Dinamikleştirilmesi (GPT-2 / ChatGPT 2 / Nano Banana vb.) & Görsel Büyütme (Lightbox Modal) Entegrasyonu  

---

## 1. Problem & Arka Plan

1. **Sabit Model Rozeti (Hardcoded Badge):**
   - Web sitesindeki tüm kartlarda yazar adının yanında sabit olarak `NANO BANANA` yazmaktaydı.
   - Ancak veritabanında ve gelen gönderilerde yer alan birçok kart aslında **GPT Image 2**, **ChatGPT 2.0**, **GPT-2**, **GPT-4o**, **Midjourney**, **Flux** gibi farklı yapay zeka modellerine aitti.
   - Kullanıcılar tüm kartlarda tek tip "NANO BANANA" etiketi görmekteydi.

2. **Görsel Büyütme Eksikliği & CSS Katman Çakışması:**
   - Kartlar üzerindeki görseller tıklanabilir değildi ve tam boyutta incelenemiyordu.
   - İlk etapta eklenen modal bileşeni, kart bileşeni içindeki CSS `transform` ve `z-index` (stacking context) sınırlarına takıldığı için sayfanın üst menüsü (`Header`), karşılama başlığı (`AITASVIR STUDYO V2`) ve filtre çubuğu modal görselinin üzerine binmekteydi.

---

## 2. Yapılan Değişiklikler ve Dosyalar

| Dosya | Yapılan Değişiklik | Amaç |
|---|---|---|
| [`lib/modelHelper.ts`](file:///Users/cenktk/Documents/NANO%20%20PROMPT%20STUDYO%20V2/lib/modelHelper.ts) | Model çözümleme mantığı (`resolvePromptModel`) ve neo-brutalist badge stilleri oluşturuldu. | Metinden ve model alanından GPT-2, GPT Image 2, ChatGPT, Midjourney, Flux, Nano Banana modellerini dinamik saptama. |
| [`components/ImageLightboxModal.tsx`](file:///Users/cenktk/Documents/NANO%20%20PROMPT%20STUDYO%20V2/components/ImageLightboxModal.tsx) | `createPortal` ile doğrudan `document.body` üzerine render edilen `z-[99999]` tam ekran Lightbox geliştirildi. | Görseli tam ekran açma, klavye yön tuşları (`←`/`→`/`ESC`), küçük resim şeridi ve detay sayfasına yönlendirme. |
| [`components/PromptCard.tsx`](file:///Users/cenktk/Documents/NANO%20%20PROMPT%20STUDYO%20V2/components/PromptCard.tsx) | Sabit `NANO BANANA` rozeti `modelInfo` ile değiştirildi; görsellere tıklama (`cursor-zoom-in`), hover'da "GÖRSELİ AÇ" butonu ve Lightbox modalı bağlandı. | Kartların ait oldukları gerçek modeli göstermesi ve görsellerin tıklanarak büyütülebilmesi. |
| [`src/data/prompts.ts`](file:///Users/cenktk/Documents/NANO%20%20PROMPT%20STUDYO%20V2/src/data/prompts.ts) | `Prompt` interface'ine `model?: string` eklendi; Supabase `.select()` sorgusuna `model` kolonu dahil edildi. | Veritabanındaki model bilgisinin API ve bileşenlere eksiksiz iletilmesi. |
| [`app/prompt/[id]/page.tsx`](file:///Users/cenktk/Documents/NANO%20%20PROMPT%20STUDYO%20V2/app/prompt/%5Bid%5D/page.tsx) | Detay sayfasındaki meta kısmına model rozeti eklendi; görsel alanı `PromptDetailImages` bileşeni ile zenginleştirildi. | Detay sayfasında doğru model rozeti gösterimi. |
| [`app/prompt/[id]/PromptDetailImages.tsx`](file:///Users/cenktk/Documents/NANO%20%20PROMPT%20STUDYO%20V2/app/prompt/%5Bid%5D/PromptDetailImages.tsx) | Detay sayfası görselleri için Lightbox modal açma desteği sunan istemci bileşeni eklendi. | Detay sayfasındaki görsellerin de tam ekran büyütülebilmesi. |
| [`components/GhostSignupModal.tsx`](file:///Users/cenktk/Documents/NANO%20%20PROMPT%20STUDYO%20V2/components/GhostSignupModal.tsx) | `createPortal` ve `z-[99999]` ile root body'ye taşındı. | Üye ol modalının da kart stacking context'ine takılmasını önleme. |
| [`scripts/import_twitter_prompts.js`](file:///Users/cenktk/Documents/NANO%20%20PROMPT%20STUDYO%20V2/scripts/import_twitter_prompts.js) | İçe aktarma sırasında model alanının metne göre akıllı tespiti eklendi. | Gelecekte aktarılacak Twitter/X postlarının körlemesine "Nano banana pro" olmasını engelleme. |

---

## 3. Test ve Doğrulama

- **Derleme:** `npm run build` komutu çalıştırıldı, TypeScript ve Turbopack derlemesi **0 hata** ile tamamlandı.
- **Yerel Sunucu:** `npm run dev` ile `http://localhost:3000` üzerinde test edildi.
- **Görsel Doğrulama:** Modal `createPortal` sayesinde sayfanın en üst katmanında (`z-[99999]`) açılarak navbar ve hero yazılarının üstünde temiz bir şekilde görüntülendi.
